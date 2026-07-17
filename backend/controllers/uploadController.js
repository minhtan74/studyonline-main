const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { success, error } = require('../utils/response');

const ALLOWED_VIDEO = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-matroska'];
const ALLOWED_DOCUMENT = ['application/pdf'];
const ALLOWED_IMAGE = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

/**
 * POST /api/upload
 *
 * multipart/form-data với field:
 *   - file  : file video (mp4, webm, mkv, ...) hoặc PDF
 *   - type  : 'video' | 'document' | 'image'
 *
 * Trả về: { url: "http://..." }
 */
async function upload(req, res) {
  if (!req.file) {
    return error(res, 'Không có file được gửi lên.', 400);
  }

  const file = req.file;
  const type = String(req.body.type ?? 'document').trim();
  const mimeType = file.mimetype;

  let subDir;
  if (type === 'video') {
    if (!ALLOWED_VIDEO.includes(mimeType)) {
      return error(res, 'Chỉ chấp nhận file video (mp4, webm, ogg, mov, mkv).', 400);
    }
    subDir = 'videos';
  } else if (type === 'image') {
    if (!ALLOWED_IMAGE.includes(mimeType)) {
      return error(res, 'Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WebP).', 400);
    }
    subDir = 'images';
  } else {
    if (!ALLOWED_DOCUMENT.includes(mimeType)) {
      return error(res, 'Chỉ chấp nhận file PDF.', 400);
    }
    subDir = 'documents';
  }

  // Giới hạn dung lượng: video 500 MB, PDF 20 MB, ảnh 5 MB
  const maxBytesMap = { video: 500 * 1024 * 1024, image: 5 * 1024 * 1024 };
  const maxBytes = maxBytesMap[type] ?? 20 * 1024 * 1024;
  const limitLabelMap = { video: '500MB', image: '5MB' };
  const limitLabel = limitLabelMap[type] ?? '20MB';

  if (file.size > maxBytes) {
    return error(res, `File quá lớn. Giới hạn: ${limitLabel}.`, 400);
  }

  // Tạo thư mục lưu file
  const uploadDir = path.join(__dirname, '..', 'public', 'uploads', subDir);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Tên file an toàn = timestamp + random + extension gốc
  const ext = path.extname(file.originalname).replace('.', '').toLowerCase();
  const filename = `${Math.floor(Date.now() / 1000)}_${crypto.randomBytes(6).toString('hex')}.${ext}`;
  const destPath = path.join(uploadDir, filename);

  try {
    fs.writeFileSync(destPath, file.buffer);
  } catch (e) {
    return error(res, 'Không thể lưu file lên server. Kiểm tra quyền thư mục.', 500);
  }

  // Xây dựng URL có thể truy cập
  const scheme = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
  const host = req.headers.host || 'localhost:8000';
  const fileUrl = `${scheme}://${host}/uploads/${subDir}/${filename}`;

  return success(res, { url: fileUrl }, 'Upload thành công.');
}

module.exports = { upload };
