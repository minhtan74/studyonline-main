const { QueryTypes } = require('sequelize');
const sequelize = require('../config/database');

async function getByUser(userId) {
  return sequelize.query(
    `SELECT e.*, c.title, c.description, c.price, c.level, c.thumbnail, c.slug
     FROM enrollments e JOIN courses c ON c.id = e.course_id
     WHERE e.user_id = ? ORDER BY e.enroll_date DESC`,
    { replacements: [userId], type: QueryTypes.SELECT }
  );
}

async function isEnrolled(userId, courseId) {
  const rows = await sequelize.query(
    'SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?',
    { replacements: [userId, courseId], type: QueryTypes.SELECT }
  );
  return rows.length > 0;
}

async function enroll(userId, courseId) {
  await sequelize.query('INSERT IGNORE INTO enrollments (user_id, course_id) VALUES (?, ?)', {
    replacements: [userId, courseId],
    type: QueryTypes.INSERT,
  });
  return true;
}

async function unenroll(userId, courseId) {
  await sequelize.query('DELETE FROM enrollments WHERE user_id = ? AND course_id = ?', {
    replacements: [userId, courseId],
    type: QueryTypes.DELETE,
  });
  return true;
}

async function getEnrolledCourseIds(userId) {
  const rows = await sequelize.query('SELECT course_id FROM enrollments WHERE user_id = ?', {
    replacements: [userId],
    type: QueryTypes.SELECT,
  });
  return rows.map((r) => r.course_id);
}

async function getAll() {
  return sequelize.query(
    `SELECT e.*, u.fullname AS user_name, u.email AS user_email, c.title AS course_title, c.teacher_id, c.thumbnail, c.price,
        (SELECT COUNT(*) FROM lessons l JOIN chapters ch ON l.chapter_id = ch.id WHERE ch.course_id = c.id) AS total_lessons,
        (SELECT COUNT(*) FROM lesson_progress lp JOIN lessons l ON lp.lesson_id = l.id JOIN chapters ch ON l.chapter_id = ch.id WHERE ch.course_id = c.id AND lp.user_id = e.user_id AND lp.is_completed = 1) AS completed_lessons,
        (SELECT ROUND(AVG(r.score * 100.0 / NULLIF(r.total, 0))) FROM results r JOIN quizzes q ON r.quiz_id = q.id WHERE q.course_id = c.id AND r.user_id = e.user_id) AS avg_quiz_score
     FROM enrollments e
     JOIN users u ON u.id = e.user_id
     JOIN courses c ON c.id = e.course_id
     ORDER BY e.enroll_date DESC`,
    { type: QueryTypes.SELECT }
  );
}

async function getByTeacher(teacherId) {
  return sequelize.query(
    `SELECT e.*, u.fullname AS user_name, u.email AS user_email, c.title AS course_title, c.thumbnail, c.price,
        (SELECT COUNT(*) FROM lessons l JOIN chapters ch ON l.chapter_id = ch.id WHERE ch.course_id = c.id) AS total_lessons,
        (SELECT COUNT(*) FROM lesson_progress lp JOIN lessons l ON lp.lesson_id = l.id JOIN chapters ch ON l.chapter_id = ch.id WHERE ch.course_id = c.id AND lp.user_id = e.user_id AND lp.is_completed = 1) AS completed_lessons,
        (SELECT ROUND(AVG(r.score * 100.0 / NULLIF(r.total, 0))) FROM results r JOIN quizzes q ON r.quiz_id = q.id WHERE q.course_id = c.id AND r.user_id = e.user_id) AS avg_quiz_score
     FROM enrollments e
     JOIN users u ON u.id = e.user_id
     JOIN courses c ON c.id = e.course_id
     WHERE c.teacher_id = ?
     ORDER BY e.enroll_date DESC`,
    { replacements: [teacherId], type: QueryTypes.SELECT }
  );
}

module.exports = {
  getByUser,
  isEnrolled,
  enroll,
  unenroll,
  getEnrolledCourseIds,
  getAll,
  getByTeacher,
};
