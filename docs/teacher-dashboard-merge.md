# Gộp Dashboard và Báo cáo giảng viên

- Chỉ còn một menu Dashboard; trang Báo cáo riêng đã được loại bỏ.
- Các URL /teacher/reports, /teacher/students, /teacher/stats chuyển về /teacher, giữ query và hash.
- Dashboard có sáu chỉ số, biểu đồ đăng ký/doanh thu, khóa học có nhiều lượt đăng ký và bảng tiến độ/điểm quiz học viên.
- Bộ lọc khóa học áp dụng chung; tìm học viên theo tên/email. Doanh thu chỉ tính giao dịch completed; dữ liệu tiến độ thiếu hiển thị chưa xác định.
- Tải bốn nguồn dữ liệu song song, không gọi API theo từng chương/bài. Có thông báo lỗi và thử lại.

Kiểm tra: production build thành công; 27 kiểm tra Node đạt (4 mới, 23 hồi quy); trình duyệt với API giả lập đạt các luồng chuyển hướng, quyền sở hữu khóa, bộ lọc, tìm kiếm, màn hình 390px, lỗi/thử lại, không gọi N+1 và không có lỗi JavaScript. Không sửa dữ liệu MySQL.

Báo cáo UC: Giảng viên có một UC “Xem Dashboard giảng viên”, bao gồm xem tổng quan, doanh thu và tiến độ học viên; không cần UC Báo cáo riêng.
