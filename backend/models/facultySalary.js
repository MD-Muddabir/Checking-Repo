const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FacultySalary = sequelize.define("FacultySalary", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    institute_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    faculty_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    month_year: {
        type: DataTypes.STRING(7),  // '2026-04'
        allowNull: false
    },
    basic_salary: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
    },
    allowances: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    deductions: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    advance_paid: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    net_salary: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
    },
    payment_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    payment_method: {
        type: DataTypes.ENUM('cash', 'bank_transfer', 'upi', 'cheque'),
        defaultValue: 'bank_transfer'
    },
    transaction_ref: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('pending', 'paid', 'on_hold'),
        defaultValue: 'pending'
    },
    working_days: {
        type: DataTypes.INTEGER,
        defaultValue: 26
    },
    present_days: {
        type: DataTypes.INTEGER,
        defaultValue: 26
    },
    remarks: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    paid_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: "faculty_salaries",
    timestamps: true
});

module.exports = FacultySalary;
