## Mục tiêu bài học
- Mô hình hóa Library chứa nhiều Book bằng composition.
- Phân biệt quản lý tập hợp với hành vi của từng phần tử.
- Thiết kế thao tác tra cứu mã và từ chối mã trùng.

Thời gian dự kiến: 120 phút, gồm đọc và thực hành.

## Mục tiêu và điều kiện học
- Mô hình hóa Library chứa nhiều Book bằng composition.
- Phân biệt quản lý tập hợp với hành vi của từng phần tử.
- Thiết kế thao tác tra cứu mã và từ chối mã trùng.

Mỗi bài dành khoảng 100–150 phút gồm đọc, chạy mã, sửa ví dụ và tự luyện. Dùng Python 3.12 trở lên trong một thư mục học riêng; các ví dụ chỉ dùng thư viện chuẩn. Tạo file `example.py`, chép nguyên khối mã rồi chạy `python example.py`. Trên Windows có thể dùng `py -3.12 example.py` khi lệnh `python` trỏ tới bản khác. Không ghép các lớp cùng tên của nhiều bài vào một file: mỗi ví dụ là một chương trình độc lập.

## Giải thích và lập luận thiết kế
Library không phải một loại Book: nó chứa các Book. Quan hệ chứa này gọi là composition trong phạm vi mô hình bài học. Book bảo vệ số bản của một đầu sách, Library quản lý danh mục và chọn đúng Book theo mã. Nếu Library kế thừa Book chỉ để dùng lại vài thuộc tính, tên và hành vi sẽ trở nên khó hiểu: thư viện có tự được mượn như một quyển sách hay không?

Tách trách nhiệm có ích khi ta mô tả được câu hỏi mà mỗi đối tượng trả lời. Book biết còn bản để mượn không. Library biết mã nào đã có và trả một sách theo mã. CLI biết cách đọc đối số, hiển thị thông báo. Một lớp không cần có nhiều phương thức mới hữu ích; nó cần một vai trò có ranh giới. Tách riêng lớp cho mỗi dòng dữ liệu cũng có thể gây phức tạp thừa nếu không có hành vi hoặc bất biến cần bảo vệ.

Danh mục dùng dict vì thao tác chính là tra theo mã duy nhất. Khi add, kiểm tra code đã tồn tại rồi mới thêm. Ghi đè âm thầm sẽ làm biến mất dữ liệu đầu sách cũ. Trong bài này Library giữ tham chiếu Book được truyền vào; quyết định đó được ghi rõ, nên người tạo Book vẫn có thể quan sát cùng trạng thái. Nếu ứng dụng đòi cô lập mạnh hơn, cần một API hoặc kiểu bản sao phù hợp.

Phương thức borrow(code) làm cầu nối tra cứu và hành động. Nó không giảm trực tiếp mọi trường dữ liệu mà gọi book.borrow(), giữ quy tắc số lượng ở một chỗ. Khi lỗi không tìm thấy mã, ngoại lệ KeyError của dict có thể được chuyển thành ValueError hoặc ngoại lệ nghiệp vụ ở bài sau. Điều cần tránh là bắt lỗi rồi tự tạo đầu sách rỗng vì người dùng sẽ nhận thông báo thành công trên dữ liệu sai.

## Ví dụ hoàn chỉnh để chạy
```python
import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

class Book:
    def __init__(self, code, available):
        self.code = code
        self.available = available

    def borrow(self):
        if self.available <= 0:
            raise ValueError("Hết sách")
        self.available -= 1

class Library:
    def __init__(self):
        self._books = {}

    def add(self, book):
        if book.code in self._books:
            raise ValueError("Mã đã tồn tại")
        self._books[book.code] = book

    def borrow(self, code):
        self._books[code].borrow()

    def codes(self):
        return tuple(sorted(self._books))

library = Library()
book = Book("PY01", 2)
library.add(book)
library.borrow("PY01")
assert book.available == 1
assert library.codes() == ("PY01",)
try:
    library.add(Book("PY01", 9))
except ValueError:
    pass
assert book.available == 1
print(library.codes(), book.available)
```

## Kết quả mong đợi và cách kiểm tra
In `('PY01',) 1`. Library giữ cùng đối tượng Book nên tham chiếu book thấy số lượng mới. codes trả tuple đã sắp xếp, giúp kết quả lặp lại được và không cho người dùng sửa trực tiếp dict nội bộ. Ví dụ rút gọn tập trung composition; khi đưa vào dự án phải tái sử dụng kiểm tra hợp lệ ở bài khởi tạo.

Đọc từng dòng thực thi và dự đoán trạng thái trước khi chạy. Sau lần chạy đầu, đổi dữ liệu theo bài tập rồi đối chiếu cả kết quả lẫn trạng thái đối tượng; một dòng in đúng chưa chứng minh các trường hợp lỗi đã đúng. Các lệnh `assert` trong ví dụ dùng kiểm tra khi học, không thay thế việc kiểm tra đầu vào của ứng dụng vì Python có thể bỏ assert khi chạy chế độ tối ưu.

## Bài tập có hướng dẫn và bài tự làm
Hướng dẫn: thêm return_book(code), dùng phương thức trả sách của Book thay vì thay đổi trực tiếp. Tự làm Order chứa các OrderLine. OrderLine biết subtotal bằng unit_price * quantity; Order biết tổng của các dòng. Dùng số nguyên đồng hoặc một quy ước Decimal rõ ràng; không dùng float rồi khẳng định chính xác tuyệt đối về tiền.

Nộp sơ đồ ba lớp Book, Library, CLI và viết bên cạnh nơi xử lý từng tình huống: mã trùng, hết sách, đối số lệnh thiếu. Thử hai mã có cùng tên để xác nhận hệ thống dựa trên mã, không vô tình dựa trên tên.

## Hướng giải và tiêu chí hoàn thành
Library.return_book chọn sách theo code và gọi return_copy. Order.total có thể cộng subtotal của từng dòng và nên có test đơn rỗng, một dòng, nhiều dòng. Đạt khi quy tắc số lượng ở một chỗ và thao tác danh mục không phá dữ liệu đã có nếu add thất bại. Giải thích vì sao không truyền toàn bộ đối số CLI vào constructor Book: xử lý giao diện và bảo vệ miền nghiệp vụ phục vụ hai mục đích khác nhau.

## Sai sót thường gặp và cách phát hiện
Kế thừa Book cho Library chỉ để có code là dấu hiệu quan hệ sai. Trả trực tiếp self._books cho phép người gọi xóa hoặc ghi đè bỏ qua add. Dùng một danh sách toàn cục trong mọi Library làm hai kho bị lẫn dữ liệu. Test hai thư viện độc lập trước khi mở rộng lưu file.

## Câu hỏi tự kiểm tra và đáp án
1. Library có phải một loại Book không? Đáp án: Không, Library chứa và quản lý Book.
2. Quy tắc hết sách nên ở đâu? Đáp án: Trong hành vi mượn của Book hoặc miền nghiệp vụ tương ứng, dùng thống nhất.
3. Vì sao từ chối mã trùng? Đáp án: Để không ghi đè mất đầu sách hiện có một cách âm thầm.

## Đọc thêm từ tài liệu chính thức
- https://docs.python.org/3.12/tutorial/classes.html
- https://docs.python.org/3.12/tutorial/datastructures.html#dictionaries

Ghi lại phiên bản Python, lệnh đã chạy, dữ liệu thử và một quyết định thiết kế vào nhật ký học tập. Khi nhờ hỗ trợ, gửi ví dụ nhỏ tái hiện được cùng thông báo lỗi đầy đủ; không gửi dữ liệu cá nhân hoặc đường dẫn chứa thông tin bí mật.
