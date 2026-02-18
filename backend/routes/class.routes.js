/**
 * Class Routes
 * Defines API endpoints for class management
 */

const express = require("express");
const router = express.Router();
const classController = require("../controllers/class.controller");
const verifyToken = require("../middlewares/auth.middleware");
const allowRoles = require("../middlewares/role.middleware");

const { checkClassLimit } = require("../middlewares/planLimits.middleware");
const checkSubscription = require("../middlewares/subscription.middleware");

// Create Class - Check Limits
router.post("/", verifyToken, checkSubscription, allowRoles("admin"), checkClassLimit, classController.createClass);

// Other Routes
router.get("/", verifyToken, checkSubscription, allowRoles("admin", "faculty"), classController.getAllClasses);
router.get("/:id", verifyToken, checkSubscription, allowRoles("admin", "faculty"), classController.getClassById);
router.put("/:id", verifyToken, checkSubscription, allowRoles("admin"), classController.updateClass);
router.delete("/:id", verifyToken, checkSubscription, allowRoles("admin"), classController.deleteClass);

module.exports = router;
