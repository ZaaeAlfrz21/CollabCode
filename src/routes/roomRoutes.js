const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const authMiddleware = require('../middleware/authMiddleware');

// Endpoint ambil history (Wajib Auth)
router.get('/history', authMiddleware, roomController.getUserHistory); // Route Dashboard
router.get('/:roomId', authMiddleware, roomController.getOrCreateRoom); // Route Editor

module.exports = router;