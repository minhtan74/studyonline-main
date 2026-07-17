<?php
namespace App\Models;

use App\Core\Model;

class Result extends Model
{
    public function getByUserAndQuiz(int $userId, int $quizId): ?array
    {
        $stmt = $this->db->prepare(
            "SELECT * FROM results WHERE user_id = ? AND quiz_id = ? ORDER BY submit_time DESC LIMIT 1"
        );
        $stmt->execute([$userId, $quizId]);
        return $stmt->fetch() ?: null;
    }

    public function getByUser(int $userId): array
    {
        $stmt = $this->db->prepare(
            "SELECT r.*, q.title AS quiz_title, c.title AS course_title
             FROM results r
             JOIN quizzes q ON r.quiz_id = q.id
             JOIN courses c ON q.course_id = c.id
             WHERE r.user_id = ?
             ORDER BY r.submit_time DESC"
        );
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    public function store(int $userId, int $quizId, int $score, int $total): bool
    {
        $stmt = $this->db->prepare(
            "INSERT INTO results (user_id, quiz_id, score, total) VALUES (?, ?, ?, ?)"
        );
        return $stmt->execute([$userId, $quizId, $score, $total]);
    }

    public function lastInsertId(): string
    {
        return $this->db->lastInsertId();
    }
}
