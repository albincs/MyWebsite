const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/db');
const { CART_ITEM_STATUS } = require('../constants');

const Cart = sequelize.define('Cart', {
  userId: { type: DataTypes.INTEGER },
  updated: { type: DataTypes.DATE },
  created: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'carts',
  timestamps: false
});

const CartItem = sequelize.define('CartItem', {
  productId: { type: DataTypes.INTEGER },
  quantity: { type: DataTypes.INTEGER },
  purchasePrice: { type: DataTypes.FLOAT, defaultValue: 0 },
  totalPrice: { type: DataTypes.FLOAT, defaultValue: 0 },
  priceWithTax: { type: DataTypes.FLOAT, defaultValue: 0 },
  totalTax: { type: DataTypes.FLOAT, defaultValue: 0 },
  status: { type: DataTypes.STRING, defaultValue: CART_ITEM_STATUS.Not_processed },
  cartId: { type: DataTypes.INTEGER }
}, {
  tableName: 'cart_items',
  timestamps: false
});

Cart.hasMany(CartItem, { foreignKey: 'cartId' });
CartItem.belongsTo(Cart, { foreignKey: 'cartId' });

module.exports = { Cart, CartItem };
