<?php
namespace App\Models;

use App\Core\Model;

class Payment extends Model
{
    public function create(int $userId, int $courseId, float $amount, string $method, string $ref = ''): string|false
    {
        $stmt = $this->db->prepare(
            "INSERT INTO payments (user_id, course_id, amount, method, status, transaction_ref)
             VALUES (?, ?, ?, ?, 'pending', ?)"
        );
        $ok = $stmt->execute([$userId, $courseId, $amount, $method, $ref]);
        return $ok ? $this->db->lastInsertId() : false;
    }

    public function complete(int $paymentId, string $ref = ''): bool
    {
        $stmt = $this->db->prepare(
            "UPDATE payments SET status='completed', transaction_ref=?, paid_at=NOW() WHERE id=? AND status='pending'"
        );
        return $stmt->execute([$ref, $paymentId]);
    }

    public function fail(int $paymentId, string $note = ''): bool
    {
        $stmt = $this->db->prepare("UPDATE payments SET status='failed', note=? WHERE id=?");
        return $stmt->execute([$note, $paymentId]);
    }

    public function getByUser(int $userId): array
    {
        $stmt = $this->db->prepare(
            "SELECT p.*, c.title AS course_title FROM payments p
             JOIN courses c ON c.id=p.course_id WHERE p.user_id=? ORDER BY p.created_at DESC"
        );
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    public function find(int $id): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM payments WHERE id=?");
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public function hasPaid(int $userId, int $courseId): bool
    {
        $stmt = $this->db->prepare(
            "SELECT id FROM payments WHERE user_id=? AND course_id=? AND status='completed'"
        );
        $stmt->execute([$userId, $courseId]);
        return (bool)$stmt->fetch();
    }

    public function getByTeacher(int $teacherId): array
    {
        $stmt = $this->db->prepare(
            "SELECT p.*, u.fullname AS user_name, c.title AS course_title
             FROM payments p
             JOIN users u ON u.id=p.user_id
             JOIN courses c ON c.id=p.course_id
             WHERE c.teacher_id=?
             ORDER BY p.created_at DESC"
        );
        $stmt->execute([$teacherId]);
        return $stmt->fetchAll();
    }

    public function getAll(): array
    {
        return $this->db->query(
            "SELECT p.*, u.fullname AS user_name, c.title AS course_title
             FROM payments p JOIN users u ON u.id=p.user_id JOIN courses c ON c.id=p.course_id
             ORDER BY p.created_at DESC"
        )->fetchAll();
    }
}
