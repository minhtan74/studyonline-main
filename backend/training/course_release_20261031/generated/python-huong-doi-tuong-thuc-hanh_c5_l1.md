## Mục tiêu bài học
- Diễn đạt các lỗi dự kiến bằng ngoại lệ có ý nghĩa.
- Bắt lỗi ở ranh giới CLI và giữ nguyên bất biến miền.
- Phân biệt thông báo người dùng với lỗi lập trình cần sửa.

Thời gian dự kiến: 120 phút, gồm đọc và thực hành.

## Mục tiêu và điều kiện học
- Diễn đạt các lỗi dự kiến bằng ngoại lệ có ý nghĩa.
- Bắt lỗi ở ranh giới CLI và giữ nguyên bất biến miền.
- Phân biệt thông báo người dùng với lỗi lập trình cần sửa.

Mỗi bài dành khoảng 100–150 phút gồm đọc, chạy mã, sửa ví dụ và tự luyện. Dùng Python 3.12 trở lên trong một thư mục học riêng; các ví dụ chỉ dùng thư viện chuẩn. Tạo file `example.py`, chép nguyên khối mã rồi chạy `python example.py`. Trên Windows có thể dùng `py -3.12 example.py` khi lệnh `python` trỏ tới bản khác. Không ghép các lớp cùng tên của nhiều bài vào một file: mỗi ví dụ là một chương trình độc lập.

## Giải thích và lập luận thiết kế
Người dùng mượn một mã không có trong thư viện là tình huống dự kiến; NameError do viết sai tên biến là lỗi lập trình. Nếu bắt Exception quanh mọi thứ rồi in “không tìm thấy sách”, hai tình huống sẽ bị trộn và lỗi thật khó truy tìm. Ta tạo LibraryError cho các lỗi nghiệp vụ có thể trình bày ngắn ở CLI, với NotFound và NoCopies để phân biệt nguyên nhân khi cần.

Ngoại lệ cho phép một thao tác báo không hoàn tất mà không phải trả nhiều kiểu kết quả mơ hồ như -1, None hoặc chuỗi “error”. Nơi gọi phải biết trường hợp nào có thể thất bại và bắt đúng loại cần xử lý. Không lạm dụng ngoại lệ cho mọi nhánh bình thường: list danh mục rỗng có thể trả danh sách rỗng, còn yêu cầu mượn mã không có phải báo không thực hiện được theo hợp đồng.

Miền nghiệp vụ không đọc input và không tự gọi sys.exit. Nó kiểm tra dữ liệu và ném lỗi. CLI chuyển lỗi dự kiến thành thông báo và mã thoát, nhờ vậy test dịch vụ không phải chạy tiến trình mới. Lỗi không dự kiến nên còn traceback khi phát triển để tìm nguyên nhân. Ghi log trong ứng dụng thật cần cân nhắc dữ liệu nhạy cảm; ví dụ khóa học chỉ dùng mã sách giả và không lưu danh tính người mượn.

Khi bọc một lỗi thấp hơn, dùng raise ... from exc để giữ nguyên chuỗi nguyên nhân. Ví dụ lỗi đọc JSON không hợp lệ có thể được báo là “Tệp thư viện không hợp lệ” nhưng người phát triển vẫn tìm thấy JSONDecodeError phía sau. Kiểm tra lỗi phải đi kèm kiểm tra trạng thái: mượn sách hết không làm available âm; lỗi đọc file không nên dẫn tới ghi đè file lỗi bằng kho rỗng mà không cho người dùng biết.

## Ví dụ hoàn chỉnh để chạy
```python
import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

class LibraryError(Exception):
    pass

class NotFound(LibraryError):
    pass

class NoCopies(LibraryError):
    pass

class Library:
    def __init__(self):
        self._available = {"PY01": 1}

    def borrow(self, code):
        if code not in self._available:
            raise NotFound("Không có mã sách")
        if self._available[code] == 0:
            raise NoCopies("Sách đã được mượn hết")
        self._available[code] -= 1

def borrow_message(library, code):
    try:
        library.borrow(code)
    except LibraryError as exc:
        return f"Không thể mượn: {exc}"
    return "Đã mượn"

lib = Library()
assert borrow_message(lib, "PY01") == "Đã mượn"
assert "mượn hết" in borrow_message(lib, "PY01")
assert "Không có mã" in borrow_message(lib, "NONE")
assert lib._available["PY01"] == 0
print(borrow_message(lib, "NONE"))
```

## Kết quả mong đợi và cách kiểm tra
In `Không thể mượn: Không có mã sách`. Lần mượn thứ hai không làm số lượng âm. borrow_message là một ranh giới trình bày nhỏ để minh họa; lớp Library không tự in hay thoát tiến trình. Khi học viên cố tình viết sai tên biến trong borrow, lỗi đó cần được lộ ra trong môi trường kiểm thử.

Đọc từng dòng thực thi và dự đoán trạng thái trước khi chạy. Sau lần chạy đầu, đổi dữ liệu theo bài tập rồi đối chiếu cả kết quả lẫn trạng thái đối tượng; một dòng in đúng chưa chứng minh các trường hợp lỗi đã đúng. Các lệnh `assert` trong ví dụ dùng kiểm tra khi học, không thay thế việc kiểm tra đầu vào của ứng dụng vì Python có thể bỏ assert khi chạy chế độ tối ưu.

## Bài tập có hướng dẫn và bài tự làm
Hướng dẫn: thêm DuplicateCode(LibraryError) cho thao tác add. Tự làm chức năng reserve của SeatPool với SoldOutError và InvalidAmountError. Viết bảng ba cột: loại lỗi, nơi phát hiện, nơi trình bày. Mỗi nhánh từ chối cần assert trạng thái sau lỗi.

Nâng mức: thử bọc ValueError khi chuyển số lượng chuỗi sang số nguyên bằng một ngoại lệ giao diện, giữ from exc. Chỉ chuyển lỗi ở đúng ranh giới đầu vào; không bắt mọi ValueError phát sinh sâu trong chương trình mà không hiểu nguồn gốc.

## Hướng giải và tiêu chí hoàn thành
DuplicateCode được ném trước khi thêm vào dict. CLI có thể bắt LibraryError để trả mã thoát 2 và một thông báo cụ thể, còn test miền bắt đúng lớp con để phân biệt các quy tắc. Đạt khi chức năng thất bại không thực hiện một phần và lỗi không dự kiến vẫn có thể truy tìm. Một lớp cha ngoại lệ chung có ích để ranh giới bắt nhóm lỗi dự kiến, trong khi các lớp con giúp test và giao diện xử lý từng trường hợp khi cần.

## Sai sót thường gặp và cách phát hiện
except Exception: pass làm người dùng tưởng đã mượn dù thao tác thất bại. Gọi sys.exit trong Book khiến test khó dùng lại và thư viện không thể nhúng vào giao diện khác. Trả về chuỗi lỗi từ phương thức vốn trả số lượng khiến caller dễ tính toán sai; chọn một hợp đồng kết quả rõ và sử dụng thống nhất.

## Câu hỏi tự kiểm tra và đáp án
1. NotFound và NameError có cùng ý nghĩa không? Đáp án: Không; một lỗi nghiệp vụ dự kiến, một lỗi tên trong chương trình.
2. Nơi nào nên chuyển lỗi thành thông báo CLI? Đáp án: Tại ranh giới giao diện.
3. raise NewError(...) from exc giúp gì? Đáp án: Giữ chuỗi nguyên nhân khi bọc lỗi.

## Đọc thêm từ tài liệu chính thức
- https://docs.python.org/3.12/tutorial/errors.html#user-defined-exceptions
- https://docs.python.org/3.12/tutorial/errors.html#exception-chaining

Ghi lại phiên bản Python, lệnh đã chạy, dữ liệu thử và một quyết định thiết kế vào nhật ký học tập. Khi nhờ hỗ trợ, gửi ví dụ nhỏ tái hiện được cùng thông báo lỗi đầy đủ; không gửi dữ liệu cá nhân hoặc đường dẫn chứa thông tin bí mật.
