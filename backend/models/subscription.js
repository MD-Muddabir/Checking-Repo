const { DataTypes } = require("sequelize");
const sequelize = require("../backend/config/database");

const Subscription = sequelize.define("Subscription", {
    institute_id: DataTypes.INTEGER,
    plan_id: DataTypes.INTEGER,
    start_date: DataTypes.DATEONLY,
    end_date: DataTypes.DATEONLY,
    payment_status: DataTypes.ENUM("paid", "unpaid", "failed"),
    transaction_reference: DataTypes.STRING,
});

module.exports = Subscription;
