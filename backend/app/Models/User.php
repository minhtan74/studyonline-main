<?php
namespace App\Models;

use App\Core\Model;

class User extends Model
{
    public function getAll(): array
    {
        return $this->db->query("SELECT id, fullname, email, role, created_at FROM users ORDER BY id DESC")->fetchAll();
    }

    public function find(int $id): ?array
    {
        $stmt = $this->db->prepare("SELECT id, fullname, email, role, created_at FROM users WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public function findByEmail(string $email): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE email = ? LIMIT 1");
        $stmt->execute([$email]);
        return $stmt->fetch() ?: null;
    }

    public function create(string $fullname, string $email, string $password, string $role): bool
    {
        $hashed = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $this->db->prepare(
            "INSERT INTO users (fullname, email, password, role) VALUES (?, ?, ?, ?)"
        );
        return $stmt->execute([$fullname, $email, $hashed, $role]);
    }

    public function update(int $id, string $fullname, string $email, string $role): bool
    {
        $stmt = $this->db->prepare("UPDATE users SET fullname = ?, email = ?, role = ? WHERE id = ?");
        return $stmt->execute([$fullname, $email, $role, $id]);
    }

    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare("DELETE FROM users WHERE id = ?");
        return $stmt->execute([$id]);
    }
}
