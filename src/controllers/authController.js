const User = require('../models/User'); // Pastikan path ini benar
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- 1. REGISTER USER ---
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Cek apakah email sudah ada
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "Email sudah terdaftar" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Simpan ke database
        await User.create({
            username,
            email,
            password: hashedPassword
        });

        res.status(201).json({ message: "Registrasi berhasil!" });
    } catch (err) {
        console.error("Error Register:", err);
        res.status(500).json({ message: "Terjadi kesalahan server", error: err.message });
    }
};

// --- 2. LOGIN USER ---
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Cari user berdasarkan email
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: "Email tidak ditemukan" });
        }

        // Cek password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Password salah" });
        }

        // Buat Token JWT
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'rahasia123', { 
            expiresIn: '1d' 
        });

        // Kirim response (termasuk profilePicture agar frontend bisa langsung update)
        res.json({
            message: "Login berhasil",
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture // Mengirim path foto profil
            }
        });
    } catch (err) {
        console.error("Error Login:", err);
        res.status(500).json({ message: "Terjadi kesalahan server", error: err.message });
    }
};

// --- 3. UPDATE FOTO PROFIL (INI YANG SEBELUMNYA HILANG) ---
exports.updateProfilePicture = async (req, res) => {
    try {
        // 1. Cek apakah ada file yang diupload multer
        if (!req.file) {
            return res.status(400).json({ message: "Tidak ada file yang diunggah" });
        }

        // 2. Ambil ID User dari body (dikirim oleh Frontend via FormData)
        const userId = req.body.userId;
        
        if (!userId) {
            return res.status(400).json({ message: "User ID tidak ditemukan dalam request" });
        }

        // 3. Buat path URL gambar (misal: /uploads/1723123123.jpg)
        const profilePicturePath = `/uploads/${req.file.filename}`;

        // 4. Update kolom profilePicture di Database
        const updated = await User.update(
            { profilePicture: profilePicturePath },
            { where: { id: userId } }
        );

        if (updated[0] === 0) {
            return res.status(404).json({ message: "User tidak ditemukan atau update gagal" });
        }

        // 5. Berhasil
        res.json({ 
            message: "Foto profil berhasil diperbarui", 
            profilePicture: profilePicturePath 
        });

    } catch (err) {
        console.error("Error Upload:", err);
        res.status(500).json({ message: "Gagal mengupload foto", error: err.message });
    }
};