const express = require("express");
const adminController = require("../controllers/adminController"); // No destructuring
const { authenticateToken } = require("../middlware/auth");
const { requireRole } = require("../middlware/roleCheck");

const router = express.Router();

router.use(authenticateToken, requireRole(["admin"]));
router.get("/test", (req, res) =>
  res.json({ success: true, message: "Admin route is working" })
);
router.use(adminController.verifyAdminAccess);

// Use adminController.methodName for all routes
router.get("/dashboard-stats", adminController.getDashboardStats);
router.get("/analytics", adminController.getAnalytics);
router.get("/profile", adminController.getAdminProfile);
router.get("/loans", adminController.getAllLoans);
router.get("/loans/:id", adminController.getLoanDetails);
router.put("/loans/:id", adminController.updateLoanStatus);
// ... and all other admin routes
