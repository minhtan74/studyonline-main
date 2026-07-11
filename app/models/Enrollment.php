<?php

require_once "../config/Database.php";
class Enrollment
{
    private $conn;
    public function __construct()
    {
        $db = new Database();
        $this->conn = $db->connect();
    }
    public function enroll($userId, $courseId)
    {
        $stmt = $this->conn->prepare(
            "INSERT INTO enrollment(
                user_id,
                course_id,
            )
            VALUES(?,?)"
        );
        return $stmt->execute([$userId, $courseId]);
    }
    public function isEnrolled(
        $userId,
        $courseId
    ) {
        $stmt =
            $this->conn->prepare(
                "SELECT *
             FROM enrollments
             WHERE user_id=?
             AND course_id=?"
            );

        $stmt->execute([
            $userId,
            $courseId
        ]);

        return $stmt->fetch();
    }

    public function myCourses(
        $userId
    ) {
        $stmt =
            $this->conn->prepare(
                "SELECT c.*
             FROM courses c
             JOIN enrollments e
             ON c.id=e.course_id
             WHERE e.user_id=?"
            );

        $stmt->execute([$userId]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}