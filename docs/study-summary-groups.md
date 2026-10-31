# Tách nhóm gợi ý trên trang Tiến độ — 31/10/2026

Thẻ Gợi ý học tập hiện tách hai nhóm theo dữ liệu backend:

- **Nên ôn tập:** hiện 5 bài đầu, có nút Xem thêm bài nên ôn theo từng nhóm 5. Bộ đếm chỉ tính bài đủ căn cứ cần ôn; ví dụ `Đang hiển thị 5/11 bài nên ôn`. Giữ toàn bộ 11 bài để xem tiếp.
- **Chưa đủ dữ liệu:** thu gọn mặc định dưới dòng `8 bài chưa đủ dữ liệu — Xem`. Khi mở, giải thích cần ít nhất 5 nội dung khác nhau; hiện số câu đã trả lời so với mức tối thiểu và số câu sai, không hiện tỷ lệ phần trăm của mẫu nhỏ. Nhóm này có phân trang riêng theo 5 mục.

Bộ lọc khóa học áp dụng cả hai nhóm. Đổi khóa hoặc nhận dữ liệu mới sẽ đóng nhóm chưa đủ dữ liệu, đóng giải thích và đưa hai bộ đếm về 5 mục đầu. Khóa chỉ có mục chưa đủ dữ liệu hiện thông báo chưa có bài đủ căn cứ để ôn và vẫn cho mở các mục cần luyện thêm.

Nút Ôn tập cho nhóm đủ căn cứ, Luyện Quiz/Chọn Quiz cho nhóm ít dữ liệu được giữ. Cách tính, ngưỡng 5 câu/70%, điểm và dữ liệu học tập không đổi. Trang xem tất cả gợi ý vẫn có bộ lọc từng nhóm để xem chi tiết.

Kiểm chứng: **22 kiểm tra browser mô phỏng**, **15 Node tests** và build frontend đạt. Browser dùng 11 bài nên ôn + 8 bài chưa đủ dữ liệu; kiểm tra cả hai phân trang, trạng thái mặc định, nội dung một câu sai, chỉ có nhóm ít dữ liệu, khóa rỗng, đổi khóa, mobile và không có request ghi khi chỉ mở/đóng danh sách.

[Kết quả kiểm tra](study-summary-groups-browser-results.json) · [Bản thử desktop](study-summary-groups-desktop.png) · [Bản thử mobile](study-summary-groups-mobile.png). Ảnh dùng dữ liệu mô phỏng, không sửa tài khoản hoặc kết quả thật.
