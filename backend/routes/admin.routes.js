const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/auth.middleware");
const allowRoles = require("../middlewares/role.middleware");
const adminController = require("../controllers/admin.controller");
const checkSubscription = require("../middlewares/subscription.middleware");

const { getUsageStats } = require("../middlewares/planLimits.middleware");

// Dashboard Stats
router.get(
    "/stats",
    verifyToken,
    checkSubscription,
    allowRoles("admin"),
    adminController.getDashboardStats
);

// Plan Usage Stats
router.get(
    "/usage",
    verifyToken,
    checkSubscription,
    allowRoles("admin"),
    getUsageStats
);

module.exports = router;
