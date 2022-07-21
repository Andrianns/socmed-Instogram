'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Post.belongsTo(models.UserProfile)
      Post.hasMany(models.Comment)
    }
  }
  Post.init({
    caption: DataTypes.STRING,
    totalLike: DataTypes.INTEGER,
    imageUrl: DataTypes.STRING,
    UserProfileId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Post',
    hooks:{
      beforeCreate(post,options){
        post.totalLike = 0
      }
    }
  });
  return Post;
};