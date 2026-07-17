<?php
namespace App\Middleware;

use App\Core\Response;

class RoleMiddleware
{
    /**
     * Xác thực người dùng hiện tại có vai trò nằm trong danh sách cho phép
     */
    public static function check(string ...$roles): array
    {
        $user = JwtMiddleware::handle();
        
        if (!in_array($user['role'] ?? '', $roles)) {
            Response::error('Bạn không có quyền thực hiện thao tác này.', 403);
        }
        
        return $user;
    }
}
