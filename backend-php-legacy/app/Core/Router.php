<?php
namespace App\Core;

class Router
{
    private static array $routes = [];

    public static function get(string $path, array $callback): void
    {
        self::$routes['GET'][$path] = $callback;
    }

    public static function post(string $path, array $callback): void
    {
        self::$routes['POST'][$path] = $callback;
    }

    public static function put(string $path, array $callback): void
    {
        self::$routes['PUT'][$path] = $callback;
    }

    public static function delete(string $path, array $callback): void
    {
        self::$routes['DELETE'][$path] = $callback;
    }

    public static function resolve(): void
    {
        $method = Request::getMethod();
        $path = Request::getPath();

        $callback = self::$routes[$method][$path] ?? null;

        if ($callback === null) {
            Response::error("Đường dẫn API '$path' cho method '$method' không được tìm thấy.", 404);
        }

        [$controllerClass, $methodName] = $callback;

        if (!class_exists($controllerClass)) {
            Response::error("Lớp xử lý '$controllerClass' không tồn tại.", 500);
        }

        $controller = new $controllerClass();
        if (!method_exists($controller, $methodName)) {
            Response::error("Hành động '$methodName' không tồn tại trong bộ điều khiển.", 500);
        }

        // Gọi method trên controller
        $controller->$methodName();
    }
}
