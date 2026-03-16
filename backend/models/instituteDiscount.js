const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const InstituteDiscount = sequelize.define("InstituteDiscount", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    institute_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    discount_type: {
        type: DataTypes.ENUM('percentage', 'fixed'),
        defaultValue: 'fixed'
    },
    discount_value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    reason: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('active', 'used', 'expired'),
        defaultValue: 'active'
    },
    applied_by: {
        type: DataTypes.INTEGER, // Superadmin ID
        allowNull: true
    }
}, {
    timestamps: true,
    tableName: 'institute_discounts'
});

module.exports = InstituteDiscount;
