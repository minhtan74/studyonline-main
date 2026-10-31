# Sửa phản hồi 401 cũ xóa nhầm phiên mới

Phạm vi: mục 2 trong câu trả lời rà soát kỹ gần nhất (request cũ trả 401 sau đổi mật khẩu).

## Trước

Mọi 401 ngoài /api/auth đều xóa localStorage và chuyển về /login, kể cả response của request gửi bằng token cũ trước khi người dùng nhận token mới.

## Sau

Request interceptor lưu bản chụp token Bearer thực sự gửi đi vào config. Response interceptor chỉ thu hồi phiên và redirect khi token bị từ chối còn trùng token hiện tại. Request cũ, request khách hoặc response sau khi đã xóa phiên chỉ trả lỗi cho bên gọi, không thay đổi phiên mới. Giữ hành vi không auto-redirect của /api/auth. Không tự gửi lại request (tránh lặp đăng ký, lưu tiến độ, nộp bài hoặc thanh toán).

Chỉ thay frontend/src/api/axiosClient.js; không thay backend, mật khẩu, dữ liệu học tập hoặc cấu hình JWT.

## Kiểm tra

- Ca lỗi đổi mật khẩu thực tế trên UI giả lập: token mới được giữ và không redirect (2 xác nhận). Script session-race-fix-flow.cjs.
- Ma trận 28 xác nhận: 401 cũ sau đổi phiên, 401 khách sau đăng nhập, 401 cũ sau logout, 401 hiện tại, 403, 401 /api/auth/login. Kiểm tra trạng thái phiên, response kết thúc, bearer đúng và không replay POST. Script session-race-fix-matrix.cjs.
- 16 kiểm tra hồi quy đổi mật khẩu và đăng xuất của học viên/giảng viên đạt.
- Frontend build thành công; vẫn còn cảnh báo CSS @import và bundle lớn đã có.

Tổng 46 xác nhận giao diện/API-client bằng API giả lập. Không dùng token tài khoản thật, không gọi ngân hàng hoặc ghi database.
