const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const AssignmentSubmissionHistory = sequelize.define("AssignmentSubmissionHistory", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    submission_id: { type: DataTypes.INTEGER, allowNull: false },
    attempt_number: { type: DataTypes.INTEGER, allowNull: false },
    file_url: { type: DataTypes.STRING(500), allowNull: false },
    file_name: { type: DataTypes.STRING(255), allowNull: true },
    submitted_at: { type: DataTypes.DATE, allowNull: false },
    comment: { type: DataTypes.TEXT, allowNull: true }
}, {
    tableName: 'assignment_submission_history',
    timestamps: false
});

module.exports = AssignmentSubmissionHistory;
