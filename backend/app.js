const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/auth");
const customerRoutes = require("./routes/customer");
const adminRoutes = require("./routes/admin");
const loanRoutes = require("./routes/loans");
const { getInterestRates } = require("./controllers/adminController");
const errorHandler = require("./middlware/errorHandler");

const app = express();
app.use(helmet());
//CORS..
app.use(
  cors({
    origin: [
      "http://127.0.0.1:5500",
      "http://localhost:5500",
      "http://localhost:3000",
      "http://127.0.0.1:8080",
      "https://mern-fintech.netlify.app",
      "https://*.netlify.app",
    ],
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 1000,
});
app.use(limiter);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Debug: Check what each route file exports
console.log("=== ROUTE EXPORTS DEBUG ===");
console.log("authRoutes type:", typeof authRoutes);
console.log("authRoutes constructor:", authRoutes?.constructor?.name);

console.log("customerRoutes type:", typeof customerRoutes);
console.log("customerRoutes constructor:", customerRoutes?.constructor?.name);

console.log("adminRoutes type:", typeof adminRoutes);
console.log("adminRoutes constructor:", adminRoutes?.constructor?.name);

console.log("loanRoutes type:", typeof loanRoutes);
console.log("loanRoutes constructor:", loanRoutes?.constructor?.name);
console.log("=== END DEBUG ===");

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/loans", loanRoutes);
app.get("/api/settings/interest-rates", getInterestRates);
// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

app.use(errorHandler);
// After mounting routes, add this:
console.log("Available routes:");
app._router.stack.forEach((middleware) => {
  if (middleware.route) {
    console.log(
      `${Object.keys(middleware.route.methods)} ${middleware.route.path}`
    );
  } else if (middleware.name === "router") {
    console.log("Router mounted at:", middleware.regexp);
  }
});
// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

module.exports = app;
