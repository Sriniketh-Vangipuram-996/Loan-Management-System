const jwt = require("jsonwebtoken");
const db = require("../config/database");
const jwtConfig = require("../config/jwt");

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    console.log("[Auth] Token verification started:", {
      hasToken: !!token,
      path: req.path,
      method: req.method,
    });

    if (!token) {
      console.log("[Auth] No token provided");
      return res.status(401).json({
        success: false,
        message: "Access token required",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(" [Auth] Token decoded:", { userId: decoded.userId });

    const user = await db.getAsync(
      "SELECT id, email, role, name FROM users WHERE id = ?",
      [decoded.userId]
    );

    if (!user) {
      console.log("[Auth] User not found in database");
      return res.status(401).json({
        success: false,
        message: "User no longer exists",
      });
    }

    console.log("[Auth] User from database:", {
      id: user.id,
      email: user.email,
      role: user.role,
    });

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    console.log(" [Auth] Authentication successful for role:", user.role);
    next();
  } catch (error) {
    console.error("[Auth] Token verification failed:", error.message);
    return res.status(403).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = { authenticateToken };
