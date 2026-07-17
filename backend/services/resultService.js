const { QueryTypes } = require('sequelize');
const sequelize = require('../config/database');
const Result = require('../models/Result');

async function getByUserAndQuiz(userId, quizId) {
  return Result.findOne({
    where: { user_id: userId, quiz_id: quizId },
    order: [['submit_time', 'DESC']],
    raw: true,
  });
}

async function getByUser(userId) {
  return sequelize.query(
    `SELECT r.*, q.title AS quiz_title, c.title AS course_title
     FROM results r
     JOIN quizzes q ON r.quiz_id = q.id
     JOIN courses c ON q.course_id = c.id
     WHERE r.user_id = ?
     ORDER BY r.submit_time DESC`,
    { replacements: [userId], type: QueryTypes.SELECT }
  );
}

async function store(userId, quizId, score, total) {
  const row = await Result.create({ user_id: userId, quiz_id: quizId, score, total });
  return row.id;
}

module.exports = { getByUserAndQuiz, getByUser, store };
