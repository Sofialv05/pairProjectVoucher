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

    static async bulkOrders(obj, userId) {
      const data = obj

      const products = [];

      for (let i = 0; i < data.ProductId.length; i++) {

        if (data.quantity[i] == 0) continue

        const product = {
          ProductId: data.ProductId[i],
          productName: data.productName[i],
          totalPrice: (+data.price[i]) * (+data.quantity[i]),
          quantity: +data.quantity[i],
        };
        products.push(product);
      }


      for (let i = 0; i < products.length; i++) {
        const { ProductId, productName, totalPrice, quantity } = products[i];

        await Order.create({
          UserId: userId,
          ProductId,
          productName,
          totalPrice,
          quantity,
          gameUid: obj.gameUid
        });
      }

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