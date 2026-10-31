"""Hash legacy plaintext passwords in one transaction. Dry run by default."""
from pathlib import Path
import argparse
import re
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from sqlalchemy import text
from app.core.database import SessionLocal
from app.core.security import hash_password

BCRYPT = re.compile(r'^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$')


def migrate(db, apply=False):
    rows = db.execute(text('SELECT id, password FROM users' + (' FOR UPDATE' if apply else ''))).mappings().all()
    legacy = []
    for row in rows:
        value = row['password'] or ''
        if BCRYPT.fullmatch(value):
            continue
        if not value or value.startswith('$') or len(value.encode('utf-8')) > 72:
            raise ValueError('Unsupported password format; no changes applied. Reset the affected account separately.')
        legacy.append(row)
    if apply:
        for row in legacy:
            db.execute(text('UPDATE users SET password=:pw, token_version=token_version+1 WHERE id=:id'),
                       {'pw':hash_password(row['password']), 'id':row['id']})
        db.commit()
    return {'accounts':len(rows), 'legacy':len(legacy), 'converted':len(legacy) if apply else 0}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--apply', action='store_true')
    args = parser.parse_args()
    with SessionLocal() as db:
        print(migrate(db, args.apply))
