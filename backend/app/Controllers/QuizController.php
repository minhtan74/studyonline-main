<?php
namespace App\Controllers;

use App\Core\Controller;
use App\Core\Request;
use App\Models\Quiz;
use App\Models\Question;
use App\Models\Result;
use App\Middleware\RoleMiddleware;
use App\Middleware\JwtMiddleware;

class QuizController extends Controller
{
    // ==================== QUIZ CRUD ====================

    /**
     * GET /api/quizzes
     */
    public function index(): void
    {
        $queryParams = $this->getQueryParams();
        $id       = isset($queryParams['id'])        ? (int)$queryParams['id']        : null;
        $courseId = isset($queryParams['course_id']) ? (int)$queryParams['course_id'] : null;

        $quizModel = new Quiz();
        $questionModel = new Question();

        if ($id) {
            $quiz = $quizModel->find($id);
            if (!$quiz) {
                $this->error('Không tìm thấy quiz.', 404);
            }
            $quiz['question_count'] = $questionModel->countByQuiz($id);
            $this->success(['data' => $quiz]);
        } elseif ($courseId) {
            $quizzes = $quizModel->getByCourse($courseId);
            foreach ($quizzes as &$q) {
                $q['question_count'] = $questionModel->countByQuiz($q['id']);
            }
            $this->success(['data' => $quizzes]);
        } else {
            $quizzes = $quizModel->getAll();
            foreach ($quizzes as &$q) {
                $q['question_count'] = $questionModel->countByQuiz($q['id']);
            }
            $this->success(['data' => $quizzes]);
        }
    }

    /**
     * POST /api/quizzes
     */
    public function create(): void
    {
        RoleMiddleware::check('admin', 'teacher');
        $input = $this->getBody();

        $courseId    = (int)($input['course_id']  ?? 0);
        $title       = trim($input['title']       ?? '');
        $description = trim($input['description'] ?? '');

        if (!$courseId || empty($title)) {
            $this->error('Dữ liệu không hợp lệ.');
        }

        $quizModel = new Quiz();
        $quizModel->create($courseId, $title, $description);
        $this->success(['id' => $quizModel->lastInsertId()], 'Tạo thành công');
    }

    /**
     * PUT /api/quizzes
     */
    public function update(): void
    {
        RoleMiddleware::check('admin', 'teacher');
        $input = $this->getBody();

        $id          = (int)($input['id']        ?? 0);
        $courseId    = (int)($input['course_id'] ?? 0);
        $title       = trim($input['title']      ?? '');
        $description = trim($input['description']?? '');

        if (!$id || !$courseId || empty($title)) {
            $this->error('Dữ liệu không hợp lệ.');
        }

        $quizModel = new Quiz();
        $quizModel->update($id, $courseId, $title, $description);
        $this->success([], 'Cập nhật thành công');
    }

    /**
     * DELETE /api/quizzes
     */
    public function delete(): void
    {
        RoleMiddleware::check('admin', 'teacher');
        $queryParams = $this->getQueryParams();
        $id = (int)($queryParams['id'] ?? 0);

        if (!$id) {
            $this->error('Thiếu ID.');
        }

        $quizModel = new Quiz();
        $quizModel->delete($id);
        $this->success([], 'Xóa thành công');
    }

    // ==================== QUESTIONS CRUD ====================

    /**
     * GET /api/quizzes/questions
     */
    public function indexQuestions(): void
    {
        $queryParams = $this->getQueryParams();
        $id     = isset($queryParams['id'])      ? (int)$queryParams['id']      : null;
        $quizId = isset($queryParams['quiz_id']) ? (int)$queryParams['quiz_id'] : null;

        $model = new Question();
        if ($id) {
            $q = $model->find($id);
            if (!$q) {
                $this->error('Không tìm thấy câu hỏi.', 404);
            }
            $this->success(['data' => $q]);
        } elseif ($quizId) {
            $this->success(['data' => $model->getByQuiz($quizId)]);
        } else {
            $this->error('Cần truyền quiz_id hoặc id.');
        }
    }

    /**
     * POST /api/quizzes/questions
     */
    public function createQuestion(): void
    {
        RoleMiddleware::check('admin', 'teacher');
        $input = $this->getBody();

        $quizId        = (int)($input['quiz_id']        ?? 0);
        $content       = trim($input['content']         ?? '');
        $optionA       = trim($input['option_a']        ?? '');
        $optionB       = trim($input['option_b']        ?? '');
        $optionC       = trim($input['option_c']        ?? '');
        $optionD       = trim($input['option_d']        ?? '');
        $correctAnswer = strtoupper(trim($input['correct_answer'] ?? 'A'));
        $orderIndex    = (int)($input['order_index']    ?? 0);

        if (!$quizId || empty($content)) {
            $this->error('Dữ liệu không hợp lệ.');
        }

        $model = new Question();
        $model->create($quizId, $content, $optionA, $optionB, $optionC, $optionD, $correctAnswer, $orderIndex);
        $this->success([], 'Thêm câu hỏi thành công');
    }

    /**
     * PUT /api/quizzes/questions
     */
    public function updateQuestion(): void
    {
        RoleMiddleware::check('admin', 'teacher');
        $input = $this->getBody();

        $id            = (int)($input['id']              ?? 0);
        $content       = trim($input['content']          ?? '');
        $optionA       = trim($input['option_a']         ?? '');
        $optionB       = trim($input['option_b']         ?? '');
        $optionC       = trim($input['option_c']         ?? '');
        $optionD       = trim($input['option_d']         ?? '');
        $correctAnswer = strtoupper(trim($input['correct_answer'] ?? 'A'));
        $orderIndex    = (int)($input['order_index']     ?? 0);

        if (!$id || empty($content)) {
            $this->error('Dữ liệu không hợp lệ.');
        }

        $model = new Question();
        $model->update($id, $content, $optionA, $optionB, $optionC, $optionD, $correctAnswer, $orderIndex);
        $this->success([], 'Cập nhật thành công');
    }

    /**
     * DELETE /api/quizzes/questions
     */
    public function deleteQuestion(): void
    {
        RoleMiddleware::check('admin', 'teacher');
        $queryParams = $this->getQueryParams();
        $id = (int)($queryParams['id'] ?? 0);

        if (!$id) {
            $this->error('Thiếu ID.');
        }

        $model = new Question();
        $model->delete($id);
        $this->success([], 'Xóa thành công');
    }

    // ==================== SUBMIT QUIZ ====================

    /**
     * POST /api/quizzes/submit
     */
    public function submit(): void
    {
        $payload = JwtMiddleware::handle();
        $input = $this->getBody();

        $quizId  = (int)($input['quiz_id'] ?? 0);
        $answers = $input['answers'] ?? [];

        $quizModel     = new Quiz();
        $questionModel = new Question();
        $resultModel   = new Result();

        $quiz      = $quizModel->find($quizId);
        $questions = $questionModel->getByQuiz($quizId);

        if (!$quiz || empty($questions)) {
            $this->error('Quiz không tồn tại hoặc chưa có câu hỏi.', 404);
        }

        $score   = 0;
        $total   = count($questions);
        $details = [];

        foreach ($questions as $q) {
            $chosen  = strtoupper($answers[$q['id']] ?? '');
            $correct = $q['correct_answer'];
            $isRight = ($chosen === $correct);
            if ($isRight) {
                $score++;
            }
            $details[] = [
                'question_id'    => $q['id'],
                'content'        => $q['content'],
                'option_a'       => $q['option_a'],
                'option_b'       => $q['option_b'],
                'option_c'       => $q['option_c'],
                'option_d'       => $q['option_d'],
                'chosen'         => $chosen,
                'correct_answer' => $correct,
                'is_right'       => $isRight,
            ];
        }

        $resultModel->store($payload['id'], $quizId, $score, $total);

        $this->success([
            'quiz'    => $quiz,
            'score'   => $score,
            'total'   => $total,
            'percent' => $total > 0 ? round($score / $total * 100) : 0,
            'details' => $details,
        ]);
    }
}
