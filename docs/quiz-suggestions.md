# Gợi ý sau quiz — mục 4

- Kết quả lượt làm: giữ điểm, trạng thái đạt/chưa đạt, hạn chế hiện đáp án và các liên kết câu sai.
- Nội dung nên ôn: chỉ lấy mục đủ dữ liệu và được backend đánh dấu cần ôn; ưu tiên bài, dùng chương khi chưa có bài cần ôn trong chương đó. Hiện 3 mục đầu, có xem thêm/thu gọn.
- Chưa đủ dữ liệu: nhóm riêng thu gọn, không hiển thị phần trăm; vẫn có số câu đúng và liên kết xem câu sai. Bao gồm cả mục ít câu đã trả lời đúng.
- Bảng chi tiết vẫn có tất cả mục để học viên tra cứu; mục ít câu không hiện phần trăm.
- Gợi ý tổng hợp dùng StudyRecommendationSummary chung với Dashboard, cố định khóa của quiz và chỉ tải khi mở. Liên kết xem tất cả giữ course_id.
- Không đổi cách tổng hợp bằng chứng, ngưỡng 5 câu/70%, số câu trong ngân hàng hay điểm bài làm.

Kiểm tra: 22 kiểm tra UI bằng API giả lập, không dùng tài khoản thật/không ghi database. Bao phủ ít dữ liệu, quiz bài/chương/khóa, ngưỡng 70%, chương chưa gắn bài, xem thêm/thu gọn, lọc khóa, mobile, hạn chế hiện đáp án và trạng thái chưa phân loại. Script: quiz-suggestions-browser.cjs. Build frontend thành công (còn cảnh báo font CSS và kích thước bundle đã có).
