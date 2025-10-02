const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/db');

const Order = sequelize.define('Order', {
  cartId: { type: DataTypes.INTEGER },
  userId: { type: DataTypes.INTEGER },
  total: { type: DataTypes.FLOAT, defaultValue: 0 },
  updated: { type: DataTypes.DATE },
  created: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'orders',
  timestamps: false
});

module.exports = Order;
