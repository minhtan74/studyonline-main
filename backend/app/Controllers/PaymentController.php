<?php
namespace App\Controllers;

use App\Core\Controller;
use App\Models\Payment;
use App\Models\Enrollment;
use App\Models\Course;
use App\Middleware\JwtMiddleware;

class PaymentController extends Controller
{
    /** GET /api/payments */
    public function index(): void
    {
        $user  = JwtMiddleware::handle();
        $model = new Payment();
        if ($user['role'] === 'admin') {
            $data  = $model->getAll();
        } elseif ($user['role'] === 'teacher') {
            $data  = $model->getByTeacher($user['id']);
        } else {
            $data  = $model->getByUser($user['id']);
        }
        $this->success(['data' => $data]);
    }

    /** POST /api/payments — tạo giao dịch + enroll sau khi thành công */
    public function create(): void
    {
        $user         = JwtMiddleware::handle();
        $input        = $this->getBody();
        $courseId     = (int)($input['course_id'] ?? 0);
        $method       = trim($input['method'] ?? 'card');
        $validMethods = ['card', 'bank_transfer', 'momo', 'zalopay'];

        if (!$courseId) { $this->error('Thiếu course_id.'); return; }
        if (!in_array($method, $validMethods)) { $this->error('Phương thức không hợp lệ.'); return; }

        $courseModel = new Course();
        $course = $courseModel->find($courseId);
        if (!$course) { $this->error('Khóa học không tồn tại.', 404); return; }

        $enrollModel = new Enrollment();
        if ($enrollModel->isEnrolled($user['id'], $courseId)) {
            $this->error('Bạn đã đăng ký khóa học này rồi.', 409);
            return;
        }

        $amount = (float)($course['price'] ?? 0);

        // Khóa miễn phí → enroll thẳng
        if ($amount <= 0) {
            $enrollModel->enroll($user['id'], $courseId);
            $this->success(['enrolled' => true, 'payment_required' => false], 'Đăng ký thành công!');
            return;
        }

        // Tạo giao dịch
        $ref       = strtoupper('SO' . date('ymdHis') . rand(1000, 9999));
        $paymentId = (new Payment())->create($user['id'], $courseId, $amount, $method, $ref);

        if (!$paymentId) { $this->error('Không thể tạo giao dịch.'); return; }

        (new Payment())->complete((int)$paymentId, $ref);
        $enrollModel->enroll($user['id'], $courseId);

        $this->success([
            'payment_id'       => (int)$paymentId,
            'transaction_ref'  => $ref,
            'amount'           => $amount,
            'method'           => $method,
            'enrolled'         => true,
            'payment_required' => true,
        ], 'Thanh toán thành công! Bạn đã được đăng ký vào khóa học.');
    }

    /** GET /api/payments/check?course_id=X */
    public function check(): void
    {
        $user     = JwtMiddleware::handle();
        $courseId = (int)($this->getQueryParams()['course_id'] ?? 0);
        if (!$courseId) { $this->error('Thiếu course_id.'); return; }

        $hasPaid  = (new Payment())->hasPaid($user['id'], $courseId);
        $enrolled = (new Enrollment())->isEnrolled($user['id'], $courseId);
        $this->success(['has_paid' => $hasPaid, 'enrolled' => $enrolled]);
    }
}
