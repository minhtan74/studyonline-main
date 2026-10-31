## Mục tiêu bài học
- Tách dữ liệu và hành vi từ một tình huống quản lý sách.
- Phân biệt lớp, đối tượng và biến tham chiếu đối tượng.
- Viết một phương thức làm thay đổi trạng thái có thể kiểm tra.

Thời gian dự kiến: 120 phút, gồm đọc và thực hành.

## Mục tiêu và điều kiện học
- Tách dữ liệu và hành vi từ một tình huống quản lý sách.
- Phân biệt lớp, đối tượng và biến tham chiếu đối tượng.
- Viết một phương thức làm thay đổi trạng thái có thể kiểm tra.

Mỗi bài dành khoảng 100–150 phút gồm đọc, chạy mã, sửa ví dụ và tự luyện. Dùng Python 3.12 trở lên trong một thư mục học riêng; các ví dụ chỉ dùng thư viện chuẩn. Tạo file `example.py`, chép nguyên khối mã rồi chạy `python example.py`. Trên Windows có thể dùng `py -3.12 example.py` khi lệnh `python` trỏ tới bản khác. Không ghép các lớp cùng tên của nhiều bài vào một file: mỗi ví dụ là một chương trình độc lập.

## Giải thích và lập luận thiết kế
Một thư viện có nhiều đầu sách, mỗi đầu sách có mã, tên và số bản còn sẵn. Yêu cầu “mượn một bản” chứa cả dữ liệu phải đọc lẫn quy tắc chuyển trạng thái. Nếu chỉ lưu số lượng trong nhiều danh sách rời, lập trình viên dễ cập nhật nhầm vị trí. Ta bắt đầu bằng một lớp Book gom trạng thái một đầu sách với thao tác mượn; không biến mọi danh từ của đề thành một lớp ngay lập tức.

Lớp là mô tả cách tạo và sử dụng một kiểu đối tượng. Gọi Book(...) tạo một thực thể có dữ liệu riêng. Hai sách có thể cùng tên nhưng vẫn là hai thực thể nếu nghiệp vụ gán mã khác. Trong bài này đối tượng có định danh thông qua code; tên hiển thị không đủ làm khóa vì người dùng có thể sửa tên. Chọn định danh là quyết định nghiệp vụ trước khi chọn cú pháp Python.

Khi gọi book.borrow(), Python truyền đối tượng qua tham số đầu tiên của phương thức; tên self là quy ước thông dụng để chỉ thực thể đó. Một phương thức nên diễn tả hành động có nghĩa: borrow rõ hơn change(-1) vì có thể bổ sung kiểm tra hết sách. Trả về số còn lại giúp ví dụ dễ quan sát, nhưng ứng dụng lớn có thể chọn trả kết quả riêng nếu hợp đồng cần thông tin khác.

Biến không chứa một bản sao tự động của toàn bộ đối tượng. Gán alias = book làm hai tên cùng chỉ tới một đối tượng; gọi borrow qua alias sẽ ảnh hưởng book. Đây là điều cần hiểu khi truyền đối tượng qua hàm. Hãy vẽ ô Book và hai mũi tên biến trước khi dùng công cụ sao chép. Đối tượng hỗ trợ tổ chức mã, còn chất lượng thiết kế phụ thuộc ranh giới trách nhiệm và phép kiểm tra cụ thể.

## Ví dụ hoàn chỉnh để chạy
```python
import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

class Book:
    def __init__(self, code, title, available):
        self.code = code
        self.title = title
        self.available = available

    def borrow(self):
        if self.available <= 0:
            raise ValueError("Hết sách")
        self.available -= 1
        return self.available

book = Book("PY01", "Học Python", 2)
other = Book("PY02", "Học Python", 5)
alias = book
assert alias is book and other is not book
assert alias.borrow() == 1
assert book.available == 1 and other.available == 5
print(book.code, book.available, other.available)
```

## Kết quả mong đợi và cách kiểm tra
Chương trình in `PY01 1 5`. Lời gọi qua alias đã thay đổi book nhưng không thay đổi other. Đặt breakpoint tại borrow và xem giá trị self.code để xác định đúng đối tượng đang được xử lý. Nếu nhìn thấy số lượng của cả hai sách giảm, hãy tìm một thuộc tính dùng chung không chủ ý.

Đọc từng dòng thực thi và dự đoán trạng thái trước khi chạy. Sau lần chạy đầu, đổi dữ liệu theo bài tập rồi đối chiếu cả kết quả lẫn trạng thái đối tượng; một dòng in đúng chưa chứng minh các trường hợp lỗi đã đúng. Các lệnh `assert` trong ví dụ dùng kiểm tra khi học, không thay thế việc kiểm tra đầu vào của ứng dụng vì Python có thể bỏ assert khi chạy chế độ tối ưu.

## Bài tập có hướng dẫn và bài tự làm
Hướng dẫn: thêm phương thức return_copy() tăng available một đơn vị; tạo hai sách và chứng minh trả một sách không ảnh hưởng sách còn lại. Sau đó tự viết lớp Counter có name, value, phương thức increment() và reset(). Tạo hai bộ đếm cho số lượt tìm sách và số lượt mượn; gán một bí danh cho bộ đếm tìm kiếm rồi thay đổi qua bí danh.

Nộp sơ đồ nhỏ thể hiện biến và đối tượng, mã chạy được, cùng ba assert cho đối tượng đầu, đối tượng thứ hai và bí danh. Đặt câu hỏi nghiệp vụ cho trường hợp trả nhiều sách hơn số đã mượn; chưa cần tự quyết định quy tắc ngoài đề.

## Hướng giải và tiêu chí hoàn thành
return_copy có thể dùng self.available += 1 trong phạm vi bài này. Counter.increment tăng self.value, còn reset gán self.value = 0. Tiêu chí đạt là bộ đếm độc lập khi tạo hai thực thể, và hai tên alias cùng thấy thay đổi khi chỉ tạo một thực thể. Giải thích được vì sao chỉ thêm từ khóa class mà vẫn dùng một biến toàn cục cho mọi sách không giải quyết vấn đề quản lý trạng thái.

Kết thúc bài, viết một câu mô tả trách nhiệm của Book và một câu mô tả điều Book chưa quản lý, như tài khoản độc giả. Ranh giới này sẽ được điều chỉnh khi học composition thay vì thêm mọi chức năng vào Book.

## Sai sót thường gặp và cách phát hiện
Quên self ở phần khai báo gây sai số lượng đối số khi gọi qua thực thể. Tạo Book mà không gán vào biến rồi tìm lại một đối tượng khác có thể khiến học viên tưởng dữ liệu bị mất. So sánh tên sách để kết luận cùng đối tượng cũng sai: dùng is để minh họa đồng nhất đối tượng, dùng code để so định danh nghiệp vụ theo quy tắc đã nêu.

## Câu hỏi tự kiểm tra và đáp án
1. Lớp Book có phải một quyển sách cụ thể không? Đáp án: Không; book = Book(...) mới tạo thực thể cụ thể.
2. alias = book có tạo sách mới không? Đáp án: Không, hai tên cùng tham chiếu một đối tượng.
3. Vì sao dùng phương thức borrow? Đáp án: Để gom việc chuyển trạng thái và quy tắc mượn tại một nơi rõ nghĩa.

## Đọc thêm từ tài liệu chính thức
- https://docs.python.org/3.12/tutorial/classes.html#class-and-instance-objects

Ghi lại phiên bản Python, lệnh đã chạy, dữ liệu thử và một quyết định thiết kế vào nhật ký học tập. Khi nhờ hỗ trợ, gửi ví dụ nhỏ tái hiện được cùng thông báo lỗi đầy đủ; không gửi dữ liệu cá nhân hoặc đường dẫn chứa thông tin bí mật.
