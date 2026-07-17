<?php
namespace App\Controllers;

use App\Core\Controller;
use App\Core\Database;
use App\Middleware\JwtMiddleware;

/**
 * GET /api/reports/summary
 *
 * Tổng hợp dữ liệu báo cáo cho Admin Dashboard.
 * Thực hiện các aggregate query nặng một lần, trả về JSON hoàn chỉnh.
 */
class ReportController extends Controller
{
    public function summary(): void
    {
        $user = JwtMiddleware::handle();
        if ($user['role'] !== 'admin') {
            $this->error('Chỉ Admin mới có thể xem báo cáo.', 403);
            return;
        }

        $db = Database::connect();

        // ── 1. Tổng quan doanh thu ─────────────────────────────────────────
        $revRow = $db->query(
            "SELECT
                COALESCE(SUM(CASE WHEN status='completed' THEN amount ELSE 0 END), 0) AS total_revenue,
                COUNT(CASE WHEN status='completed' THEN 1 END) AS total_orders,
                COUNT(CASE WHEN status='pending'   THEN 1 END) AS pending_orders,
                COUNT(CASE WHEN status='failed'    THEN 1 END) AS failed_orders
             FROM payments"
        )->fetch();

        // ── 2. Doanh thu theo phương thức ─────────────────────────────────
        $byMethod = $db->query(
            "SELECT method, SUM(amount) AS revenue, COUNT(*) AS cnt
             FROM payments WHERE status='completed'
             GROUP BY method ORDER BY revenue DESC"
        )->fetchAll();

        // ── 3. Giao dịch gần đây (20 giao dịch mới nhất) ─────────────────
        $recentPayments = $db->query(
            "SELECT p.id, p.amount, p.method, p.status, p.created_at,
                    u.fullname AS user_name, c.title AS course_title
             FROM payments p
             JOIN users u ON u.id = p.user_id
             JOIN courses c ON c.id = p.course_id
             ORDER BY p.created_at DESC LIMIT 20"
        )->fetchAll();

        // ── 4. Top khóa học (doanh thu + số học viên) ──────────────────────
        $topCourses = $db->query(
            "SELECT c.id, c.title, c.thumbnail,
                    u.fullname AS teacher_name,
                    COUNT(DISTINCT e.user_id) AS student_count,
                    COALESCE(SUM(CASE WHEN p.status='completed' THEN p.amount ELSE 0 END), 0) AS revenue
             FROM courses c
             LEFT JOIN users u ON u.id = c.teacher_id
             LEFT JOIN enrollments e ON e.course_id = c.id
             LEFT JOIN payments p ON p.course_id = c.id
             GROUP BY c.id, c.title, c.thumbnail, u.fullname
             ORDER BY revenue DESC, student_count DESC
             LIMIT 10"
        )->fetchAll();

        // ── 5. Số học viên mới trong 30 ngày ──────────────────────────────
        $newStudents30 = (int)$db->query(
            "SELECT COUNT(*) FROM users
             WHERE role='student' AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)"
        )->fetchColumn();

        $totalStudents = (int)$db->query(
            "SELECT COUNT(*) FROM users WHERE role='student'"
        )->fetchColumn();

        // ── 6. Đăng ký gần đây (20 đăng ký mới nhất) ──────────────────────
        $recentEnrollments = $db->query(
            "SELECT e.id, e.enroll_date, u.fullname AS user_name, u.email,
                    c.title AS course_title,
                    (SELECT COUNT(*) FROM lessons l JOIN chapters ch ON l.chapter_id=ch.id WHERE ch.course_id=c.id) AS total_lessons,
                    (SELECT COUNT(*) FROM lesson_progress lp2 JOIN lessons l2 ON lp2.lesson_id=l2.id JOIN chapters ch2 ON l2.chapter_id=ch2.id WHERE ch2.course_id=c.id AND lp2.user_id=e.user_id AND lp2.is_completed=1) AS done_lessons
             FROM enrollments e
             JOIN users u ON u.id = e.user_id
             JOIN courses c ON c.id = e.course_id
             ORDER BY e.enroll_date DESC LIMIT 20"
        )->fetchAll();

        // ── 7. Tỷ lệ hoàn thành trung bình trên tất cả enrollments ─────────
        $completionRow = $db->query(
            "SELECT AVG(
                CASE WHEN total_lessons > 0 THEN done_lessons * 100.0 / total_lessons ELSE 0 END
             ) AS avg_pct
             FROM (
                SELECT e.user_id, e.course_id,
                    (SELECT COUNT(*) FROM lessons l JOIN chapters ch ON l.chapter_id=ch.id WHERE ch.course_id=e.course_id) AS total_lessons,
                    (SELECT COUNT(*) FROM lesson_progress lp JOIN lessons l ON lp.lesson_id=l.id JOIN chapters ch ON l.chapter_id=ch.id WHERE ch.course_id=e.course_id AND lp.user_id=e.user_id AND lp.is_completed=1) AS done_lessons
                FROM enrollments e
             ) sub"
        )->fetch();

        // ── 8. Doanh thu theo khoảng thời gian (range = today|7d|30d|1y) ──────
        $range = trim($this->getQueryParams()['range'] ?? '7d');
        if (!in_array($range, ['today', '7d', '30d', '1y'])) $range = '7d';

        if ($range === 'today') {
            // Nhóm theo giờ trong ngày hôm nay
            $rows = $db->query(
                "SELECT HOUR(paid_at) AS slot, SUM(amount) AS revenue, COUNT(*) AS orders
                 FROM payments
                 WHERE status='completed' AND DATE(paid_at) = CURDATE()
                 GROUP BY HOUR(paid_at) ORDER BY slot ASC"
            )->fetchAll();
            $map = [];
            foreach ($rows as $r) $map[(int)$r['slot']] = ['revenue' => (float)$r['revenue'], 'orders' => (int)$r['orders']];
            $weeklyData = [];
            for ($h = 0; $h <= 23; $h++) {
                $weeklyData[] = [
                    'label'   => sprintf('%02d:00', $h),
                    'revenue' => $map[$h]['revenue'] ?? 0,
                    'orders'  => $map[$h]['orders']  ?? 0,
                ];
            }

        } elseif ($range === '30d') {
            $rows = $db->query(
                "SELECT DATE(paid_at) AS day, SUM(amount) AS revenue, COUNT(*) AS orders
                 FROM payments
                 WHERE status='completed' AND paid_at >= DATE_SUB(CURDATE(), INTERVAL 29 DAY)
                 GROUP BY DATE(paid_at) ORDER BY day ASC"
            )->fetchAll();
            $map = [];
            foreach ($rows as $r) $map[$r['day']] = ['revenue' => (float)$r['revenue'], 'orders' => (int)$r['orders']];
            $weeklyData = [];
            for ($i = 29; $i >= 0; $i--) {
                $date = date('Y-m-d', strtotime("-{$i} days"));
                $weeklyData[] = [
                    'label'   => date('d/m', strtotime($date)),
                    'revenue' => $map[$date]['revenue'] ?? 0,
                    'orders'  => $map[$date]['orders']  ?? 0,
                ];
            }

        } elseif ($range === '1y') {
            $rows = $db->query(
                "SELECT DATE_FORMAT(paid_at, '%Y-%m') AS slot, SUM(amount) AS revenue, COUNT(*) AS orders
                 FROM payments
                 WHERE status='completed' AND paid_at >= DATE_SUB(CURDATE(), INTERVAL 11 MONTH)
                 GROUP BY slot ORDER BY slot ASC"
            )->fetchAll();
            $map = [];
            foreach ($rows as $r) $map[$r['slot']] = ['revenue' => (float)$r['revenue'], 'orders' => (int)$r['orders']];
            $weeklyData = [];
            for ($i = 11; $i >= 0; $i--) {
                $slot = date('Y-m', strtotime("-{$i} months"));
                $weeklyData[] = [
                    'label'   => date('m/Y', strtotime($slot . '-01')),
                    'revenue' => $map[$slot]['revenue'] ?? 0,
                    'orders'  => $map[$slot]['orders']  ?? 0,
                ];
            }

        } else {
            // 7d — hành vi mặc định
            $rows = $db->query(
                "SELECT DATE(paid_at) AS day, SUM(amount) AS revenue, COUNT(*) AS orders
                 FROM payments
                 WHERE status='completed' AND paid_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
                 GROUP BY DATE(paid_at) ORDER BY day ASC"
            )->fetchAll();
            $map = [];
            foreach ($rows as $r) $map[$r['day']] = ['revenue' => (float)$r['revenue'], 'orders' => (int)$r['orders']];
            $weeklyData = [];
            for ($i = 6; $i >= 0; $i--) {
                $date = date('Y-m-d', strtotime("-{$i} days"));
                $weeklyData[] = [
                    'label'   => date('d/m', strtotime($date)),
                    'revenue' => $map[$date]['revenue'] ?? 0,
                    'orders'  => $map[$date]['orders']  ?? 0,
                ];
            }
        }

        $this->success([
            'data' => [
                'overview' => [
                    'total_revenue'      => (float)($revRow['total_revenue']  ?? 0),
                    'total_orders'       => (int)  ($revRow['total_orders']   ?? 0),
                    'pending_orders'     => (int)  ($revRow['pending_orders'] ?? 0),
                    'failed_orders'      => (int)  ($revRow['failed_orders']  ?? 0),
                    'total_students'     => $totalStudents,
                    'new_students_30d'   => $newStudents30,
                    'avg_completion_pct' => round((float)($completionRow['avg_pct'] ?? 0), 1),
                ],
                'revenue_by_method'  => $byMethod,
                'revenue_weekly'     => $weeklyData,
                'top_courses'        => $topCourses,
                'recent_payments'    => $recentPayments,
                'recent_enrollments' => $recentEnrollments,
            ],
        ]);
    }
}
