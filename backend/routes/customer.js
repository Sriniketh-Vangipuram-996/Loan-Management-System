const express = require('express');
const { 
    getProfile, 
    updateProfile, 
    getLoans, 
    applyForLoan, 
    getLoanDetails,
    getCustomerStats 
} = require('../controllers/customerController');
const { authenticateToken } = require('../middlware/auth');
const { requireRole } = require('../middlware/roleCheck');
const { validateLoanApplication, handleValidationErrors } = require('../middlware/validation');

const router = express.Router();

router.use(authenticateToken);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

router.get('/loans', getLoans);
router.post('/loans', validateLoanApplication, handleValidationErrors, applyForLoan);
router.get('/loans/:id', getLoanDetails);

router.get('/stats', getCustomerStats);

module.exports = router;