/**
 * Announcement Controller
 * Handles announcements and notifications
 */

const { Announcement, User } = require("../models");

exports.createAnnouncement = async (req, res) => {
    try {
        const { title, content, target_audience, priority } = req.body;
        const institute_id = req.user.institute_id;

        const announcement = await Announcement.create({
            institute_id,
            title,
            content,
            target_audience,
            priority: priority || "normal",
            created_by: req.user.id,
        });

        res.status(201).json({
            success: true,
            message: "Announcement created successfully",
            data: announcement,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.getAllAnnouncements = async (req, res) => {
    try {
        const { page = 1, limit = 10, target_audience } = req.query;
        const institute_id = req.user.institute_id;

        const offset = (page - 1) * limit;
        const whereClause = { institute_id };

        if (target_audience) {
            whereClause.target_audience = target_audience;
        }

        const { count, rows } = await Announcement.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: User,
                    as: "creator",
                    attributes: ["id", "name", "role"],
                },
            ],
        });

        res.status(200).json({
            success: true,
            message: "Announcements retrieved successfully",
            data: {
                announcements: rows,
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

exports.deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const institute_id = req.user.institute_id;

        const announcement = await Announcement.findOne({
            where: { id, institute_id },
        });

        if (!announcement) {
            return res.status(404).json({
                success: false,
                message: "Announcement not found",
            });
        }

        await announcement.destroy();

        res.status(200).json({
            success: true,
            message: "Announcement deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = exports;
