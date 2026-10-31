# Giao diện chờ AI gọn

Đã bỏ khung thông báo đang xử lý, bộ đếm thời gian, thông báo sau 15/45 giây và nút Dừng chờ
ở cả AI Tutor và khung AI bài học. Khi chờ chỉ có ba dấu chấm nhỏ; câu trả lời xuất hiện khi API trả kết quả.
Đã bỏ timer cập nhật mỗi giây khỏi hook, giữ nguyên timeout request và bảo vệ phản hồi khác phạm vi.
Lỗi vẫn có thông báo, giữ câu hỏi và cho thử lại/sửa; không giả lập câu trả lời để tạo cảm giác tức thì.

18 kiểm tra trình duyệt giả lập đạt, gồm cả chờ lâu, phản hồi thành công, lỗi rồi thử lại,
không nhân đôi câu hỏi và mobile; build thành công. Đây là thay đổi hiển thị, không làm giảm thời gian xử lý LLM.
Xem [kết quả](ai-minimal-wait-results.json).
