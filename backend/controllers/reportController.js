const { success, error } = require('../utils/response');
const reportService = require('../services/reportService');

const VALID_RANGES = ['today', '7d', '30d', '1y'];

/**
 * GET /api/reports/summary
 *
 * Tổng hợp dữ liệu báo cáo cho Admin Dashboard.
 */
async function summary(req, res) {
  const user = req.user;
  if (user.role !== 'admin') {
    return error(res, 'Chỉ Admin mới có thể xem báo cáo.', 403);
  }

  let range = String(req.query.range ?? '7d').trim();
  if (!VALID_RANGES.includes(range)) range = '7d';

  const [
    revRow,
    byMethod,
    recentPayments,
    topCourses,
    newStudents30,
    totalStudents,
    recentEnrollments,
    avgPct,
    weeklyData,
  ] = await Promise.all([
    reportService.getRevenueOverview(),
    reportService.getRevenueByMethod(),
    reportService.getRecentPayments(),
    reportService.getTopCourses(),
    reportService.getNewStudents30(),
    reportService.getTotalStudents(),
    reportService.getRecentEnrollments(),
    reportService.getAvgCompletionPct(),
    reportService.getWeeklyRevenue(range),
  ]);

  return success(res, {
    data: {
      overview: {
        total_revenue: parseFloat(revRow.total_revenue) || 0,
        total_orders: parseInt(revRow.total_orders, 10) || 0,
        pending_orders: parseInt(revRow.pending_orders, 10) || 0,
        failed_orders: parseInt(revRow.failed_orders, 10) || 0,
        total_students: totalStudents,
        new_students_30d: newStudents30,
        avg_completion_pct: Math.round(avgPct * 10) / 10,
      },
      revenue_by_method: byMethod,
      revenue_weekly: weeklyData,
      top_courses: topCourses,
      recent_payments: recentPayments,
      recent_enrollments: recentEnrollments,
    },
  });
}

module.exports = { summary };
