<?php
namespace App\Models;

use App\Core\Model;

class Course extends Model
{
    public function getAll(): array
    {
        return $this->db->query(
            "SELECT c.*, u.fullname AS teacher_name
             FROM courses c
             LEFT JOIN users u ON c.teacher_id = u.id
             ORDER BY c.id DESC"
        )->fetchAll();
    }

    public function find(int $id): ?array
    {
        $stmt = $this->db->prepare(
            "SELECT c.*, u.fullname AS teacher_name
             FROM courses c
             LEFT JOIN users u ON c.teacher_id = u.id
             WHERE c.id = ?"
        );
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public function create(int $teacherId, string $title, string $description, string $thumbnail = ''): bool
    {
        $stmt = $this->db->prepare(
            "INSERT INTO courses (teacher_id, title, description, thumbnail) VALUES (?, ?, ?, ?)"
        );
        return $stmt->execute([$teacherId, $title, $description, $thumbnail]);
    }

    public function lastInsertId(): string
    {
        return $this->db->lastInsertId();
    }

    public function update(int $id, string $title, string $description, string $thumbnail = ''): bool
    {
        if ($thumbnail) {
            $stmt = $this->db->prepare("UPDATE courses SET title = ?, description = ?, thumbnail = ? WHERE id = ?");
            return $stmt->execute([$title, $description, $thumbnail, $id]);
        }
        $stmt = $this->db->prepare("UPDATE courses SET title = ?, description = ? WHERE id = ?");
        return $stmt->execute([$title, $description, $id]);
    }

    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare("DELETE FROM courses WHERE id = ?");
        return $stmt->execute([$id]);
    }
}
