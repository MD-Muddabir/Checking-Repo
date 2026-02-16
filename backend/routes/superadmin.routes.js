const express = require("express");
const router = express.Router();

const verifyToken = require("../middlewares/auth.middleware");
const allowRoles = require("../middlewares/role.middleware");

const controller = require("../controllers/superadmin.controller");

router.get(
    "/dashboard",
    verifyToken,
    allowRoles("super_admin"),
    controller.getDashboardStats
);

router.get(
    "/analytics",
    verifyToken,
    allowRoles("super_admin"),
    controller.getAnalytics
);

router.post(
    "/institutes/:instituteId/upgrade",
    verifyToken,
    allowRoles("super_admin"),
    controller.upgradePlan
);

router.get(
    "/institutes",
    verifyToken,
    allowRoles("super_admin"),
    controller.getAllInstitutes
);

router.put(
    "/institutes/:id/status",
    verifyToken,
    allowRoles("super_admin"),
    controller.updateInstituteStatus
);

module.exports = router;
