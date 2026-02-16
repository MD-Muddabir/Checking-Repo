const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/auth.middleware");
const allowRoles = require("../middlewares/role.middleware");
const adminController = require("../controllers/admin.controller");

router.get(
    "/stats",
    verifyToken,
    allowRoles("admin"),
    adminController.getDashboardStats
);

module.exports = router;
