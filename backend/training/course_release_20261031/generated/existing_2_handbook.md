# Sổ tay học tập và dự án cuối khóa

JavaScript Từ Zero Đến Hero

Biên soạn nội bộ StudyOnline · 31/10/2026. Tài liệu thực hành bổ sung cho các bài giảng hiện có.

## Điều kiện đầu vào và chuẩn bị
Biết HTML cơ bản; dùng trình duyệt có DevTools và trình soạn thảo; chạy ví dụ trong thư mục riêng.

## Kết quả học tập có thể kiểm tra
- Tách dữ liệu JavaScript khỏi thao tác DOM.
- Xử lý sự kiện và trạng thái giao diện có thể kiểm tra.
- Thực hiện tác vụ bất đồng bộ với loading/error rõ ràng.

## Đề cương và lộ trình học
Mỗi tuần dự kiến 4–6 giờ gồm đọc, làm ví dụ, bài tập và tự đánh giá. Điều chỉnh thời gian theo kết quả thực hành; không xem thời lượng đọc là chứng minh đã nắm vững kiến thức.

### Chương 1: Nhập Môn JavaScript
- Bài 1: JavaScript là gì?
- Bài 2: Biến, kiểu dữ liệu & toán tử
- Bài 3: Hàm trong JavaScript
Hoàn thành nhóm bài này ở chặng 1/3. Sau mỗi bài: tự viết tóm tắt 5 dòng, chạy lại ví dụ với dữ liệu khác, giải bài trước khi xem hướng giải và ghi ít nhất một lỗi đã sửa. Nếu Quiz cho thấy cần củng cố, quay về đúng bài có căn cứ thay vì đọc lại toàn bộ khóa.

### Chương 2: DOM & Xử Lý Sự Kiện
- Bài 1: Tổng quan về DOM
- Bài 2: Xử lý sự kiện click, submit
- Bài 3: Dự án: To-do List
Hoàn thành nhóm bài này ở chặng 2/3. Sau mỗi bài: tự viết tóm tắt 5 dòng, chạy lại ví dụ với dữ liệu khác, giải bài trước khi xem hướng giải và ghi ít nhất một lỗi đã sửa. Nếu Quiz cho thấy cần củng cố, quay về đúng bài có căn cứ thay vì đọc lại toàn bộ khóa.

### Chương 3: JavaScript Hiện Đại (ES6+)
- Bài 1: Arrow function & Destructuring
- Bài 2: Promise & Async/Await
- Bài 3: Module & Fetch API
Hoàn thành nhóm bài này ở chặng 3/3. Sau mỗi bài: tự viết tóm tắt 5 dòng, chạy lại ví dụ với dữ liệu khác, giải bài trước khi xem hướng giải và ghi ít nhất một lỗi đã sửa. Nếu Quiz cho thấy cần củng cố, quay về đúng bài có căn cứ thay vì đọc lại toàn bộ khóa.

## Quy trình học một buổi
1. Đọc mục tiêu và tự kiểm tra kiến thức đầu vào trong 10 phút.
2. Đọc lý thuyết rồi tự chạy hoặc phân tích ví dụ, ghi đầu ra dự đoán trước khi chạy.
3. Làm bài độc lập trong 30–60 phút; giữ bản nháp và bằng chứng lỗi.
4. Đối chiếu hướng giải, giải thích nguyên nhân chênh lệch.
5. Làm Quiz để phát hiện nội dung cần ôn, sau đó thử một bài tương đương với dữ liệu mới.
6. Mỗi cuối chặng bổ sung một phần dự án, không để toàn bộ dự án đến buổi cuối.

## Đề bài dự án: Bảng theo dõi bài học bằng JavaScript thuần
Học viên quản lý danh sách bài tự học gồm id, tên, thời lượng và trạng thái hoàn thành. Màn hình cho thêm bài, đánh dấu đã học, tìm kiếm và xem số phút còn lại. Dữ liệu được lưu cục bộ trong trình duyệt để thực hành.

### Mốc 1: Dữ liệu và hàm thuần
Tạo 6 bài mẫu và hàm lọc theo tên không phân biệt hoa thường. Tính tổng phút của bài chưa hoàn thành. Sao chép dữ liệu trước khi thay đổi trong test để tránh test phụ thuộc thứ tự.
Nộp sản phẩm ở mốc này cùng hai trường hợp kiểm tra và giải thích kết quả. Nếu chưa đạt, ghi việc cần sửa cụ thể trước khi chuyển mốc.

### Mốc 2: DOM và sự kiện
Render danh sách bằng createElement/textContent. Liên kết label với input; xử lý submit bằng preventDefault. Tên chứa <b> phải hiển thị như văn bản; không chèn chuỗi người dùng bằng innerHTML.
Nộp sản phẩm ở mốc này cùng hai trường hợp kiểm tra và giải thích kết quả. Nếu chưa đạt, ghi việc cần sửa cụ thể trước khi chuyển mốc.

### Mốc 3: Lưu và phục hồi
Lưu danh sách vào localStorage sau thao tác thành công. Bao JSON.parse trong khối xử lý lỗi phù hợp; khi dữ liệu cũ không đúng cấu trúc phải thông báo và cho phép tạo bộ mẫu mới có xác nhận.
Nộp sản phẩm ở mốc này cùng hai trường hợp kiểm tra và giải thích kết quả. Nếu chưa đạt, ghi việc cần sửa cụ thể trước khi chuyển mốc.

### Mốc 4: Bất đồng bộ và nghiệm thu
Tạo hàm nạp mẫu trả Promise rồi mô phỏng lỗi có kiểm soát. Trong khi nạp vô hiệu hóa nút nạp; khi lỗi hiện nút thử lại, không tự thêm trùng dữ liệu. Kiểm tra bàn phím và màn hình hẹp.
Nộp sản phẩm ở mốc này cùng hai trường hợp kiểm tra và giải thích kết quả. Nếu chưa đạt, ghi việc cần sửa cụ thể trước khi chuyển mốc.

## Ví dụ khởi động và kết quả đối chiếu
```javascript
const lessons = [{id: 1, minutes: 30, done: false}, {id: 2, minutes: 45, done: true}];
const remaining = rows => rows.filter(x => !x.done).reduce((sum, x) => sum + x.minutes, 0);
console.assert(remaining(lessons) === 30);
console.assert(remaining([]) === 0);
console.log(remaining(lessons)); // 30
```

## Bảng nghiệm thu theo nghiệp vụ
1. Danh sách 6 bài hiển thị theo dữ liệu.
2. Tên rỗng và thời lượng không dương được báo lỗi.
3. Đánh dấu hoàn thành cập nhật tổng phút đúng.
4. Tìm kiếm không làm mất trạng thái bài.
5. Tải lại trang giữ dữ liệu hợp lệ.
6. Loading, rỗng và lỗi đều có thông báo dễ hiểu.

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
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide
- https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement
- https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
