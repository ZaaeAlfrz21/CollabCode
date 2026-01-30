require('dotenv').config(); 
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const path = require('path'); // <--- 1. TAMBAHKAN INI (Untuk path folder)

// Import sequelize
const { sequelize } = require('./models'); 

const roomRoutes = require('./routes/roomRoutes');
const authRoutes = require('./routes/authRoutes');
const socketHandler = require('./socket/socketHandler');

const app = express();
const server = http.createServer(app);

// --- KONFIGURASI VARIASI ORIGIN ---
const allowedOrigins = [
    "http://localhost:5173", 
    "http://127.0.0.1:5173"
];

// 1. Setup Middleware CORS
app.use(cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true 
}));

app.use(express.json());

// --- 2. PENTING: AKSES FOLDER GAMBAR SECARA STATIS ---
// Ini membuat file di dalam folder 'uploads' bisa dibuka lewat URL:
// Contoh: http://localhost:5000/uploads/foto-profil.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 

// 3. Setup Socket.io
const io = new Server(server, {
    cors: {
        origin: allowedOrigins, 
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);

// Jalankan Socket Logic
socketHandler(io);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Terjadi kesalahan pada server!' });
});

// Sinkronisasi Database & Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// --- 3. PENTING: GUNAKAN ALTER: TRUE ---
// Ganti 'force: false' jadi 'alter: true' agar kolom 'profilePicture' ditambahkan ke tabel Users yang sudah ada.
sequelize.sync({ alter: true }) 
    .then(() => {
        console.log("✅ Database MySQL Connected & Synced (Schema Updated)");
        server.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📡 Socket.io ready for connections`);
            console.log(`📂 Static folder '/uploads' is now public`);
        });
    })
    .catch((err) => {
        console.error("❌ Gagal connect ke Database:", err);
    });