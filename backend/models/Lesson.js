const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Lesson = sequelize.define(
  'Lesson',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    chapter_id: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    video_url: { type: DataTypes.STRING(500), allowNull: true },
    document_url: { type: DataTypes.STRING(500), allowNull: true },
    duration: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    order_index: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    is_free: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 0 },
    status: { type: DataTypes.ENUM('draft', 'published'), defaultValue: 'draft' },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { tableName: 'lessons' }
);

module.exports = Lesson;
