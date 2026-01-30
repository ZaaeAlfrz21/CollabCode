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
const server = http.createServer(app);

const PORT = process.env.PORT || 5000; 

// --- KONFIGURASI CORS (SUDAH DIPERBAIKI) ---
// ✅ GANTI DENGAN INI:
// Kita masukkan alamat Frontend Railway Anda secara spesifik.
// Jika origin '*', browser sering menolak jika credentials: true.
app.use(cors({
    origin: ["https://coolabcoode-production.up.railway.app", "http://localhost:5173"], 
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], 
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true 
}));

app.use(express.json());

// Akses folder uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 

// Setup Socket.io
const io = new Server(server, {
    cors: {
        // ✅ Samakan juga origin socket dengan HTTP
        origin: ["https://coolabcoode-production.up.railway.app", "http://localhost:5173"],
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
sequelize.sync({ alter: true }) 
    .then(() => {
        console.log("✅ Database MySQL Connected & Synced");
        
        // 0.0.0.0 sudah benar untuk Railway!
        server.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📡 Socket.io ready`);
        });
    })
    .catch((err) => {
        console.error("❌ Gagal connect ke Database:", err);
    });
