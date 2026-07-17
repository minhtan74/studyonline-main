const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Enrollment = sequelize.define(
  'Enrollment',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    course_id: { type: DataTypes.INTEGER, allowNull: false },
    enroll_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { tableName: 'enrollments' }
);

module.exports = Enrollment;
