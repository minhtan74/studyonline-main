# Chuẩn hóa tên chương, bài học và tài liệu — 31/10/2026

Đã áp dụng trên database local của backend: **10 khóa thực tế, 40 chương, 101 bài học, 176 tài liệu**. Khóa `PYTEST Course` được loại khỏi phạm vi vì là dữ liệu kiểm thử.

- Chương: `Chương 1: Làm Quen Với Python`.
- Bài: `Bài 1: Cài đặt Python & IDE`; đánh số lại từ 1 trong mỗi chương.
- Tài liệu bài học: `Chương 1 — Bài 1: Cài đặt Python & IDE`, giữ hậu tố riêng của tài liệu bổ sung.
- Tên tải xuống: `Chương 1 - Bài 1 - Cài đặt Python & IDE.pdf`.
- Tài liệu dùng chung cả khóa giữ phạm vi toàn khóa và tên khóa, không gán tùy ý vào một chương/bài.

Số thứ tự dùng cùng quy tắc với đề cương: `ORDER BY order_index, id`, không dùng ID làm số bài. Đã sửa 15 tên chương, 99 tên bài và thông tin tên của 176 tài liệu; các tên vốn đã đúng được giữ nguyên. Khóa Hệ điều hành chuyển từ số bài toàn khóa sang số bài trong chương, khớp nhãn của PDF bài học hiện tại.

## Kiểm chứng

- 173 PDF (596 trang) và 3 TXT đều tồn tại, đọc được và trích xuất được văn bản. Kiểm tra này xác nhận tình trạng file, không đánh giá toàn bộ tính đúng đắn học thuật của nội dung.
- 101/101 đường mở PDF bài học qua API trả HTTP 200 với tên tải xuống mới.
- 176/176 tài liệu nguồn trả HTTP 200 cho cả thông tin nguồn và nội dung; hash nội dung tải xuống khớp file.
- Ba TXT tổng hợp cũ ở `training/sample_docs` được sao chép vào `uploads/documents`, cập nhật `documents.file_path` để trình xem nguồn mở được. Bản nguồn cũ còn nguyên, hash các bản sao khớp nhau.
- Chuẩn hóa lặp lại không tạo thay đổi; số bản ghi ở các bảng được kiểm tra giữ nguyên. Không tái lập chỉ mục vector khi chỉ đổi tên.
- 11 kiểm thử đạt: thứ tự chương/bài, tiền tố lặp, tên file an toàn, tên media, giữ hậu tố tài liệu, tính lặp lại và rollback giao dịch khi dữ liệu thay đổi giữa lúc kiểm tra và áp dụng.
- `npm run build` thành công. Build vẫn có cảnh báo về CSS `@import` và kích thước bundle. Chưa kiểm tra trực quan trong trình duyệt.

Chi tiết: [kiểm tra file và danh sách đổi tên](material-names-audit.json), [kết quả kiểm tra API](material-names-verification.json).

## Chạy lại

Từ thư mục `backend`:

```powershell
# Chỉ kiểm tra và lập danh sách thay đổi
.venv/Scripts/python.exe scripts/normalize_material_names.py

# Áp dụng sau khi kiểm tra file; lưu tên cũ/mới trước khi ghi database
.venv/Scripts/python.exe scripts/normalize_material_names.py --apply

# Kiểm thử riêng cho thay đổi này
.venv/Scripts/python.exe -m pytest tests/test_material_names.py tests/test_normalize_material_names.py -q -p no:tmpdir

# Kiểm tra API trên database đang cấu hình, chỉ đọc dữ liệu
.venv/Scripts/python.exe ../docs/material-names-verify.py
```

Mỗi lần có thay đổi, bản lưu tên cũ/mới được giữ riêng trong `backend/data/material_names/`. Bản áp dụng lần này: `20261031_134523_507656.json`. Tất cả cập nhật tên nằm trong một giao dịch; nếu phát hiện bản ghi đã thay đổi sau kiểm tra thì rollback toàn bộ cập nhật tên.

Thay đổi dữ liệu này đã chạy trên database local. Database ở máy khác cần chạy script tương ứng; không tự đồng bộ qua mã nguồn. Các file PDF và đường dẫn đính kèm bài học vẫn dùng nội dung hiện có; tên hiển thị và tên HTTP tải xuống lấy từ thông tin chương/bài.
