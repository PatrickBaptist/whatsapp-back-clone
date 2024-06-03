const express = require('express')
const http = require('http')
const socketIo = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = socketIo(server)

const port = process.env.PORT || 4000

const users = new Map();

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('disconnect', () => {
        users.delete(socket.id);
        io.emit('users', Array.from(users.values()));
    });

    socket.on('join', (name, callback) => {
        users.set(socket.id, { id: socket.id, name });
        io.emit('users', Array.from(users.values()));
        if (callback) callback(socket.id);
    });

    socket.on('privateMessage', ({ message, receiverId }) => {
        const sender = users.get(socket.id);
        if (!sender) return;

        const fullMessage = {
            message,
            senderId: sender.id,
            senderName: sender.name,
            receiverId
        }

        // Enviar mensagem para o destinatário
        socket.to(receiverId).emit('message', fullMessage);

        // Enviar mensagem para o remetente para confirmação
        socket.emit('message', fullMessage)
    });
});

server.listen(port, () => console.log(`servidor rodando na porta ${port}`))