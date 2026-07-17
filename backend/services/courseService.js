const { QueryTypes } = require('sequelize');
const sequelize = require('../config/database');
const Course = require('../models/Course');

async function getAll() {
  return sequelize.query(
    `SELECT c.*, u.fullname AS teacher_name
     FROM courses c
     LEFT JOIN users u ON c.teacher_id = u.id
     ORDER BY c.id DESC`,
    { type: QueryTypes.SELECT }
  );
}

async function find(id) {
  const rows = await sequelize.query(
    `SELECT c.*, u.fullname AS teacher_name
     FROM courses c
     LEFT JOIN users u ON c.teacher_id = u.id
     WHERE c.id = ?`,
    { replacements: [id], type: QueryTypes.SELECT }
  );
  return rows[0] || null;
}

async function create(teacherId, title, description, thumbnail = '') {
  const row = await Course.create({
    teacher_id: teacherId,
    title,
    description,
    thumbnail,
  });
  return row.id;
}

async function update(id, title, description, thumbnail = '') {
  const fields = { title, description };
  if (thumbnail) fields.thumbnail = thumbnail;
  await Course.update(fields, { where: { id } });
  return true;
}

async function remove(id) {
  await Course.destroy({ where: { id } });
  return true;
}

module.exports = { getAll, find, create, update, remove };
