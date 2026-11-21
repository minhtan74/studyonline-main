"""Teacher progress must use the same published lesson scope as the catalogue."""
import sqlite3

from app.routers.enrollments import _ENROLL_AGG


def test_draft_lessons_and_their_completions_do_not_affect_progress():
    db = sqlite3.connect(':memory:')
    db.row_factory = sqlite3.Row
    db.executescript('''
        CREATE TABLE users (id INTEGER, fullname TEXT, email TEXT);
        CREATE TABLE courses (id INTEGER, title TEXT, thumbnail TEXT, price INTEGER, teacher_id INTEGER);
        CREATE TABLE enrollments (id INTEGER, user_id INTEGER, course_id INTEGER, enroll_date TEXT);
        CREATE TABLE chapters (id INTEGER, course_id INTEGER);
        CREATE TABLE lessons (id INTEGER, chapter_id INTEGER, status TEXT);
        CREATE TABLE lesson_progress (lesson_id INTEGER, user_id INTEGER, is_completed INTEGER);
        INSERT INTO users VALUES (1, 'Learner', 'learner@example.test');
        INSERT INTO courses VALUES (10, 'Course', NULL, 0, 7);
        INSERT INTO enrollments VALUES (1, 1, 10, '2026-11-02');
        INSERT INTO chapters VALUES (20, 10);
        INSERT INTO lessons VALUES (30, 20, 'published'), (31, 20, 'draft');
        INSERT INTO lesson_progress VALUES (30, 1, 1), (31, 1, 1);
    ''')
    query = _ENROLL_AGG.format(
        graded='SELECT 10 AS course_id, 1 AS user_id, 80 AS pct',
        extra='', where='WHERE c.teacher_id = :tid',
    )
    try:
        row = db.execute(query, {'tid': 7}).fetchone()
        assert row['total_lessons'] == 1
        assert row['completed_lessons'] == 1
        db.execute("UPDATE lessons SET status = 'draft'")
        row = db.execute(query, {'tid': 7}).fetchone()
        assert row['total_lessons'] == 0
        assert row['completed_lessons'] == 0
    finally:
        db.close()
