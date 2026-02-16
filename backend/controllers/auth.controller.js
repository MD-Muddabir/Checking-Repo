const authService = require("../services/auth.service");
const generateToken = require("../utils/generateToken");


exports.register = async (req, res) => {
    try {
        const result = await authService.registerInstitute(req.body);

        await emailService.sendEmail(
            req.body.email,
            "Welcome to Student SaaS",
            `
      <h2>Welcome ${req.body.instituteName}</h2>
      <p>Your institute account has been created successfully.</p>
      <p>Please login and activate your subscription.</p>
      `
        );

        res.status(201).json({
            message: "Institute registered successfully",
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await authService.loginUser(email, password);

        const token = generateToken(user);

        res.json({
            token,
            user: {
                id: user.id,
                role: user.role,
                institute_id: user.institute_id,
            },
        });
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
};
