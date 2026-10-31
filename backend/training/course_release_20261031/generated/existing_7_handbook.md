# Sổ tay học tập và dự án cuối khóa

Nguyên Lí HDH

Biên soạn nội bộ StudyOnline · 31/10/2026. Tài liệu thực hành bổ sung cho các bài giảng hiện có.

## Điều kiện đầu vào và chuẩn bị
Biết biến, hàm và vòng lặp; hiểu file, tiến trình ở mức sử dụng; bài mô phỏng dùng Python 3.12+.

## Kết quả học tập có thể kiểm tra
- Phân biệt chương trình, tiến trình và tiểu trình.
- Mô phỏng lịch chạy và tính chỉ số theo quy ước rõ ràng.
- Phân tích race condition và điều kiện đồng bộ.

## Đề cương và lộ trình học
Mỗi tuần dự kiến 4–6 giờ gồm đọc, làm ví dụ, bài tập và tự đánh giá. Điều chỉnh thời gian theo kết quả thực hành; không xem thời lượng đọc là chứng minh đã nắm vững kiến thức.

### Chương 1: Tổng quan
- Bài 1: Khái niệm về hệ điều hành
- Bài 2: Phân loại hệ điều hành
Hoàn thành nhóm bài này ở chặng 1/4. Sau mỗi bài: tự viết tóm tắt 5 dòng, chạy lại ví dụ với dữ liệu khác, giải bài trước khi xem hướng giải và ghi ít nhất một lỗi đã sửa. Nếu Quiz cho thấy cần củng cố, quay về đúng bài có căn cứ thay vì đọc lại toàn bộ khóa.

### Chương 2: Tiểu trình và tiến trình
- Bài 1: Nhu cầu xử lí đồng thời
- Bài 2: Khái niệm tiến trình và mô hình đa tiến trình
- Bài 3: Khái niệm tiến trình và mô hình tiểu tiến trình
Hoàn thành nhóm bài này ở chặng 2/4. Sau mỗi bài: tự viết tóm tắt 5 dòng, chạy lại ví dụ với dữ liệu khác, giải bài trước khi xem hướng giải và ghi ít nhất một lỗi đã sửa. Nếu Quiz cho thấy cần củng cố, quay về đúng bài có căn cứ thay vì đọc lại toàn bộ khóa.

### Chương 3: Lập trình và tiến trình
- Bài 1: Tổ chức quản lí tiến trình
- Bài 2: Lập trình tiến trình
Hoàn thành nhóm bài này ở chặng 3/4. Sau mỗi bài: tự viết tóm tắt 5 dòng, chạy lại ví dụ với dữ liệu khác, giải bài trước khi xem hướng giải và ghi ít nhất một lỗi đã sửa. Nếu Quiz cho thấy cần củng cố, quay về đúng bài có căn cứ thay vì đọc lại toàn bộ khóa.

### Chương 4: Truyền thông và đồng bộ tiến trình
- Bài 1: Liên lạc tiến trình
- Bài 2: Các cơ chế thông tin liên lạc
- Bài 3: Nhu cầu đồng bộ hóa
- Bài 4: Các giải pháp đồng bộ hóa
Hoàn thành nhóm bài này ở chặng 4/4. Sau mỗi bài: tự viết tóm tắt 5 dòng, chạy lại ví dụ với dữ liệu khác, giải bài trước khi xem hướng giải và ghi ít nhất một lỗi đã sửa. Nếu Quiz cho thấy cần củng cố, quay về đúng bài có căn cứ thay vì đọc lại toàn bộ khóa.

## Quy trình học một buổi
1. Đọc mục tiêu và tự kiểm tra kiến thức đầu vào trong 10 phút.
2. Đọc lý thuyết rồi tự chạy hoặc phân tích ví dụ, ghi đầu ra dự đoán trước khi chạy.
3. Làm bài độc lập trong 30–60 phút; giữ bản nháp và bằng chứng lỗi.
4. Đối chiếu hướng giải, giải thích nguyên nhân chênh lệch.
5. Làm Quiz để phát hiện nội dung cần ôn, sau đó thử một bài tương đương với dữ liệu mới.
6. Mỗi cuối chặng bổ sung một phần dự án, không để toàn bộ dự án đến buổi cuối.

## Đề bài dự án: Mô phỏng điều phối CPU và phân tích đồng bộ
Viết chương trình mô phỏng FCFS cho các công việc có mã, thời điểm đến và CPU burst. Sau đó phân tích một biến đếm chia sẻ với hai tiểu trình bằng các bước xen kẽ trên giấy. Đây là mô hình học tập, không phải công cụ đo hiệu năng hệ điều hành thật.

### Mốc 1: Giả định và dữ liệu
Dùng A(arrival=0,burst=3), B(1,2), C(6,1). Burst dương, arrival không âm; hòa arrival giải theo thứ tự nhập. Ghi rõ một CPU, không preemption và bỏ qua chi phí chuyển ngữ cảnh.
Nộp sản phẩm ở mốc này cùng hai trường hợp kiểm tra và giải thích kết quả. Nếu chưa đạt, ghi việc cần sửa cụ thể trước khi chuyển mốc.

### Mốc 2: Mô phỏng lịch
Với FCFS: A chạy 0–3, B chạy 3–5, CPU rỗi 5–6, C chạy 6–7. Không bắt đầu C ở thời điểm 5 khi nó chưa đến. Lưu start và finish để tính waiting=start-arrival.
Nộp sản phẩm ở mốc này cùng hai trường hợp kiểm tra và giải thích kết quả. Nếu chưa đạt, ghi việc cần sửa cụ thể trước khi chuyển mốc.

### Mốc 3: Đồng bộ
Vẽ read-modify-write của hai phép tăng cùng biến, chỉ ra cách mất cập nhật. Đề xuất vùng tới hạn và khóa; phân biệt tính đúng với số lần chạy thử không thấy lỗi. Không khẳng định GIL giải quyết mọi race.
Nộp sản phẩm ở mốc này cùng hai trường hợp kiểm tra và giải thích kết quả. Nếu chưa đạt, ghi việc cần sửa cụ thể trước khi chuyển mốc.

### Mốc 4: Phân tích và nghiệm thu
So sánh bộ dữ liệu đảo burst và thời điểm đến. Tính trung bình waiting/turnaround bằng tay rồi đối chiếu. Viết báo cáo giới hạn mô hình, không dùng kết quả mô phỏng để kết luận CPU thật nhanh/chậm.
Nộp sản phẩm ở mốc này cùng hai trường hợp kiểm tra và giải thích kết quả. Nếu chưa đạt, ghi việc cần sửa cụ thể trước khi chuyển mốc.

## Ví dụ khởi động và kết quả đối chiếu
```python
jobs = [("A", 0, 3), ("B", 1, 2), ("C", 6, 1)]
clock, waiting = 0, []
for name, arrival, burst in jobs:
    start = max(clock, arrival)
    waiting.append(start - arrival)
    clock = start + burst
assert waiting == [0, 2, 0]
assert clock == 7
print(waiting)  # [0, 2, 0]
```

## Bảng nghiệm thu theo nghiệp vụ
1. Khoảng CPU rỗi được giữ đúng.
2. Burst âm hoặc arrival âm bị từ chối.
3. Mỗi công việc chạy đủ burst đúng một lần.
4. Waiting của A,B,C lần lượt 0,2,0.
5. Turnaround lần lượt 3,4,1.
6. Báo cáo có một lịch xen kẽ gây mất cập nhật và cách bảo vệ.

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
- https://pages.cs.wisc.edu/~remzi/OSTEP/
- https://docs.python.org/3.12/library/threading.html
