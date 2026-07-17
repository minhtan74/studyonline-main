const multer = require('multer');
const { error } = require('../utils/response');

// Nhận file vào bộ nhớ trước, kiểm tra MIME/size theo `type` (form field) trong
// controller — vì field `type` được gửi SAU field `file` trong FormData của
// frontend, storage trên đĩa (chọn thư mục theo type) sẽ không có `req.body.type`
// kịp lúc. Giới hạn 500MB là mức trần chung (video là loại lớn nhất được cho phép);
// giới hạn chính xác theo từng loại được kiểm tra thủ công trong controller.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 500 * 1024 * 1024 },
}).single('file');

module.exports = function handleUpload(req, res, next) {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return error(res, 'File vượt quá giới hạn upload_max_filesize trong php.ini.', 400);
      }
      return error(res, 'Lỗi upload không xác định.', 400);
    }
    if (err) return next(err);
    next();
  });
};
