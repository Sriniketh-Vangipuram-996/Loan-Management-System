const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath =
  process.env.DB_PATH || path.join(__dirname, "loan_database.sqlite");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.log("❌ Database connection failed:", err.message);
  } else {
    console.log("✅ Connected to SQLite database");
    initializeTables();
  }
});

// Create tables
function initializeTables() {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    phone TEXT,
    occupation TEXT,
    annual_income REAL,
    role TEXT DEFAULT 'customer',
    date_of_birth TEXT,
    address TEXT,
    company TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS loans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    loan_type TEXT NOT NULL,
    amount REAL NOT NULL,
    purpose TEXT NOT NULL,
    tenure_months INTEGER NOT NULL,
    interest_rate REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    monthly_emi REAL NOT NULL,
    total_repayment REAL NOT NULL,
    admin_notes TEXT,
    admin_id INTEGER,
    applied_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    processed_date DATETIME,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS system_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    updated_by INTEGER,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
}

// Convert callback to promise for easier use
db.getAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

db.allAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

db.runAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ insertId: this.lastID, changes: this.changes });
    });
  });
};

module.exports = db;
