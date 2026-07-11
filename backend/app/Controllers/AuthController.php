<?php
namespace App\Controllers;

use App\Core\Controller;
use App\Core\Request;
use App\Models\User;
use App\Services\JwtService;
use App\Middleware\JwtMiddleware;

class AuthController extends Controller
{
    /**
     * POST /api/auth/login
     */
    public function login(): void
    {
        $data = $this->getBody();
        $email = trim($data['email'] ?? '');
        $password = trim($data['password'] ?? '');

        if (empty($email) || empty($password)) {
            $this->error('Email và mật khẩu không được để trống.');
        }

        $userModel = new User();
        $user = $userModel->findByEmail($email);

        if (!$user || !($password === $user['password'] || password_verify($password, $user['password']))) {
            $this->error('Email hoặc mật khẩu không chính xác.', 401);
        }

        $jwtService = new JwtService();
        $token = $jwtService->encode([
            'id'       => $user['id'],
            'fullname' => $user['fullname'],
            'email'    => $user['email'],
            'role'     => $user['role'],
        ]);

        $this->success([
            'token' => $token,
            'user'  => [
                'id'       => $user['id'],
                'fullname' => $user['fullname'],
                'email'    => $user['email'],
                'role'     => $user['role'],
            ]
        ]);
    }

    /**
     * POST /api/auth/register
     */
    public function register(): void
    {
        $data = $this->getBody();
        $fullname        = trim($data['fullname']         ?? '');
        $email           = trim($data['email']            ?? '');
        $password        = trim($data['password']         ?? '');
        $confirmPassword = trim($data['confirm_password'] ?? '');

        if (empty($fullname) || empty($email) || empty($password) || empty($confirmPassword)) {
            $this->error('Vui lòng nhập đầy đủ thông tin.');
        }

        if ($password !== $confirmPassword) {
            $this->error('Mật khẩu xác nhận không khớp.');
        }

        $userModel = new User();
        if ($userModel->findByEmail($email)) {
            $this->error('Email này đã được đăng ký.', 409);
        }

        $userModel->create($fullname, $email, $password, 'student');
        $this->success([], 'Đăng ký thành công! Hãy đăng nhập.');
    }

    /**
     * GET /api/auth/me
     */
    public function me(): void
    {
        // JWT Check via middleware
        $payload = JwtMiddleware::handle();

        $this->success([
            'user' => [
                'id'       => $payload['id'],
                'fullname' => $payload['fullname'],
                'email'    => $payload['email'],
                'role'     => $payload['role'],
            ]
        ]);
    }

    /**
     * POST /api/auth/logout
     */
    public function logout(): void
    {
        $this->success([], 'Đăng xuất thành công.');
    }
}
