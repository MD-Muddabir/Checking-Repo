const { DataTypes } = require("sequelize");
const sequelize = require("../backend/config/database");

const Faculty = sequelize.define("Faculty", {
    institute_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    designation: DataTypes.STRING,
    salary: DataTypes.DECIMAL(10, 2),
    join_date: DataTypes.DATEONLY,
});

module.exports = Faculty;
