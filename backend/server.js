require("dotenv").config();
const app = require("./app");
const db = require("./config/database");

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log("✅ App is fully initialized");
});
