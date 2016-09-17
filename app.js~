var express = require('express');
var app = express();
var http = require('http').Server(app);
var path = require('path');
var io = require('socket.io')(http);



app.use(express.static(path.join(__dirname, 'Public')));
app.use(express.static(path.join(__dirname, 'Public/Sources')));
app.use(express.static(path.join(__dirname, 'Public/Styles')));

var ROOM_MAX_SIZE = 6;

//var User = require('./ServerSources/User');

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
        io.emit('broadcast', {description: clients});
        io.to("room-" + roomInd).emit('room_size', {description: rooms[roomInd].nrOfPlayers});

        io.to('room-' + roomInd).emit('playerListUpdate', getPlayersByRoomNr(roomInd));
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
        io.to("room-" + self.roomNr).emit('room_status', {description: "The game will start in " + self.secRemaining});
        if (self.secRemaining <= 0) {
          self.startGame();
          clearInterval(self.timeout);
        }
      }, 1000);
  }
  this.startGame = function() {
    this.state = "started";
    this.started = true;
    io.to("room-" + self.roomNr).emit('room_status', {description: "Game started with: " + self.nrOfPlayers + " players"});
  }

  this.removePlayer = function() {
    self.nrOfPlayers--;
    self.updateSecRemaining();
    if (self.nrOfPlayers >= 3)
      self.startCounting();
    else {
      clearInterval(self.timeout);
      self.state == "nothing";
      if (self.nrOfPlayers > 0)
        io.to("room-" + self.roomNr).emit('room_status', {description: "Waiting for more players..."});
    }
  }

  return this;
}



// Player class
function Player(clientId, userName) {
        this.id = clientId;
        this.name = userName;
        this.roomNr = -1;
        return this;
}

http.listen(3000, function(){
  console.log('listening on *:3000');
});
