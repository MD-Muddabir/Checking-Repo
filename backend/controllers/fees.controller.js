/**
 * Fees Controller
 * Handles fee structure and payment tracking
 */

const { FeesStructure, Payment, Student, User } = require("../models");
const { Op } = require("sequelize");

exports.createFeeStructure = async (req, res) => {
    try {
        const { class_id, subject_id, fee_type, amount, due_date, description } = req.body;
        const institute_id = req.user.institute_id;

        const feeStructure = await FeesStructure.create({
            institute_id,
            class_id,
            subject_id: subject_id || null, // null means it's a generic class fee
            fee_type,
            amount,
            due_date,
            description,
        });

        res.status(201).json({
            success: true,
            message: "Fee structure created successfully",
            data: feeStructure,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.getAllFeeStructures = async (req, res) => {
    try {
        const { class_id } = req.query;
        const institute_id = req.user.institute_id;

        let whereClause = { institute_id };
        if (class_id) whereClause.class_id = class_id;

        if (req.user.role === "student") {
            // Find the student's primary class and their linked subjects
            const studentObj = await Student.findOne({
                where: { user_id: req.user.id, institute_id },
                include: [
                    { model: require("../models").Class },
                    { model: require("../models").Subject }
                ]
            });

            if (studentObj) {
                const classIds = studentObj.Classes ? studentObj.Classes.map(c => c.id) : [];
                if (classIds.length > 0) {
                    whereClause.class_id = classIds; // matches any of their classes
                }
                // Do not filter by enrolled subjects, so they can see all subjects to unlock them!
            }
        }

        const feeStructures = await FeesStructure.findAll({
            where: whereClause,
            include: [
                { model: require("../models").Class, attributes: ["name", "section"] },
                { model: require("../models").Subject, attributes: ["name"] }
            ],
            order: [["due_date", "ASC"]],
        });

        // Let's attach the amount already paid by this student for each fee structure structure
        let feesWithPayments = feeStructures.map(f => f.toJSON());

        if (req.user.role === "student") {
            const studentObj = await Student.findOne({
                where: { user_id: req.user.id, institute_id },
                include: [{ model: require("../models").Subject }]
            });
            if (studentObj) {
                const filteredFees = [];
                for (let fee of feesWithPayments) {
                    const payments = await Payment.findAll({
                        where: { student_id: studentObj.id, fee_structure_id: fee.id, status: 'success' }
                    });
                    fee.paid_amount = payments.reduce((sum, p) => sum + parseFloat(p.amount_paid), 0);
                    fee.is_enrolled = !!(fee.subject_id && studentObj.Subjects?.find(s => s.id === fee.subject_id));

                    if (!fee.subject_id || fee.is_enrolled) {
                        filteredFees.push(fee);
                    }
                }
                feesWithPayments = filteredFees;
            }
        }

        res.status(200).json({
            success: true,
            message: "Fee structures retrieved successfully",
            data: feesWithPayments,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.recordPayment = async (req, res) => {
    try {
        const { student_id, fee_structure_id, amount, payment_method, transaction_id, payment_date, remarks } = req.body;
        const institute_id = req.user.institute_id;

        let actual_student_id = student_id;
        let studentObj = null;
        if (req.user.role === "student") {
            studentObj = await Student.findOne({ where: { user_id: req.user.id, institute_id } });
            if (!studentObj) {
                return res.status(404).json({ success: false, message: "Student record not found" });
            }
            actual_student_id = studentObj.id;
        } else {
            studentObj = await Student.findOne({ where: { id: student_id, institute_id } });
        }

        // Auto enroll in subject if paying a subject fee
        if (fee_structure_id && studentObj) {
            const fee = await FeesStructure.findOne({ where: { id: fee_structure_id, institute_id } });

            // Validate if already fully paid?
            if (fee) {
                const existingPayments = await Payment.findAll({
                    where: { student_id: actual_student_id, fee_structure_id: fee.id, status: 'success' }
                });
                const totalPaidSoFar = existingPayments.reduce((sum, p) => sum + parseFloat(p.amount_paid), 0);
                if (totalPaidSoFar >= parseFloat(fee.amount) && amount > 0) {
                    return res.status(400).json({ success: false, message: "Already enrolled in that subject and fees fully paid." });
                }

                if (fee.subject_id) {
                    await studentObj.addSubject(fee.subject_id);
                }
            }
        }

        const payment = await Payment.create({
            institute_id,
            student_id: actual_student_id,
            fee_structure_id: fee_structure_id || null,
            amount_paid: amount,
            payment_method: payment_method || "Credit Card", // Default if not provided
            transaction_id: transaction_id || "TXN_" + Date.now(),
            payment_date: payment_date || new Date(),
            status: "success",
        });

        res.status(201).json({
            success: true,
            message: "Payment recorded successfully",
            data: payment,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.getAllPayments = async (req, res) => {
    try {
        const { page = 1, limit = 20, student_id } = req.query;
        const institute_id = req.user.institute_id;
        const offset = (page - 1) * limit;

        const whereClause = { institute_id };
        if (student_id) whereClause.student_id = student_id;

        const { count, rows } = await Payment.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [["payment_date", "DESC"]],
            include: [
                {
                    model: Student,
                    include: [{ model: User, attributes: ["name", "email"] }]
                }
            ]
        });

        res.status(200).json({
            success: true,
            data: rows,
            count
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getStudentPayments = async (req, res) => {
    try {
        const { student_id } = req.params;
        const institute_id = req.user.institute_id;

        const payments = await Payment.findAll({
            where: { student_id, institute_id },
            order: [["payment_date", "DESC"]],
        });

        const totalPaid = payments.reduce((sum, payment) => sum + (parseFloat(payment.amount_paid) || 0), 0);

        res.status(200).json({
            success: true,
            message: "Student payments retrieved successfully",
            data: {
                payments,
                total_paid: totalPaid,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = exports;
