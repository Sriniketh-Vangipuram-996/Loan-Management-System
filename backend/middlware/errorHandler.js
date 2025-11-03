const errorHandler = (err, req, res, next) => {
  console.error(" Error:", err);

  // SQLite duplicate entry error (UNIQUE constraint failed)
  if (
    err.code === "SQLITE_CONSTRAINT_UNIQUE" ||
    err.message.includes("UNIQUE constraint failed")
  ) {
    return res.status(409).json({
      success: false,
      message: "Email already registered",
    });
  }

  // SQLite duplicate entry error (for MySQL compatibility)
  if (err.code === "ER_DUP_ENTRY") {
    return res.status(409).json({
      success: false,
      message: "Email already registered",
    });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired",
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
};

module.exports = errorHandler;
