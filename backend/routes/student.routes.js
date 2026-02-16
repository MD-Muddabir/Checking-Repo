const express = require("express");
const router = express.Router();

const verifyToken = require("../middlewares/auth.middleware");
const checkSubscription = require("../middlewares/subscription.middleware");
const allowRoles = require("../middlewares/role.middleware");

router.get(
    "/",
    verifyToken,
    checkSubscription,
    allowRoles("admin"),
    (req, res) => {
        res.json({ message: "Student data access granted" });
    }
);

module.exports = router;
