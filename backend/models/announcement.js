const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Announcement = sequelize.define("Announcement", {
    institute_id: DataTypes.INTEGER,
    title: DataTypes.STRING,
    content: DataTypes.TEXT,
    target_audience: DataTypes.ENUM('all', 'students', 'faculty'),
    priority: DataTypes.ENUM('normal', 'high', 'urgent'),
    created_by: DataTypes.INTEGER,
});

module.exports = Announcement;
