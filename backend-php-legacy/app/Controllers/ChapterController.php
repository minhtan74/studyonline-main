<?php
namespace App\Controllers;

use App\Core\Controller;
use App\Core\Request;
use App\Models\Chapter;
use App\Middleware\RoleMiddleware;

class ChapterController extends Controller
{
    /**
     * GET /api/chapters
     */
    public function index(): void
    {
        $queryParams = $this->getQueryParams();
        $id       = isset($queryParams['id'])        ? (int)$queryParams['id']        : null;
        $courseId = isset($queryParams['course_id']) ? (int)$queryParams['course_id'] : null;

        $model = new Chapter();
        if ($id) {
            $chapter = $model->find($id);
            if (!$chapter) {
                $this->error('Không tìm thấy chương.', 404);
            }
            $this->success(['data' => $chapter]);
        } elseif ($courseId) {
            $this->success(['data' => $model->getByCourse($courseId)]);
        } else {
            $this->error('Cần truyền course_id hoặc id.');
        }
    }

    /**
     * POST /api/chapters
     */
    public function create(): void
    {
        RoleMiddleware::check('admin', 'teacher');
        $input = $this->getBody();

        $courseId    = (int)($input['course_id']   ?? 0);
        $chapterName = trim($input['chapter_name'] ?? '');

        if (!$courseId || empty($chapterName)) {
            $this->error('Dữ liệu không hợp lệ.');
        }

        $model = new Chapter();
        $model->create($courseId, $chapterName);
        $this->success(['id' => $model->lastInsertId()], 'Tạo thành công');
    }

    /**
     * PUT /api/chapters
     */
    public function update(): void
    {
        RoleMiddleware::check('admin', 'teacher');
        $input = $this->getBody();

        $id          = (int)($input['id'] ?? 0);
        $chapterName = trim($input['chapter_name'] ?? '');

        if (!$id || empty($chapterName)) {
            $this->error('Dữ liệu không hợp lệ.');
        }

        $model = new Chapter();
        $model->update($id, $chapterName);
        $this->success([], 'Cập nhật thành công');
    }

    /**
     * DELETE /api/chapters
     */
    public function delete(): void
    {
        RoleMiddleware::check('admin', 'teacher');
        $queryParams = $this->getQueryParams();
        $id = (int)($queryParams['id'] ?? 0);

        if (!$id) {
            $this->error('Thiếu ID.');
        }

        $model = new Chapter();
        $model->delete($id);
        $this->success([], 'Xóa thành công');
    }
}
