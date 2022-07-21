'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class StrangerPost extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      StrangerPost.hasMany(models.Comment)
    }
  }
  StrangerPost.init({
    caption: DataTypes.STRING,
    totalLike: DataTypes.INTEGER,
    imageUrl: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'StrangerPost',
  });
  return StrangerPost;
};