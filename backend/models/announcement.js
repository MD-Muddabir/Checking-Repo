const { DataTypes } = require("sequelize");
const sequelize = require("../backend/config/database");

const Announcement = sequelize.define("Announcement", {
    institute_id: DataTypes.INTEGER,
    title: DataTypes.STRING,
    message: DataTypes.TEXT,
    created_by: DataTypes.INTEGER,
});

module.exports = Announcement;
