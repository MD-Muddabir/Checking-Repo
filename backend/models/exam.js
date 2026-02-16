const { DataTypes } = require("sequelize");
const sequelize = require("../backend/config/database");

const Exam = sequelize.define("Exam", {
    institute_id: DataTypes.INTEGER,
    class_id: DataTypes.INTEGER,
    name: DataTypes.STRING,
    exam_date: DataTypes.DATEONLY,
});

module.exports = Exam;
