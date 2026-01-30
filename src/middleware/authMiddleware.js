const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.header('Authorization');
    
    // Jika tidak ada token, lanjut saja (req.user = null) agar Guest tetap bisa coding
    if (!token) {
        req.user = null; 
        return next();
    }

    try {
        // Token biasanya dikirim format "Bearer <token>"
        const cleanToken = token.replace('Bearer ', ''); 
        const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);
        req.user = decoded; // Simpan data user di request
        next();
    } catch (err) {
        console.error("Token invalid");
        req.user = null; // Anggap guest jika token salah
        next();
    }
};