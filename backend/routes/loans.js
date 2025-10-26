const {
    calculateEMI,
    getLoanDetails,
    submitLoan
} = require('../controllers/loanController');

const { authenticateToken } = require('../middlware/auth');
const express = require('express');

const router = express.Router();
router.post('/calculate-emi', calculateEMI);

router.post('/submitLoan', authenticateToken, submitLoan);

router.get('/:id', authenticateToken, getLoanDetails);

module.exports = router;
