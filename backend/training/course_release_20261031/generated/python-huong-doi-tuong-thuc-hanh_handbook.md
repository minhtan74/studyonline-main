# Sổ tay khóa học: Python hướng đối tượng thực hành

## Phạm vi và đầu ra
Khóa học 6 tuần dành cho người đã biết biến, điều kiện, vòng lặp, hàm, list/dict và đọc thông báo lỗi Python. Thời lượng dự kiến 36 giờ gồm 24 giờ cho 12 bài và khoảng 12 giờ ôn, quiz, dự án. Tốc độ thực tế tùy nền tảng; người chưa tự viết được hàm lọc danh sách nên ôn Python cơ bản trước. Đây là chương trình tự học có bài tập và kiểm tra, không gắn với chứng nhận nghề nghiệp hoặc tín chỉ của một tổ chức đào tạo.

Sau khóa học, người học có thể diễn đạt bất biến dữ liệu; tạo lớp với API nhỏ; giải thích tham chiếu và quyền sở hữu mutable; phân biệt composition với kế thừa; dùng dataclass, property, ABC phù hợp; thiết kế lỗi nghiệp vụ; viết unittest; lưu/tải dữ liệu JSON có xác thực; và hoàn thành một CLI mà người khác chạy lại được. Học viên phải giải thích được quyết định của mình, không chỉ chạy bản lời giải.

## Chuẩn bị môi trường
- Cài Python 3.12 trở lên, kiểm tra `python --version`; Windows có thể dùng `py -3.12 --version`.
- Tạo thư mục học riêng, dùng trình soạn thảo hỗ trợ UTF-8. Không cần MySQL, tài khoản đám mây hay thư viện ngoài.
- Tùy chọn tạo môi trường ảo bằng `python -m venv .venv`; các ví dụ sử dụng thư viện chuẩn nên không có gói bắt buộc phải tải.
- Mỗi bài dùng một file example.py riêng. Ghi phiên bản và lệnh trong nhật ký; test file luôn dùng thư mục tạm.
- Có thể làm hoàn toàn offline sau khi tải giáo trình và bộ mã; các liên kết cuối bài phục vụ tra cứu thêm.

## Lộ trình 6 tuần
1. Tuần 1: lớp, đối tượng, tham chiếu; constructor và bất biến. Sản phẩm là Book bảo vệ số lượng, bảng dữ liệu biên và sơ đồ tham chiếu.
2. Tuần 2: dữ liệu lớp/thực thể, mutable dùng chung, property. Sản phẩm là hai kho độc lập và API đọc trạng thái không vô tình sửa dữ liệu.
3. Tuần 3: composition, dịch vụ danh mục, dataclass. Sản phẩm là Library chứa Book cùng một kiểu biên nhận giá trị có kiểm tra.
4. Tuần 4: kế thừa, hợp đồng thay thế, duck typing và ABC. Sản phẩm là các policy/repository khác nhau qua cùng bộ kiểm tra hợp đồng.
5. Tuần 5: ngoại lệ, unittest và kiểm tra biên. Sản phẩm là bộ test bao phủ thành công, lỗi và trạng thái sau lỗi; chứng minh test bắt được một lỗi cố ý trên bản sao.
6. Tuần 6: JSON, CLI và dự án. Sản phẩm là thư viện chạy được, file dữ liệu mẫu, README, log test và bảng nghiệm thu.

Mỗi tuần đọc hai bài, dự đoán trước khi chạy ví dụ, tự làm bài tập trước khi xem hướng giải, ghi một lỗi đã sửa và làm quiz. Nếu quiz thấp hơn 70%, quay lại các câu sai và ví dụ liên quan rồi thử bài vận dụng khác; thuộc đáp án không thay cho việc hiểu hành vi.

## Cách dùng bài kiểm tra
Mỗi bài có 5 câu trắc nghiệm độc lập để kiểm tra thuật ngữ và suy luận ngắn, các chương ghép phần luyện của hai bài. Các câu có giải thích sau khi nộp; hãy ghi lý do chọn trước khi xem đáp án. Điểm quiz phản ánh phần câu hỏi đã làm, không tự chứng nhận kỹ năng lập trình. Khi hệ thống có đủ 5 câu khác nhau cho một phần, tỷ lệ dưới 70% được dùng làm tín hiệu nên ôn; với ít câu, cần thêm căn cứ.

Đánh giá hoàn thành khóa học đề xuất: quiz đạt từ 70% và dự án đạt từ 70/100, đồng thời mọi yêu cầu trọng yếu đều đạt. Điểm dự án do giảng viên hoặc người review xem bằng chứng; hệ thống hiện không tự chấm mã nguồn theo rubric này. Nếu tự học, dùng checklist và nhờ người khác tái hiện chương trình trước khi tự đánh dấu hoàn thành. Không dùng tổng điểm để che một lỗi làm mất dữ liệu hoặc số lượng âm.

## Đề bài dự án cuối khóa
Xây dựng thư viện CLI một người dùng, dữ liệu nhỏ. Mỗi đầu sách có code duy nhất, title không rỗng, total là số nguyên không âm, available từ 0 tới total. Hỗ trợ add/list/borrow/return; từ chối mã trùng, mã không có, hết sách, trả dư, dữ liệu sai và file JSON hỏng. Lệnh sai giữ nguyên file hiện có. Không lưu tên độc giả, tài khoản hay dữ liệu thật. Thao tác cùng lúc từ nhiều tiến trình nằm ngoài hợp đồng này.

Tách Book, Library, JsonRepository và main; có thể đổi tên nếu trách nhiệm vẫn rõ. Ghi schema_version, xác thực dữ liệu lúc tải, ghi file tạm cùng thư mục rồi replace. Không coi kỹ thuật ghi này là giao dịch đa người dùng. README phải nói cách sao lưu file khi thử lỗi, giới hạn 1 MB của bản tham khảo và giới hạn thao tác tuần tự.

## Rubric 100 điểm và bằng chứng
- Đúng nghiệp vụ và bất biến: 30 điểm. Có ca thành công, hết sách, trả dư, mã trùng; trạng thái sau lỗi đúng. Yêu cầu trọng yếu: không âm, không vượt tổng, không ghi mất file hỏng.
- Thiết kế hướng đối tượng: 15 điểm. Trách nhiệm lớp rõ, composition hợp lý, tránh mutable toàn cục; giải thích được một lựa chọn không dùng kế thừa.
- Lưu/tải dữ liệu: 15 điểm. JSON UTF-8, version rõ, kiểm tra trường/kiểu/miền/mã trùng, round-trip đúng; lỗi tải không tạo thành công giả.
- Kiểm thử: 20 điểm. Unit test độc lập, có test biên và test giữ nguyên file sau lệnh sai; có log test và một ví dụ chứng minh test phát hiện lỗi.
- Khả năng sử dụng và tái hiện: 10 điểm. README đủ môi trường/lệnh, thông báo rõ, mã thoát đúng, người khác chạy được từ thư mục mới.
- Giải thích và mở rộng: 10 điểm. Trình bày giới hạn, thêm search chỉ đọc có test và trả lời thay đổi yêu cầu nhỏ mà không phá test cũ.

Hồ sơ nộp gồm mã nguồn, test, README, dữ liệu mẫu không nhạy cảm, log test, bảng 8–12 ca CLI và một trang giải thích quyết định thiết kế. Nếu không đạt một yêu cầu trọng yếu, sửa và chạy nghiệm thu lại trước khi đánh dấu đạt, dù tổng điểm tạm thời trên 70.

## Bộ mã tham khảo và lệnh tái hiện
Lưu các file đi kèm vào cùng một thư mục mới. Chạy từ thư mục đó:
```text
python -m unittest -v
python library_cli.py --data sandbox-library.json add PY01 "Học Python" 2
python library_cli.py --data sandbox-library.json list
python library_cli.py --data sandbox-library.json borrow PY01
python library_cli.py --data sandbox-library.json list
python library_cli.py --data sandbox-library.json return PY01
```
Kết quả list sau lần mượn là `PY01 | Học Python | 1/2`, sau trả là `2/2`. Thử mã không có phải trả mã thoát 2; dùng file tạm để thử JSON hỏng. Bản tham khảo có thể dùng để đối chiếu sau khi tự làm, không thay bài bảo vệ và kiểm tra vận dụng.

## Tài liệu chính thức và cách tra cứu
- Python classes: https://docs.python.org/3.12/tutorial/classes.html
- Dataclasses: https://docs.python.org/3.12/library/dataclasses.html
- ABC: https://docs.python.org/3.12/library/abc.html
- Errors: https://docs.python.org/3.12/tutorial/errors.html
- Unittest: https://docs.python.org/3.12/library/unittest.html
- JSON: https://docs.python.org/3.12/library/json.html
- Argparse: https://docs.python.org/3.12/library/argparse.html

Giáo trình và bài tập được biên soạn riêng cho lộ trình này; các liên kết giúp đối chiếu API chuẩn. Khi dùng phiên bản Python khác, đọc tài liệu tương ứng và ghi lại khác biệt thực tế trong nhật ký. Phạm vi nền tảng của khóa không bao gồm web framework, cơ sở dữ liệu nhiều người dùng, triển khai dịch vụ hay chứng nhận bảo mật ứng dụng.


## Mã nguồn dự án tham khảo
Tự làm dự án theo đề bài trước khi đối chiếu mã tham khảo bên dưới.


### File: library_cli.py
```
"""One-user library CLI for the Python OOP course; Python 3.12+, stdlib only."""
from dataclasses import dataclass
import argparse
import json
from pathlib import Path
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")


class LibraryError(ValueError):
    pass


@dataclass
class Book:
    code: str
    title: str
    total: int
    available: int

    def __post_init__(self):
        for value, label in ((self.code, "Mã"), (self.title, "Tên")):
            if not isinstance(value, str) or not value.strip():
                raise LibraryError(f"{label} sách không được rỗng")
        self.code = self.code.strip()
        self.title = self.title.strip()
        if type(self.total) is not int or self.total < 0:
            raise LibraryError("Tổng phải là số nguyên không âm")
        if type(self.available) is not int or not 0 <= self.available <= self.total:
            raise LibraryError("Số có sẵn phải nằm trong khoảng từ 0 tới tổng")

    def borrow(self):
        if self.available == 0:
            raise LibraryError("Đã hết bản có thể mượn")
        self.available -= 1

    def return_copy(self):
        if self.available == self.total:
            raise LibraryError("Không có bản đang được mượn để trả")
        self.available += 1

    def to_record(self):
        return {"code": self.code, "title": self.title,
                "total": self.total, "available": self.available}


class Library:
    def __init__(self, books=()):
        self._books = {}
        for book in books:
            self.add(book)

    def add(self, book):
        if book.code in self._books:
            raise LibraryError("Mã sách đã tồn tại")
        self._books[book.code] = book

    def get(self, code):
        try:
            return self._books[code]
        except KeyError as exc:
            raise LibraryError("Không tìm thấy mã sách") from exc

    def borrow(self, code):
        self.get(code).borrow()

    def return_book(self, code):
        self.get(code).return_copy()

    def records(self):
        return [self._books[code].to_record() for code in sorted(self._books)]


class JsonRepository:
    MAX_BYTES = 1_000_000

    def __init__(self, path):
        self.path = Path(path)

    def load(self):
        if not self.path.exists():
            return Library()
        try:
            if self.path.stat().st_size > self.MAX_BYTES:
                raise LibraryError("File vượt giới hạn 1 MB của bài thực hành")
            payload = json.loads(self.path.read_text(encoding="utf-8"))
        except (OSError, UnicodeError, json.JSONDecodeError) as exc:
            raise LibraryError("Không đọc được JSON; giữ nguyên file để kiểm tra") from exc
        if not isinstance(payload, dict) or set(payload) != {"schema_version", "books"}:
            raise LibraryError("Cấu trúc gốc không hợp lệ")
        if type(payload["schema_version"]) is not int or payload["schema_version"] != 1:
            raise LibraryError("Phiên bản dữ liệu không được hỗ trợ")
        if not isinstance(payload["books"], list):
            raise LibraryError("books phải là danh sách")
        books = []
        for row in payload["books"]:
            if not isinstance(row, dict) or set(row) != {"code", "title", "total", "available"}:
                raise LibraryError("Trường của bản ghi sách không hợp lệ")
            books.append(Book(**row))
        return Library(books)

    def save(self, library):
        payload = {"schema_version": 1, "books": library.records()}
        encoded = json.dumps(payload, ensure_ascii=False, indent=2).encode("utf-8")
        if len(encoded) > self.MAX_BYTES:
            raise LibraryError("Dữ liệu vượt giới hạn 1 MB của bài thực hành")
        temporary = self.path.with_name(self.path.name + ".tmp")
        try:
            temporary.write_bytes(encoded)
            temporary.replace(self.path)
        except OSError as exc:
            raise LibraryError("Không ghi được dữ liệu; kiểm tra đường dẫn và quyền ghi") from exc


def main(argv=None):
    parser = argparse.ArgumentParser(description="Thư viện CLI — bài thực hành OOP")
    parser.add_argument("--data", default="library.json", help="File dữ liệu của một người dùng")
    commands = parser.add_subparsers(dest="command", required=True)
    add = commands.add_parser("add", help="Thêm đầu sách mới")
    add.add_argument("code")
    add.add_argument("title")
    add.add_argument("total", type=int)
    commands.add_parser("list", help="Xem danh mục")
    for name in ("borrow", "return"):
        command = commands.add_parser(name)
        command.add_argument("code")
    args = parser.parse_args(argv)
    repository = JsonRepository(args.data)
    try:
        library = repository.load()
        if args.command == "list":
            for row in library.records():
                print(f"{row['code']} | {row['title']} | {row['available']}/{row['total']}")
            return 0
        if args.command == "add":
            library.add(Book(args.code, args.title, args.total, args.total))
        elif args.command == "borrow":
            library.borrow(args.code)
        else:
            library.return_book(args.code)
        repository.save(library)
    except LibraryError as exc:
        print(f"Lỗi: {exc}", file=sys.stderr)
        return 2
    print("Đã lưu thay đổi")
    return 0


if __name__ == "__main__":
    sys.exit(main())

```


### File: test_library_cli.py
```
import contextlib
import io
import json
from pathlib import Path
import tempfile
import unittest
from library_cli import Book, Library, LibraryError, JsonRepository, main


class LibraryTests(unittest.TestCase):
    def test_borrow_and_return_boundaries(self):
        book = Book("PY01", "Học Python", 1, 1)
        book.borrow()
        with self.assertRaises(LibraryError):
            book.borrow()
        self.assertEqual(book.available, 0)
        book.return_copy()
        with self.assertRaises(LibraryError):
            book.return_copy()
        self.assertEqual(book.available, 1)

    def test_constructor_validation(self):
        for total in (-1, True, "2"):
            with self.subTest(total=total), self.assertRaises(LibraryError):
                Book("PY01", "Python", total, 0)
        for available in (-1, 3, True):
            with self.subTest(available=available), self.assertRaises(LibraryError):
                Book("PY01", "Python", 2, available)

    def test_blank_code_and_title(self):
        for code, title in ((" ", "Python"), ("PY01", " "), (None, "Python")):
            with self.subTest(code=code, title=title), self.assertRaises(LibraryError):
                Book(code, title, 1, 1)

    def test_duplicate_and_missing_code(self):
        library = Library([Book("PY01", "Python", 1, 1)])
        with self.assertRaises(LibraryError):
            library.add(Book("PY01", "Khác", 9, 9))
        with self.assertRaises(LibraryError):
            library.borrow("NO")
        self.assertEqual(library.get("PY01").total, 1)

    def test_record_export_is_not_mutable_alias(self):
        library = Library([Book("PY01", "Python", 2, 2)])
        rows = library.records()
        rows[0]["available"] = 0
        self.assertEqual(library.get("PY01").available, 2)

    def test_json_round_trip_and_sorting(self):
        with tempfile.TemporaryDirectory() as folder:
            repository = JsonRepository(Path(folder) / "library.json")
            self.assertEqual(repository.load().records(), [])
            library = Library([Book("B", "Java", 2, 1), Book("A", "Python", 1, 1)])
            repository.save(library)
            self.assertEqual(repository.load().records(), library.records())
            self.assertEqual(repository.load().records()[0]["code"], "A")

    def test_bad_json_not_overwritten(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "library.json"
            path.write_bytes(b"{broken")
            with self.assertRaises(LibraryError):
                JsonRepository(path).load()
            self.assertEqual(path.read_bytes(), b"{broken")

    def test_schema_and_duplicate_rows_rejected(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "library.json"
            row = {"code": "PY01", "title": "Python", "total": 1, "available": 1}
            for payload in ({"schema_version": True, "books": []},
                            {"schema_version": 2, "books": []},
                            {"schema_version": 1, "books": [row, row]},
                            {"schema_version": 1, "books": [{"code": "PY01"}]}):
                path.write_text(json.dumps(payload), encoding="utf-8")
                with self.subTest(payload=payload), self.assertRaises(LibraryError):
                    JsonRepository(path).load()

    def test_cli_persists_and_does_not_save_failed_borrow(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "library.json"
            common = ["--data", str(path)]
            with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
                self.assertEqual(main(common + ["add", "PY01", "Học Python", "1"]), 0)
                self.assertEqual(main(common + ["borrow", "PY01"]), 0)
                before = path.read_bytes()
                self.assertEqual(main(common + ["borrow", "PY01"]), 2)
                self.assertEqual(path.read_bytes(), before)
                self.assertEqual(main(common + ["return", "PY01"]), 0)
                self.assertEqual(main(common + ["list"]), 0)
            self.assertEqual(JsonRepository(path).load().get("PY01").available, 1)

    def test_cli_invalid_add_does_not_create_file(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "library.json"
            with contextlib.redirect_stderr(io.StringIO()):
                self.assertEqual(main(["--data", str(path), "add", "PY01", "Python", "-1"]), 2)
            self.assertFalse(path.exists())


if __name__ == "__main__":
    unittest.main()

```


### File: README.md
# Thư viện CLI — dự án Python OOP

Python 3.12+, chỉ thư viện chuẩn. Chạy `python -m unittest -v` trước khi dùng.

```text
python library_cli.py --data sandbox-library.json add PY01 "Học Python" 2
python library_cli.py --data sandbox-library.json list
python library_cli.py --data sandbox-library.json borrow PY01
python library_cli.py --data sandbox-library.json return PY01
```

Dữ liệu UTF-8 ở file do --data chỉ định, mặc định library.json. Lệnh sai trả mã thoát 2 và không lưu dữ liệu. Đường dẫn thư mục cha phải tồn tại và ghi được. Dùng file thử riêng; sao lưu trước khi sửa JSON bằng tay.

Giới hạn: một người chạy tuần tự một lệnh tại một thời điểm, file không quá 1 MB, không quản lý độc giả, không có xác thực hay giao dịch nhiều tiến trình. File tạm rồi replace không thay khóa đồng thời. Đây là dự án nền tảng để học mô hình và kiểm thử.

Hãy tự bổ sung lệnh search chỉ đọc và test theo đề bài. Rubric trong sổ tay khóa học chấm nghiệp vụ, thiết kế, lưu trữ, test và khả năng tái hiện.
