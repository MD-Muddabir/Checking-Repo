const { Institute, Plan } = require("../models");

/**
 * Middleware to check if the institute's plan includes a specific feature.
 * @param {string} featureName - The name of the feature column in the Plan model (e.g., 'feature_attendance')
 */
const checkFeatureAccess = (featureName) => {
    return async (req, res, next) => {
        try {
            // Skip check for super admins
            if (req.user.role === "super_admin") {
                return next();
            }

            const institute_id = req.user.institute_id;

            if (!institute_id) {
                return res.status(403).json({
                    success: false,
                    message: "Institute ID missing."
                });
            }

            const institute = await Institute.findByPk(institute_id, {
                include: [{ model: Plan }]
            });

            if (!institute || !institute.Plan) {
                return res.status(403).json({
                    success: false,
                    message: "No active plan found for this institute."
                });
            }

            // Check if feature is enabled in the plan
            const featureValue = institute.Plan[featureName];

            // Handle Boolean (true/false)
            let isAllowed = featureValue === true;

            // Handle Enum/String (e.g. 'none', 'basic', 'advanced')
            if (typeof featureValue === 'string' && featureValue !== 'none') {
                isAllowed = true;
            }

            if (!isAllowed) {
                return res.status(403).json({
                    success: false,
                    message: `Upgrade Required: Your current plan does not include ${featureName.replace("feature_", "").toUpperCase()}. Please upgrade your subscription.`
                });
            }

            next();
        } catch (error) {
            console.error("Feature Access Check Error:", error);
            res.status(500).json({ success: false, message: "Internal Server Error checking plan features." });
        }
    };
};

module.exports = checkFeatureAccess;
