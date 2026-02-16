
// // Instead of checking from institutes table directly,
// // Better check from subscriptions table.

// const { Institute } = require("../models");

// const checkSubscription = async (req, res, next) => {
//     try {
//         const instituteId = req.user.institute_id;

//         if (!instituteId) {
//             return res.status(400).json({ error: "Institute not found" });
//         }

//         const institute = await Institute.findByPk(instituteId);

//         if (!institute) {
//             return res.status(404).json({ error: "Institute does not exist" });
//         }

//         const today = new Date();
//         const subscriptionEnd = new Date(institute.subscription_end);

//         if (subscriptionEnd < today || institute.status !== "active") {
//             return res.status(403).json({
//                 error: "Subscription expired. Please renew your plan.",
//             });
//         }

//         next();
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// module.exports = checkSubscription;



const { Subscription } = require("../models");

const checkSubscription = async (req, res, next) => {
    try {
        const instituteId = req.user.institute_id;

        const subscription = await Subscription.findOne({
            where: { institute_id: instituteId },
            order: [["end_date", "DESC"]],
        });

        if (!subscription) {
            return res.status(403).json({
                error: "No subscription found.",
            });
        }

        const today = new Date();
        const endDate = new Date(subscription.end_date);

        if (
            subscription.payment_status !== "paid" ||
            endDate < today
        ) {
            return res.status(403).json({
                error: "Subscription expired or unpaid.",
            });
        }

        next();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = checkSubscription;

