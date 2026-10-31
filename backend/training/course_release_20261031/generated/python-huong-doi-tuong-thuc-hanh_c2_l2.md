## Mục tiêu bài học
- Thiết kế điểm cập nhật để bảo vệ bất biến.
- Dùng property cho dữ liệu đọc có phép tính hoặc xác thực.
- Giải thích giới hạn của quy ước dấu gạch dưới trong Python.

Thời gian dự kiến: 120 phút, gồm đọc và thực hành.

## Mục tiêu và điều kiện học
- Thiết kế điểm cập nhật để bảo vệ bất biến.
- Dùng property cho dữ liệu đọc có phép tính hoặc xác thực.
- Giải thích giới hạn của quy ước dấu gạch dưới trong Python.

Mỗi bài dành khoảng 100–150 phút gồm đọc, chạy mã, sửa ví dụ và tự luyện. Dùng Python 3.12 trở lên trong một thư mục học riêng; các ví dụ chỉ dùng thư viện chuẩn. Tạo file `example.py`, chép nguyên khối mã rồi chạy `python example.py`. Trên Windows có thể dùng `py -3.12 example.py` khi lệnh `python` trỏ tới bản khác. Không ghép các lớp cùng tên của nhiều bài vào một file: mỗi ví dụ là một chương trình độc lập.

## Giải thích và lập luận thiết kế
Đóng gói giúp người sử dụng đối tượng biết những thao tác được hỗ trợ và những chi tiết không nên dựa vào. Với tài khoản điểm học tập, ta muốn cộng số điểm hợp lệ nhưng không cho người gọi tùy ý gán tổng âm. Ta giữ _points và cung cấp add_points cùng một property points chỉ đọc. Quy tắc _name biểu thị chi tiết nội bộ theo quy ước, không tạo vùng bảo mật chống truy cập.

Property cho phép truy cập theo cú pháp thuộc tính nhưng thực hiện hàm getter hoặc setter. Chọn property khi thao tác giống đọc một giá trị, ví dụ borrowed = total - available. Không giấu một lời gọi mạng chậm hoặc hành động gửi email trong property mà người dùng tưởng là đọc dữ liệu. Phương thức có tên động từ phù hợp hơn khi hành động có hiệu ứng đáng kể.

Không có setter cho points khiến phép gán thông thường wallet.points = -1 nhận AttributeError. Điều đó giúp bắt lỗi sử dụng API, còn người gọi có chủ ý vẫn có thể truy cập _points. Vì vậy dữ liệu đầu vào từ CLI hoặc file phải được kiểm tra và ứng dụng không được coi dấu gạch dưới là cơ chế phân quyền. Double underscore có name mangling nhằm tránh một số xung đột tên, không biến giá trị thành bí mật.

Trong ví dụ, add_points kiểm tra trước khi cộng và không làm tròn số thập phân sang số nguyên. Getter trả số nguyên bất biến, tránh lộ một list mutable mà người gọi có thể sửa bỏ qua phương thức. Nếu cần công khai danh sách, có thể trả tuple hoặc bản sao theo hợp đồng rõ. Mục tiêu là giảm số nơi có quyền phá bất biến, nhờ đó các test tập trung vào một API nhỏ và ổn định.

## Ví dụ hoàn chỉnh để chạy
```python
import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

class StudyPoints:
    def __init__(self):
        self._points = 0

    @property
    def points(self):
        return self._points

    def add_points(self, amount):
        if type(amount) is not int or amount <= 0:
            raise ValueError("Điểm thêm phải là số nguyên dương")
        self._points += amount

account = StudyPoints()
account.add_points(10)
assert account.points == 10
try:
    account.points = -1
except AttributeError:
    pass
else:
    raise AssertionError("Property chỉ đọc phải chặn phép gán")
try:
    account.add_points(-2)
except ValueError:
    pass
assert account.points == 10
print(account.points)
```

## Kết quả mong đợi và cách kiểm tra
In `10`. Phép gán points bị từ chối; lần cộng âm cũng bị từ chối và không thay đổi tổng. Đặt assert sau lời gọi sai để chứng minh trạng thái được giữ nguyên. Một test chỉ kiểm tra có ngoại lệ mà quên xem dữ liệu sau lỗi còn có thể bỏ sót cập nhật một phần.

Đọc từng dòng thực thi và dự đoán trạng thái trước khi chạy. Sau lần chạy đầu, đổi dữ liệu theo bài tập rồi đối chiếu cả kết quả lẫn trạng thái đối tượng; một dòng in đúng chưa chứng minh các trường hợp lỗi đã đúng. Các lệnh `assert` trong ví dụ dùng kiểm tra khi học, không thay thế việc kiểm tra đầu vào của ứng dụng vì Python có thể bỏ assert khi chạy chế độ tối ưu.

## Bài tập có hướng dẫn và bài tự làm
Hướng dẫn: thêm property level trả "beginner" khi points dưới 100 và "active" khi từ 100. Tự làm lớp Temperature với celsius được xác thực là số trong miền vật lý của bài: không nhỏ hơn -273.15. Cung cấp fahrenheit chỉ đọc, công thức celsius * 9 / 5 + 32. Nêu rõ cách xử lý bool và chuỗi để hai người giải có cùng hợp đồng.

Thử ba giá trị ngay quanh ngưỡng điểm 99, 100, 101 và ngưỡng nhiệt độ. Tách các trường hợp lỗi sai kiểu khỏi lỗi vượt miền giá trị trong bảng thử, dù ứng dụng nhỏ có thể thống nhất dùng ValueError cho cả hai.

## Hướng giải và tiêu chí hoàn thành
Getter level chỉ đọc _points, không sửa trạng thái hoặc tự ghi file. Với Temperature, setter kiểm tra kiểu và miền rồi mới gán _celsius; getter fahrenheit tính từ trạng thái đó. Đạt khi 0 Celsius cho 32 Fahrenheit và setter thất bại giữ nhiệt độ cũ. Bài nộp giải thích vì sao `_celsius` vẫn có thể truy cập trong Python và vì sao API chỉ là thỏa thuận sử dụng, không phải hàng rào xác thực người dùng.

## Sai sót thường gặp và cách phát hiện
Đặt self.points = value ngay trong setter points gây gọi đệ quy vô hạn; trường lưu trữ cần một tên khác. Getter tự tăng điểm làm việc đọc nhiều lần cho kết quả không ổn định. Dùng property để tránh viết phương thức bất kể hành vi khiến API khó đoán; hãy ưu tiên tên cho biết tác dụng và chi phí.

## Câu hỏi tự kiểm tra và đáp án
1. _points có bảo vệ dữ liệu khỏi mọi người gọi không? Đáp án: Không; nó là quy ước nội bộ.
2. Vì sao getter không nên tự cộng điểm? Đáp án: Đọc dữ liệu cần hành vi dễ dự đoán, không gây thay đổi ngầm.
3. Setter cần kiểm tra trước hay sau khi gán? Đáp án: Trước khi gán để giữ trạng thái cũ khi dữ liệu sai.

## Đọc thêm từ tài liệu chính thức
- https://docs.python.org/3.12/library/functions.html#property
- https://docs.python.org/3.12/tutorial/classes.html#private-variables

Ghi lại phiên bản Python, lệnh đã chạy, dữ liệu thử và một quyết định thiết kế vào nhật ký học tập. Khi nhờ hỗ trợ, gửi ví dụ nhỏ tái hiện được cùng thông báo lỗi đầy đủ; không gửi dữ liệu cá nhân hoặc đường dẫn chứa thông tin bí mật.
