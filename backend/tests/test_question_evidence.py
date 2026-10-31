"""Reused content is one observation; newest evidence and 5/70 boundaries."""
import pytest
from app.services import analytics_service as an, knowledge, study_progress
from app.services.question_evidence import fingerprint, independent_answers
from training.course_release_20261031.practice_bank_v2 import BANK
from training.course_release_20261031.manage import courses


def row(question_id=1, result_id=1, correct=1, course_id=1, content='Bài toán 1', **extra):
    return dict(question_id=question_id,result_id=result_id,is_correct=correct,course_id=course_id,
        question_content=content,option_a='Một',option_b='Hai',option_c='Ba',option_d='Bốn',
        topic='Dữ liệu',topic_id=4,course_title='Khóa',quiz_id=result_id,quiz_title=f'Đề {result_id}',submit_time='2026-10-31',
        classification_version=2,knowledge_version=2,chapter_id=10,lesson_id=20,chapter_name='Chương 1',lesson_name='Bài 1',assessment_scope='lesson',**extra)


def test_fingerprint_ignores_option_order_but_preserves_code_and_data_semantics():
    base = row()
    swapped = {**base,'option_a':base['option_d'],'option_d':base['option_a']}
    assert fingerprint(base) == fingerprint(swapped)
    assert fingerprint(row(content="print('a  b')")) != fingerprint(row(content="print('a b')"))
    assert fingerprint(row(content='User')) != fingerprint(row(content='user'))
    assert fingerprint({'question_id':1}) is None


def test_three_quizzes_reusing_five_questions_count_five_with_latest_answers():
    rows = [row(question_id=result*100+i,result_id=result,correct=int(i<2 if result==3 else True),content=f'Tình huống {i}')
            for result in (1,2,3) for i in range(5)]
    topic = an.summarize_topics(list(reversed(rows)))[0]
    assert (topic['answered'],topic['correct'],topic['avg_score']) == (5,2,40)
    assert topic['status']=='Weak' and [s['result_id'] for s in topic['sources']]==[3]
    units = knowledge.summarize(rows)
    assert all((u['answered'],u['correct'])==(5,2) for u in units)
    assert all(sum(s['answered'] for s in u['sources'])==u['answered'] for u in units)


def test_conflicting_duplicate_in_one_submission_conservatively_counts_wrong_once():
    rows=[row(1,correct=1),row(2,correct=0)]
    for values in (rows,list(reversed(rows))):
        assert an.summarize_topics(values)[0]['correct']==0
        unit=knowledge.summarize(values,latest=False)[0]
        assert unit['answered']==1 and unit['correct']==0
        assert sum(s['answered'] for s in unit['sources'])==1


def test_saved_fingerprint_survives_question_edits_and_option_shuffles():
    frozen=fingerprint(row())
    old={**row(), 'question_fingerprint':frozen}
    copy={**row(8,result_id=2,correct=0,content='Live content edited'), 'question_fingerprint':frozen}
    assert len(independent_answers([old,copy]))==1
    assert independent_answers([old,copy])[0]['question_id']==8


def test_same_physical_question_reclassified_is_not_resurrected_by_an_old_fingerprint():
    old={**row(), 'question_fingerprint':fingerprint(row())}
    changed={**row(result_id=2,content='New version'), 'lesson_id':30,'question_fingerprint':fingerprint(row(content='New version'))}
    units=knowledge.summarize([old,changed])
    assert not any(u['kind']=='lesson' and u['id']==20 for u in units)
    assert next(u for u in units if u['kind']=='lesson')['id']==30


def test_same_content_in_two_courses_stays_separate():
    assert len(an.summarize_topics([row(),row(course_id=2)]))==2


@pytest.mark.parametrize('count,correct,review,sufficient',[(4,0,False,False),(4,4,False,False),(5,3,True,True),
    (5,4,False,True),(10,6,True,True),(10,7,False,True),(10,10,False,True)])
def test_concrete_question_boundaries(count,correct,review,sufficient):
    values=[row(question_id=i+1,content=f'Question {i}',correct=int(i<correct)) for i in range(count)]
    result=next(u for u in knowledge.summarize(values) if u['kind']=='lesson')
    assert result['needs_review'] is review and result['sufficient_data'] is sufficient
    assert result['answered']==count


def test_before_after_recognizes_reused_questions_even_if_the_quiz_ids_change():
    before=an.summarize_topics([row(i+1,content=f'Q{i}') for i in range(5)])[0]
    after=an.summarize_topics([row(i+101,result_id=2,content=f'Q{i}') for i in range(5)])[0]
    assert before['question_ids']!=after['question_ids']
    assert study_progress.comparison(before,after)['same_questions'] is True
    assert study_progress.comparison({**before,'question_keys':[]},after)['same_questions'] is False


def test_application_bank_adds_five_distinct_questions_for_every_lesson():
    total=0
    for course in courses():
        original={fingerprint(dict(content=q['prompt'],**{'option_'+letter:q['options'][i] for i,letter in enumerate('abcd')}))
                  for ch in course['chapters'] for l in ch['lessons'] for q in l['questions']}
        seen=set()
        for ch_no,ch in enumerate(course['chapters'],1):
            for l_no,_ in enumerate(ch['lessons'],1):
                questions=BANK[course['slug']][f'{ch_no}.{l_no}']
                assert len(questions)==5
                for question in questions:
                    assert len(set(question['options']))==4 and question['explanation']
                    key=fingerprint(dict(content=question['prompt'],**{'option_'+letter:question['options'][i] for i,letter in enumerate('abcd')}))
                    assert key not in original and key not in seen
                    seen.add(key); total+=1
        assert len(seen)==60
    assert total==180
