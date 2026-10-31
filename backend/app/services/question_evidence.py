"""Identify exact reused questions independently of Quiz IDs and option order."""
import hashlib
import json
import unicodedata


def _text(value):
    # Case and internal whitespace can be significant inside code/string literals.
    return unicodedata.normalize('NFC', str(value)).replace('\r\n', '\n').strip()


def fingerprint(question):
    prompt = question.get('question_content', question.get('content'))
    options = [question.get('option_' + letter) for letter in 'abcd']
    if not prompt or any(value is None for value in options):
        return None
    payload = [_text(prompt), sorted(_text(value) for value in options)]
    return hashlib.sha256(json.dumps(payload, ensure_ascii=False, separators=(',', ':')).encode('utf-8')).hexdigest()


def evidence_key(row):
    identity = row.get('question_fingerprint') or fingerprint(row)
    return 'content:' + identity if identity else 'id:' + str(row['question_id'])


def independent_answers(rows):
    """Newest answer wins across copies; conflicting duplicates in one result
    conservatively count as incorrect. Never merge across different courses.
    """
    physical = {}
    for row in rows:
        key = (row['course_id'], row['question_id'])
        order = (row.get('result_id') or 0, -int(row.get('is_correct') or 0), row['question_id'])
        previous = physical.get(key)
        if previous is None or order > previous[0]:
            physical[key] = (order, row)
    selected = {}
    for order, row in physical.values():
        key = (row['course_id'], evidence_key(row))
        previous = selected.get(key)
        if previous is None or order > previous[0]:
            selected[key] = (order, row)
    return [item[1] for item in selected.values()]
