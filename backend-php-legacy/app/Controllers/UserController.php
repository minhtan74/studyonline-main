<?php
namespace App\Controllers;

use App\Core\Controller;
use App\Core\Request;
use App\Models\User;
use App\Middleware\RoleMiddleware;
use App\Middleware\JwtMiddleware;

class UserController extends Controller
{
    public function __construct()
    {
        // Role check moved to individual action methods
    }

    /**
     * GET /api/users
     */
    public function index(): void
    {
        $currentUser = RoleMiddleware::check('admin', 'teacher');
        $queryParams = $this->getQueryParams();
        $id = isset($queryParams['id']) ? (int)$queryParams['id'] : null;

        $userModel = new User();
        if ($id) {
            if ($currentUser['role'] !== 'admin' && $currentUser['id'] !== $id) {
                $this->error('Bạn không có quyền xem thông tin người dùng này.', 403);
                return;
            }
            $user = $userModel->find($id);
            if (!$user) {
                $this->error('Không tìm thấy người dùng.', 404);
            }
            $this->success(['data' => $user]);
        } else {
            $this->success(['data' => $userModel->getAll()]);
        }
    }

    /**
     * POST /api/users
     */
    public function create(): void
    {
        RoleMiddleware::check('admin');
        $input    = $this->getBody();
        $fullname = trim($input['fullname'] ?? '');
        $email    = trim($input['email']    ?? '');
        $password = trim($input['password'] ?? '');
        $role     = trim($input['role']     ?? 'student');

        if (empty($fullname) || empty($email) || empty($password)) {
            $this->error('Vui lòng nhập đầy đủ thông tin.');
        }
        if (!in_array($role, ['admin', 'teacher', 'student'])) {
            $this->error('Vai trò không hợp lệ.');
        }

        $userModel = new User();
        if ($userModel->findByEmail($email)) {
            $this->error('Email này đã tồn tại.', 409);
        }

        $userModel->create($fullname, $email, $password, $role);
        $this->success([], 'Tạo người dùng thành công');
    }

    /**
     * PUT /api/users
     */
    public function update(): void
    {
        $currentUser = RoleMiddleware::check('admin', 'teacher', 'student');
        $input    = $this->getBody();
        $id       = (int)($input['id'] ?? 0);
        $fullname = trim($input['fullname'] ?? '');
        $email    = trim($input['email']    ?? '');
        $role     = trim($input['role']     ?? '');

        if (!$id || empty($fullname) || empty($email) || empty($role)) {
            $this->error('Dữ liệu không hợp lệ.');
        }

        if ($currentUser['role'] !== 'admin') {
            if ($currentUser['id'] !== $id) {
                $this->error('Bạn không có quyền cập nhật người dùng này.', 403);
                return;
            }
            if ($role !== $currentUser['role']) {
                $this->error('Bạn không có quyền thay đổi vai trò của chính mình.', 403);
                return;
            }
        }

        if (!in_array($role, ['admin', 'teacher', 'student'])) {
            $this->error('Vai trò không hợp lệ.');
        }

        $userModel = new User();
        $userModel->update($id, $fullname, $email, $role);
        $this->success([], 'Cập nhật người dùng thành công');
    }

    /**
     * DELETE /api/users
     */
    public function delete(): void
    {
        RoleMiddleware::check('admin');
        $queryParams = $this->getQueryParams();
        $id = (int)($queryParams['id'] ?? 0);
        if (!$id) {
            $this->error('Thiếu ID.');
        }

        $currentUser = JwtMiddleware::getUser();
        if ($currentUser && $currentUser['id'] === $id) {
            $this->error('Bạn không thể tự xóa tài khoản của chính mình.');
        }

        $userModel = new User();
        $userModel->delete($id);
        $this->success([], 'Xóa người dùng thành công');
    }
}
