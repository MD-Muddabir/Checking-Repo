const { DataTypes } = require("sequelize");
const sequelize = require("../backend/config/database");

const Mark = sequelize.define("Mark", {
    institute_id: DataTypes.INTEGER,
    exam_id: DataTypes.INTEGER,
    student_id: DataTypes.INTEGER,
    subject_id: DataTypes.INTEGER,
    marks_obtained: DataTypes.DECIMAL(5, 2),
    max_marks: DataTypes.DECIMAL(5, 2),
});

module.exports = Mark;
