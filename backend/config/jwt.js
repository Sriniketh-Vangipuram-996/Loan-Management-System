module.exports = {
    secret: process.env.JWT_SECRET || 'your-fallback-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    issuer: process.env.JWT_ISSUER || 'loan-management-system'
};