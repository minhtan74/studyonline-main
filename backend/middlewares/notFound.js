const { error } = require('../utils/response');

module.exports = function notFound(req, res) {
  error(res, `Đường dẫn API '${req.path}' cho method '${req.method}' không được tìm thấy.`, 404);
};
