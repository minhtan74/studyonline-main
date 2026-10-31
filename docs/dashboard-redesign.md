# Dashboard học viên — bố cục mới 31/10/2026

Dashboard đã chuyển sang cùng thành phần gợi ý với trang Tiến độ (`StudyRecommendationSummary`). Các thay đổi về nhãn, bộ lọc khóa, bộ đếm riêng và nhóm ít dữ liệu sẽ được dùng chung tại hai nơi.

## Thứ tự nội dung

1. Lời chào gọn và đường dẫn xem tiến độ chi tiết, thay banner chiếm nhiều diện tích.
2. Bốn chỉ số: khóa đăng ký, khóa đang học, khóa hoàn thành và số bài hoàn thành/tổng bài trong các khóa đã đăng ký.
3. Cột chính: Tiếp tục học, sau đó Gợi ý học tập. Khóa đang học dở được ưu tiên trước khóa chưa bắt đầu, tối đa ba khóa; khóa đã hoàn thành không bị ghi là đang học tiếp.
4. Cột phụ: số bài hoàn thành và biểu đồ bảy ngày, tối đa bốn hoạt động hoàn thành gần đây, liên kết Quiz/AI Tutor/khóa của tôi.
5. Khám phá thêm khóa học ở cuối trang, tối đa ba khóa xuất bản chưa ghi danh. Đây là danh mục khám phá, không gắn nhãn cá nhân hóa khi chưa có căn cứ xếp hạng.

Tablet chuyển các khối về bố cục phù hợp chiều rộng; điện thoại dùng một cột và nút vào khóa học nằm dưới thông tin khóa, giữ tên dài đọc được. Mỗi khối chính có heading và tên vùng truy cập rõ ràng.

## Gợi ý học tập đã đồng bộ

- Mặc định hiện 5 bài Nên ôn tập và nút xem thêm của riêng nhóm này.
- Nhóm Chưa đủ dữ liệu thu gọn mặc định; mở ra mới hiện số câu đã trả lời, mức tối thiểu và số câu sai. Giữ nút luyện/chọn Quiz.
- Lọc theo khóa, giữ lựa chọn trên URL và khi mở danh sách đầy đủ.
- Ngưỡng, điểm, câu hỏi và kết quả học tập không được sửa trong tác vụ bố cục này.

## Dữ liệu và trạng thái lỗi

Các khối tải độc lập; biểu đồ hoặc hoạt động gần đây chậm không giữ danh sách học tiếp trong trạng thái chờ. Từng khối lỗi có thông báo và nút thử lại. Thiếu tiến độ hiện dấu `—` và Chưa xác định tiến độ, không biến thành 0% hoặc kết luận hoàn thành.

Chuẩn hóa ID ghi danh dạng chuỗi/số, tránh bỏ sót khóa. Các chỉ số khóa/bài chỉ tính khóa đã ghi danh; dữ liệu học thử chưa ghi danh không làm tăng các tổng này. Khóa hết bài, người mới chưa đăng ký và người đã hoàn thành toàn bộ có thông báo riêng.

Biểu đồ nhận mảng thật từ API, không dùng dữ liệu mẫu khi nguồn không tải được. Hiển thị ngay, không cần chờ hiệu ứng cột. Thời gian hoạt động dùng định dạng Việt Nam theo helper hiện có.

## Kiểm chứng

- **23 Node tests**: gồm 8 kiểm tra dữ liệu Dashboard và 15 kiểm tra gợi ý hiện có.
- **36 kiểm tra browser mô phỏng**: số liệu thật từ fixture, thứ tự học tiếp, gợi ý chung, bộ lọc, nhóm thu gọn, liên kết, desktop/tablet/mobile, người mới, hoàn thành hết, lỗi từng khối, lỗi toàn bộ, thử lại và nguồn biểu đồ bị chậm.
- Không có request ghi phát sinh từ đọc, lọc, mở nhóm hay thử lại. Không dùng tài khoản hoặc token thật trong kiểm thử.
- Build frontend đạt; vẫn còn cảnh báo CSS `@import` và bundle đã có trước đó.

[Kết quả browser](dashboard-redesign-browser-results.json) · [Ảnh desktop](dashboard-redesign-desktop.png) · [Ảnh mobile](dashboard-redesign-mobile.png). Các ảnh dùng dữ liệu mô phỏng để kiểm tra bố cục và trạng thái, không đại diện kết quả của tài khoản thật.

```powershell
# Từ thư mục frontend
node --test --test-isolation=none src/utils/dashboardOverview.test.js src/utils/studyRecommendations.test.js
npm run build
```

Bố cục này đã được thay bằng phiên bản ưu tiên việc học theo yêu cầu mới của người dùng. Xem dashboard-learning-first.md và các ảnh dashboard-learning-first-*.png; script dashboard-redesign-browser.cjs thuộc bố cục cũ.
