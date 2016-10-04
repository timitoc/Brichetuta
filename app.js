var express = require('express');
var app = express();
var http = require('http').Server(app);
var path = require('path');
var io = require('socket.io')(http);



app.use(express.static(path.join(__dirname, 'Public')));
app.use(express.static(path.join(__dirname, 'Public/Sources')));
app.use(express.static(path.join(__dirname, 'Public/Styles')));

var ROOM_MAX_SIZE = 6;

var Game = require('./ServerSources/Game');
var Player = require('./ServerSources/Player');
var Card = require('./ServerSources/Card');
var Deck = require('./ServerSources/Deck');

var rooms = new Array();
var players = [];
var clients = 0;

io.on('connection', function(socket){
    console.log('A user connected');

    clients++;
    io.sockets.emit('broadcast',{ description: clients});


  var player = new Player(socket.id, "choosing username");
  players.push(player);

  socket.on('disconnect', function () {
      clients--;
      io.emit('broadcast', {description: clients});

       var leftRoomNr = playerLeavesRoom(socket.id);
       socket.leave("room-" + leftRoomNr);
       io.emit('playerListUpdate', players);
       console.log('A user disconnected');
  });

	socket.on('error', function (err) {
	  if (err.description) throw err.description;
	  else throw err; // Or whatever you want to do
	});
    //io.emit('playerListUpdate', players);
    socket.on('changeUsername', function (username){
        selectPlayerBySocketId(socket.id).name = username;
        var roomInd = findRoom();
        socket.join("room-" + roomInd);
        playerEntersRoom(roomInd, player);
        socket.emit('myRoom', {description: roomInd});
        socket.emit('cardBack', Card.prototype.viewGenerator.getCardView('back'));
        io.emit('broadcast', {description: clients});
        io.to("room-" + roomInd).emit('room_size', {description: rooms[roomInd].nrOfPlayers});

        io.to('room-' + roomInd).emit('playerListUpdate', getPlayersByRoomNr(roomInd));
    });

    socket.on('move', function() {
        rooms[selectPlayerBySocketId(socket.id).roomNr].move(socket.id);
    });

    socket.on('click_brichetuta', function() {
        rooms[selectPlayerBySocketId(socket.id).roomNr].clickB(socket.id);
        console.log('click pe bricheta');
    });

});


var findRoom = function() {
  for (var i = 0; i < rooms.length; i++) {
    if (rooms[i].started == false && rooms[i].nrOfPlayers < ROOM_MAX_SIZE)
      return i;
  }
  var r = new Room(rooms.length);
  rooms.push(r);
  return rooms.length - 1;
}

var playerEntersRoom = function(roomInd, player) {
  rooms[roomInd].addPlayer();
  player.roomNr = roomInd;
}

var selectPlayerBySocketId = function(socketId){
    for(var i in players){
        if(players[i].id == socketId)
            return players[i];
    }
}

var getPlayersByRoomNr = function(roomNr){
    var res = [];
    for(var i in players)
        if(players[i].roomNr == roomNr)
            res.push(players[i]);
    return res;
}

var playerLeavesRoom = function(socketId) {

  var playerDelete;
  for (var i = 0; i < players.length; i++) {
      if (players[i].id == socketId) {
          playerDelete = players[i];
          players.splice(i, 1);
      }
  }
  if (playerDelete.roomNr === -1 )
      return;
  var leftRoom = rooms[playerDelete.roomNr];
  leftRoom.removePlayer();

  if (leftRoom.nrOfPlayers > 0)
    io.to("room-" + playerDelete.roomNr).emit('room_size', {description: leftRoom.nrOfPlayers});
  return playerDelete.roomNr;
}



// Room class
function Room(roomNr) {
  var self = this;
  this.nrOfPlayers = 0;
  this.started = false;
  this.state = "nothing"
  this.roomNr = roomNr;
  this.secRemaining = 1000;

  this.addPlayer = function() {
    self.nrOfPlayers++;
    self.updateSecRemaining();
    if (self.nrOfPlayers >= 3)
      self.startCounting();
  }

  this.updateSecRemaining = function() {
    if (self.nrOfPlayers === 3)
      self.secRemaining = 35;
    else if (self.nrOfPlayers === 4)
      self.secRemaining = 20;
    else if (self.nrOfPlayers === 5)
      self.secRemaining = 10;
    else if (self.nrOfPlayers === 6)
      self.secRemaining = 5;
  }

  this.startCounting = function() {
    if (self.state == "counting")
      clearInterval(self.timeout);
    else
      self.state = "counting";
    self.timeout = setInterval(function() {
        self.secRemaining--;
        io.to("room-" + self.roomNr).emit('room_status', {description: self.secRemaining});
        if (self.secRemaining <= 0) {
          self.startGame();
          clearInterval(self.timeout);
        }
      }, 1000);
  }
  this.startGame = function() {
    this.state = "started";
    this.started = true;
    self.game = new Game(getPlayersByRoomNr(self.roomNr));
    self.game.shuffle();
    io.to("room-" + self.roomNr).emit('room_status', {description: "GO"});
    //io.to("room-" + self.roomNr).emit('start_game', {ind: });
    for (var i = 0; i < self.game.players.length; i++) {
    	io.to(self.game.players[i].id).emit('start_game', {ind: i});
    }
    self.sendUpdate();
  }

  this.move = function(socketId) {
    if (!self.started) return;
    self.game.move(socketId);
    self.sendUpdate();
  }

  this.clickB = function(socketId) {
    if (!self.started) return;
    self.game.clickB(socketId);
    var winners = self.game.getWinners();
    if (winners.length > 0) {
      io.to("room-" + self.roomNr).emit('end_round', winners);
      self.game.rule++;
      if (self.game.rule > 7) self.game.rule -= 7;
      self.game.shuffle();
    }
    self.sendUpdate();
  }

  this.sendUpdate = function() {
      var plData = [];

      for (var i = 0; i < self.game.players.length; i++)
      {
          var faceInd = self.game.players[i].getFace();
          if (faceInd != undefined) {
            console.log("Player " + self.game.players[i].name + " has face card: ");
            console.log(Deck[faceInd]);
          }

          plData.push({last_card: Card.prototype.viewGenerator.getCardView(Deck[faceInd]),
              num_card: self.game.players[i].unrevCards.length});
      }
      var toReturn = {
          turn: self.game.turn,
          playerData: plData
      };
      //console.log(toReturn);
      io.to("room-" + self.roomNr).emit('game_update', toReturn);
  }

  this.removePlayer = function() {
    self.nrOfPlayers--;
    self.updateSecRemaining();
    self.started = false;
    if (self.nrOfPlayers >= 3)
      self.startCounting();
    else {
      clearInterval(self.timeout);
      self.state == "nothing";
      if (self.nrOfPlayers > 0){
          var msg = "";
          for(i in self.nrOfPlayers) msg += ".";
          io.to("room-" + self.roomNr).emit('room_status', {description: msg});
      }
    }
  }

  return this;
}

http.listen(process.env.PORT || 3000, function(){
  console.log('listening on *:3000');
});
