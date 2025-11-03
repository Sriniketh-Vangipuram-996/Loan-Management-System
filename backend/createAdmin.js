const db = require("./config/database");
const { hashPassword } = require("./utils/passwordHash");

async function createAdmin() {
  try {
    const hashedPassword = await hashPassword("admin123");

    await db.runAsync(
      `INSERT INTO users (name, email, password, role, phone, occupation, annual_income) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        "Admin User",
        "admin@loanapp.com",
        hashedPassword,
        "admin",
        "1234567890",
        "Administrator",
        1000000,
      ]
    );

    console.log("✅ Admin user created successfully!");
    console.log("Email: admin@loanapp.com");
    console.log("Password: admin123");
  } catch (error) {
    console.log("Admin already exists or error:", error.message);
  }
}

createAdmin();
