# Kiểm thử lại trạng thái hiện tại — 01/11/2026

Commit mã ứng dụng được kiểm tra: 63c7400. Không sửa logic sản phẩm hoặc push trong lượt này.

## Kết quả

| Nhóm kiểm tra | Kết quả |
|---|---|
| Backend pytest (trừ test_api.py và test_ai_sources.py dùng fixture cũ trên DB chung) | 268/268 đạt |
| Hàm dữ liệu frontend | 23/23 đạt |
| Build frontend | Thành công |
| API đọc MySQL thật qua TestClient với override danh tính | 60/60 đạt |
| Luồng học MySQL thật bằng tài khoản/khóa tạm và outer rollback | 58/58 đạt |
| Dashboard mới | 31 xác nhận UI giả lập đạt |
| Khám phá | 24 xác nhận UI giả lập đạt |
| Khóa học của tôi | 23 xác nhận UI giả lập đạt |
| Đổi mật khẩu/đăng xuất | 16 xác nhận UI giả lập đạt |
| Ma trận 401/403 | 28 xác nhận API-client giả lập đạt |
| Phản hồi 401 cũ sau đổi mật khẩu | 2 xác nhận giữ token mới/không redirect đạt |
| Kết quả quiz không hiển thị gợi ý | 18 xác nhận UI giả lập đạt |

Tổng 142 xác nhận UI/API-client giả lập. Không có runtime error được ghi nhận trong các ca này. Không chạy các script gợi ý sau quiz cũ vì hành vi đã được người dùng yêu cầu bỏ; thay bằng quiz-result-no-suggestions-browser.cjs.

Luồng MySQL 58 ca kiểm tra đăng nhập, ghi danh/trùng ghi danh, lưu tiến độ, ẩn đáp án, nộp quiz bài/chương/khóa, lưu kết quả, gợi ý backend, đổi mật khẩu/token mới, token cũ bị chặn, đăng xuất và đăng nhập lại. Tài khoản/khóa tạm không còn sau rollback; auto-increment có thể có khoảng trống. Không giao dịch thật, không mint token Admin thật để kiểm tra trình duyệt.

Kiểm tra cấu hình: khóa JWT riêng, debug tắt, tài khoản DB runtime riêng; 15/15 tài khoản dùng bcrypt. Kiểm tra đường dẫn bài học: 137 file cục bộ tồn tại, không thiếu file.

## Điểm còn lại

- Giới hạn bcrypt 72 byte vẫn còn: kiểm tra thuần bộ nhớ xác nhận hai chuỗi giống 72 byte đầu nhưng khác hậu tố vẫn có thể xác minh như nhau. Chưa thêm giới hạn byte/đổi thuật toán.
- Chưa có giới hạn số lần thử đăng nhập trong ứng dụng.
- Chưa đặt timeout mặc định cho mọi request; một số luồng có timeout riêng.
- Build còn cảnh báo @import font CSS và bundle JS khoảng 1,1 MB. Không làm build thất bại.

## Chưa thể kết luận

Không gọi LLM thật hoặc VNPay/hoàn tiền thật; chưa kiểm tra toàn bộ thao tác quản trị, upload/video mới, tải đồng thời hoặc domain/HTTPS production. Việc có cấu hình API key không chứng minh dịch vụ bên ngoài hoạt động. Đây là kiểm thử chức năng theo các ca được nêu, không phải chứng nhận toàn bộ hệ thống không có lỗi.

## Bằng chứng

- general-web-check.json và deep-audit-lifecycle.json.
- dashboard-learning-first-browser-results.json.
- explore-loading-browser-results.json và my-courses-fix-browser-results.json.
- session-revocation-browser-results.json, session-race-fix-matrix-results.json, session-race-fix-flow-results.json.
- quiz-result-no-suggestions-browser-results.json.

Preview QA cổng 5174 được tắt sau kiểm tra. Backend/MySQL của người dùng được giữ nguyên.
