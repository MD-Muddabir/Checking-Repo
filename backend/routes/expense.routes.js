const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/auth.middleware");
const allowRoles = require("../middlewares/role.middleware");
const expenseController = require("../controllers/expense.controller");

// All routes require auth
router.use(verifyToken);

// Helper: check if manager has expense permission
const requireExpensePerm = (action) => (req, res, next) => {
    const { role, permissions } = req.user;
    if (role === "admin" || role === "super_admin") return next();
    if (role === "manager") {
        const hasPerm = permissions && (
            permissions.includes("expenses") ||
            permissions.includes(`expenses.${action}`)
        );
        if (hasPerm) return next();
    }
    return res.status(403).json({ success: false, message: "Access denied" });
};

// GET all expenses — admin, super_admin, manager with expenses.read
router.get("/", requireExpensePerm("read"), expenseController.getExpenses);

// GET expense stats — admin, super_admin, manager with expenses.read
router.get("/stats", requireExpensePerm("read"), expenseController.getExpenseStats);

// POST add expense — admin, super_admin, manager with expenses.create
router.post("/", requireExpensePerm("create"), expenseController.addExpense);

// DELETE expense — admin, super_admin, manager with expenses.delete
router.delete("/:id", requireExpensePerm("delete"), expenseController.deleteExpense);

module.exports = router;
