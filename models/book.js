'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Book extends Model {    
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Book.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Title is required"
        },
        notNull: {
          msg: "Title is required"
        },
      },
    },
    author: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Author is required"
        },
        notNull: {
          msg: "Author is required"
        },
      },
    },
    genre: {
      type: DataTypes.STRING,
    },
    year: {
      type: DataTypes.INTEGER,      
      allowNull: true,      
      validate: {
        is: {
          args: /^$|^\d{4}$/i,
          msg: "Year must be in format YYYY or empty."
        },
          
      },
    },
  }, {
    sequelize,
    modelName: 'Book',
  });
  return Book;
};