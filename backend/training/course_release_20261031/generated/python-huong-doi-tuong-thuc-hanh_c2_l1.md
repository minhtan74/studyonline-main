## Mục tiêu bài học
- Dự đoán phạm vi dữ liệu khi tạo nhiều thực thể.
- Loại bỏ lỗi danh sách mutable bị dùng chung ngoài ý muốn.
- Chọn biến lớp cho cấu hình chung phù hợp.

Thời gian dự kiến: 120 phút, gồm đọc và thực hành.

## Mục tiêu và điều kiện học
- Dự đoán phạm vi dữ liệu khi tạo nhiều thực thể.
- Loại bỏ lỗi danh sách mutable bị dùng chung ngoài ý muốn.
- Chọn biến lớp cho cấu hình chung phù hợp.

Mỗi bài dành khoảng 100–150 phút gồm đọc, chạy mã, sửa ví dụ và tự luyện. Dùng Python 3.12 trở lên trong một thư mục học riêng; các ví dụ chỉ dùng thư viện chuẩn. Tạo file `example.py`, chép nguyên khối mã rồi chạy `python example.py`. Trên Windows có thể dùng `py -3.12 example.py` khi lệnh `python` trỏ tới bản khác. Không ghép các lớp cùng tên của nhiều bài vào một file: mỗi ví dụ là một chương trình độc lập.

## Giải thích và lập luận thiết kế
Một lớp ReadingList quản lý danh sách sách muốn đọc cho từng học viên. Nếu khai báo items = [] ngay trong thân lớp và chỉ gọi self.items.append, mọi thực thể có thể truy cập cùng danh sách đó qua lớp. Lỗi thường bị bỏ sót khi chỉ kiểm tra một học viên. Dữ liệu riêng như items phải được tạo trong __init__ để mỗi thực thể nhận một danh sách mới.

Thuộc tính lớp thích hợp cho một giá trị cấu hình hoặc tên loại chung được chủ ý chia sẻ, ví dụ category = "reading-list". Thao tác đọc qua thực thể tìm thuộc tính của nó rồi mới tìm trên lớp theo cơ chế tra cứu thuộc tính. Gán list_a.category = "private" tạo hoặc thay thuộc tính trên list_a, không tự sửa giá trị của ReadingList.category và các thực thể còn lại.

Phân biệt gán và thay đổi đối tượng mutable là chìa khóa. self.items = [] gán một danh sách mới cho thực thể. self.items.append(...) sửa danh sách đang được tham chiếu. Nếu danh sách đó nằm trên lớp hoặc được truyền dùng chung từ ngoài, nhiều đối tượng sẽ quan sát thay đổi. Hỏi “ai sở hữu đối tượng mutable này?” hữu ích hơn ghi nhớ rằng mọi biến trong class đều riêng hay đều chung.

Một quy tắc nhỏ giúp code dễ kiểm tra: dữ liệu mô tả một thực thể được khởi tạo trên self; dữ liệu chung phải được ghi rõ mục đích và hạn chế thay đổi tùy tiện. Khi nhận một list từ ngoài, quyết định có giữ tham chiếu hay sao chép nông. list(values) tách danh sách ngoài nhưng các phần tử bên trong vẫn có thể chung. Bài sau sẽ dùng composition để định nghĩa rõ quan hệ giữa các đối tượng thay vì dựa vào vô tình chia sẻ dữ liệu.

## Ví dụ hoàn chỉnh để chạy
```python
import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

class ReadingList:
    category = "reading-list"

    def __init__(self, owner, items=None):
        self.owner = owner
        self.items = list(items) if items is not None else []

    def add(self, title):
        self.items.append(title)

original = ["Python"]
lan = ReadingList("Lan", original)
minh = ReadingList("Minh")
lan.add("OOP")
assert original == ["Python"]
assert minh.items == []
assert lan.items == ["Python", "OOP"]
lan.category = "personal"
assert minh.category == ReadingList.category == "reading-list"
print(lan.owner, len(lan.items), len(minh.items))
```

## Kết quả mong đợi và cách kiểm tra
In `Lan 2 0`. original chỉ có Python, chứng minh constructor đã tách danh sách bên ngoài ở mức nông. Gán category cho lan không làm minh đổi loại. Dùng thêm assert lan.items is not minh.items để xác nhận hai danh sách có định danh khác nhau.

Đọc từng dòng thực thi và dự đoán trạng thái trước khi chạy. Sau lần chạy đầu, đổi dữ liệu theo bài tập rồi đối chiếu cả kết quả lẫn trạng thái đối tượng; một dòng in đúng chưa chứng minh các trường hợp lỗi đã đúng. Các lệnh `assert` trong ví dụ dùng kiểm tra khi học, không thay thế việc kiểm tra đầu vào của ứng dụng vì Python có thể bỏ assert khi chạy chế độ tối ưu.

## Bài tập có hướng dẫn và bài tự làm
Hướng dẫn: tạo phiên bản sai có items = [] trong lớp, khởi tạo hai người rồi thêm sách qua người thứ nhất. Ghi kết quả thực tế khác mong đợi trước khi sửa. Không dùng phiên bản sai trong sản phẩm học viên khác. Tự làm lớp ShoppingCart với items riêng và currency chung; thêm hàng ở hai giỏ và kiểm tra độc lập.

Thử thêm một danh sách lồng nhau vào constructor rồi sửa phần tử bên trong. Viết nhận xét về giới hạn sao chép nông; chỉ dùng dữ liệu đơn giản trong API giỏ hàng nếu chưa thiết kế quyền sở hữu đối tượng lồng nhau.

## Hướng giải và tiêu chí hoàn thành
Giỏ hàng đạt khi mỗi lần tạo đều có danh sách riêng, không dùng đối số mặc định items=[] và không sửa danh sách đầu vào sau khi đã lựa chọn sao chép. Bài nộp phải có ít nhất hai thực thể; kiểm tra một giỏ duy nhất không tái hiện được lỗi dùng chung. Với dữ liệu lồng nhau, bản sao nông vẫn tham chiếu phần tử con; ghi rõ đây là hành vi theo hợp đồng hoặc thay cấu trúc đầu vào để tránh nhầm lẫn.

## Sai sót thường gặp và cách phát hiện
Đổi items ở một chỗ nhưng vẫn để lịch sử mutable trong biến lớp chỉ chuyển lỗi sang trường khác. Dùng copy.deepcopy cho mọi thứ có thể sao chép cả dữ liệu không nên nhân bản; hãy hiểu cấu trúc trước. Khi debug, in id của danh sách cần kiểm tra cùng dữ liệu, không suy luận từ việc hai danh sách tình cờ có cùng nội dung.

## Câu hỏi tự kiểm tra và đáp án
1. Danh sách items riêng nên tạo ở đâu? Đáp án: Trong __init__ cho từng thực thể.
2. list(values) có sao chép sâu phần tử lồng nhau không? Đáp án: Không, đây là bản sao nông.
3. Gán lan.category có luôn đổi ReadingList.category không? Đáp án: Không; phép gán đó tạo hoặc thay thuộc tính của lan.

## Đọc thêm từ tài liệu chính thức
- https://docs.python.org/3.12/tutorial/classes.html#class-and-instance-variables
- https://docs.python.org/3.12/library/copy.html

Ghi lại phiên bản Python, lệnh đã chạy, dữ liệu thử và một quyết định thiết kế vào nhật ký học tập. Khi nhờ hỗ trợ, gửi ví dụ nhỏ tái hiện được cùng thông báo lỗi đầy đủ; không gửi dữ liệu cá nhân hoặc đường dẫn chứa thông tin bí mật.
