// Pratik Pokhrel 101487514 - COMP 3133 Lab Test 1

require('dns').setServers(['8.8.8.8', '1.1.1.1']);

var path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
var express = require('express');
var http = require('http');
var Server = require('socket.io').Server;
var cors = require('cors');

var connectDB = require('./config/database');
var authRoutes = require('./routes/auth');
var roomStuff = require('./routes/rooms');
var GroupMessage = require('./models/GroupMessage');
var PrivateMessage = require('./models/PrivateMessage');

var app = express();
var server = http.createServer(app);

var io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'view')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomStuff.router);

// Serve HTML pages
app.get('/signup.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'view', 'signup.html'));
});

app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'view', 'login.html'));
});

app.get('/chat.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'view', 'chat.html'));
});

app.get('/', (req, res) => {
  res.redirect('/login.html');
});

// Keep track of who's connected and which room they're in
const userSockets = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_room', async (data) => {
    const { username, room } = data;
    if (!username || !room) return;

    const roomName = room.trim().toLowerCase().replace(/\s+/g, '_') || 'general';

    socket.join(roomName);
    userSockets.set(socket.id, { username, room: roomName });

    // Fetch chat history so new joiners see what was said before
    try {
      const messages = await GroupMessage.find({ room: roomName })
        .sort({ date_sent: 1 })
        .limit(100)
        .lean();
      socket.emit('room_history', messages);
    } catch (err) {
      console.error('Error loading room history:', err);
    }

    // Build the members list for the sidebar
    const members = [];
    const roomSockets = await io.in(roomName).fetchSockets();
    roomSockets.forEach(s => {
      const ud = userSockets.get(s.id);
      if (ud) members.push(ud.username);
    });

    socket.to(roomName).emit('user_joined', { username, room: roomName, members });
    socket.emit('join_success', { room: roomName, members });
  });

  // Leave room
  socket.on('leave_room', async () => {
    const userData = userSockets.get(socket.id);
    if (userData) {
      const { username, room } = userData;
      socket.leave(room);
      userSockets.delete(socket.id);
      const roomSockets = await io.in(room).fetchSockets();
      const members = [];
      roomSockets.forEach(s => {
        const ud = userSockets.get(s.id);
        if (ud) members.push(ud.username);
      });
      socket.to(room).emit('user_left', { username, room, members });
      socket.emit('leave_success');
    }
  });

  // Group chat message
  socket.on('group_message', async (data) => {
    const userData = userSockets.get(socket.id);
    if (!userData) return;

    const { message } = data;
    if (!message || !message.trim()) return;

    const { username, room } = userData;

    try {
      const groupMsg = new GroupMessage({
        from_user: username,
        room,
        message: message.trim()
      });
      await groupMsg.save();

      io.to(room).emit('group_message', {
        _id: groupMsg._id,
        from_user: username,
        room,
        message: groupMsg.message,
        date_sent: groupMsg.date_sent
      });
    } catch (err) {
      console.error('Error saving group message:', err);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Private message
  socket.on('private_message', async (data) => {
    const userData = userSockets.get(socket.id);
    if (!userData) return;

    const { to_user, message } = data;
    if (!to_user || !message || !message.trim()) return;

    const from_user = userData.username;

    try {
      const privateMsg = new PrivateMessage({
        from_user,
        to_user,
        message: message.trim()
      });
      await privateMsg.save();

      // Send back to sender (so they see their own message) and broadcast to others
      socket.emit('private_message', {
        _id: privateMsg._id,
        from_user,
        to_user,
        message: privateMsg.message,
        date_sent: privateMsg.date_sent,
        isOwn: true
      });
      io.emit('private_message', {
        _id: privateMsg._id,
        from_user,
        to_user,
        message: privateMsg.message,
        date_sent: privateMsg.date_sent,
        isOwn: false
      });
    } catch (err) {
      console.error('Error saving private message:', err);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // "User is typing..." - broadcast to others in the room
  socket.on('typing', () => {
    const userData = userSockets.get(socket.id);
    if (userData) {
      socket.to(userData.room).emit('user_typing', { username: userData.username });
    }
  });

  socket.on('stop_typing', () => {
    const userData = userSockets.get(socket.id);
    if (userData) {
      socket.to(userData.room).emit('user_stop_typing', { username: userData.username });
    }
  });

  socket.on('disconnect', async () => {
    const userData = userSockets.get(socket.id);
    if (userData) {
      const { username, room } = userData;
      userSockets.delete(socket.id);
      const roomSockets = await io.in(room).fetchSockets();
      const members = [];
      roomSockets.forEach(s => {
        const ud = userSockets.get(s.id);
        if (ud) members.push(ud.username);
      });
      socket.to(room).emit('user_left', { username, room, members });
    }
    console.log('User disconnected:', socket.id);
  });
});

// Connect to database and start server
const PORT = process.env.PORT || 3000;

// Friendly error when someone forgets to close the old server
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\nPort ${PORT} is already in use.`);
    console.error('To fix: Close the other Node window, or run:');
    console.error('  netstat -ano | findstr :3000');
    console.error('  taskkill /PID <number> /F\n');
    process.exit(1);
  }
  throw err;
});

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to start:', err.message);
  process.exit(1);
});
