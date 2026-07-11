<?php
namespace App\Core;

class Request
{
    /**
     * Lấy HTTP method hiện tại (GET, POST, PUT, DELETE, ...)
     */
    public static function getMethod(): string
    {
        return $_SERVER['REQUEST_METHOD'] ?? 'GET';
    }

    /**
     * Lấy đường dẫn request URI đã lọc sạch query parameters
     */
    public static function getPath(): string
    {
        $uri = $_SERVER['REQUEST_URI'] ?? '/';
        // Loại bỏ phần base path nếu có
        $base = '/studyonline/backend/public';
        if (str_starts_with($uri, $base)) {
            $uri = substr($uri, strlen($base));
        }
        
        $position = strpos($uri, '?');
        if ($position === false) {
            return rtrim($uri, '/') ?: '/';
        }
        return rtrim(substr($uri, 0, $position), '/') ?: '/';
    }

    /**
     * Lấy toàn bộ body JSON hoặc POST parameters
     */
    public static function getBody(): array
    {
        $body = [];
        if (self::getMethod() === 'POST' || self::getMethod() === 'PUT' || self::getMethod() === 'DELETE') {
            $input = file_get_contents('php://input');
            $data = json_decode($input, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($data)) {
                $body = $data;
            } else {
                $body = $_POST;
            }
        }
        return $body;
    }

    /**
     * Lấy query parameters từ URL
     */
    public static function getQueryParams(): array
    {
        return $_GET;
    }

    /**
     * Lấy giá trị của một header bất kỳ
     */
    public static function getHeader(string $name): ?string
    {
        $nameUpper = strtoupper(str_replace('-', '_', $name));
        if (isset($_SERVER['HTTP_' . $nameUpper])) {
            return $_SERVER['HTTP_' . $nameUpper];
        }
        if (isset($_SERVER[$nameUpper])) {
            return $_SERVER[$nameUpper];
        }
        // Fallback for Apache getallheaders()
        if (function_exists('getallheaders')) {
            $headers = getallheaders();
            foreach ($headers as $key => $value) {
                if (strcasecmp($key, $name) === 0) {
                    return $value;
                }
            }
        }
        return null;
    }
}
