const express = require('express');
const { 
    getDashboardStats,
    getAllLoans,
    updateLoanStatus,
    getAllCustomers,
    getCustomerDetails,
    getAnalytics,
    updateSystemSettings,
    getAdminProfile,
    getLoanDetails,
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
    updateUserRole,
    changeAdminPassword,
    updateAdminProfile,
    getSingleUser,
    getSystemSettings,
    updateLoanSettings,
    verifyAdminAccess  
} = require('../controllers/adminController');
const { authenticateToken } = require('../middlware/auth');
const { requireRole } = require('../middlware/roleCheck');

const router = express.Router();

router.use(authenticateToken, requireRole(['admin']));
router.get('/test', (req, res) => res.json({ success: true, message: 'Admin route is working' }));
router.use(verifyAdminAccess);

// Dashboard & Analytics
router.get('/dashboard-stats', getDashboardStats);
router.get('/analytics', getAnalytics);
router.get('/profile', getAdminProfile);

// Loan Management
router.get('/loans', getAllLoans);
router.get('/loans/:id', getLoanDetails);
router.put('/loans/:id', updateLoanStatus);

// Customer Management
router.get('/customers', getAllCustomers);
router.get('/customers/:id', getCustomerDetails);

// User Management
router.get('/users', getAllUsers);
router.get('/users/:id', getSingleUser);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/role', updateUserRole);

// User Loans (if you added this function)
// router.get('/users/:id/loans', getUserLoans);

// Admin Profile Management
router.put('/profile', updateAdminProfile);
router.put('/change-password', changeAdminPassword);

// System Settings
router.get('/settings', getSystemSettings); // Get all settings
router.put('/settings/system', updateSystemSettings); // Update system settings
router.put('/settings/loan', updateLoanSettings); // Update loan settings

module.exports = router;