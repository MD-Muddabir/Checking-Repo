const { DataTypes } = require("sequelize");
const sequelize = require("../backend/config/database");

const FeesStructure = sequelize.define("FeesStructure", {
    institute_id: DataTypes.INTEGER,
    class_id: DataTypes.INTEGER,
    total_amount: DataTypes.DECIMAL(10, 2),
    due_date: DataTypes.DATEONLY,
});

module.exports = FeesStructure;
