const appConfig = require('../config/app');

// eslint-disable-next-line no-unused-vars
module.exports = function errorHandler(err, req, res, next) {
  console.error(err);
  res.status(500).json({
    success: false,
    message: 'Lỗi hệ thống nghiêm trọng',
    error: appConfig.debug ? err.message : 'Internal Server Error',
  });
};
