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
        type: DataTypes.TEXT('long'), 
        defaultValue: ""
    }
    // HAPUS bagian userId.
    // Sequelize akan otomatis menambahkannya karena kita sudah tulis 
    // "Room.belongsTo(User)" di file index.js
});

module.exports = Room;