# Trang Khám phá: trạng thái tải và ghi danh

- Tách riêng yêu cầu danh mục và danh sách ID đã đăng ký; xác nhận HTTP thành công, success=true và payload là mảng.
- Không chuyển lỗi thành danh sách rỗng. Khi chưa xác định trạng thái đăng ký, chưa hiển thị thẻ khóa và số lượng chưa đăng ký.
- Mỗi lỗi có thông báo và nút thử lại riêng; chỉ gửi lại yêu cầu bị lỗi, giữ dữ liệu đã tải thành công và bộ lọc tìm kiếm/sắp xếp.
- ID đăng ký dạng số/chuỗi được chuẩn hóa; ngăn mở đăng ký khi dữ liệu chưa sẵn sàng hoặc khóa đã được đăng ký.
- Phân biệt danh mục rỗng, đã đăng ký hết khóa và không khớp từ khóa; trường hợp cuối có nút Xóa tìm kiếm.
- Kết quả của yêu cầu đã hết hiệu lực không cập nhật state sau unmount.

Kiểm tra: build frontend thành công; 20 kiểm tra UI bằng API giả lập đạt, gồm HTTP lỗi, network lỗi, payload sai cấu trúc, retry độc lập, lọc ID chuỗi, danh mục rỗng, đăng ký hết, tìm kiếm và mobile. Không gửi đăng ký/thanh toán thật. Script: explore-loading-browser.cjs; kết quả: explore-loading-browser-results.json.
