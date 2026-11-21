"""Authored review notes; these describe lesson content, not inferred weaknesses."""
import html
import json
import re
import unicodedata
from functools import lru_cache
from pathlib import Path


def guidance_key(course_title, lesson_title):
    def normalize(value):
        value = ' '.join(unicodedata.normalize('NFC', value or '').split()).casefold()
        return re.sub(r'^bài\s+\d+\s*[:.\-–]\s*', '', value)
    return normalize(course_title) + '::' + normalize(lesson_title)


@lru_cache(maxsize=1)
def _catalog():
    path = Path(__file__).with_name('lesson_review_catalog.json')
    return json.loads(path.read_text(encoding='utf-8')) if path.exists() else {}


def lesson_review_guidance(title_key, course_title='', description=None):
    if title_key != 'khái niệm về hệ điều hành':
        entry = _catalog().get(guidance_key(course_title, title_key))
        if entry:
            return dict(scope='lesson', heading='Bạn nên xem lại', **entry,
                        note='')
        text = html.unescape(re.sub(r'<[^>]*>', ' ', description or ''))
        text = ' '.join(text.split())
        points = [text[:1200]] if text else [f'Ôn lại khái niệm, ví dụ và bài tập trong bài {title_key}.']
        return dict(scope='lesson', heading='Bạn nên xem lại', points=points, example='',
                    source='lesson_description' if text else 'lesson_outline',
                    note='Nội dung ôn ở cấp bài học; chưa có hướng dẫn chi tiết được biên soạn cho từng mục. Các chủ đề có số liệu riêng được hiển thị phía trên.')
    return {
        'scope': 'lesson',
        'heading': 'Bạn nên xem lại',
        'points': [
            'Vai trò của hệ điều hành trong quản lý và phân phối tài nguyên cho các ứng dụng.',
            'Các tài nguyên ứng dụng cần sử dụng: CPU, bộ nhớ và thiết bị vào/ra (I/O).',
            'Khi chạy nhiều ứng dụng: các công việc có thể cạnh tranh tài nguyên hoặc phải chờ I/O.',
        ],
        'example': 'Máy chạy nhiều ứng dụng bị chậm: hãy xem xét CPU, RAM và hoạt động đĩa; chỉ từ hiện tượng chậm chưa thể kết luận thiếu RAM.',
        'note': 'Đây là các nội dung ôn của bài học. Chỉ những chủ đề có số liệu riêng phía trên mới phản ánh kết quả của bạn theo từng phần.',
    }
