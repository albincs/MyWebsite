const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/db');

const Brand = sequelize.define('Brand', {
  name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  slug: {
    type: DataTypes.STRING,
    unique: true
  },
  imageData: {
    type: DataTypes.BLOB('long'),
    allowNull: true
  },
  imageContentType: {
    type: DataTypes.STRING,
    allowNull: true
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  merchantId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  updated: {
    type: DataTypes.DATE
  },
  created: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'brands',
  timestamps: false
});

module.exports = Brand;
