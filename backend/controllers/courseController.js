const { success, error } = require('../utils/response');
const courseService = require('../services/courseService');

async function index(req, res) {
  const id = req.query.id ? parseInt(req.query.id, 10) : null;

  if (id) {
    const course = await courseService.find(id);
    if (!course) {
      return error(res, 'Không tìm thấy khóa học.', 404);
    }
    return success(res, { data: course });
  }

  return success(res, { data: await courseService.getAll() });
}

async function create(req, res) {
  const user = req.user;
  const input = req.body || {};
  const title = String(input.title ?? '').trim();
  const description = String(input.description ?? '').trim();
  const thumbnail = String(input.thumbnail ?? '').trim();

  if (!title) {
    return error(res, 'Tiêu đề không được trống.');
  }

  const id = await courseService.create(user.id, title, description, thumbnail);
  return success(res, { id }, 'Tạo thành công');
}

async function update(req, res) {
  const input = req.body || {};
  const id = parseInt(input.id ?? 0, 10);
  const title = String(input.title ?? '').trim();
  const description = String(input.description ?? '').trim();
  const thumbnail = String(input.thumbnail ?? '').trim();

  if (!id || !title) {
    return error(res, 'Dữ liệu không hợp lệ.');
  }

  await courseService.update(id, title, description, thumbnail);
  return success(res, [], 'Cập nhật thành công');
}

async function remove(req, res) {
  const id = parseInt(req.query.id ?? 0, 10);
  if (!id) {
    return error(res, 'Thiếu ID.');
  }

  await courseService.remove(id);
  return success(res, [], 'Xóa thành công');
}

module.exports = { index, create, update, remove };
