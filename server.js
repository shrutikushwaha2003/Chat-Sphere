const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app); // Create an HTTP server
const io = socketIo(server, {         // Attach socket.io to the server
    cors: {
        origin: "*", // Allow CORS requests from any origin
        methods: ["GET", "POST"]
    }
});

// Serving static files (like CSS, JS) from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Route to serve the main HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Users object to track connected users
const users = {}; // Store users by socket ID

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // When a new user joins, store their name and socket ID
    socket.on('new-user', (name) => {
        if (name && name.trim() !== '') {
            users[socket.id] = name;
            console.log(`${name} has joined the chat`);
            socket.emit('connected', { id: socket.id, name }); // Send the user's ID and name back to them
            io.emit('user-list', Object.values(users)); // Notify all clients of the updated user list
        }
    });

    // When a message is sent, broadcast it to all users except the sender
    socket.on('send-message', (message) => {
        const senderName = users[socket.id];
        if (message && message.trim() !== '') {
            // Broadcast the message to all connected clients except the sender
            socket.broadcast.emit('receive-message', {
                sender: { id: socket.id, name: senderName },
                message: message.trim()
            });
            console.log(`Message sent from ${senderName} (${socket.id}): ${message}`);
        } else {
            socket.emit('error', { message: 'Invalid message.' });
        }
    });

    // When a user disconnects, remove them from the users object
    socket.on('disconnect', () => {
        const userName = users[socket.id];
        if (userName) {
            delete users[socket.id]; // Remove the user from the list
            console.log(`${userName} (${socket.id}) disconnected`);
            io.emit('user-list', Object.values(users)); // Notify all clients of the updated user list
        }
    });
});

// Start the server on port 8000
server.listen(8000, () => {
    console.log('Server is running on http://localhost:8000');
});
