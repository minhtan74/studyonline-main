require('dotenv').config();
const { Sequelize } = require('sequelize');

const databaseUrl = process.env.DATABASE_URL;

const commonOptions = {
  dialect: 'mysql',
  logging: false,
  define: {
    timestamps: false,
    freezeTableName: true,
  },
};

const sequelize = databaseUrl
  ? new Sequelize(databaseUrl, commonOptions)
  : new Sequelize(
      process.env.DB_NAME || 'studyonline_db',
      process.env.DB_USER || 'root',
      process.env.DB_PASS || '',
      {
        host: process.env.DB_HOST || '127.0.0.1',
        port: Number.parseInt(process.env.DB_PORT, 10) || 3307,
        ...commonOptions,
      }
    );

module.exports = sequelize;
