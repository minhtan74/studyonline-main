<?php
namespace App\Core;

class App
{
    public static function run(): void
    {
        // Tải danh sách định tuyến API
        $routesFile = __DIR__ . '/../../routes/api.php';
        if (file_exists($routesFile)) {
            require_once $routesFile;
        } else {
            Response::error('Không tìm thấy file định tuyến routes/api.php.', 500);
        }

        // Định tuyến yêu cầu
        Router::resolve();
    }
}
