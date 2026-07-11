<?php
namespace App\Controllers;

use App\Core\Controller;
use App\Core\Request;
use App\Models\Lesson;
use App\Middleware\RoleMiddleware;

class LessonController extends Controller
{
    /**
     * GET /api/lessons
     */
    public function index(): void
    {
        $queryParams = $this->getQueryParams();
        $id        = isset($queryParams['id'])         ? (int)$queryParams['id']         : null;
        $chapterId = isset($queryParams['chapter_id']) ? (int)$queryParams['chapter_id'] : null;

        $model = new Lesson();
        if ($id) {
            $lesson = $model->find($id);
            if (!$lesson) {
                $this->error('Không tìm thấy bài học.', 404);
            }
            $this->success(['data' => $lesson]);
        } elseif ($chapterId) {
            $this->success(['data' => $model->getByChapter($chapterId)]);
        } else {
            $this->error('Cần truyền chapter_id hoặc id.');
        }
    }

    /**
     * POST /api/lessons
     */
    public function create(): void
    {
        RoleMiddleware::check('admin', 'teacher');
        $input = $this->getBody();

        $chapterId   = (int)($input['chapter_id']  ?? 0);
        $title       = trim($input['title']         ?? '');
        $description = trim($input['description']   ?? '');
        $videoUrl    = trim($input['video_url']     ?? '');
        $documentUrl = trim($input['document_url']  ?? '');

        if (!$chapterId || empty($title)) {
            $this->error('Dữ liệu không hợp lệ.');
        }

        $model = new Lesson();
        $model->create($chapterId, $title, $description, $videoUrl, $documentUrl);
        $this->success(['id' => $model->lastInsertId()], 'Tạo thành công');
    }

    /**
     * PUT /api/lessons
     */
    public function update(): void
    {
        RoleMiddleware::check('admin', 'teacher');
        $input = $this->getBody();

        $id          = (int)($input['id'] ?? 0);
        $title       = trim($input['title'] ?? '');
        $description = trim($input['description'] ?? '');
        $videoUrl    = trim($input['video_url'] ?? '');
        $documentUrl = trim($input['document_url'] ?? '');

        if (!$id || empty($title)) {
            $this->error('Dữ liệu không hợp lệ.');
        }

        $model = new Lesson();
        $model->update($id, $title, $description, $videoUrl, $documentUrl);
        $this->success([], 'Cập nhật thành công');
    }

    /**
     * DELETE /api/lessons
     */
    public function delete(): void
    {
        RoleMiddleware::check('admin', 'teacher');
        $queryParams = $this->getQueryParams();
        $id = (int)($queryParams['id'] ?? 0);

        if (!$id) {
            $this->error('Thiếu ID.');
        }

        $model = new Lesson();
        $model->delete($id);
        $this->success([], 'Xóa thành công');
    }
}
