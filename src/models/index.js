// server/src/models/index.js
const sequelize = require('../config/db');
const User = require('./User');
const Room = require('./Room');
const { DataTypes } = require('sequelize');

// Tabel Penghubung: 'UserRooms'
const UserRoom = sequelize.define('UserRoom', {
    lastAccessed: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});

User.hasMany(Room, { foreignKey: 'userId', as: 'rooms' });
Room.belongsTo(User, { foreignKey: 'userId', as: 'owner' });

module.exports = { User, Room, UserRoom, sequelize };