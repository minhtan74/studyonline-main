## Mục tiêu bài học
- Dùng một giao diện hành vi với các triển khai khác nhau.
- Phân biệt duck typing với kế thừa bắt buộc.
- Khai báo hợp đồng repository bằng ABC và abstractmethod.

Thời gian dự kiến: 120 phút, gồm đọc và thực hành.

## Mục tiêu và điều kiện học
- Dùng một giao diện hành vi với các triển khai khác nhau.
- Phân biệt duck typing với kế thừa bắt buộc.
- Khai báo hợp đồng repository bằng ABC và abstractmethod.

Mỗi bài dành khoảng 100–150 phút gồm đọc, chạy mã, sửa ví dụ và tự luyện. Dùng Python 3.12 trở lên trong một thư mục học riêng; các ví dụ chỉ dùng thư viện chuẩn. Tạo file `example.py`, chép nguyên khối mã rồi chạy `python example.py`. Trên Windows có thể dùng `py -3.12 example.py` khi lệnh `python` trỏ tới bản khác. Không ghép các lớp cùng tên của nhiều bài vào một file: mỗi ví dụ là một chương trình độc lập.

## Giải thích và lập luận thiết kế
Một dịch vụ danh mục cần lưu và tải Book, nhưng không nên biết đang dùng bộ nhớ hay file JSON. Ta mô tả hành vi cần có bằng load và save. Đa hình giúp cùng một đoạn mã gọi những hành vi đó trên các triển khai khác nhau. Thiết kế kiểm thử cũng dễ hơn: test dùng bản lưu trong bộ nhớ để tránh file, ứng dụng CLI dùng kho JSON khi cần giữ dữ liệu giữa các lần chạy.

Duck typing chú trọng đối tượng có hành vi phù hợp, không nhất thiết kế thừa một lớp cụ thể. Một hàm nhận object có save(payload) có thể dùng được mà không kiểm tra isinstance. Cách này gọn và linh hoạt, nhưng lỗi thiếu phương thức có thể chỉ xuất hiện khi gọi. Tài liệu hợp đồng, type hints hoặc Protocol trong chương trình lớn có thể bổ sung kiểm tra; bài này dùng ABC để thấy một cách công khai hợp đồng ở runtime.

Kế thừa ABC và đánh dấu abstractmethod làm lớp chưa cài đầy đủ các phương thức trừu tượng không được khởi tạo thông thường. ABC không tự chứng minh phương thức thực hiện đúng nghiệp vụ: save mà bỏ dữ liệu vẫn có thể thỏa yêu cầu tên phương thức. Vì vậy ta cần bộ kiểm tra hợp đồng: sau save của dữ liệu hợp lệ, load phải trả biểu diễn tương đương theo quy tắc đã nêu.

Quyền sở hữu dữ liệu vẫn quan trọng. MemoryRepository trong bài sao chép các dict một mức vì cấu trúc payload đã giới hạn thành danh sách dict chứa giá trị nguyên, chuỗi. Nếu sau này đưa list lồng nhau vào, hợp đồng phải thay đổi hoặc dùng cơ chế sao chép phù hợp. Không dùng một bản repository test quá đơn giản để kết luận file JSON hay cơ sở dữ liệu thật chắc chắn đúng; từng triển khai còn cần kiểm tra riêng.

## Ví dụ hoàn chỉnh để chạy
```python
import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from abc import ABC, abstractmethod

class Repository(ABC):
    @abstractmethod
    def load(self):
        raise NotImplementedError

    @abstractmethod
    def save(self, rows):
        raise NotImplementedError

class MemoryRepository(Repository):
    def __init__(self):
        self._rows = []

    def load(self):
        return [dict(row) for row in self._rows]

    def save(self, rows):
        self._rows = [dict(row) for row in rows]

def round_trip(repository):
    payload = [{"code": "PY01", "total": 2}]
    repository.save(payload)
    payload[0]["total"] = 999
    result = repository.load()
    assert result == [{"code": "PY01", "total": 2}]
    result[0]["total"] = 7
    assert repository.load()[0]["total"] == 2

round_trip(MemoryRepository())
try:
    Repository()
except TypeError:
    pass
else:
    raise AssertionError("Không được tạo repository trừu tượng")
print("repository contract: OK")
```

## Kết quả mong đợi và cách kiểm tra
In `repository contract: OK`. Sửa payload hoặc kết quả load không đổi dữ liệu đã lưu trong miền dữ liệu phẳng đã chọn. Repository() bị chặn vì thiếu triển khai. Tạo một lớp có đủ tên phương thức nhưng load luôn trả [] sẽ qua kiểm tra trừu tượng mà không qua round_trip; đây là hai mức kiểm tra khác nhau.

Đọc từng dòng thực thi và dự đoán trạng thái trước khi chạy. Sau lần chạy đầu, đổi dữ liệu theo bài tập rồi đối chiếu cả kết quả lẫn trạng thái đối tượng; một dòng in đúng chưa chứng minh các trường hợp lỗi đã đúng. Các lệnh `assert` trong ví dụ dùng kiểm tra khi học, không thay thế việc kiểm tra đầu vào của ứng dụng vì Python có thể bỏ assert khi chạy chế độ tối ưu.

## Bài tập có hướng dẫn và bài tự làm
Hướng dẫn: viết BrokenRepository hoàn thành hai phương thức nhưng không giữ dữ liệu, chạy round_trip và ghi assert thất bại nào. Tự làm Exporter có export(rows) trả chuỗi; hai triển khai JSON và CSV đều phải giữ tên trường theo hợp đồng. So sánh cách dùng lớp kế thừa ABC với một đối tượng duck typing cung cấp đủ phương thức mà không kế thừa.

Nâng mức: ghi bảng tiêu chí load/save gồm tình huống chưa có dữ liệu, lưu rỗng, lưu một bản ghi và người gọi sửa kết quả load. Không tự thêm yêu cầu lưu an toàn khi nhiều tiến trình nếu triển khai chưa có khóa hoặc giao dịch.

## Hướng giải và tiêu chí hoàn thành
Bộ test hành vi sẽ thất bại trên BrokenRepository ở phép so sánh payload sau save. JSON exporter dùng json.dumps, CSV exporter dùng csv.DictWriter; đừng tự nối chuỗi rồi bỏ qua ký tự escape. Đạt khi hàm sử dụng chỉ phụ thuộc các phương thức đã thỏa thuận và mỗi triển khai có kiểm tra round-trip riêng. Bài nộp cần giải thích ABC giúp gì và còn thiếu gì, tránh khẳng định kế thừa ABC đã bảo đảm dữ liệu an toàn.

## Sai sót thường gặp và cách phát hiện
Kiểm tra tên phương thức tồn tại không bảo đảm ý nghĩa phương thức đúng. Trả list _rows trực tiếp làm caller sửa repository ngoài save. Bắt TypeError của việc gọi sai API rồi coi là “không có dữ liệu” che giấu lỗi lập trình; lỗi hợp đồng nên được phát hiện khi kiểm thử, không chuyển thành thành công giả.

## Câu hỏi tự kiểm tra và đáp án
1. Duck typing có bắt buộc cùng lớp cha không? Đáp án: Không, cần hành vi phù hợp với nơi gọi.
2. ABC kiểm tra chính xác dữ liệu save chưa? Đáp án: Không, vẫn cần kiểm thử hành vi.
3. Vì sao test sửa kết quả load? Đáp án: Để kiểm tra caller không vô tình sửa trạng thái lưu qua tham chiếu bị lộ.

## Đọc thêm từ tài liệu chính thức
- https://docs.python.org/3.12/library/abc.html
- https://docs.python.org/3.12/glossary.html#term-duck-typing

Ghi lại phiên bản Python, lệnh đã chạy, dữ liệu thử và một quyết định thiết kế vào nhật ký học tập. Khi nhờ hỗ trợ, gửi ví dụ nhỏ tái hiện được cùng thông báo lỗi đầy đủ; không gửi dữ liệu cá nhân hoặc đường dẫn chứa thông tin bí mật.
