<?php
namespace App\Core;

abstract class Controller
{
    /**
     * Helper gửi phản hồi JSON thành công
     */
    protected function success(array $data = [], string $message = ''): void
    {
        Response::success($data, $message);
    }

    /**
     * Helper gửi phản hồi JSON lỗi
     */
    protected function error(string $message, int $status = 400): void
    {
        Response::error($message, $status);
    }

    /**
     * Helper lấy dữ liệu request body dạng JSON
     */
    protected function getBody(): array
    {
        return Request::getBody();
    }

    /**
     * Helper lấy query params
     */
    protected function getQueryParams(): array
    {
        return Request::getQueryParams();
    }
}
