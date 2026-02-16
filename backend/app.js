/**
 * Main Application File
 * Configures Express server with middleware, routes, and error handling
 * Implements multi-tenant SaaS architecture for coaching institutes
 */

const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// ============================================
// GLOBAL MIDDLEWARE SETUP
// ============================================

/**
 * CORS Configuration
 * Allows cross-origin requests from frontend
 */
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
}));

/**
 * Body Parsers
 * Parse JSON and URL-encoded data
 */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/**
 * Static Files
 * Serve uploaded files
 */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/**
 * Request Logger Middleware
 * Logs all incoming requests with timestamp
 */
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// ============================================
// API ROUTES
// ============================================

/**
 * Health Check Endpoint
 * Returns server status
 */
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🎓 Student SaaS API is running",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

/**
 * API Routes
 * All routes are prefixed with /api
 */
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/superadmin", require("./routes/superadmin.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/institutes", require("./routes/institute.routes"));
app.use("/api/students", require("./routes/student.routes"));
app.use("/api/faculty", require("./routes/faculty.routes"));
app.use("/api/classes", require("./routes/class.routes"));
app.use("/api/subjects", require("./routes/subject.routes"));
app.use("/api/attendance", require("./routes/attendance.routes"));
app.use("/api/exams", require("./routes/exam.routes"));
app.use("/api/fees", require("./routes/fees.routes"));
app.use("/api/announcements", require("./routes/announcement.routes"));
app.use("/api/subscriptions", require("./routes/subscription.routes"));
app.use("/api/payment", require("./routes/payment.routes"));
app.use("/api/invoice", require("./routes/invoice.routes"));
app.use("/api/webhook", require("./routes/webhook.routes"));

// ============================================
// 404 HANDLER
// ============================================

/**
 * Handle undefined routes
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.url,
  });
});

// ============================================
// GLOBAL ERROR HANDLER
// ============================================

/**
 * Central Error Handling Middleware
 * Catches all errors and returns standardized response
 */
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);

  // Sequelize validation errors
  if (err.name === "SequelizeValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: err.errors.map((e) => ({
        field: e.path,
        message: e.message,
      })),
    });
  }

  // Sequelize unique constraint errors
  if (err.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({
      success: false,
      message: "Duplicate entry",
      field: err.errors[0]?.path,
    });
  }

  // JWT errors
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

  // Default error response
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// ============================================
// DATABASE SYNCHRONIZATION
// ============================================

/**
 * Sync database models
 * Creates tables if they don't exist
 * Use { alter: true } in development, { force: false } in production
 */
const { sequelize } = require("./models");

const syncDatabase = async () => {
  try {
    // Test database connection first
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully");

    // Disable foreign key checks
    // await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");

    // Use { alter: true } to update existing tables without dropping data
    // Use { force: true } to drop and recreate tables (WARNING: deletes all data)
    await sequelize.sync({ alter: false });
    console.log("✅ Database synchronized successfully");
  } catch (error) {
    console.error("❌ Database error:", error.message);
    console.error("Please ensure MySQL is running and database 'student_saas' exists");
  }
};

// Sync database on startup
syncDatabase();

module.exports = app;
