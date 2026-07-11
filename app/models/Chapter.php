<?php

require_once dirname(__DIR__, 2) . "/core/Database.php";


class Chapter
{
    private $conn;

    public function __construct()
    {
        $db = new Database();

        $this->conn = $db->connect();
    }

    public function getByCourse($courseId)
    {
        $stmt =
            $this->conn->prepare(
                "SELECT *
             FROM chapters
             WHERE course_id = ?"
            );

        $stmt->execute([$courseId]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create(
        $courseId,
        $chapterName
    ) {
        $stmt =
            $this->conn->prepare(
                "INSERT INTO chapters
             (course_id,chapter_name)
             VALUES (?,?)"
            );

        return $stmt->execute([
            $courseId,
            $chapterName
        ]);
    }

    public function find($id)
    {
        $stmt =
            $this->conn->prepare(
                "SELECT *
             FROM chapters
             WHERE id=?"
            );

        $stmt->execute([$id]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function update(
        $id,
        $chapterName
    ) {
        $stmt =
            $this->conn->prepare(
                "UPDATE chapters
             SET chapter_name=?
             WHERE id=?"
            );

        return $stmt->execute([
            $chapterName,
            $id
        ]);
    }

    public function delete($id)
    {
        $stmt =
            $this->conn->prepare(
                "DELETE FROM chapters
             WHERE id=?"
            );

        return $stmt->execute([$id]);
    }
}