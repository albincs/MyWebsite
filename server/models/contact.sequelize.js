const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/db');

const Contact = sequelize.define('Contact', {
  name: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING },
  message: { type: DataTypes.STRING },
  updated: { type: DataTypes.DATE },
  created: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'contacts',
  timestamps: false
});

module.exports = Contact;
