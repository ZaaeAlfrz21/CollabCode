const socketHandler = (io) => {
    // Penyimpanan sementara user di memori (Map: socketId -> userInfo)
    const userSocketMap = {};

    // Helper: Ambil semua user di room tertentu
    const getAllConnectedClients = (roomId) => {
        // Map data dari socket adapter rooms
        return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => {
            return {
                socketId,
                username: userSocketMap[socketId]?.username,
            };
        });
    };

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        // 1. EVENT JOIN ROOM (Update: Menerima username)
        socket.on('join-room', ({ roomId, username }) => {
            userSocketMap[socket.id] = { username, roomId };
            socket.join(roomId);

            // Beritahu semua client di room daftar user terbaru
            const clients = getAllConnectedClients(roomId);
            io.to(roomId).emit('joined-users', {
                clients,
                username, // Siapa yang baru join
                socketId: socket.id,
            });
        });

        // 2. EVENT CODE CHANGE (Tetap sama)
        socket.on('code-change', ({ roomId, code }) => {
            socket.to(roomId).emit('code-update', code);
        });

        // 3. EVENT KIRIM PESAN (CHAT)
        socket.on('send-message', ({ roomId, message, username, time }) => {
            io.to(roomId).emit('receive-message', { message, username, time });
        });

        // 4. EVENT DISCONNECT
        socket.on('disconnecting', () => {
            const rooms = [...socket.rooms];
            rooms.forEach((roomId) => {
                socket.in(roomId).emit('user-disconnected', {
                    socketId: socket.id,
                    username: userSocketMap[socket.id]?.username,
                });
            });
            delete userSocketMap[socket.id];
            socket.leave();
        });
    });
};

module.exports = socketHandler;