"""Live AI check: existing lesson context, temporary conversation rolled back, no quiz approval."""
from pathlib import Path
import json,sys,time,uuid,os,logging
os.environ.setdefault('HF_HUB_OFFLINE','1')
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'backend'))
from sqlalchemy import text
from sqlalchemy.orm import Session
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import engine,get_db
from app.core.dependencies import get_current_user
from app.core.security import hash_password
from app.ai import model_manager,quiz_generator
from app.core.responses import ApiError

ROOT=Path(__file__).resolve().parent
report={'provider':model_manager.info(),'course_id':894,'lesson_id':399,'client_requested_questions':40,'llm_calls':[],'qa':[],'errors':[]}
original=model_manager.generate

def measured(*args,**kwargs):
    if len(report['llm_calls'])>=8:raise RuntimeError('Live audit call budget exceeded')
    start=time.monotonic();response=original(*args,**kwargs)
    report['llm_calls'].append({'seconds':round(time.monotonic()-start,2),'max_tokens':kwargs.get('max_tokens'),'response_chars':len(response),'service_error':response.startswith('[Lỗi gọi LLM')})
    return response
model_manager.generate=measured
connection=engine.connect();outer=connection.begin();db=Session(bind=connection,join_transaction_mode='create_savepoint')
client=TestClient(app,raise_server_exceptions=False)
def provide_db():yield db
app.dependency_overrides[get_db]=provide_db
marker='ai-live-audit-'+uuid.uuid4().hex
try:
    teacher=db.execute(text('SELECT u.id,u.role FROM users u JOIN courses c ON c.teacher_id=u.id WHERE c.id=894')).mappings().one()
    app.dependency_overrides[get_current_user]=lambda:dict(teacher)
    start=time.monotonic()
    response=client.post('/api/ai/generate-quiz',json={'course_id':894,'lesson_id':399,'number_of_questions':40,'difficulty':'medium'})
    payload=response.json();report['generation']={'status':response.status_code,'seconds':round(time.monotonic()-start,2)}
    if response.status_code==200:
        draft=payload['data'];questions=draft.get('questions',[])
        report['generation'].update(meta=draft.get('meta'),returned=len(questions),unique_prompts=len({quiz_generator._norm(q['question']) for q in questions}),invalid_questions=sum(not all(str(q.get('options',{}).get(k,'')).strip() for k in 'ABCD') or q.get('correct_answer') not in 'ABCD' for q in questions),duplicate_options=sum(len({quiz_generator._norm(q['options'][k]) for k in 'ABCD'})<4 for q in questions))
        (ROOT/'ai-live-40-draft.json').write_text(json.dumps(draft,ensure_ascii=False,indent=2),encoding='utf-8')
    else:report['generation']['message']=payload.get('message')
    print(json.dumps({'stage':'generation','status':response.status_code,'returned':report['generation'].get('returned'),'seconds':report['generation']['seconds']}),flush=True)
    uid=db.execute(text("INSERT INTO users(fullname,email,password,role,is_active) VALUES ('Temporary AI audit',:email,:pw,'student',1)"),{'email':marker+'@example.test','pw':hash_password('TemporaryAudit123!')}).lastrowid
    db.execute(text('INSERT INTO enrollments(user_id,course_id) VALUES (:u,894)'),{'u':uid});db.commit()
    app.dependency_overrides[get_current_user]=lambda:{'id':uid,'role':'student'}
    conversation=None
    cases=[('grounded','Working tree, staging area và repository trong Git khác nhau thế nào? Lệnh nào chuyển thay đổi giữa ba vùng?'),('follow_up','Nếu sửa file sau khi git add thì commit có chứa phần sửa mới đó không?'),('out_of_scope','Giá vàng hôm nay là bao nhiêu?'),('clarification','Sửa lỗi giúp tôi')]
    for name,message in cases:
        body={'course_id':894,'lesson_id':399,'message':message}
        if name=='follow_up' and conversation:body['conversation_id']=conversation
        start=time.monotonic();r=client.post('/api/ai/chat',json=body);p=r.json();data=p.get('data',{})
        if name=='grounded':conversation=data.get('conversation_id')
        report['qa'].append({'case':name,'question':message,'status':r.status_code,'seconds':round(time.monotonic()-start,2),'answer':data.get('answer'),'sources':data.get('sources'),'response_status':data.get('response_status'),'used_context':data.get('used_context'),'needs_clarification':data.get('needs_clarification'),'error_code':data.get('error_code'),'message':p.get('message')})
        print(json.dumps({'stage':'qa','case':name,'status':r.status_code,'seconds':report['qa'][-1]['seconds']}),flush=True)
except Exception as exc:
    report['errors'].append(type(exc).__name__)
finally:
    model_manager.generate=original;app.dependency_overrides.clear();db.close();outer.rollback();connection.close()
with engine.connect() as verify:
    report['temporary_users_remaining']=verify.execute(text('SELECT COUNT(*) FROM users WHERE email=:email'),{'email':marker+'@example.test'}).scalar()
report['quiz_approved']=False
(ROOT/'ai-live-check-20261101.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'done':True,'errors':report['errors'],'llm_calls':len(report['llm_calls']),'temporary_users_remaining':report['temporary_users_remaining']}),flush=True)
