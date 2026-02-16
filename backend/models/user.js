const { DataTypes } = require("sequelize");
const sequelize = require("../backend/config/database");

const User = sequelize.define("User", {
    institute_id: DataTypes.INTEGER,
    role: DataTypes.ENUM("super_admin", "admin", "faculty", "student", "parent"),
    name: DataTypes.STRING,
    email: { type: DataTypes.STRING, unique: true },
    phone: DataTypes.STRING,
    password_hash: DataTypes.STRING,
    status: DataTypes.ENUM("active", "blocked"),
});

module.exports = User;
