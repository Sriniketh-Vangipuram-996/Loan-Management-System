require("dotenv").config();
const app = require("./app");
const { connectDB } = require("./config/database");

const PORT = process.env.PORT || 5000;

// Start server
async function startServer() {
  try {
    // Try to connect to database, but don't crash if it fails
    await connectDB();

    // Start server regardless of database connection
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(
        `📊 Database status: ${
          process.env.DB_HOST ? "Configured" : "Not configured"
        }`
      );
    });
  } catch (error) {
    console.log("Server started without database connection");
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} (without database)`);
    });
  }
}
startServer();
