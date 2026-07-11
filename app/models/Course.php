<?php

require_once dirname(__DIR__, 2) . "/core/Database.php";

class courses
{
    private $conn;
    public function __construct()
    {
        $db = new Database();
        $this->conn = $db->connect();
    }
    //Lấy tất cả khóa học
    public function getAll()
    {
        $sql = "SELECT * FROM courses";
        return $this->conn->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }
    //Thêm khóa học
    public function create(
        $teacher_id,
        $title,
        $description,
        $thumbnail
    ) {
        $sql = "INSERT INTO courses(
            teacher_id, title, description, thumbnail
        )
        VALUES(?,?,?,?)";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([
            $teacher_id,
            $title,
            $description,
            $thumbnail
        ]);
    }
    //Lấy 1 khóa học
    public function find($id)
    {
        $sql = "SELECT * FROM courses WHERE id=?";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    //Cập nhật khóa học
    public function update(
        $id,
        $title,
        $description
    ) {
        $sql = "UPDATE courses SET title = ?, description=? WHERE id=?";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([$title, $description, $id]);
    }

    //Xóa khóa học
    public function delete($id)
    {
        $sql = "DELETE FROM courses WHERE id=?";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([$id]);
    }

}