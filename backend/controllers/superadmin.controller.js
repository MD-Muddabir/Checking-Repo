const {
    Institute, Subscription, Plan, Student, Faculty, User,
    Class, Subject, Attendance, FeesStructure, Payment, Announcement,
    Exam, Mark, ClassSession, Expense, Assignment, StudentParent,
    InstituteDiscount
} = require("../models");
const { Op, fn, col, literal } = require("sequelize");

// ─────────────────────────────────────────────────────────────
// PHASE 1: ENHANCED DASHBOARD STATS
// ─────────────────────────────────────────────────────────────
exports.getDashboardStats = async (req, res) => {
    try {
        const totalInstitutes = await Institute.count();
        const activeInstitutes = await Institute.count({ where: { status: "active" } });
        const expiredInstitutes = await Institute.count({ where: { status: "expired" } });
        const totalStudents = await Student.count();
        const totalFaculty = await Faculty.count();

        // Total Managers (users with role = manager)
        const totalManagers = await User.count({ where: { role: "manager" } });

        // Total Parents
        const totalParents = await User.count({ where: { role: "parent" } });

        // Total Revenue: Sum of all paid subscription amount_paid
        const revenueResult = await Subscription.findAll({
            attributes: [[fn("SUM", col("amount_paid")), "total"]],
            where: { payment_status: "paid" }
        });
        const totalRevenue = parseFloat(revenueResult[0]?.dataValues?.total || 0);

        // Monthly Revenue: Current month revenue
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthRevenueResult = await Subscription.findAll({
            attributes: [[fn("SUM", col("amount_paid")), "total"]],
            where: {
                payment_status: "paid",
                createdAt: { [Op.gte]: monthStart }
            }
        });
        const monthlyRevenue = parseFloat(monthRevenueResult[0]?.dataValues?.total || 0);

        // Total Features = number of unique feature flags = count of plans with active=status
        const totalPlans = await Plan.count({ where: { status: "active" } });

        // Total Private Schools = institutes that have subscription (i.e., active/paying)
        const totalPrivateSchools = await Institute.count({
            where: { status: { [Op.in]: ["active", "expired"] } }
        });

        // Total "Start Free Trial" users = subscriptions with payment_status='free_trial' OR institutes on plan id=1 (Starter, price=0)
        const freePlan = await Plan.findOne({ where: { price: 0 } });
        let totalFreeTrialUsers = 0;
        if (freePlan) {
            totalFreeTrialUsers = await Subscription.count({
                where: { plan_id: freePlan.id }
            });
        }

        // Phase 3: Total Platform Discounts (Student Fees + Institute Subscriptions)
        const { StudentFee, Subscription: SubModel } = require("../models");
        const [studentDiscountRes, subDiscountRes] = await Promise.all([
            StudentFee.sum("discount_amount") || 0,
            SubModel.sum("discount_amount") || 0
        ]);
        const totalDiscount = parseFloat(studentDiscountRes) + parseFloat(subDiscountRes);

        res.json({
            totalInstitutes,
            activeInstitutes,
            expiredInstitutes,
            totalRevenue,
            monthlyRevenue,
            totalStudents,
            totalFaculty,
            totalManagers,
            totalParents,
            totalPlans,
            totalPrivateSchools,
            totalFreeTrialUsers,
            totalDiscount
        });
    } catch (error) {
        console.error("getDashboardStats error:", error);
        res.status(500).json({ error: error.message });
    }
};

// ─────────────────────────────────────────────────────────────
// PHASE 2: ENHANCED ANALYTICS (with managers)
// ─────────────────────────────────────────────────────────────
exports.getAnalytics = async (req, res) => {
    try {
        // Monthly Revenue (by month of subscription creation)
        const monthlyRevenue = await Subscription.findAll({
            attributes: [
                [fn("MONTH", col("created_at")), "month"],
                [fn("YEAR", col("created_at")), "year"],
                [fn("SUM", col("amount_paid")), "totalRevenue"]
            ],
            where: { payment_status: "paid" },
            group: [fn("YEAR", col("created_at")), fn("MONTH", col("created_at"))],
            order: [[fn("YEAR", col("created_at")), "ASC"], [fn("MONTH", col("created_at")), "ASC"]],
            limit: 12
        });

        // Plan Distribution
        const planDistribution = await Subscription.findAll({
            attributes: [
                "plan_id",
                [fn("COUNT", col("Subscription.plan_id")), "count"]
            ],
            include: [{ model: Plan, attributes: ["name"] }],
            group: ["plan_id", "Plan.id", "Plan.name"]
        });

        // Active vs Expired Institutes
        const activeCount = await Institute.count({ where: { status: "active" } });
        const expiredCount = await Institute.count({ where: { status: "expired" } });
        const suspendedCount = await Institute.count({ where: { status: "suspended" } });

        // User Demographics: Students, Faculty, Managers, Parents, Admins
        const totalStudents = await Student.count();
        const totalFaculty = await Faculty.count();
        const totalManagers = await User.count({ where: { role: "manager" } });
        const totalParents = await User.count({ where: { role: "parent" } });
        const totalAdmins = await User.count({ where: { role: "admin" } });

        res.json({
            monthlyRevenue,
            planDistribution,
            instituteStatus: {
                active: activeCount,
                expired: expiredCount,
                suspended: suspendedCount
            },
            userDemographics: {
                students: totalStudents,
                faculty: totalFaculty,
                managers: totalManagers,
                parents: totalParents,
                admins: totalAdmins
            }
        });
    } catch (error) {
        console.error("getAnalytics error:", error);
        res.status(500).json({ error: error.message });
    }
};

// ─────────────────────────────────────────────────────────────
// EXISTING: getAllInstitutes (basic list with Plan)
// ─────────────────────────────────────────────────────────────
exports.getAllInstitutes = async (req, res) => {
    try {
        const institutes = await Institute.findAll({
            include: [{ model: Plan }],
            order: [["createdAt", "DESC"]]
        });
        res.json(institutes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ─────────────────────────────────────────────────────────────
// PHASE 3: GET SINGLE INSTITUTE FULL DETAILS
// ─────────────────────────────────────────────────────────────
exports.getInstituteDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const institute = await Institute.findByPk(id, {
            include: [{ model: Plan }]
        });
        if (!institute) return res.status(404).json({ error: "Institute not found" });

        // Get all counts in parallel
        const [
            totalStudents,
            totalFaculty,
            totalManagers,
            totalClasses,
            totalSubjects,
            totalAssignments,
            totalParents,
            latestSubscription,
            discounts
        ] = await Promise.all([
            Student.count({ where: { institute_id: id } }),
            Faculty.count({ where: { institute_id: id } }),
            User.count({ where: { institute_id: id, role: "manager" } }),
            Class.count({ where: { institute_id: id } }),
            Subject.count({ where: { institute_id: id } }),
            Assignment.count({ where: { institute_id: id } }),
            // Parents are users linked to students in this institute via StudentParent
            User.count({
                where: { role: "parent" },
                include: [{
                    model: Student,
                    as: "LinkedStudents",
                    where: { institute_id: id },
                    required: true,
                    through: { attributes: [] }
                }]
            }).catch(() => 0),
            Subscription.findOne({
                where: { institute_id: id },
                order: [["createdAt", "DESC"]],
                include: [{ model: Plan }]
            }),
            InstituteDiscount.findAll({
                where: { institute_id: id },
                order: [["createdAt", "DESC"]],
                include: [{ model: User, as: "approver", attributes: ["name"] }]
            })
        ]);

        // Count enabled features in current institute config
        const featureFields = [
            'current_feature_attendance',
            'current_feature_auto_attendance',
            'current_feature_fees',
            'current_feature_reports',
            'current_feature_announcements',
            'current_feature_export',
            'current_feature_timetable',
            'current_feature_whatsapp',
            'current_feature_custom_branding',
            'current_feature_multi_branch',
            'current_feature_api_access',
            'current_feature_public_page'
        ];

        let totalFeatures = 0;
        featureFields.forEach(field => {
            const val = institute[field];
            if (val && val !== 'none' && val !== false) totalFeatures++;
        });

        res.json({
            institute,
            stats: {
                totalStudents,
                totalFaculty,
                totalManagers,
                totalClasses,
                totalSubjects,
                totalAssignments,
                totalParents,
                totalFeatures
            },
            latestSubscription,
            discounts: discounts || []
        });
    } catch (error) {
        console.error("getInstituteDetails error:", error);
        res.status(500).json({ error: error.message });
    }
};

// ─────────────────────────────────────────────────────────────
// PHASE 3: UPDATE INSTITUTE LIMITS & FEATURES (custom override)
// Only affects institute's current_* fields, NOT the plan itself
// ─────────────────────────────────────────────────────────────
exports.updateInstituteLimits = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            // Limits
            current_limit_students,
            current_limit_faculty,
            current_limit_classes,
            current_limit_admins,
            // Feature overrides
            current_feature_attendance,
            current_feature_auto_attendance,
            current_feature_fees,
            current_feature_reports,
            current_feature_announcements,
            current_feature_export,
            current_feature_timetable,
            current_feature_whatsapp,
            current_feature_custom_branding,
            current_feature_multi_branch,
            current_feature_api_access,
            current_feature_public_page
        } = req.body;

        const institute = await Institute.findByPk(id);
        if (!institute) return res.status(404).json({ error: "Institute not found" });

        const updates = {};
        if (current_limit_students !== undefined) updates.current_limit_students = parseInt(current_limit_students);
        if (current_limit_faculty !== undefined) updates.current_limit_faculty = parseInt(current_limit_faculty);
        if (current_limit_classes !== undefined) updates.current_limit_classes = parseInt(current_limit_classes);
        if (current_limit_admins !== undefined) updates.current_limit_admins = parseInt(current_limit_admins);
        if (current_feature_attendance !== undefined) updates.current_feature_attendance = current_feature_attendance;
        if (current_feature_auto_attendance !== undefined) updates.current_feature_auto_attendance = !!current_feature_auto_attendance;
        if (current_feature_fees !== undefined) updates.current_feature_fees = !!current_feature_fees;
        if (current_feature_reports !== undefined) updates.current_feature_reports = current_feature_reports;
        if (current_feature_announcements !== undefined) updates.current_feature_announcements = !!current_feature_announcements;
        if (current_feature_export !== undefined) updates.current_feature_export = !!current_feature_export;
        if (current_feature_timetable !== undefined) updates.current_feature_timetable = !!current_feature_timetable;
        if (current_feature_whatsapp !== undefined) updates.current_feature_whatsapp = !!current_feature_whatsapp;
        if (current_feature_custom_branding !== undefined) updates.current_feature_custom_branding = !!current_feature_custom_branding;
        if (current_feature_multi_branch !== undefined) updates.current_feature_multi_branch = !!current_feature_multi_branch;
        if (current_feature_api_access !== undefined) updates.current_feature_api_access = !!current_feature_api_access;
        if (current_feature_public_page !== undefined) updates.current_feature_public_page = !!current_feature_public_page;

        await institute.update(updates);

        res.json({ success: true, message: "Institute limits & features updated successfully", institute });
    } catch (error) {
        console.error("updateInstituteLimits error:", error);
        res.status(500).json({ error: error.message });
    }
};

// ─────────────────────────────────────────────────────────────
// EXISTING: updateInstituteStatus
// ─────────────────────────────────────────────────────────────
exports.updateInstituteStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        await Institute.update({ status }, { where: { id } });
        res.json({ message: "Institute status updated" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ─────────────────────────────────────────────────────────────
// EXISTING: deleteInstitute
// ─────────────────────────────────────────────────────────────
exports.deleteInstitute = async (req, res) => {
    try {
        const { id } = req.params;
        const institute = await Institute.findByPk(id);
        if (!institute) return res.status(404).json({ error: "Institute not found" });

        const studentsInInstitute = await Student.findAll({ attributes: ["id"], where: { institute_id: id } });
        const studentIds = studentsInInstitute.map(s => s.id);

        const { StudentClass } = require("../models");
        if (studentIds.length > 0) {
            await StudentClass.destroy({ where: { student_id: studentIds } });
        }

        await User.destroy({ where: { institute_id: id } });
        await Class.destroy({ where: { institute_id: id } });
        await Student.destroy({ where: { institute_id: id } });
        await Faculty.destroy({ where: { institute_id: id } });
        await Subject.destroy({ where: { institute_id: id } });
        await Attendance.destroy({ where: { institute_id: id } });
        await FeesStructure.destroy({ where: { institute_id: id } });
        await Payment.destroy({ where: { institute_id: id } });
        await Announcement.destroy({ where: { institute_id: id } });
        await Exam.destroy({ where: { institute_id: id } });
        await Mark.destroy({ where: { institute_id: id } });
        await Subscription.destroy({ where: { institute_id: id } });
        await ClassSession.destroy({ where: { institute_id: id } });

        await institute.destroy();
        res.json({ message: "Institute deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ─────────────────────────────────────────────────────────────
// EXISTING: upgradePlan
// ─────────────────────────────────────────────────────────────
exports.upgradePlan = async (req, res) => {
    try {
        const { instituteId } = req.params;
        const { newPlanId, durationMonths } = req.body;

        const institute = await Institute.findByPk(instituteId);
        if (!institute) return res.status(404).json({ error: "Institute not found" });

        const newPlan = await Plan.findByPk(newPlanId);
        if (!newPlan) return res.status(404).json({ error: "Plan not found" });

        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + durationMonths);

        // Check for active discounts for this institute
        const activeDiscount = await InstituteDiscount.findOne({
            where: { institute_id: instituteId, status: "active" },
            order: [["createdAt", "DESC"]]
        });

        let finalAmount = parseFloat(newPlan.price);
        let discountAmount = 0;

        if (activeDiscount) {
            if (activeDiscount.discount_type === "fixed") {
                discountAmount = parseFloat(activeDiscount.discount_value);
            } else {
                discountAmount = (finalAmount * parseFloat(activeDiscount.discount_value)) / 100;
            }
            finalAmount = Math.max(0, finalAmount - discountAmount);
        }

        const subscription = await Subscription.create({
            institute_id: instituteId,
            plan_id: newPlanId,
            start_date: startDate,
            end_date: endDate,
            payment_status: "paid",
            amount_paid: finalAmount,
            discount_amount: discountAmount
        });

        // Mark discount as used
        if (activeDiscount) {
            await activeDiscount.update({ status: "used" });
        }

        await institute.update({
            plan_id: newPlanId,
            subscription_start: startDate,
            subscription_end: endDate,
            status: "active",
            // Sync limits from new plan
            current_limit_students: newPlan.max_students,
            current_limit_faculty: newPlan.max_faculty,
            current_limit_classes: newPlan.max_classes,
            current_limit_admins: newPlan.max_admin_users,
            current_feature_attendance: newPlan.feature_attendance,
            current_feature_auto_attendance: newPlan.feature_auto_attendance,
            current_feature_fees: newPlan.feature_fees,
            current_feature_reports: newPlan.feature_reports,
            current_feature_announcements: newPlan.feature_announcements,
            current_feature_export: newPlan.feature_export,
            current_feature_timetable: newPlan.feature_timetable,
            current_feature_whatsapp: newPlan.feature_whatsapp,
            current_feature_custom_branding: newPlan.feature_custom_branding,
            current_feature_multi_branch: newPlan.feature_multi_branch,
            current_feature_api_access: newPlan.feature_api_access,
            current_feature_public_page: newPlan.feature_public_page
        });

        res.json({
            message: "Plan upgraded successfully",
            newPlan: newPlan.name,
            validTill: endDate
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ─────────────────────────────────────────────────────────────
// PHASE 4: INSTITUTE DISCOUNTS (Superadmin giving discount to Institute)
// ─────────────────────────────────────────────────────────────
exports.applyInstituteDiscount = async (req, res) => {
    try {
        const { id } = req.params;
        const { discount_type, discount_value, reason } = req.body;

        if (!discount_value || isNaN(discount_value)) {
            return res.status(400).json({ error: "Valid discount value is required" });
        }

        const { InstituteDiscount } = require("../models");
        const discount = await InstituteDiscount.create({
            institute_id: id,
            discount_type: discount_type || "fixed",
            discount_value: parseFloat(discount_value),
            reason,
            applied_by: req.user.id,
            status: "active"
        });

        res.json({ success: true, message: "Discount applied successfully", discount });
    } catch (error) {
        console.error("applyInstituteDiscount error:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.deleteInstituteDiscount = async (req, res) => {
    try {
        const { id, discountId } = req.params;
        const { InstituteDiscount } = require("../models");
        await InstituteDiscount.destroy({ where: { id: discountId, institute_id: id } });
        res.json({ message: "Discount deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};