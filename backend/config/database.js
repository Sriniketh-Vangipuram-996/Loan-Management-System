const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'loan_management_system',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// Test connection
const connectDB = async () => {
    try {
        const connection = await pool.getConnection();
        console.log(' MySQL Database connected successfully');
        connection.release();
        return pool;
    } catch (error) {
        console.error('Database connection failed:', error.message);
        throw error;
    }
};

module.exports = { pool, connectDB };