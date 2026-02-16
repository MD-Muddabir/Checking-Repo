const { DataTypes } = require("sequelize");
const sequelize = require("../backend/config/database");

const Plan = sequelize.define("Plan", {
    name: DataTypes.STRING,
    price: DataTypes.DECIMAL(10, 2),
    student_limit: DataTypes.INTEGER,
    feature_attendance: DataTypes.BOOLEAN,
    feature_fees: DataTypes.BOOLEAN,
    feature_reports: DataTypes.BOOLEAN,
    feature_parent_portal: DataTypes.BOOLEAN,
});

module.exports = Plan;
