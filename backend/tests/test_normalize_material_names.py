"""Bulk naming preserves document subjects and fails atomically on stale plans."""
from pathlib import Path
import sys

import pytest
from sqlalchemy import create_engine, text

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from scripts import normalize_material_names as naming


def test_plan_restarts_lessons_and_preserves_document_supplement_names():
    courses = [{"id": 8, "title": "Python"}]
    chapters = [
        {"id": 10, "course_id": 8, "chapter_name": "Làm quen", "order_index": 0},
        {"id": 12, "course_id": 8, "chapter_name": "Chương 9: Hàm", "order_index": 0},
    ]
    lessons = [
        {"id": 21, "chapter_id": 10, "title": "Bài 5: Biến", "order_index": 0},
        {"id": 22, "chapter_id": 10, "title": "Toán tử", "order_index": 0},
        {"id": 29, "chapter_id": 12, "title": "Bài 8: Đối số", "order_index": 0},
    ]
    documents = [
        {"id": 50, "course_id": 8, "lesson_id": 29, "title": "Bài 8: Đối số — Thực hành bổ sung", "filename": "tech.pdf",
         "file_path": str(Path(naming.settings.upload_dir, "documents/tech.pdf").resolve()), "file_type": "pdf"},
    ]
    changes, copies = naming.plan_names(courses, chapters, lessons, documents)
    assert not copies
    lesson_change = next(c for c in changes if c["table"] == "lessons" and c["id"] == 29)
    assert lesson_change["after"]["title"] == "Bài 1: Đối số"
    doc_change = next(c for c in changes if c["table"] == "documents")
    assert doc_change["after"]["title"] == "Chương 2 — Bài 1: Đối số — Thực hành bổ sung"
    assert doc_change["after"]["filename"].endswith(".pdf")
    for table, rows in [("chapters", chapters), ("lessons", lessons), ("documents", documents)]:
        for row in rows:
            for change in changes:
                if change["table"] == table and change["id"] == row["id"]:
                    row.update(change["after"])
    assert naming.plan_names(courses, chapters, lessons, documents) == ([], [])
    documents[0]["course_id"] = 99
    with pytest.raises(ValueError, match="outside its course"):
        naming.plan_names(courses, chapters, lessons, documents)


def test_stale_plan_rolls_back_all_database_names(monkeypatch):
    engine = create_engine("sqlite://")
    with engine.begin() as conn:
        conn.execute(text("CREATE TABLE chapters (id INT PRIMARY KEY, chapter_name TEXT)"))
        conn.execute(text("INSERT INTO chapters VALUES (1,'First'),(2,'Changed concurrently')"))
    monkeypatch.setattr(naming, "engine", engine)
    monkeypatch.setattr(naming, "counts", lambda conn: {"chapters": 2})
    # SQLite does not support FOR UPDATE. Preserve all other SQL and transaction
    # behavior so the test verifies rollback after the first update has executed.
    monkeypatch.setattr(naming, "text", lambda value: text(value.replace(" FOR UPDATE", "")))
    changes = [
        dict(table="chapters", id=1, before={"chapter_name": "First"}, after={"chapter_name": "Chương 1: First"}),
        dict(table="chapters", id=2, before={"chapter_name": "Second"}, after={"chapter_name": "Chương 2: Second"}),
    ]
    with pytest.raises(RuntimeError, match="changed after audit"):
        naming.apply_changes(changes, [])
    with engine.connect() as conn:
        assert list(conn.execute(text("SELECT chapter_name FROM chapters ORDER BY id")).scalars()) == ["First", "Changed concurrently"]
