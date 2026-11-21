# Mục 5: hiệu năng frontend — 01/11/2026

## Thay đổi

- AppRoutes dùng React.lazy cho từng trang, giữ trang chủ và các layout nhỏ sẵn sàng. Mã trang quản trị/giảng viên/học viên được tải khi truy cập thay vì gom vào entry.
- Giữ Suspense trong mỗi layout để thanh điều hướng/sidebar không biến mất khi trang con tải. Boundary ngoài bao phủ route chưa có layout.
- Thêm trạng thái Đang tải trang và recovery UI khi chunk lỗi; chỉ tải lại khi người dùng bấm, không tự lặp request nghiệp vụ.
- Chart.js, KaTeX và các phần dùng chung được Vite tự chia thành chunk; không thay ngưỡng cảnh báo hoặc giấu warning.
- Bỏ Google Fonts @import trong hai file CSS được nhúng vào layer(base). Gộp Inter và Plus Jakarta Sans vào một link stylesheet ở HTML, giữ preconnect và display=swap. Nếu font ngoài không tải được, dùng fallback hệ thống; chưa tự host font.
- Không thêm dependency, không đổi backend, điểm, thuật toán, dữ liệu hoặc quyền truy cập.

## So sánh build

| Chỉ số | Trước | Sau |
|---|---:|---:|
| JavaScript entry tải ban đầu | 1.108.600 byte | 254.711 byte |
| Giảm JavaScript entry | — | 77,0% |
| Gzip ước tính bằng Python gzip | 327.151 byte | 83.283 byte |
| Chunk JS lớn nhất sau tách | — | 262.939 byte |
| Cảnh báo chunk >500 kB | Có | Không |
| Cảnh báo font @import trong layer | Có | Không |

Số liệu lấy từ dist/index.html và file build, lưu ở frontend-performance-before.json/after.json. Đây là dung lượng entry JS, không phải tổng dung lượng ứng dụng hoặc cam kết trang tải nhanh hơn 77%. Trang dùng toán/biểu đồ vẫn tải thêm thư viện tương ứng; hiệu quả thực tế phụ thuộc mạng, cache và máy người dùng. Không thực hiện benchmark thời gian mạng công khai/Lighthouse. Vite dev không phản ánh dung lượng production.

## Kiểm tra

Bản production được phục vụ qua vite preview, API được giả lập, không dùng tài khoản thật và không ghi database.

- 23 xác nhận tối ưu: trang chủ không tải Chart.js/KaTeX/trang vai trò, Help chunk chậm có loading và giữ shell, chunk lỗi có recovery và reload thành công, guard khách không tải trang Admin, mở trực tiếp trang học viên/giảng viên/Admin, công thức KaTeX có renderer và CSS, kết quả quiz vẫn không có gợi ý.
- Hồi quy production: Dashboard 31, Khám phá 24, Khóa học của tôi 23, thu hồi phiên 16, kết quả quiz 18; tổng 112.
- Tổng cộng 135 xác nhận trình duyệt production giả lập đạt.
- 23 kiểm thử dữ liệu frontend hiện có đạt.
- Build thành công và không còn hai loại cảnh báo nêu trên.

Script: frontend-performance-browser.cjs; kết quả: frontend-performance-browser-results.json. Preview QA cổng 5174 đã tắt sau kiểm tra. Không push Git trong lượt này.
