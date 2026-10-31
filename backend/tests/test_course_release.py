"""Course resource authorization and release content integrity without DB writes."""
import json
from pathlib import Path
import sqlite3
import sys

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from app.core.responses import ApiError
from app.routers import courses
from training.course_release_20261031.manage import insert_questions, markdown


def test_materials_require_enrollment_and_do_not_expose_storage_paths(monkeypatch):
    monkeypatch.setattr(courses, 'q_one', lambda *a, **kw: {'id': 3})
    monkeypatch.setattr(courses, 'can_access_course', lambda db, user, cid: False)
    with pytest.raises(ApiError) as error:
        courses.materials(course_id=3, user={'id': 10, 'role': 'student'}, db=None)
    assert error.value.status == 403
    monkeypatch.setattr(courses, 'can_access_course', lambda db, user, cid: True)
    def rows(db, sql, **kw):
        assert 'lesson_id IS NULL' in sql
        assert 'file_path' not in sql and '*' not in sql
        return [{'id': 4, 'title': 'Sổ tay', 'filename': 'So tay.pdf'}]
    monkeypatch.setattr(courses, 'q_all', rows)
    response = courses.materials(course_id=3, user={'id': 10, 'role': 'student'}, db=None)
    assert json.loads(response.body)['data'][0]['title'] == 'Sổ tay'


def test_materials_teacher_must_own_course(monkeypatch):
    monkeypatch.setattr(courses, 'q_one', lambda *a, **kw: {'id': 3})
    def reject(*args):
        raise ApiError('Không có quyền.', 403)
    monkeypatch.setattr(courses, 'assert_owns_course', reject)
    with pytest.raises(ApiError) as error:
        courses.materials(course_id=3, user={'id': 2, 'role': 'teacher'}, db=None)
    assert error.value.status == 403


def test_materials_missing_course(monkeypatch):
    monkeypatch.setattr(courses, 'q_one', lambda *a, **kw: None)
    with pytest.raises(ApiError) as error:
        courses.materials(course_id=3, user={'id': 2, 'role': 'admin'}, db=None)
    assert error.value.status == 404


def test_document_rendering_keeps_code_headings_tables_and_links():
    rendered = markdown('''## Mục tiêu
### Thực hành
```python
if x < 3:
    print("<test>")
```
| Mục | Điểm |
| --- | --- |
| Đúng | 35 |
[Python](https://docs.python.org/3/)
''')
    assert '<h3>Thực hành</h3>' in rendered
    assert 'x &lt; 3' in rendered and '&lt;test&gt;' in rendered
    assert '<table>' in rendered and '<td>35</td>' in rendered
    assert '<a href="https://docs.python.org/3/">Python</a>' in rendered


def test_question_rotation_keeps_authored_answer_and_knowledge_scope():
    db = sqlite3.connect(':memory:')
    db.row_factory = sqlite3.Row
    db.execute('''CREATE TABLE questions (quiz_id INT,content TEXT,option_a TEXT,option_b TEXT,option_c TEXT,option_d TEXT,
        correct_answer TEXT,topic TEXT,topic_id INT,difficulty TEXT,explanation TEXT,order_index INT,
        knowledge_chapter_id INT,knowledge_lesson_id INT)''')
    class Connection:
        def execute(self, query, parameters):
            return db.execute(str(query), parameters)
    lesson = {'title': 'Nhánh Git', 'questions': [dict(prompt='P'+str(i), options=['sai 1', 'đúng', 'sai 2', 'sai 3'],
        correct=1, difficulty='medium', explanation='Lý do') for i in range(5)]}
    try:
        insert_questions(Connection(), 8, lesson, 9, 10, 11, start=5)
        rows = db.execute('SELECT * FROM questions').fetchall()
        assert len(rows) == 5
        for row in rows:
            assert row['option_' + row['correct_answer'].lower()] == 'đúng'
            assert row['knowledge_chapter_id'] == 9 and row['knowledge_lesson_id'] == 10
        assert [r['order_index'] for r in rows] == [6,7,8,9,10]
    finally:
        db.close()
