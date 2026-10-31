# Mục 3: thu hồi phiên

- Đổi mật khẩu: khóa dòng users bằng FOR UPDATE, xác nhận phiên còn mới và mật khẩu cũ, lưu mật khẩu băm đồng thời tăng token_version. Trả token mới cho phiên hiện tại; frontend học viên/giảng viên lưu token mới và thông báo các phiên cũ bị thu hồi.
- Đăng xuất: yêu cầu xác thực, tăng token_version có điều kiện theo phiên gửi yêu cầu, thu hồi tất cả token cũ. Nút ghi Đăng xuất mọi thiết bị. Không thay đổi dữ liệu học tập.
- Frontend chờ server xác nhận trước khi xóa token; lỗi mạng/5xx báo lỗi và giữ trạng thái để thử lại; 401 được coi là phiên đã hết hiệu lực và xóa cục bộ. Request logout có timeout 10 giây và chặn gửi đồng thời.
- Link media nội bộ ký kèm phiên bản phiên; sau thu hồi, link cũ không còn hợp lệ. Cache-Control private,no-store. Cần tải lại trang bài học để nhận link mới sau bản cập nhật; không thể thu hồi bản sao đã tải xuống.
- Không thay khóa JWT hoặc cơ chế mật khẩu legacy (mục 1/2 riêng).

Xác minh: 12 kiểm thử mới trên SQLite cô lập (không ghi DB thật), cùng 14 kiểm thử cấu hình đạt 26/26; kiểm tra 3 vai trò, sai mật khẩu, lỗi ghi DB, phiên cũ, đăng nhập mới, link media và yêu cầu đổi mật khẩu lỗi thời. SQLite kiểm tra logic, không thay thế kiểm thử tranh chấp khóa MySQL thực tế. 16 kiểm tra frontend giả lập đạt cho đổi mật khẩu/lưu token mới/đăng xuất và lỗi mạng trên học viên, giảng viên. Build frontend đạt. Không đổi mật khẩu hay thu hồi phiên người dùng thật trong kiểm tra.
