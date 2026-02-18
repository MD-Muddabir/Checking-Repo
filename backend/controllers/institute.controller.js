/**
 * Institute Controller
 * Handles CRUD operations for institutes
 * Implements multi-tenant data isolation
 */

const { Institute, User, Subscription, Plan } = require("../models");
const { Op } = require("sequelize");

/**
 * Create a new institute
 * @route POST /api/institutes
 * @access Super Admin only
 */
exports.createInstitute = async (req, res) => {
    try {
        const { name, email, phone, address, logo } = req.body;

        // Check if institute already exists
        const existingInstitute = await Institute.findOne({ where: { email } });
        if (existingInstitute) {
            return res.status(409).json({
                success: false,
                message: "Institute with this email already exists",
            });
        }

        // Create institute
        const institute = await Institute.create({
            name,
            email,
            phone,
            address,
            logo,
            status: "active",
        });

        res.status(201).json({
            success: true,
            message: "Institute created successfully",
            data: institute,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * Get all institutes
 * @route GET /api/institutes
 * @access Super Admin only
 */
exports.getAllInstitutes = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "" } = req.query;

        // Auto-update expired statuses
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        await Institute.update(
            { status: 'expired' },
            {
                where: {
                    status: 'active',
                    subscription_end: {
                        [Op.lt]: today
                    }
                }
            }
        );

        const offset = (page - 1) * limit;

        const whereClause = search
            ? {
                [Op.or]: [
                    { name: { [Op.like]: `%${search}%` } },
                    { email: { [Op.like]: `%${search}%` } },
                ],
            }
            : {};

        // Add status filter to query if provided
        if (req.query.status && req.query.status !== 'all') {
            whereClause.status = req.query.status;
        }

        const { count, rows } = await Institute.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: Subscription,
                    attributes: ["plan_id", "start_date", "end_date", "payment_status"],
                },
                {
                    model: Plan,
                    attributes: ["name"]
                }
            ],
        });

        res.status(200).json({
            success: true,
            message: "Institutes retrieved successfully",
            data: {
                institutes: rows,
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

/**
 * Get institute by ID
 * @route GET /api/institutes/:id
 * @access Super Admin or Institute Admin
 */
exports.getInstituteById = async (req, res) => {
    try {
        const { id } = req.params;

        // If not super admin, ensure user can only access their own institute
        if (req.user.role !== "super_admin" && req.user.institute_id != id) {
            return res.status(403).json({
                success: false,
                message: "Access forbidden",
            });
        }

        const institute = await Institute.findByPk(id, {
            include: [
                {
                    model: Subscription,
                    attributes: ["plan_id", "start_date", "end_date", "payment_status"],
                },
                {
                    model: Plan,
                    attributes: ["name"]
                }
            ],
        });

        if (!institute) {
            return res.status(404).json({
                success: false,
                message: "Institute not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Institute retrieved successfully",
            data: institute,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * Update institute
 * @route PUT /api/institutes/:id
 * @access Super Admin or Institute Admin
 */
exports.updateInstitute = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, address, logo } = req.body;

        // If not super admin, ensure user can only update their own institute
        if (req.user.role !== "super_admin" && req.user.institute_id != id) {
            return res.status(403).json({
                success: false,
                message: "Access forbidden",
            });
        }

        const institute = await Institute.findByPk(id);

        if (!institute) {
            return res.status(404).json({
                success: false,
                message: "Institute not found",
            });
        }

        await institute.update({
            name: name || institute.name,
            email: email || institute.email,
            phone: phone || institute.phone,
            address: address || institute.address,
            logo: logo || institute.logo,
        });

        res.status(200).json({
            success: true,
            message: "Institute updated successfully",
            data: institute,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * Suspend/Activate institute
 * @route PATCH /api/institutes/:id/status
 * @access Super Admin only
 */
exports.updateInstituteStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!["active", "suspended", "expired"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status. Must be: active, suspended, or expired",
            });
        }

        const institute = await Institute.findByPk(id);

        if (!institute) {
            return res.status(404).json({
                success: false,
                message: "Institute not found",
            });
        }

        await institute.update({ status });

        res.status(200).json({
            success: true,
            message: `Institute ${status} successfully`,
            data: institute,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * Delete institute
 * @route DELETE /api/institutes/:id
 * @access Super Admin only
 */
exports.deleteInstitute = async (req, res) => {
    try {
        const { id } = req.params;

        const institute = await Institute.findByPk(id);

        if (!institute) {
            return res.status(404).json({
                success: false,
                message: "Institute not found",
            });
        }

        await institute.destroy();

        res.status(200).json({
            success: true,
            message: "Institute deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = exports;
