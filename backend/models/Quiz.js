const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Quiz = sequelize.define(
  'Quiz',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    course_id: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { tableName: 'quizzes' }
);

module.exports = Quiz;
