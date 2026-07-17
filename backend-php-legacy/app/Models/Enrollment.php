<?php
namespace App\Models;

use App\Core\Model;

class Enrollment extends Model
{
    public function getByUser(int $userId): array
    {
        $stmt = $this->db->prepare(
            "SELECT e.*, c.title, c.description, c.price, c.level, c.thumbnail, c.slug
             FROM enrollments e JOIN courses c ON c.id = e.course_id
             WHERE e.user_id = ? ORDER BY e.enroll_date DESC"
        );
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    public function isEnrolled(int $userId, int $courseId): bool
    {
        $stmt = $this->db->prepare("SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?");
        $stmt->execute([$userId, $courseId]);
        return (bool)$stmt->fetch();
    }

    public function enroll(int $userId, int $courseId): bool
    {
        $stmt = $this->db->prepare("INSERT IGNORE INTO enrollments (user_id, course_id) VALUES (?, ?)");
        return $stmt->execute([$userId, $courseId]);
    }

    public function unenroll(int $userId, int $courseId): bool
    {
        $stmt = $this->db->prepare("DELETE FROM enrollments WHERE user_id = ? AND course_id = ?");
        return $stmt->execute([$userId, $courseId]);
    }

    public function getEnrolledCourseIds(int $userId): array
    {
        $stmt = $this->db->prepare("SELECT course_id FROM enrollments WHERE user_id = ?");
        $stmt->execute([$userId]);
        return array_column($stmt->fetchAll(), 'course_id');
    }

    public function getAll(): array
    {
        $stmt = $this->db->prepare(
            "SELECT e.*, u.fullname AS user_name, u.email AS user_email, c.title AS course_title, c.teacher_id, c.thumbnail, c.price,
                (SELECT COUNT(*) FROM lessons l JOIN chapters ch ON l.chapter_id = ch.id WHERE ch.course_id = c.id) AS total_lessons,
                (SELECT COUNT(*) FROM lesson_progress lp JOIN lessons l ON lp.lesson_id = l.id JOIN chapters ch ON l.chapter_id = ch.id WHERE ch.course_id = c.id AND lp.user_id = e.user_id AND lp.is_completed = 1) AS completed_lessons,
                (SELECT ROUND(AVG(r.score * 100.0 / NULLIF(r.total, 0))) FROM results r JOIN quizzes q ON r.quiz_id = q.id WHERE q.course_id = c.id AND r.user_id = e.user_id) AS avg_quiz_score
             FROM enrollments e
             JOIN users u ON u.id = e.user_id
             JOIN courses c ON c.id = e.course_id
             ORDER BY e.enroll_date DESC"
        );
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function getByTeacher(int $teacherId): array
    {
        $stmt = $this->db->prepare(
            "SELECT e.*, u.fullname AS user_name, u.email AS user_email, c.title AS course_title, c.thumbnail, c.price,
                (SELECT COUNT(*) FROM lessons l JOIN chapters ch ON l.chapter_id = ch.id WHERE ch.course_id = c.id) AS total_lessons,
                (SELECT COUNT(*) FROM lesson_progress lp JOIN lessons l ON lp.lesson_id = l.id JOIN chapters ch ON l.chapter_id = ch.id WHERE ch.course_id = c.id AND lp.user_id = e.user_id AND lp.is_completed = 1) AS completed_lessons,
                (SELECT ROUND(AVG(r.score * 100.0 / NULLIF(r.total, 0))) FROM results r JOIN quizzes q ON r.quiz_id = q.id WHERE q.course_id = c.id AND r.user_id = e.user_id) AS avg_quiz_score
             FROM enrollments e
             JOIN users u ON u.id = e.user_id
             JOIN courses c ON c.id = e.course_id
             WHERE c.teacher_id = ?
             ORDER BY e.enroll_date DESC"
        );
        $stmt->execute([$teacherId]);
        return $stmt->fetchAll();
    }
}
