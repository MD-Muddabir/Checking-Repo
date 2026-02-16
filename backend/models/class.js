const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Class = sequelize.define("Class", {
    institute_id: DataTypes.INTEGER,
    name: DataTypes.STRING,
    section: DataTypes.STRING,
});

module.exports = Class;
