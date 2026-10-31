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
