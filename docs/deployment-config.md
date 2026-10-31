# Cấu hình chạy trực tiếp với MySQL 8.4

## Local hiện tại

Đã cập nhật backend/.env: APP_DEBUG=false; FRONTEND_ORIGIN chỉ gồm http://localhost:5173 và http://127.0.0.1:5173; DB_USER=studyonline_app. Mật khẩu runtime sinh ngẫu nhiên và lưu trong .env, không đưa vào tài liệu hoặc log. Không thay khóa JWT, tài khoản root hay dữ liệu học tập.

Tài khoản studyonline_app@127.0.0.1 chỉ có SELECT, INSERT, UPDATE, DELETE trên database cấu hình. Cần khởi động lại backend để engine và middleware nhận cấu hình mới. Frontend/MySQL không cần thay cách khởi động.

Script scripts/configure_local_runtime.py mặc định chỉ xem kế hoạch; --apply chỉ hỗ trợ local, yêu cầu cấu hình quản trị MySQL hiện tại, không ghi đè tài khoản đã tồn tại. Đã áp dụng, không cần chạy lại.

## Khởi tạo và migration

Trên máy mới: tạo/import schema và chạy Alembic bằng tài khoản quản trị schema trước; sau đó cấp tài khoản runtime và chuyển .env sang tài khoản runtime. Với máy hiện tại khi cần migration:

1. Mở PowerShell trong backend.
2. Đặt $env:DB_USER thành tài khoản quản trị schema, thường là root trên local.
3. Nhập mật khẩu qua Read-Host -AsSecureString và chuyển vào biến môi trường DB_PASS trong phiên shell; không viết mật khẩu vào lệnh hoặc tài liệu.
4. Chạy .venv\Scripts\python.exe -m alembic upgrade head.
5. Xóa hai biến môi trường DB_USER và DB_PASS trong finally; backend tiếp tục dùng tài khoản runtime từ .env.

Tài khoản runtime không có quyền CREATE/ALTER/DROP/GRANT. Không chạy nguyên bộ test API có DDL bằng runtime; dùng database kiểm thử riêng với quyền phù hợp.

## Production

Dùng backend/.env.production.example làm mẫu, thay domain, thông tin DB và các khóa bằng giá trị thật. Loader chỉ tự đọc backend/.env khi chạy trong backend; file .env.production.example không được tự nạp. Có thể truyền biến môi trường qua dịch vụ chạy backend. Không đưa file chứa bí mật lên Git.

APP_ENV=production (hoặc prod) kiểm tra lúc khởi động: debug tắt, origin cụ thể không có đường dẫn, MySQL không dùng root và có mật khẩu. CORS không thay thế xác thực/phân quyền; bảo vệ kết nối ngoài máy bằng HTTPS và tường lửa theo môi trường triển khai. Cập nhật FRONTEND_URL, PUBLIC_BASE_URL và VNPAY_RETURN_URL theo domain thật.

### Lệnh migration local không lưu mật khẩu quản trị

Từ thư mục backend, chạy Python tương tác:

```powershell
.venv\Scripts\python.exe
```

Sau đó nhập:

```python
import getpass, os, subprocess, sys
migration_env = dict(os.environ)
migration_env['DB_USER'] = input('Schema admin user: ')
migration_env['DB_PASS'] = getpass.getpass('Schema admin password: ')
# Chỉ tiến trình migration dùng cấu hình này; không khởi động web bằng tài khoản admin.
migration_env['APP_ENV'] = 'local'
try:
    subprocess.run([sys.executable, '-m', 'alembic', 'upgrade', 'head'], env=migration_env, check=True)
finally:
    migration_env.pop('DB_PASS', None)
    migration_env.clear()
```

Thoát Python sau khi hoàn tất. Không thay backend/.env bằng tài khoản quản trị cho công việc thường ngày.

### Xác minh đã thực hiện

55 kiểm thử cấu hình/gợi ý đạt. Kết nối thực với tài khoản runtime thành công; SHOW GRANTS xác nhận có CRUD và không có CREATE/ALTER/DROP/ALL PRIVILEGES/GRANT OPTION. Kiểm thử CORS xác nhận hai origin local được phép và origin ngoài danh sách bị chặn. File backend/.env được Git bỏ qua. Không đổi dữ liệu khóa học, người dùng, thanh toán hoặc khóa JWT.
