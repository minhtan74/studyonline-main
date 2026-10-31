# Thiết kế footer StudyOnline

- Footer dùng chung cho các trang công khai: Trang chủ, Đăng nhập, Đăng ký, Khôi phục mật khẩu và trang Hướng dẫn mới /help.
- Tông navy/xanh đồng bộ thương hiệu, dải lời mời học, bốn vùng thông tin: thương hiệu, nền tảng, hướng dẫn và hỗ trợ.
- Khách thấy liên kết tạo tài khoản/đăng nhập; học viên/giảng viên/admin thấy liên kết không gian làm việc, hồ sơ và báo cáo phù hợp vai trò.
- Thay email/hotline mẫu bằng hướng dẫn liên hệ quản trị viên theo kênh lớp/đơn vị. Không tự tạo địa chỉ liên hệ, mạng xã hội hoặc chính sách chưa được chủ hệ thống xác nhận.
- Trang /help có sáu mục: bắt đầu khóa, tài liệu, quiz, gợi ý, AI Tutor và hỗ trợ. Link /help#... mở mục tương ứng, kể cả khi tải lại URL trực tiếp.
- Copyright lấy năm hiện tại; nút Về đầu trang hỗ trợ prefers-reduced-motion; liên kết có focus bàn phím rõ ràng. Footer 4 cột desktop, 2 cột tablet và bố cục xếp gọn trên mobile.
- Không thêm footer lớn vào các layout quản trị/học tập đang dùng sidebar; giữ phạm vi Footer dùng chung hiện có.

Xác minh: 26 kiểm tra UI bằng API giả lập đạt; kiểm tra vai trò bằng token marker không hợp lệ, không dùng tài khoản thật hay ghi database. Build frontend thành công (còn cảnh báo CSS font/bundle trước đây). Đã xem ảnh footer-desktop.png và footer-mobile.png. Script: footer-redesign-browser.cjs; kết quả: footer-redesign-browser-results.json.

## Bố cục cuối theo yêu cầu người dùng

Đã đưa về form ban đầu: nền slate tối, ba cột đều (StudyOnline / Liên kết / Liên hệ & hỗ trợ), đường phân cách và copyright căn giữa. Bổ sung mô tả chức năng, hướng dẫn sử dụng, tài khoản và hỗ trợ. Bản bốn vùng với CTA lớn phía trên được thay thế. Trên mobile xếp một cột. Trang /help giữ lại để liên kết hướng dẫn có nội dung. Ảnh hiện tại: footer-simple-desktop.png, footer-simple-mobile.png. Build đạt; đã xem desktop và kiểm tra không tràn ở 390px. Script và kết quả 26 ca ở phần trước thuộc thiết kế bốn vùng trước đó, không dùng để mô tả phiên bản ba cột này.
