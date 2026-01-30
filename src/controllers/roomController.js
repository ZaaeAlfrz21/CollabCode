const { Room, User } = require('../models'); 

// 1. Fungsi Masuk Room (Create or Find)
exports.getOrCreateRoom = async (req, res) => {
    const { roomId } = req.params;
    // Ambil ID user dari token (jika ada)
    const userId = req.user ? req.user.id : null; 

    try {
        // Cari Room
        let room = await Room.findOne({ where: { roomId } });

        // Jika Room TIDAK ADA, buat baru
        if (!room) {
            // Cek apakah user login? Tamu tidak boleh buat room baru
            if (!userId) {
                return res.status(401).json({ message: "Anda harus login untuk membuat Room baru." });
            }

            // Create Room dengan Owner
            room = await Room.create({
                roomId,
                content: `// Project ini dibuat oleh user ID: ${userId}`,
                userId: userId // Menyimpan pemilik room
            });
        }
        
        res.status(200).json(room);
    } catch (error) {
        console.error("Error getOrCreateRoom:", error);
        res.status(500).json({ message: "Server Error saat memuat room." });
    }
};

// 2. Fungsi Ambil Daftar Room Milik User (Dashboard)
exports.getUserHistory = async (req, res) => {
    try {
        // req.user.id didapat dari authMiddleware
        const userId = req.user.id; 
        
        const myRooms = await Room.findAll({
            where: { userId: userId }, // Filter hanya room milik user ini
            order: [['updatedAt', 'DESC']], // Urutkan dari yang paling baru diedit
            include: [{
                model: User,
                as: 'owner', // Pastikan models/index.js punya alias ini
                attributes: ['username']
            }]
        });

        res.json(myRooms);
    } catch (error) {
        console.error("Error getUserHistory:", error);
        res.status(500).json({ message: "Gagal mengambil daftar room" });
    }
};