const { success, error } = require('../utils/response');
const userService = require('../services/userService');

const VALID_ROLES = ['admin', 'teacher', 'student'];

async function index(req, res) {
  const currentUser = req.user;
  const id = req.query.id ? parseInt(req.query.id, 10) : null;

  if (id) {
    if (currentUser.role !== 'admin' && currentUser.id !== id) {
      return error(res, 'Bạn không có quyền xem thông tin người dùng này.', 403);
    }
    const user = await userService.find(id);
    if (!user) {
      return error(res, 'Không tìm thấy người dùng.', 404);
    }
    return success(res, { data: user });
  }

  return success(res, { data: await userService.getAll() });
}

async function create(req, res) {
  const input = req.body || {};
  const fullname = String(input.fullname ?? '').trim();
  const email = String(input.email ?? '').trim();
  const password = String(input.password ?? '').trim();
  const role = String(input.role ?? 'student').trim();

  if (!fullname || !email || !password) {
    return error(res, 'Vui lòng nhập đầy đủ thông tin.');
  }
  if (!VALID_ROLES.includes(role)) {
    return error(res, 'Vai trò không hợp lệ.');
  }

  if (await userService.findByEmail(email)) {
    return error(res, 'Email này đã tồn tại.', 409);
  }

  await userService.create(fullname, email, password, role);
  return success(res, [], 'Tạo người dùng thành công');
}

async function update(req, res) {
  const currentUser = req.user;
  const input = req.body || {};
  const id = parseInt(input.id ?? 0, 10);
  const fullname = String(input.fullname ?? '').trim();
  const email = String(input.email ?? '').trim();
  const role = String(input.role ?? '').trim();

  if (!id || !fullname || !email || !role) {
    return error(res, 'Dữ liệu không hợp lệ.');
  }

  if (currentUser.role !== 'admin') {
    if (currentUser.id !== id) {
      return error(res, 'Bạn không có quyền cập nhật người dùng này.', 403);
    }
    if (role !== currentUser.role) {
      return error(res, 'Bạn không có quyền thay đổi vai trò của chính mình.', 403);
    }
  }

  if (!VALID_ROLES.includes(role)) {
    return error(res, 'Vai trò không hợp lệ.');
  }

  await userService.update(id, fullname, email, role);
  return success(res, [], 'Cập nhật người dùng thành công');
}

async function remove(req, res) {
  const id = parseInt(req.query.id ?? 0, 10);
  if (!id) {
    return error(res, 'Thiếu ID.');
  }

  const currentUser = req.user;
  if (currentUser && currentUser.id === id) {
    return error(res, 'Bạn không thể tự xóa tài khoản của chính mình.');
  }

  await userService.remove(id);
  return success(res, [], 'Xóa người dùng thành công');
}

module.exports = { index, create, update, remove };
