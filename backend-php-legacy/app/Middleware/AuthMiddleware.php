<?php
namespace App\Middleware;

class AuthMiddleware
{
    /**
     * Chỉ yêu cầu người dùng phải đăng nhập thành công
     */
    public static function check(): array
    {
        return JwtMiddleware::handle();
    }
}
