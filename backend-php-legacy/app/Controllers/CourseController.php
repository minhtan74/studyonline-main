<?php
namespace App\Controllers;

use App\Core\Controller;
use App\Core\Request;
use App\Models\Course;
use App\Middleware\RoleMiddleware;
use App\Middleware\JwtMiddleware;

class CourseController extends Controller
{
    /**
     * GET /api/courses
     */
    public function index(): void
    {
        $queryParams = $this->getQueryParams();
        $id = isset($queryParams['id']) ? (int)$queryParams['id'] : null;

        $model = new Course();
        if ($id) {
            $course = $model->find($id);
            if (!$course) {
                $this->error('Không tìm thấy khóa học.', 404);
            }
            $this->success(['data' => $course]);
        } else {
            $this->success(['data' => $model->getAll()]);
        }
    }

    /**
     * POST /api/courses
     */
    public function create(): void
    {
        $user = RoleMiddleware::check('admin', 'teacher');
        $input = $this->getBody();
        
        $title       = trim($input['title']       ?? '');
        $description = trim($input['description'] ?? '');
        $thumbnail   = trim($input['thumbnail']   ?? '');

        if (empty($title)) {
            $this->error('Tiêu đề không được trống.');
        }

        $model = new Course();
        $model->create($user['id'], $title, $description, $thumbnail);

        $this->success(['id' => $model->lastInsertId()], 'Tạo thành công');
    }

    /**
     * PUT /api/courses
     */
    public function update(): void
    {
        RoleMiddleware::check('admin', 'teacher');
        $input = $this->getBody();

        $id          = (int)($input['id'] ?? 0);
        $title       = trim($input['title'] ?? '');
        $description = trim($input['description'] ?? '');
        $thumbnail   = trim($input['thumbnail'] ?? '');

        if (!$id || empty($title)) {
            $this->error('Dữ liệu không hợp lệ.');
        }

        $model = new Course();
        $model->update($id, $title, $description, $thumbnail);
        $this->success([], 'Cập nhật thành công');
    }

    /**
     * DELETE /api/courses
     */
    public function delete(): void
    {
        RoleMiddleware::check('admin', 'teacher');
        $queryParams = $this->getQueryParams();
        $id = (int)($queryParams['id'] ?? 0);

        if (!$id) {
            $this->error('Thiếu ID.');
        }

        $model = new Course();
        $model->delete($id);
        $this->success([], 'Xóa thành công');
    }
}
