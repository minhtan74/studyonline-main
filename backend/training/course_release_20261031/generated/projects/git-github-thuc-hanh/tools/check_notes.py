from pathlib import Path

def check_notes(root):
    problems = []
    for path in sorted(Path(root).glob('*.md')):
        text = path.read_text(encoding='utf-8')
        if not text.startswith('# '):
            problems.append(path.name + ': missing heading')
        if 'TODO_REQUIRED' in text:
            problems.append(path.name + ': unfinished note')
    return problems
