const express = require("express");
const authController = require("../controllers/authController"); // Import the whole object
const { authenticateToken } = require("../middlware/auth");
const {
  validateRegistration,
  handleValidationErrors,
} = require("../middlware/validation");

const router = express.Router();

router.post(
  "/register",
  validateRegistration,
  handleValidationErrors,
  authController.register
);
router.post("/login", authController.login);
router.post("/admin-login", authController.adminLogin);
router.get("/me", authenticateToken, authController.getCurrentUser);
router.post("/logout", authenticateToken, authController.logout);

module.exports = router;
