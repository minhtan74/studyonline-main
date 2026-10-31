# Task API — dự án thực hành FastAPI

API quản lý nhiệm vụ cục bộ có validation, SQLite, quyền chủ sở hữu và tests. Hai token giả phục vụ học cách tách danh tính/quyền, chưa phải hệ thống đăng nhập Internet. Dùng Python 3.12+ trong thư mục riêng. Không dùng database/tài khoản thật.

## Cài và kiểm tra
Tạo môi trường ảo bằng `python -m venv .venv`, kích hoạt rồi chạy:

```text
python -m pip install -r requirements.txt
python -m pytest -q test_app.py
```

Tests dùng thư mục tạm, xóa dữ liệu sau mỗi test và không gọi mạng ngoài. Khi nâng dependencies, chạy lại toàn bộ tests. Phiên bản khóa giúp tái hiện bộ bài; đây không phải khuyến nghị duy trì phiên bản cũ vô thời hạn.

## Chạy trên máy học viên
PowerShell, từ thư mục dự án:

```powershell
$env:LAB_TOKENS_JSON = '{"training-alice-only":1,"training-bob-only":2}'
$env:LAB_DATABASE_PATH = 'lab_tasks.sqlite3'
python -m uvicorn run:app --host 127.0.0.1 --port 8000 --reload
```

Bash:

```sh
export LAB_TOKENS_JSON='{"training-alice-only":1,"training-bob-only":2}'
export LAB_DATABASE_PATH='lab_tasks.sqlite3'
python -m uvicorn run:app --host 127.0.0.1 --port 8000 --reload
```

Truy cập http://127.0.0.1:8000/docs. Nhấn Authorize và nhập một token giả, không gõ thêm chữ Bearer nếu giao diện HTTPBearer chỉ yêu cầu giá trị. Dừng bằng Ctrl+C. File SQLite giữ dữ liệu sau khi dừng; bài test dùng file khác. Không đưa .env hoặc database cá nhân vào bài nộp.

## Hợp đồng
- GET /health: 200, status ok, không công bố token/path. Chỉ là liveness cơ bản.
- POST /tasks: body title 1–120 ký tự sau trim, trả 201 với id/owner_id/title/done. Body có owner_id bị từ chối 422.
- GET /tasks: danh sách của user hiện tại, hỗ trợ done=true/false, offset>=0, limit 1–50; lọc trước phân trang, total là số dòng đã lọc.
- GET /tasks/{id}: trả một nhiệm vụ thuộc user hiện tại.
- PATCH /tasks/{id}: body {"done":true} với boolean JSON, trả trạng thái mới.
- DELETE /tasks/{id}: 204 không body.
- Thiếu/sai token: 401 với WWW-Authenticate. Nhiệm vụ không tồn tại: 404. ID của người khác: 403. Title trùng trong cùng owner: 409. Đầu vào sai: 422.
- UNIQUE(owner_id,title) cho phép hai user dùng cùng title. Tất cả giá trị client được bind trong SQL; tên cột/sắp xếp do code kiểm soát.

## Nghiệm thu và mở rộng
Xem test_app.py cho CRUD, title biên/trắng, query biên, trường owner giả, quyền GET/PATCH/DELETE chéo, title trùng, phân trang, persistence và dữ liệu giống cú pháp SQL. Request lỗi không tạo thêm bản ghi hoặc sửa nhiệm vụ trái quyền. Chạy lại tests lần hai để kiểm tra cô lập.
Mở rộng yêu cầu: đổi title có kiểm tra UNIQUE, deadline hoặc lọc nâng cao. Giữ owner filter và thêm test trước/sau lỗi; giữ tests cũ đạt. Nộp bảng yêu cầu→test và rubric tự chấm. Giảng viên đánh giá code và giải thích, không chỉ xem ảnh /docs.

## Giới hạn thiết kế
Token tĩnh chỉ dành cho loopback lab: chưa có phát hành, hết hạn, thu hồi, password hashing hay OIDC. Khi đưa lên mạng cần review danh tính thật, TLS, cấu hình bí mật, backup/restore, migration, hạn mức, log và theo dõi theo yêu cầu sản phẩm. SQLite có giới hạn khóa ghi; cần đánh giá workload trước chọn kiến trúc khác. Bộ mẫu này là nền tảng thực hành, chưa chứng nhận an toàn/khả năng vận hành cho mọi hệ thống thực tế.
