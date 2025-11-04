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

// Dashboard & Analytics
router.get("/dashboard-stats", adminController.getDashboardStats);
router.get("/analytics", adminController.getAnalytics);
router.get("/profile", adminController.getAdminProfile);

// Loan Management
router.get("/loans", adminController.getAllLoans);
router.get("/loans/:id", adminController.getLoanDetails);
router.put("/loans/:id", adminController.updateLoanStatus);

// Customer Management
router.get("/customers", adminController.getAllCustomers);
router.get("/customers/:id", adminController.getCustomerDetails);

// User Management
router.get("/users", adminController.getAllUsers);
router.get("/users/:id", adminController.getSingleUser);
router.post("/users", adminController.createUser);
router.put("/users/:id", adminController.updateUser);
router.delete("/users/:id", adminController.deleteUser);
router.put("/users/:id/role", adminController.updateUserRole);

// Admin Profile Management
router.put("/profile", adminController.updateAdminProfile);
router.put("/change-password", adminController.changeAdminPassword);

// System Settings
router.get("/settings", adminController.getSystemSettings);
router.put("/settings/system", adminController.updateSystemSettings);
router.put("/settings/loan", adminController.updateLoanSettings);

module.exports = router;
