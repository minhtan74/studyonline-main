<?php
namespace App\Controllers;

use App\Core\Controller;
use App\Models\Enrollment;
use App\Middleware\JwtMiddleware;

class EnrollmentController extends Controller
{
    /** GET /api/enrollments */
    public function index(): void
    {
        $user  = JwtMiddleware::handle();
        $model = new Enrollment();
        $q     = $this->getQueryParams();

        if (!empty($q['course_id'])) {
            $enrolled = $model->isEnrolled($user['id'], (int)$q['course_id']);
            $this->success(['enrolled' => $enrolled]);
            return;
        }
        if (!empty($q['ids_only'])) {
            $ids = $model->getEnrolledCourseIds($user['id']);
            $this->success(['data' => $ids]);
            return;
        }

        if ($user['role'] === 'admin') {
            $data = $model->getAll();
        } elseif ($user['role'] === 'teacher') {
            $data = $model->getByTeacher($user['id']);
        } else {
            $data = $model->getByUser($user['id']);
        }
        $this->success(['data' => $data]);
    }

    /** POST /api/enrollments — đăng ký khóa học miễn phí */
    public function create(): void
    {
        $user     = JwtMiddleware::handle();
        $input    = $this->getBody();
        $courseId = (int)($input['course_id'] ?? 0);

        if (!$courseId) { $this->error('Thiếu course_id.'); return; }

        $model = new Enrollment();
        if ($model->isEnrolled($user['id'], $courseId)) {
            $this->error('Bạn đã đăng ký khóa học này rồi.', 409);
            return;
        }
        if ($model->enroll($user['id'], $courseId)) {
            $this->success([], 'Đăng ký khóa học thành công!');
        } else {
            $this->error('Đăng ký thất bại, vui lòng thử lại.');
        }
    }

    /** DELETE /api/enrollments?course_id=X */
    public function delete(): void
    {
        $user     = JwtMiddleware::handle();
        $courseId = (int)($this->getQueryParams()['course_id'] ?? 0);
        if (!$courseId) { $this->error('Thiếu course_id.'); return; }
        (new Enrollment())->unenroll($user['id'], $courseId);
        $this->success([], 'Đã hủy đăng ký.');
    }
}
