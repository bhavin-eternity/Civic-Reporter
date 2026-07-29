const { Server } = require('socket.io');

let io;

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:5173',
            methods: ['GET', 'POST'],
        },
    });

    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        socket.on('join-admin', () => {
            socket.join('admins');
            console.log('Admin joined room:', socket.id);
        });

        socket.on('join-user', (userId) => {
            socket.join(`user-${userId}`);
            console.log('User joined room:', userId);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) throw new Error('Socket not initialized');
    return io;
};

module.exports = { initSocket, getIO };