<?php
namespace App\Models;

use App\Core\Model;

class LessonProgress extends Model
{
    /**
     * INSERT hoặc UPDATE tiến độ 1 bài học của 1 user.
     * Nếu is_completed = 1 thì ghi completed_at, ngược lại giữ NULL.
     */
    public function upsertProgress(int $userId, int $lessonId, int $watchedSec, int $isCompleted): bool
    {
        $completedAt = $isCompleted ? date('Y-m-d H:i:s') : null;

        $stmt = $this->db->prepare("
            INSERT INTO lesson_progress (user_id, lesson_id, is_completed, watched_sec, completed_at)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                watched_sec  = GREATEST(watched_sec, VALUES(watched_sec)),
                is_completed = GREATEST(is_completed, VALUES(is_completed)),
                completed_at = CASE
                    WHEN VALUES(is_completed) = 1 AND completed_at IS NULL THEN VALUES(completed_at)
                    ELSE completed_at
                END,
                updated_at   = CURRENT_TIMESTAMP
        ");
        return $stmt->execute([$userId, $lessonId, $isCompleted, $watchedSec, $completedAt]);
    }

    /**
     * Lấy tất cả tiến độ của 1 user (kèm thông tin bài học & khóa học).
     */
    public function getByUser(int $userId): array
    {
        $stmt = $this->db->prepare("
            SELECT
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
            ORDER BY lp.updated_at DESC
        ");
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    /**
     * Lấy danh sách lesson_id đã hoàn thành của user trong 1 khóa học.
     */
    public function getCompletedLessonIds(int $userId, int $courseId): array
    {
        $stmt = $this->db->prepare("
            SELECT lp.lesson_id
            FROM lesson_progress lp
            JOIN lessons  l  ON l.id  = lp.lesson_id
            JOIN chapters ch ON ch.id = l.chapter_id
            WHERE lp.user_id = ? AND ch.course_id = ? AND lp.is_completed = 1
        ");
        $stmt->execute([$userId, $courseId]);
        return array_column($stmt->fetchAll(), 'lesson_id');
    }

    /**
     * Tổng hợp tiến độ theo từng khóa học mà user đã đăng ký.
     * Trả về mảng: [course_id, course_title, total_lessons, done_lessons, watched_sec_total]
     */
    public function getProgressByCourse(int $userId): array
    {
        $stmt = $this->db->prepare("
            SELECT
                c.id                                AS course_id,
                c.title                             AS course_title,
                c.thumbnail,
                COUNT(DISTINCT l.id)                AS total_lessons,
                COUNT(DISTINCT CASE WHEN lp.is_completed = 1 THEN l.id END) AS done_lessons,
                COALESCE(SUM(lp.watched_sec), 0)    AS watched_sec_total
            FROM enrollments e
            JOIN courses  c  ON c.id  = e.course_id
            JOIN chapters ch ON ch.course_id = c.id
            JOIN lessons  l  ON l.chapter_id = ch.id
            LEFT JOIN lesson_progress lp
                ON lp.lesson_id = l.id AND lp.user_id = e.user_id
            WHERE e.user_id = ?
            GROUP BY c.id, c.title, c.thumbnail
            ORDER BY done_lessons DESC
        ");
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    /**
     * Số bài hoàn thành theo từng ngày trong 7 ngày gần nhất.
     * Trả về mảng có đúng 7 phần tử, index 0 = 6 ngày trước, index 6 = hôm nay.
     */
    public function getWeeklyProgress(int $userId): array
    {
        $stmt = $this->db->prepare("
            SELECT DATE(completed_at) AS day, COUNT(*) AS cnt
            FROM lesson_progress
            WHERE user_id = ?
              AND is_completed = 1
              AND completed_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
            GROUP BY DATE(completed_at)
        ");
        $stmt->execute([$userId]);
        $rows = $stmt->fetchAll();

        // Tạo map ngày → số bài
        $map = [];
        foreach ($rows as $r) {
            $map[$r['day']] = (int)$r['cnt'];
        }

        // Điền đủ 7 ngày (thiếu thì = 0)
        $result = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = date('Y-m-d', strtotime("-{$i} days"));
            $result[] = [
                'date'  => $date,
                'label' => date('d/m', strtotime($date)),
                'count' => $map[$date] ?? 0,
            ];
        }
        return $result;
    }

    /**
     * Tổng số giây đã xem của user trên toàn bộ khóa học.
     */
    public function getTotalWatchedSec(int $userId): int
    {
        $stmt = $this->db->prepare("
            SELECT COALESCE(SUM(watched_sec), 0) AS total
            FROM lesson_progress
            WHERE user_id = ?
        ");
        $stmt->execute([$userId]);
        return (int)($stmt->fetch()['total'] ?? 0);
    }
}
