const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const multer = require('multer');
const path = require('path');

// --- SETUP MULTER (UPLOAD) DI SINI ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Pastikan folder 'uploads' ada di root folder server
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// --- DEFINISI ROUTE ---

// 1. Register
// Pastikan authController.register ADA di file controller
router.post('/register', authController.register);

// 2. Login
// Pastikan authController.login ADA di file controller
router.post('/login', authController.login);

// 3. Upload Profile
// Pastikan authController.updateProfilePicture ADA di file controller
router.post('/upload-profile', upload.single('profilePic'), authController.updateProfilePicture);

module.exports = router;