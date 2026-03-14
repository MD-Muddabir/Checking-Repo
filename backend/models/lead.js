const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Lead = sequelize.define('Lead', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    institute: {
      type: DataTypes.STRING,
      allowNull: false
    },
    studentCount: {
      type: DataTypes.STRING,
      allowNull: true
    },
    plan: {
      type: DataTypes.STRING,
      allowNull: true
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    source: {
      type: DataTypes.STRING,
      defaultValue: 'landing-page-contact'
    },
    status: {
      type: DataTypes.ENUM('new', 'contacted', 'demo_scheduled', 'closed_won', 'closed_lost'),
      defaultValue: 'new'
    }
  }, {
    tableName: 'leads',
    timestamps: true,
    underscored: true
  });

  return Lead;
};
