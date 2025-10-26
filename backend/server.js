require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/database');

const PORT = process.env.PORT || 5000;

// Start server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
    });
}).catch(err => {
    console.error('Database connection failed:', err);
    process.exit(1);
});
