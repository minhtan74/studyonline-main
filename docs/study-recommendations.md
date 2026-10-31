# Màn hình AI gợi ý học tập

Đường dẫn: `/student/recommendations`. Mở từ **Tiến độ học tập → Xem tất cả gợi ý**. Không thêm menu Sidebar; dùng Header, Sidebar và giao diện hiện có.

Màn hình đọc `GET /api/recommendations` không truyền khóa học. Lấy toàn bộ `current.based_on.knowledge.units`, thay vì danh sách `items` chỉ có vài gợi ý đầu. Tiến độ khóa học lấy từ `GET /api/progress`; lỗi tải tiến độ không che danh sách gợi ý.

## Dữ liệu và mức ưu tiên

- Tái sử dụng kết quả đánh giá của backend: `needs_review` là ưu tiên cao; có câu sai nhưng `sufficient_data=false` là ưu tiên trung bình và ghi rõ **Chưa đủ dữ liệu**. Không tạo thêm ngưỡng điểm hay kết luận yếu từ vài câu hỏi.
- Giữ bộ lọc ưu tiên thấp theo yêu cầu. Thuật toán hiện tại không trả nội dung cần ôn thuộc mức này; bộ lọc hiển thị trạng thái trống, không tạo bài giả.
- Không cộng kết quả của các Quiz theo bài/chương/khóa. Backend đã chọn căn cứ mới nhất theo bài. Adapter bảo vệ thêm việc lặp cùng bài, giữ bản có `latest_result_id` mới hơn.
- Chương chưa xác định được bài cụ thể hiển thị thành ghi chú riêng, không tăng số bài học. Số khóa có thể bao gồm khóa chỉ có ghi chú chương.
- Bốn thống kê cập nhật theo danh sách sau lọc/tìm kiếm. Tiến độ chỉ hiển thị khi API có dữ liệu hợp lệ, không mặc định là 0% khi thiếu dữ liệu.
- Nút Ôn tập mở đúng `/lesson?id=...`, giữ API ghi mốc ôn tập hiện có. Luyện thêm Quiz dùng liên kết API nếu có; nếu không có, mở danh sách Quiz.
- Phần Tiến độ học tập giữ thống kê cũ, hiển thị tối đa 3 bài ưu tiên nhất. Dashboard và kết quả Quiz giữ component cũ.

Không thay đổi backend, cơ sở dữ liệu hoặc thuật toán đánh giá. Các mô tả là giải thích từ dữ liệu Quiz, không gọi mô hình AI để tự viết lý do.

## Kiểm tra ngày 31/10/2026

- 8 kiểm tra adapter: toàn bộ bài thay vì top 3, loại trùng, căn cứ mới nhất, dữ liệu ít, chương, tìm không dấu, tiến độ và trạng thái trống.
- 50 lượt kiểm tra Chromium với hai tài khoản học viên: API thật; tình huống bổ sung dùng fixture trong script kiểm tra, không có dữ liệu giả trong sản phẩm. Kiểm tra desktop 1488×900, mobile 390×844, lọc không gọi lại API, thu gọn, top 3, điều hướng, lỗi và thử lại.
- Mọi thao tác ghi trong trình duyệt kiểm tra được chặn/mô phỏng; không ghi mốc ôn hay tiến độ thật.
- Build Vite thành công. Còn cảnh báo có sẵn về import font trong CSS và bundle trên 500 kB.

Chạy lại:

```powershell
cd frontend
node --test --experimental-test-isolation=none src/utils/studyRecommendations.test.js
npm run build
cd ..
node docs/study-recommendations-browser.cjs
```

Script trình duyệt dùng đường dẫn Playwright/Chromium cục bộ và tài khoản mẫu; không ghi token vào báo cáo. Kết quả lưu ở `study-recommendations-results.json`. Ảnh desktop dùng API thật; ảnh mobile dùng fixture kiểm tra.
