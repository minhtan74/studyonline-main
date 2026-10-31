# Tóm tắt gợi ý ở Tiến độ học tập

Chỉ thay phần tóm tắt tại `/student/progress`. Giữ bố cục hai cột, Header, Sidebar, trang danh sách đầy đủ và backend.

- Mặc định 5 bài, Xem thêm tăng 5 mỗi lần, hết danh sách thì ẩn nút. Thu gọn trở về 5 và đóng lý do. Bộ đếm đồng bộ số bài đang hiển thị.
- Desktop: hàng 76px, tên bài/khóa/chương rút gọn với tooltip, kết quả Quiz, ưu tiên và nút Ôn tập 78px. Trên vùng nội dung hẹp, thông tin chia hai dòng để giữ chữ dễ đọc và nút dễ bấm.
- Một phần Vì sao được mở tại một thời điểm, giữ các liên kết kết quả Quiz làm căn cứ; bài ít dữ liệu có liên kết luyện thêm Quiz.
- Sắp xếp hiển thị: cao, trung bình, thấp, chưa đủ dữ liệu. Cùng mức ưu tiên, tỷ lệ đúng tăng dần, sau đó số câu hợp lệ giảm dần. Chỉ là thứ tự trình bày, không đổi đánh giá hay lưu trữ.
- Bài chưa đủ dữ liệu có câu sai mang nhãn xám Cần xem lại, bao gồm bài chỉ có một câu sai. Không gọi đây là học viên yếu.
- API hiện tại vẫn tổng hợp mọi khóa học, không thêm lựa chọn khóa. Không thay ngưỡng hay dữ liệu nghiệp vụ.

Kiểm tra: build thành công, 25 kiểm tra Chromium trong `study-summary-browser.cjs`, gồm API thật và fixture kiểm tra 17 bài; desktop/tablet/mobile, mở lý do, 5→10→15→17→5, lỗi/thử lại/trống, kết quả Quiz và đúng ID ôn tập. Thao tác ghi được chặn trong trình duyệt. Build còn cảnh báo font CSS và kích thước bundle có sẵn.
