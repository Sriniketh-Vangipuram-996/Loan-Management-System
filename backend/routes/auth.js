const express = require('express');
const { 
    register, 
    login, 
    adminLogin, 
    getCurrentUser,
    logout 
} = require('../controllers/authController');
const { authenticateToken } = require('../middlware/auth');
const { validateRegistration, handleValidationErrors } = require('../middlware/validation');

const router = express.Router();

router.post('/register', validateRegistration, handleValidationErrors, register);
router.post('/login', login);
router.post('/admin-login', adminLogin);

// Protected routes
router.get('/me', authenticateToken, getCurrentUser);
router.post('/logout', authenticateToken, logout);

module.exports = router;