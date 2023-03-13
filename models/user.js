'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');
var validator = require('validator');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasOne(models.UserProfile);
    }
  }
  User.init(
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          msg: 'Email is already exists',
        },
        validate: {
          notNull: {
            msg: 'Username cannot be empty.',
          },
          notEmpty: {
            msg: 'Username cannot be empty.',
          },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          msg: 'Email is already exists',
        },
        validate: {
          notNull: {
            msg: 'Email cannot be empty.',
          },
          notEmpty: {
            msg: 'Email cannot be empty.',
          },
          isEmail: {
            args: true,
            msg: 'harus memasukan email',
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Password cannot be empty.',
          },
          notEmpty: {
            msg: 'Password cannot be empty.',
          },
          min: {
            args: 8,
            msg: 'password minimal 8 huruf',
          },
        },
      },
      role: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: 'User',
    }
  );
  User.beforeCreate((instance, options) => {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(instance.password, salt);
    instance.password = hash;
  });
  return User;
};
