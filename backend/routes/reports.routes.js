/**
 * Reports Routes
 * Implements role-based and plan-based access control for reports
 */

const express = require("express");
const router = express.Router();
const reportsController = require("../controllers/reports.controller");
const verifyToken = require("../middlewares/auth.middleware");
const allowRoles = require("../middlewares/role.middleware");
const checkFeatureAccess = require("../middlewares/checkFeatureAccess");
const checkSubscription = require("../middlewares/subscription.middleware");

// Institute-level reports (require feature_reports)
router.use(verifyToken, checkSubscription);

// Dashboard analytics
router.get("/dashboard", allowRoles("admin", "faculty"), checkFeatureAccess("feature_reports"), reportsController.getDashboardAnalytics);

// Attendance reports
router.get("/attendance", allowRoles("admin", "faculty"), checkFeatureAccess("feature_reports"), reportsController.getAttendanceReport);

// Fees reports
router.get("/fees", allowRoles("admin"), checkFeatureAccess("feature_reports"), reportsController.getFeesReport);

// Student performance report
router.get("/student-performance/:student_id", allowRoles("admin", "faculty", "student"), checkFeatureAccess("feature_reports"), reportsController.getStudentPerformanceReport);

// Class performance report
router.get("/class-performance/:class_id", allowRoles("admin", "faculty"), checkFeatureAccess("feature_reports"), reportsController.getClassPerformanceReport);

// Monthly trends
router.get("/monthly-trends", allowRoles("admin"), checkFeatureAccess("feature_reports"), reportsController.getMonthlyTrends);

// Super admin analytics (no feature check needed)
router.get("/super-admin/analytics", allowRoles("super_admin"), reportsController.getSuperAdminAnalytics);

module.exports = router;
