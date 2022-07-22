'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Comment.belongsTo(models.Post)
      Comment.belongsTo(models.StrangerPost)
    }
  }
  Comment.init({
    comment: {
      type:DataTypes.STRING,
      allowNull:false,
      validate:{
        notNull:{
          msg:'Comment cannot be empty'
        },
        notEmpty:{
          msg:'Comment cannot be empty'
        },
        notContains: {
          args: 'kasar',
          msg: 'caption tidak bisa bahasa kasar'
        }
      }
    },
    PostId:{
      type: DataTypes.INTEGER
    }
  }, {
    sequelize,
    modelName: 'Comment',
  });
  return Comment;
};