const { body, validationResult } = require('express-validator');

// User registration validation 
const validateRegistration = [
    body('firstName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2 and 50 characters'),
    body('lastName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Last name must be between 2 and 50 characters'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    body('phone')
        .isMobilePhone('en-IN')
        .withMessage('Please provide a valid Indian phone number'),
    body('occupation')
        .isIn(['salaried', 'business', 'self_employed', 'professional', 'other'])
        .withMessage('Please select a valid occupation'),
    body('annualIncome')
        .isFloat({ min: 100000 })
        .withMessage('Annual income must be at least ₹1,00,000')
];
// Loan application validation
const validateLoanApplication = [
    body('loanType')
        .isIn(['personal', 'home', 'car', 'education', 'business'])
        .withMessage('Invalid loan type'),
    body('amount')
        .isFloat({ min: 50000, max: 5000000 })
        .withMessage('Loan amount must be between ₹50,000 and ₹50,00,000'),
    body('purpose')
        .trim()
        .isLength({ min: 10, max: 255 })
        .withMessage('Purpose must be between 10 and 255 characters'),
    body('tenureMonths')
        .isInt({ min: 6, max: 120 })
        .withMessage('Loan tenure must be between 6 and 120 months')
];

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

module.exports = {
    validateRegistration,
    validateLoanApplication,
    handleValidationErrors
};