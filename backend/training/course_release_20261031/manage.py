"""Build, validate, index and atomically add the 31/10/2026 course release.

From backend: .venv/Scripts/python.exe training/course_release_20261031/manage.py
Phases: prepare, build, check, projects, index, apply, verify. No writes to existing lessons,
quizzes, learner records or existing documents. Preparation records their hashes.
"""
from __future__ import annotations

import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
import hashlib
import html
import importlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile

HERE = Path(__file__).resolve().parent
BACKEND = HERE.parents[1]
sys.path.insert(0, str(BACKEND))
os.chdir(BACKEND)

from sqlalchemy import inspect, text
from pypdf import PdfReader
from app.core.config import settings
from app.core.database import engine
from app.services.analytics_service import normalize_topic
from app.services.material_names import numbered_title, safe_filename
from training.course_release_20261031.legacy_guides import handbook
from training.lesson_docs.build_pdfs import CSS, find_chrome

OUT = HERE / 'generated'
MANIFEST = OUT / 'manifest.json'
MODULES = ('course_git', 'course_python_oop', 'course_fastapi')
PROTECTED = ('users', 'courses', 'chapters', 'lessons', 'quizzes', 'questions', 'course_topics',
             'documents', 'document_chunks', 'results', 'result_answers', 'enrollments',
             'lesson_progress', 'payments', 'ai_conversations', 'ai_messages')


def dump(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2, default=str), encoding='utf-8')


def digest(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def load():
    return json.loads(MANIFEST.read_text(encoding='utf-8'))


def courses():
    return [importlib.import_module('training.course_release_20261031.' + name).COURSE for name in MODULES]


def validate_course(course):
    assert course['slug'] and course['title'] and len(course['chapters']) == 6
    assert len(course['outcomes']) >= 3 and course['prerequisites'] and len(course['handbook']) > 2500
    prompts = set()
    for chapter in course['chapters']:
        assert len(chapter['lessons']) == 2
        for lesson in chapter['lessons']:
            assert len(lesson['body']) >= 3500, lesson['title']
            assert len(lesson['body'].encode('utf-8')) < 60000, lesson['title']
            assert len(lesson['objectives']) >= 3 and len(lesson['questions']) == 5
            assert 'https://' in lesson['body'], lesson['title']
            assert lesson['body'].count('```') % 2 == 0, lesson['title']
            for q in lesson['questions']:
                assert q['prompt'] not in prompts, q['prompt']
                prompts.add(q['prompt'])
                assert len(q['options']) == 4 and len(set(q['options'])) == 4
                assert isinstance(q['correct'], int) and 0 <= q['correct'] < 4
                assert q['explanation'] and q['difficulty'] in ('easy', 'medium', 'hard')
    for name in course.get('project_files', {}):
        target = (OUT / 'projects' / course['slug'] / name).resolve()
        assert target.is_relative_to((OUT / 'projects' / course['slug']).resolve()), name


def protected_snapshot(bounds=None):
    result = {}
    inspector = inspect(engine)
    with engine.connect() as conn:
        for table in PROTECTED:
            keys = inspector.get_pk_constraint(table)['constrained_columns']
            if not keys:
                raise ValueError('Missing primary key: ' + table)
            anchor = keys[0]
            last = bounds[table]['last'] if bounds else conn.execute(text(f'SELECT COALESCE(MAX({anchor}),0) FROM {table}')).scalar_one()
            rows = conn.execute(text(f'SELECT * FROM {table} WHERE {anchor}<=:last ORDER BY {",".join(keys)}'), {'last': last}).mappings()
            checksum = hashlib.sha256()
            count = 0
            for row in rows:
                checksum.update(json.dumps(dict(row), ensure_ascii=False, sort_keys=True, default=str).encode('utf-8'))
                count += 1
            result[table] = dict(last=last, count=count, sha256=checksum.hexdigest())
    return result


def inline(value):
    value = html.escape(value, quote=False)
    value = re.sub(r'`([^`]+)`', r'<code>\1</code>', value)
    value = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', value)
    return re.sub(r'\[([^\]]+)\]\((https://[^\s)]+)\)', r'<a href="\2">\1</a>', value)


def markdown(body):
    lines = body.splitlines()
    output = []
    i = 0
    while i < len(lines):
        line = lines[i]
        if line.startswith('```'):
            code = []
            i += 1
            while i < len(lines) and not lines[i].startswith('```'):
                code.append(lines[i]); i += 1
            output.append('<pre><code>' + html.escape('\n'.join(code)) + '</code></pre>')
        elif re.match(r'^#{1,4} ', line):
            heading, content = line.split(' ', 1)
            level = min(len(heading), 3)
            output.append(f'<h{level}>' + inline(content) + f'</h{level}>')
        elif re.match(r'^\s*[-*] ', line) or re.match(r'^\d+\. ', line):
            ordered = bool(re.match(r'^\d+\. ', line))
            tag = 'ol' if ordered else 'ul'
            items = []
            pattern = r'^\d+\. ' if ordered else r'^\s*[-*] '
            while i < len(lines) and re.match(pattern, lines[i]):
                items.append('<li>' + inline(re.sub(pattern, '', lines[i])) + '</li>'); i += 1
            output.append(f'<{tag}>' + ''.join(items) + f'</{tag}>')
            continue
        elif line.strip().startswith('|'):
            table_rows = []
            while i < len(lines) and lines[i].strip().startswith('|'):
                cells = [s.strip() for s in lines[i].strip().strip('|').split('|')]
                if not all(re.fullmatch(r':?-+:?', s.replace(' ', '')) for s in cells):
                    tag = 'th' if not table_rows else 'td'
                    table_rows.append('<tr>' + ''.join(f'<{tag}>' + inline(s) + f'</{tag}>' for s in cells) + '</tr>')
                i += 1
            output.append('<table>' + ''.join(table_rows) + '</table>')
            continue
        elif line.strip():
            output.append('<p>' + inline(line) + '</p>')
        i += 1
    return '\n'.join(output)


def html_document(title, course_title, body):
    extra = '''h1{font-size:21pt}h3{font-size:11.5pt;color:#1e3a8a;margin:13pt 0 4pt;break-after:avoid}pre{font-size:8.5pt;line-height:1.5;break-inside:auto;page-break-inside:auto}pre code{font-size:8.5pt}table{width:100%;border-collapse:collapse;font-size:9pt}td,th{padding:5pt;border:1px solid #cbd5e1;text-align:left}a{color:#1d4ed8;overflow-wrap:anywhere}p,li{orphans:3;widows:3}'''
    return '<!doctype html><html lang="vi"><meta charset="utf-8"><style>' + CSS + extra + '</style><body><div class="tag">' + html.escape(course_title) + '</div><h1>' + html.escape(title) + '</h1><p class="sub">Tài liệu học tập StudyOnline · Biên soạn 31/10/2026</p>' + markdown(body) + '</body></html>'


def prepare():
    if MANIFEST.exists():
        raise RuntimeError('Release manifest already exists; resume its remaining phases.')
    incoming = courses()
    for course in incoming:
        validate_course(course)
    with engine.connect() as conn:
        existing = [dict(r) for r in conn.execute(text('SELECT id,title,slug,teacher_id FROM courses ORDER BY id')).mappings()
                    if not r['title'].upper().startswith('PYTEST')]
        if any(c['slug'] in {x['slug'] for x in existing} for c in incoming):
            raise RuntimeError('One of the new course slugs already exists; do not duplicate it.')
        chapters = [dict(r) for r in conn.execute(text('SELECT id,course_id,chapter_name,order_index FROM chapters ORDER BY course_id,order_index,id')).mappings()]
        lessons = [dict(r) for r in conn.execute(text('SELECT id,chapter_id,title,order_index FROM lessons ORDER BY chapter_id,order_index,id')).mappings()]
    manifest = dict(release='20261031', protected=protected_snapshot(), existing_courses=existing,
                    new_courses=incoming, documents=[], applied=False)
    OUT.mkdir(parents=True, exist_ok=True)
    def document(key, course_key, title, body, **extra):
        source = OUT / (key + '.md')
        source.write_text(body, encoding='utf-8')
        page = OUT / (key + '.html')
        course_title = extra.pop('course_title')
        page.write_text(html_document(title, course_title, body), encoding='utf-8')
        manifest['documents'].append(dict(key=key, course_key=course_key, title=title, source=str(source),
            html=str(page), pdf=str(OUT / (key + '.pdf')), source_sha256=digest(source), **extra))
    for course in existing:
        outline = [ch for ch in chapters if ch['course_id'] == course['id']]
        title = 'Sổ tay học tập và dự án cuối khóa — ' + course['title']
        document(f"existing_{course['id']}_handbook", f"existing:{course['id']}", title,
                 handbook(course, outline, lessons), course_id=course['id'], course_title=course['title'])
    for course in incoming:
        slug = course['slug']
        project_body = ''
        for name, content in course.get('project_files', {}).items():
            path = OUT / 'projects' / slug / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(content, encoding='utf-8')
            project_body += f'\n\n### File: {name}\n'
            project_body += content if name.endswith('.md') else f'```\n{content}\n```\n'
        body = course['handbook'] + '\n\n## Mã nguồn dự án tham khảo\nTự làm dự án theo đề bài trước khi đối chiếu mã tham khảo bên dưới.\n' + project_body
        document(slug + '_handbook', slug, 'Sổ tay và dự án cuối khóa — ' + course['title'], body, course_title=course['title'])
        for ch_no, chapter in enumerate(course['chapters'], 1):
            for lesson_no, lesson in enumerate(chapter['lessons'], 1):
                body = f"## Mục tiêu bài học\n" + '\n'.join('- ' + s for s in lesson['objectives'])
                body += f"\n\nThời gian dự kiến: {lesson['duration_minutes']} phút, gồm đọc và thực hành.\n\n" + lesson['body']
                document(f'{slug}_c{ch_no}_l{lesson_no}', slug, f"Chương {ch_no} — {numbered_title(lesson['title'], 'Bài', lesson_no)}", body,
                         course_title=course['title'], chapter_no=ch_no, lesson_no=lesson_no)
    for name in MODULES:
        manifest.setdefault('source_modules', {})[name] = digest(HERE / (name + '.py'))
    manifest['legacy_module_sha256'] = digest(HERE / 'legacy_guides.py')
    dump(MANIFEST, manifest)
    print('Prepared', len(incoming), 'new courses and', len(manifest['documents']), 'documents', flush=True)


def build():
    manifest = load()
    chrome = find_chrome()
    profile_root = OUT / 'browser_profiles'
    profile_root.mkdir(exist_ok=True)
    def one(doc):
        if digest(doc['source']) != doc['source_sha256']:
            raise RuntimeError('Source changed after preparation: ' + doc['key'])
        output = Path(doc['pdf'])
        if not output.exists() or doc.get('needs_rebuild'):
            profile = profile_root / doc['key']
            subprocess.run([chrome, '--headless=new', '--disable-gpu', '--no-pdf-header-footer',
                f'--user-data-dir={profile}', f'--print-to-pdf={output}', Path(doc['html']).as_uri()],
                check=True, capture_output=True, timeout=90, creationflags=getattr(subprocess, 'CREATE_NO_WINDOW', 0))
        reader = PdfReader(output)
        extracted = '\n'.join(page.extract_text() or '' for page in reader.pages)
        assert len(reader.pages) >= 2 and len(extracted) >= 3000, doc['key']
        assert 'StudyOnline' in extracted, doc['key']
        return doc['key'], dict(pages=len(reader.pages), text_chars=len(extracted), sha256=digest(output), needs_rebuild=False,
                               upload_name='release_20261031_' + doc['key'] + '_' + digest(output)[:12] + '.pdf')
    with ThreadPoolExecutor(max_workers=3) as pool:
        for job in as_completed([pool.submit(one, doc) for doc in manifest['documents']]):
            key, meta = job.result()
            next(doc for doc in manifest['documents'] if doc['key'] == key).update(meta)
            dump(MANIFEST, manifest)
            print('PDF', key, meta['pages'], 'pages', flush=True)


def check():
    manifest = load()
    report = []
    for course in manifest['new_courses']:
        validate_course(course)
        for chapter in course['chapters']:
            for lesson in chapter['lessons']:
                for i, test in enumerate(lesson.get('checks', [])):
                    path = OUT / 'checks' / (course['slug'] + f'_{len(report)}.py')
                    path.parent.mkdir(exist_ok=True)
                    path.write_text(test['code'], encoding='utf-8')
                    env = dict(os.environ, PYTHONIOENCODING='utf-8')
                    # Keep nested local Git remotes under Windows' path limit.
                    with tempfile.TemporaryDirectory(prefix='_cc_', dir=BACKEND.parent) as tmp:
                        proc = subprocess.run([sys.executable, str(path)], cwd=tmp, capture_output=True, text=True, encoding='utf-8', env=env, timeout=60,
                                              creationflags=getattr(subprocess, 'CREATE_NO_WINDOW', 0))
                    if proc.returncode:
                        raise RuntimeError(f"Check failed {course['slug']} / {lesson['title']} / {test['name']}: {proc.stdout}\n{proc.stderr}")
                    report.append(dict(course=course['slug'], lesson=lesson['title'], name=test['name'], passed=True))
    manifest['checks_passed'] = len(report)
    dump(MANIFEST, manifest)
    dump(OUT / 'example-checks.json', report)
    print('Executable checks passed:', len(report), flush=True)


def index():
    from app.ai.rag import document_loader, embeddings, text_splitter
    manifest = load()
    for doc in manifest['documents']:
        cache = OUT / (doc['key'] + '.rag.json')
        if cache.exists():
            assert json.loads(cache.read_text(encoding='utf-8'))['sha256'] == doc['sha256']
            continue
        assert digest(doc['pdf']) == doc['sha256']
        pages, _ = document_loader.extract(doc['pdf'], 'pdf')
        chunks = text_splitter.split_pages(pages)
        vectors = embeddings.embed_texts([c['text'] for c in chunks])
        assert chunks and len(chunks) == len(vectors)
        assert all(len(v) == 384 for v in vectors)
        payload = [dict(idx=c['index'], page=c['page'], content=c['text'], embedding=json.dumps(v),
                        tokens=text_splitter.approx_tokens(c['text'])) for c, v in zip(chunks, vectors)]
        dump(cache, dict(sha256=doc['sha256'], chunks=payload))
        print('Indexed', doc['key'], len(chunks), 'chunks', flush=True)


def projects():
    manifest = load()
    report = []
    for course in manifest['new_courses']:
        slug = course['slug']
        args = ['-m', 'unittest', 'discover', '-s', 'tests', '-v'] if slug.startswith('git-') else \
               ['-m', 'pytest', 'test_app.py', '-q', '-o', 'addopts=', '-p', 'no:cacheprovider', '-p', 'no:tmpdir'] if slug.startswith('fastapi-') else \
               ['-m', 'unittest', '-v', 'test_library_cli.py']
        proc = subprocess.run([sys.executable, *args], cwd=OUT / 'projects' / slug, capture_output=True, text=True,
                              encoding='utf-8', env=dict(os.environ, PYTHONIOENCODING='utf-8'), timeout=90,
                              creationflags=getattr(subprocess, 'CREATE_NO_WINDOW', 0))
        output = proc.stdout + proc.stderr
        if proc.returncode:
            raise RuntimeError('Capstone tests failed: ' + slug + '\n' + output)
        match = re.search(r'Ran (\d+) tests?', output) or re.search(r'(\d+) passed', output)
        assert match, output
        report.append(dict(course=slug, tests=int(match[1]), passed=True))
    manifest['project_checks'] = report
    dump(MANIFEST, manifest)
    dump(OUT / 'project-checks.json', report)
    print('Capstone tests passed:', sum(r['tests'] for r in report), flush=True)


def insert_questions(conn, quiz_id, lesson, chapter_id, lesson_id, topic_id, start=0):
    for i, q in enumerate(lesson['questions']):
        # Preserve the authored answer while balancing its position across quizzes.
        options = list(q['options'])
        correct = options.pop(q['correct'])
        position = (start + i) % 4
        options.insert(position, correct)
        conn.execute(text('''INSERT INTO questions(quiz_id,content,option_a,option_b,option_c,option_d,correct_answer,
            topic,topic_id,difficulty,explanation,order_index,knowledge_chapter_id,knowledge_lesson_id)
            VALUES(:q,:prompt,:a,:b,:c,:d,:answer,:topic,:tid,:difficulty,:explanation,:o,:ch,:l)'''),
            dict(q=quiz_id, prompt=q['prompt'], a=options[0], b=options[1], c=options[2], d=options[3], answer='ABCD'[position],
                 topic=lesson['title'][:100], tid=topic_id, difficulty=q['difficulty'], explanation=q['explanation'], o=start+i+1, ch=chapter_id, l=lesson_id))


def apply():
    manifest = load()
    if manifest['applied']:
        print('Already applied; run verify instead.'); return
    assert manifest.get('checks_passed', 0) >= 24, 'Run executable checks before applying'
    assert sum(r['tests'] for r in manifest.get('project_checks', [])) >= 19, 'Run capstone tests before applying'
    assert protected_snapshot(manifest['protected']) == manifest['protected'], 'Existing data changed; review before applying'
    for name, checksum in manifest['source_modules'].items():
        assert digest(HERE / (name + '.py')) == checksum, 'Course source changed; rebuild preparation'
    assert digest(HERE / 'legacy_guides.py') == manifest['legacy_module_sha256'], 'Legacy guide source changed'
    staged = []
    root = Path(settings.upload_dir, 'documents').resolve()
    root.mkdir(parents=True, exist_ok=True)
    for doc in manifest['documents']:
        assert digest(doc['pdf']) == doc['sha256']
        cache = json.loads((OUT / (doc['key'] + '.rag.json')).read_text(encoding='utf-8'))
        assert cache['sha256'] == doc['sha256'] and cache['chunks']
        dest = root / doc['upload_name']
        if dest.exists():
            assert digest(dest) == doc['sha256']
        else:
            shutil.copyfile(doc['pdf'], dest)
        staged.append((doc, dest, cache['chunks']))
    course_ids = {f"existing:{c['id']}": c['id'] for c in manifest['existing_courses']}
    lesson_ids = {}
    added = []
    with engine.begin() as conn:
        teacher = conn.execute(text("SELECT id FROM users WHERE role='teacher' AND is_active=1 ORDER BY id LIMIT 1")).scalar_one()
        for course in manifest['new_courses']:
            assert not conn.execute(text('SELECT id FROM courses WHERE slug=:s'), {'s': course['slug']}).scalar(), 'Course already exists'
            cid = conn.execute(text("INSERT INTO courses(teacher_id,title,slug,description,price,level,status) VALUES(:t,:name,:slug,:d,0,:level,'published')"),
                dict(t=teacher, name=course['title'], slug=course['slug'], d=course['description'], level=course['level'])).lastrowid
            course_ids[course['slug']] = cid
            final = conn.execute(text("INSERT INTO quizzes(course_id,title,description,source,duration,passing_score,max_attempts,grading_method) VALUES(:c,:t,:d,'ai',90,70,3,'highest')"),
                dict(c=cid,t='Kiểm tra cuối khóa — ' + course['title'], d='60 câu bao phủ 12 bài; đạt từ 70%. Dự án cuối khóa được đánh giá riêng theo rubric trong sổ tay.')).lastrowid
            count = 0
            for ch_no, chapter in enumerate(course['chapters'], 1):
                chid = conn.execute(text('INSERT INTO chapters(course_id,chapter_name,order_index) VALUES(:c,:t,:o)'),
                    dict(c=cid,t=numbered_title(chapter['title'], 'Chương', ch_no),o=ch_no)).lastrowid
                chapter_quiz = conn.execute(text("INSERT INTO quizzes(course_id,chapter_id,title,description,source,passing_score,grading_method) VALUES(:c,:ch,:t,:d,'ai',70,'latest')"),
                    dict(c=cid,ch=chid,t=f"Ôn tập chương {ch_no} — {chapter['title']}",d='10 câu ôn tập; có giải thích và phân loại theo bài.')).lastrowid
                for lesson_no, lesson in enumerate(chapter['lessons'], 1):
                    key = f"{course['slug']}_c{ch_no}_l{lesson_no}"
                    doc = next(d for d in manifest['documents'] if d['key'] == key)
                    description = 'Mục tiêu bài học:\n' + '\n'.join('• ' + value for value in lesson['objectives'])
                    description += f"\n\nThời gian học và thực hành dự kiến: {lesson['duration_minutes']} phút.\n\nĐọc tài liệu PDF đính kèm để học lý thuyết, chạy ví dụ, làm bài tập và đối chiếu hướng giải. Hoàn thành bài thực hành trước khi làm bộ ôn tập 5 câu của bài."
                    lid = conn.execute(text("INSERT INTO lessons(chapter_id,title,description,document_url,duration,order_index,is_free,status) VALUES(:ch,:t,:d,:url,0,:o,:free,'published')"),
                        dict(ch=chid,t=numbered_title(lesson['title'], 'Bài', lesson_no),d=description,
                             url='/uploads/documents/' + doc['upload_name'],o=lesson_no,free=int(ch_no == 1 and lesson_no == 1))).lastrowid
                    lesson_ids[key] = lid
                    topic = lesson['title'][:100]
                    tid = conn.execute(text('INSERT INTO course_topics(course_id,name,normalized_name,lesson_id,confirmed) VALUES(:c,:t,:n,:l,1)'),
                        dict(c=cid,t=topic,n=normalize_topic(topic),l=lid)).lastrowid
                    review = conn.execute(text("INSERT INTO quizzes(course_id,review_lesson_id,title,description,source,passing_score,grading_method) VALUES(:c,:l,:t,:d,'ai',70,'latest')"),
                        dict(c=cid,l=lid,t=f"Ôn bài {ch_no}.{lesson_no} — {lesson['title']}",d='5 câu ôn tập kèm giải thích. Luyện bằng bài tập thực hành trước khi xem đáp án.')).lastrowid
                    conn.execute(text('UPDATE course_topics SET practice_quiz_id=:q WHERE id=:id'), dict(q=review,id=tid))
                    insert_questions(conn, review, lesson, chid, lid, tid)
                    insert_questions(conn, chapter_quiz, lesson, chid, lid, tid, (lesson_no-1)*5)
                    insert_questions(conn, final, lesson, chid, lid, tid, count)
                    count += 5
            added.append(dict(id=cid,slug=course['slug'],title=course['title'],chapters=6,lessons=12,quizzes=19,questions=180))
        for doc, path, chunks in staged:
            cid = course_ids[doc['course_key']]
            lid = lesson_ids.get(doc['key'])
            owner = conn.execute(text('SELECT teacher_id FROM courses WHERE id=:id'), {'id': cid}).scalar_one()
            did = conn.execute(text("INSERT INTO documents(course_id,lesson_id,uploaded_by,title,filename,file_path,file_type,status,pages,chunk_count) VALUES(:c,:l,:u,:t,:fn,:path,'pdf','indexed',:p,:n)"),
                dict(c=cid,l=lid,u=owner,t=doc['title'],fn=safe_filename(doc['title'], '.pdf'),path=str(path),p=doc['pages'],n=len(chunks))).lastrowid
            conn.execute(text('''INSERT INTO document_chunks(document_id,course_id,lesson_id,chunk_index,page,content,embedding,token_count)
                VALUES(:d,:c,:l,:idx,:page,:content,:embedding,:tokens)'''), [dict(chunk,d=did,c=cid,l=lid) for chunk in chunks])
            doc.update(document_id=did,course_id=cid,lesson_id=lid)
    manifest.update(applied=True, added_courses=added)
    dump(MANIFEST, manifest)
    assert protected_snapshot(manifest['protected']) == manifest['protected'], 'Protected records changed unexpectedly'
    print('Applied:', len(added), 'courses,', len(lesson_ids), 'lessons,', len(staged), 'indexed PDFs', flush=True)


def verify():
    """Use an uncommitted student fixture; no real session credentials are created."""
    from urllib.parse import unquote, urlsplit
    import uuid
    from fastapi.testclient import TestClient
    from sqlalchemy.orm import Session
    from app.core.dependencies import get_current_user, get_viewer
    from app.core.database import get_db
    from app.main import app
    from app.ai.rag import retriever
    manifest = load()
    assert manifest['applied']
    assert protected_snapshot(manifest['protected']) == manifest['protected']
    report = dict(protected_data_unchanged=True, authentication='temporary_student_fixture_transaction_rolled_back', documents=[],
                  courses=manifest['added_courses'], examples=manifest['checks_passed'], project_tests=manifest['project_checks'], retrieval=[])
    original_overrides = dict(app.dependency_overrides)
    with engine.connect() as conn:
        transaction = conn.begin()
        db = Session(bind=conn, join_transaction_mode='create_savepoint')
        try:
            uid = conn.execute(text("INSERT INTO users(fullname,email,password,role,is_active) VALUES('Course verification',:email,:password,'student',1)"),
                dict(email='course-check-'+uuid.uuid4().hex+'@example.invalid', password='!disabled-'+uuid.uuid4().hex)).lastrowid
            fixture = dict(id=uid, fullname='Course verification', email='check@example.invalid', role='student')
            def override_db():
                yield db
            app.dependency_overrides[get_db] = override_db
            app.dependency_overrides[get_current_user] = lambda: fixture
            app.dependency_overrides[get_viewer] = lambda: fixture
            client = TestClient(app)
            first = manifest['added_courses'][0]['id']
            assert client.get('/api/courses/materials', params={'course_id': first}).status_code == 403
            for cid in {d['course_id'] for d in manifest['documents']}:
                conn.execute(text('INSERT INTO enrollments(user_id,course_id) VALUES(:u,:c)'), dict(u=uid,c=cid))
            for doc in manifest['documents']:
                response = client.get(f"/api/ai/documents/{doc['document_id']}/source")
                assert response.status_code == 200 and response.json()['data']['title'] == doc['title']
                response = client.get(f"/api/ai/documents/{doc['document_id']}/content")
                assert response.status_code == 200 and hashlib.sha256(response.content).hexdigest() == doc['sha256']
                assert safe_filename(doc['title'], '.pdf') in unquote(response.headers['content-disposition'])
                if doc.get('lesson_id'):
                    lesson = client.get('/api/lessons', params={'id': doc['lesson_id']}).json()['data']
                    url = urlsplit(lesson['document_src'])
                    response = client.get(url.path + '?' + url.query)
                    assert response.status_code == 200 and hashlib.sha256(response.content).hexdigest() == doc['sha256']
                report['documents'].append(dict(id=doc['document_id'], title=doc['title'], pages=doc['pages'], http=200,
                    chunks=len(json.loads((OUT / (doc['key'] + '.rag.json')).read_text(encoding='utf-8'))['chunks'])))
            for course in manifest['added_courses']:
                response = client.get('/api/courses/materials', params={'course_id': course['id']})
                assert response.status_code == 200 and len(response.json()['data']) == 1
                rows = conn.execute(text('''SELECT q.id,COUNT(qq.id) AS n FROM quizzes q JOIN questions qq ON qq.quiz_id=q.id
                    WHERE q.course_id=:c GROUP BY q.id'''), {'c': course['id']}).mappings().all()
                assert len(rows) == 19 and sorted(r['n'] for r in rows) == [5]*12 + [10]*6 + [60]
                invalid = conn.execute(text('''SELECT COUNT(*) FROM questions q JOIN quizzes z ON z.id=q.quiz_id
                    LEFT JOIN lessons l ON l.id=q.knowledge_lesson_id LEFT JOIN chapters ch ON ch.id=q.knowledge_chapter_id
                    WHERE z.course_id=:c AND (l.id IS NULL OR ch.id IS NULL OR l.chapter_id<>ch.id OR ch.course_id<>z.course_id)'''), {'c': course['id']}).scalar_one()
                assert invalid == 0
                hits = retriever.retrieve(db, 'Mục tiêu bài học và bài tập thực hành', course_id=course['id'], k=3)
                allowed = {d['document_id'] for d in manifest['documents'] if d['course_id'] == course['id']}
                assert hits and all(h['document_id'] in allowed for h in hits)
                report['retrieval'].append(dict(course_id=course['id'], chunks_found=len(hits)))
            # Test the real unauthenticated dependency after removing the fixture.
            del app.dependency_overrides[get_current_user]
            assert client.get('/api/courses/materials', params={'course_id': first}).status_code == 401
        finally:
            app.dependency_overrides.clear()
            app.dependency_overrides.update(original_overrides)
            db.close()
            transaction.rollback()
    assert protected_snapshot(manifest['protected']) == manifest['protected']
    dump(OUT / 'verification.json', report)
    dump(BACKEND.parent / 'docs/course-release-20261031-verification.json', report)
    print('Verified PDFs, temporary student access, quiz mappings, RAG and original data preservation', flush=True)


if __name__ == '__main__':
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('phase', choices=('prepare', 'build', 'check', 'projects', 'index', 'apply', 'verify'))
    args = parser.parse_args()
    globals()[args.phase]()
