const { pool } = require('../config/database');

const User = {
    // Create new user
    async create(userData) {
        console.log('[User Model] Creating user with data:', userData);
        
        const { name, email, password, phone, occupation, annualIncome, dateOfBirth, address } = userData;
        
        try {
            const [result] = await pool.execute(
                `INSERT INTO users (name, email, password, phone, occupation, annual_income, date_of_birth, address) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [name, email, password, phone, occupation, annualIncome, dateOfBirth, address]
            );
            
            console.log('[User Model] User created successfully, ID:', result.insertId);
            return result.insertId;
        } catch (error) {
            console.error('[User Model] Error creating user:', error);
            throw error;
        }
    },

    // Find user by email
    async findByEmail(email) {
        console.log(' [User Model] Finding user by email:', email);
        const [users] = await pool.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        console.log('[User Model] User found:', users[0] ? 'Yes' : 'No');
        return users[0];
    },

    // Find user by ID
    async findById(id) {
        console.log('[User Model] Finding user by ID:', id);
        const [users] = await pool.execute(
            'SELECT id, name, email, role, phone, occupation, annual_income, date_of_birth, address, company, created_at FROM users WHERE id = ?',
            [id]
        );
        return users[0];
    },

// Update user profile
async update(id, updateData) {
    console.log('[User Model] Starting update for user:', id);
    console.log('[User Model] Update data received:', updateData);
    
    const allowedFields = ['name', 'phone', 'occupation', 'annual_income', 'date_of_birth', 'address', 'company'];
    const updates = [];
    const values = [];

    Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key)) {
            if (updateData[key] === undefined) {
                console.log(`[User Model] Skipping undefined field: ${key}`);
                return;
            }
            
            updates.push(`${key} = ?`);
            values.push(updateData[key]);
            console.log(`[User Model] Adding field: ${key} = ${updateData[key]} (type: ${typeof updateData[key]})`);
        }
    });

    if (updates.length === 0) {
        console.log(' [User Model] No valid fields to update');
        throw new Error('No valid fields to update');
    }

    values.push(id);
    
    const query = `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    
    try {
        const [result] = await pool.execute(query, values);
        console.log(' [User Model] Update successful, affected rows:', result.affectedRows);
        return result.affectedRows > 0;
    } catch (error) {
        console.error('[User Model] Database error:', error);
        console.error('[User Model] Error details:', {
            code: error.code,
            errno: error.errno,
            sqlState: error.sqlState,
            sqlMessage: error.sqlMessage
        });
        throw error;
    }
},
    async findById(id, includePassword = false) {
        try {
            const fields = includePassword 
                ? 'id, name, email, password, phone, occupation, annual_income, role, date_of_birth, address, company, created_at'
                : 'id, name, email, phone, occupation, annual_income, role, date_of_birth, address, company, created_at';
            
            const [users] = await pool.execute(
                `SELECT ${fields} FROM users WHERE id = ?`,
                [id]
            );
            return users[0] || null;
        } catch (error) {
            console.error('Error finding user by ID:', error);
            throw error;
        }
    },
    async update(id, updateData) {
        console.log('[User Model] Starting update for user:', id);
        console.log('[User Model] Update data received:', updateData);
        
        const allowedFields = ['name', 'email', 'phone', 'occupation', 'annual_income', 'date_of_birth', 'address', 'company'];
        const updates = [];
        const values = [];

        Object.keys(updateData).forEach(key => {
            if (allowedFields.includes(key) && updateData[key] !== undefined) {
                updates.push(`${key} = ?`);
                values.push(updateData[key]);
                console.log(` [User Model] Adding field: ${key} = ${updateData[key]}`);
            }
        });

        if (updates.length === 0) {
            console.log('[User Model] No valid fields to update');
            throw new Error('No valid fields to update');
        }

        values.push(id);
        
        const query = `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        console.log('[User Model] Executing query:', query);
        console.log('[User Model] With values:', values);
        
        try {
            const [result] = await pool.execute(query, values);
            console.log('[User Model] Update successful, affected rows:', result.affectedRows);
            return result.affectedRows > 0;
        } catch (error) {
            console.error(' [User Model] Database error:', error);
            throw error;
        }
    }

};

module.exports = User;