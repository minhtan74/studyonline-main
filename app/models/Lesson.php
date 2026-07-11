<?php

require_once dirname(__DIR__, 2) . "/core/Database.php";

class Lesson
{
    private $conn;

    public function __construct()
    {
        $db = new Database();

        $this->conn = $db->connect();
    }

    public function getByChapter($chapterId)
    {
        $stmt =
            $this->conn->prepare(
                "SELECT *
             FROM lessons
             WHERE chapter_id=?"
            );

        $stmt->execute([$chapterId]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create(
        $chapterId,
        $title,
        $description,
        $video,
        $document
    ) {
        $stmt =
            $this->conn->prepare(
                "INSERT INTO lessons
            (
                chapter_id,
                title,
                description,
                video_url,
                document_url
            )
            VALUES
            (
                ?,?,?,?,?
            )"
            );

        return $stmt->execute([
            $chapterId,
            $title,
            $description,
            $video,
            $document
        ]);
    }

    public function find($id)
    {
        $stmt =
            $this->conn->prepare(
                "SELECT *
             FROM lessons
             WHERE id=?"
            );

        $stmt->execute([$id]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function update(
        $id,
        $title,
        $description
    ) {
        $stmt =
            $this->conn->prepare(
                "UPDATE lessons
             SET
             title=?,
             description=?
             WHERE id=?"
            );

        return $stmt->execute([
            $title,
            $description,
            $id
        ]);
    }

    public function delete($id)
    {
        $stmt =
            $this->conn->prepare(
                "DELETE FROM lessons
             WHERE id=?"
            );

        return $stmt->execute([$id]);
    }
}