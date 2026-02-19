const { Student, Faculty, Class, User } = require("../models");

exports.getDashboardStats = async (req, res) => {
    try {
        const institute_id = req.user.institute_id;

        // Total Students
        const totalStudents = await Student.count({
            where: { institute_id }
        });

        // Total Faculty
        const totalFaculty = await Faculty.count({
            where: { institute_id }
        });

        // Total Classes
        const totalClasses = await Class.count({
            where: { institute_id }
        });

        // Total Admins (New)
        const totalAdmins = await User.count({
            where: {
                institute_id,
                role: 'admin'
            }
        });

        // Active Students (User status = active)
        const activeStudents = await Student.count({
            include: [
                {
                    model: User,
                    where: { status: "active" }
                }
            ],
            where: { institute_id }
        });

        res.status(200).json({
            success: true,
            data: {
                totalStudents,
                totalFaculty,
                totalClasses,
                totalAdmins,
                activeStudents
            }
        });

    } catch (error) {
        console.error("Dashboard stats error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// --- Admin Management ---

const { Institute, Plan } = require("../models");
const { hashPassword } = require("../utils/hashPassword");

exports.getAllAdmins = async (req, res) => {
    try {
        const institute_id = req.user.institute_id;
        const admins = await User.findAll({
            where: {
                institute_id,
                role: 'admin'
            },
            attributes: ['id', 'name', 'email', 'phone', 'status', 'created_at']
        });

        res.status(200).json({
            success: true,
            data: admins
        });
    } catch (error) {
        console.error("Get admins error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createAdmin = async (req, res) => {
    try {
        const institute_id = req.user.institute_id;
        const { name, email, password, phone } = req.body;

        // 1. Check Plan Limits
        const institute = await Institute.findByPk(institute_id, {
            include: [{ model: Plan }]
        });

        if (!institute || !institute.Plan) {
            return res.status(403).json({ success: false, message: "No active plan found." });
        }

        const currentAdminCount = await User.count({
            where: { institute_id, role: 'admin' }
        });

        if (currentAdminCount >= institute.Plan.max_admin_users) {
            return res.status(403).json({
                success: false,
                message: `Plan limit reached. Your plan allows ${institute.Plan.max_admin_users} admins. Please upgrade.`
            });
        }

        // 2. Validate Input
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "Name, email, and password are required." });
        }

        // 3. Create Admin
        const hashedPassword = await hashPassword(password);
        const newAdmin = await User.create({
            institute_id,
            role: 'admin',
            name,
            email,
            phone,
            password_hash: hashedPassword,
            status: 'active'
        });

        res.status(201).json({
            success: true,
            message: "New admin created successfully.",
            data: {
                id: newAdmin.id,
                name: newAdmin.name,
                email: newAdmin.email
            }
        });

    } catch (error) {
        console.error("Create admin error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteAdmin = async (req, res) => {
    try {
        const institute_id = req.user.institute_id;
        const adminIdToDelete = req.params.id;
        const currentUserId = req.user.id; // From middleware

        if (parseInt(adminIdToDelete) === currentUserId) {
            return res.status(400).json({ success: false, message: "You cannot delete yourself." });
        }

        const admin = await User.findOne({
            where: {
                id: adminIdToDelete,
                institute_id,
                role: 'admin'
            }
        });

        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin not found." });
        }

        await admin.destroy();

        res.status(200).json({ success: true, message: "Admin removed successfully." });

    } catch (error) {
        console.error("Delete admin error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateAdmin = async (req, res) => {
    try {
        const institute_id = req.user.institute_id;
        const adminId = req.params.id;
        const { name, email, phone, status } = req.body;

        const admin = await User.findOne({
            where: { id: adminId, institute_id, role: 'admin' }
        });

        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin not found." });
        }

        await admin.update({
            name,
            email,
            phone,
            status
        });

        res.status(200).json({ success: true, message: "Admin updated successfully.", data: admin });

    } catch (error) {
        console.error("Update admin error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
}
