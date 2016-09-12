var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendfile('index.html');
});

var clients = 0;

io.on('connection', function(socket){
  console.log('A user connected');

clients++;
 io.sockets.emit('broadcast',{ description: clients + ' clients connected!'});
 
    //socket.send('Sent a message');
  socket.on('disconnect', function () {
       clients--;
       io.sockets.emit('broadcast',{ description: clients + ' clients connected!'});
            
    console.log('A user disconnected');
  });

	socket.on('error', function (err) {
	  if (err.description) throw err.description;
	  else throw err; // Or whatever you want to do
	});	

});
http.listen(3000, function(){
  console.log('listening on *:3000');
});
