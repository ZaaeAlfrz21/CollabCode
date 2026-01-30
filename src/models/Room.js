const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Room = sequelize.define('Room', {
    roomId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        primaryKey: true
    },
    content: {
        type: DataTypes.TEXT('long'), 
        defaultValue: ""
    },
    // --- TAMBAHAN PENTING ---
    // Kolom ini wajib ada sebagai Foreign Key untuk menandakan pemilik Room
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false, // Wajib diisi (setiap room harus punya owner)
        references: {
            model: 'Users', // Pastikan nama tabel di database kamu 'Users' (biasanya jamak)
            key: 'id'
        },
        onDelete: 'CASCADE', // Jika User dihapus, Room miliknya juga terhapus
        onUpdate: 'CASCADE'
    }
});

module.exports = Room;