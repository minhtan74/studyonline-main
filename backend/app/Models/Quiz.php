<?php
namespace App\Models;

use App\Core\Model;

class Quiz extends Model
{
    public function getAll(): array
    {
        $stmt = $this->db->prepare(
            "SELECT q.*, c.title AS course_title
             FROM quizzes q
             JOIN courses c ON q.course_id = c.id
             ORDER BY q.created_at DESC"
        );
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function getByCourse(int $courseId): array
    {
        $stmt = $this->db->prepare("SELECT * FROM quizzes WHERE course_id = ? ORDER BY id ASC");
        $stmt->execute([$courseId]);
        return $stmt->fetchAll();
    }

    public function find(int $id): ?array
    {
        $stmt = $this->db->prepare(
            "SELECT q.*, c.title AS course_title
             FROM quizzes q
             JOIN courses c ON q.course_id = c.id
             WHERE q.id = ?"
        );
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public function create(int $courseId, string $title, string $description): bool
    {
        $stmt = $this->db->prepare("INSERT INTO quizzes (course_id, title, description) VALUES (?, ?, ?)");
        return $stmt->execute([$courseId, $title, $description]);
    }

    public function lastInsertId(): string
    {
        return $this->db->lastInsertId();
    }

    public function update(int $id, int $courseId, string $title, string $description): bool
    {
        $stmt = $this->db->prepare("UPDATE quizzes SET course_id = ?, title = ?, description = ? WHERE id = ?");
        return $stmt->execute([$courseId, $title, $description, $id]);
    }

    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare("DELETE FROM quizzes WHERE id = ?");
        return $stmt->execute([$id]);
    }
}
