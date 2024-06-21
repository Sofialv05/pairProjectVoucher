'use strict';
const {
  Model
} = require('sequelize');
const convertCurrency = require('../helpers/convertCurrency')

module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Product.belongsTo(models.Category)
      Product.hasMany(models.Order)
      // Product.belongsToMany(models.User, { through: models.Order, as: 'productOrders' })
    }

    get formatPrice() {
      return convertCurrency(this.price)
    }

  }
  Product.init({
    productName: DataTypes.STRING,
    price: DataTypes.INTEGER,
    CategoryId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Product',
  });
  return Product;
};