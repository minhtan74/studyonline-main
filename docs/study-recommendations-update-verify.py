"""Verify exact-copy deduplication and submission snapshots, rolling back test data."""
from pathlib import Path
import json
import os
import sys
import uuid

ROOT=Path(__file__).resolve().parents[1]
BACKEND=ROOT/'backend'
sys.path.insert(0,str(BACKEND)); os.chdir(BACKEND)
from sqlalchemy import text
from sqlalchemy.orm import Session
from fastapi.testclient import TestClient
from app.core.database import engine,get_db
from app.core.dependencies import get_current_user,get_viewer
from app.main import app
from app.services import analytics_service as an,knowledge
from app.services.question_evidence import fingerprint
from training.course_release_20261031.expand_practice import protected,plan


def main():
    report={'cases':[],'authentication':'temporary_student_fixture_rolled_back'}
    with engine.connect() as conn:
        remaining,edits,lessons=plan(conn)
        assert not remaining and not edits and len(lessons)==36
        limit=conn.execute(text('SELECT MAX(id) FROM questions')).scalar_one()
        baseline=protected(conn,limit)
        transaction=conn.begin() if not conn.in_transaction() else conn.get_transaction()
        db=Session(bind=conn,join_transaction_mode='create_savepoint')
        old_overrides=dict(app.dependency_overrides)
        try:
            uid=conn.execute(text("INSERT INTO users(fullname,email,password,role,is_active) VALUES('Study evidence check',:e,:p,'student',1)"),
                dict(e='study-'+uuid.uuid4().hex+'@example.invalid',p='!disabled-'+uuid.uuid4().hex)).lastrowid
            fixture={'id':uid,'role':'student','fullname':'Study evidence check','email':'check@example.invalid'}
            def database(): yield db
            app.dependency_overrides[get_db]=database
            app.dependency_overrides[get_current_user]=lambda:fixture
            app.dependency_overrides[get_viewer]=lambda:fixture
            client=TestClient(app)
            course_ids=sorted({row['course_id'] for row in lessons})
            for cid in course_ids:
                conn.execute(text('INSERT INTO enrollments(user_id,course_id) VALUES(:u,:c)'),dict(u=uid,c=cid))
                target=next(row for row in lessons if row['course_id']==cid)
                lid=target['lesson_id']; review=target['quiz_id']
                metadata=conn.execute(text('SELECT chapter_id FROM lessons WHERE id=:l'),{'l':lid}).scalar_one()
                final=conn.execute(text('SELECT id FROM quizzes WHERE course_id=:c AND chapter_id IS NULL AND review_lesson_id IS NULL'),{'c':cid}).scalar_one()
                chapter_quiz=conn.execute(text('SELECT id FROM quizzes WHERE chapter_id=:ch'),{'ch':metadata}).scalar_one()
                def questions(quiz):
                    return [dict(r) for r in conn.execute(text('''SELECT q.*,ch.chapter_name,l.title AS lesson_name FROM questions q
                        JOIN chapters ch ON ch.id=q.knowledge_chapter_id JOIN lessons l ON l.id=q.knowledge_lesson_id
                        WHERE q.quiz_id=:q ORDER BY q.order_index,q.id'''),{'q':quiz}).mappings()]
                def legacy_result(quiz,rows,right):
                    correct=[bool(right(q,i)) for i,q in enumerate(rows)]
                    rid=conn.execute(text('INSERT INTO results(user_id,quiz_id,score,total,passing_score) VALUES(:u,:q,:s,:n,70)'),
                        dict(u=uid,q=quiz,s=sum(correct),n=len(rows))).lastrowid
                    for q,ok in zip(rows,correct):
                        conn.execute(text('''INSERT INTO result_answers(result_id,question_id,is_correct,topic_id,topic_name,classification_version,
                            knowledge_chapter_id,knowledge_lesson_id,knowledge_chapter_name,knowledge_lesson_name,knowledge_version)
                            VALUES(:r,:q,:ok,:tid,:topic,2,:ch,:l,:chn,:ln,2)'''),
                            dict(r=rid,q=q['id'],ok=int(ok),tid=q['topic_id'],topic=q['topic'],ch=q['knowledge_chapter_id'],
                                 l=q['knowledge_lesson_id'],chn=q['chapter_name'],ln=q['lesson_name']))
                    return rid
                legacy_result(final,questions(final),lambda q,i:True)
                chapter_rows=questions(chapter_quiz)
                legacy_result(chapter_quiz,chapter_rows,lambda q,i:q['knowledge_lesson_id']!=lid or i<3)
                practice_rows=questions(review)
                assert len(practice_rows)==10 and len({fingerprint(q) for q in practice_rows})==10
                originals=practice_rows[:5]
                legacy_result(review,originals,lambda q,i:i<2)
                topic_id=originals[0]['topic_id']
                topic=next(t for t in an.topics(db,uid,cid) if t['topic_id']==topic_id)
                lesson=next(u for u in knowledge.current(db,uid,cid)['units'] if u['kind']=='lesson' and u['id']==lid)
                assert (topic['answered'],topic['correct'])==(5,2),topic
                assert (lesson['answered'],lesson['correct'])==(5,2)
                assert lesson['identity_reconstructed'] and lesson['needs_review']
                report['cases'].append(dict(course_id=cid,case='same_five_questions_in_three_quizzes',raw_observations=15,distinct_questions=5,correct=2))
                for count in (6,7):
                    answers={str(q['id']):(q['correct_answer'] if i<count else next(letter for letter in 'ABCD' if letter!=q['correct_answer'])) for i,q in enumerate(practice_rows)}
                    response=client.post('/api/quizzes/submit',json={'quiz_id':review,'answers':answers})
                    assert response.status_code==200,response.text
                    body=response.json(); rid=body['result_id']
                    saved=conn.execute(text('SELECT question_fingerprint FROM result_answers WHERE result_id=:r'),{'r':rid}).scalars().all()
                    assert len(saved)==10 and all(value and len(value)==64 for value in saved)
                    lesson=next(u for u in knowledge.current(db,uid,cid)['units'] if u['kind']=='lesson' and u['id']==lid)
                    topic=next(t for t in an.topics(db,uid,cid) if t['topic_id']==topic_id)
                    assert lesson['answered']==10 and lesson['correct']==count
                    assert lesson['needs_review'] is (count<7)
                    assert topic['answered']==10 and topic['correct']==count
                    assert not lesson['identity_reconstructed']
                    report['cases'].append(dict(course_id=cid,case=f'{count}_of_10',percent=count*10,needs_review=count<7,snapshots_saved=10))
                legacy_result(review,originals[:3],lambda q,i:i<2)
                response=client.get('/api/recommendations',params={'course_id':cid})
                assert response.status_code==200,response.text
                data=response.json()['data']['current']
                lesson=next(u for u in data['based_on']['knowledge']['units'] if u['kind']=='lesson' and u['id']==lid)
                assert lesson['answered']==3 and lesson['correct']==2
                assert not lesson['sufficient_data'] and not lesson['needs_review']
                assert data['based_on']['min_topic_questions']==5 and data['based_on']['topic_review_threshold']==70
                report['cases'].append(dict(course_id=cid,case='2_of_3',sufficient=False,needs_review=False))
            report.update(lesson_reviews=36,questions_per_review=10,new_questions=180,passed=len(report['cases']))
        finally:
            app.dependency_overrides.clear();app.dependency_overrides.update(old_overrides)
            db.close();transaction.rollback()
        assert protected(conn,limit)==baseline,'Test fixtures were not fully rolled back'
        report['test_data_rolled_back']=True
    (ROOT/'docs/study-recommendations-update-api-results.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'passed':report['passed'],'lesson_reviews':36,'questions_per_review':10,'fixtures_rolled_back':True}))


if __name__=='__main__':
    if hasattr(sys.stdout,'reconfigure'):sys.stdout.reconfigure(encoding='utf-8')
    main()
