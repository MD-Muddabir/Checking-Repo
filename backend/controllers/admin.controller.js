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
