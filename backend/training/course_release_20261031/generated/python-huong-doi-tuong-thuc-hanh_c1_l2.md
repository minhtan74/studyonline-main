## Mục tiêu bài học
- Mô tả bất biến số lượng sách bằng điều kiện rõ ràng.
- Kiểm tra đầu vào trước khi gán trạng thái trong __init__.
- Phân biệt kiểm tra hợp lệ với ép kiểu tùy tiện.

Thời gian dự kiến: 120 phút, gồm đọc và thực hành.

## Mục tiêu và điều kiện học
- Mô tả bất biến số lượng sách bằng điều kiện rõ ràng.
- Kiểm tra đầu vào trước khi gán trạng thái trong __init__.
- Phân biệt kiểm tra hợp lệ với ép kiểu tùy tiện.

Mỗi bài dành khoảng 100–150 phút gồm đọc, chạy mã, sửa ví dụ và tự luyện. Dùng Python 3.12 trở lên trong một thư mục học riêng; các ví dụ chỉ dùng thư viện chuẩn. Tạo file `example.py`, chép nguyên khối mã rồi chạy `python example.py`. Trên Windows có thể dùng `py -3.12 example.py` khi lệnh `python` trỏ tới bản khác. Không ghép các lớp cùng tên của nhiều bài vào một file: mỗi ví dụ là một chương trình độc lập.

## Giải thích và lập luận thiết kế
Ở bài trước ta có thể tạo Book với available = -3. Đối tượng đã tồn tại nhưng mang trạng thái không có ý nghĩa trong mô hình. Bất biến là điều kiện mà các thao tác công khai phải duy trì: mã không rỗng, tổng số bản là số nguyên không âm, số có sẵn nằm từ 0 đến tổng. Viết các điều kiện này trước khi viết constructor giúp nhận ra lỗi thiết kế và thống nhất kết quả mong đợi.

__init__ thực hiện khởi tạo sau khi thực thể đã được tạo. Trong khóa này constructor hợp lệ sẽ đưa thực thể vào trạng thái sử dụng được, hoặc ném một ngoại lệ có ý nghĩa. Ta kiểm tra tất cả dữ liệu trước các phép gán quan trọng. Một hàm chuyển dữ liệu chuỗi đầu vào CLI thành số là bước khác; tự int("2.9") hoặc ép int(True) có thể làm ứng dụng nhận dữ liệu ngoài ý định.

Python xem bool là một kiểu con của int. Vì nghiệp vụ đếm bản sách không nhận True/False, ví dụ dùng type(total) is int. Đây là lựa chọn có chủ ý cho bài toán nhỏ; một thư viện số học tổng quát có thể cho phép các kiểu nguyên khác. Type hint chỉ giúp người đọc và công cụ kiểm tra, không tự xác thực giá trị khi chương trình chạy.

Ta còn phải giữ bất biến sau khởi tạo. borrow giảm available chỉ khi còn sách; return_copy chỉ tăng khi available nhỏ hơn total. Kiểm tra lỗi phải xảy ra trước thay đổi trạng thái. Ví dụ lỗi trả dư phải giữ nguyên số lượng ban đầu, chứ không tăng rồi mới phát hiện vượt giới hạn. Đây là cách suy nghĩ “trước điều kiện, sau điều kiện” mà các bài kiểm thử sau sẽ diễn đạt thành bằng chứng.

## Ví dụ hoàn chỉnh để chạy
```python
import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

class Book:
    def __init__(self, code, total):
        if not isinstance(code, str) or not code.strip():
            raise ValueError("Mã sách không được rỗng")
        if type(total) is not int or total < 0:
            raise ValueError("Tổng số bản phải là số nguyên không âm")
        self.code = code.strip()
        self.total = total
        self.available = total

    def borrow(self):
        if self.available == 0:
            raise ValueError("Hết sách")
        self.available -= 1

    def return_copy(self):
        if self.available == self.total:
            raise ValueError("Không có bản đang được mượn")
        self.available += 1

book = Book(" PY01 ", 1)
book.borrow()
assert book.available == 0
book.return_copy()
assert book.available == book.total == 1
for bad in (-1, True, "2"):
    try:
        Book("X", bad)
    except ValueError:
        pass
    else:
        raise AssertionError("Đã nhận dữ liệu không hợp lệ")
print(book.code, book.available)
```

## Kết quả mong đợi và cách kiểm tra
In `PY01 1`; ba dữ liệu sai đều bị từ chối. Thêm một lần return_copy nữa phải nhận ValueError và available vẫn là 1. Không đánh dấu bài hoàn tất chỉ vì dữ liệu 1 chạy được: giá trị 0 và dữ liệu sai là phần bắt buộc của hợp đồng.

Đọc từng dòng thực thi và dự đoán trạng thái trước khi chạy. Sau lần chạy đầu, đổi dữ liệu theo bài tập rồi đối chiếu cả kết quả lẫn trạng thái đối tượng; một dòng in đúng chưa chứng minh các trường hợp lỗi đã đúng. Các lệnh `assert` trong ví dụ dùng kiểm tra khi học, không thay thế việc kiểm tra đầu vào của ứng dụng vì Python có thể bỏ assert khi chạy chế độ tối ưu.

## Bài tập có hướng dẫn và bài tự làm
Hướng dẫn: viết hàm validate_count(value) trả lại value khi hợp lệ và ném ValueError khi sai; dùng cho constructor của một lớp Shelf. Tự làm lớp SeatPool(total) với reserve và release, áp dụng cùng bất biến 0 <= available <= total. Chuẩn bị bảng đầu vào gồm -1, 0, 1, True, 1.5 và "1"; ghi rõ kết quả mong đợi trước khi chạy.

Nâng mức: thêm amount cho reserve. Mỗi lời gọi phải hoặc thực hiện toàn bộ số lượng yêu cầu hoặc giữ nguyên trạng thái nếu không đủ; không cho phép thực hiện một phần âm thầm. Giới hạn amount là số nguyên dương.

## Hướng giải và tiêu chí hoàn thành
Kiểm tra type, miền giá trị và nguồn dữ liệu là ba câu hỏi khác nhau. Trong SeatPool, reserve(amount) kiểm tra amount rồi so với available, chỉ sau đó mới trừ. Đạt yêu cầu khi reserve(2) trên pool còn 1 bị từ chối và available vẫn bằng 1. release(amount) cũng so với số đã giữ chỗ. Lời giải cần chỉ ra các phép kiểm tra bảo vệ bất biến chứ không chỉ sao chép mã Book đổi tên.

## Sai sót thường gặp và cách phát hiện
Dùng assert cho dữ liệu người dùng khiến điều kiện có thể biến mất ở chế độ tối ưu. Bắt mọi ngoại lệ rồi đặt số lượng về 0 che giấu lỗi đầu vào. Gán self.available trước khi xác nhận total làm khó suy luận trạng thái. Chưa cần thêm destructor để “hủy đối tượng lỗi”; hãy để ngoại lệ constructor thông báo việc tạo đối tượng không thành công.

## Câu hỏi tự kiểm tra và đáp án
1. Bất biến của available là gì? Đáp án: Luôn nằm từ 0 đến total trong mô hình này.
2. True có được coi là số bản hợp lệ trong bài không? Đáp án: Không; bài loại bool dù bool là kiểu con của int.
3. Thao tác thất bại có được để trạng thái thay đổi một nửa không? Đáp án: Không; kiểm tra trước rồi mới cập nhật.

## Đọc thêm từ tài liệu chính thức
- https://docs.python.org/3.12/reference/datamodel.html#object.__init__
- https://docs.python.org/3.12/library/functions.html#isinstance

Ghi lại phiên bản Python, lệnh đã chạy, dữ liệu thử và một quyết định thiết kế vào nhật ký học tập. Khi nhờ hỗ trợ, gửi ví dụ nhỏ tái hiện được cùng thông báo lỗi đầy đủ; không gửi dữ liệu cá nhân hoặc đường dẫn chứa thông tin bí mật.
