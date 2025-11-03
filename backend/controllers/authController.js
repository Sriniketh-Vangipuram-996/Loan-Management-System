const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { hashPassword, comparePassword } = require("../utils/passwordHash");
const jwtConfig = require("../config/jwt");

const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    jwtConfig.secret,
    {
      expiresIn: jwtConfig.expiresIn,
      issuer: jwtConfig.issuer,
    }
  );
};

const authController = {
  async register(req, res, next) {
    try {
      console.log("📨 Registration request received:", req.body);

      const {
        firstName,
        lastName,
        email,
        password,
        phone,
        occupation,
        annualIncome,
      } = req.body;

      req.body.name = `${firstName} ${lastName}`.trim();

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      console.log(
        " Existing user check:",
        existingUser ? "User exists" : "No user found"
      );

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Email already registered",
        });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);
      console.log("Password hashed successfully");

      const userData = {
        name: req.body.name,
        email: email,
        password: hashedPassword,
        phone: phone,
        occupation: occupation,
        annualIncome: annualIncome,
        dateOfBirth: null,
        address: null,
      };

      console.log("Creating user with data:", userData);

      const userId = await User.create(userData);
      console.log("User created with ID:", userId);

      // Get created user
      const user = await User.findById(userId);
      console.log(" User retrieved:", user);

      // Generate token
      const token = generateToken(user);

      res.status(201).json({
        success: true,
        message: "Registration successful",
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
          },
          token,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      next(error);
    }
  },

  // Customer login
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      const token = generateToken(user);

      res.json({
        success: true,
        message: "Login successful",
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
          },
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Admin login
  async adminLogin(req, res, next) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findByEmail(email);
      if (!user || user.role !== "admin") {
        return res.status(401).json({
          success: false,
          message: "Invalid admin credentials",
        });
      }

      // Check password
      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Invalid admin credentials",
        });
      }

      // Generate token
      const token = generateToken(user);

      res.json({
        success: true,
        message: "Admin login successful",
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Get current user
  async getCurrentUser(req, res, next) {
    try {
      const user = await User.findById(req.user.id);

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            occupation: user.occupation,
            annualIncome: user.annual_income,
            dateOfBirth: user.date_of_birth,
            address: user.address,
            createdAt: user.created_at,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Logout
  async logout(req, res, next) {
    try {
      res.json({
        success: true,
        message: "Logout successful",
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = authController;
