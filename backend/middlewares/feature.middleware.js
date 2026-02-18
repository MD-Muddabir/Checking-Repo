/**
 * Feature Control Middleware (Phase 7)
 * Checks if current subscription plan allows access to specific features
 */
const { Plan, Institute, Subscription } = require("../models");

const featureBasedAccess = (featureName) => {
    return async (req, res, next) => {
        try {
            // Skip for super admin
            if (req.user.role === 'super_admin') {
                return next();
            }

            // Subscription middleware should have already attached this
            // But fetch if missing
            let institute = req.institute;
            if (!institute) {
                const instituteId = req.user.institute_id;
                institute = await Institute.findByPk(instituteId, {
                    include: [{ model: Subscription, limit: 1, order: [['createdAt', 'DESC']] }]
                });
            }

            if (!institute) {
                return res.status(403).json({ success: false, message: "Institute not found" });
            }

            // Get Plan
            const planId = institute.plan_id;
            const plan = await Plan.findByPk(planId);

            if (!plan) {
                return res.status(403).json({ success: false, message: "No active plan found" });
            }

            // Check feature
            const featureKey = `feature_${featureName}`;
            if (!plan[featureKey]) { // Boolean check
                return res.status(403).json({
                    success: false,
                    message: `Your current plan (${plan.name}) does not include ${featureName}. Please upgrade to access this feature.`,
                    upgradeRequired: true
                });
            }

            // Check limits if applicable (e.g. students)
            if (featureName === 'students' && plan.max_students) {
                // Count current students
                const studentCount = await institute.countStudents(); // Assuming association exists
                if (studentCount >= plan.max_students) {
                    return res.status(403).json({
                        success: false,
                        message: `Student limit reached (${plan.max_students}). Please upgrade to add more students.`,
                        upgradeRequired: true
                    });
                }
            }

            next();
        } catch (error) {
            console.error("Feature check error:", error);
            res.status(500).json({ success: false, message: "Internal server error checking features" });
        }
    };
};

module.exports = featureBasedAccess;
