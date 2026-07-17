const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Result = sequelize.define(
  'Result',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    quiz_id: { type: DataTypes.INTEGER, allowNull: false },
    score: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    total: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    submit_time: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { tableName: 'results' }
);

module.exports = Result;
