<?php

require_once dirname(__DIR__, 2) . "/app/models/Chapter.php";

class ChapterController
{
    private $model;

    public function __construct()
    {
        $this->model = new Chapter();
    }

    // Helper render — gán biến trực tiếp để tránh scope issue
    private function render($view, $data = [])
    {
        $chapters = $data['chapters'] ?? null;
        $chapter  = $data['chapter']  ?? null;
        $courseId = $data['courseId'] ?? null;
        require dirname(__DIR__, 2) . "/app/views/chapter/{$view}.php";
    }

    // Danh sách chương theo khóa học
    public function index()
    {
        $courseId = $_GET['course_id'] ?? null;
        $chapters = $this->model->getByCourse($courseId) ?: [];
        $this->render('index', [
            'chapters' => $chapters,
            'courseId' => $courseId,
        ]);
    }

    // Form tạo chương
    public function create()
    {
        $courseId = $_GET['course_id'] ?? null;
        $this->render('create', ['courseId' => $courseId]);
    }

    // Xử lý lưu chương mới
    public function store()
    {
        $courseId    = $_POST['course_id']    ?? null;
        $chapterName = $_POST['chapter_name'] ?? '';

        $this->model->create($courseId, $chapterName);
        header("Location: ?page=chapters&course_id=" . $courseId);
        exit();
    }

    // Form sửa chương
    public function edit()
    {
        $id      = $_GET['id'] ?? null;
        $chapter = $this->model->find($id);

        if (!$chapter) {
            header("Location: ?page=courses");
            exit();
        }

        $this->render('edit', ['chapter' => $chapter]);
    }

    // Xử lý cập nhật chương
    public function update()
    {
        $id          = $_POST['id']           ?? null;
        $chapterName = $_POST['chapter_name'] ?? '';
        $courseId    = $_POST['course_id']    ?? null;

        $this->model->update($id, $chapterName);
        header("Location: ?page=chapters&course_id=" . $courseId);
        exit();
    }

    // Xóa chương
    public function destroy()
    {
        $id       = $_GET['id']        ?? null;
        $courseId = $_GET['course_id'] ?? null;

        $this->model->delete($id);
        header("Location: ?page=chapters&course_id=" . $courseId);
        exit();
    }
}