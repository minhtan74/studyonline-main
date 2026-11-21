"""Exercise real recommendation functions; export an interactive, DB-free report."""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'backend'))
from app.services import analytics_service as analytics, knowledge


def evidence(n, correct):
    return [dict(question_id=i + 1, result_id=1, is_correct=int(i < correct),
                 course_id=1, course_title='Khóa kiểm thử', chapter_id=10, lesson_id=20,
                 chapter_name='Chương kiểm thử', lesson_name='Bài kiểm thử', topic='Chủ đề kiểm thử',
                 topic_id=1, quiz_id=1, quiz_title='Quiz kiểm thử', submit_time='2026-11-05',
                 classification_version=2, knowledge_version=2, assessment_scope='course', question_fingerprint=f'case-{i}')
            for i in range(n)]


def outcome(n, correct):
    rows = evidence(n, correct)
    units = knowledge.summarize(rows)
    topics = analytics.summarize_topics(rows)
    if not n:
        assert units == [] and topics == []
        return [n, correct, None, 'Insufficient', 'Chưa có dữ liệu']
    score = round(correct * 100 / n, 1)
    expected_level = ('Weak' if score < 50 else 'Average' if score < 70 else 'Good' if score < 85 else 'Excellent') if n >= 5 else 'Insufficient'
    expected_review = n >= 5 and score < 70
    assert len(units) == 2
    for unit in units:
        assert unit['answered'] == n and unit['correct'] == correct
        assert unit['sufficient_data'] == (n >= 5)
        assert unit['needs_review'] == expected_review
        assert unit['avg_score'] == score
    assert topics[0]['status'] == expected_level
    display = 'Nên ôn tập' if expected_review else 'Cần kiểm tra thêm' if n < 5 and correct < n else 'Chưa đủ dữ liệu, chưa có câu sai' if n < 5 else 'Đạt ngưỡng ôn tập'
    return [n, correct, score, expected_level, display]


def main():
    cases = [outcome(n, correct) for n in range(101) for correct in range(n + 1)]
    rounding = [outcome(2000, c) for c in [998, 999, 1000, 1398, 1399, 1400, 1698, 1699, 1700]]
    presets = [(0, 0), (1, 0), (4, 0), (4, 4), (5, 0), (5, 3), (5, 4), (10, 6), (10, 7), (100, 49), (100, 50), (100, 69), (100, 70), (100, 84), (100, 85), (100, 100)]
    sample = [next(r for r in cases if r[:2] == list(p)) for p in presets]
    report = {'passed_combinations': len(cases), 'rounding_checks': len(rounding), 'sample_columns': ['total', 'correct', 'percent', 'topic_level', 'recommendation'], 'samples': sample, 'rounding_samples': rounding, 'no_database_access': True}
    (ROOT / 'docs/recommendation-threshold-results.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    template = (ROOT / 'backend/scripts/threshold-report-template.html').read_text(encoding='utf-8')
    public = ROOT / 'frontend/public'
    public.mkdir(exist_ok=True)
    (public / 'threshold-tests.html').write_text(template.replace('__CASES__', json.dumps(cases, ensure_ascii=False)).replace('__SAMPLES__', json.dumps(sample, ensure_ascii=False)), encoding='utf-8')
    print(json.dumps(report, ensure_ascii=True))


if __name__ == '__main__':
    main()
