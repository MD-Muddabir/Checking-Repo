const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Subscription = sequelize.define("Subscription", {
    institute_id: DataTypes.INTEGER,
    plan_id: DataTypes.INTEGER,
    start_date: DataTypes.DATEONLY,
    end_date: DataTypes.DATEONLY,
    payment_status: DataTypes.ENUM("paid", "unpaid", "failed", "pending"),
    transaction_reference: DataTypes.STRING,
    amount_paid: DataTypes.DECIMAL(10, 2),
    discount_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
});

module.exports = Subscription;
