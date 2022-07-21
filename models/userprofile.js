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
    },
    lastName: {
      type:DataTypes.STRING,
    },
    gender: {
      type:DataTypes.STRING,
    },
    phoneNumber: {
      type:DataTypes.INTEGER,
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