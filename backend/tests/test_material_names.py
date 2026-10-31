"""Curriculum numbering and attachment names remain consistent for existing files."""
import sqlite3
import sys
import uuid
from pathlib import Path
from urllib.parse import unquote

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.services.material_names import lesson_document_name, numbered_title, safe_filename
from app.routers import lessons


@pytest.mark.parametrize("name,label,number,expected", [
    ("Biến và kiểu dữ liệu", "Bài", 2, "Bài 2: Biến và kiểu dữ liệu"),
    ("Bài 9: Bài 3. Biến", "Bài", 2, "Bài 2: Biến"),
    ("Chương 12 – Làm quen", "Chương", 1, "Chương 1: Làm quen"),
    ("2. Làm quen", "Chương", 1, "Chương 1: Làm quen"),
    ("Chương trình đầu tiên", "Bài", 1, "Bài 1: Chương trình đầu tiên"),
    ("Bài 7", "Bài", 3, "Bài 3"),
])
def test_numbered_title_replaces_old_prefix_and_is_idempotent(name, label, number, expected):
    assert numbered_title(name, label, number) == expected
    assert numbered_title(expected, label, number) == expected


def test_document_filename_is_readable_safe_and_bounded():
    assert lesson_document_name("Chương 1: Python", "Bài 2: Biến", 1, 2) == "Chương 1 - Bài 2 - Biến.pdf"
    name = safe_filename('../Mục: 1/2\\3?*<x>\x00', '.pdf')
    assert not set('<>:"/\\|?*\x00').intersection(name)
    assert not name.startswith('.')
    assert len(safe_filename('Tài liệu ' * 100, '.pdf').encode('utf-8')) <= 240
    assert safe_filename('CON', '.pdf') == 'Tai lieu CON.pdf'


def test_sql_numbering_uses_order_and_id_within_course_and_chapter():
    db = sqlite3.connect(':memory:')
    db.row_factory = sqlite3.Row
    db.executescript('''
        CREATE TABLE chapters (id INT, course_id INT, chapter_name TEXT, order_index INT);
        CREATE TABLE lessons (id INT, chapter_id INT, title TEXT, order_index INT);
        CREATE TABLE quizzes (id INT, review_lesson_id INT);
        CREATE TABLE questions (id INT, quiz_id INT);
        INSERT INTO chapters VALUES (8,1,'Later',20),(7,1,'First',0),(6,2,'Other course',0);
        INSERT INTO lessons VALUES (10,8,'Last',9),(11,8,'Second',0),(9,8,'First',0),(2,7,'Other chapter',0);
    ''')
    try:
        row = dict(db.execute(lessons._LESSON_SELECT + 'WHERE l.id = 11').fetchone())
        assert row['chapter_number'] == 2
        assert row['lesson_number'] == 2
        assert row['chapter_name'] == 'Later'
    finally:
        db.close()


def test_media_uses_human_filename_and_preserves_stored_file(monkeypatch):
    path = Path(__file__).parent / f'.material-name-{uuid.uuid4().hex}.pdf'
    try:
        path.write_bytes(b'%PDF-1.4\nexisting content')
        lesson = {'id': 90, 'is_free': 1, 'document_url': '/uploads/documents/stored_01234.pdf',
                  'title': 'Biến', 'chapter_name': 'Python', 'chapter_number': 2, 'lesson_number': 3}
        monkeypatch.setattr(lessons, 'verify', lambda *args: True)
        monkeypatch.setattr(lessons, 'q_one', lambda db, sql, **kw: {'id': 1, 'is_active': 1, 'token_version': 0} if 'FROM users' in sql else lesson)
        monkeypatch.setattr(lessons, 'protected_path', lambda url: str(path))
        response = lessons.media(lesson_id=90, kind='document', uid=1, exp=1, sig='test', db=None)
        disposition = unquote(response.headers['content-disposition'])
        assert 'Chương 2 - Bài 3 - Biến.pdf' in disposition
        assert str(response.path) == str(path)
        assert path.read_bytes() == b'%PDF-1.4\nexisting content'
        assert lessons._with_src({'id': 1}, lesson)['document_name'] == 'Chương 2 - Bài 3 - Biến.pdf'
    finally:
        path.unlink(missing_ok=True)
