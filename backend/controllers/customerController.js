const User = require("../models/user");
const Loan = require("../models/loan");
const { calculateEMI } = require("../utils/emiCalculator");

const customerController = {
  // Get customer profile
  async getProfile(req, res, next) {
    try {
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Customer not found",
        });
      }

      res.json({
        success: true,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          occupation: user.occupation,
          annualIncome: user.annual_income,
          dateOfBirth: user.date_of_birth,
          address: user.address,
          company: user.company,
          createdAt: user.created_at,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Update customer profile
  async updateProfile(req, res, next) {
    try {
      const {
        name,
        phone,
        occupation,
        annualIncome,
        dateOfBirth,
        address,
        company,
      } = req.body;

      // Clean and validate the data - ensure no undefined values
      const updateData = {};

      // Handle each field with proper null conversion
      if (name !== undefined && name !== null) {
        updateData.name = name.toString().trim() || null;
      } else {
        updateData.name = null;
      }

      if (phone !== undefined && phone !== null) {
        updateData.phone = phone.toString().trim() || null;
      } else {
        updateData.phone = null;
      }

      if (occupation !== undefined && occupation !== null) {
        updateData.occupation = occupation.toString().trim() || null;
      } else {
        updateData.occupation = null;
      }

      if (annualIncome !== undefined && annualIncome !== null) {
        updateData.annual_income = parseFloat(annualIncome) || null;
      } else {
        updateData.annual_income = null;
      }

      if (company !== undefined && company !== null) {
        updateData.company = company.toString().trim() || null;
      } else {
        updateData.company = null;
      }

      if (address !== undefined && address !== null) {
        updateData.address = address.toString().trim() || null;
      } else {
        updateData.address = null;
      }

      // Handle date_of_birth - SQLite can accept empty string for dates
      if (
        dateOfBirth !== undefined &&
        dateOfBirth !== null &&
        dateOfBirth.toString().trim() !== ""
      ) {
        updateData.date_of_birth = dateOfBirth.toString().trim();
      } else {
        updateData.date_of_birth = null;
      }

      console.log("[Backend] Cleaned update data:", updateData);

      // Remove any fields that are still undefined (shouldn't happen with above logic)
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      console.log(" [Backend] Final update data after cleanup:", updateData);

      // Check if we have any valid fields to update
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          message: "No valid fields to update",
        });
      }

      const updated = await User.update(req.user.id, updateData);

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Get updated user
      const user = await User.findById(req.user.id);

      res.json({
        success: true,
        message: "Profile updated successfully",
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            occupation: user.occupation,
            annualIncome: user.annual_income,
            dateOfBirth: user.date_of_birth,
            address: user.address,
            company: user.company,
          },
        },
      });
    } catch (error) {
      console.error(" [Backend] Profile update error:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Get customer's loans
  async getLoans(req, res, next) {
    try {
      const loans = await Loan.findByUserId(req.user.id);

      res.json({
        success: true,
        data: {
          loans,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Apply for new loan
  async applyForLoan(req, res, next) {
    try {
      const { loanType, amount, purpose, tenureMonths, interestRate } =
        req.body;

      // Calculate EMI
      const emiDetails = calculateEMI(amount, interestRate, tenureMonths);

      // Create loan application
      const loanId = await Loan.create({
        userId: req.user.id,
        loanType,
        amount,
        purpose,
        tenureMonths,
        interestRate,
        monthlyEMI: emiDetails.monthlyEMI,
        totalAmount: emiDetails.totalAmount,
      });

      // Get created loan
      const loan = await Loan.findById(loanId);

      res.status(201).json({
        success: true,
        message: "Loan application submitted successfully",
        data: {
          loan: {
            id: loan.id,
            loanType: loan.loan_type,
            amount: loan.amount,
            purpose: loan.purpose,
            tenureMonths: loan.tenure_months,
            interestRate: loan.interest_rate,
            status: loan.status,
            monthlyEMI: loan.monthly_emi,
            totalAmount: loan.total_repayment,
            appliedDate: loan.applied_date,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Get specific loan details
  async getLoanDetails(req, res, next) {
    try {
      const { id } = req.params;

      const loan = await Loan.findById(id);

      if (!loan) {
        return res.status(404).json({
          success: false,
          message: "Loan not found",
        });
      }

      // Check if loan belongs to user
      if (loan.user_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      res.json({
        success: true,
        data: {
          loan: {
            id: loan.id,
            loanType: loan.loan_type,
            amount: loan.amount,
            purpose: loan.purpose,
            tenureMonths: loan.tenure_months,
            interestRate: loan.interest_rate,
            status: loan.status,
            monthlyEMI: loan.monthly_emi,
            totalAmount: loan.total_repayment,
            totalInterest: loan.total_repayment - loan.amount,
            appliedDate: loan.applied_date,
            processedDate: loan.processed_date,
            adminNotes: loan.admin_notes,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Get customer dashboard statistics
  async getCustomerStats(req, res, next) {
    try {
      const loans = await Loan.findByUserId(req.user.id);

      const stats = {
        totalLoans: loans.length,
        pendingLoans: loans.filter((loan) => loan.status === "pending").length,
        approvedLoans: loans.filter((loan) => loan.status === "approved")
          .length,
        rejectedLoans: loans.filter((loan) => loan.status === "rejected")
          .length,
        totalBorrowed: loans
          .filter((loan) => loan.status === "approved")
          .reduce((sum, loan) => sum + parseFloat(loan.amount), 0),
      };

      res.json({
        success: true,
        data: {
          stats,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = customerController;
