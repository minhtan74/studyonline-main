<?php
namespace App\Models;

use App\Core\Model;

class Chapter extends Model
{
    public function getByCourse(int $courseId): array
    {
        $stmt = $this->db->prepare("SELECT * FROM chapters WHERE course_id = ? ORDER BY id ASC");
        $stmt->execute([$courseId]);
        return $stmt->fetchAll();
    }

    public function find(int $id): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM chapters WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public function create(int $courseId, string $chapterName): bool
    {
        $stmt = $this->db->prepare("INSERT INTO chapters (course_id, chapter_name) VALUES (?, ?)");
        return $stmt->execute([$courseId, $chapterName]);
    }

    public function lastInsertId(): string
    {
        return $this->db->lastInsertId();
    }

    public function update(int $id, string $chapterName): bool
    {
        $stmt = $this->db->prepare("UPDATE chapters SET chapter_name = ? WHERE id = ?");
        return $stmt->execute([$chapterName, $id]);
    }

    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare("DELETE FROM chapters WHERE id = ?");
        return $stmt->execute([$id]);
    }
}
