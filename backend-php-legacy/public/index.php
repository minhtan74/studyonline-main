<?php
/**
 * index.php — Điểm vào duy nhất (Single Entry Point) cho Backend API
 */

// 1. Tự động tải lớp (PSR-4 Autoloader thủ công không phụ thuộc Composer)
spl_autoload_register(function ($class) {
    // Map namespaces to directories
    $prefixMap = [
        'App\\'   => __DIR__ . '/../app/',
        'Config\\' => __DIR__ . '/../config/'
    ];

    foreach ($prefixMap as $prefix => $baseDir) {
        $len = strlen($prefix);
        if (strncmp($prefix, $class, $len) === 0) {
            $relativeClass = substr($class, $len);
            $file = $baseDir . str_replace('\\', '/', $relativeClass) . '.php';
            if (file_exists($file)) {
                require $file;
                return;
            }
        }
    }
});

// 2. Parse file .env thủ công
$envFile = __DIR__ . '/../.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (str_starts_with(trim($line), '#')) continue;
        $parts = explode('=', $line, 2);
        if (count($parts) === 2) {
            $key = trim($parts[0]);
            $val = trim($parts[1]);
            // Strip quotes if present
            $val = trim($val, '"\'');
            $_ENV[$key] = $val;
            putenv("$key=$val");
        }
    }
}

// 3. Thiết lập CORS Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 4. Bật hiển thị lỗi dựa trên APP_DEBUG
$debug = filter_var($_ENV['APP_DEBUG'] ?? false, FILTER_VALIDATE_BOOLEAN);
if ($debug) {
    ini_set('display_errors', '1');
    ini_set('display_startup_errors', '1');
    error_reporting(E_ALL);
} else {
    ini_set('display_errors', '0');
    ini_set('display_startup_errors', '0');
    error_reporting(0);
}

// 5. Khởi động ứng dụng Core App
try {
    \App\Core\App::run();
} catch (\Throwable $e) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => false,
        'message' => 'Lỗi hệ thống nghiêm trọng',
        'error' => $debug ? $e->getMessage() : 'Internal Server Error'
    ], JSON_UNESCAPED_UNICODE);
}
