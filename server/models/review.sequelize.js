const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/db');
const { REVIEW_STATUS } = require('../constants');

const Review = sequelize.define('Review', {
  productId: { type: DataTypes.INTEGER, allowNull: true },
  userId: { type: DataTypes.INTEGER, allowNull: true },
  title: { type: DataTypes.STRING },
  rating: { type: DataTypes.INTEGER, defaultValue: 0 },
  review: { type: DataTypes.STRING },
  isRecommended: { type: DataTypes.BOOLEAN, defaultValue: true },
  status: { type: DataTypes.STRING, defaultValue: REVIEW_STATUS.Waiting_Approval },
  updated: { type: DataTypes.DATE },
  created: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'reviews',
  timestamps: false
});

module.exports = Review;
