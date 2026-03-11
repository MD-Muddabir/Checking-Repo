const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const AssignmentSubmission = sequelize.define("AssignmentSubmission", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    institute_id: { type: DataTypes.INTEGER, allowNull: false },
    assignment_id: { type: DataTypes.INTEGER, allowNull: false },
    student_id: { type: DataTypes.INTEGER, allowNull: false },
    submission_file_url: { type: DataTypes.STRING(500), allowNull: true },
    submission_file_name: { type: DataTypes.STRING(255), allowNull: true },
    submission_file_type: { type: DataTypes.STRING(50), allowNull: true },
    submission_file_size_kb: { type: DataTypes.INTEGER, allowNull: true },
    submitted_at: { type: DataTypes.DATE, allowNull: true },
    is_late: { type: DataTypes.BOOLEAN, defaultValue: false },
    late_by_minutes: { type: DataTypes.INTEGER, defaultValue: 0 },
    status: {
        type: DataTypes.ENUM('pending', 'submitted', 'late', 'graded', 'resubmit_requested'),
        defaultValue: 'pending'
    },
    marks_obtained: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
    grade: { type: DataTypes.STRING(5), allowNull: true },
    feedback: { type: DataTypes.TEXT, allowNull: true },
    graded_by: { type: DataTypes.INTEGER, allowNull: true },
    graded_at: { type: DataTypes.DATE, allowNull: true },
    resubmit_reason: { type: DataTypes.TEXT, allowNull: true },
    attempt_number: { type: DataTypes.INTEGER, defaultValue: 1 }
}, {
    tableName: 'assignment_submissions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            unique: true,
            fields: ['assignment_id', 'student_id']
        },
        { fields: ['assignment_id', 'status'] }
    ]
});

module.exports = AssignmentSubmission;
