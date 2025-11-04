const express = require("express");
const customerController = require("../controllers/customerController"); // No destructuring
const { authenticateToken } = require("../middlware/auth");
const { requireRole } = require("../middlware/roleCheck");
const {
  validateLoanApplication,
  handleValidationErrors,
} = require("../middlware/validation");

const router = express.Router();

router.use(authenticateToken);
router.get("/profile", customerController.getProfile);
router.put("/profile", customerController.updateProfile);
router.get("/loans", customerController.getLoans);
router.post(
  "/loans",
  validateLoanApplication,
  handleValidationErrors,
  customerController.applyForLoan
);
router.get("/loans/:id", customerController.getLoanDetails);
router.get("/stats", customerController.getCustomerStats);

module.exports = router;
