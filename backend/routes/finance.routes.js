/**
 * Finance Analytics Routes
 * Revenue summary, Profit & Loss, monthly trend charts, expense breakdown — Admin ONLY
 * CRITICAL SECURITY: Manager role MUST NOT access any of these endpoints.
 * Backend role check is mandatory — frontend hiding alone is not enough.
 */

const express = require("express");
const router = express.Router();
const analytics = require("../controllers/financeAnalytics.controller");
const verifyToken = require("../middlewares/auth.middleware");

// All routes require authentication
router.use(verifyToken);

// ── Strict Admin-only guard (manager is explicitly blocked) ──────────────────
const adminOnly = (req, res, next) => {
    if (req.user.role !== "admin" && req.user.role !== "super_admin") {
        return res.status(403).json({
            success: false,
            message: "Access denied: Finance analytics is only available to Admin users."
        });
    }
    next();
};
router.use(adminOnly);

// KPI Summary Cards: Total Revenue, Expenses, Salaries, P&L, Pending Fees
router.get("/revenue/summary", analytics.getRevenueSummary);

// 12-Month Trend Data: Revenue vs Expenses vs Salaries (for Bar/Line/Area charts)
router.get("/revenue/monthly-trend", analytics.getMonthlyTrend);

// Expense Breakdown by Category (for Pie chart)
router.get("/expense-by-category", analytics.getExpenseByCategory);

// Defaulter List: Students with overdue fees
router.get("/defaulters", analytics.getDefaulterList);

// Salary Report: Faculty salary overview for a given month
router.get("/salary/monthly", analytics.getSalaryReport);

module.exports = router;
