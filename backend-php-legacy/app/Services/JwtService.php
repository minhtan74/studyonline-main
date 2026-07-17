<?php
namespace App\Services;

class JwtService
{
    private string $secret;
    private int $expire;

    public function __construct()
    {
        $config = require __DIR__ . '/../../config/jwt.php';
        $this->secret = $config['secret'];
        $this->expire = $config['expire'];
    }

    private function base64url_encode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private function base64url_decode(string $data): string
    {
        return base64_decode(strtr($data, '-_', '+/') . str_repeat('=', 3 - (3 + strlen($data)) % 4));
    }

    /**
     * Tạo JWT token
     */
    public function encode(array $payload): string
    {
        $payload['iat'] = time();
        $payload['exp'] = time() + $this->expire;

        $header    = $this->base64url_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
        $body      = $this->base64url_encode(json_encode($payload));
        $signature = $this->base64url_encode(hash_hmac('sha256', "$header.$body", $this->secret, true));

        return "$header.$body.$signature";
    }

    /**
     * Giải mã và xác thực JWT token
     */
    public function decode(string $token): ?array
    {
        $parts = explode('.', $token);
        if (count($parts) !== 3) return null;

        [$header, $body, $signature] = $parts;

        $expected = $this->base64url_encode(hash_hmac('sha256', "$header.$body", $this->secret, true));
        if (!hash_equals($expected, $signature)) return null;

        $payload = json_decode($this->base64url_decode($body), true);
        if (!$payload || !isset($payload['exp'])) return null;
        if ($payload['exp'] < time()) return null; // Hết hạn

        return $payload;
    }
}
