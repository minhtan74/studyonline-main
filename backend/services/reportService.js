const { QueryTypes } = require('sequelize');
const sequelize = require('../config/database');

async function getRevenueOverview() {
  const rows = await sequelize.query(
    `SELECT
        COALESCE(SUM(CASE WHEN status='completed' THEN amount ELSE 0 END), 0) AS total_revenue,
        COUNT(CASE WHEN status='completed' THEN 1 END) AS total_orders,
        COUNT(CASE WHEN status='pending'   THEN 1 END) AS pending_orders,
        COUNT(CASE WHEN status='failed'    THEN 1 END) AS failed_orders
     FROM payments`,
    { type: QueryTypes.SELECT }
  );
  return rows[0];
}

async function getRevenueByMethod() {
  return sequelize.query(
    `SELECT method, SUM(amount) AS revenue, COUNT(*) AS cnt
     FROM payments WHERE status='completed'
     GROUP BY method ORDER BY revenue DESC`,
    { type: QueryTypes.SELECT }
  );
}

async function getRecentPayments() {
  return sequelize.query(
    `SELECT p.id, p.amount, p.method, p.status, p.created_at,
            u.fullname AS user_name, c.title AS course_title
     FROM payments p
     JOIN users u ON u.id = p.user_id
     JOIN courses c ON c.id = p.course_id
     ORDER BY p.created_at DESC LIMIT 20`,
    { type: QueryTypes.SELECT }
  );
}

async function getTopCourses() {
  return sequelize.query(
    `SELECT c.id, c.title, c.thumbnail,
            u.fullname AS teacher_name,
            COUNT(DISTINCT e.user_id) AS student_count,
            COALESCE(SUM(CASE WHEN p.status='completed' THEN p.amount ELSE 0 END), 0) AS revenue
     FROM courses c
     LEFT JOIN users u ON u.id = c.teacher_id
     LEFT JOIN enrollments e ON e.course_id = c.id
     LEFT JOIN payments p ON p.course_id = c.id
     GROUP BY c.id, c.title, c.thumbnail, u.fullname
     ORDER BY revenue DESC, student_count DESC
     LIMIT 10`,
    { type: QueryTypes.SELECT }
  );
}

async function getNewStudents30() {
  const rows = await sequelize.query(
    `SELECT COUNT(*) AS cnt FROM users
     WHERE role='student' AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`,
    { type: QueryTypes.SELECT }
  );
  return parseInt(rows[0].cnt, 10);
}

async function getTotalStudents() {
  const rows = await sequelize.query(`SELECT COUNT(*) AS cnt FROM users WHERE role='student'`, {
    type: QueryTypes.SELECT,
  });
  return parseInt(rows[0].cnt, 10);
}

async function getRecentEnrollments() {
  return sequelize.query(
    `SELECT e.id, e.enroll_date, u.fullname AS user_name, u.email,
            c.title AS course_title,
            (SELECT COUNT(*) FROM lessons l JOIN chapters ch ON l.chapter_id=ch.id WHERE ch.course_id=c.id) AS total_lessons,
            (SELECT COUNT(*) FROM lesson_progress lp2 JOIN lessons l2 ON lp2.lesson_id=l2.id JOIN chapters ch2 ON l2.chapter_id=ch2.id WHERE ch2.course_id=c.id AND lp2.user_id=e.user_id AND lp2.is_completed=1) AS done_lessons
     FROM enrollments e
     JOIN users u ON u.id = e.user_id
     JOIN courses c ON c.id = e.course_id
     ORDER BY e.enroll_date DESC LIMIT 20`,
    { type: QueryTypes.SELECT }
  );
}

async function getAvgCompletionPct() {
  const rows = await sequelize.query(
    `SELECT AVG(
        CASE WHEN total_lessons > 0 THEN done_lessons * 100.0 / total_lessons ELSE 0 END
     ) AS avg_pct
     FROM (
        SELECT e.user_id, e.course_id,
            (SELECT COUNT(*) FROM lessons l JOIN chapters ch ON l.chapter_id=ch.id WHERE ch.course_id=e.course_id) AS total_lessons,
            (SELECT COUNT(*) FROM lesson_progress lp JOIN lessons l ON lp.lesson_id=l.id JOIN chapters ch ON l.chapter_id=ch.id WHERE ch.course_id=e.course_id AND lp.user_id=e.user_id AND lp.is_completed=1) AS done_lessons
        FROM enrollments e
     ) sub`,
    { type: QueryTypes.SELECT }
  );
  return parseFloat(rows[0].avg_pct ?? 0) || 0;
}

const pad2 = (n) => String(n).padStart(2, '0');

async function getWeeklyRevenue(range) {
  if (range === 'today') {
    const rows = await sequelize.query(
      `SELECT HOUR(paid_at) AS slot, SUM(amount) AS revenue, COUNT(*) AS orders
       FROM payments
       WHERE status='completed' AND DATE(paid_at) = CURDATE()
       GROUP BY HOUR(paid_at) ORDER BY slot ASC`,
      { type: QueryTypes.SELECT }
    );
    const map = {};
    for (const r of rows) map[parseInt(r.slot, 10)] = { revenue: parseFloat(r.revenue) || 0, orders: parseInt(r.orders, 10) };
    const weeklyData = [];
    for (let h = 0; h <= 23; h++) {
      weeklyData.push({
        label: `${pad2(h)}:00`,
        revenue: map[h]?.revenue ?? 0,
        orders: map[h]?.orders ?? 0,
      });
    }
    return weeklyData;
  }

  if (range === '30d') {
    const rows = await sequelize.query(
      `SELECT DATE(paid_at) AS day, SUM(amount) AS revenue, COUNT(*) AS orders
       FROM payments
       WHERE status='completed' AND paid_at >= DATE_SUB(CURDATE(), INTERVAL 29 DAY)
       GROUP BY DATE(paid_at) ORDER BY day ASC`,
      { type: QueryTypes.SELECT }
    );
    const map = {};
    for (const r of rows) {
      const key = r.day instanceof Date ? r.day.toISOString().slice(0, 10) : String(r.day);
      map[key] = { revenue: parseFloat(r.revenue) || 0, orders: parseInt(r.orders, 10) };
    }
    const weeklyData = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
      weeklyData.push({
        label: `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}`,
        revenue: map[dateStr]?.revenue ?? 0,
        orders: map[dateStr]?.orders ?? 0,
      });
    }
    return weeklyData;
  }

  if (range === '1y') {
    const rows = await sequelize.query(
      `SELECT DATE_FORMAT(paid_at, '%Y-%m') AS slot, SUM(amount) AS revenue, COUNT(*) AS orders
       FROM payments
       WHERE status='completed' AND paid_at >= DATE_SUB(CURDATE(), INTERVAL 11 MONTH)
       GROUP BY slot ORDER BY slot ASC`,
      { type: QueryTypes.SELECT }
    );
    const map = {};
    for (const r of rows) map[r.slot] = { revenue: parseFloat(r.revenue) || 0, orders: parseInt(r.orders, 10) };
    const weeklyData = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const slot = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
      weeklyData.push({
        label: `${pad2(d.getMonth() + 1)}/${d.getFullYear()}`,
        revenue: map[slot]?.revenue ?? 0,
        orders: map[slot]?.orders ?? 0,
      });
    }
    return weeklyData;
  }

  // 7d — hành vi mặc định
  const rows = await sequelize.query(
    `SELECT DATE(paid_at) AS day, SUM(amount) AS revenue, COUNT(*) AS orders
     FROM payments
     WHERE status='completed' AND paid_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
     GROUP BY DATE(paid_at) ORDER BY day ASC`,
    { type: QueryTypes.SELECT }
  );
  const map = {};
  for (const r of rows) {
    const key = r.day instanceof Date ? r.day.toISOString().slice(0, 10) : String(r.day);
    map[key] = { revenue: parseFloat(r.revenue) || 0, orders: parseInt(r.orders, 10) };
  }
  const weeklyData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
    weeklyData.push({
      label: `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}`,
      revenue: map[dateStr]?.revenue ?? 0,
      orders: map[dateStr]?.orders ?? 0,
    });
  }
  return weeklyData;
}

module.exports = {
  getRevenueOverview,
  getRevenueByMethod,
  getRecentPayments,
  getTopCourses,
  getNewStudents30,
  getTotalStudents,
  getRecentEnrollments,
  getAvgCompletionPct,
  getWeeklyRevenue,
};
