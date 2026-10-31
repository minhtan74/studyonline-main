## Mục tiêu bài học
- Dùng dataclass để diễn tả bản ghi nhỏ có hợp đồng rõ.
- Phân biệt bằng nhau theo giá trị với đồng nhất đối tượng.
- Sử dụng frozen và default_factory đúng phạm vi.

Thời gian dự kiến: 120 phút, gồm đọc và thực hành.

## Mục tiêu và điều kiện học
- Dùng dataclass để diễn tả bản ghi nhỏ có hợp đồng rõ.
- Phân biệt bằng nhau theo giá trị với đồng nhất đối tượng.
- Sử dụng frozen và default_factory đúng phạm vi.

Mỗi bài dành khoảng 100–150 phút gồm đọc, chạy mã, sửa ví dụ và tự luyện. Dùng Python 3.12 trở lên trong một thư mục học riêng; các ví dụ chỉ dùng thư viện chuẩn. Tạo file `example.py`, chép nguyên khối mã rồi chạy `python example.py`. Trên Windows có thể dùng `py -3.12 example.py` khi lệnh `python` trỏ tới bản khác. Không ghép các lớp cùng tên của nhiều bài vào một file: mỗi ví dụ là một chương trình độc lập.

## Giải thích và lập luận thiết kế
Khi mô tả một mã sách hoặc kết quả mượn, ta thường cần khởi tạo, biểu diễn để debug và so sánh giá trị. dataclass giúp sinh một số phương thức lặp lại từ các trường đã khai báo. Nó không quyết định mô hình thay người thiết kế và không tự kiểm tra kiểu chỉ vì trường có type hint. Ta vẫn phải viết __post_init__ cho các điều kiện dữ liệu cần bảo vệ.

Một đối tượng giá trị được nhận biết qua nội dung thay vì danh tính riêng. Hai LoanReceipt có cùng code và borrower có thể so sánh bằng nhau dù là hai thực thể khác nhau. Ngược lại, Book trong danh mục thường có định danh code và trạng thái thay đổi; không nên tùy tiện dùng mọi trường mutable làm khóa dict. Chọn semantics trước khi dựa vào phương thức __eq__ được sinh tự động.

frozen=True chặn phép gán trường thông thường, phù hợp biên nhận chỉ đọc sau tạo. Tính bất biến này không tự đóng băng sâu một list nằm trong trường. Muốn biên nhận có danh sách ổn định, có thể chọn tuple các giá trị bất biến. Với dữ liệu mutable riêng cho mỗi bản ghi, dùng field(default_factory=list) để tạo list mới, không dùng một list chia sẻ làm mặc định.

asdict có thể tạo cấu trúc dữ liệu thuận tiện nhưng không nên mặc định đó là định dạng lưu trữ vĩnh viễn. Đổi tên trường lớp có thể vô tình đổi hợp đồng file. Trong bài lưu JSON, ta viết mapping rõ và thêm schema_version. Ở đây mục tiêu là một biên nhận nhỏ, in ra dễ hiểu, so sánh được và được kiểm tra hợp lệ, từ đó thấy dataclass giảm công việc cơ học chứ không thay trách nhiệm nghiệp vụ.

## Ví dụ hoàn chỉnh để chạy
```python
import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from dataclasses import dataclass, field, FrozenInstanceError

@dataclass(frozen=True)
class LoanReceipt:
    code: str
    borrower: str

    def __post_init__(self):
        if not self.code.strip() or not self.borrower.strip():
            raise ValueError("Mã và độc giả không được rỗng")

@dataclass
class ReadingLog:
    entries: list[str] = field(default_factory=list)

a = LoanReceipt("PY01", "Lan")
b = LoanReceipt("PY01", "Lan")
assert a == b and a is not b
first, second = ReadingLog(), ReadingLog()
first.entries.append("Đọc chương 1")
assert second.entries == []
try:
    a.code = "NEW"
except FrozenInstanceError:
    pass
else:
    raise AssertionError("Biên nhận phải chặn phép gán")
print(a.code, a.borrower, len(first.entries))
```

## Kết quả mong đợi và cách kiểm tra
In `PY01 Lan 1`. a == b đúng theo các trường nhưng a is b sai vì tạo hai đối tượng. first và second có list riêng. FrozenInstanceError khi gán code chứng minh API thông thường chặn thay đổi trường; bài không tuyên bố đối tượng đã được bảo mật trước mã có chủ ý can thiệp.

Đọc từng dòng thực thi và dự đoán trạng thái trước khi chạy. Sau lần chạy đầu, đổi dữ liệu theo bài tập rồi đối chiếu cả kết quả lẫn trạng thái đối tượng; một dòng in đúng chưa chứng minh các trường hợp lỗi đã đúng. Các lệnh `assert` trong ví dụ dùng kiểm tra khi học, không thay thế việc kiểm tra đầu vào của ứng dụng vì Python có thể bỏ assert khi chạy chế độ tối ưu.

## Bài tập có hướng dẫn và bài tự làm
Hướng dẫn: thêm trường days cho LoanReceipt, yêu cầu số nguyên dương và test 0 bị từ chối. Tự làm dataclass frozen BookCode có value được kiểm tra không rỗng. Viết ví dụ hai BookCode cùng giá trị so sánh bằng nhau, sau đó dùng chúng làm khóa dict để giải thích yêu cầu trường hashable.

Nâng mức: tạo dataclass Report với tags là tuple[str, ...] và nhận xét vì sao tuple chứa list vẫn không phải cấu trúc bất biến sâu. Bài nộp cần hai test liên quan đến giá trị và hai test liên quan đến dữ liệu không hợp lệ.

## Hướng giải và tiêu chí hoàn thành
__post_init__ kiểm tra days trước khi người gọi sử dụng biên nhận. BookCode(value) có thể lưu chuỗi đã chuẩn hóa ngay từ bước nhập hoặc từ chối chuỗi có khoảng trắng ngoài; phải ghi rõ lựa chọn. Khi dùng frozen, đừng cố gán trường trực tiếp trong __post_init__ rồi bỏ lỗi; nếu cần chuẩn hóa, hiểu rõ cơ chế object.__setattr__ hoặc đơn giản nhận dữ liệu đã chuẩn hóa và kiểm tra chặt. Đạt khi giải thích được cả lợi ích lẫn giới hạn của mã được sinh tự động.

## Sai sót thường gặp và cách phát hiện
Cho rằng type hint tự từ chối số nguyên thay cho code sẽ gây lỗi .strip ở nơi khó hiểu; kiểm tra kiểu nếu dữ liệu ngoài có thể sai. Dùng unsafe_hash chỉ để hết lỗi không làm cấu trúc mutable trở nên an toàn làm khóa. Lạm dụng asdict cho mọi file lâu dài làm thay lớp phá tương thích dữ liệu mà không có migration.

## Câu hỏi tự kiểm tra và đáp án
1. dataclass tự kiểm tra mọi giá trị theo type hint không? Đáp án: Không; cần xác thực dữ liệu khi có yêu cầu.
2. frozen có đóng băng sâu một list con không? Đáp án: Không.
3. default_factory=list phục vụ điều gì? Đáp án: Tạo list mặc định riêng cho từng thực thể.

## Đọc thêm từ tài liệu chính thức
- https://docs.python.org/3.12/library/dataclasses.html
- https://docs.python.org/3.12/reference/datamodel.html#object.__eq__

Ghi lại phiên bản Python, lệnh đã chạy, dữ liệu thử và một quyết định thiết kế vào nhật ký học tập. Khi nhờ hỗ trợ, gửi ví dụ nhỏ tái hiện được cùng thông báo lỗi đầy đủ; không gửi dữ liệu cá nhân hoặc đường dẫn chứa thông tin bí mật.
