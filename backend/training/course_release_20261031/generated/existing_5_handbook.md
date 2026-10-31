# Sổ tay học tập và dự án cuối khóa

ReactJS Chuyên Sâu

Biên soạn nội bộ StudyOnline · 31/10/2026. Tài liệu thực hành bổ sung cho các bài giảng hiện có.

## Điều kiện đầu vào và chuẩn bị
Đã học JavaScript ES6, array methods, Promise và HTML/CSS; dùng React theo phiên bản package của dự án.

## Kết quả học tập có thể kiểm tra
- Thiết kế component có trách nhiệm rõ ràng và state tối thiểu.
- Xử lý form, danh sách, loading/error và cập nhật bất biến.
- Dùng effect cho đồng bộ bên ngoài và kiểm tra tương tác.

## Đề cương và lộ trình học
Mỗi tuần dự kiến 4–6 giờ gồm đọc, làm ví dụ, bài tập và tự đánh giá. Điều chỉnh thời gian theo kết quả thực hành; không xem thời lượng đọc là chứng minh đã nắm vững kiến thức.

### Chương 1: React Cơ Bản
- Bài 1: Giới thiệu React & JSX
- Bài 2: Component & Props
- Bài 3: State & useState
Hoàn thành nhóm bài này ở chặng 1/3. Sau mỗi bài: tự viết tóm tắt 5 dòng, chạy lại ví dụ với dữ liệu khác, giải bài trước khi xem hướng giải và ghi ít nhất một lỗi đã sửa. Nếu Quiz cho thấy cần củng cố, quay về đúng bài có căn cứ thay vì đọc lại toàn bộ khóa.

### Chương 2: State Management & Hooks Nâng Cao
- Bài 1: useEffect & vòng đời component
- Bài 2: useContext & useReducer
- Bài 3: Custom Hooks
Hoàn thành nhóm bài này ở chặng 2/3. Sau mỗi bài: tự viết tóm tắt 5 dòng, chạy lại ví dụ với dữ liệu khác, giải bài trước khi xem hướng giải và ghi ít nhất một lỗi đã sửa. Nếu Quiz cho thấy cần củng cố, quay về đúng bài có căn cứ thay vì đọc lại toàn bộ khóa.

### Chương 3: Xây Dựng Ứng Dụng Thực Tế
- Bài 1: Kết nối API với Axios
- Bài 2: Routing với React Router
- Bài 3: Dự án: Trang quản lý khoá học
Hoàn thành nhóm bài này ở chặng 3/3. Sau mỗi bài: tự viết tóm tắt 5 dòng, chạy lại ví dụ với dữ liệu khác, giải bài trước khi xem hướng giải và ghi ít nhất một lỗi đã sửa. Nếu Quiz cho thấy cần củng cố, quay về đúng bài có căn cứ thay vì đọc lại toàn bộ khóa.

## Quy trình học một buổi
1. Đọc mục tiêu và tự kiểm tra kiến thức đầu vào trong 10 phút.
2. Đọc lý thuyết rồi tự chạy hoặc phân tích ví dụ, ghi đầu ra dự đoán trước khi chạy.
3. Làm bài độc lập trong 30–60 phút; giữ bản nháp và bằng chứng lỗi.
4. Đối chiếu hướng giải, giải thích nguyên nhân chênh lệch.
5. Làm Quiz để phát hiện nội dung cần ôn, sau đó thử một bài tương đương với dữ liệu mới.
6. Mỗi cuối chặng bổ sung một phần dự án, không để toàn bộ dự án đến buổi cuối.

## Đề bài dự án: Bảng kế hoạch học tập bằng React
Ứng dụng quản lý kế hoạch gồm khóa học, mục tiêu tuần và trạng thái bài. Người dùng thêm mục, lọc theo khóa, đánh dấu xong và xem số mục còn lại. Dùng API giả lập có độ trễ/lỗi để luyện hành vi bất đồng bộ có thể lặp lại.

### Mốc 1: Phân chia component
Vẽ StudyApp, StudyForm, FilterBar, StudyList và StudyItem. Chọn nơi sở hữu state; số bài còn lại được tính từ state, tránh lưu bản sao cần đồng bộ.
Nộp sản phẩm ở mốc này cùng hai trường hợp kiểm tra và giải thích kết quả. Nếu chưa đạt, ghi việc cần sửa cụ thể trước khi chuyển mốc.

### Mốc 2: State và form
Mỗi bản ghi có id ổn định. Dùng controlled input, trim tiêu đề và kiểm tra không rỗng. Cập nhật bằng map/filter hoặc tạo mảng mới; kiểm tra thêm hai bản ghi tên giống nhau vẫn sửa đúng bản.
Nộp sản phẩm ở mốc này cùng hai trường hợp kiểm tra và giải thích kết quả. Nếu chưa đạt, ghi việc cần sửa cụ thể trước khi chuyển mốc.

### Mốc 3: Effect và dữ liệu
Effect tải dữ liệu cần xử lý việc phản hồi đến muộn khi đổi khóa. Ghi rõ trạng thái loading, empty và error. Không dùng effect để tính mọi biến dẫn xuất hoặc tự tạo vòng gọi API.
Nộp sản phẩm ở mốc này cùng hai trường hợp kiểm tra và giải thích kết quả. Nếu chưa đạt, ghi việc cần sửa cụ thể trước khi chuyển mốc.

### Mốc 4: Kiểm thử và tối ưu
Test theo hành vi người dùng: thêm, lọc, hoàn thành, lỗi và thử lại. Chỉ tối ưu sau khi có bằng chứng render chậm; không bọc mọi hàm bằng memoization như một nghi thức.
Nộp sản phẩm ở mốc này cùng hai trường hợp kiểm tra và giải thích kết quả. Nếu chưa đạt, ghi việc cần sửa cụ thể trước khi chuyển mốc.

## Ví dụ khởi động và kết quả đối chiếu
```javascript
const toggle = (rows, id) => rows.map(row => row.id === id ? {...row, done: !row.done} : row);
const before = [{id: 1, done: false}, {id: 2, done: false}];
const after = toggle(before, 2);
console.assert(before[1].done === false);
console.assert(after[1].done === true);
console.assert(after[0] === before[0]);
```
Đây là hàm JavaScript thuần dùng trong cập nhật state: setRows(rows => toggle(rows, id)).

## Bảng nghiệm thu theo nghiệp vụ
1. Thêm/sửa/xóa đúng bản ghi dù tiêu đề trùng.
2. Bộ lọc không làm mất dữ liệu gốc.
3. Tổng còn lại khớp danh sách.
4. Phản hồi cũ không ghi đè khóa vừa chọn.
5. Có giao diện tải, rỗng, lỗi và thử lại.
6. Test không chỉ kiểm tra tên class CSS.

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
- https://react.dev/learn/thinking-in-react
- https://react.dev/learn/updating-arrays-in-state
- https://react.dev/learn/synchronizing-with-effects
