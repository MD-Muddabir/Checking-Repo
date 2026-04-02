const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

const verifyToken = require("../middlewares/auth.middleware");

router.post("/register", authController.register);
router.post("/register-institute", authController.registerInstitute);
router.post("/login", authController.login);
router.post("/change-password", verifyToken, authController.changePassword);
router.get("/profile", verifyToken, authController.getProfile);
router.put("/profile", verifyToken, authController.updateProfile);
router.put("/theme", verifyToken, authController.saveTheme);   // ← Phase 2: save theme to DB
router.post("/logout", authController.logout);

const sequelize = require("../config/database");

// Add this route
router.get("/test-db", async (req, res) => {
    try {
        await sequelize.authenticate();
        const [tables] = await sequelize.query("SHOW TABLES");
        const [dbInfo] = await sequelize.query("SELECT DATABASE() as current_db");

        res.json({
            success: true,
            message: "Database connected successfully",
            database: dbInfo[0].current_db,
            tables: tables.map(t => Object.values(t)[0])
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});


module.exports = router;
