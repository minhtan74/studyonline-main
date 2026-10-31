"""Session revocation against an isolated SQLite database, never production users."""
import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine,event,text
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from app.main import app
from app.core.database import get_db
from app.core.security import hash_password,verify_password
from app.routers import auth

@pytest.fixture
def client():
    engine=create_engine('sqlite://',connect_args={'check_same_thread':False},poolclass=StaticPool)
    # SQLite has no row locks. MySQL uses FOR UPDATE unchanged in production.
    @event.listens_for(engine,'before_cursor_execute',retval=True)
    def sqlite_lock_syntax(conn,cursor,statement,parameters,context,executemany):
        return statement.replace(' FOR UPDATE',''),parameters
    with engine.begin() as connection:
        connection.execute(text('CREATE TABLE users (id INTEGER PRIMARY KEY, fullname TEXT, email TEXT, role TEXT, is_active INTEGER, password TEXT, token_version INTEGER DEFAULT 0)'))
        for i,role in enumerate(['student','teacher','admin'],1):
            connection.execute(text('INSERT INTO users VALUES (:id,:name,:email,:role,1,:password,0)'),{'id':i,'name':'Test User','email':role+'@test.invalid','role':role,'password':hash_password('OldPass123!')})
    def db():
        with Session(engine) as session:yield session
    previous=dict(app.dependency_overrides)
    app.dependency_overrides[get_db]=db
    try:yield TestClient(app,raise_server_exceptions=False),engine
    finally:
        app.dependency_overrides.clear();app.dependency_overrides.update(previous);engine.dispose()

def login(client,role='student',password='OldPass123!'):
    return client.post('/api/auth/login',json={'email':role+'@test.invalid','password':password})
def headers(token):return {'Authorization':'Bearer '+token}

@pytest.mark.parametrize('role',['student','teacher','admin'])
def test_password_change_revokes_old_tokens_and_keeps_new_session(client,role):
    api,engine=client;old=login(api,role).json()['token']
    response=api.post('/api/auth/change-password',headers=headers(old),json={'old_password':'OldPass123!','new_password':'NewPass456!'})
    assert response.status_code==200
    fresh=response.json()['token'];assert fresh!=old
    assert api.get('/api/auth/me',headers=headers(old)).status_code==401
    assert api.get('/api/auth/me',headers=headers(fresh)).status_code==200
    assert login(api,role).status_code==401
    assert login(api,role,'NewPass456!').status_code==200
    with engine.connect() as connection:
        row=connection.execute(text('SELECT token_version,password,role,is_active FROM users WHERE email=:email'),{'email':role+'@test.invalid'}).mappings().one()
        assert row['token_version']==1 and verify_password('NewPass456!',row['password'])
        assert row['role']==role and row['is_active']==1

@pytest.mark.parametrize('role',['student','teacher','admin'])
def test_logout_revokes_all_old_tokens_and_allows_new_login(client,role):
    api,engine=client;old=login(api,role).json()['token']
    assert api.post('/api/auth/logout',headers=headers(old)).status_code==200
    assert api.get('/api/auth/me',headers=headers(old)).status_code==401
    assert api.post('/api/auth/logout',headers=headers(old)).status_code==401
    fresh=login(api,role).json()['token']
    assert fresh!=old and api.get('/api/auth/me',headers=headers(fresh)).status_code==200

@pytest.mark.parametrize('body',[{'old_password':'Wrong','new_password':'NewPass456!'},{'old_password':'OldPass123!','new_password':'x'}])
def test_invalid_change_does_not_revoke_or_change_password(client,body):
    api,engine=client;old=login(api).json()['token']
    assert api.post('/api/auth/change-password',headers=headers(old),json=body).status_code==400
    assert api.get('/api/auth/me',headers=headers(old)).status_code==200
    assert login(api).status_code==200

def test_logout_requires_authentication(client):
    api,engine=client
    assert api.post('/api/auth/logout').status_code==401
    assert api.post('/api/auth/logout',headers=headers('invalid')).status_code==401
    with engine.connect() as connection:assert connection.execute(text('SELECT SUM(token_version) FROM users')).scalar()==0

def test_failed_write_leaves_old_password_and_token_valid(client,monkeypatch):
    api,engine=client;old=login(api).json()['token']
    def fail(*a,**kw):raise RuntimeError('simulated database failure')
    monkeypatch.setattr(auth,'execute',fail)
    assert api.post('/api/auth/change-password',headers=headers(old),json={'old_password':'OldPass123!','new_password':'NewPass456!'}).status_code==500
    assert api.get('/api/auth/me',headers=headers(old)).status_code==200
    assert login(api).status_code==200

def test_media_signature_bound_to_session_version():
    import time
    from app.core.media import signed_src,verify
    from urllib.parse import urlsplit,parse_qs
    link=signed_src({'id':1,'token_version':3},{'id':7,'document_url':'/uploads/documents/test.pdf'},'document')
    query=parse_qs(urlsplit(link).query)
    assert verify(1,7,'document',int(query['exp'][0]),query['sig'][0],3)
    assert not verify(1,7,'document',int(query['exp'][0]),query['sig'][0],4)
    assert not verify(1,7,'document',int(time.time())-1,query['sig'][0],3)


def test_concurrent_stale_password_request_cannot_overwrite_new_password(client):
    from app.core.responses import ApiError
    api,engine=client
    # Represents a request authenticated before another request commits a change.
    with Session(engine) as db:
        db.execute(text('UPDATE users SET token_version=1 WHERE id=1'));db.commit()
        with pytest.raises(ApiError) as error:
            auth.change_password({'old_password':'OldPass123!','new_password':'StalePass456!'}, {'id':1,'token_version':0},db)
        assert error.value.status==401
    assert login(api).status_code==200
