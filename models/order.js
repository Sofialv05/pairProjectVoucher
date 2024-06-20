'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Order.belongsTo(models.Product)
      Order.belongsTo(models.User)
    }

    get formatOrderDate() {
      const formatDate = this.orderDate.toISOString()
      return formatDate.slice(0, 10)
    }

    get statusOrder() {
      if (!this.status) return "Waiting for payment"
    }
  }
  Order.init({
    UserId: DataTypes.INTEGER,
    orderDate: DataTypes.DATE,
    totalPrice: DataTypes.INTEGER,
    status: DataTypes.BOOLEAN,
    quantity: DataTypes.INTEGER,
    ProductId: DataTypes.INTEGER,
    gameUid: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Order',
  });

  Order.beforeCreate(instance => instance.orderDate = new Date())

  return Order;
};