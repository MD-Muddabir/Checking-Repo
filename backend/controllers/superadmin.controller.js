const { Institute, Subscription, Plan } = require("../models");
const { Op } = require("sequelize");
const { Subscription, Institute, Plan } = require("../models");
const { Op, fn, col } = require("sequelize");

exports.getDashboardStats = async (req, res) => {
    try {
        const totalInstitutes = await Institute.count();

        const activeInstitutes = await Institute.count({
            where: { status: "active" },
        });

        const expiredInstitutes = await Institute.count({
            where: { status: "expired" },
        });

        // 🔥 Proper Revenue Calculation
        const paidSubscriptions = await Subscription.findAll({
            where: { payment_status: "paid" },
            include: [{ model: Plan }],
        });

        // Extra: Total Revenue Calculation (All Time)
        Subscription.sum("amount_paid", {
            where: { payment_status: "paid" }
        });
        let totalRevenue = 0;

        paidSubscriptions.forEach((sub) => {
            if (sub.Plan) {
                totalRevenue += parseFloat(sub.Plan.price);
            }
        });

        res.json({
            totalInstitutes,
            activeInstitutes,
            expiredInstitutes,
            totalRevenue,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// // Add Monthly Revenue Calculation (Advanced)

// const currentMonth = new Date().getMonth();
// const currentYear = new Date().getFullYear();

// const monthlySubscriptions = await Subscription.findAll({
//     where: {
//         payment_status: "paid",
//         start_date: {
//             [Op.gte]: new Date(currentYear, currentMonth, 1),
//         },
//     },
//     include: [{ model: Plan }],
// });

// let monthlyRevenue = 0;

// monthlySubscriptions.forEach((sub) => {
//     monthlyRevenue += parseFloat(sub.Plan.price);
// });


exports.getAllInstitutes = async (req, res) => {
    try {
        const institutes = await Institute.findAll({
            include: [{ model: Plan }],
        });

        res.json(institutes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateInstituteStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        await Institute.update(
            { status },
            { where: { id } }
        );

        res.json({ message: "Institute status updated" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.upgradePlan = async (req, res) => {
    try {
        const { instituteId } = req.params;
        const { newPlanId, durationMonths } = req.body;

        const institute = await Institute.findByPk(instituteId);
        if (!institute) {
            return res.status(404).json({ error: "Institute not found" });
        }

        const newPlan = await Plan.findByPk(newPlanId);
        if (!newPlan) {
            return res.status(404).json({ error: "Plan not found" });
        }

        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + durationMonths);

        // Create new subscription
        await Subscription.create({
            institute_id: instituteId,
            plan_id: newPlanId,
            start_date: startDate,
            end_date: endDate,
            payment_status: "paid",
            amount_paid: newPlan.price,
        });

        // Update institute current plan
        await institute.update({
            plan_id: newPlanId,
            subscription_start: startDate,
            subscription_end: endDate,
            status: "active",
        });

        res.json({
            message: "Plan upgraded successfully",
            newPlan: newPlan.name,
            validTill: endDate,
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAnalytics = async (req, res) => {
    try {

        // Monthly Revenue
        const monthlyRevenue = await Subscription.findAll({
            attributes: [
                [fn("MONTH", col("start_date")), "month"],
                [fn("SUM", col("amount_paid")), "totalRevenue"]
            ],
            where: { payment_status: "paid" },
            group: [fn("MONTH", col("start_date"))],
            order: [[fn("MONTH", col("start_date")), "ASC"]]
        });

        // Plan Distribution
        const planDistribution = await Subscription.findAll({
            attributes: [
                "plan_id",
                [fn("COUNT", col("plan_id")), "count"]
            ],
            group: ["plan_id"]
        });

        // Active vs Expired Institutes
        const activeCount = await Institute.count({ where: { status: "active" } });
        const expiredCount = await Institute.count({ where: { status: "expired" } });

        res.json({
            monthlyRevenue,
            planDistribution,
            instituteStatus: {
                active: activeCount,
                expired: expiredCount
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};