<?php
require_once dirname(__DIR__, 2) . "/core/Database.php";

class Quiz {
    private $conn;

    public function __construct() {
        $db = new Database();
        $this->conn = $db->connect();
    }

    // Lấy tất cả quiz
    public function getAll() {
        $stmt = $this->conn->prepare(
            "SELECT q.*, c.title AS course_title
             FROM quizzes q
             JOIN courses c ON q.course_id = c.id
             ORDER BY q.created_at DESC"
        );
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Lấy quiz theo khóa học
    public function getByCourse($courseId) {
        $stmt = $this->conn->prepare(
            "SELECT * FROM quizzes WHERE course_id = ? ORDER BY id ASC"
        );
        $stmt->execute([$courseId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Lấy một quiz theo id
    public function find($id) {
        $stmt = $this->conn->prepare(
            "SELECT q.*, c.title AS course_title
             FROM quizzes q
             JOIN courses c ON q.course_id = c.id
             WHERE q.id = ?"
        );
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Tạo quiz mới
    public function create($courseId, $title, $description) {
        $stmt = $this->conn->prepare(
            "INSERT INTO quizzes (course_id, title, description)
             VALUES (?, ?, ?)"
        );
        return $stmt->execute([$courseId, $title, $description]);
    }

    // Lấy ID vừa insert
    public function lastInsertId() {
        return $this->conn->lastInsertId();
    }

    // Cập nhật quiz
    public function update($id, $courseId, $title, $description) {
        $stmt = $this->conn->prepare(
            "UPDATE quizzes SET course_id=?, title=?, description=? WHERE id=?"
        );
        return $stmt->execute([$courseId, $title, $description, $id]);
    }

    // Xóa quiz
    public function delete($id) {
        $stmt = $this->conn->prepare("DELETE FROM quizzes WHERE id=?");
        return $stmt->execute([$id]);
    }
}