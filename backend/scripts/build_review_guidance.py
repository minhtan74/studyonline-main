"""Build portable lesson review notes from the repository's teaching materials."""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from app.services.review_guidance import guidance_key


def plain(value):
    value = re.sub(r'\[([^]]+)\]\([^)]*\)', r'\1', value)
    return re.sub(r'\s+', ' ', value.replace('**', '').replace('`', '')).strip()


def extract(body):
    body = re.sub(r'```.*?```', '', body, flags=re.S)
    points = []
    for heading in re.findall(r'^#{2,3}\s+(.+)$', body, re.M):
        heading = plain(re.sub(r'^\d+[.)]?\s*', '', heading))
        if not re.match(r'(?i)(mục tiêu|tóm tắt|bài tập|tự luyện|nguồn|tham khảo|hướng giải|tình huống, ví dụ)', heading):
            points.append(heading)
    paragraphs = [plain(p) for p in re.split(r'\n\s*\n', body) if p.strip() and not p.lstrip().startswith(('#', '|', '- '))]
    example = next((p for p in paragraphs if re.match(r'(?i)(ví dụ|tình huống|hỏi thực tế)', p)), '')
    if not points:
        points = [p for p in paragraphs if not p.startswith('Tự luyện:')][:2]
    return points[:5], example


def build():
    docs = ROOT / 'training/lesson_docs'
    catalog = {}
    metadata = {r['lesson_id']: r for r in json.loads((docs / 'lessons.json').read_text(encoding='utf-8'))}
    for path in sorted((docs / 'content').glob('*.md')):
        parts = re.split(r'^=== LESSON (\d+) ===\s*$', path.read_text(encoding='utf-8'), flags=re.M)
        for lesson_id, body in zip(parts[1::2], parts[2::2]):
            row = metadata.get(int(lesson_id))
            if not row:
                continue
            points, example = extract(body)
            if points:
                catalog[guidance_key(row['course_title'], row['title'])] = dict(points=points, example=example, source=str(path.relative_to(ROOT)).replace('\\', '/'))
    edition = docs / 'edition_20261029'
    manifest = json.loads((edition / 'generated/manifest.json').read_text(encoding='utf-8'))
    sections = {}
    for path in sorted(edition.glob('*.md')):
        parts = re.split(r'^## (.+)\s*$', path.read_text(encoding='utf-8'), flags=re.M)
        for title, body in zip(parts[1::2], parts[2::2]):
            sections.setdefault(guidance_key('', title.strip()), []).append((path, body))
    for row in manifest['lessons']:
        matches = sections.get(guidance_key('', row['title']), [])
        if len(matches) != 1:
            continue
        path, body = matches[0]
        key = guidance_key(row['course_title'], row['title'])
        points, example = extract(body)
        if key in catalog:
            if example:
                catalog[key]['example'] = example
        elif points:
            catalog[key] = dict(points=points, example=example, source=str(path.relative_to(ROOT)).replace('\\', '/'))
    release = json.loads((ROOT / 'training/course_release_20261031/generated/manifest.json').read_text(encoding='utf-8'))
    for course in release['new_courses']:
        for chapter in course['chapters']:
            for lesson in chapter['lessons']:
                points, example = extract(lesson['body'])
                catalog[guidance_key(course['title'], lesson['title'])] = dict(
                    points=[plain(p) for p in lesson['objectives']][:5] or points,
                    example=example, source='training/course_release_20261031/generated/manifest.json')
    target = ROOT / 'app/services/lesson_review_catalog.json'
    target.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'Built {len(catalog)} course/lesson review guides.')


if __name__ == '__main__':
    build()
