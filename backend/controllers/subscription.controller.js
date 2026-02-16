/**
 * Subscription Controller
 * Handles subscription management
 */

const { Subscription, Institute, Plan } = require("../models");

exports.createSubscription = async (req, res) => {
    try {
        const { institute_id, plan_id, amount_paid, discount_amount, subscription_start, subscription_end } = req.body;

        const subscription = await Subscription.create({
            institute_id,
            plan_id,
            amount_paid,
            discount_amount: discount_amount || 0,
            payment_status: "pending",
            subscription_start,
            subscription_end,
        });

        res.status(201).json({
            success: true,
            message: "Subscription created successfully",
            data: subscription,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.getAllSubscriptions = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;

        const offset = (page - 1) * limit;
        const whereClause = {};

        if (status) {
            whereClause.payment_status = status;
        }

        const { count, rows } = await Subscription.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: Institute,
                    attributes: ["id", "name", "email"],
                },
                {
                    model: Plan,
                    attributes: ["id", "name", "price"],
                },
            ],
        });

        res.status(200).json({
            success: true,
            message: "Subscriptions retrieved successfully",
            data: {
                subscriptions: rows,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(count / limit),
                },
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.updateSubscriptionStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { payment_status } = req.body;

        const subscription = await Subscription.findByPk(id);

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: "Subscription not found",
            });
        }

        await subscription.update({ payment_status });

        res.status(200).json({
            success: true,
            message: "Subscription status updated successfully",
            data: subscription,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = exports;
