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

const PORT = process.env.PORT || 5000; 

// --- KONFIGURASI CORS (DIPERBAIKI) ---
// Kita buka akses selebar-lebarnya dulu (origin: '*') 
// supaya Frontend di Railway PASTI bisa masuk.
app.use(cors({
    origin: '*', 
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // WAJIB ADA 'OPTIONS' UNTUK PREFLIGHT!
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true 
}));

app.use(express.json());

// Akses folder uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 

// Setup Socket.io
const io = new Server(server, {
    cors: {
        origin: "*", // Izinkan koneksi socket dari mana saja
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

// --- MENJALANKAN SERVER ---
// Menggunakan alter: true agar tabel otomatis update jika ada perubahan kolom
sequelize.sync({ alter: true }) 
    .then(() => {
        console.log("✅ Database MySQL Connected & Synced");
        
        // Gunakan 0.0.0.0 agar bisa diakses dari jaringan luar (PENTING UNTUK RAILWAY)
        server.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📡 Socket.io ready`);
        });
    })
    .catch((err) => {
        console.error("❌ Gagal connect ke Database:", err);
    });
