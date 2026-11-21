"""Local MySQL integration checks for student 7; all scenario writes roll back."""
import json
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'backend'))
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.core.database import engine, get_db
from app.core.dependencies import get_current_user
from app.core.responses import ApiError, ApiJSONResponse
from app.routers import quizzes, recommendations

TABLES = ['results', 'result_answers', 'quiz_attempts', 'recommendations', 'learning_analytics', 'knowledge_study_checkpoints', 'study_checkpoints']
reports = []


def snapshot(conn):
    return {table: [tuple(str(v) for v in row) for row in conn.execute(text(f'SELECT * FROM {table} ORDER BY id'))] for table in TABLES}


def scenario(name, qid, run):
    with engine.connect() as conn:
        tx = conn.begin()
        db = Session(bind=conn, join_transaction_mode='create_savepoint')
        try:
            user = dict(db.execute(text('SELECT id,fullname,email,role,token_version FROM users WHERE id=7')).mappings().one())
            assert user['role'] == 'student'
            original = dict(db.execute(text('SELECT * FROM quizzes WHERE id=:q'), {'q': qid}).mappings().one())
            # Set up each case independently; these changes remain inside the rollback transaction.
            db.execute(text('DELETE FROM quiz_attempts WHERE user_id=7 AND quiz_id=:q'), {'q': qid})
            db.execute(text('DELETE FROM results WHERE user_id=7 AND quiz_id=:q'), {'q': qid})
            db.execute(text("UPDATE quizzes SET max_attempts=NULL,duration=NULL,grading_method='latest',passing_score=70 WHERE id=:q"), {'q': qid})
            db.commit()
            app = FastAPI()
            app.include_router(quizzes.router)
            app.include_router(recommendations.router)
            app.dependency_overrides[get_current_user] = lambda: user
            app.dependency_overrides[quizzes.get_viewer] = lambda: user
            app.dependency_overrides[quizzes.get_current_user_optional] = lambda: user

            def session():
                yield db

            app.dependency_overrides[get_db] = session

            @app.exception_handler(ApiError)
            async def error_handler(request, exc):
                return ApiJSONResponse({'message': exc.message}, status_code=exc.status)

            with TestClient(app) as client:
                result = run(db, client, qid)
            reports.append({'case': name, 'quiz_id': qid, 'quiz_title': original['title'], 'passed': True, **(result or {})})
        finally:
            db.close()
            tx.rollback()


def opened(client, qid):
    response = client.get('/api/quizzes/questions', params={'quiz_id': qid})
    assert response.status_code == 200, response.text
    data = response.json()
    assert data['data'] and all(not q.get('correct_answer') for q in data['data'])
    return data


def submit(db, client, qid, correct, token=None):
    token = token or opened(client, qid)['attempt_token']
    aid = int(token.split('.')[0])
    raw = [dict(q) for q in db.execute(text('SELECT * FROM questions WHERE quiz_id=:q ORDER BY order_index,id'), {'q': qid}).mappings()]
    answers = {str(q['id']): next(k for k, v in quizzes._option_map(q, aid).items() if (v == q['correct_answer']) == (i < correct)) for i, q in enumerate(raw)}
    response = client.post('/api/quizzes/submit', json={'quiz_id': qid, 'attempt_token': token, 'answers': answers})
    assert response.status_code == 200, response.text
    result = response.json()
    assert result['score'] == correct and result['total'] == len(raw)
    assert result['percent'] == quizzes._percent(correct, len(raw))
    assert db.execute(text('SELECT COUNT(*) FROM result_answers WHERE result_id=:r'), {'r': result['result_id']}).scalar_one() == len(raw)
    detail = client.get('/api/quizzes/results', params={'id': result['result_id']})
    assert detail.status_code == 200 and detail.json()['score'] == correct
    return result


def score_case(ratio):
    def run(db, client, qid):
        n = db.execute(text('SELECT COUNT(*) FROM questions WHERE quiz_id=:q'), {'q': qid}).scalar_one()
        result = submit(db, client, qid, int(n * ratio))
        course_id = db.execute(text('SELECT course_id FROM quizzes WHERE id=:q'), {'q': qid}).scalar_one()
        response = client.get('/api/recommendations', params={'course_id': course_id})
        assert response.status_code == 200
        rec = response.json()['data']['current']
        for unit in rec['based_on']['knowledge']['units']:
            assert unit['course_id'] == course_id
            assert unit['sufficient_data'] == (unit['answered'] >= 5)
            assert unit['needs_review'] == (unit['answered'] >= 5 and unit['avg_score'] < 70)
        assert result['knowledge']['units']
        return {'score': result['score'], 'total': n, 'percent': result['percent'], 'result_units': [{'kind': u['kind'], 'title': u['title'], 'correct': u['correct'], 'answered': u['answered'], 'review': u['needs_review']} for u in result['knowledge']['units']], 'suggestions': [i['type'] for i in rec['items']]}
    return run


def lifecycle(db, client, qid):
    assert client.get('/api/quizzes/questions', params={'quiz_id': qid, 'resume_only': True}).status_code == 403
    data = opened(client, qid)
    token = data['attempt_token']
    resumed = opened(client, qid)
    assert resumed['attempt_token'] == token and resumed['data'] == data['data']
    for bad in ['', 'invalid', token + 'tampered']:
        response = client.post('/api/quizzes/submit', json={'quiz_id': qid, 'attempt_token': bad, 'answers': {}})
        assert 400 <= response.status_code < 500
    result = submit(db, client, qid, 0, token)
    assert client.post('/api/quizzes/submit', json={'quiz_id': qid, 'attempt_token': token}).status_code == 403
    assert client.get('/api/quizzes/results', params={'quiz_id': qid}).json()['data'][0]['id'] == result['result_id']
    assert client.get('/api/quizzes/results', params={'id': 2147483647}).status_code == 404
    return {'checks': ['resume_requires_existing_attempt', 'stable_resume_and_shuffle', 'missing_invalid_tampered_token_rejected', 'duplicate_rejected', 'history_and_detail', 'missing_result_404']}


def limits(db, client, qid):
    db.execute(text('UPDATE quizzes SET max_attempts=1,duration=1 WHERE id=:q'), {'q': qid}); db.commit()
    token = opened(client, qid)['attempt_token']
    assert opened(client, qid)['attempt_token'] == token
    aid = int(token.split('.')[0])
    db.execute(text('UPDATE quiz_attempts SET started_ts=:t WHERE id=:a'), {'t': int(time.time()) - 125, 'a': aid}); db.commit()
    response = client.post('/api/quizzes/submit', json={'quiz_id': qid, 'attempt_token': token})
    assert response.status_code == 403
    assert client.get('/api/quizzes/questions', params={'quiz_id': qid}).status_code == 403
    return {'checks': ['last_slot_can_resume', 'expired_submission_rejected', 'exhausted_attempts_rejected']}


def grading(method):
    def run(db, client, qid):
        db.execute(text('UPDATE quizzes SET grading_method=:m WHERE id=:q'), {'m': method, 'q': qid}); db.commit()
        first = submit(db, client, qid, 0)
        second = submit(db, client, qid, first['total'])
        data = client.get('/api/quizzes/results', params={'quiz_id': qid}).json()['data']
        expected = {'highest': 100, 'latest': 100, 'first': 0, 'average': 50}[method]
        assert data[0]['graded_percent'] == expected, data
        return {'grading_method': method, 'first_percent': 0, 'second_percent': second['percent'], 'official_percent': expected}
    return run


def permissions(db, client, qid):
    other = db.execute(text('SELECT q.id FROM quizzes q WHERE q.course_id NOT IN (SELECT course_id FROM enrollments WHERE user_id=7) LIMIT 1')).scalar_one()
    assert client.get('/api/quizzes/questions', params={'quiz_id': other}).status_code == 403
    response = client.post('/api/quizzes/submit', json={'quiz_id': other, 'answers': {}})
    assert response.status_code == 403
    token = opened(client, qid)['attempt_token']
    assert client.post('/api/quizzes/submit', json={'quiz_id': 303, 'attempt_token': token, 'answers': {}}).status_code == 400
    return {'checks': ['unenrolled_open_rejected', 'unenrolled_submit_rejected', 'token_wrong_quiz_rejected']}


def answer_payload(payload):
    def run(db, client, qid):
        token = opened(client, qid)['attempt_token']
        response = client.post('/api/quizzes/submit', json={'quiz_id': qid, 'attempt_token': token, 'answers': payload})
        assert response.status_code == 200, response.text
        result = response.json()
        assert result['score'] == 0
        return {'score': 0, 'total': result['total'], 'payload_handled_as': 'incorrect_or_unanswered'}
    return run


def passing_score(db, client, qid):
    db.execute(text('UPDATE quizzes SET passing_score=80 WHERE id=:q'), {'q': qid}); db.commit()
    result = submit(db, client, qid, 30)
    assert result['percent'] == 75 and result['passed'] is False
    rec = client.get('/api/recommendations', params={'course_id': 7}).json()['data']['current']
    assert any(i['type'] == 'retake_quiz' and i['grade_evidence']['passed'] is False for i in rec['items'])
    return {'percent': 75, 'passing_score': 80, 'passed': False, 'retake_suggested': True}


def main():
    with engine.connect() as conn:
        before = snapshot(conn)
        settings_before = [tuple(r) for r in conn.execute(text('SELECT id,max_attempts,duration,grading_method,passing_score FROM quizzes ORDER BY id'))]
    try:
        for qid in [293, 303, 289]:
            for ratio in [0, .49, .5, .69, .7, .84, .85, 1]:
                scenario(f'score_target_{ratio * 100:g}_percent', qid, score_case(ratio))
            scenario('attempt_lifecycle', qid, lifecycle)
            scenario('expiry_and_limit', qid, limits)
        for method in ['highest', 'latest', 'first', 'average']:
            scenario(f'grading_{method}', 293, grading(method))
        scenario('permissions', 293, permissions)
        for name, payload in [('blank_answers', {}), ('non_dict_answers', []), ('unknown_question_and_invalid_option', {'2147483647': 'Z'})]:
            scenario(name, 293, answer_payload(payload))
        scenario('above_review_threshold_but_below_passing_score', 293, passing_score)
        for qid in [421, 316, 329, 330, 331, 332]:
            for ratio in [0, .5, .7, 1]:
                scenario(f'additional_quiz_score_{ratio * 100:g}_percent', qid, score_case(ratio))
            scenario('additional_quiz_lifecycle', qid, lifecycle)
    finally:
        with engine.connect() as conn:
            assert snapshot(conn) == before, 'Persistent learning data changed'
            assert [tuple(r) for r in conn.execute(text('SELECT id,max_attempts,duration,grading_method,passing_score FROM quizzes ORDER BY id'))] == settings_before
    report = {'student_id': 7, 'mode': 'local_mysql_testclient_user_dependency_override_all_writes_rolled_back', 'passed_scenarios': len(reports), 'learning_data_unchanged': True, 'quiz_settings_unchanged': True, 'scenarios': reports}
    (ROOT / 'docs/phuong-quiz-scenarios-results.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({'passed_scenarios': len(reports), 'learning_data_unchanged': True, 'quiz_settings_unchanged': True}))


if __name__ == '__main__':
    main()
