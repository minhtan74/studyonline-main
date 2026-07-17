const bcrypt = require('bcrypt');
const { success, error } = require('../utils/response');
const jwtUtil = require('../utils/jwt');
const userService = require('../services/userService');

async function login(req, res) {
  const data = req.body || {};
  const email = String(data.email ?? '').trim();
  const password = String(data.password ?? '').trim();

  if (!email || !password) {
    return error(res, 'Email và mật khẩu không được để trống.');
  }

  const user = await userService.findByEmail(email);

  const passwordOk =
    user && (password === user.password || (await bcrypt.compare(password, user.password).catch(() => false)));

  if (!user || !passwordOk) {
    return error(res, 'Email hoặc mật khẩu không chính xác.', 401);
  }

  const token = jwtUtil.sign({
    id: user.id,
    fullname: user.fullname,
    email: user.email,
    role: user.role,
  });

  return success(res, {
    token,
    user: {
      id: user.id,
      fullname: user.fullname,
      email: user.email,
      role: user.role,
    },
  });
}

async function register(req, res) {
  const data = req.body || {};
  const fullname = String(data.fullname ?? '').trim();
  const email = String(data.email ?? '').trim();
  const password = String(data.password ?? '').trim();
  const confirmPassword = String(data.confirm_password ?? '').trim();

  if (!fullname || !email || !password || !confirmPassword) {
    return error(res, 'Vui lòng nhập đầy đủ thông tin.');
  }

  if (password !== confirmPassword) {
    return error(res, 'Mật khẩu xác nhận không khớp.');
  }

  if (await userService.findByEmail(email)) {
    return error(res, 'Email này đã được đăng ký.', 409);
  }

  await userService.create(fullname, email, password, 'student');
  return success(res, [], 'Đăng ký thành công! Hãy đăng nhập.');
}

async function me(req, res) {
  const payload = req.user;
  return success(res, {
    user: {
      id: payload.id,
      fullname: payload.fullname,
      email: payload.email,
      role: payload.role,
    },
  });
}

async function logout(req, res) {
  return success(res, [], 'Đăng xuất thành công.');
}

async function changePassword(req, res) {
  const user = req.user;
  const data = req.body || {};
  const oldPassword = String(data.old_password ?? '').trim();
  const newPassword = String(data.new_password ?? '').trim();

  if (!oldPassword || !newPassword) {
    return error(res, 'Vui lòng nhập đầy đủ mật khẩu cũ và mới.');
  }
  if (newPassword.length < 6) {
    return error(res, 'Mật khẩu mới phải có ít nhất 6 ký tự.');
  }

  const changed = await userService.changePassword(user.id, oldPassword, newPassword);

  if (changed) {
    return success(res, [], 'Đổi mật khẩu thành công!');
  }
  return error(res, 'Mật khẩu hiện tại không đúng.', 400);
}

module.exports = { login, register, me, logout, changePassword };
