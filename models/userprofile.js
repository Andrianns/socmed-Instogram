'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserProfile extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      UserProfile.belongsTo(models.User)
      UserProfile.hasMany(models.Post)
    }

    get fullName(){
      return this.firstName+" "+this.lastName
    }
  }
  UserProfile.init({
    firstName: {
      type:DataTypes.STRING,
      allowNull:false,
      validate:{
        notNull:{
          msg:'First Name cannot be empty.'
        },
        notEmpty:{
          msg:'First Name cannot be empty.'
        }
      }
    },
    lastName: {
      type:DataTypes.STRING,
      allowNull:false,
      validate:{
        notNull:{
          msg:'Last Name cannot be empty.'
        },
        notEmpty:{
          msg:'Last Name cannot be empty.'
        }
      }
    },
    gender: {
      type:DataTypes.STRING,
      allowNull:false,
      validate:{
        notNull:{
          msg:'Gender cannot be empty.'
        },
        notEmpty:{
          msg:'Gender cannot be empty.'
        }
      }
    },
    phoneNumber: {
      type:DataTypes.INTEGER,
      allowNull:false,
      validate:{
        notNull:{
          msg:'Phone Number cannot be empty.'
        },
        notEmpty:{
          msg:'Phone Number cannot be empty.'
        }
      }
    },
    UserId: {
      type:DataTypes.INTEGER
    }
  }, {
    sequelize,
    modelName: 'UserProfile',
  });
  return UserProfile;
};