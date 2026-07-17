const { success, error } = require('../utils/response');
const lessonService = require('../services/lessonService');

async function index(req, res) {
  const id = req.query.id ? parseInt(req.query.id, 10) : null;
  const chapterId = req.query.chapter_id ? parseInt(req.query.chapter_id, 10) : null;

  if (id) {
    const lesson = await lessonService.find(id);
    if (!lesson) {
      return error(res, 'Không tìm thấy bài học.', 404);
    }
    return success(res, { data: lesson });
  } else if (chapterId) {
    return success(res, { data: await lessonService.getByChapter(chapterId) });
  }
  return error(res, 'Cần truyền chapter_id hoặc id.');
}

async function create(req, res) {
  const input = req.body || {};
  const chapterId = parseInt(input.chapter_id ?? 0, 10);
  const title = String(input.title ?? '').trim();
  const description = String(input.description ?? '').trim();
  const videoUrl = String(input.video_url ?? '').trim();
  const documentUrl = String(input.document_url ?? '').trim();

  if (!chapterId || !title) {
    return error(res, 'Dữ liệu không hợp lệ.');
  }

  const id = await lessonService.create(chapterId, title, description, videoUrl, documentUrl);
  return success(res, { id }, 'Tạo thành công');
}

async function update(req, res) {
  const input = req.body || {};
  const id = parseInt(input.id ?? 0, 10);
  const title = String(input.title ?? '').trim();
  const description = String(input.description ?? '').trim();
  const videoUrl = String(input.video_url ?? '').trim();
  const documentUrl = String(input.document_url ?? '').trim();

  if (!id || !title) {
    return error(res, 'Dữ liệu không hợp lệ.');
  }

  await lessonService.update(id, title, description, videoUrl, documentUrl);
  return success(res, [], 'Cập nhật thành công');
}

async function remove(req, res) {
  const id = parseInt(req.query.id ?? 0, 10);
  if (!id) {
    return error(res, 'Thiếu ID.');
  }

  await lessonService.remove(id);
  return success(res, [], 'Xóa thành công');
}

module.exports = { index, create, update, remove };
