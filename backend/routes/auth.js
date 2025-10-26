const express = require('express');
const { 
    register, 
    login, 
    adminLogin, 
    getCurrentUser,
    logout 
} = require('../controllers/authController');
const { authenticateToken } = require('../middlware/auth'); // Fix typo: middlware -> middleware
const { validateRegistration, handleValidationErrors } = require('../middlware/validation'); // Fix typo

const router = express.Router();

router.post('/register', validateRegistration, handleValidationErrors, register);
router.post('/login', login);
router.post('/admin-login', adminLogin);

// Protected routes
router.get('/me', authenticateToken, getCurrentUser);
router.post('/logout', authenticateToken, logout);

module.exports = router;