<?php
namespace App\Controllers;

use App\Core\Controller;
use App\Models\LessonProgress;
use App\Middleware\JwtMiddleware;

class ProgressController extends Controller
{
    /**
     * GET /api/progress
     *
     * Query params:
     *   ?course_id=X   → trả về lesson_id[] đã hoàn thành trong khóa đó
     *   ?weekly=1       → trả về dữ liệu biểu đồ 7 ngày
     *   (không có)      → trả về tổng hợp tiến độ tất cả khóa học
     */
    public function index(): void
    {
        $user  = JwtMiddleware::handle();
        $model = new LessonProgress();
        $q     = $this->getQueryParams();

        // Tiến độ trong 1 khóa cụ thể (để hiển thị ✅ trong sidebar bài học)
        if (!empty($q['course_id'])) {
            $ids = $model->getCompletedLessonIds($user['id'], (int)$q['course_id']);
            $this->success(['data' => $ids]);
            return;
        }

        // Dữ liệu biểu đồ theo tuần
        if (!empty($q['weekly'])) {
            $weekly = $model->getWeeklyProgress($user['id']);
            $this->success(['data' => $weekly]);
            return;
        }

        // Tổng hợp tiến độ theo từng khóa học + tổng số giây học
        $byCourse   = $model->getProgressByCourse($user['id']);
        $totalSec   = $model->getTotalWatchedSec($user['id']);

        $totalLessons = 0;
        $doneLessons  = 0;
        foreach ($byCourse as $c) {
            $totalLessons += (int)$c['total_lessons'];
            $doneLessons  += (int)$c['done_lessons'];
        }

        $this->success([
            'data' => [
                'courses'       => $byCourse,
                'total_lessons' => $totalLessons,
                'done_lessons'  => $doneLessons,
                'total_watched_sec' => $totalSec,
            ],
        ]);
    }

    /**
     * POST /api/progress
     *
     * Body: { lesson_id, watched_sec, is_completed }
     */
    public function update(): void
    {
        $user  = JwtMiddleware::handle();
        $input = $this->getBody();

        $lessonId    = (int)($input['lesson_id']    ?? 0);
        $watchedSec  = (int)($input['watched_sec']  ?? 0);
        $isCompleted = (int)($input['is_completed'] ?? 0);

        if (!$lessonId) {
            $this->error('Thiếu lesson_id.');
            return;
        }

        $model = new LessonProgress();
        $ok    = $model->upsertProgress($user['id'], $lessonId, $watchedSec, $isCompleted);

        if ($ok) {
            $this->success([], $isCompleted ? 'Đã đánh dấu hoàn thành bài học.' : 'Đã lưu tiến độ.');
        } else {
            $this->error('Không thể lưu tiến độ, vui lòng thử lại.');
        }
    }
}
