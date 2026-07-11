<?php
require_once dirname(__DIR__, 2) . "/core/Database.php";

class Question {
    private $conn;

    public function __construct() {
        $db = new Database();
        $this->conn = $db->connect();
    }

    // Lấy tất cả câu hỏi theo quiz
    public function getByQuiz($quizId) {
        $stmt = $this->conn->prepare(
            "SELECT * FROM questions WHERE quiz_id = ? ORDER BY order_index ASC, id ASC"
        );
        $stmt->execute([$quizId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Lấy một câu hỏi theo id
    public function find($id) {
        $stmt = $this->conn->prepare("SELECT * FROM questions WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Đếm số câu hỏi trong quiz
    public function countByQuiz($quizId) {
        $stmt = $this->conn->prepare("SELECT COUNT(*) FROM questions WHERE quiz_id = ?");
        $stmt->execute([$quizId]);
        return (int) $stmt->fetchColumn();
    }

    // Tạo câu hỏi mới
    public function create($quizId, $content, $optionA, $optionB, $optionC, $optionD, $correctAnswer, $orderIndex = 0) {
        $stmt = $this->conn->prepare(
            "INSERT INTO questions (quiz_id, content, option_a, option_b, option_c, option_d, correct_answer, order_index)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        );
        return $stmt->execute([$quizId, $content, $optionA, $optionB, $optionC, $optionD, $correctAnswer, $orderIndex]);
    }

    // Cập nhật câu hỏi
    public function update($id, $content, $optionA, $optionB, $optionC, $optionD, $correctAnswer, $orderIndex) {
        $stmt = $this->conn->prepare(
            "UPDATE questions SET content=?, option_a=?, option_b=?, option_c=?, option_d=?, correct_answer=?, order_index=?
             WHERE id=?"
        );
        return $stmt->execute([$content, $optionA, $optionB, $optionC, $optionD, $correctAnswer, $orderIndex, $id]);
    }

    // Xóa câu hỏi
    public function delete($id) {
        $stmt = $this->conn->prepare("DELETE FROM questions WHERE id=?");
        return $stmt->execute([$id]);
    }
}
