const express = require("express");
const router = express.Router();
const assignmentController = require("../controllers/assignment.controller");
const verifyToken = require("../middlewares/auth.middleware");
const allowRoles = require("../middlewares/role.middleware");
const { uploadAssignment } = require("../utils/uploadAssignment");

// Faculty Routes
router.post("/", verifyToken, allowRoles("faculty"), uploadAssignment.single("reference_file"), assignmentController.createAssignment);
router.get("/", verifyToken, allowRoles("faculty"), assignmentController.getFacultyAssignments);
router.get("/:id", verifyToken, allowRoles("faculty", "admin", "owner", "manager"), assignmentController.getAssignmentDetails);
router.put("/:id", verifyToken, allowRoles("faculty"), assignmentController.updateAssignment);
router.patch("/:id/publish", verifyToken, allowRoles("faculty"), assignmentController.publishAssignment);
router.patch("/:id/close", verifyToken, allowRoles("faculty", "admin", "owner", "manager"), assignmentController.closeAssignment);
router.delete("/:id", verifyToken, allowRoles("faculty", "admin", "owner", "manager"), assignmentController.deleteAssignment);
router.get("/:id/submissions", verifyToken, allowRoles("faculty", "admin", "owner", "manager"), assignmentController.getSubmissions);

router.patch("/:asgId/submissions/:subId/grade", verifyToken, allowRoles("faculty"), assignmentController.gradeSubmission);
router.patch("/:asgId/submissions/:subId/request-resubmit", verifyToken, allowRoles("faculty"), assignmentController.requestResubmit);

// Student Routes
router.get("/student/all", verifyToken, allowRoles("student"), assignmentController.getStudentAssignments);
router.get("/student/:id", verifyToken, allowRoles("student"), assignmentController.getStudentAssignmentDetails);
router.post("/student/:id/submit", verifyToken, allowRoles("student"), uploadAssignment.single("submission_file"), assignmentController.submitAssignment);

// Admin Routes
router.get("/admin/all", verifyToken, allowRoles("admin", "owner", "manager", "super_admin"), assignmentController.getAdminAssignments);
router.get("/admin/stats", verifyToken, allowRoles("admin", "owner", "manager", "super_admin"), assignmentController.getAdminStats);
router.get("/admin/settings", verifyToken, allowRoles("owner", "admin", "manager"), assignmentController.getSettings);
router.put("/admin/settings", verifyToken, allowRoles("owner", "admin"), assignmentController.updateSettings);

// Parent Routes
router.get("/parent/child/:studentId", verifyToken, allowRoles("parent"), assignmentController.getParentAssignments);

module.exports = router;
