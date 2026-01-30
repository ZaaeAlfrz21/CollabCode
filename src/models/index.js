// server/src/models/index.js
const sequelize = require('../config/db');
const User = require('./User');
const Room = require('./Room');
const { DataTypes } = require('sequelize');

// 1. Definisi Tabel Penghubung (Junction Table)
const UserRoom = sequelize.define('UserRoom', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    // Opsional: Tambahkan role jika perlu (misal: 'admin', 'viewer')
    role: {
        type: DataTypes.STRING,
        defaultValue: 'editor'
    },
    lastAccessed: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});

// --- DEFINISI RELASI (ASSOCIATIONS) ---

// A. Relasi Owner (Pemilik Room) - One-to-Many
// "Satu User bisa bikin banyak Room"
User.hasMany(Room, { foreignKey: 'userId', as: 'ownedRooms' });
// "Setiap Room pasti punya satu pemilik (User)"
Room.belongsTo(User, { foreignKey: 'userId', as: 'owner' });

// B. Relasi Member (Anggota Room) - Many-to-Many
// "User bisa bergabung ke banyak Room MELALUI tabel UserRoom"
User.belongsToMany(Room, { through: UserRoom, as: 'joinedRooms' });

// "Room bisa menampung banyak User MELALUI tabel UserRoom"
Room.belongsToMany(User, { through: UserRoom, as: 'members' });

// Export semua model
module.exports = { User, Room, UserRoom, sequelize };