<?php
namespace App\Core;

class Response
{
    public static function json(array $data, int $status = 200): void
    {
        // Đảm bảo không có buffer thừa xuất ra trước khi gửi JSON
        while (ob_get_level() > 0) {
            ob_end_clean();
        }

        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    public static function success(array $data = [], string $message = ''): void
    {
        $payload = ['success' => true];
        if ($message) {
            $payload['message'] = $message;
        }
        self::json(array_merge($payload, $data), 200);
    }

    public static function error(string $message, int $status = 400): void
    {
        self::json([
            'success' => false,
            'message' => $message
        ], $status);
    }
}
