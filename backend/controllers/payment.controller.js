const razorpay = require("../config/razorpay");
const { Plan } = require("../models");
const { Subscription } = require("../models");

exports.createSubscription = async (req, res) => {
    try {
        const { planId } = req.body;

        const plan = await Plan.findByPk(planId);
        if (!plan) {
            return res.status(404).json({ error: "Plan not found" });
        }

        const subscription = await razorpay.subscriptions.create({
            plan_id: plan.razorpay_plan_id,
            customer_notify: 1,
            total_count: 12, // 12 months billing
        });

        res.json(subscription);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.cancelSubscription = async (req, res) => {
    try {
        const { razorpaySubscriptionId } = req.body;

        // Cancel at Razorpay
        await razorpay.subscriptions.cancel(
            razorpaySubscriptionId,
            true
        );

        // Update in DB
        await Subscription.update(
            { status: "cancelled" },
            { where: { razorpay_subscription_id: razorpaySubscriptionId } }
        );

        res.json({ message: "Subscription cancelled successfully" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};