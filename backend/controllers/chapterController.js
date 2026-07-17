const { success, error } = require('../utils/response');
const chapterService = require('../services/chapterService');

async function index(req, res) {
  const id = req.query.id ? parseInt(req.query.id, 10) : null;
  const courseId = req.query.course_id ? parseInt(req.query.course_id, 10) : null;

  if (id) {
    const chapter = await chapterService.find(id);
    if (!chapter) {
      return error(res, 'Không tìm thấy chương.', 404);
    }
    return success(res, { data: chapter });
  } else if (courseId) {
    return success(res, { data: await chapterService.getByCourse(courseId) });
  }
  return error(res, 'Cần truyền course_id hoặc id.');
}

async function create(req, res) {
  const input = req.body || {};
  const courseId = parseInt(input.course_id ?? 0, 10);
  const chapterName = String(input.chapter_name ?? '').trim();

  if (!courseId || !chapterName) {
    return error(res, 'Dữ liệu không hợp lệ.');
  }

  const id = await chapterService.create(courseId, chapterName);
  return success(res, { id }, 'Tạo thành công');
}

async function update(req, res) {
  const input = req.body || {};
  const id = parseInt(input.id ?? 0, 10);
  const chapterName = String(input.chapter_name ?? '').trim();

  if (!id || !chapterName) {
    return error(res, 'Dữ liệu không hợp lệ.');
  }

  await chapterService.update(id, chapterName);
  return success(res, [], 'Cập nhật thành công');
}

async function remove(req, res) {
  const id = parseInt(req.query.id ?? 0, 10);
  if (!id) {
    return error(res, 'Thiếu ID.');
  }

  await chapterService.remove(id);
  return success(res, [], 'Xóa thành công');
}

module.exports = { index, create, update, remove };
