const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/db');

const Product = sequelize.define('Product', {
  sku: { type: DataTypes.STRING },
  name: { type: DataTypes.STRING },
  slug: { type: DataTypes.STRING, unique: true },
  imageUrl: { type: DataTypes.STRING },
  imageKey: { type: DataTypes.STRING },
  description: { type: DataTypes.STRING },
  quantity: { type: DataTypes.INTEGER },
  price: { type: DataTypes.FLOAT },
  taxable: { type: DataTypes.BOOLEAN, defaultValue: false },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  brandId: { type: DataTypes.INTEGER, allowNull: true },
  updated: { type: DataTypes.DATE },
  created: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'products',
  timestamps: false
});

module.exports = Product;
