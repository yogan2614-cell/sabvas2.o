const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-room', (room) => {
        socket.join(room);
        console.log(`User joined room: ${room}`);
    });

    socket.on('call-user', (data) => {
        socket.to(data.toRoom).emit('incoming-call', { offer: data.offer, caller: data.caller });
    });

    socket.on('make-answer', (data) => {
        socket.to(data.toRoom).emit('call-answered', { answer: data.answer });
    });

    socket.on('ice-candidate', (data) => {
        socket.to(data.toRoom).emit('ice-candidate', { candidate: data.candidate });
    });

    socket.on('end-call', (data) => {
        socket.to(data.toRoom).emit('call-ended');
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Render ke dynamic port ke liye process.env.PORT use karna zuri hai
const PORT = process.env.PORT || 10000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Signaling server running on port ${PORT}`);
});
