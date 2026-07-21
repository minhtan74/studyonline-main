require('dotenv').config();
const { Sequelize } = require('sequelize');

const host = process.env.DB_HOST || '127.0.0.1';
const port = process.env.DB_PORT || '3307';
const database = process.env.DB_NAME || 'studyonline_db';
const username = process.env.DB_USER || 'root';
const password = process.env.DB_PASS || '';

const sequelize = new Sequelize(database, username, password, {
  host,
  port,
  dialect: 'mysql',
  logging: false,
  define: {
    timestamps: false,
    freezeTableName: true,
  },
});

module.exports = sequelize;
