"""Three assessment scopes, updated evidence, snapshots and authorized study actions."""
import pytest
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session
from app.core.responses import ApiError
from app.services import knowledge as kn, study_progress


def evidence(result_id, lesson_id, correct, count=6, chapter_id=10, start=1, course_id=1):
    return [dict(question_id=start+i, is_correct=int(i<correct), chapter_id=chapter_id, lesson_id=lesson_id,
        chapter_name=f'Chương {chapter_id}', lesson_name=f'Bài {lesson_id}', knowledge_version=2,
        result_id=result_id, submit_time=f'2026-10-{result_id:02} 10:00:00', quiz_id=result_id,
        quiz_title=f'Đề {result_id}', course_id=course_id, course_title='HĐH', assessment_scope='course') for i in range(count)]


def unit(units, kind, id):
    return next(u for u in units if u['kind']==kind and u['id']==id)


def test_new_lesson_practice_replaces_only_that_lesson_of_exam():
    exam=evidence(1,100,1)+evidence(1,101,3,start=10)
    updated=kn.summarize(exam+evidence(2,100,6,start=20))
    assert unit(updated,'lesson',100)['avg_score']==100
    assert unit(updated,'lesson',101)['correct']==3
    chapter=unit(updated,'chapter',10)
    assert (chapter['correct'],chapter['answered'])==(9,12)
    assert not chapter['needs_review']
    assert kn.summarize(exam,latest=False)[0]['needs_review']  # Stored exam remains unchanged.


def test_chapter_assessment_and_later_final_exam_replace_older_evidence():
    rows=evidence(1,100,0)+evidence(2,100,6,start=20)+evidence(3,100,2,start=40)
    latest=unit(kn.summarize(rows),'lesson',100)
    assert latest['correct']==2 and latest['answered']==6
    assert [s['result_id'] for s in latest['sources']]==[3]


def test_small_sample_is_uncertain_and_not_weak_even_zero_correct():
    result=unit(kn.summarize(evidence(1,100,0,count=2)),'lesson',100)
    assert not result['needs_review'] and result['status']=='Insufficient'
    result=unit(kn.summarize(evidence(1,100,0)),'lesson',100)
    assert result['needs_review']


def test_chapter_quiz_preserves_lesson_and_topic_specific_review():
    weak = evidence(1,100,2)
    good = evidence(1,101,6,start=20)
    for row in weak + good:
        row['assessment_scope'] = 'chapter'
        row['topic_name'] = 'Quản lý tài nguyên' if row['lesson_id'] == 100 else 'Phân loại hệ điều hành'
        row['classification_version'] = 2
    units = kn.summarize(weak + good, latest=False)
    lesson = unit(units,'lesson',100)
    assert lesson['needs_review']
    assert lesson['review_topics'][0]['title'] == 'Quản lý tài nguyên'
    assert lesson['review_topics'][0]['answered'] == 6
    assert lesson['review_guidance']['points']
    assert not unit(units,'lesson',101)['needs_review']
    assert unit(units,'lesson',101)['review_topics'] == []


def test_chapter_only_evidence_does_not_guess_a_lesson():
    rows = evidence(1,None,0)
    for row in rows:
        row['assessment_scope'] = 'chapter'
        row['topic_name'] = 'Quản lý tài nguyên'
    units = kn.summarize(rows, latest=False)
    assert len(units) == 1 and units[0]['kind'] == 'chapter'
    assert units[0]['review_topics'][0]['needs_review']
    assert 'review_guidance' not in units[0]


def test_specific_topics_use_saved_classification_and_separate_small_samples():
    rows = evidence(1,100,2) + evidence(1,100,0,count=2,start=20) + evidence(1,100,6,start=30)
    for row in rows:
        row['topic_name'] = 'Vòng lặp' if row['question_id'] < 20 else 'Điều kiện dừng' if row['question_id'] < 30 else 'Hàm'
        row['classification_version'] = 2
    topics = unit(kn.summarize(rows),'lesson',100)['review_topics']
    assert [t['title'] for t in topics] == ['Vòng lặp', 'Điều kiện dừng']
    assert topics[0]['needs_review'] and topics[0]['answered'] == 6
    assert not topics[1]['sufficient_data'] and not topics[1]['needs_review']
    assert unit(kn.summarize(rows * 2),'lesson',100)['review_topics'] == topics


def test_specific_topics_replace_old_evidence_and_do_not_guess_missing_names():
    old = evidence(1,100,0)
    for row in old:
        row['topic_name'] = 'Vòng lặp'
    assert unit(kn.summarize(old),'lesson',100)['review_topics'][0]['needs_review']
    newer = evidence(2,100,0,start=20)
    assert unit(kn.summarize(old + newer),'lesson',100)['review_topics'] == []


def test_specific_topic_at_threshold_does_not_trigger_review():
    rows = evidence(1,100,7,count=10)
    for row in rows:
        row['topic_name'] = 'Vòng lặp'
    assert unit(kn.summarize(rows),'lesson',100)['review_topics'] == []


def test_os_lesson_review_notes_do_not_invent_topic_scores():
    rows = evidence(1,100,2)
    for row in rows:
        row['lesson_name'] = 'Bài 1: Khái niệm về hệ điều hành'
    lesson = unit(kn.summarize(rows),'lesson',100)
    assert lesson['review_topics'] == []
    assert lesson['review_guidance']['scope'] == 'lesson'
    assert len(lesson['review_guidance']['points']) == 1
    assert lesson['unclassified_wrong_answers'] == 4
    assert lesson['wrong_topics'] == []
    assert 'review_guidance' not in unit(kn.summarize(rows),'chapter',10)
    assert unit(kn.summarize(evidence(1,100,2)),'lesson',100)['review_guidance']['source'] == 'wrong_answer_topics'


def test_wrong_answer_guidance_excludes_correct_topics_and_catalog_content():
    rows = evidence(1,100,2,count=5) + evidence(1,100,5,count=5,start=20)
    for row in rows:
        row['topic_name'] = 'Vòng lặp' if row['question_id'] < 20 else 'Rẽ nhánh'
    lesson = unit(kn.summarize(rows),'lesson',100)
    assert [(t['title'], t['wrong']) for t in lesson['wrong_topics']] == [('Vòng lặp',3)]
    assert lesson['unclassified_wrong_answers'] == 0
    assert all('Rẽ nhánh' not in p for p in lesson['review_guidance']['points'])


def test_wrong_topics_at_70_percent_are_reviewable_without_weak_label():
    rows = evidence(1,100,7,count=10)
    for row in rows:
        row['topic_name'] = 'Vòng lặp'
    lesson = unit(kn.summarize(rows),'lesson',100)
    assert not lesson['needs_review']
    assert lesson['review_topics'] == []
    assert lesson['wrong_topics'][0]['wrong'] == 3
    assert not lesson['wrong_topics'][0]['needs_review']


def test_wrong_topics_clear_after_latest_all_correct_attempt():
    old, new = evidence(1,100,0), evidence(2,100,6)
    for row in old + new:
        row['topic_name'] = 'Vòng lặp'
    lesson = unit(kn.summarize(old+new),'lesson',100)
    assert lesson['wrong_topics'] == []
    assert 'review_guidance' not in lesson


def test_small_sample_wrong_guidance_stays_insufficient_and_deduplicated():
    rows = evidence(1,100,0,count=2)
    for row in rows:
        row['topic_name'] = 'Vòng lặp'
    lesson = unit(kn.summarize(rows+rows),'lesson',100)
    assert lesson['wrong_topics'][0]['wrong'] == 2
    assert not lesson['wrong_topics'][0]['sufficient_data']
    assert not lesson['wrong_topics'][0]['needs_review']


def test_review_guidance_matches_course_and_uses_description_for_new_lessons():
    from app.services.review_guidance import lesson_review_guidance
    guide = lesson_review_guidance('Biến và kiểu dữ liệu', 'Python Cơ Bản Cho Người Mới Bắt Đầu')
    assert guide['source'].endswith('course1_python.md')
    assert len(guide['points']) >= 3
    fallback = lesson_review_guidance('Biến và kiểu dữ liệu', 'Khóa khác', '<p>Kiểu số và chuỗi.</p>')
    assert fallback['source'] == 'lesson_description'
    assert fallback['points'] == ['Kiểu số và chuỗi.']


def test_all_catalog_review_guides_have_nonempty_points_and_provenance():
    from app.services.review_guidance import _catalog
    catalog = _catalog()
    assert len(catalog) >= 137
    for key, guide in catalog.items():
        assert '::' in key and guide['source']
        assert 1 <= len(guide['points']) <= 5
        assert all(isinstance(point, str) and point.strip() for point in guide['points'])


def test_reclassified_same_question_is_not_counted_in_both_lessons():
    rows=evidence(1,100,0)+evidence(2,101,6)
    units=kn.summarize(rows)
    assert not any(u['kind']=='lesson' and u['id']==100 for u in units)
    assert unit(units,'chapter',10)['answered']==6


def test_same_titles_in_different_courses_are_separate_and_questions_are_distinct():
    rows=evidence(1,100,2)+evidence(2,100,6,course_id=2)
    assert len(kn.summarize(rows))==4
    assert unit(kn.summarize(evidence(1,100,1)*3),'lesson',100)['answered']==6


@pytest.fixture
def db():
    engine=create_engine('sqlite://')
    with Session(engine) as db:
        for ddl in [
            'CREATE TABLE chapters (id INT,course_id INT,chapter_name TEXT,order_index INT)',
            'CREATE TABLE lessons (id INT,title TEXT,chapter_id INT,order_index INT)',
            'CREATE TABLE enrollments (id INT,user_id INT,course_id INT)',
            'CREATE TABLE quizzes (id INT,course_id INT,review_lesson_id INT,chapter_id INT,lesson_id INT,max_attempts INT,duration INT)',
            'CREATE TABLE questions (id INT,quiz_id INT)',
            'CREATE TABLE quiz_attempts (id INT,user_id INT,quiz_id INT,result_id INT,finished_ts INT,started_ts INT)',
            'CREATE TABLE results (id INT,user_id INT,quiz_id INT)',
            'CREATE TABLE knowledge_study_checkpoints (id INTEGER PRIMARY KEY,user_id INT,course_id INT,unit_kind TEXT,unit_id INT,baseline TEXT,baseline_result_id INT)',
            "INSERT INTO chapters VALUES (10,1,'Chương 1',1),(20,2,'Chương 1',1)",
            "INSERT INTO lessons VALUES (100,'Bài 1: Khái niệm',10,1),(101,'Bài 2: Phân loại',10,2),(200,'Bài môn khác',20,1)",
            'INSERT INTO enrollments VALUES (1,1,1)',
            'INSERT INTO quizzes VALUES (1,1,100,NULL,NULL,1,NULL)',
            'INSERT INTO questions VALUES (1,1)',
        ]:
            db.execute(text(ddl))
        yield db
    engine.dispose()


def test_question_scope_validates_course_chapter_and_review_scope(db):
    assert kn.resolve(db,1,{'knowledge_lesson_id':100})==dict(knowledge_chapter_id=10,knowledge_lesson_id=100)
    for body, quiz in [({'knowledge_lesson_id':200},None), ({'knowledge_chapter_id':20},None),
                       ({'knowledge_chapter_id':20,'knowledge_lesson_id':100},None),
                       ({'knowledge_lesson_id':101},{'review_lesson_id':100}),
                       ({'knowledge_chapter_id':None},{'chapter_id':10})]:
        with pytest.raises(ApiError): kn.resolve(db,1,body,quiz)


def test_only_unambiguous_titles_are_reconstructed(db):
    assert kn.resolve(db,1,{'topic':'Phân loại'})['knowledge_lesson_id']==101
    assert kn.resolve(db,1,{'topic':'Loại hệ điều hành'})['knowledge_lesson_id'] is None
    assert kn.resolve(db,1,{'topic':'Chương 1'})['knowledge_chapter_id']==10
    assert kn.resolve(db,1,{}, {'review_lesson_id':100})['knowledge_lesson_id']==100
    assert kn.resolve(db,1,{}, {'chapter_id':10})['knowledge_chapter_id']==10
    db.execute(text("INSERT INTO lessons VALUES (102,'Bài 3: Phân loại',10,3)"))
    assert kn.resolve(db,1,{'topic':'Phân loại'})['knowledge_lesson_id'] is None


def test_edited_question_or_renamed_lesson_does_not_rewrite_saved_assessment(db):
    saved=kn.snapshot(db,dict(knowledge_chapter_id=10,knowledge_lesson_id=100),kn.outline(db,1))
    db.execute(text("UPDATE lessons SET title='Đã đổi' WHERE id=100"))
    assert saved['knowledge_lesson_name']=='Bài 1: Khái niệm'


def test_suggestions_merge_exam_chapter_and_lesson_into_one_action(db):
    units=kn.summarize(evidence(1,100,0)+evidence(2,100,1,start=20)+evidence(3,100,2,start=40))
    items=kn.suggestions(db,1,units)
    assert len(items)==1 and items[0]['action_url']=='/lesson?id=100'
    assert items[0]['practice_url']=='/quiz-show?id=1'
    assert items[0]['knowledge_evidence']['sources'][0]['result_id']==3
    deleted=kn.summarize([{**r,'chapter_available':0,'lesson_available':0} for r in evidence(1,100,0)])
    assert kn.suggestions(db,1,deleted)==[]


def test_weak_chapter_is_prioritized_when_each_lesson_has_too_few_questions(db):
    units=kn.summarize(evidence(1,100,0,count=3)+evidence(1,101,1,count=3,start=10))
    items=kn.suggestions(db,1,units)
    assert len(items)==1
    assert items[0]['knowledge_evidence']['kind']=='chapter'
    assert 'chapter_id=10' in items[0]['action_url']


def test_practice_respects_access_exhausted_and_resumable_attempts(db):
    assert kn.available_practice(db,2,1,'lesson',100)=={}
    db.execute(text('INSERT INTO results VALUES (1,1,1)'))
    assert kn.available_practice(db,1,1,'lesson',100)=={}
    db.execute(text('INSERT INTO quiz_attempts VALUES (1,1,1,NULL,NULL,9999999999)'))
    assert kn.available_practice(db,1,1,'lesson',100)['practice_label']=='Tiếp tục bài luyện'


def test_knowledge_checkpoint_deduplicates_clicks_and_rejects_other_users(db,monkeypatch):
    monkeypatch.setattr(kn,'current',lambda *args:dict(units=kn.summarize(evidence(1,100,2))))
    monkeypatch.setattr(study_progress,'execute',lambda session,sql,**params:session.execute(text(sql),params))
    first=study_progress.start_knowledge(db,1,1,'lesson',100)
    assert study_progress.start_knowledge(db,1,1,'lesson',100)==first
    with pytest.raises(ApiError): study_progress.start_knowledge(db,2,1,'lesson',100)
    with pytest.raises(ApiError): study_progress.start_knowledge(db,1,1,'lesson',999)
