const authService = require("../services/auth.service");
const generateToken = require("../utils/generateToken");

/**
 * Register a new institute
 * Creates institute and admin user
 */
exports.register = async (req, res) => {
    try {
        const result = await authService.registerInstitute(req.body);

        // TODO: Send welcome email (emailService not configured yet)
        // const emailService = require("../services/email.service");
        // await emailService.sendEmail(...)

        res.status(201).json({
            success: true,
            message: "Institute registered successfully",
            data: {
                instituteName: result.institute.name,
                email: result.institute.email,
            },
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Registration failed"
        });
    }
};

/**
 * Login user
 * Returns JWT token and user info
 */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await authService.loginUser(email, password);
        const token = generateToken(user);

        res.json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                institute_id: user.institute_id,
                institute_name: user.Institute?.name
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(401).json({
            success: false,
            message: error.message || "Login failed"
        });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.user.id;

        await authService.changePassword(userId, oldPassword, newPassword);

        res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.logout = (req, res) => {
    res.status(200).json({
        success: true,
        message: "Logged out successfully"
    });
};
