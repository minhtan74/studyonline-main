"""Create a local runtime account and update .env without displaying credentials."""
from pathlib import Path
import argparse
import os
import re
import secrets
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from app.core.config import settings
import pymysql


def update_env(source, values):
    for key, value in values.items():
        pattern = rf'(?m)^{re.escape(key)}=.*$'
        line = f'{key}={value}'
        source = re.sub(pattern, lambda _: line, source) if re.search(pattern, source) else source.rstrip() + '\n' + line + '\n'
    return source


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--apply', action='store_true')
    args = parser.parse_args()
    if settings.db_host not in ('localhost', '127.0.0.1') or settings.app_env != 'local':
        raise SystemExit('Only local MySQL provisioning is supported.')
    if not re.fullmatch(r'[A-Za-z0-9_]+', settings.db_name):
        raise SystemExit('Unexpected database identifier.')
    if settings.db_user != 'root':
        raise SystemExit('Runtime account already configured; no changes made.')
    if not args.apply:
        print('Plan: create studyonline_app@127.0.0.1 with CRUD privileges; verify connection; update backend/.env. No course data or root account changes.')
        return
    env_path = ROOT / '.env'
    original = env_path.read_text(encoding='utf-8')
    account, password = 'studyonline_app', secrets.token_urlsafe(36)
    with pymysql.connect(host=settings.db_host, port=settings.db_port, user=settings.db_user, password=settings.db_pass, autocommit=True) as admin:
        with admin.cursor() as cursor:
            cursor.execute('SELECT COUNT(*) FROM mysql.user WHERE User=%s AND Host=%s', (account, '127.0.0.1'))
            if cursor.fetchone()[0]:
                raise SystemExit('Account already exists; refusing to overwrite it.')
            cursor.execute('CREATE USER %s@%s IDENTIFIED BY %s', (account, '127.0.0.1', password))
            try:
                cursor.execute(f'GRANT SELECT, INSERT, UPDATE, DELETE ON `{settings.db_name}`.* TO %s@%s', (account, '127.0.0.1'))
                with pymysql.connect(host='127.0.0.1', port=settings.db_port, user=account, password=password, database=settings.db_name) as runtime:
                    with runtime.cursor() as verify:
                        verify.execute('SELECT COUNT(*) FROM users')
                        verify.fetchone()
                updated = update_env(original, {'APP_DEBUG':'false', 'FRONTEND_ORIGIN':'http://localhost:5173,http://127.0.0.1:5173', 'DB_HOST':'127.0.0.1', 'DB_USER':account, 'DB_PASS':password})
                temporary = env_path.with_name('.env.runtime.tmp')
                try:
                    temporary.write_text(updated, encoding='utf-8')
                    os.replace(temporary, env_path)
                finally:
                    temporary.unlink(missing_ok=True)
            except Exception:
                cursor.execute('DROP USER %s@%s', (account, '127.0.0.1'))
                raise SystemExit('Provisioning failed; new account removed. Credentials not printed.') from None
    print('Runtime account verified; backend/.env updated. Restart backend. Run migrations separately with a schema administrator.')


if __name__ == '__main__':
    main()
