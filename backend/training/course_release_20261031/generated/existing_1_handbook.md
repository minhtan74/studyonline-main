# Sổ tay học tập và dự án cuối khóa

Python Cơ Bản Cho Người Mới Bắt Đầu

Biên soạn nội bộ StudyOnline · 31/10/2026. Tài liệu thực hành bổ sung cho các bài giảng hiện có.

## Điều kiện đầu vào và chuẩn bị
Máy tính có Python 3.12 trở lên; biết tạo thư mục, mở terminal và lưu file UTF-8.

## Kết quả học tập có thể kiểm tra
- Phân tích dữ liệu đầu vào và chọn list/dict phù hợp.
- Tách xử lý thành hàm, kiểm tra đầu vào và giải thích ngoại lệ.
- Tổ chức chương trình nhỏ có lớp, lưu dữ liệu và kiểm thử được.

## Đề cương và lộ trình học
Mỗi tuần dự kiến 4–6 giờ gồm đọc, làm ví dụ, bài tập và tự đánh giá. Điều chỉnh thời gian theo kết quả thực hành; không xem thời lượng đọc là chứng minh đã nắm vững kiến thức.

### Chương 1: Làm Quen Với Python
- Bài 1: Cài đặt Python & IDE
- Bài 2: Biến và kiểu dữ liệu
- Bài 3: Toán tử trong Python
Hoàn thành nhóm bài này ở chặng 1/3. Sau mỗi bài: tự viết tóm tắt 5 dòng, chạy lại ví dụ với dữ liệu khác, giải bài trước khi xem hướng giải và ghi ít nhất một lỗi đã sửa. Nếu Quiz cho thấy cần củng cố, quay về đúng bài có căn cứ thay vì đọc lại toàn bộ khóa.

### Chương 2: Cấu Trúc Điều Khiển & Hàm
- Bài 1: Câu lệnh if - else
- Bài 2: Vòng lặp for, while
- Bài 3: Định nghĩa và sử dụng hàm
Hoàn thành nhóm bài này ở chặng 2/3. Sau mỗi bài: tự viết tóm tắt 5 dòng, chạy lại ví dụ với dữ liệu khác, giải bài trước khi xem hướng giải và ghi ít nhất một lỗi đã sửa. Nếu Quiz cho thấy cần củng cố, quay về đúng bài có căn cứ thay vì đọc lại toàn bộ khóa.

### Chương 3: Lập Trình Hướng Đối Tượng Cơ Bản
- Bài 1: Class và Object
- Bài 2: Kế thừa (Inheritance)
- Bài 3: Dự án nhỏ: Quản lý sinh viên
Hoàn thành nhóm bài này ở chặng 3/3. Sau mỗi bài: tự viết tóm tắt 5 dòng, chạy lại ví dụ với dữ liệu khác, giải bài trước khi xem hướng giải và ghi ít nhất một lỗi đã sửa. Nếu Quiz cho thấy cần củng cố, quay về đúng bài có căn cứ thay vì đọc lại toàn bộ khóa.

## Quy trình học một buổi
1. Đọc mục tiêu và tự kiểm tra kiến thức đầu vào trong 10 phút.
2. Đọc lý thuyết rồi tự chạy hoặc phân tích ví dụ, ghi đầu ra dự đoán trước khi chạy.
3. Làm bài độc lập trong 30–60 phút; giữ bản nháp và bằng chứng lỗi.
4. Đối chiếu hướng giải, giải thích nguyên nhân chênh lệch.
5. Làm Quiz để phát hiện nội dung cần ôn, sau đó thử một bài tương đương với dữ liệu mới.
6. Mỗi cuối chặng bổ sung một phần dự án, không để toàn bộ dự án đến buổi cuối.

## Đề bài dự án: Sổ thu chi cá nhân trên dòng lệnh
Một sinh viên cần ghi các khoản thu/chi và xem tổng theo loại. Mỗi giao dịch có mã duy nhất, loại thu hoặc chi, số tiền nguyên dương tính bằng đồng và mô tả. Chương trình phục vụ một người, chạy cục bộ; dữ liệu thử không chứa thông tin tài chính thật.

### Mốc 1: Mô hình dữ liệu
Chuẩn bị 8 giao dịch gồm thu, chi, hai khoản cùng loại và dữ liệu sai. Viết hàm kiểm tra số tiền dương; từ chối số âm và chuỗi không phải số. Ghi rõ dùng số nguyên đồng để tránh sai số số thực.
Nộp sản phẩm ở mốc này cùng hai trường hợp kiểm tra và giải thích kết quả. Nếu chưa đạt, ghi việc cần sửa cụ thể trước khi chuyển mốc.

### Mốc 2: Hàm nghiệp vụ
Viết add_transaction, total_by_type và balance. Truyền danh sách vào hàm thay vì phụ thuộc biến toàn cục. Với thu 200000 và chi 35000, số dư là 165000. Tạo dữ liệu mới cho từng test.
Nộp sản phẩm ở mốc này cùng hai trường hợp kiểm tra và giải thích kết quả. Nếu chưa đạt, ghi việc cần sửa cụ thể trước khi chuyển mốc.

### Mốc 3: Đối tượng và lưu trữ
Tạo Ledger quản lý giao dịch; lưu JSON với UTF-8. Khi mở lại phải giữ mã giao dịch. File chưa có tạo danh sách rỗng; file hỏng phải thông báo rõ và giữ bản gốc.
Nộp sản phẩm ở mốc này cùng hai trường hợp kiểm tra và giải thích kết quả. Nếu chưa đạt, ghi việc cần sửa cụ thể trước khi chuyển mốc.

### Mốc 4: Hoàn thiện giao diện
Làm menu thêm/xem/tổng kết/thoát. Bắt lỗi nhập số tại ranh giới giao diện, không nuốt mọi Exception trong nghiệp vụ. Viết README chạy bằng python main.py và cung cấp dữ liệu mẫu.
Nộp sản phẩm ở mốc này cùng hai trường hợp kiểm tra và giải thích kết quả. Nếu chưa đạt, ghi việc cần sửa cụ thể trước khi chuyển mốc.

## Ví dụ khởi động và kết quả đối chiếu
```python
def balance(rows):
    return sum(r["amount"] if r["kind"] == "income" else -r["amount"] for r in rows)

rows = [{"kind": "income", "amount": 200000}, {"kind": "expense", "amount": 35000}]
assert balance(rows) == 165000
assert balance([]) == 0
print(balance(rows))  # 165000
```

## Bảng nghiệm thu theo nghiệp vụ
1. Thêm đúng 8 giao dịch và không nhận mã trùng.
2. Dữ liệu rỗng cho tổng 0.
3. Sai số tiền được từ chối mà danh sách không thay đổi.
4. Tổng thu trừ tổng chi đúng với bảng tính tay.
5. Ghi rồi đọc JSON giữ đủ trường và dấu tiếng Việt.
6. Có ít nhất 8 assert cho luồng đúng, lỗi và dữ liệu biên.

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
- https://docs.python.org/3.12/tutorial/controlflow.html
- https://docs.python.org/3.12/tutorial/datastructures.html
- https://docs.python.org/3.12/library/json.html
