'use strict';

const bcrypt = require('bcryptjs')

const {
  Model
} = require('sequelize');
const { compare } = require('../helpers/bcrypt');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasOne(models.UserProfile)
      User.hasMany(models.Order)
      // User.belongsToMany(models.User, { through: models.Order, as: 'userOrders' })
    }

    static async validateUsernamePassword(username, password) {
      const user = await User.findOne({
        where: {
          username: username
        }
      });

      if (!user) {
        return "Invalid username";
      }

      const isPasswordCorrect = await compare(password, user.password);

      if (!isPasswordCorrect) {
        return "Invalid password";
      }

      return null;
    }
  }
  User.init({
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: "Username is required" },
        notNull: { msg: "Username is required" }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Password is required" },
        notNull: { msg: "Password is required" },
        passwordLength() {
          if (this.password && this.password.length < 8) {
            throw new Error('Password must be at least 8 characters')
          }
        }
      }
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Role is required" },
        notNull: { msg: "Role is required" }
      }
    },
  }, {
    sequelize,
    modelName: 'User',
  });

  User.beforeCreate((instance) => {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(instance.password, salt);

    instance.password = hash
  })


  return User;
};