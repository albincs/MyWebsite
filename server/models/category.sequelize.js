const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/db');

const Category = sequelize.define('Category', {
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
  updated: {
    type: DataTypes.DATE
  },
  created: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'categories',
  timestamps: false
});

module.exports = Category;
