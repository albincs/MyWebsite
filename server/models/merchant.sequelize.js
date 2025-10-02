const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/db');
const { MERCHANT_STATUS } = require('../constants');

const Merchant = sequelize.define('Merchant', {
  name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING
  },
  phoneNumber: {
    type: DataTypes.STRING
  },
  brandName: {
    type: DataTypes.STRING
  },
  business: {
    type: DataTypes.STRING
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  brandId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: MERCHANT_STATUS.Waiting_Approval
  },
  updated: {
    type: DataTypes.DATE
  },
  created: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'merchants',
  timestamps: false
});

module.exports = Merchant;
