const { DataTypes } = require("sequelize");
const sequelize = require("../backend/config/database");

const Institute = sequelize.define("Institute", {
    name: DataTypes.STRING,
    email: { type: DataTypes.STRING, unique: true },
    phone: DataTypes.STRING,
    address: DataTypes.TEXT,
    logo: DataTypes.STRING,
    subscription_start: DataTypes.DATEONLY,
    subscription_end: DataTypes.DATEONLY,
    status: DataTypes.ENUM("active", "expired", "suspended"),
});

module.exports = Institute;
