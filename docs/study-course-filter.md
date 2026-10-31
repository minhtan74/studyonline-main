# Lọc gợi ý theo khóa học — 31/10/2026

Đã thêm lựa chọn Khóa học ở hai nơi:

- Thẻ **Gợi ý học tập cho bạn** trên trang Tiến độ.
- Trang **Xem tất cả gợi ý**.

Mặc định **Tất cả khóa học**. Danh sách gồm khóa có căn cứ Quiz và các khóa trong dữ liệu tiến độ đã ghi danh; khóa đã đạt ngưỡng hoặc chưa làm Quiz vẫn có thể chọn. Khóa không có mục cần chú ý hiện thông báo rỗng, không lấy gợi ý từ khóa khác để lấp vào.

Bộ lọc kết hợp theo mã khóa với tìm kiếm và mức Nên ôn tập/Cần kiểm tra thêm. Cả gợi ý cấp bài lẫn cấp chương được lọc. Các số liệu, số nhóm khóa và số hàng hiển thị được tính lại; lựa chọn không bị mất khi bộ lọc khác làm danh sách rỗng. Xóa bộ lọc ở trạng thái rỗng khôi phục cả khóa, mức và từ khóa.

Khóa đã chọn lưu trong URL `?course_id=...`, được giữ khi tải lại trang và chuyển giữa Tiến độ/danh sách đầy đủ. Đổi khóa đặt lại phân trang về 5 mục và đóng phần giải thích cũ. Thao tác lọc chỉ xử lý dữ liệu đã tải, không tạo request ghi hay checkpoint ôn.

Các ô thống kê ở trang đầy đủ dùng đúng hai nhóm hiện tại: Bài nên ôn và Cần kiểm tra thêm, thay cho các nhóm high/medium không còn được adapter trả về.

Kiểm chứng: **15 Node tests**, **22 kiểm tra trình duyệt bằng dữ liệu mô phỏng** và build frontend thành công. Browser kiểm tra lọc kết hợp, chương không có bài cụ thể, khóa đã đạt/chưa làm Quiz, trạng thái rỗng, xóa bộ lọc, số liệu, URL, phân trang, desktop/mobile và không có request ghi. Không tạo phiên đăng nhập thật hay chỉnh dữ liệu học viên. Build vẫn có cảnh báo CSS import/bundle có sẵn.

[Kết quả trình duyệt](study-course-filter-browser-results.json) · [Desktop](study-course-filter-desktop.png) · [Mobile tóm tắt](study-course-filter-mobile.png) · [Mobile đầy đủ](study-course-filter-full-mobile.png).

```powershell
# Từ thư mục frontend
node --test --test-isolation=none src/utils/studyRecommendations.test.js
npm run build
```
