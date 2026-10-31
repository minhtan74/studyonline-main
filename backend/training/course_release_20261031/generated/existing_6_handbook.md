# Sổ tay học tập và dự án cuối khóa

MySQL & Thiết Kế Cơ Sở Dữ Liệu

Biên soạn nội bộ StudyOnline · 31/10/2026. Tài liệu thực hành bổ sung cho các bài giảng hiện có.

## Điều kiện đầu vào và chuẩn bị
MySQL 8.4 và client; quyền tạo một database thực hành riêng; biết SELECT và khóa chính.

## Kết quả học tập có thể kiểm tra
- Thiết kế lược đồ có ràng buộc phù hợp nghiệp vụ.
- Viết JOIN và tổng hợp tránh đếm trùng.
- Dùng transaction, chỉ mục và EXPLAIN có căn cứ.

## Đề cương và lộ trình học
Mỗi tuần dự kiến 4–6 giờ gồm đọc, làm ví dụ, bài tập và tự đánh giá. Điều chỉnh thời gian theo kết quả thực hành; không xem thời lượng đọc là chứng minh đã nắm vững kiến thức.

### Chương 1: Nhập Môn Cơ Sở Dữ Liệu
- Bài 1: Khái niệm cơ sở dữ liệu
- Bài 2: Cài đặt MySQL & Workbench
- Bài 3: Câu lệnh SELECT cơ bản
Hoàn thành nhóm bài này ở chặng 1/3. Sau mỗi bài: tự viết tóm tắt 5 dòng, chạy lại ví dụ với dữ liệu khác, giải bài trước khi xem hướng giải và ghi ít nhất một lỗi đã sửa. Nếu Quiz cho thấy cần củng cố, quay về đúng bài có căn cứ thay vì đọc lại toàn bộ khóa.

### Chương 2: Truy Vấn SQL Nâng Cao
- Bài 1: JOIN nhiều bảng
- Bài 2: GROUP BY & Aggregate Function
- Bài 3: Subquery & View
Hoàn thành nhóm bài này ở chặng 2/3. Sau mỗi bài: tự viết tóm tắt 5 dòng, chạy lại ví dụ với dữ liệu khác, giải bài trước khi xem hướng giải và ghi ít nhất một lỗi đã sửa. Nếu Quiz cho thấy cần củng cố, quay về đúng bài có căn cứ thay vì đọc lại toàn bộ khóa.

### Chương 3: Thiết Kế Database Chuẩn Hoá
- Bài 1: Chuẩn hoá dữ liệu (1NF-3NF)
- Bài 2: Thiết kế ERD
- Bài 3: Dự án: Thiết kế CSDL website học trực tuyến
Hoàn thành nhóm bài này ở chặng 3/3. Sau mỗi bài: tự viết tóm tắt 5 dòng, chạy lại ví dụ với dữ liệu khác, giải bài trước khi xem hướng giải và ghi ít nhất một lỗi đã sửa. Nếu Quiz cho thấy cần củng cố, quay về đúng bài có căn cứ thay vì đọc lại toàn bộ khóa.

## Quy trình học một buổi
1. Đọc mục tiêu và tự kiểm tra kiến thức đầu vào trong 10 phút.
2. Đọc lý thuyết rồi tự chạy hoặc phân tích ví dụ, ghi đầu ra dự đoán trước khi chạy.
3. Làm bài độc lập trong 30–60 phút; giữ bản nháp và bằng chứng lỗi.
4. Đối chiếu hướng giải, giải thích nguyên nhân chênh lệch.
5. Làm Quiz để phát hiện nội dung cần ôn, sau đó thử một bài tương đương với dữ liệu mới.
6. Mỗi cuối chặng bổ sung một phần dự án, không để toàn bộ dự án đến buổi cuối.

## Đề bài dự án: Cơ sở dữ liệu đăng ký khóa học
Thiết kế students, courses và enrollments cho trung tâm nhỏ. Một học viên chỉ ghi danh một lần cho một khóa. Dữ liệu thử gồm 5 học viên, 3 khóa và 8 ghi danh, có học viên chưa ghi danh và khóa chưa có ai học.

### Mốc 1: ERD và ràng buộc
Ghi cardinality rồi tạo khóa chính/ngoại. Enrollments có UNIQUE(student_id,course_id). Phân biệt thiếu giá trị với chuỗi rỗng; chọn kiểu tiền chính xác nếu bổ sung học phí.
Nộp sản phẩm ở mốc này cùng hai trường hợp kiểm tra và giải thích kết quả. Nếu chưa đạt, ghi việc cần sửa cụ thể trước khi chuyển mốc.

### Mốc 2: Dữ liệu và truy vấn
Nạp dữ liệu có kiểm soát trong database thực hành riêng. Viết LEFT JOIN giữ khóa không có ghi danh. Đối chiếu COUNT(e.id) với COUNT(*) để thấy vì sao hàng NULL gây khác biệt.
Nộp sản phẩm ở mốc này cùng hai trường hợp kiểm tra và giải thích kết quả. Nếu chưa đạt, ghi việc cần sửa cụ thể trước khi chuyển mốc.

### Mốc 3: Transaction và cạnh tranh
Thử hai phiên cùng thêm một cặp ghi danh. Ràng buộc duy nhất phải chặn trùng dù cả hai phiên đã kiểm tra trước. Dùng transaction cho một nghiệp vụ nhiều bước; thử rollback trong dữ liệu thử.
Nộp sản phẩm ở mốc này cùng hai trường hợp kiểm tra và giải thích kết quả. Nếu chưa đạt, ghi việc cần sửa cụ thể trước khi chuyển mốc.

### Mốc 4: Hiệu năng và bàn giao
Dùng EXPLAIN cho truy vấn theo student_id và course_id. Giải thích dựa trên truy vấn thực tế trước khi thêm chỉ mục. Có script schema, sample_data và queries chạy theo thứ tự trên database riêng.
Nộp sản phẩm ở mốc này cùng hai trường hợp kiểm tra và giải thích kết quả. Nếu chưa đạt, ghi việc cần sửa cụ thể trước khi chuyển mốc.

## Ví dụ khởi động và kết quả đối chiếu
```sql
SELECT c.id, c.title, COUNT(e.id) AS enrollment_count
FROM courses AS c
LEFT JOIN enrollments AS e ON e.course_id = c.id
GROUP BY c.id, c.title
ORDER BY c.id;
```
Chạy trong schema thực hành có hai bảng tương ứng. Khóa chưa có ghi danh phải hiện enrollment_count = 0; COUNT(*) ở truy vấn này sẽ cho 1 với hàng được bù NULL.

## Bảng nghiệm thu theo nghiệp vụ
1. Ràng buộc FK chặn tham chiếu không tồn tại.
2. Không thể ghi danh trùng một cặp.
3. Báo cáo vẫn hiện khóa chưa có học viên.
4. Tổng ghi danh khớp dữ liệu kiểm tra bằng tay.
5. Rollback không để lại nghiệp vụ nửa chừng.
6. README ghi rõ database thử và không yêu cầu xóa dữ liệu thật.

## Rubric chấm dự án — 100 điểm
- Đúng nghiệp vụ và dữ liệu: 35 điểm. Kiểm tra các điều kiện nghiệm thu, chỉ cho điểm phần có bằng chứng.
- Thiết kế và giải thích lựa chọn: 20 điểm. Cấu trúc rõ, nêu giả định, hiểu giới hạn.
- Kiểm thử và xử lý trường hợp lỗi: 25 điểm. Có ca đúng, sai, biên và bằng chứng chạy lại sau sửa.
- Tài liệu bàn giao và khả năng tái hiện: 15 điểm. README, dữ liệu mẫu, lệnh chạy hoặc quy trình quan sát.
- Tự phản biện và trình bày: 5 điểm. Giải thích một quyết định, một lỗi từng gặp và cách kiểm chứng.
Điều kiện hoàn thành được đề xuất cho giảng viên: Quiz đạt tối thiểu 70% và dự án tối thiểu 70/100, đồng thời đáp ứng các điều kiện nghiệp vụ cốt lõi. Dự án cần giảng viên đánh giá bằng sản phẩm; điểm Quiz không tự chuyển thành điểm dự án.

## Bộ hồ sơ cần nộp
- README mô tả công cụ/phiên bản, cách chuẩn bị và cách chạy từng bước.
- Mã nguồn hoặc hồ sơ phân tích, dữ liệu mẫu đã loại thông tin cá nhân.
- Test plan hoặc danh sách kiểm tra có expected/actual, ảnh hoặc nhật ký phù hợp.
- Báo cáo 2–4 trang: mục tiêu, thiết kế, kết quả, giới hạn và hướng cải tiến.
- Tự đánh giá rubric kèm đường dẫn tới bằng chứng. Người khác phải tái hiện được kết quả từ tài liệu, không cần đoán bước còn thiếu.

## Hướng tự sửa và đánh giá lại
Khi thất bại một ca, giữ nguyên dữ liệu tái hiện nhỏ nhất, xác định sai từ đầu vào hay từ xử lý, sửa một nguyên nhân rồi chạy lại cả ca lỗi và các ca liên quan. Với câu Quiz sai, giải thích vì sao đáp án đúng và vì sao phương án đã chọn không phù hợp. Chỉ nhớ chữ cái đáp án không giúp giải quyết tình huống mới.
Giảng viên có thể giao biến thể dữ liệu hoặc yêu cầu giải thích trực tiếp để kiểm tra mức hiểu. Ghi rõ phần chưa hoàn thành, không thay bằng ảnh giao diện đẹp hoặc số lượng dòng mã.

## Tài liệu tham khảo và học tiếp
- https://dev.mysql.com/doc/refman/8.4/en/create-table-foreign-keys.html
- https://dev.mysql.com/doc/refman/8.4/en/commit.html
- https://dev.mysql.com/doc/refman/8.4/en/using-explain.html
