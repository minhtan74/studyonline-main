# Bổ sung khóa học và tài liệu thực hành — 31/10/2026

Đã áp dụng trên database local: thêm **3 khóa, 18 chương, 36 bài**, bổ sung sổ tay cho **10 khóa hiện có**. Hệ thống có **13 khóa thực tế, 58 chương, 137 bài**, không tính khóa fixture `PYTEST Course`.

| Khóa mới | Mã khóa | Quy mô | Dự án cuối khóa |
|---|---:|---|---|
| Git & GitHub: quản lý phiên bản và cộng tác thực hành | 894 | 6 chương, 12 bài | Kho Study Notes: lịch sử, nhánh, review, kiểm tra và phát hành |
| Python hướng đối tượng: từ mô hình đến ứng dụng CLI | 895 | 6 chương, 12 bài | Thư viện CLI: mô hình, mượn/trả, JSON, kiểm thử |
| Xây dựng API thực hành với FastAPI | 896 | 6 chương, 12 bài | Task API: SQLite, CRUD, validation, phân quyền, kiểm thử |

Ba khóa mới đang xuất bản, giá 0; bài đầu cho học thử, các bài tiếp theo và tài liệu toàn khóa dùng quyền ghi danh. Tên chương và bài tuân theo quy ước đã chuẩn hóa, bài bắt đầu từ 1 trong mỗi chương.

## Nội dung học

Mỗi bài có mục tiêu, giải thích lý thuyết, ví dụ hoàn chỉnh, kết quả mong đợi, bài có hướng dẫn, bài tự làm, hướng giải/tiêu chí đạt, lỗi thường gặp, câu tự kiểm tra và liên kết nguồn chính thức. Mỗi bài có PDF 3–4 trang. Mỗi khóa có sổ tay lộ trình, điều kiện đầu vào, dự án, rubric 100 điểm và mã nguồn tham khảo. Khóa OOP/FastAPI dự kiến 36 giờ trong 6 tuần; Git có lộ trình sáu tuần trong sổ tay.

Mười sổ tay bổ sung cho các khóa cũ có đề cương lấy từ dữ liệu hiện tại, lộ trình học, dự án và tiêu chí nghiệm thu riêng:

- Python: sổ thu chi CLI.
- JavaScript: bảng theo dõi bài học, DOM, localStorage và trạng thái bất đồng bộ.
- Java: quản lý mượn sách bằng lớp, interface và collection.
- HTML/CSS: trang giới thiệu khóa học có khả năng truy cập và responsive.
- React: bảng kế hoạch học tập, quản lý state và xử lý phản hồi đến muộn.
- MySQL: cơ sở dữ liệu ghi danh, ràng buộc, JOIN, transaction và EXPLAIN.
- Hệ điều hành: mô phỏng FCFS, thời gian chờ và phân tích đồng bộ.
- Mạng: thiết kế mạng phòng học và hồ sơ chẩn đoán.
- Cấu trúc dữ liệu: tra cứu, sắp xếp và BFS.
- Kiểm thử: hồ sơ kiểm thử ghi danh, truy vết, báo lỗi và hồi quy.

Tổng cộng **49 PDF mới, 181 trang**, gồm 36 tài liệu bài và 13 sổ tay. **1.302 đoạn tài liệu** đã được lập chỉ mục cho AI Tutor. Tài liệu cũ và dữ liệu học tập cũ giữ nguyên.

Nguồn tham khảo để đối chiếu gồm [tài liệu Git](https://git-scm.com/docs), [GitHub](https://docs.github.com/en), [Python 3.12](https://docs.python.org/3.12/), [FastAPI](https://fastapi.tiangolo.com/tutorial/), [Pydantic 2](https://docs.pydantic.dev/latest/concepts/models/). Bài giảng, tình huống, câu hỏi và dự án được biên soạn riêng cho bộ tài liệu này; các liên kết theo từng chủ đề nằm trong PDF.

## Quiz và đánh giá

**Cập nhật tiếp theo đã áp dụng:** bộ ôn bài tăng từ 5 lên 10 câu, mỗi khóa có 120 nội dung khác nhau. Đề cuối khóa giữ 60 câu. [Chi tiết thay đổi cách gợi ý và bộ câu vận dụng](study-recommendations-update-20261031.md). Các số liệu 60 câu gốc/540 bản ghi bên dưới mô tả đợt phát hành ban đầu.

Mỗi khóa có **60 câu hỏi gốc**, phân bổ 5 câu cho mỗi bài. Cùng ngân hàng này được tổ chức thành 12 bộ ôn bài (5 câu), 6 bộ ôn chương (10 câu) và một đề cuối khóa (60 câu). Tổng ba khóa có 57 bộ Quiz và 540 bản ghi câu hỏi; **không coi 540 bản ghi là 540 câu hỏi độc lập**.

Các câu có đáp án, giải thích, mức độ khó, chủ đề và mã chương/bài. Vị trí đáp án đúng được xoay để tránh toàn bộ ở phương án A. Bộ luyện gắn với chủ đề giúp gợi ý ôn tập dẫn về đúng nội dung.

Đề cuối khóa: 90 phút, tối đa 3 lượt, lấy điểm cao nhất, ngưỡng đạt 70%. Bộ ôn bài/chương dùng lượt gần nhất, không giới hạn số lượt theo quy tắc ôn tập hiện có. Gợi ý củng cố vẫn dùng căn cứ mới nhất theo từng bài.

Dự án chấm riêng bằng rubric và bằng chứng sản phẩm; hướng dẫn đề xuất dự án tối thiểu 70/100 cùng Quiz tối thiểu 70%. Đây là điều kiện tổ chức học tập trong tài liệu, không có chức năng tự động chấm dự án hoặc cấp chứng nhận được thêm vào hệ thống.

## Cách tìm tài liệu trên trang

Mở khóa học → trang đề cương → **Tài liệu & thực hành toàn khóa** để xem sổ tay. Từng bài có tài liệu PDF và bộ ôn riêng. Trang xem nguồn hiện có hỗ trợ mở và tải PDF. Tên chương/bài trên điện thoại xuống dòng để đọc rõ hơn.

API mới `GET /api/courses/materials?course_id=...` trả danh sách tài liệu toàn khóa, không lộ đường dẫn ổ đĩa. Học viên phải ghi danh; giảng viên chỉ truy cập khóa của mình; admin dùng quyền hiện có. Nội dung tài liệu vẫn kiểm tra quyền tại endpoint nguồn.

Mã dự án để học và đối chiếu: [gói ba dự án](course-release-20261031-projects.zip). Bản nguồn riêng nằm trong `backend/training/course_release_20261031/generated/projects/`; mã tham khảo cũng có trong sổ tay PDF.

## Kiểm chứng

- 26 kiểm tra ví dụ: Git thao tác thật trên kho cục bộ riêng, OOP bằng assert và FastAPI qua TestClient.
- 19 kiểm thử dự án: Git Notes 1, thư viện CLI 10, Task API 8; đều đạt.
- 16 kiểm thử backend về tên tài liệu, quyền xem sổ tay, kết xuất nội dung và giữ đáp án khi xoay lựa chọn; đều đạt.
- 49/49 nguồn PDF và nội dung tải xuống trả 200, hash khớp; 36/36 đường media bài học trả 200.
- Cấu trúc 19 Quiz/khóa và toàn bộ mã chương/bài của câu hỏi đúng; tìm kiếm RAG trả nội dung trong đúng khóa.
- 21 kiểm tra trình duyệt với dữ liệu mô phỏng: ba đề cương, nguồn PDF, desktop/mobile, nội dung tiếng Việt và code; không có lỗi JavaScript.
- Build frontend thành công; còn cảnh báo CSS `@import` và kích thước bundle có sẵn.
- Hash các bản ghi có trước đợt bổ sung giữ nguyên, gồm người dùng, ghi danh, tiến độ, kết quả, câu hỏi, Quiz, tài liệu và vector cũ.

Kiểm tra API dùng học viên thử và ghi danh trong **giao dịch hoàn tác**, không tạo phiên quản trị thật hoặc lưu tài khoản thử. Kiểm tra trình duyệt dùng fixture chặn toàn bộ API, không xác nhận đăng nhập thật qua trình duyệt. Hệ thống duyệt tự động đã từ chối phương án ban đầu tạo phiên quản trị cho UI; phương án mô phỏng thay thế đã chạy thành công.

Kết quả: [API và bảo toàn dữ liệu](course-release-20261031-verification.json), [trình duyệt](course-release-20261031-browser-results.json), [desktop](course-release-desktop.png), [mobile](course-release-mobile.png), [bản xem bài giảng](course-release-lesson-preview.png).

## Tái tạo trên môi trường khác

Các script dùng database cấu hình của backend, không tự đồng bộ database ở máy khác. Từ thư mục `backend`, với Python dependencies, Chrome/Edge và model embedding đã sẵn sàng:

```powershell
.venv/Scripts/python.exe training/course_release_20261031/manage.py prepare
.venv/Scripts/python.exe training/course_release_20261031/manage.py build
.venv/Scripts/python.exe training/course_release_20261031/manage.py check
.venv/Scripts/python.exe training/course_release_20261031/manage.py projects
.venv/Scripts/python.exe training/course_release_20261031/manage.py index
.venv/Scripts/python.exe training/course_release_20261031/manage.py apply
.venv/Scripts/python.exe training/course_release_20261031/manage.py verify
```

Trong checkout hiện tại đã có manifest của đợt áp dụng local: không chạy `prepare` lại hoặc nạp trùng khóa. `apply` nhận biết manifest đã áp dụng và dừng, các slug khóa mới cũng được kiểm tra để ngăn trùng. Khi chuyển sang database khác, tạo một checkout sạch từ nguồn, không dùng manifest và thư mục `generated` của database này.

`prepare` kiểm tra nội dung, ghi nguồn Markdown/HTML và hash dữ liệu cũ; `build` dựng PDF; `check`/`projects` kiểm chứng mã; `index` chuẩn bị vector; `apply` thêm dữ liệu trong một giao dịch sau khi kiểm tra file và dữ liệu cũ; `verify` xác minh và hoàn tác dữ liệu thử. Nếu nội dung nguồn đổi sau khi chuẩn bị, bước áp dụng sẽ từ chối và yêu cầu rà soát bộ dựng tương ứng.
