const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/db');

const Address = sequelize.define('Address', {
  userId: { type: DataTypes.INTEGER },
  address: { type: DataTypes.STRING },
  city: { type: DataTypes.STRING },
  state: { type: DataTypes.STRING },
  country: { type: DataTypes.STRING },
  zipCode: { type: DataTypes.STRING },
  isDefault: { type: DataTypes.BOOLEAN, defaultValue: false },
  updated: { type: DataTypes.DATE },
  created: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'addresses',
  timestamps: false
});

module.exports = Address;
