<?php
require_once dirname(__DIR__, 2) . "/core/Database.php";

class Result {
    private $conn;

    public function __construct() {
        $db = new Database();
        $this->conn = $db->connect();
    }

    // Lấy kết quả của user theo quiz (lần làm gần nhất)
    public function getByUserAndQuiz($userId, $quizId) {
        $stmt = $this->conn->prepare(
            "SELECT * FROM results WHERE user_id=? AND quiz_id=? ORDER BY submit_time DESC LIMIT 1"
        );
        $stmt->execute([$userId, $quizId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Lịch sử tất cả kết quả của user
    public function getByUser($userId) {
        $stmt = $this->conn->prepare(
            "SELECT r.*, q.title AS quiz_title, c.title AS course_title
             FROM results r
             JOIN quizzes q ON r.quiz_id = q.id
             JOIN courses c ON q.course_id = c.id
             WHERE r.user_id = ?
             ORDER BY r.submit_time DESC"
        );
        $stmt->execute([$userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Lưu kết quả làm bài
    public function store($userId, $quizId, $score, $total) {
        $stmt = $this->conn->prepare(
            "INSERT INTO results (user_id, quiz_id, score, total) VALUES (?, ?, ?, ?)"
        );
        return $stmt->execute([$userId, $quizId, $score, $total]);
    }

    // Lấy id vừa insert
    public function lastInsertId() {
        return $this->conn->lastInsertId();
    }
}
