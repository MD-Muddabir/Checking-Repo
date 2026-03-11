const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const AssignmentSetting = sequelize.define("AssignmentSetting", {
    institute_id: { type: DataTypes.INTEGER, primaryKey: true },
    allow_late_submission: { type: DataTypes.BOOLEAN, defaultValue: true },
    late_submission_penalty_percent: { type: DataTypes.INTEGER, defaultValue: 0 },
    max_file_size_mb: { type: DataTypes.INTEGER, defaultValue: 10 },
    allowed_file_types: {
        type: DataTypes.JSON,
        defaultValue: ['pdf', 'docx', 'jpg', 'png', 'zip']
    },
    auto_close_after_days: { type: DataTypes.INTEGER, defaultValue: 7 },
    notify_parent_on_submit: { type: DataTypes.BOOLEAN, defaultValue: true },
    notify_parent_on_grade: { type: DataTypes.BOOLEAN, defaultValue: true },
    notify_student_on_new: { type: DataTypes.BOOLEAN, defaultValue: true },
    allow_resubmission: { type: DataTypes.BOOLEAN, defaultValue: true },
    max_resubmit_attempts: { type: DataTypes.INTEGER, defaultValue: 2 }
}, {
    tableName: 'assignment_settings',
    timestamps: false
});

module.exports = AssignmentSetting;
