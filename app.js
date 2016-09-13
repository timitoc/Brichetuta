var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendfile('index.html');
});

var rooms = new Array();
var players = new Array();
var clients = 0;
var ROOM_MAX_SIZE = 6;

io.on('connection', function(socket){
  console.log('A user connected');

  clients++;

  var player = new Player(socket.id, "me: " + socket.id);
  players.push(player);
  var roomInd = findRoom();
  socket.join("room-" + roomInd);
  playerEntersRoom(roomInd, player);

  socket.emit('myRoom', {description: roomInd});
  io.emit('broadcast', {description: clients});
  io.to("room-" + roomInd).emit('room_size', {description: rooms[roomInd].nrOfPlayers});


    //socket.send('Sent a message');
  socket.on('disconnect', function () {
       clients--;
       var leftRoomNr = playerLeavesRoom(socket.id);
       socket.leave("room-" + leftRoomNr);
       io.emit('broadcast', {description: clients});
       console.log('A user disconnected');
  });

	socket.on('error', function (err) {
	  if (err.description) throw err.description;
	  else throw err; // Or whatever you want to do
	});

});

var findRoom = function() {
  for (var i = 0; i < rooms.length; i++) {
    if (rooms[i].started == false && rooms[i].nrOfPlayers < ROOM_MAX_SIZE)
      return i;
  }
  rooms.push(new Room());
  return rooms.length - 1;
}

var playerEntersRoom = function(roomInd, player) {
  rooms[roomInd].nrOfPlayers++;
  player.roomNr = roomInd;
}

var playerLeavesRoom = function(socketId) {
  var playerDelete;
  for (var i = 0; i < players.length; i++) {
      if (players[i].id == socketId) {
          playerDelete = players[i];
          players.splice(i, 1);
      }
  }
  var leftRoom = rooms[playerDelete.roomNr];
  leftRoom.nrOfPlayers--;

  if (leftRoom.nrOfPlayers > 0)
    io.to("room-" + playerDelete.roomNr).emit('room_size', {description: leftRoom.nrOfPlayers});
  return playerDelete.roomNr;
}

// Room class
function Room() {
  this.nrOfPlayers = 0;
  this.started = false;
  return this;
}

// Player class
function Player(clientId, userName) {
        this.id = clientId;
        this.name = userName;
        this.roomNr = 0;
        return this;
}

http.listen(3000, function(){
  console.log('listening on *:3000');
});
