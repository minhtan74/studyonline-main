<?php
namespace App\Models;

use App\Core\Model;

class Lesson extends Model
{
    public function getByChapter(int $chapterId): array
    {
        $stmt = $this->db->prepare("SELECT * FROM lessons WHERE chapter_id = ? ORDER BY id ASC");
        $stmt->execute([$chapterId]);
        return $stmt->fetchAll();
    }

    public function find(int $id): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM lessons WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public function create(int $chapterId, string $title, string $description, string $videoUrl = '', string $documentUrl = ''): bool
    {
        $stmt = $this->db->prepare(
            "INSERT INTO lessons (chapter_id, title, description, video_url, document_url) VALUES (?, ?, ?, ?, ?)"
        );
        return $stmt->execute([$chapterId, $title, $description, $videoUrl, $documentUrl]);
    }

    public function lastInsertId(): string
    {
        return $this->db->lastInsertId();
    }

    public function update(int $id, string $title, string $description, string $videoUrl = '', string $documentUrl = ''): bool
    {
        $stmt = $this->db->prepare(
            "UPDATE lessons SET title = ?, description = ?, video_url = ?, document_url = ? WHERE id = ?"
        );
        return $stmt->execute([$title, $description, $videoUrl, $documentUrl, $id]);
    }

    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare("DELETE FROM lessons WHERE id = ?");
        return $stmt->execute([$id]);
    }
}
