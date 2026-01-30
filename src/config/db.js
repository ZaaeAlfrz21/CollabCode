const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME || 'collaborative_editor', // Nama DB
    process.env.DB_USER || 'root',                 // User
    process.env.DB_PASSWORD || '',                 // Password (perhatikan nama variabelnya)
    {
        host: process.env.DB_HOST || 'localhost',  // Host
        port: process.env.DB_PORT || 3306,         // <--- TAMBAHAN PENTING (Port Default MySQL)
        dialect: 'mysql',
        logging: false,
        // Opsi tambahan agar koneksi tidak putus saat idle di Railway
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

module.exports = sequelize;