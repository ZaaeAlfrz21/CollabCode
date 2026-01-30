require('dotenv').config(); 
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const path = require('path'); 

// Import sequelize
const { sequelize } = require('./models'); 

const roomRoutes = require('./routes/roomRoutes');
const authRoutes = require('./routes/authRoutes');
const socketHandler = require('./socket/socketHandler');

const app = express();
const server = http.createServer(app); // Server HTTP untuk Express + Socket.io

const PORT = process.env.PORT || 5000; // Definisi PORT dipindah ke atas

// --- KONFIGURASI CORS ---
// PENTING: Nanti tambahkan URL Frontend Railway/Vercel Anda di sini
const allowedOrigins = [
    "http://localhost:5173", 
    "http://127.0.0.1:5173",
    // Contoh: "https://nama-frontend-anda.vercel.app"
];

app.use(cors({
    origin: function (origin, callback) {
        // Izinkan request tanpa origin (seperti Postman) atau jika origin ada di list
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log("Blocked by CORS:", origin); // Debugging
            callback(null, true); // SEMENTARA: Izinkan semua agar tidak error saat tes awal
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true 
}));

app.use(express.json());

// Akses folder uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 

// Setup Socket.io
const io = new Server(server, {
    cors: {
        origin: "*", // SEMENTARA: Izinkan semua origin untuk Socket agar koneksi tidak ditolak
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

// --- BAGIAN INI YANG DIPERBAIKI ---
// Hapus app.listen() yang lama. Hanya gunakan server.listen() di dalam sequelize.sync()

sequelize.sync({ alter: true }) 
    .then(() => {
        console.log("✅ Database MySQL Connected & Synced");
        
        // GUNAKAN 'server.listen', JANGAN 'app.listen' karena ada Socket.io
        server.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📡 Socket.io ready`);
        });
    })
    .catch((err) => {
        console.error("❌ Gagal connect ke Database:", err);
    });