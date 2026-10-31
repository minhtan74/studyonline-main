"""Real MySQL lifecycle in an outer rollback transaction; temporary users only."""
from pathlib import Path
import json,sys,uuid
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'backend'))
from sqlalchemy import text
from sqlalchemy.orm import Session
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import engine,get_db
from app.core.dependencies import get_current_user,get_current_user_optional,get_viewer
from app.core.security import hash_password
checks=[];errors=[]
connection=engine.connect();outer=connection.begin()
db=Session(bind=connection,join_transaction_mode='create_savepoint')
client=TestClient(app,raise_server_exceptions=False)
tag='deep-audit-'+uuid.uuid4().hex
userids=[]
def provide_db():yield db
app.dependency_overrides[get_db]=provide_db

def check(name,value):
    checks.append({'name':name,'ok':bool(value)})
    if not value:raise AssertionError(name)
def request(method,path,body=None,token=None,status=200):
    response=client.request(method,path,json=body,headers={'Authorization':'Bearer '+token} if token else {})
    check(method+' '+path+' expected '+str(status)+' actual '+str(response.status_code)+' '+(response.json().get('message','') if response.status_code!=status else ''),response.status_code==status)
    return response.json()
def identity(user=None):
    for dep in (get_current_user,get_current_user_optional,get_viewer):
        if user:app.dependency_overrides[dep]=lambda u=user:u
        else:app.dependency_overrides.pop(dep,None)
try:
    for role in ('teacher','student'):
        result=db.execute(text('INSERT INTO users(fullname,email,password,role,is_active) VALUES (:name,:email,:pw,:role,1)'),{'name':'Temporary Audit','email':tag+'-'+role+'@example.test','pw':hash_password('AuditOld123!'),'role':role})
        userids.append(result.lastrowid)
    db.commit()
    teacher=dict(db.execute(text('SELECT * FROM users WHERE id=:id'),{'id':userids[0]}).mappings().one())
    identity(teacher)
    cid=request('POST','/api/courses',{'title':tag,'description':'Isolated transaction','status':'published','price':0})['id']
    ch=request('POST','/api/chapters',{'course_id':cid,'chapter_name':'Chương 1: Kiểm thử'})['id']
    lid=request('POST','/api/lessons',{'chapter_id':ch,'title':'Bài 1: Kiểm thử','description':'Temporary audit','video_url':'','document_url':''})['id']
    qlesson=request('POST','/api/lessons/review',{'lesson_id':lid})['data']['quiz_id']
    qchapter=request('POST','/api/chapters/review',{'chapter_id':ch})['data']['quiz_id']
    qcourse=request('POST','/api/quizzes',{'course_id':cid,'title':'Quiz khóa','duration':0,'max_attempts':0,'passing_score':70})['id']
    for qz in (qlesson,qchapter,qcourse):
        for i in range(5):
            request('POST','/api/quizzes/questions',{'quiz_id':qz,'content':f'Câu độc lập {qz}-{i}?','option_a':'Đúng','option_b':'Sai','correct_answer':'A','knowledge_chapter_id':ch,'knowledge_lesson_id':lid})
    identity()
    email=tag+'-student@example.test'
    token=request('POST','/api/auth/login',{'email':email,'password':'AuditOld123!'})['token']
    request('GET',f'/api/quizzes/questions?quiz_id={qcourse}',token=token,status=403)
    request('POST','/api/enrollments',{'course_id':cid},token)
    request('POST','/api/enrollments',{'course_id':cid},token,status=409)
    request('GET',f'/api/lessons?id={lid}',token=token)
    request('POST','/api/progress',{'lesson_id':lid,'watched_sec':60,'is_completed':1},token)
    check('Completed lesson persisted inside transaction',lid in request('GET',f'/api/progress?course_id={cid}',token=token)['data'])
    for scope,qz in [('lesson',qlesson),('chapter',qchapter),('course',qcourse)]:
        opened=request('GET',f'/api/quizzes/questions?quiz_id={qz}',token=token)
        rows=opened['data']
        check(scope+' hides correct answers',all('correct_answer' not in r for r in rows))
        result=request('POST','/api/quizzes/submit',{'quiz_id':qz,'attempt_token':opened.get('attempt_token'),'answers':{str(r['id']):next(k for k in 'ABCD' if r.get('option_'+k.lower())=='Sai') for r in rows}},token)
        check(scope+' records five answers',result['total']==5 and result['score']==0 and bool(result['result_id']))
        check(scope+' recommends assessed lesson',any(u['kind']=='lesson' and u['id']==lid and u['needs_review'] for u in result['knowledge']['units']))
        request('GET',f"/api/quizzes/results?id={result['result_id']}",token=token)
    request('GET',f'/api/recommendations?course_id={cid}',token=token)
    changed=request('POST','/api/auth/change-password',{'old_password':'AuditOld123!','new_password':'AuditNew456!'},token)
    request('GET','/api/auth/me',token=token,status=401)
    token=changed['token'];request('GET','/api/auth/me',token=token)
    request('POST','/api/auth/login',{'email':email,'password':'AuditOld123!'},status=401)
    request('POST','/api/auth/logout',token=token)
    request('GET','/api/auth/me',token=token,status=401)
    fresh=request('POST','/api/auth/login',{'email':email,'password':'AuditNew456!'})['token']
    request('GET','/api/auth/me',token=fresh)
except Exception as exc:
    errors.append(type(exc).__name__+': '+str(exc))
finally:
    app.dependency_overrides.clear();db.close();outer.rollback();connection.close()
with engine.connect() as verify:
    check('No temporary users persisted',verify.execute(text('SELECT COUNT(*) FROM users WHERE email LIKE :tag'),{'tag':tag+'%'}).scalar()==0)
    check('No temporary courses persisted',verify.execute(text('SELECT COUNT(*) FROM courses WHERE title=:tag'),{'tag':tag}).scalar()==0)
report={'mode':'real_mysql_outer_rollback_no_external_services','passed':sum(c['ok'] for c in checks),'checks':checks,'errors':errors}
Path(__file__).with_suffix('.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'passed':report['passed'],'errors':errors},ensure_ascii=True))
if errors:sys.exit(1)
