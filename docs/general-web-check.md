# Kiểm tra tổng quát — 31/10/2026

## Kết quả xác nhận

- 248 kiểm thử backend đạt, không chạy test_api.py/test_ai_sources.py có fixture ghi vào database thật.
- 23 kiểm thử dữ liệu frontend đạt; build thành công. Cảnh báo font @import và bundle JS khoảng 1,1 MB vẫn còn.
- 60/60 API đọc dữ liệu trên MySQL thật đạt cho ba vai trò và khách. Sử dụng TestClient không bật lifespan và dependency override danh tính, không mint JWT, không tạo bài làm hay giao dịch. Không xác nhận đăng nhập thực hoặc toàn bộ quyền ghi bằng kết quả này.
- 137 đường dẫn file cục bộ của bài học được kiểm tra, không thiếu file. Chưa kiểm chứng toàn bộ URL ngoài, nội dung/chất lượng từng file hoặc phát video.
- UI giả lập: Dashboard 36, Khám phá 24, kết quả quiz 22 kiểm tra đạt; không có runtime error trong các ca này.
- Schema ở 0024_question_evidence, runtime MySQL riêng hoạt động; debug tắt; backend đang chạy thực tế từ chối CORS origin ngoài danh sách (HTTP 400).
- Cổng backend 8080/MySQL 3306 có lắng nghe IPv4; frontend 5173 không có lắng nghe IPv4 tại thời điểm kiểm tra. Preview 5174 chỉ phục vụ QA và được tắt sau đó.

## Bất cập còn lại đã xác nhận

1. Cao: JWT vẫn là khóa mặc định trong repository (mục 1 chưa làm).
2. Cao: verify_password nhận chuỗi bằng giá trị lưu DB trước kiểm tra bcrypt. Kiểm tra thuần bộ nhớ xác nhận giá trị hash lưu có thể được hàm chấp nhận như đầu vào mật khẩu; không thử khai thác tài khoản thật (mục 2 chưa làm).
3. Quản lý phiên: tự đổi mật khẩu không tăng token_version; logout không thu hồi token phía server (mục 3 chưa làm).
4. Trang Khóa học của tôi: lỗi API tiến độ hiển thị sai 0/0 bài, 0%, Chưa bắt đầu; lỗi API ghi danh cho danh sách trống không có cảnh báo; ID ghi danh dạng chuỗi không khớp ID khóa dạng số. Đã tái hiện bằng API giả lập, xem general-web-my-courses-repro.json.
5. Axios chưa đặt timeout mặc định; request treo có thể giữ trạng thái tải đến khi tầng mạng kết thúc. Chưa mô phỏng ngắt mạng ngoài trình duyệt toàn hệ thống.
6. Footer còn Hotline 1900 xxxx và email hỗ trợ chưa xác minh. Đây là nội dung chưa hoàn tất, không xác nhận email không tồn tại.
7. Bằng chứng gợi ý vẫn lấy lượt mới nhất cho mỗi bài; lượt ít câu có thể thay đánh giá đủ câu trước đó (mục 5 chưa làm). Đây là giới hạn chính sách hiện tại.

## Chưa xác nhận end-to-end

Đăng nhập thật và lưu phiên; tạo/sửa/xóa dữ liệu theo từng vai trò; đăng ký mới; nộp quiz và lưu kết quả; upload mới; thanh toán/hoàn tiền VNPay; chất lượng và kết nối sinh câu trả lời LLM thật. Có cấu hình khóa LLM/VNPay, nhưng không thể suy ra dịch vụ đang hoạt động từ việc có cấu hình. Không gọi dịch vụ tính phí hoặc gửi giao dịch trong lượt này.

Không sửa logic ứng dụng trong lượt rà soát. Các kiểm tra mới chỉ ghi script và báo cáo trong docs.

## Cập nhật sau rà soát

Mục 4 (Khóa học của tôi) đã sửa và kiểm chứng; xem [báo cáo trước/sau](my-courses-fix-report.md). Các phát hiện phía trên giữ mô tả tại thời điểm rà soát.
