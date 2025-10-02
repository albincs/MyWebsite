const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/db');

const Wishlist = sequelize.define('Wishlist', {
  productId: { type: DataTypes.INTEGER, allowNull: true },
  userId: { type: DataTypes.INTEGER, allowNull: true },
  isLiked: { type: DataTypes.BOOLEAN, defaultValue: false },
  updated: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  created: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'wishlists',
  timestamps: false
});

module.exports = Wishlist;
