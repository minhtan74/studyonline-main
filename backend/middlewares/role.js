const { authenticate } = require('./auth');
const { error } = require('../utils/response');

/**
 * Xác thực người dùng hiện tại có vai trò nằm trong danh sách cho phép
 */
function requireRole(...roles) {
  return [
    authenticate,
    (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return error(res, 'Bạn không có quyền thực hiện thao tác này.', 403);
      }
      next();
    },
  ];
}

module.exports = { requireRole };
