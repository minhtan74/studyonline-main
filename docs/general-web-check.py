"""Read-only API smoke checks with in-process identity overrides; no JWT minted."""
from pathlib import Path
import json,sys,time
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/'backend'))
from fastapi.testclient import TestClient
from sqlalchemy import text
from app.main import app
from app.core.database import engine
from app.core.dependencies import get_current_user,get_current_user_optional,get_viewer
from app.core.config import settings
report={'mode':'read_only_real_database_in_process_identity_override','checks':[],'errors':[]}
client=TestClient(app,raise_server_exceptions=False)
def check(role,path,expected=200):
 start=time.monotonic();response=client.get(path)
 row={'role':role,'path':path,'status':response.status_code,'expected':expected,'ms':round((time.monotonic()-start)*1000),'ok':response.status_code==expected}
 report['checks'].append(row)
 if not row['ok']:report['errors'].append(row)
 return response
with engine.connect() as connection:
 users={role:dict(connection.execute(text('SELECT id,fullname,email,role,is_active,token_version FROM users WHERE role=:role AND is_active=1 ORDER BY id LIMIT 1'),{'role':role}).mappings().one()) for role in ['student','teacher','admin']}
 # Prefer a learner with existing evidence; never create a user or attempt.
 student=connection.execute(text("SELECT u.id,u.fullname,u.email,u.role,u.is_active,u.token_version FROM users u JOIN results r ON r.user_id=u.id WHERE u.role='student' AND u.is_active=1 GROUP BY u.id ORDER BY COUNT(*) DESC LIMIT 1")).mappings().first()
 if student:users['student']=dict(student)
 for role,user in users.items():
  for dep in [get_current_user,get_current_user_optional,get_viewer]:app.dependency_overrides[dep]=lambda u=user:u
  paths=['/api/auth/me','/api/courses','/api/enrollments?ids_only=1','/api/progress','/api/progress?weekly=1','/api/progress?recent=1','/api/quizzes','/api/quizzes/results','/api/analytics/overview','/api/analytics/topics','/api/recommendations','/api/recommendations/progress','/api/payments','/api/ai/conversations','/api/ai/status']
  if role=='admin':paths+=['/api/users','/api/reports/summary','/api/reports/learning','/api/payments/manage']
  for path in paths:check(role,path)
  if role=='student':
   check(role,'/api/users',403);check(role,'/api/reports/summary',403)
   cid=connection.execute(text('SELECT course_id FROM enrollments WHERE user_id=:u LIMIT 1'),{'u':user['id']}).scalar()
   if cid:
    for path in [f'/api/chapters?course_id={cid}',f'/api/courses/materials?course_id={cid}',f'/api/recommendations?course_id={cid}']:check(role,path)
    lid=connection.execute(text('SELECT l.id FROM lessons l JOIN chapters ch ON ch.id=l.chapter_id WHERE ch.course_id=:c LIMIT 1'),{'c':cid}).scalar()
    if lid:check(role,f'/api/lessons?id={lid}')
   rid=connection.execute(text('SELECT id FROM results WHERE user_id=:u ORDER BY id DESC LIMIT 1'),{'u':user['id']}).scalar()
   if rid:check(role,f'/api/quizzes/results?id={rid}')
 app.dependency_overrides.clear()
 check('guest','/api/health');check('guest','/api/courses');check('guest','/api/auth/me',401);check('guest','/api/quizzes/results',401)
 report['config']={'runtime_mysql':settings.db_user=='studyonline_app','debug_off':not settings.app_debug,'llm_key_configured':bool(settings.llm_api_key),'vnpay_configured':bool(settings.vnpay_tmn_code and settings.vnpay_hash_secret)}
 from app.core.media import resolve_upload_path
 missing=[];checked=0
 for row in connection.execute(text('SELECT id,document_url,video_url FROM lessons')).mappings():
  for field in ('document_url','video_url'):
   path=resolve_upload_path(row[field])
   if path:
    checked+=1
    if not Path(path).is_file():missing.append({'lesson_id':row['id'],'kind':field})
 report['lesson_files']={'checked':checked,'missing':missing}
 report['schema']=connection.execute(text('SELECT version_num FROM alembic_version')).scalar()
 report['passed']=sum(row['ok'] for row in report['checks'])
Path(__file__).with_suffix('.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'passed':report['passed'],'total':len(report['checks']),'errors':report['errors'],'config':report['config'],'schema':report['schema'],'lesson_files':report['lesson_files']},ensure_ascii=True))
