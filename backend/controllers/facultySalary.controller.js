/**
 * Faculty Salary Controller
 * Handles monthly salary creation, payment, and reporting
 * Admin only for revenue data; Admin+Manager for disbursement
 */

const { FacultySalary, Faculty, User, Institute } = require("../models");
const { Op } = require("sequelize");

// ── Create Salary Record ────────────────────────────────────────────────────
exports.createSalary = async (req, res) => {
    try {
        const {
            faculty_id, month_year, basic_salary, allowances,
            deductions, advance_paid, working_days, present_days, remarks
        } = req.body;
        const institute_id = req.user.institute_id;

        // Validations
        if (!faculty_id || !month_year || !basic_salary) {
            return res.status(400).json({
                success: false,
                message: "faculty_id, month_year, and basic_salary are required"
            });
        }
        if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month_year)) {
            return res.status(400).json({
                success: false,
                message: "month_year must be YYYY-MM format"
            });
        }
        if (parseFloat(basic_salary) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Basic salary must be greater than 0"
            });
        }

        // Verify faculty belongs to institute
        const faculty = await Faculty.findOne({ where: { id: faculty_id, institute_id } });
        if (!faculty) {
            return res.status(404).json({ success: false, message: "Faculty not found" });
        }

        // Check for duplicate salary record for same month
        const existing = await FacultySalary.findOne({ where: { faculty_id, month_year, institute_id } });
        if (existing) {
            return res.status(409).json({
                success: false,
                message: "Salary record already exists for this faculty this month"
            });
        }

        const b = parseFloat(basic_salary);
        const a = parseFloat(allowances || 0);
        const d = parseFloat(deductions || 0);
        const v = parseFloat(advance_paid || 0);
        const wDays = parseInt(working_days || 26);
        const pDays = parseInt(present_days || wDays);

        // Attendance-based salary calculation
        const attendanceFactor = wDays > 0 ? pDays / wDays : 1;
        const earnedSalary = b * attendanceFactor;
        const netSalary = parseFloat((earnedSalary + a - d - v).toFixed(2));

        if (netSalary < 0) {
            return res.status(400).json({
                success: false,
                message: "Deductions exceed salary. Please review values."
            });
        }

        const salary = await FacultySalary.create({
            institute_id,
            faculty_id,
            month_year,
            basic_salary: b,
            allowances: a,
            deductions: d,
            advance_paid: v,
            net_salary: netSalary,
            working_days: wDays,
            present_days: pDays,
            status: "pending",
            paid_by: null,
            remarks: remarks || null
        });

        res.status(201).json({ success: true, message: "Salary record created", data: salary });
    } catch (err) {
        console.error("createSalary error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── Get All Salaries (for an institute, filterable by month) ─────────────────
exports.getAllSalaries = async (req, res) => {
    try {
        const institute_id = req.user.institute_id;
        const { month_year, faculty_id, status } = req.query;

        const where = { institute_id };
        if (month_year) where.month_year = month_year;
        if (faculty_id) where.faculty_id = faculty_id;
        if (status) where.status = status;

        const salaries = await FacultySalary.findAll({
            where,
            include: [
                {
                    model: Faculty,
                    include: [{ model: User, attributes: ["name", "email"] }]
                },
                {
                    model: User,
                    as: "paidBy",
                    attributes: ["name"],
                    required: false
                }
            ],
            order: [["month_year", "DESC"], ["createdAt", "DESC"]]
        });

        res.json({ success: true, data: salaries });
    } catch (err) {
        console.error("getAllSalaries error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── Pay / Mark Salary as Paid ────────────────────────────────────────────────
exports.paySalary = async (req, res) => {
    try {
        const { id } = req.params;
        const { payment_method, transaction_ref } = req.body;
        const institute_id = req.user.institute_id;

        const salary = await FacultySalary.findOne({ where: { id, institute_id } });
        if (!salary) {
            return res.status(404).json({ success: false, message: "Salary record not found" });
        }
        if (salary.status === "paid") {
            return res.status(409).json({ success: false, message: "Salary already paid" });
        }

        await salary.update({
            status: "paid",
            payment_date: new Date(),
            payment_method: payment_method || "bank_transfer",
            transaction_ref: transaction_ref || null,
            paid_by: req.user.id
        });

        res.json({ success: true, message: "Salary marked as paid", data: salary });
    } catch (err) {
        console.error("paySalary error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── Update Salary Record ─────────────────────────────────────────────────────
exports.updateSalary = async (req, res) => {
    try {
        const { id } = req.params;
        const institute_id = req.user.institute_id;
        const { basic_salary, allowances, deductions, advance_paid, working_days, present_days, remarks, status } = req.body;

        const salary = await FacultySalary.findOne({ where: { id, institute_id } });
        if (!salary) {
            return res.status(404).json({ success: false, message: "Salary record not found" });
        }
        if (salary.status === "paid") {
            return res.status(400).json({ success: false, message: "Cannot modify a paid salary record" });
        }

        const b = parseFloat(basic_salary || salary.basic_salary);
        const a = parseFloat(allowances !== undefined ? allowances : salary.allowances);
        const d = parseFloat(deductions !== undefined ? deductions : salary.deductions);
        const v = parseFloat(advance_paid !== undefined ? advance_paid : salary.advance_paid);
        const wDays = parseInt(working_days || salary.working_days);
        const pDays = parseInt(present_days || salary.present_days);

        const attendanceFactor = wDays > 0 ? pDays / wDays : 1;
        const earnedSalary = b * attendanceFactor;
        const netSalary = parseFloat((earnedSalary + a - d - v).toFixed(2));

        await salary.update({
            basic_salary: b, allowances: a, deductions: d, advance_paid: v,
            net_salary: netSalary, working_days: wDays, present_days: pDays,
            remarks: remarks !== undefined ? remarks : salary.remarks,
            status: status || salary.status
        });

        res.json({ success: true, message: "Salary record updated", data: salary });
    } catch (err) {
        console.error("updateSalary error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── Delete Salary Record ─────────────────────────────────────────────────────
exports.deleteSalary = async (req, res) => {
    try {
        const { id } = req.params;
        const institute_id = req.user.institute_id;

        const salary = await FacultySalary.findOne({ where: { id, institute_id } });
        if (!salary) {
            return res.status(404).json({ success: false, message: "Salary record not found" });
        }
        if (salary.status === "paid") {
            return res.status(400).json({ success: false, message: "Cannot delete a paid salary record" });
        }

        await salary.destroy();
        res.json({ success: true, message: "Salary record deleted" });
    } catch (err) {
        console.error("deleteSalary error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── Get monthly salary summary (admin analytics) ─────────────────────────────
exports.getSalaryMonthReport = async (req, res) => {
    try {
        const institute_id = req.user.institute_id;
        const { month_year } = req.query;

        const where = { institute_id };
        if (month_year) where.month_year = month_year;

        const salaries = await FacultySalary.findAll({
            where,
            include: [
                {
                    model: Faculty,
                    include: [{ model: User, attributes: ["name", "email"] }]
                }
            ],
            order: [["net_salary", "DESC"]]
        });

        const totalNetSalary = salaries.reduce((sum, s) => sum + parseFloat(s.net_salary || 0), 0);
        const paidCount = salaries.filter(s => s.status === "paid").length;
        const pendingCount = salaries.filter(s => s.status === "pending").length;
        const totalPaid = salaries.filter(s => s.status === "paid").reduce((sum, s) => sum + parseFloat(s.net_salary || 0), 0);

        res.json({
            success: true,
            data: salaries,
            summary: {
                totalNetSalary,
                paidCount,
                pendingCount,
                totalPaid,
                totalPending: totalNetSalary - totalPaid
            }
        });
    } catch (err) {
        console.error("getSalaryMonthReport error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};
