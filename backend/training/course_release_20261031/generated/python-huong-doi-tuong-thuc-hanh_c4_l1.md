## Mục tiêu bài học
- Chọn kế thừa khi tồn tại quan hệ một loại của hợp lệ.
- Ghi đè hành vi và dùng super để phối hợp khởi tạo.
- Đánh giá lớp con bằng cùng một bộ kiểm tra hợp đồng.

Thời gian dự kiến: 120 phút, gồm đọc và thực hành.

## Mục tiêu và điều kiện học
- Chọn kế thừa khi tồn tại quan hệ một loại của hợp lệ.
- Ghi đè hành vi và dùng super để phối hợp khởi tạo.
- Đánh giá lớp con bằng cùng một bộ kiểm tra hợp đồng.

Mỗi bài dành khoảng 100–150 phút gồm đọc, chạy mã, sửa ví dụ và tự luyện. Dùng Python 3.12 trở lên trong một thư mục học riêng; các ví dụ chỉ dùng thư viện chuẩn. Tạo file `example.py`, chép nguyên khối mã rồi chạy `python example.py`. Trên Windows có thể dùng `py -3.12 example.py` khi lệnh `python` trỏ tới bản khác. Không ghép các lớp cùng tên của nhiều bài vào một file: mỗi ví dụ là một chương trình độc lập.

## Giải thích và lập luận thiết kế
Ta có hai chính sách thời hạn mượn: người đọc thông thường 14 ngày và hội viên hỗ trợ học tập 21 ngày. Một BorrowingPolicy cung cấp phương thức allowed_days; lớp con có thể thay cách tính nhưng vẫn phải trả số nguyên dương. Đó là một hợp đồng mà nơi gọi dựa vào. Nếu lớp con trả chuỗi hoặc từ chối lời gọi hợp lệ của lớp cha, việc thay thế sẽ làm vỡ ứng dụng dù mã có dùng từ khóa kế thừa đúng cú pháp.

Chỉ dùng kế thừa vì muốn chia sẻ một vài dòng mã có thể tạo một cây lớp sai nghĩa. Trước khi viết class Child(Parent), hỏi liệu mọi thao tác được hứa bởi Parent có hợp lý trên Child không. Library chứa Book đã học là quan hệ chứa, không phải một loại sách. Với chính sách mượn, inheritance có thể hữu ích vì các chính sách thực hiện cùng một loại phép tính và kết quả có cùng ý nghĩa.

Ghi đè tạo một phương thức cùng tên ở lớp con. super() hỗ trợ gọi tiếp theo thứ tự phân giải phương thức; trong cây đơn giản của bài, nó gọi triển khai ở lớp cha. Không cần dạy nhiều kế thừa cùng lúc để sử dụng hiệu quả cơ chế này. Khi constructor lớp con có thêm cấu hình, gọi super().__init__ để giữ phần kiểm tra chung trước khi thiết lập phần riêng.

Hợp đồng nên kiểm tra bằng hành vi quan sát được. Một hàm test_policy(policy) nhận bất kỳ chính sách nào và kiểm tra kết quả cho dữ liệu bình thường, biên và sai. Bài không khẳng định một vài test chứng minh toàn bộ tính thay thế; nó cho ta cách phát hiện vi phạm thường gặp. Các nhánh điều kiện kiểm tra tên lớp khắp chương trình là dấu hiệu nơi gọi đang phụ thuộc chi tiết lớp con quá nhiều.

## Ví dụ hoàn chỉnh để chạy
```python
import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

class BorrowingPolicy:
    def __init__(self, days=14):
        if type(days) is not int or days <= 0:
            raise ValueError("Số ngày phải là số nguyên dương")
        self._days = days

    def allowed_days(self):
        return self._days

class SupportedPolicy(BorrowingPolicy):
    def __init__(self):
        super().__init__(days=21)

    def allowed_days(self):
        return super().allowed_days()

def test_policy(policy):
    result = policy.allowed_days()
    assert type(result) is int and result > 0

normal, supported = BorrowingPolicy(), SupportedPolicy()
for policy in (normal, supported):
    test_policy(policy)
assert normal.allowed_days() == 14
assert supported.allowed_days() == 21
print(normal.allowed_days(), supported.allowed_days())
```

## Kết quả mong đợi và cách kiểm tra
In `14 21`. Hàm test_policy không biết tên lớp cụ thể nhưng dùng chung API. Việc SupportedPolicy ghi đè rồi gọi super là minh họa cơ chế; trong mã thật có thể kế thừa trực tiếp allowed_days vì không đổi hành vi. Biết bỏ một override thừa cũng là một quyết định thiết kế tốt.

Đọc từng dòng thực thi và dự đoán trạng thái trước khi chạy. Sau lần chạy đầu, đổi dữ liệu theo bài tập rồi đối chiếu cả kết quả lẫn trạng thái đối tượng; một dòng in đúng chưa chứng minh các trường hợp lỗi đã đúng. Các lệnh `assert` trong ví dụ dùng kiểm tra khi học, không thay thế việc kiểm tra đầu vào của ứng dụng vì Python có thể bỏ assert khi chạy chế độ tối ưu.

## Bài tập có hướng dẫn và bài tự làm
Hướng dẫn: tạo ShortLoanPolicy dùng 7 ngày và chạy lại bộ kiểm tra hợp đồng. Tự làm ReportFormatter với format_row(code, title) trả chuỗi; một lớp con tạo dòng CSV đơn giản bằng csv.writer, một lớp tạo văn bản. Không dùng nối dấu phẩy thủ công nếu dữ liệu có thể chứa dấu phẩy hoặc dấu ngoặc kép.

Viết phiên bản lỗi của policy trả "21" rồi chứng minh test_policy bắt được. Bài nộp giải thích lỗi về hợp đồng giá trị trả về, không chỉ nói “sai kiểu vì test yêu cầu”. Nêu lợi ích khi nơi gọi không phải sửa mỗi lần có thêm một chính sách phù hợp.

## Hướng giải và tiêu chí hoàn thành
ShortLoanPolicy có thể chỉ gọi constructor cha với days=7 và dùng phương thức kế thừa. Với formatter, hợp đồng là trả chuỗi biểu diễn một bản ghi theo quy ước ghi rõ; không được bất ngờ ghi file bên trong một triển khai nếu nơi gọi chỉ yêu cầu chuỗi. Đạt khi cùng hàm gọi làm việc được với cả các lớp con, và test chỉ ra điều kiện mà một triển khai vi phạm. Chọn composition nếu nhu cầu thực là thay chiến lược cho một đối tượng tồn tại.

## Sai sót thường gặp và cách phát hiện
Bỏ super trong constructor lớp con có thể làm trường cha không được khởi tạo. Gọi trực tiếp tên lớp cha ở nhiều chỗ làm khó thay cấu trúc hơn. Kiểm tra isinstance rồi rẽ nhánh cho từng lớp con ở mọi nơi triệt tiêu lợi ích thay thế; tập trung vào hợp đồng cần có thay vì tên lớp cụ thể.

## Câu hỏi tự kiểm tra và đáp án
1. Kế thừa phù hợp khi nào? Đáp án: Khi quan hệ một loại của và hợp đồng hành vi phù hợp.
2. Một lớp con trả chuỗi thay số ngày nguyên có đúng hợp đồng bài không? Đáp án: Không.
3. Override gọi lại y nguyên super có luôn cần không? Đáp án: Không; có thể dùng trực tiếp phương thức kế thừa.

## Đọc thêm từ tài liệu chính thức
- https://docs.python.org/3.12/tutorial/classes.html#inheritance
- https://docs.python.org/3.12/library/functions.html#super

Ghi lại phiên bản Python, lệnh đã chạy, dữ liệu thử và một quyết định thiết kế vào nhật ký học tập. Khi nhờ hỗ trợ, gửi ví dụ nhỏ tái hiện được cùng thông báo lỗi đầy đủ; không gửi dữ liệu cá nhân hoặc đường dẫn chứa thông tin bí mật.
