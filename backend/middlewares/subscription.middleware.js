const { Institute, Subscription } = require("../models");
const { Op } = require("sequelize");

const checkSubscription = async (req, res, next) => {
    try {
        // Skip for super admin
        if (req.user.role === 'super_admin') {
            return next();
        }

        const instituteId = req.user.institute_id;

        if (!instituteId) {
            return res.status(403).json({
                success: false,
                message: "No institute associated with this user"
            });
        }

        const institute = await Institute.findByPk(instituteId, {
            include: [{
                model: Subscription,
                order: [['createdAt', 'DESC']],
                limit: 1
            }]
        });

        if (!institute) {
            return res.status(404).json({
                success: false,
                message: "Institute not found"
            });
        }

        // Check if pending (Registration complete but payment pending)
        if (institute.status === 'pending') {
            return res.status(402).json({
                success: false,
                message: "Subscription pending payment",
                code: "PAYMENT_REQUIRED",
                redirect: "/checkout"
            });
        }

        // Check if suspended
        if (institute.status === 'suspended') {
            return res.status(403).json({
                success: false,
                message: "Account suspended. Please contact support."
            });
        }

        // Check expiry
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (institute.subscription_end && new Date(institute.subscription_end) < today) {
            // Auto-update status if not already updated (handled by cron/middleware lazily)
            if (institute.status !== 'expired') {
                await institute.update({ status: 'expired' });
            }

            return res.status(403).json({
                success: false,
                message: "Subscription expired",
                code: "SUBSCRIPTION_EXPIRED",
                redirect: "/renew-plan"
            });
        }

        // Attach latest subscription to request for feature checks
        req.subscription = institute.Subscriptions && institute.Subscriptions[0];
        req.institute = institute;

        next();
    } catch (error) {
        console.error("Subscription check error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error during subscription check"
        });
    }
};

module.exports = checkSubscription;
