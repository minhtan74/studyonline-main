<?php

require_once __DIR__ . "/../models/Lesson.php";

class LessonController
{
    private $lesson;

    public function __construct()
    {
        $this->lesson = new Lesson();
    }

    public function index()
    {
        $chapterId = $_GET['chapter_id'] ?? 0;

        $lessons = $this->lesson->getByChapter($chapterId);

        require_once __DIR__ . "/../views/lesson/index.php";
    }

    public function create()
    {
        $chapterId = $_GET['chapter_id'] ?? 0;

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $title = $_POST['title'];
            $description = $_POST['description'];
            $video = $_FILES['video'];
            $document = $_FILES['document'];

            $this->lesson->create(
                $chapterId,
                $title,
                $description,
                $video,
                $document
            );

            header('Location: ?page=lessons&chapter_id=' . $chapterId);

            exit;
        }

        require_once __DIR__ . "/../views/lesson/create.php";
    }

    public function edit()
    {
        $id = $_GET['id'] ?? 0;

        $lesson = $this->lesson->find($id);

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $title = $_POST['title'];
            $description = $_POST['description'];

            $this->lesson->update(
                $id,
                $title,
                $description
            );

            header('Location: ?page=lessons&chapter_id=' . $lesson['chapter_id']);

            exit;
        }

        require_once __DIR__ . "/../views/lesson/edit.php";
    }

    public function delete()
    {
        $id = $_GET['id'] ?? 0;

        $lesson = $this->lesson->find($id);

        $this->lesson->delete($id);

        header('Location: ?page=lessons&chapter_id=' . $lesson['chapter_id']);

        exit;
    }

    // Hiển thị chi tiết bài học
    public function show()
    {
        $id = $_GET['id'] ?? 0;

        $lesson = $this->lesson->find($id);

        if (!$lesson) {
            echo "<p>Không tìm thấy bài học.</p>";
            return;
        }

        require_once __DIR__ . "/../views/lesson/show.php";
    }

    // Lưu bài học (xử lý upload + insert DB)
    public function store()
    {
        $chapterId = $_POST['chapter_id'] ?? 0;
        $title       = $_POST['title'] ?? '';
        $description = $_POST['description'] ?? '';

        // Upload video
        $videoName = '';
        if (!empty($_FILES['video']['name'])) {
            $videoName = time() . '_' . basename($_FILES['video']['name']);
            move_uploaded_file(
                $_FILES['video']['tmp_name'],
                __DIR__ . "/../../public/uploads/videos/" . $videoName
            );
        }

        // Upload PDF
        $documentName = '';
        if (!empty($_FILES['document']['name'])) {
            $documentName = time() . '_' . basename($_FILES['document']['name']);
            move_uploaded_file(
                $_FILES['document']['tmp_name'],
                __DIR__ . "/../../public/uploads/documents/" . $documentName
            );
        }

        $this->lesson->create(
            $chapterId,
            $title,
            $description,
            $videoName,
            $documentName
        );

        header('Location: ?page=lessons&chapter_id=' . $chapterId);
        exit;
    }

}