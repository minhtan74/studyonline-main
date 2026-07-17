const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LessonProgress = sequelize.define(
  'LessonProgress',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    lesson_id: { type: DataTypes.INTEGER, allowNull: false },
    is_completed: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 0 },
    watched_sec: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    completed_at: { type: DataTypes.DATE, allowNull: true },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { tableName: 'lesson_progress' }
);

module.exports = LessonProgress;
