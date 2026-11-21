# Kiểm tra gợi ý học tập — 05/11/2026

Kết quả: 80 kiểm thử backend, 18 kiểm thử Node, 24 kiểm tra trình duyệt và 45 kiểm tra API trên MySQL local đều đạt. Không thay đổi dữ liệu học viên. Đây là phạm vi kiểm chứng các nhóm rủi ro đã xác định, không khẳng định mọi tổ hợp đầu vào đều được kiểm tra.

## Phạm vi

| Nhóm | Nội dung kiểm tra |
|---|---|
| Thiếu dữ liệu | Chưa làm quiz; ít câu; câu chưa phân loại; chưa có gợi ý trong khóa; chỉ có căn cứ chương |
| Phân loại | Tối thiểu 5 câu khác nhau; dưới 70% cần ôn; tại 70% không đưa vào nhóm cần ôn; mẫu nhỏ không kết luận yếu |
| Căn cứ | Lượt mới nhất; bài luyện mới thay đúng bài tương ứng; giữ các bài khác; câu trùng/đảo phương án; trùng nhưng câu trả lời mâu thuẫn; sửa phân loại không đổi kết quả lưu |
| Phạm vi | Theo bài, chương, toàn khóa; cùng tên ở nhiều khóa; không đoán bài từ căn cứ chỉ có chương |
| Quyền | Chỉ dùng khóa còn ghi danh; từ chối khóa khác; kiểm tra liên kết chủ đề/bài/bộ luyện đúng khóa |
| Luyện lại | Cách tính điểm highest/latest/average/first; điểm đạt; hết lượt; lượt bỏ dở; đang làm còn thời gian; hết giờ |
| Trước/sau | Checkpoint không nhân đôi; chỉ lấy kết quả sau mốc; kiểm tra quyền; cảnh báo mẫu nhỏ và bộ câu khác nhau |
| Giao diện | Bộ lọc khóa/URL; Vì sao mở/đóng; 5 mục đầu/xem thêm/thu gọn; nhóm thiếu dữ liệu; lỗi API/mạng và thử lại; khóa bộ lọc khi tải; tên bài dài trên mobile; điều hướng khi checkpoint lỗi |

## Lệnh đã chạy

Trong `backend`:

```powershell
.venv\Scripts\python.exe -m pytest tests/test_recommendations.py tests/test_knowledge.py tests/test_question_evidence.py tests/test_quiz_shuffle.py tests/test_quiz_difficulty.py tests/test_quiz_stream.py
```

Trong `frontend`:

```powershell
node --test --test-isolation=none src/utils/studyRecommendations.test.js tests/quizStream.test.mjs
```

Từ thư mục gốc, khi frontend đang chạy:

```powershell
node docs/study-summary-browser.cjs
```

Script trình duyệt dùng Playwright/Chromium có sẵn trên máy; có thể đặt `PLAYWRIGHT_MODULE`, `CHROMIUM_PATH`, `STUDY_TEST_URL` khi chạy trên máy khác. Mọi API trong trình duyệt được giả lập, không dùng token thật. Kiểm tra mobile chờ hiệu ứng đổi kích thước hoàn tất trước khi đo tràn ngang.

## Dữ liệu thật

Kiểm tra API bằng TestClient, thay dependency người dùng và dùng database local chỉ đọc (không kiểm thử bước đăng nhập). Với 10 học viên: 35 request tổng hợp/theo khóa trả 200, 10 request khóa chưa ghi danh trả 403. Kiểm tra phạm vi khóa, ngưỡng và số liệu trả về. Số bản ghi của 7 bảng trước/sau bằng nhau.

Vũ Thị Phương: vẫn có 5 kết quả quiz, 15 đơn vị kiến thức; có gợi ý chương/bài, luyện lại, bổ sung dữ liệu chủ đề và học tiếp.

## Bằng chứng và giới hạn

- `study-summary-browser-results.json`: 24 kiểm tra UI và danh sách kết quả.
- `study-summary-mobile.png`: ảnh trang Tiến độ ở chiều rộng 390px.
- `study-recommendations-live-results.json`: kết quả đọc MySQL, số bản ghi trước/sau.
- Không phát hiện lỗi sản phẩm trong các kiểm tra trên. Không thay đổi mã chạy của sản phẩm trong lượt kiểm tra này.
- Nhận xét AI thật chưa được tích hợp, nên chưa có kiểm tra chất lượng mô hình, thời gian chờ hoặc lỗi nhà cung cấp AI.
- Chưa kiểm tra mọi trình duyệt, tải đồng thời hoặc cuộc đua giữa nhiều phiên làm bài. UI dùng API giả lập; dữ liệu thật được kiểm tra riêng ở lớp API.
