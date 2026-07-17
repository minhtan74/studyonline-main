require('dotenv').config();

module.exports = {
  env: process.env.APP_ENV || 'production',
  debug: String(process.env.APP_DEBUG).toLowerCase() === 'true',
  url: process.env.APP_URL || 'http://localhost/studyonline',
  port: parseInt(process.env.PORT, 10) || 8000,
};
