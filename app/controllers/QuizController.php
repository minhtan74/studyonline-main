<?php

require_once __DIR__ . "/../models/Quiz.php";
require_once __DIR__ . "/../models/Question.php";
require_once __DIR__ . "/../models/Result.php";

class QuizController
{
    private $quiz;
    private $question;
    private $result;

    public function __construct()
    {
        $this->quiz     = new Quiz();
        $this->question = new Question();
        $this->result   = new Result();
    }

    // Helper render
    private function render($view, $data = [])
    {
        extract($data);
        require dirname(__DIR__, 2) . "/app/views/quiz/{$view}.php";
    }

    // ----------------------------------------------------------------
    // DANH SÁCH QUIZ
    // ----------------------------------------------------------------
    public function index()
    {
        $courseId = $_GET['course_id'] ?? null;
        $quizzes  = $courseId
            ? $this->quiz->getByCourse($courseId)
            : $this->quiz->getAll();

        // Thêm số câu hỏi cho mỗi quiz
        foreach ($quizzes as &$q) {
            $q['question_count'] = $this->question->countByQuiz($q['id']);
        }

        $this->render('index', [
            'quizzes'  => $quizzes,
            'courseId' => $courseId,
        ]);
    }

    // ----------------------------------------------------------------
    // LÀM BÀI QUIZ
    // ----------------------------------------------------------------
    public function show()
    {
        $quizId    = $_GET['id'] ?? 0;
        $quiz      = $this->quiz->find($quizId);
        $questions = $this->question->getByQuiz($quizId);

        if (!$quiz) {
            header("Location: ?page=quiz");
            exit();
        }

        // Kiểm tra đã làm chưa (nếu đăng nhập)
        $existingResult = null;
        if (isset($_SESSION['user'])) {
            $existingResult = $this->result->getByUserAndQuiz(
                $_SESSION['user']['id'],
                $quizId
            );
        }

        $this->render('show', [
            'quiz'           => $quiz,
            'questions'      => $questions,
            'existingResult' => $existingResult,
        ]);
    }

    // ----------------------------------------------------------------
    // NỘP BÀI (POST)
    // ----------------------------------------------------------------
    public function submit()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            header("Location: ?page=quiz");
            exit();
        }

        $quizId    = $_POST['quiz_id'] ?? 0;
        $quiz      = $this->quiz->find($quizId);
        $questions = $this->question->getByQuiz($quizId);

        if (!$quiz || empty($questions)) {
            header("Location: ?page=quiz");
            exit();
        }

        // Chấm điểm
        $score   = 0;
        $total   = count($questions);
        $answers = $_POST['answers'] ?? [];   // ['question_id' => 'A'|'B'|'C'|'D']

        $details = [];
        foreach ($questions as $q) {
            $chosen  = strtoupper($answers[$q['id']] ?? '');
            $correct = $q['correct_answer'];
            $isRight = ($chosen === $correct);
            if ($isRight) $score++;
            $details[] = [
                'question' => $q,
                'chosen'   => $chosen,
                'correct'  => $correct,
                'is_right' => $isRight,
            ];
        }

        // Lưu kết quả nếu đăng nhập
        $resultId = null;
        if (isset($_SESSION['user'])) {
            $this->result->store($_SESSION['user']['id'], $quizId, $score, $total);
            $resultId = $this->result->lastInsertId();
        }

        // Lưu tạm vào session để hiển thị trang kết quả
        $_SESSION['quiz_result'] = [
            'quiz'    => $quiz,
            'score'   => $score,
            'total'   => $total,
            'details' => $details,
        ];

        header("Location: ?page=quiz-result&quiz_id=" . $quizId);
        exit();
    }

    // ----------------------------------------------------------------
    // TRANG KẾT QUẢ
    // ----------------------------------------------------------------
    public function result()
    {
        if (empty($_SESSION['quiz_result'])) {
            header("Location: ?page=quiz");
            exit();
        }

        $data = $_SESSION['quiz_result'];
        unset($_SESSION['quiz_result']);

        $this->render('result', [
            'quiz'    => $data['quiz'],
            'score'   => $data['score'],
            'total'   => $data['total'],
            'details' => $data['details'],
        ]);
    }

    // ----------------------------------------------------------------
    // TẠO QUIZ MỚI
    // ----------------------------------------------------------------
    public function create()
    {
        require_once __DIR__ . "/../models/Course.php";
        $courseModel = new courses();
        $courses     = $courseModel->getAll();
        $courseId    = $_GET['course_id'] ?? null;

        $this->render('create', [
            'courses'  => $courses,
            'courseId' => $courseId,
        ]);
    }

    public function store()
    {
        $courseId    = $_POST['course_id']   ?? null;
        $title       = $_POST['title']       ?? '';
        $description = $_POST['description'] ?? '';

        $this->quiz->create($courseId, $title, $description);
        $quizId = $this->quiz->lastInsertId();

        header("Location: ?page=quiz-questions&quiz_id=" . $quizId);
        exit();
    }

    // ----------------------------------------------------------------
    // SỬA QUIZ
    // ----------------------------------------------------------------
    public function edit()
    {
        require_once __DIR__ . "/../models/Course.php";
        $courseModel = new courses();
        $courses     = $courseModel->getAll();

        $id   = $_GET['id'] ?? 0;
        $quiz = $this->quiz->find($id);

        if (!$quiz) {
            header("Location: ?page=quiz");
            exit();
        }

        $this->render('edit', [
            'quiz'    => $quiz,
            'courses' => $courses,
        ]);
    }

    public function update()
    {
        $id          = $_POST['id']          ?? 0;
        $courseId    = $_POST['course_id']   ?? null;
        $title       = $_POST['title']       ?? '';
        $description = $_POST['description'] ?? '';

        $this->quiz->update($id, $courseId, $title, $description);
        header("Location: ?page=quiz&course_id=" . $courseId);
        exit();
    }

    // ----------------------------------------------------------------
    // XÓA QUIZ
    // ----------------------------------------------------------------
    public function delete()
    {
        $id       = $_GET['id']        ?? 0;
        $courseId = $_GET['course_id'] ?? null;

        $this->quiz->delete($id);
        header("Location: ?page=quiz" . ($courseId ? "&course_id=" . $courseId : ""));
        exit();
    }

    // ----------------------------------------------------------------
    // QUẢN LÝ CÂU HỎI
    // ----------------------------------------------------------------
    public function questions()
    {
        $quizId    = $_GET['quiz_id'] ?? 0;
        $quiz      = $this->quiz->find($quizId);
        $questions = $this->question->getByQuiz($quizId);

        if (!$quiz) {
            header("Location: ?page=quiz");
            exit();
        }

        $this->render('questions', [
            'quiz'      => $quiz,
            'questions' => $questions,
        ]);
    }

    public function createQuestion()
    {
        $quizId = $_GET['quiz_id'] ?? 0;
        $quiz   = $this->quiz->find($quizId);

        if (!$quiz) {
            header("Location: ?page=quiz");
            exit();
        }

        $this->render('create_question', ['quiz' => $quiz]);
    }

    public function storeQuestion()
    {
        $quizId        = $_POST['quiz_id']        ?? 0;
        $content       = $_POST['content']        ?? '';
        $optionA       = $_POST['option_a']       ?? '';
        $optionB       = $_POST['option_b']       ?? '';
        $optionC       = $_POST['option_c']       ?? '';
        $optionD       = $_POST['option_d']       ?? '';
        $correctAnswer = strtoupper($_POST['correct_answer'] ?? 'A');
        $orderIndex    = (int)($_POST['order_index'] ?? 0);

        $this->question->create($quizId, $content, $optionA, $optionB, $optionC, $optionD, $correctAnswer, $orderIndex);
        header("Location: ?page=quiz-questions&quiz_id=" . $quizId);
        exit();
    }

    public function editQuestion()
    {
        $id       = $_GET['id'] ?? 0;
        $question = $this->question->find($id);

        if (!$question) {
            header("Location: ?page=quiz");
            exit();
        }

        $quiz = $this->quiz->find($question['quiz_id']);
        $this->render('edit_question', [
            'question' => $question,
            'quiz'     => $quiz,
        ]);
    }

    public function updateQuestion()
    {
        $id            = $_POST['id']             ?? 0;
        $quizId        = $_POST['quiz_id']        ?? 0;
        $content       = $_POST['content']        ?? '';
        $optionA       = $_POST['option_a']       ?? '';
        $optionB       = $_POST['option_b']       ?? '';
        $optionC       = $_POST['option_c']       ?? '';
        $optionD       = $_POST['option_d']       ?? '';
        $correctAnswer = strtoupper($_POST['correct_answer'] ?? 'A');
        $orderIndex    = (int)($_POST['order_index'] ?? 0);

        $this->question->update($id, $content, $optionA, $optionB, $optionC, $optionD, $correctAnswer, $orderIndex);
        header("Location: ?page=quiz-questions&quiz_id=" . $quizId);
        exit();
    }

    public function deleteQuestion()
    {
        $id     = $_GET['id']      ?? 0;
        $quizId = $_GET['quiz_id'] ?? 0;

        $this->question->delete($id);
        header("Location: ?page=quiz-questions&quiz_id=" . $quizId);
        exit();
    }
}