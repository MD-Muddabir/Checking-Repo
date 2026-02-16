const { DataTypes } = require("sequelize");
const sequelize = require("../backend/config/database");

const Subject = sequelize.define("Subject", {
    institute_id: DataTypes.INTEGER,
    class_id: DataTypes.INTEGER,
    name: DataTypes.STRING,
    faculty_id: DataTypes.INTEGER,
});

module.exports = Subject;
