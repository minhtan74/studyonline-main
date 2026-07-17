require('dotenv').config();

module.exports = {
  secret: process.env.JWT_SECRET || 'studyonline_super_secret_key_2026',
  expire: parseInt(process.env.JWT_EXPIRE, 10) || 604800, // 7 days in seconds
};
