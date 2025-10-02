const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/db');
const { ROLES, EMAIL_PROVIDER } = require('../constants');

const User = sequelize.define('User', {
  email: {
    type: DataTypes.STRING,
    allowNull: true // Custom validation for provider can be added in hooks
  },
  phoneNumber: {
    type: DataTypes.STRING
  },
  firstName: {
    type: DataTypes.STRING
  },
  lastName: {
    type: DataTypes.STRING
  },
  password: {
    type: DataTypes.STRING
  },
  merchantId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  provider: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: EMAIL_PROVIDER.Email
  },
  googleId: {
    type: DataTypes.STRING
  },
  facebookId: {
    type: DataTypes.STRING
  },
  avatar: {
    type: DataTypes.STRING
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: ROLES.Member
  },
  resetPasswordToken: {
    type: DataTypes.STRING
  },
  resetPasswordExpires: {
    type: DataTypes.DATE
  },
  updated: {
    type: DataTypes.DATE
  },
  created: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'users',
  timestamps: false
});

module.exports = User;
