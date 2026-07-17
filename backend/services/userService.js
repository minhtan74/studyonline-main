const bcrypt = require('bcrypt');
const User = require('../models/User');

const PUBLIC_FIELDS = ['id', 'fullname', 'email', 'role', 'created_at'];

async function getAll() {
  return User.findAll({ attributes: PUBLIC_FIELDS, order: [['id', 'DESC']], raw: true });
}

async function find(id) {
  return User.findOne({ where: { id }, attributes: PUBLIC_FIELDS, raw: true });
}

async function findByEmail(email) {
  return User.findOne({ where: { email }, raw: true });
}

async function create(fullname, email, password, role) {
  const hashed = await bcrypt.hash(password, 10);
  await User.create({ fullname, email, password: hashed, role });
  return true;
}

async function update(id, fullname, email, role) {
  await User.update({ fullname, email, role }, { where: { id } });
  return true;
}

async function remove(id) {
  await User.destroy({ where: { id } });
  return true;
}

/**
 * Đổi mật khẩu — trả về false nếu mật khẩu hiện tại sai.
 * Hỗ trợ cả plain-text (dữ liệu mẫu) lẫn bcrypt, giống backend PHP gốc.
 */
async function changePassword(id, oldPassword, newPassword) {
  const row = await User.findOne({ where: { id }, attributes: ['password'], raw: true });
  if (!row) return false;

  const stored = row.password;
  let correct = oldPassword === stored;
  if (!correct) {
    try {
      correct = await bcrypt.compare(oldPassword, stored);
    } catch (e) {
      correct = false;
    }
  }
  if (!correct) return false;

  const hashed = await bcrypt.hash(newPassword, 10);
  await User.update({ password: hashed }, { where: { id } });
  return true;
}

module.exports = { getAll, find, findByEmail, create, update, remove, changePassword };
