# Hiển thị câu trả lời AI và mở nguồn — 31/10/2026

Đã sửa cùng một bộ hiển thị cho **AI Tutor** và **Hỏi AI trong bài học**, áp dụng cả câu trả lời mới
và tin nhắn mở lại từ lịch sử. Nội dung câu trả lời và thuật toán tìm tài liệu không thay đổi.

- Markdown: tiêu đề, in đậm, danh sách, trích dẫn, bảng, inline code và code fence.
- Khối code có tên ngôn ngữ, nút sao chép và cuộn riêng; dòng dài không kéo tràn trang mobile.
- Câu hỏi người dùng vẫn hiển thị nguyên văn.
- Không chạy HTML thô, chặn URL nguy hiểm và không tự tải ảnh ngoài từ câu trả lời.
- Bộ phân tích Markdown tải khi có câu trả lời; nếu tải lỗi vẫn giữ văn bản, hướng dẫn tải lại trang và mở lại hội thoại.

## Mở nguồn

Nhãn trích dẫn có mã tài liệu mở tab `/ai-source?document_id=...&page=...`.
Trang kiểm tra đăng nhập/quyền rồi tải nội dung bằng Authorization header, không đưa JWT vào URL.
PDF mở đến trang được trích dẫn; có nút tải khi trình duyệt không hỗ trợ xem PDF.
TXT/Markdown xem dưới dạng văn bản an toàn và tải được; Word có hướng dẫn tải để mở trong ứng dụng đọc tài liệu.
Nguồn lịch sử thiếu mã tài liệu hiển thị rõ chưa có liên kết, không tạo đường dẫn giả.

API mới:

| API | Kết quả |
|---|---|
| `GET /api/ai/documents/{id}/source` | Tiêu đề, tên file, định dạng, số trang, khóa/bài; không trả đường dẫn máy chủ |
| `GET /api/ai/documents/{id}/content` | Nội dung file đúng kiểu MIME, `nosniff`, cache riêng/no-store |

Admin xem được; Giảng viên cần phụ trách khóa; Học viên cần còn ghi danh.
Backend kiểm tra lại quyền mỗi lần tải, chặn tệp ngoài thư mục `uploads/documents`, đường dẫn traversal
và định dạng không hỗ trợ. File đã tải xuống trước khi bị thu hồi quyền không thể bị lấy lại từ thiết bị người dùng.
Tài liệu đã xóa, file không còn hoặc không có quyền đều có thông báo và nút thử lại.
Blob URL được giải phóng khi rời trang/đổi tài liệu.

## Kiểm chứng

- **88/88 kiểm thử backend đạt:** 17 ca nguồn tài liệu và 71 hồi quy AI clarification.
  Bao phủ ba vai trò, khách, Giảng viên khác khóa, Học viên chưa ghi danh,
  thu hồi ghi danh, tài khoản khóa, file bị xóa, traversal, tệp ngoài thư mục, HTML và các định dạng.
- **35/35 kiểm tra trình duyệt đạt:** hai khung chat, lịch sử, Markdown/code/bảng, clipboard,
  chặn script/link nguy hiểm/ảnh theo dõi, mở PDF thật tại trang trích dẫn, TXT/Word,
  nguồn sai/không tồn tại/không có quyền, mất kết nối tải parser rồi khôi phục và mobile; không có JavaScript exception.
- Build production thành công; Markdown có chunk riêng khoảng 166 KB (gzip khoảng 51 KB),
  không đưa toàn bộ parser vào bundle tải ban đầu. Còn cảnh báo font/CSS và bundle chính lớn đã có trước.
- `npm audit --omit=dev` còn 5 cảnh báo ở axios/follow-redirects, react-router và katex;
  không liệt kê hai thư viện Markdown mới. Không cập nhật các gói ngoài phạm vi trong thay đổi này.
- Câu trả lời dùng dữ liệu giả lập để kiểm tra renderer; PDF thử mở là tài liệu thật qua API có xác thực.
  Không gửi câu hỏi đến nhà cung cấp LLM thật, không thay đổi lịch sử hội thoại mẫu.

Bằng chứng: [JUnit](ai-display-source-tests.xml), [trình duyệt](ai-display-browser-results.json),
[AI Tutor desktop](ai-markdown-desktop.png), [mobile](ai-markdown-mobile.png),
[AI bài học](ai-lesson-markdown-mobile.png), [mở nguồn PDF](ai-source-viewer.png).

Tài liệu thư viện: [react-markdown](https://github.com/remarkjs/react-markdown),
[remark-gfm](https://github.com/remarkjs/remark-gfm).
