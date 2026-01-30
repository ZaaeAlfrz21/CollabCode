// server/src/models/Room.js
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
        type: DataTypes.TEXT('long') 
        // ❌ JANGAN ADA 'defaultValue' DI SINI
    }
    // userId tidak perlu ditulis, otomatis dibuat oleh index.js
});

module.exports = Room;
