const Loan = require("../models/loan");
const User = require("../models/user");
const db = require("../config/database");
const { hashPassword } = require("../utils/passwordHash");

const adminController = {
  // Get admin dashboard statistics
  async getDashboardStats(req, res, next) {
    try {
      const loanStats = await Loan.getStats();

      const todayLoans = await db.getAsync(
        `SELECT COUNT(*) as count FROM loans 
                 WHERE DATE(applied_date) = DATE('now')`
      );

      const customerCount = await db.getAsync(
        `SELECT COUNT(*) as count FROM users WHERE role = 'customer'`
      );

      const stats = {
        totalLoans: loanStats.total_loans,
        pendingLoans: loanStats.pending_loans,
        approvedLoans: loanStats.approved_loans,
        rejectedLoans: loanStats.rejected_loans,
        totalCustomers: customerCount.count,
        totalAmountDisbursed: loanStats.total_amount,
        averageLoanAmount: loanStats.average_amount,
        todayApplications: todayLoans.count,
      };

      res.json({
        success: true,
        data: { stats },
      });
    } catch (error) {
      next(error);
    }
  },

  async getAllLoans(req, res, next) {
    try {
      const { status, loanType, limit = 50, page = 1 } = req.query;
      const filters = {};
      if (status) filters.status = status;
      if (loanType) filters.loanType = loanType;

      const loans = await Loan.findAll(filters);

      res.json({
        success: true,
        data: {
          loans,
          pagination: {
            total: loans.length,
            page: parseInt(page),
            limit: parseInt(limit),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async updateLoanStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, adminNotes } = req.body;

      const validStatuses = ["approved", "rejected", "under_review"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status",
        });
      }

      const updated = await Loan.updateStatus(
        id,
        status,
        req.user.id,
        adminNotes
      );

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: "Loan not found",
        });
      }

      const loan = await Loan.findById(id);

      res.json({
        success: true,
        message: `Loan ${status} successfully`,
        data: {
          loan: {
            id: loan.id,
            status: loan.status,
            adminNotes: loan.admin_notes,
            processedDate: loan.processed_date,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async getAllCustomers(req, res, next) {
    try {
      console.log("Fetching all customers...");

      const customers = await db.allAsync(
        `SELECT id, name, email, phone, occupation, annual_income, created_at 
             FROM users 
             WHERE role = 'customer' 
             ORDER BY created_at DESC`
      );

      res.json({
        success: true,
        data: {
          customers,
          pagination: {
            total: customers.length,
            page: 1,
            limit: customers.length,
            totalPages: 1,
          },
        },
      });
    } catch (error) {
      console.error("SQL Error in getAllCustomers:", error);
      next(error);
    }
  },

  async getCustomerDetails(req, res, next) {
    try {
      const { id } = req.params;
      const customer = await User.findById(id);

      if (!customer || customer.role !== "customer") {
        return res.status(404).json({
          success: false,
          message: "Customer not found",
        });
      }

      const loans = await Loan.findByUserId(id);

      res.json({
        success: true,
        data: {
          customer: {
            id: customer.id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            occupation: customer.occupation,
            annualIncome: customer.annual_income,
            dateOfBirth: customer.date_of_birth,
            address: customer.address,
            createdAt: customer.created_at,
          },
          loans,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async getAnalytics(req, res, next) {
    try {
      console.log("=== ANALYTICS START ===");
      const statusCounts = await db.allAsync(`
        SELECT status, COUNT(*) as count 
        FROM loans 
        GROUP BY status
      `);

      let approvedLoans = 0;
      let pendingLoans = 0;
      let rejectedLoans = 0;
      let underReviewLoans = 0;

      statusCounts.forEach((row) => {
        console.log(`Status: ${row.status}, Count: ${row.count}`);
        switch (row.status) {
          case "approved":
            approvedLoans = row.count;
            break;
          case "pending":
            pendingLoans = row.count;
            break;
          case "rejected":
            rejectedLoans = row.count;
            break;
          case "under_review":
            underReviewLoans = row.count;
            break;
        }
      });

      const applicationsOverTime = await db.allAsync(`
        SELECT DATE(applied_date) as date, COUNT(*) as count 
        FROM loans 
        WHERE applied_date >= datetime('now', '-30 days')
        GROUP BY DATE(applied_date)
        ORDER BY date
      `);

      const loanTypes = await db.allAsync(`
        SELECT loan_type, COUNT(*) as count 
        FROM loans 
        GROUP BY loan_type
      `);

      const approvalStats = await db.getAsync(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved
        FROM loans
      `);

      const approvalRate =
        approvalStats.total > 0
          ? (approvalStats.approved / approvalStats.total) * 100
          : 0;

      const responseData = {
        approvedLoans,
        pendingLoans,
        rejectedLoans,
        underReviewLoans,
        applicationsOverTime,
        loanTypes,
        approvalRate: Math.round(approvalRate * 100) / 100,
        averageProcessingTime: 2.1,
      };

      res.json({
        success: true,
        data: responseData,
      });
    } catch (error) {
      console.error("Analytics error:", error);
      next(error);
    }
  },

  async getAdminProfile(req, res, next) {
    console.log("getAdminProfile called, user:", req.user);
    try {
      const adminId = req.user.id;
      const admin = await User.findById(adminId);

      if (!admin || admin.role !== "admin") {
        return res
          .status(404)
          .json({ success: false, message: "Admin not found" });
      }

      res.json({
        success: true,
        data: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
        },
      });
    } catch (error) {
      next(error);
    }
  },

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

      res.json({
        success: true,
        data: { loan },
      });
    } catch (error) {
      next(error);
    }
  },

  async getSingleUser(req, res, next) {
    try {
      console.log("Getting user");
      const { id } = req.params;
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
      res.json({
        success: true,
        data: { user },
      });
    } catch (error) {
      console.error("Get single user error:", error);
      next(error);
    }
  },

  async getAllUsers(req, res, next) {
    try {
      console.log("Fetching all users...");

      const users = await db.allAsync(
        `SELECT id, name, email, phone, occupation, annual_income, role, created_at 
                 FROM users 
                 ORDER BY created_at DESC`
      );

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            total: users.length,
            page: 1,
            limit: users.length,
            totalPages: 1,
          },
        },
      });
    } catch (error) {
      console.error("SQL Error in getAllUsers:", error);
      next(error);
    }
  },

  async createUser(req, res, next) {
    try {
      const {
        name,
        email,
        password,
        role = "customer",
        phone,
        occupation,
        annualIncome,
      } = req.body;

      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Email already registered",
        });
      }

      const hashedPassword = await hashPassword(password, 10);
      const userId = await User.create({
        name,
        email,
        password: hashedPassword,
        phone,
        occupation,
        annualIncome,
        role,
        dateOfBirth: null,
        address: null,
      });

      const user = await User.findById(userId);

      res.status(201).json({
        success: true,
        message: "User created successfully",
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            occupation: user.occupation,
            role: user.role,
            createdAt: user.created_at,
          },
        },
      });
    } catch (error) {
      console.error("Create user error:", error);
      next(error);
    }
  },

  async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const { name, email, phone, occupation, annualIncome } = req.body;

      const existingUser = await User.findById(id);
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const updated = await User.update(id, {
        name,
        email,
        phone,
        occupation,
        annual_income: annualIncome,
      });

      if (!updated) {
        return res.status(400).json({
          success: false,
          message: "Failed to update user",
        });
      }

      const user = await User.findById(id);

      res.json({
        success: true,
        message: "User updated successfully",
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            occupation: user.occupation,
            role: user.role,
          },
        },
      });
    } catch (error) {
      console.error("Update user error:", error);
      next(error);
    }
  },

  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;

      const existingUser = await User.findById(id);
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (parseInt(id) === parseInt(req.user.id)) {
        return res.status(400).json({
          success: false,
          message: "Cannot delete your own account",
        });
      }

      const result = await db.runAsync("DELETE FROM users WHERE id = ?", [id]);

      if (result.changes === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      console.error("Delete user error:", error);
      next(error);
    }
  },

  async updateUserRole(req, res, next) {
    try {
      const { id } = req.params;
      const { role } = req.body;

      const validRoles = ["customer", "admin"];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Invalid role",
        });
      }

      const existingUser = await User.findById(id);
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (parseInt(id) === parseInt(req.user.id)) {
        return res.status(400).json({
          success: false,
          message: "Cannot change your own role",
        });
      }

      const result = await db.runAsync(
        "UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [role, id]
      );

      if (result.changes === 0) {
        return res.status(400).json({
          success: false,
          message: "Failed to update user role",
        });
      }

      const updatedUser = await User.findById(id);

      res.json({
        success: true,
        message: `User role updated to ${role} successfully`,
        data: {
          user: {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            phone: updatedUser.phone,
            occupation: updatedUser.occupation,
          },
        },
      });
    } catch (error) {
      console.error("Update user role error:", error);
      next(error);
    }
  },

  async updateAdminProfile(req, res, next) {
    try {
      const { name, email, phone } = req.body;
      const adminId = req.user.id;

      console.log("[Admin] Updating admin profile:", {
        adminId,
        name,
        email,
        phone,
      });

      if (!name || !email) {
        return res.status(400).json({
          success: false,
          message: "Name and email are required",
        });
      }

      const cleanPhone = phone && phone.trim() !== "" ? phone.trim() : null;

      const updated = await User.update(adminId, {
        name: name.trim(),
        email: email.trim(),
        phone: cleanPhone,
      });

      if (!updated) {
        return res.status(400).json({
          success: false,
          message: "Failed to update profile",
        });
      }

      const admin = await User.findById(adminId);

      res.json({
        success: true,
        message: "Profile updated successfully",
        data: {
          user: {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            phone: admin.phone,
            role: admin.role,
          },
        },
      });
    } catch (error) {
      console.error(" [Admin] Profile update error:", error);
      res.status(500).json({
        success: false,
        message: "Error updating profile: " + error.message,
      });
    }
  },

  async changeAdminPassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const adminId = req.user.id;

      const admin = await User.findById(adminId, true);

      if (!admin) {
        return res.status(404).json({
          success: false,
          message: "Admin not found",
        });
      }

      const { comparePassword } = require("../utils/passwordHash");
      const isCurrentPasswordValid = await comparePassword(
        currentPassword,
        admin.password
      );

      if (!isCurrentPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      const hashedNewPassword = await hashPassword(newPassword);
      const result = await db.runAsync(
        "UPDATE users SET password = ? WHERE id = ?",
        [hashedNewPassword, adminId]
      );

      if (result.changes === 0) {
        return res.status(400).json({
          success: false,
          message: "Failed to update password",
        });
      }

      res.json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      console.error("Change password error:", error);
      next(error);
    }
  },

  async getSystemSettings(req, res, next) {
    try {
      console.log("[Admin] Fetching system settings from database...");

      const defaultSettings = {
        systemSettings: {
          sessionTimeout: 30,
          maxLoginAttempts: 5,
          emailNotifications: true,
          smsNotifications: false,
        },
        loanSettings: {
          autoApproveLimit: 100000,
          interestRates: {
            personal: 10.5,
            home: 8.5,
            car: 9.0,
            education: 7.5,
            business: 12.0,
          },
        },
      };

      try {
        const settings = await db.allAsync(
          `SELECT setting_key, setting_value FROM system_settings 
                 WHERE setting_key IN ('system_settings', 'loan_interest_rates')`
        );

        settings.forEach((setting) => {
          if (
            setting.setting_key === "loan_interest_rates" &&
            setting.setting_value
          ) {
            const loanRates = JSON.parse(setting.setting_value);
            defaultSettings.loanSettings.interestRates = {
              ...defaultSettings.loanSettings.interestRates,
              ...loanRates,
            };
          }
        });

        console.log("[Admin] Settings loaded from database");
      } catch (dbError) {
        console.log("[Admin] Using default settings (database error)");
      }

      res.json({
        success: true,
        data: defaultSettings,
      });
    } catch (error) {
      console.error(" [Admin] Error fetching system settings:", error);
      next(error);
    }
  },

  async updateSystemSettings(req, res, next) {
    try {
      const { settings } = req.body;
      console.log("🔧 [Admin] Updating system settings:", settings);

      res.json({
        success: true,
        message: "System settings updated successfully",
        data: { settings },
      });
    } catch (error) {
      console.error(" [Admin] Error updating system settings:", error);
      next(error);
    }
  },

  async updateLoanSettings(req, res, next) {
    try {
      const { autoApproveLimit, interestRates } = req.body;
      const adminId = req.user.id;

      console.log(" [Admin] Saving loan settings to database:", {
        autoApproveLimit,
        interestRates,
        adminId,
      });

      const result = await db.runAsync(
        `INSERT INTO system_settings (setting_key, setting_value, description, updated_by) 
             VALUES ('loan_interest_rates', ?, 'Loan interest rates configuration', ?) 
             ON CONFLICT(setting_key) DO UPDATE SET 
                setting_value = ?, 
                description = 'Loan interest rates configuration',
                updated_by = ?,
                updated_at = CURRENT_TIMESTAMP`,
        [
          JSON.stringify(interestRates),
          adminId,
          JSON.stringify(interestRates),
          adminId,
        ]
      );

      console.log("[Admin] Loan settings saved to database successfully");

      res.json({
        success: true,
        message: "Loan settings saved successfully",
        data: {
          loanSettings: {
            autoApproveLimit,
            interestRates,
          },
        },
      });
    } catch (error) {
      console.error("[Admin] Error saving loan settings to database:", error);
      next(error);
    }
  },

  async getInterestRates(req, res, next) {
    try {
      console.log("[Public] Fetching interest rates from database...");

      const settings = await db.getAsync(
        `SELECT setting_value FROM system_settings WHERE setting_key = 'loan_interest_rates'`
      );

      if (settings && settings.setting_value) {
        const dbRates = JSON.parse(settings.setting_value);
        console.log(" [Public] Using rates from database:", dbRates);

        return res.json({
          success: true,
          data: {
            interestRates: dbRates,
          },
        });
      }

      const defaultRates = {
        personal: 10.5,
        home: 8.5,
        car: 9.0,
        education: 7.5,
        business: 12.0,
      };

      console.log("[Public] No rates in database, using defaults");
      res.json({
        success: true,
        data: {
          interestRates: defaultRates,
        },
      });
    } catch (error) {
      console.error("[Public] Error fetching interest rates:", error);
      res.json({
        success: true,
        data: {
          interestRates: {
            personal: 10.5,
            home: 8.5,
            car: 9.0,
            education: 7.5,
            business: 12.0,
          },
        },
      });
    }
  },

  async getUserLoans(req, res, next) {
    try {
      const { id } = req.params;
      console.log("[Admin] Fetching loans for user:", id);

      const loans = await db.allAsync(
        `SELECT * FROM loans WHERE user_id = ? ORDER BY applied_date DESC`,
        [id]
      );

      res.json({
        success: true,
        data: {
          loans: loans || [],
        },
      });
    } catch (error) {
      console.error(" [Admin] Error fetching user loans:", error);
      next(error);
    }
  },

  async verifyAdminAccess(req, res, next) {
    try {
      const adminId = req.user.id;

      const user = await db.getAsync("SELECT role FROM users WHERE id = ?", [
        adminId,
      ]);

      if (!user || user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Admin access required",
        });
      }

      next();
    } catch (error) {
      console.error("Admin verification error:", error);
      return res.status(500).json({
        success: false,
        message: "Error verifying admin access",
      });
    }
  },
};

module.exports = adminController;
