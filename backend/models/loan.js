const db = require("../config/database");

const Loan = {
  // Create new loan application
  async create(loanData) {
    const {
      userId,
      loanType,
      amount,
      purpose,
      tenureMonths,
      interestRate,
      monthlyEMI,
      totalAmount,
    } = loanData;

    const result = await db.runAsync(
      `INSERT INTO loans (user_id, loan_type, amount, purpose, tenure_months, interest_rate, monthly_emi, total_repayment) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        loanType,
        amount,
        purpose,
        tenureMonths,
        interestRate,
        monthlyEMI,
        totalAmount,
      ]
    );

    return result.insertId;
  },

  // Find loan by ID
  async findById(loanId) {
    const loan = await db.getAsync(
      `SELECT l.*, u.name as customer_name, u.email, u.phone 
             FROM loans l 
             JOIN users u ON l.user_id = u.id 
             WHERE l.id = ?`,
      [loanId]
    );
    return loan;
  },

  // Get customer's loans
  async findByUserId(userId) {
    const loans = await db.allAsync(
      `SELECT id, loan_type, amount, purpose, tenure_months, interest_rate, status, 
                    applied_date, processed_date, monthly_emi, total_repayment
             FROM loans 
             WHERE user_id = ? 
             ORDER BY applied_date DESC`,
      [userId]
    );
    return loans;
  },

  // Get all loans (for admin)
  async findAll(filters) {
    const query = `
      SELECT l.*, u.name as customer_name, u.email, u.phone
      FROM loans l
      JOIN users u ON l.user_id = u.id
      WHERE 1=1
      ORDER BY l.applied_date DESC
      LIMIT 50
    `;

    const rows = await db.allAsync(query);
    return rows;
  },

  // Update loan status
  async updateStatus(loanId, status, adminId = null, adminNotes = "") {
    const result = await db.runAsync(
      `UPDATE loans 
             SET status = ?, admin_id = ?, admin_notes = ?, processed_date = CURRENT_TIMESTAMP 
             WHERE id = ?`,
      [status, adminId, adminNotes, loanId]
    );

    return result.changes > 0;
  },

  // Get loan statistics
  async getStats() {
    const stats = await db.getAsync(`
      SELECT 
        COUNT(*) as total_loans,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_loans,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_loans,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_loans,
        SUM(amount) as total_amount,
        AVG(amount) as average_amount
      FROM loans
    `);
    return stats;
  },
};

module.exports = Loan;
