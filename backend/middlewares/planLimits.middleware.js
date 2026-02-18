/**
 * Plan Limit Enforcement Middleware
 * Checks if institute has reached limits based on their plan
 */

const { Institute, Plan, Student, User, Class } = require("../models");
const { Op } = require("sequelize");

/**
 * Check if institute can add more students
 */
const checkStudentLimit = async (req, res, next) => {
    try {
        const institute_id = req.user.institute_id;

        // Get institute with plan
        const institute = await Institute.findByPk(institute_id, {
            include: [{ model: Plan }]
        });

        if (!institute || !institute.Plan) {
            return res.status(400).json({
                success: false,
                message: "Institute or plan not found"
            });
        }

        // Count current students
        const studentCount = await Student.count({
            where: { institute_id }
        });

        // Check limit
        if (studentCount >= institute.Plan.max_students) {
            return res.status(403).json({
                success: false,
                message: `Student limit reached! Your ${institute.Plan.name} plan allows up to ${institute.Plan.max_students} students. Please upgrade your plan.`,
                limit_reached: true,
                current_count: studentCount,
                max_limit: institute.Plan.max_students,
                upgrade_required: true
            });
        }

        next();
    } catch (error) {
        console.error("Error checking student limit:", error);
        res.status(500).json({
            success: false,
            message: "Error checking student limit"
        });
    }
};

/**
 * Check if institute can add more faculty
 */
const checkFacultyLimit = async (req, res, next) => {
    try {
        const institute_id = req.user.institute_id;

        const institute = await Institute.findByPk(institute_id, {
            include: [{ model: Plan }]
        });

        if (!institute || !institute.Plan) {
            return res.status(400).json({
                success: false,
                message: "Institute or plan not found"
            });
        }

        // Count current faculty
        const facultyCount = await User.count({
            where: {
                institute_id,
                role: 'faculty'
            }
        });

        if (facultyCount >= institute.Plan.max_faculty) {
            return res.status(403).json({
                success: false,
                message: `Faculty limit reached! Your ${institute.Plan.name} plan allows up to ${institute.Plan.max_faculty} faculty members. Please upgrade your plan.`,
                limit_reached: true,
                current_count: facultyCount,
                max_limit: institute.Plan.max_faculty,
                upgrade_required: true
            });
        }

        next();
    } catch (error) {
        console.error("Error checking faculty limit:", error);
        res.status(500).json({
            success: false,
            message: "Error checking faculty limit"
        });
    }
};

/**
 * Check if institute can add more classes
 */
const checkClassLimit = async (req, res, next) => {
    try {
        const institute_id = req.user.institute_id;

        const institute = await Institute.findByPk(institute_id, {
            include: [{ model: Plan }]
        });

        if (!institute || !institute.Plan) {
            return res.status(400).json({
                success: false,
                message: "Institute or plan not found"
            });
        }

        // Count current classes
        const classCount = await Class.count({
            where: { institute_id }
        });

        if (classCount >= institute.Plan.max_classes) {
            return res.status(403).json({
                success: false,
                message: `Class limit reached! Your ${institute.Plan.name} plan allows up to ${institute.Plan.max_classes} classes. Please upgrade your plan.`,
                limit_reached: true,
                current_count: classCount,
                max_limit: institute.Plan.max_classes,
                upgrade_required: true
            });
        }

        next();
    } catch (error) {
        console.error("Error checking class limit:", error);
        res.status(500).json({
            success: false,
            message: "Error checking class limit"
        });
    }
};

/**
 * Check if institute can add more admin users
 */
const checkAdminUserLimit = async (req, res, next) => {
    try {
        const institute_id = req.user.institute_id;

        const institute = await Institute.findByPk(institute_id, {
            include: [{ model: Plan }]
        });

        if (!institute || !institute.Plan) {
            return res.status(400).json({
                success: false,
                message: "Institute or plan not found"
            });
        }

        // Count current admin users
        const adminCount = await User.count({
            where: {
                institute_id,
                role: 'admin'
            }
        });

        if (adminCount >= institute.Plan.max_admin_users) {
            return res.status(403).json({
                success: false,
                message: `Admin user limit reached! Your ${institute.Plan.name} plan allows up to ${institute.Plan.max_admin_users} admin users. Please upgrade your plan.`,
                limit_reached: true,
                current_count: adminCount,
                max_limit: institute.Plan.max_admin_users,
                upgrade_required: true
            });
        }

        next();
    } catch (error) {
        console.error("Error checking admin user limit:", error);
        res.status(500).json({
            success: false,
            message: "Error checking admin user limit"
        });
    }
};

/**
 * Check if institute has access to a feature
 */
const checkFeatureAccess = (featureName) => {
    return async (req, res, next) => {
        try {
            const institute_id = req.user.institute_id;

            const institute = await Institute.findByPk(institute_id, {
                include: [{ model: Plan }]
            });

            if (!institute || !institute.Plan) {
                return res.status(400).json({
                    success: false,
                    message: "Institute or plan not found"
                });
            }

            const plan = institute.Plan;

            // Check if feature is enabled
            let hasAccess = false;

            switch (featureName) {
                case 'fees':
                    hasAccess = plan.feature_fees === true;
                    break;
                case 'reports':
                    hasAccess = plan.feature_reports !== 'none';
                    break;
                case 'announcements':
                    hasAccess = plan.feature_announcements === true;
                    break;
                case 'export':
                    hasAccess = plan.feature_export === true;
                    break;
                case 'whatsapp':
                    hasAccess = plan.feature_whatsapp === true;
                    break;
                case 'custom_branding':
                    hasAccess = plan.feature_custom_branding === true;
                    break;
                case 'multi_branch':
                    hasAccess = plan.feature_multi_branch === true;
                    break;
                case 'api_access':
                    hasAccess = plan.feature_api_access === true;
                    break;
                default:
                    hasAccess = true; // Unknown features are allowed by default
            }

            if (!hasAccess) {
                return res.status(403).json({
                    success: false,
                    message: `This feature is not available in your ${plan.name} plan. Please upgrade to access ${featureName}.`,
                    feature_locked: true,
                    current_plan: plan.name,
                    upgrade_required: true
                });
            }

            next();
        } catch (error) {
            console.error("Error checking feature access:", error);
            res.status(500).json({
                success: false,
                message: "Error checking feature access"
            });
        }
    };
};

/**
 * Get current usage and limits for institute
 */
const getUsageStats = async (req, res) => {
    try {
        const institute_id = req.user.institute_id;

        const institute = await Institute.findByPk(institute_id, {
            include: [{ model: Plan }]
        });

        if (!institute || !institute.Plan) {
            return res.status(400).json({
                success: false,
                message: "Institute or plan not found"
            });
        }

        // Get current counts
        const [studentCount, facultyCount, classCount, adminCount] = await Promise.all([
            Student.count({ where: { institute_id } }),
            User.count({ where: { institute_id, role: 'faculty' } }),
            Class.count({ where: { institute_id } }),
            User.count({ where: { institute_id, role: 'admin' } })
        ]);

        const plan = institute.Plan;

        res.json({
            success: true,
            data: {
                plan: {
                    name: plan.name,
                    price: plan.price
                },
                usage: {
                    students: {
                        current: studentCount,
                        limit: plan.max_students,
                        percentage: Math.round((studentCount / plan.max_students) * 100),
                        remaining: plan.max_students - studentCount
                    },
                    faculty: {
                        current: facultyCount,
                        limit: plan.max_faculty,
                        percentage: Math.round((facultyCount / plan.max_faculty) * 100),
                        remaining: plan.max_faculty - facultyCount
                    },
                    classes: {
                        current: classCount,
                        limit: plan.max_classes,
                        percentage: Math.round((classCount / plan.max_classes) * 100),
                        remaining: plan.max_classes - classCount
                    },
                    admin_users: {
                        current: adminCount,
                        limit: plan.max_admin_users,
                        percentage: Math.round((adminCount / plan.max_admin_users) * 100),
                        remaining: plan.max_admin_users - adminCount
                    }
                },
                features: {
                    fees: plan.feature_fees,
                    reports: plan.feature_reports,
                    announcements: plan.feature_announcements,
                    export: plan.feature_export,
                    whatsapp: plan.feature_whatsapp,
                    custom_branding: plan.feature_custom_branding,
                    multi_branch: plan.feature_multi_branch
                }
            }
        });
    } catch (error) {
        console.error("Error getting usage stats:", error);
        res.status(500).json({
            success: false,
            message: "Error getting usage stats"
        });
    }
};

module.exports = {
    checkStudentLimit,
    checkFacultyLimit,
    checkClassLimit,
    checkAdminUserLimit,
    checkFeatureAccess,
    getUsageStats
};
