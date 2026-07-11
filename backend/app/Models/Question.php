<?php
namespace App\Models;

use App\Core\Model;

class Question extends Model
{
    public function getByQuiz(int $quizId): array
    {
        $stmt = $this->db->prepare(
            "SELECT * FROM questions WHERE quiz_id = ? ORDER BY order_index ASC, id ASC"
        );
        $stmt->execute([$quizId]);
        return $stmt->fetchAll();
    }

    public function find(int $id): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM questions WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public function countByQuiz(int $quizId): int
    {
        $stmt = $this->db->prepare("SELECT COUNT(*) FROM questions WHERE quiz_id = ?");
        $stmt->execute([$quizId]);
        return (int)$stmt->fetchColumn();
    }

    public function create(int $quizId, string $content, string $optionA, string $optionB, string $optionC, string $optionD, string $correctAnswer, int $orderIndex = 0): bool
    {
        $stmt = $this->db->prepare(
            "INSERT INTO questions (quiz_id, content, option_a, option_b, option_c, option_d, correct_answer, order_index)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        );
        return $stmt->execute([$quizId, $content, $optionA, $optionB, $optionC, $optionD, $correctAnswer, $orderIndex]);
    }

    public function update(int $id, string $content, string $optionA, string $optionB, string $optionC, string $optionD, string $correctAnswer, int $orderIndex): bool
    {
        $stmt = $this->db->prepare(
            "UPDATE questions SET content=?, option_a=?, option_b=?, option_c=?, option_d=?, correct_answer=?, order_index=?
             WHERE id=?"
        );
        return $stmt->execute([$content, $optionA, $optionB, $optionC, $optionD, $correctAnswer, $orderIndex, $id]);
    }

    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare("DELETE FROM questions WHERE id = ?");
        return $stmt->execute([$id]);
    }
}
