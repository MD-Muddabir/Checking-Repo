const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Institute = sequelize.define("Institute", {
    plan_id: DataTypes.INTEGER,
    name: DataTypes.STRING,
    email: { type: DataTypes.STRING, unique: true },
    phone: DataTypes.STRING,
    address: DataTypes.TEXT,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    zip_code: DataTypes.STRING,
    logo: DataTypes.STRING,
    subscription_start: DataTypes.DATEONLY,
    subscription_end: DataTypes.DATEONLY,
    status: DataTypes.ENUM("active", "expired", "suspended", "pending"),
});

module.exports = Institute;
