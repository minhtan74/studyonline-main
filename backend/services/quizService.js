const { QueryTypes } = require('sequelize');
const sequelize = require('../config/database');
const Quiz = require('../models/Quiz');

async function getAll() {
  return sequelize.query(
    `SELECT q.*, c.title AS course_title
     FROM quizzes q
     JOIN courses c ON q.course_id = c.id
     ORDER BY q.created_at DESC`,
    { type: QueryTypes.SELECT }
  );
}

async function getByCourse(courseId) {
  return Quiz.findAll({ where: { course_id: courseId }, order: [['id', 'ASC']], raw: true });
}

async function find(id) {
  const rows = await sequelize.query(
    `SELECT q.*, c.title AS course_title
     FROM quizzes q
     JOIN courses c ON q.course_id = c.id
     WHERE q.id = ?`,
    { replacements: [id], type: QueryTypes.SELECT }
  );
  return rows[0] || null;
}

async function create(courseId, title, description) {
  const row = await Quiz.create({ course_id: courseId, title, description });
  return row.id;
}

async function update(id, courseId, title, description) {
  await Quiz.update({ course_id: courseId, title, description }, { where: { id } });
  return true;
}

async function remove(id) {
  await Quiz.destroy({ where: { id } });
  return true;
}

module.exports = { getAll, getByCourse, find, create, update, remove };
