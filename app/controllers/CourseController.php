<?php

require_once dirname(__DIR__, 2) . "/app/models/Course.php";

class CourseController
{
    private $model;

    public function __construct()
    {
        $this->model = new courses();
    }

    // Helper: render view với data
    private function render($view, $data = [])
    {
        $courses = $data['courses'] ?? null;
        $course  = $data['course']  ?? null;
        require dirname(__DIR__, 2) . "/app/views/course/{$view}.php";
    }

    // Danh sách khóa học
    public function index()
    {
        $courses = $this->model->getAll() ?: [];
        $this->render('index', ['courses' => $courses]);
    }

    // Form tạo khóa học
    public function create()
    {
        $this->render('create');
    }

    // Xử lý thêm khóa học
    public function store()
    {
        $teacher_id  = $_SESSION['user']['id'];
        $title       = trim($_POST['title'] ?? '');
        $description = trim($_POST['description'] ?? '');
        $thumbnail   = '';

        // Xử lý upload ảnh
        if (!empty($_FILES['thumbnail']['name'])) {
            $uploadDir = dirname(__DIR__, 2) . "/public/uploads/";
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }
            $filename = time() . '_' . basename($_FILES['thumbnail']['name']);
            if (move_uploaded_file($_FILES['thumbnail']['tmp_name'], $uploadDir . $filename)) {
                $thumbnail = $filename;
            }
        }

        $this->model->create($teacher_id, $title, $description, $thumbnail);
        header("Location: ?page=courses");
        exit();
    }

    // Form sửa khóa học
    public function edit()
    {
        $id     = $_GET['id'] ?? null;
        $course = $this->model->find($id);

        if (!$course) {
            header("Location: ?page=courses");
            exit();
        }

        $this->render('edit', ['course' => $course]);
    }

    // Xử lý cập nhật khóa học
    public function update()
    {
        $id          = $_POST['id'] ?? null;
        $title       = trim($_POST['title'] ?? '');
        $description = trim($_POST['description'] ?? '');

        $this->model->update($id, $title, $description);
        header("Location: ?page=courses");
        exit();
    }

    // Xóa khóa học
    public function delete()
    {
        $id = $_GET['id'] ?? null;
        $this->model->delete($id);
        header("Location: ?page=courses");
        exit();
    }
}
