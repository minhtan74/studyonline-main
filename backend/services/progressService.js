const { QueryTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * INSERT hoặc UPDATE tiến độ 1 bài học của 1 user.
 * Nếu is_completed = 1 thì ghi completed_at, ngược lại giữ NULL.
 */
async function upsertProgress(userId, lessonId, watchedSec, isCompleted) {
  const completedAt = isCompleted
    ? new Date().toISOString().slice(0, 19).replace('T', ' ')
    : null;

  await sequelize.query(
    `INSERT INTO lesson_progress (user_id, lesson_id, is_completed, watched_sec, completed_at)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
         watched_sec  = GREATEST(watched_sec, VALUES(watched_sec)),
         is_completed = GREATEST(is_completed, VALUES(is_completed)),
         completed_at = CASE
             WHEN VALUES(is_completed) = 1 AND completed_at IS NULL THEN VALUES(completed_at)
             ELSE completed_at
         END,
         updated_at   = CURRENT_TIMESTAMP`,
    { replacements: [userId, lessonId, isCompleted, watchedSec, completedAt], type: QueryTypes.INSERT }
  );
  return true;
}

async function getByUser(userId) {
  return sequelize.query(
    `SELECT
        lp.*,
        l.title        AS lesson_title,
        l.duration     AS lesson_duration,
        l.chapter_id,
        ch.course_id,
        c.title        AS course_title
     FROM lesson_progress lp
     JOIN lessons  l  ON l.id  = lp.lesson_id
     JOIN chapters ch ON ch.id = l.chapter_id
     JOIN courses  c  ON c.id  = ch.course_id
     WHERE lp.user_id = ?
     ORDER BY lp.updated_at DESC`,
    { replacements: [userId], type: QueryTypes.SELECT }
  );
}

async function getCompletedLessonIds(userId, courseId) {
  const rows = await sequelize.query(
    `SELECT lp.lesson_id
     FROM lesson_progress lp
     JOIN lessons  l  ON l.id  = lp.lesson_id
     JOIN chapters ch ON ch.id = l.chapter_id
     WHERE lp.user_id = ? AND ch.course_id = ? AND lp.is_completed = 1`,
    { replacements: [userId, courseId], type: QueryTypes.SELECT }
  );
  return rows.map((r) => r.lesson_id);
}

async function getProgressByCourse(userId) {
  return sequelize.query(
    `SELECT
        c.id                                                        AS course_id,
        c.title                                                     AS course_title,
        c.thumbnail,
        COUNT(DISTINCT l.id)                                        AS total_lessons,
        COUNT(DISTINCT CASE WHEN lp.is_completed = 1 THEN l.id END) AS done_lessons,
        COALESCE(SUM(lp.watched_sec), 0)                            AS watched_sec_total
     FROM courses c
     JOIN chapters ch ON ch.course_id = c.id
     JOIN lessons  l  ON l.chapter_id  = ch.id
     LEFT JOIN lesson_progress lp
         ON lp.lesson_id = l.id AND lp.user_id = ?
     WHERE c.id IN (
         SELECT course_id FROM enrollments WHERE user_id = ?
         UNION
         SELECT ch2.course_id
         FROM lesson_progress lp2
         JOIN lessons l2 ON l2.id = lp2.lesson_id
         JOIN chapters ch2 ON ch2.id = l2.chapter_id
         WHERE lp2.user_id = ?
     )
     GROUP BY c.id, c.title, c.thumbnail
     ORDER BY done_lessons DESC`,
    { replacements: [userId, userId, userId], type: QueryTypes.SELECT }
  );
}

/**
 * Số bài hoàn thành theo từng ngày trong 7 ngày gần nhất.
 * Trả về mảng có đúng 7 phần tử, index 0 = 6 ngày trước, index 6 = hôm nay.
 */
async function getWeeklyProgress(userId) {
  const rows = await sequelize.query(
    `SELECT DATE(completed_at) AS day, COUNT(*) AS cnt
     FROM lesson_progress
     WHERE user_id = ?
       AND is_completed = 1
       AND completed_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
     GROUP BY DATE(completed_at)`,
    { replacements: [userId], type: QueryTypes.SELECT }
  );

  const map = {};
  for (const r of rows) {
    const key = r.day instanceof Date ? r.day.toISOString().slice(0, 10) : String(r.day);
    map[key] = parseInt(r.cnt, 10);
  }

  const pad = (n) => String(n).padStart(2, '0');
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const label = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
    result.push({ date: dateStr, label, count: map[dateStr] || 0 });
  }
  return result;
}

async function getTotalWatchedSec(userId) {
  const rows = await sequelize.query(
    `SELECT COALESCE(SUM(watched_sec), 0) AS total FROM lesson_progress WHERE user_id = ?`,
    { replacements: [userId], type: QueryTypes.SELECT }
  );
  return parseInt(rows[0]?.total ?? 0, 10);
}

/**
 * Lấy danh sách bài hoàn thành gần nhất của user (kèm tên bài và tên khóa học).
 */
async function getRecentCompleted(userId, limit = 10) {
  return sequelize.query(
    `SELECT
        lp.lesson_id,
        lp.completed_at,
        l.title         AS lesson_title,
        c.title         AS course_title,
        c.id            AS course_id
     FROM lesson_progress lp
     JOIN lessons  l  ON l.id  = lp.lesson_id
     JOIN chapters ch ON ch.id = l.chapter_id
     JOIN courses  c  ON c.id  = ch.course_id
     WHERE lp.user_id = ? AND lp.is_completed = 1 AND lp.completed_at IS NOT NULL
     ORDER BY lp.completed_at DESC
     LIMIT ?`,
    { replacements: [userId, limit], type: QueryTypes.SELECT }
  );
}

module.exports = {
  upsertProgress,
  getByUser,
  getCompletedLessonIds,
  getProgressByCourse,
  getWeeklyProgress,
  getTotalWatchedSec,
  getRecentCompleted,
};
