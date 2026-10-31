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
