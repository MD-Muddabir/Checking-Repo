/**
 * Faculty Salary Routes
 * Handles monthly salary CRUD, payment marking, and salary reports
 */

const express = require("express");
const router = express.Router();
const salaryCtrl = require("../controllers/facultySalary.controller");
const verifyToken = require("../middlewares/auth.middleware");

// All routes require authentication
router.use(verifyToken);

// ── Strict Admin-only guard (manager is explicitly blocked) ──────────────────
const adminOnly = (req, res, next) => {
    if (req.user.role !== "admin" && req.user.role !== "super_admin") {
        return res.status(403).json({
            success: false,
            message: "Access denied: Salary management is only available to Admin users."
        });
    }
    next();
};
router.use(adminOnly);

// Create a salary record
router.post("/", salaryCtrl.createSalary);

// Get all salary records (filterable by month_year, faculty_id, status)
router.get("/", salaryCtrl.getAllSalaries);

// Monthly salary report / summary
router.get("/report", salaryCtrl.getSalaryMonthReport);

// Mark salary as paid
router.put("/:id/pay", salaryCtrl.paySalary);

// Update salary record (correct values before payment)
router.put("/:id", salaryCtrl.updateSalary);

// Delete salary record (only pending/on_hold)
router.delete("/:id", salaryCtrl.deleteSalary);

module.exports = router;
