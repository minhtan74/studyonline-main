const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Question = sequelize.define(
  'Question',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    quiz_id: { type: DataTypes.INTEGER, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    option_a: { type: DataTypes.STRING(255), allowNull: false },
    option_b: { type: DataTypes.STRING(255), allowNull: false },
    option_c: { type: DataTypes.STRING(255), allowNull: false },
    option_d: { type: DataTypes.STRING(255), allowNull: false },
    correct_answer: { type: DataTypes.ENUM('A', 'B', 'C', 'D'), allowNull: false },
    order_index: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  },
  { tableName: 'questions' }
);

module.exports = Question;
