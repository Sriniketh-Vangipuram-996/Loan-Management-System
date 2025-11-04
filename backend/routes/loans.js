const express = require("express");
const loanController = require("../controllers/loanController"); // No destructuring
const { authenticateToken } = require("../middlware/auth");

const router = express.Router();

router.post("/calculate-emi", loanController.calculateEMI);
router.post("/submitLoan", authenticateToken, loanController.submitLoan);
router.get("/:id", authenticateToken, loanController.getLoanDetails);

module.exports = router;
