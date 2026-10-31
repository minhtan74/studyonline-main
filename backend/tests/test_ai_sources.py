"""Source files are authenticated, course-scoped and confined to document storage."""
import sys
import uuid
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text
from app.core.config import settings
from app.core.database import SessionLocal, q_one
from app.core.security import create_token
from app.main import app
from test_api import course, tokens

client = TestClient(app)


@pytest.fixture
def document(course, tokens, tmp_path, monkeypatch):
    monkeypatch.setattr(settings, 'upload_dir', str(tmp_path))
    folder = tmp_path / 'documents'; folder.mkdir()
    file = folder / 'source.pdf'; file.write_bytes(b'%PDF-1.4\nsource-test\n%%EOF')
    with SessionLocal() as db:
        sid = q_one(db, "SELECT id FROM users WHERE email='em.hoang@gmail.com'")['id']
        tid = q_one(db, "SELECT id FROM users WHERE email='an.nguyen@studyonline.vn'")['id']
        result = db.execute(text("INSERT INTO documents (course_id,uploaded_by,title,filename,file_path,file_type,status,pages) VALUES (:c,:u,'Test Source','source.pdf',:path,'pdf','indexed',3)"), {'c': course, 'u': tid, 'path': str(file)})
        did = int(result.lastrowid)
        db.execute(text('INSERT IGNORE INTO enrollments (user_id,course_id) VALUES (:u,:c)'), {'u': sid, 'c': course}); db.commit()
    try:
        yield {'id': did, 'course': course, 'student': sid, 'path': file, 'root': tmp_path,
               'headers': {role: {'Authorization': 'Bearer ' + value} for role, value in tokens.items()}}
    finally:
        with SessionLocal() as db:
            db.execute(text('DELETE FROM documents WHERE id=:id'), {'id': did})
            db.execute(text('DELETE FROM enrollments WHERE user_id=:u AND course_id=:c'), {'u': sid, 'c': course}); db.commit()


@pytest.mark.parametrize('kind', ['source', 'content'])
@pytest.mark.parametrize('role', ['student', 'teacher', 'admin'])
def test_authorized_roles(document, kind, role):
    d = document
    res = client.get(f'/api/ai/documents/{d["id"]}/{kind}', headers=d['headers'][role])
    assert res.status_code == 200
    if kind == 'source':
        data = res.json()['data']
        assert data['id'] == d['id'] and data['pages'] == 3 and data['file_type'] == 'pdf'
        assert 'file_path' not in data and str(d['root']) not in res.text
        assert res.headers['cache-control'] == 'no-store'
    else:
        assert res.content == d['path'].read_bytes()
        assert res.headers['content-type'] == 'application/pdf'
        assert res.headers['x-content-type-options'] == 'nosniff'
        assert 'no-store' in res.headers['cache-control']


@pytest.mark.parametrize('kind', ['source', 'content'])
def test_guest_and_other_course_users_blocked(document, kind):
    d = document
    url = f'/api/ai/documents/{d["id"]}/{kind}'
    assert client.get(url + '?uid=1&sig=fake').status_code == 401
    for email in ['phuong.vu@gmail.com', 'binh.tran@studyonline.vn']:
        token = client.post('/api/auth/login', json={'email': email, 'password': '123456'}).json()['token']
        assert client.get(url, headers={'Authorization': 'Bearer ' + token}).status_code == 403


def test_revoked_enrollment_checked_on_every_fetch(document):
    d = document
    assert client.get(f'/api/ai/documents/{d["id"]}/content', headers=d['headers']['student']).status_code == 200
    with SessionLocal() as db:
        db.execute(text('DELETE FROM enrollments WHERE user_id=:u AND course_id=:c'), {'u': d['student'], 'c': d['course']}); db.commit()
    for kind in ['source', 'content']:
        assert client.get(f'/api/ai/documents/{d["id"]}/{kind}', headers=d['headers']['student']).status_code == 403


@pytest.mark.parametrize('case', ['outside', 'traversal', 'missing', 'html'])
def test_unavailable_and_unsafe_paths_not_served(document, case):
    d = document
    outside = d['root'] / 'secret.txt'; outside.write_text('do not serve', encoding='utf-8')
    paths = {'outside': outside, 'traversal': d['root'] / 'documents' / '..' / 'secret.txt',
             'missing': d['root'] / 'documents' / 'missing.pdf', 'html': d['root'] / 'documents' / 'unsafe.html'}
    if case == 'html': paths[case].write_text('<script>alert(1)</script>', encoding='utf-8')
    with SessionLocal() as db:
        db.execute(text('UPDATE documents SET file_path=:path WHERE id=:id'), {'path': str(paths[case]), 'id': d['id']}); db.commit()
    for kind in ['source', 'content']:
        res = client.get(f'/api/ai/documents/{d["id"]}/{kind}', headers=d['headers']['admin'])
        assert res.status_code == 404 and str(d['root']) not in res.text


@pytest.mark.parametrize('extension,mime', [('txt', 'text/plain'), ('md', 'text/plain'), ('docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')])
def test_other_document_formats(document, extension, mime):
    d = document
    path = d['root'] / 'documents' / ('source.' + extension)
    path.write_bytes(b'<script>literal text</script>')
    with SessionLocal() as db:
        db.execute(text('UPDATE documents SET file_path=:path,filename=:filename WHERE id=:id'), {'path': str(path), 'filename': path.name, 'id': d['id']}); db.commit()
    res = client.get(f'/api/ai/documents/{d["id"]}/content', headers=d['headers']['student'])
    assert res.status_code == 200 and res.headers['content-type'].startswith(mime)
    assert res.content == path.read_bytes()
    if extension == 'docx': assert res.headers['content-disposition'].startswith('attachment')


def test_locked_user_and_deleted_document(document):
    d = document
    with SessionLocal() as db:
        result = db.execute(text("INSERT INTO users (fullname,email,password,role,is_active) VALUES ('Source Locked Test',:email,'unused','student',0)"), {'email': uuid.uuid4().hex + '@example.test'})
        uid = int(result.lastrowid); db.commit()
        user = q_one(db, 'SELECT * FROM users WHERE id=:id', id=uid)
    try:
        for kind in ['source', 'content']:
            assert client.get(f'/api/ai/documents/{d["id"]}/{kind}', headers={'Authorization': 'Bearer ' + create_token(user)}).status_code == 401
        with SessionLocal() as db:
            db.execute(text('DELETE FROM documents WHERE id=:id'), {'id': d['id']}); db.commit()
        assert client.get(f'/api/ai/documents/{d["id"]}/source', headers=d['headers']['admin']).status_code == 404
    finally:
        with SessionLocal() as db:
            db.execute(text('DELETE FROM users WHERE id=:id'), {'id': uid}); db.commit()
