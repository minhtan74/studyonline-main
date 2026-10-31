"""Password/JWT hardening against isolated data only."""
import sys
from pathlib import Path
import pytest
from sqlalchemy import create_engine,event,text
from sqlalchemy.orm import Session
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from app.core.security import hash_password,verify_password,create_token,decode_token
from app.core.config import settings,Settings
from scripts.hash_legacy_passwords import migrate


def test_only_bcrypt_passwords_are_accepted():
    hashed=hash_password('KeepMyPassword123!')
    assert verify_password('KeepMyPassword123!',hashed)
    assert not verify_password('WrongPassword',hashed)
    assert not verify_password('KeepMyPassword123!','KeepMyPassword123!')
    assert not verify_password(hashed,hashed)
    assert not verify_password('anything','$2b$broken')


@pytest.mark.parametrize('key',['','short','studyonline_super_secret_key_2026','replace_with_your_private_jwt_secret'])
def test_default_and_short_keys_rejected(key):
    with pytest.raises(ValueError):Settings(_env_file=None,jwt_secret=key)


def test_rotation_rejects_old_signature(monkeypatch):
    user={'id':999999,'fullname':'Isolated Test','email':'test@invalid','role':'student','token_version':0}
    monkeypatch.setattr(settings,'jwt_secret','isolated-test-key-one-12345678901234567890')
    old=create_token(user)
    assert decode_token(old)
    monkeypatch.setattr(settings,'jwt_secret','isolated-test-key-two-12345678901234567890')
    assert decode_token(old) is None
    assert decode_token(create_token(user))['id']==999999


def migration_db():
    engine=create_engine('sqlite://')
    @event.listens_for(engine,'before_cursor_execute',retval=True)
    def strip_lock(conn,cursor,statement,parameters,context,executemany):return statement.replace(' FOR UPDATE',''),parameters
    with engine.begin() as connection:connection.execute(text('CREATE TABLE users(id INTEGER PRIMARY KEY,password TEXT,token_version INTEGER DEFAULT 0)'))
    return engine


def test_legacy_conversion_preserves_password_and_is_idempotent():
    engine=migration_db();existing=hash_password('ExistingPass')
    with Session(engine) as db:
        db.execute(text('INSERT INTO users VALUES (1,:pw,2),(2,:hashed,4)'),{'pw':'LegacyPass','hashed':existing});db.commit()
        assert migrate(db)=={'accounts':2,'legacy':1,'converted':0}
        assert db.execute(text('SELECT password FROM users WHERE id=1')).scalar()=='LegacyPass'
        assert migrate(db,True)['converted']==1
        rows=db.execute(text('SELECT * FROM users ORDER BY id')).mappings().all()
        assert verify_password('LegacyPass',rows[0]['password']) and rows[0]['token_version']==3
        assert rows[1]['password']==existing and rows[1]['token_version']==4
        assert migrate(db,True)['converted']==0
    engine.dispose()


def test_unsupported_format_aborts_before_modifying_accounts():
    engine=migration_db()
    with Session(engine) as db:
        db.execute(text('INSERT INTO users VALUES (1,:pw,0),(2,:bad,0)'),{'pw':'LegacyPass','bad':'$unsupported$format'});db.commit()
        with pytest.raises(ValueError):migrate(db,True)
        db.rollback()
        assert db.execute(text('SELECT password FROM users WHERE id=1')).scalar()=='LegacyPass'
    engine.dispose()
