<?php

require_once "../config/Database.php";

class User
{
    private $conn;

    public function __construct()
    {
        $db = new Database();
        $this->conn = $db->connect();
    }

    // Đăng ký
    public function create($fullname, $email, $password)
    {
        $sql = "INSERT INTO users
                (fullname,email,password)
                VALUES(?,?,?)";

        $stmt = $this->conn->prepare($sql);

        return $stmt->execute([
            $fullname,
            $email,
            $password
        ]);
    }

    // Tìm user theo email
    public function findByEmail($email)
    {
        $sql = "SELECT * FROM users
                WHERE email = ?";

        $stmt = $this->conn->prepare($sql);

        $stmt->execute([$email]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}