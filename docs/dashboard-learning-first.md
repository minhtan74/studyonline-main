# Dashboard học viên: ưu tiên việc học

## Bố cục hiện tại

1. Lời chào gọn và liên kết Khóa học của tôi.
2. Khối Tiếp tục học là hành động chính: một khóa nổi bật, bộ chọn chuyển khóa, số bài hoàn thành/còn lại, thanh tiến độ và nút Vào học ngay/Bắt đầu học. Nút mở đúng đề cương khóa để học viên chọn chương/bài; không gọi đây là bài học gần nhất khi chưa có dữ liệu đó.
3. Tổng quan đặt bên cạnh với bốn chỉ số gọn, chỉ tính khóa đã đăng ký; trạng thái chưa xác định giữ dấu —.
4. Ba lối tắt: Quiz, AI Tutor, Tiến độ, mỗi lối tắt có mô tả ngắn.
5. Gợi ý ôn: ba bài đầu; xem thêm từng nhóm ba; tách và thu gọn bài chưa đủ dữ liệu. Bộ lọc khóa và liên kết xem tất cả giữ nguyên. Trang Tiến độ vẫn hiện năm bài đầu như trước.
6. Nhịp học 7 ngày là thông tin phụ; hoạt động gần đây thu gọn, tối đa ba liên kết bài đã hoàn thành.
7. Khám phá khóa mới đặt cuối trang; giữ grid và kích thước thẻ dùng chung trang Khám phá.

Khóa mặc định ưu tiên khóa đang học dở có tỷ lệ hoàn thành cao nhất theo dữ liệu tổng hợp hiện có. Học viên chủ động chuyển khóa; không hiển thị thời gian học dự kiến hay mục tiêu ngày không có dữ liệu. Khóa đã hoàn thành không đưa vào bộ chọn tiếp tục.

## Trạng thái và phạm vi

Giữ tải dữ liệu độc lập, lỗi/thử lại, học viên chưa đăng ký khóa và đã hoàn thành tất cả khóa. Lỗi tiến độ không bị đổi thành 0%, vẫn vào khóa được. Không đổi backend, thuật toán gợi ý, điểm, tiến độ hoặc ghi danh. Dashboard chỉ đọc dữ liệu; thao tác Ôn tập vẫn dùng luồng ghi nhận ôn tập hiện có khi học viên chủ động bấm.

## Xác minh

- 31 kiểm tra UI bằng API giả lập đạt: ưu tiên hành động, chuyển khóa, liên kết đúng, số liệu đúng, phân trang 3 bài, trang Tiến độ vẫn 5 bài, nhóm ít dữ liệu, các trạng thái lỗi/mới/hoàn thành và các chiều rộng 1600/1024/768/390.
- 23 kiểm thử dữ liệu frontend hiện có đạt.
- Build frontend thành công; cảnh báo font import và bundle lớn đã có vẫn còn.
- Không dùng tài khoản thật hoặc ghi database trong kiểm thử UI. Ảnh mẫu dùng dữ liệu giả lập để đánh giá bố cục, không phải số liệu học viên thật.

Script: dashboard-learning-first-browser.cjs. Kết quả: dashboard-learning-first-browser-results.json. Ảnh: dashboard-learning-first-desktop.png, dashboard-learning-first-mobile.png.
