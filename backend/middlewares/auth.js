const jwtUtil = require('../utils/jwt');
const { error } = require('../utils/response');

function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return error(res, 'Chưa đăng nhập. Vui lòng cung cấp mã token hợp lệ.', 401);
  }

  const token = authHeader.substring(7);
  const payload = jwtUtil.verify(token);

  if (!payload) {
    return error(res, 'Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.', 401);
  }

  req.user = payload;
  next();
}

module.exports = { authenticate };
