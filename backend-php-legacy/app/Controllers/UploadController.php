<?php
namespace App\Controllers;

use App\Core\Controller;
use App\Middleware\JwtMiddleware;

class UploadController extends Controller
{
    /**
     * POST /api/upload
     *
     * multipart/form-data với field:
     *   - file  : file video (mp4, webm, mkv, ...) hoặc PDF
     *   - type  : 'video' | 'document'
     *
     * Trả về: { url: "http://..." }
     */
    public function upload(): void
    {
        JwtMiddleware::handle(); // bắt buộc đăng nhập

        if (empty($_FILES['file'])) {
            $this->error('Không có file được gửi lên.', 400);
            return;
        }

        $file    = $_FILES['file'];
        $type    = trim($_POST['type'] ?? 'document'); // 'video' | 'document'
        $error   = $file['error'] ?? UPLOAD_ERR_NO_FILE;

        if ($error !== UPLOAD_ERR_OK) {
            $messages = [
                UPLOAD_ERR_INI_SIZE   => 'File vượt quá giới hạn upload_max_filesize trong php.ini.',
                UPLOAD_ERR_FORM_SIZE  => 'File vượt quá giới hạn MAX_FILE_SIZE trong form.',
                UPLOAD_ERR_PARTIAL    => 'File chỉ được upload một phần.',
                UPLOAD_ERR_NO_FILE    => 'Không có file nào được upload.',
                UPLOAD_ERR_NO_TMP_DIR => 'Thiếu thư mục tạm.',
                UPLOAD_ERR_CANT_WRITE => 'Không thể ghi file lên đĩa.',
            ];
            $this->error($messages[$error] ?? 'Lỗi upload không xác định.', 400);
            return;
        }

        // Kiểm tra MIME type
        $allowedVideo    = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-matroska'];
        $allowedDocument = ['application/pdf'];
        $allowedImage    = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        $finfo    = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if ($type === 'video') {
            if (!in_array($mimeType, $allowedVideo, true)) {
                $this->error('Chỉ chấp nhận file video (mp4, webm, ogg, mov, mkv).', 400);
                return;
            }
            $subDir = 'videos';
        } elseif ($type === 'image') {
            if (!in_array($mimeType, $allowedImage, true)) {
                $this->error('Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WebP).', 400);
                return;
            }
            $subDir = 'images';
        } else {
            if (!in_array($mimeType, $allowedDocument, true)) {
                $this->error('Chỉ chấp nhận file PDF.', 400);
                return;
            }
            $subDir = 'documents';
        }

        // Giới hạn dung lượng: video 500 MB, PDF 20 MB, ảnh 5 MB
        $maxBytes = match ($type) {
            'video'  => 500 * 1024 * 1024,
            'image'  => 5   * 1024 * 1024,
            default  => 20  * 1024 * 1024,
        };
        $limitLabel = match ($type) {
            'video'  => '500MB',
            'image'  => '5MB',
            default  => '20MB',
        };
        if ($file['size'] > $maxBytes) {
            $this->error("File quá lớn. Giới hạn: {$limitLabel}.", 400);
            return;
        }

        // Tạo thư mục lưu file
        $uploadDir = __DIR__ . '/../../public/uploads/' . $subDir . '/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        // Tên file an toàn = timestamp + random + extension gốc
        $ext      = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $filename = time() . '_' . bin2hex(random_bytes(6)) . '.' . $ext;
        $destPath = $uploadDir . $filename;

        if (!move_uploaded_file($file['tmp_name'], $destPath)) {
            $this->error('Không thể lưu file lên server. Kiểm tra quyền thư mục.', 500);
            return;
        }

        // Xây dựng URL có thể truy cập
        $scheme   = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
        $host     = $_SERVER['HTTP_HOST'] ?? 'localhost:8000';
        $fileUrl  = "{$scheme}://{$host}/uploads/{$subDir}/{$filename}";

        $this->success(['url' => $fileUrl], 'Upload thành công.');
    }
}
