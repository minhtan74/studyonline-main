"""Initialize JWT_SECRET, or rotate it explicitly, without printing the secret."""
import argparse
import os
from pathlib import Path
import re
import secrets


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--rotate', action='store_true', help='Invalidate existing tokens by replacing an existing key')
    args = parser.parse_args()
    path = Path(__file__).resolve().parents[1] / '.env'
    source = path.read_text(encoding='utf-8')
    match = re.search(r'(?m)^JWT_SECRET=(.*)$', source)
    current = match.group(1).strip().strip('\"\'') if match else ''
    if len(current.encode()) >= 32 and current not in ('studyonline_super_secret_key_2026', 'replace_with_your_private_jwt_secret') and not args.rotate:
        print('Private key already configured; unchanged. Use --rotate explicitly to invalidate existing tokens.')
        return
    line = 'JWT_SECRET=' + secrets.token_urlsafe(64)
    updated = re.sub(r'(?m)^JWT_SECRET=.*$', lambda _: line, source) if match else source.rstrip() + '\n' + line + '\n'
    temporary = path.with_name('.env.jwt.tmp')
    try:
        temporary.write_text(updated, encoding='utf-8')
        os.replace(temporary, path)
    finally:
        temporary.unlink(missing_ok=True)
    print('JWT key saved to backend/.env; not displayed. Restart backend to apply.')


if __name__ == '__main__':
    main()
