const mysql = require("mysql2/promise");
require("dotenv").config();

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "loan_management_system",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

const pool = mysql.createPool(dbConfig);

// Test connection - DON'T crash the app if it fails
const connectDB = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ MySQL Database connected successfully");
    connection.release();
    return pool;
  } catch (error) {
    console.log(
      "⚠️ Database connection failed (expected for now):",
      error.message
    );
    console.log("📝 App will start without database - OK for demo");
    // Return pool anyway so app doesn't crash
    return pool;
  }
};

module.exports = { pool, connectDB };
