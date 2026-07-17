const { QueryTypes } = require('sequelize');
const sequelize = require('../config/database');

async function create(userId, courseId, amount, method, ref = '') {
  const result = await sequelize.query(
    `INSERT INTO payments (user_id, course_id, amount, method, status, transaction_ref)
     VALUES (?, ?, ?, ?, 'pending', ?)`,
    { replacements: [userId, courseId, amount, method, ref], type: QueryTypes.INSERT }
  );
  // mysql2 INSERT via sequelize.query returns [insertId, affectedRows]
  return Array.isArray(result) ? result[0] : result;
}

async function complete(paymentId, ref = '') {
  await sequelize.query(
    `UPDATE payments SET status='completed', transaction_ref=?, paid_at=NOW() WHERE id=? AND status='pending'`,
    { replacements: [ref, paymentId], type: QueryTypes.UPDATE }
  );
  return true;
}

async function fail(paymentId, note = '') {
  await sequelize.query(`UPDATE payments SET status='failed', note=? WHERE id=?`, {
    replacements: [note, paymentId],
    type: QueryTypes.UPDATE,
  });
  return true;
}

async function getByUser(userId) {
  return sequelize.query(
    `SELECT p.*, c.title AS course_title FROM payments p
     JOIN courses c ON c.id=p.course_id WHERE p.user_id=? ORDER BY p.created_at DESC`,
    { replacements: [userId], type: QueryTypes.SELECT }
  );
}

async function find(id) {
  const rows = await sequelize.query('SELECT * FROM payments WHERE id=?', {
    replacements: [id],
    type: QueryTypes.SELECT,
  });
  return rows[0] || null;
}

async function hasPaid(userId, courseId) {
  const rows = await sequelize.query(
    `SELECT id FROM payments WHERE user_id=? AND course_id=? AND status='completed'`,
    { replacements: [userId, courseId], type: QueryTypes.SELECT }
  );
  return rows.length > 0;
}

async function getByTeacher(teacherId) {
  return sequelize.query(
    `SELECT p.*, u.fullname AS user_name, c.title AS course_title
     FROM payments p
     JOIN users u ON u.id=p.user_id
     JOIN courses c ON c.id=p.course_id
     WHERE c.teacher_id=?
     ORDER BY p.created_at DESC`,
    { replacements: [teacherId], type: QueryTypes.SELECT }
  );
}

async function getAll() {
  return sequelize.query(
    `SELECT p.*, u.fullname AS user_name, c.title AS course_title
     FROM payments p JOIN users u ON u.id=p.user_id JOIN courses c ON c.id=p.course_id
     ORDER BY p.created_at DESC`,
    { type: QueryTypes.SELECT }
  );
}

module.exports = { create, complete, fail, getByUser, find, hasPaid, getByTeacher, getAll };
