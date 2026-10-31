"""Add five distinct application questions to each new-course lesson review.

Default is read-only; --apply writes one transaction and keeps a backup ledger.
Existing questions, submissions and final/chapter exams are retained.
"""
import argparse
from datetime import datetime
import hashlib
import json
from pathlib import Path
import sys

BACKEND = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(BACKEND))
from sqlalchemy import text
from app.core.database import engine
from app.services.material_names import numbered_title
from app.services.question_evidence import fingerprint
from training.course_release_20261031.manage import courses, insert_questions
from training.course_release_20261031.practice_bank_v2 import BANK

REPORT = BACKEND.parent / 'docs/study-recommendations-update-20261031.json'


def dump(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2, default=str), encoding='utf-8')


def protected(conn, question_limit):
    tables = ['users','enrollments','results','result_answers','quiz_attempts','lesson_progress','payments',
              'study_checkpoints','knowledge_study_checkpoints','questions']
    out = {}
    for table in tables:
        scope = ' WHERE id<=:limit' if table == 'questions' else ''
        rows = conn.execute(text(f'SELECT * FROM {table}{scope} ORDER BY id'), {'limit': question_limit}).mappings()
        sha = hashlib.sha256(); count = 0
        for row in rows:
            sha.update(json.dumps(dict(row), ensure_ascii=False, sort_keys=True, default=str).encode('utf-8'))
            count += 1
        out[table] = dict(rows=count, sha256=sha.hexdigest())
    return out


def plan(conn):
    additions = []; edits = []; summaries = []
    for course in courses():
        saved = conn.execute(text('SELECT id,description FROM courses WHERE slug=:slug'), course).mappings().one()
        cid = saved['id']
        existing = conn.execute(text('SELECT q.* FROM questions q JOIN quizzes z ON z.id=q.quiz_id WHERE z.course_id=:c'), {'c': cid}).mappings().all()
        all_keys = {fingerprint(q) for q in existing}
        authored = set()
        for ch_no, chapter in enumerate(course['chapters'], 1):
            for lesson_no, lesson in enumerate(chapter['lessons'], 1):
                rows = conn.execute(text('''SELECT l.id,l.title,l.description,z.id AS quiz_id,z.description AS quiz_description,ch.id AS chapter_id
                    FROM lessons l JOIN chapters ch ON ch.id=l.chapter_id
                    JOIN quizzes z ON z.review_lesson_id=l.id
                    WHERE ch.course_id=:c AND ch.order_index=:ch AND l.order_index=:l'''),
                    dict(c=cid,ch=ch_no,l=lesson_no)).mappings().all()
                assert len(rows) == 1, 'Ambiguous lesson order'
                row = rows[0]
                assert row['title'] == numbered_title(lesson['title'], 'Bài', lesson_no)
                bank = BANK[course['slug']][f'{ch_no}.{lesson_no}']
                assert len(bank) == 5
                current = [q for q in existing if q['quiz_id'] == row['quiz_id']]
                current_keys = {fingerprint(q) for q in current}
                new = []
                for q in bank:
                    key = fingerprint(dict(content=q['prompt'], **{'option_'+letter: q['options'][i] for i,letter in enumerate('abcd')}))
                    assert key not in authored, 'Duplicated authored question'
                    authored.add(key)
                    if key in current_keys:
                        continue
                    assert key not in all_keys, 'Application question repeats an existing question'
                    new.append(q)
                assert len(new) in (0,5), 'Partial bank already present; review before modifying'
                assert len(current) == (5 if new else 10), 'Unexpected lesson practice size'
                if new:
                    active = conn.execute(text('SELECT COUNT(*) FROM quiz_attempts WHERE quiz_id=:q AND finished_ts IS NULL'), {'q': row['quiz_id']}).scalar_one()
                    assert not active, 'A lesson review is in progress; no changes applied'
                    tid = conn.execute(text('SELECT id FROM course_topics WHERE course_id=:c AND lesson_id=:l'), dict(c=cid,l=row['id'])).scalar_one()
                    additions.append(dict(course_id=cid,lesson_id=row['id'],chapter_id=row['chapter_id'],quiz_id=row['quiz_id'],
                        topic_id=tid, title=lesson['title'], questions=new, start=max(q['order_index'] for q in current)))
                    edits.append(dict(table='quizzes',id=row['quiz_id'],before=row['quiz_description'],after='10 câu ôn tập: 5 câu nền tảng và 5 câu vận dụng mới, có giải thích và phân loại theo bài.'))
                    description = (row['description'] or '').replace('bộ ôn tập 5 câu', 'bộ ôn tập 10 câu')
                    if description != row['description']:
                        edits.append(dict(table='lessons',id=row['id'],before=row['description'],after=description))
                summaries.append(dict(course_id=cid,lesson_id=row['id'],quiz_id=row['quiz_id'],before=len(current),after=10,added=len(new)))
        description = (saved['description'] or '').replace('5 câu quiz', '10 câu ôn bài')
        suffix = 'Bộ ôn mỗi bài có 10 câu gồm 5 câu nền tảng và 5 câu vận dụng; đề cuối khóa giữ 60 câu.'
        if suffix not in description:
            description = description.rstrip() + ' ' + suffix
        if description != saved['description']:
            edits.append(dict(table='courses',id=cid,before=saved['description'],after=description))
    return additions, edits, summaries


def run(apply=False):
    with engine.connect() as conn:
        additions, edits, summaries = plan(conn)
        limit = conn.execute(text('SELECT COALESCE(MAX(id),0) FROM questions')).scalar_one()
        before = protected(conn, limit)
    report = dict(applied=False,min_questions=5,review_threshold=70,original_question_max_id=limit,
                  protected_before=before,lessons=summaries,metadata_changes=edits,added_question_ids=[])
    if not additions and not edits:
        print('Already expanded: 36 lesson reviews have 10 questions.'); return
    if not apply:
        dump(REPORT.with_name(REPORT.stem+'-preview.json'), report)
    else:
        ledger = BACKEND / 'data/practice_bank_v2' / (datetime.now().strftime('%Y%m%d_%H%M%S_%f')+'.json')
        dump(ledger, report)
        with engine.begin() as conn:
            fresh, fresh_edits, fresh_summary = plan(conn)
            assert (fresh,fresh_edits,fresh_summary) == (additions,edits,summaries), 'Bank changed since preview'
            assert protected(conn, limit) == before, 'Learning records changed; retry after reviewing'
            for row in additions:
                # Freeze the review definition while adding its questions.
                conn.execute(text('SELECT id FROM quizzes WHERE id=:id FOR UPDATE'), {'id': row['quiz_id']}).one()
                insert_questions(conn,row['quiz_id'],row,row['chapter_id'],row['lesson_id'],row['topic_id'],row['start'])
            for edit in edits:
                result = conn.execute(text(f"UPDATE {edit['table']} SET description=:after WHERE id=:id AND description <=> :before"), edit)
                assert result.rowcount == 1
            report['added_question_ids'] = list(conn.execute(text('SELECT id FROM questions WHERE id>:limit ORDER BY id'), {'limit': limit}).scalars())
            assert len(report['added_question_ids']) == 180
            assert protected(conn, limit) == before, 'Protected data unexpectedly changed'
            assert not plan(conn)[0] and not plan(conn)[1], 'Not all lesson reviews were expanded'
        report.update(applied=True,backup_ledger=str(ledger),protected_records_unchanged=True,new_independent_questions=180,lesson_reviews_updated=36)
        dump(ledger, report); dump(REPORT, report)
    print(json.dumps(dict(applied=apply,lesson_reviews=len(additions),new_questions=sum(len(r['questions']) for r in additions),report=str(REPORT)), ensure_ascii=False))


if __name__ == '__main__':
    if hasattr(sys.stdout,'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--apply', action='store_true')
    run(parser.parse_args().apply)
