const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Chapter = sequelize.define(
  'Chapter',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    course_id: { type: DataTypes.INTEGER, allowNull: false },
    chapter_name: { type: DataTypes.STRING(255), allowNull: false },
    order_index: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { tableName: 'chapters' }
);

module.exports = Chapter;
