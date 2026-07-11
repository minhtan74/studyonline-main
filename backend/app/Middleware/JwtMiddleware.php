<?php
namespace App\Middleware;

use App\Core\Request;
use App\Core\Response;
use App\Services\JwtService;

class JwtMiddleware
{
    private static ?array $authenticatedUser = null;

    /**
     * Thực thi kiểm tra JWT từ Authorization Header
     */
    public static function handle(): array
    {
        if (self::$authenticatedUser !== null) {
            return self::$authenticatedUser;
        }

        $authHeader = Request::getHeader('Authorization') ?? Request::getHeader('authorization');
        
        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            Response::error('Chưa đăng nhập. Vui lòng cung cấp mã token hợp lệ.', 401);
        }

        $token = substr($authHeader, 7);
        $jwtService = new JwtService();
        $payload = $jwtService->decode($token);

        if (!$payload) {
            Response::error('Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.', 401);
        }

        self::$authenticatedUser = $payload;
        return $payload;
    }

    /**
     * Lấy thông tin user đã đăng nhập
     */
    public static function getUser(): ?array
    {
        return self::$authenticatedUser;
    }
}
