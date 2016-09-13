var express = require('express');
var app = express();
var http = require('http').Server(app);
var path = require('path');
var io = require('socket.io')(http);



app.use(express.static(path.join(__dirname, 'Public')));
app.use(express.static(path.join(__dirname, 'Public/Sources')));
app.use(express.static(path.join(__dirname, 'Public/Styles')));
/*app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname+'/Public', req));
})*/

var User = require('./ServerSources/User');
var users = [];

var clients = 0;
var maxId = 0;
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

    io.sockets.emit('userEntered', users);
    socket.on('onNewUser', function (e){
        var user = new User(maxId, e);
        users.push(user);
        io.sockets.emit('userEntered', users);
    });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

