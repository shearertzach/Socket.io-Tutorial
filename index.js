const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

let usernames = {}
let numUsers = 0

app.use('/public', express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  var addedUser = false;

  socket.on('add user', (username) => {
    socket.username = username

    usernames[username] = username;
    ++numUsers;
    addedUser = true
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  })

  socket.on('disconnect', () => {
    if (addedUser) {
      delete usernames[socket.username];
      --numUsers;

      socket.broadcast.emit('user disconnected', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });

  socket.on('new message', (data) => {
    socket.broadcast.emit('new message', data);
  });
});


server.listen(3000, () => {
  console.log('listening on *:3000');
});