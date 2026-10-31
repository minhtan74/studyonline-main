# Cập nhật gợi ý học tập và bộ ôn bài — 31/10/2026

Đã áp dụng mã và dữ liệu local, giữ ngưỡng **ít nhất 5 nội dung khác nhau**, đúng **dưới 70% → nên ôn**. Mục tiêu là phân biệt thiếu dữ liệu với cần củng cố và giảm việc đếm trùng các bản sao câu hỏi.

## Đã sửa gì thành gì?

| Phần | Trước | Sau |
|---|---|---|
| Nhãn tóm tắt | Cả thiếu dữ liệu và đủ căn cứ đều hiện “Cần xem lại” | Dưới 5 câu có câu sai: **Cần kiểm tra thêm**; đủ 5 câu và dưới 70%: **Nên ôn tập** |
| Số lượng trong tóm tắt | Gộp mọi mục thành “bài cần ôn” | Đếm riêng, ví dụ **1 bài nên ôn · 1 bài cần kiểm tra thêm** |
| Hành động khi ít câu | Nút chính mở ôn bài như nhóm đã đủ căn cứ | **Luyện Quiz** vào bộ luyện cụ thể, hoặc **Chọn Quiz** nếu chưa có liên kết cụ thể |
| Nhận diện câu dùng lại | Dựa trên question ID; cùng câu sao chép sang Quiz khác có ID mới | So nội dung và bộ bốn phương án; đảo thứ tự phương án vẫn nhận ra là cùng câu |
| Chọn kết quả của bản sao | Có thể cộng các quan sát từ nhiều Quiz | Dùng kết quả mới nhất của cùng nội dung trong cùng khóa; không gộp giữa hai khóa |
| Cùng câu xuất hiện hai lần trong một lượt, đáp án mâu thuẫn | Có thể tăng cả số câu và số đúng | Tính một câu; chọn kết quả sai một cách thận trọng cho phần gợi ý |
| So sánh trước/sau ôn | So ID nên có thể báo khác bộ dù chỉ sao chép câu | Mốc mới so định danh nội dung; mốc cũ thiếu thông tin vẫn dùng cách so ID |
| Bộ ôn bài của ba khóa mới | 5 câu/bài, 60 nội dung/khóa | **10 câu/bài, 120 nội dung/khóa** |

## Áp dụng với số câu cụ thể

| Kết quả của bài | Tỷ lệ | Phản hồi |
|---|---:|---|
| Đúng 2/3 | 66,7% | Cần kiểm tra thêm, chưa kết luận yếu |
| Đúng 3/5 | 60% | Nên ôn tập |
| Đúng 4/5 | 80% | Đạt ngưỡng, không gợi ý ôn vì điểm thấp |
| Đúng 6/10 | 60% | Nên ôn tập |
| Đúng 7/10 | 70% | Đạt ngưỡng |

Ví dụ dùng lại câu: cùng 5 câu xuất hiện trong ôn bài, ôn chương và cuối khóa tạo 15 lượt quan sát với các ID khác nhau. Phân tích mới tính **5 nội dung**, dùng đáp án mới nhất; không coi đó là 15 nội dung đã được kiểm tra. Nếu bộ ôn bài có thêm 5 câu vận dụng khác, học viên đã trả lời đủ bộ này thì có căn cứ 10 nội dung.

Gợi ý từng bài dùng lượt gần nhất của bài qua các loại Quiz; gợi ý tổng chương vẫn có thể kết hợp căn cứ gần nhất từ các bài khác nhau. Đạt tổng khóa không tự làm mất gợi ý ôn cho một bài đang cần củng cố.

## Bộ câu vận dụng đã thêm

Thêm **180 câu**, 5 câu cho mỗi bài trong **36 bộ ôn bài** của Git & GitHub, Python OOP và FastAPI. Mỗi câu có bốn phương án, đáp án, giải thích và mã chủ đề/chương/bài. Các câu mới chỉ đưa vào ôn bài, không sao chép thêm sang hai loại đề còn lại.

- Git: phân tích HEAD/index/working tree, commit theo mục đích, conflict, remote, review và tái tạo bản phát hành.
- OOP: alias và trạng thái, bất biến, class/instance attribute, property, composition, hợp đồng thay thế, exception, test biên và JSON.
- FastAPI: hợp đồng HTTP, validation, PATCH, dependency, vòng đời SQLite, query tham số, transaction và quyền sở hữu.

Tổng mỗi khóa: **120 nội dung khác nhau**, 240 bản ghi câu hỏi ở các Quiz. Tổng ba khóa: 360 nội dung, 720 bản ghi. Số bản ghi lớn hơn số nội dung vì 60 câu nền tảng ban đầu vẫn được dùng lại giữa các bộ.

Đề cuối khóa vẫn 60 câu/90 phút, ngưỡng đạt 70%, tối đa 3 lượt. Bộ ôn chương vẫn 10 câu. Có thêm 36 bộ ôn bài từ 5 lên 10 câu; mô tả khóa, bài và bộ ôn được cập nhật tương ứng. Không sửa nội dung câu hỏi cũ, điểm đã lưu, lượt nộp, ghi danh hoặc tiến độ học. Script kiểm tra không có lượt ôn bài đang dở trước khi áp dụng.

Nguồn đối chiếu: [Git diff](https://git-scm.com/docs/git-diff), [Git revert](https://git-scm.com/docs/git-revert), [Python dataclasses](https://docs.python.org/3.12/library/dataclasses.html), [Python JSON](https://docs.python.org/3.12/library/json.html), [FastAPI response models](https://fastapi.tiangolo.com/tutorial/response-model/), [dependencies](https://fastapi.tiangolo.com/tutorial/dependencies/), [testing](https://fastapi.tiangolo.com/tutorial/testing/), [SQLite Python](https://docs.python.org/3.12/library/sqlite3.html). Câu hỏi/tình huống bổ sung được biên soạn riêng.

## Cơ chế nhận diện và giới hạn

Migration `0024_question_evidence` bổ sung `result_answers.question_fingerprint`, có thể NULL. Lượt nộp mới lưu định danh nội dung tại lúc chấm; đổi thứ tự phương án về sau không thay khóa nhận diện đã lưu. Câu trả lời cũ không được ghi lại định danh như thể đã biết nội dung lịch sử; thay vào đó dùng nội dung câu hỏi hiện có và hiện thông báo giới hạn trong phần **Vì sao?**.

Định danh dùng Unicode NFC, chuẩn hóa xuống dòng và bỏ khoảng trắng ngoài cùng; giữ nguyên chữ hoa/thường và khoảng trắng bên trong vì chúng có thể mang ý nghĩa trong code/chuỗi. Chỉ nhận diện bản sao trùng nội dung và bộ phương án, không khẳng định tự hiểu hai cách diễn đạt tương đương. Hai bài toán chỉ đổi vài dữ kiện có thể được tính khác; đây vẫn là quy tắc vận hành, chưa phải chứng nhận độc lập về độ tin cậy đo lường năng lực.

Phần gợi ý sử dụng số câu sau loại trùng; điểm chính thức của Quiz vẫn theo cơ chế chấm hiện có. Như vậy việc sửa cách đếm căn cứ không tự thay điểm chính thức hoặc tự cấp/chấm chứng nhận.

## Kiểm chứng đã chạy

- **56 backend tests**: bản sao khác ID, đảo phương án, thứ tự dữ liệu vào, giữ phân biệt code, kết quả mới nhất, đổi phân loại, cùng câu ở hai khóa, mốc 3/5 và 6/10–7/10, bảo toàn cách gợi ý hiện có và ngân hàng mới.
- **12 Node tests**: phân loại, đếm riêng hai nhóm, thứ tự ưu tiên, lọc và liên kết luyện tập.
- **12 tình huống MySQL/API**, bốn tình huống cho mỗi khóa: 15 quan sát → 5 nội dung; nộp 6/10 cần ôn; nộp 7/10 đạt ngưỡng; 2/3 chưa đủ căn cứ. Nộp bài mới lưu đủ 10 fingerprint. Học viên và kết quả thử nằm trong giao dịch hoàn tác; kiểm tra hash xác nhận dữ liệu thử không lưu lại.
- **15 kiểm tra trình duyệt mô phỏng**: nhãn, số lượng, loại mục đạt 70%, nút mở đúng bài/Quiz, phần giải thích, trạng thái rỗng, desktop/mobile và không phát sinh request ghi khi chỉ đọc/mở giải thích.
- Build frontend thành công; còn các cảnh báo CSS `@import` và bundle vốn có.
- Toàn bộ 36 bộ ôn bài trong database có đúng 10 câu; mỗi khóa có 120 định danh nội dung. Chạy lại script không thêm câu trùng.

Kết quả: [thay đổi dữ liệu và bản lưu trước/sau](study-recommendations-update-20261031.json), [MySQL/API](study-recommendations-update-api-results.json), [trình duyệt](study-recommendations-update-browser-results.json), [desktop](study-recommendations-update-desktop.png), [mobile](study-recommendations-update-mobile.png).

## Áp dụng ở môi trường khác

Các thay đổi dữ liệu đã áp dụng trên database local. Với môi trường khác đã có ba khóa tương ứng, từ thư mục `backend`:

```powershell
.venv/Scripts/python.exe -m alembic upgrade head
.venv/Scripts/python.exe training/course_release_20261031/expand_practice.py
.venv/Scripts/python.exe training/course_release_20261031/expand_practice.py --apply
.venv/Scripts/python.exe ../docs/study-recommendations-update-verify.py
```

Bản lưu mô tả cũ và hash dữ liệu được giữ riêng trong `backend/data/practice_bank_v2/` trước khi ghi. Bước áp dụng dùng một giao dịch và kiểm tra lại nội dung trước khi thêm. Không dùng lại báo cáo kiểm chứng đợt phát hành ban đầu để suy ra số câu hiện tại; báo cáo đó ghi nhận bộ 5 câu trước đợt mở rộng này.
