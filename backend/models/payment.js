const { DataTypes } = require("sequelize");
const sequelize = require("../backend/config/database");

const Payment = sequelize.define("Payment", {
    institute_id: DataTypes.INTEGER,
    student_id: DataTypes.INTEGER,
    amount_paid: DataTypes.DECIMAL(10, 2),
    payment_date: DataTypes.DATEONLY,
    payment_method: DataTypes.STRING,
    transaction_id: DataTypes.STRING,
    status: DataTypes.ENUM("success", "failed", "pending"),
});

module.exports = Payment;
