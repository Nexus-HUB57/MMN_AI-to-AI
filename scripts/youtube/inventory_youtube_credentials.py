#!/usr/bin/env python3
from __future__ import annotations

import json
import os
from pathlib import Path

ROOT = Path('/var/www/oneverso/current')
OUT = ROOT / 'AcademIA' / 'youtube' / 'reports' / 'youtube_credential_inventory_2026-07-27.txt'
OUT.parent.mkdir(parents=True, exist_ok=True)

TOKEN_ENV_CANDIDATES = [
    'YOUTUBE_TOKEN_JSON',
    'YOUTUBE_OAUTH_TOKEN_JSON',
    'GOOGLE_OAUTH_TOKEN_JSON',
    'YOUTUBE_TOKEN',
    'YOUTUBE_OAUTH_TOKEN',
]
CANONICAL_FILES = [
    Path('/var/www/oneverso/current/secrets/youtube_token.json'),
    Path('/var/www/oneverso/secrets/youtube_token.json'),
    Path('/root/secrets/youtube_token.json'),
]
SEARCH_ROOTS = [Path('/var/www'), Path('/root'), Path('/home')]
SEARCH_PATTERNS = [
    '*youtube*token*.json', '*oauth*token*.json', '*google*oauth*.json', '*token*.json', '*.txt', '.env', '.env.*'
]


def is_authorized_user_blob(text: str) -> bool:
    try:
        data = json.loads(text)
    except Exception:
        return False
    return isinstance(data, dict) and bool(data.get('refresh_token')) and bool(data.get('client_id')) and bool(data.get('client_secret'))


def summarize_file(path: Path) -> str | None:
    try:
        if not path.is_file() or path.stat().st_size > 2_000_000:
            return None
        text = path.read_text(encoding='utf-8', errors='ignore')
    except Exception:
        return None

    matches: list[str] = []
    for key in TOKEN_ENV_CANDIDATES:
        if key in text:
            matches.append(key)
    if 'refresh_token' in text and 'client_id' in text and 'client_secret' in text:
        matches.append('authorized_user_like')
    if path.name.startswith('.env'):
        for raw_line in text.splitlines():
            line = raw_line.strip()
            if not line or line.startswith('#') or '=' not in line:
                continue
            key, value = line.split('=', 1)
            key = key.strip()
            value = value.strip()
            if key in TOKEN_ENV_CANDIDATES:
                matches.append(f'env_key:{key}')
                if is_authorized_user_blob(value):
                    matches.append(f'env_authorized_user:{key}')
    if not matches:
        return None
    st = path.stat()
    return f'CANDIDATE {path} size={st.st_size} keys={"|".join(sorted(set(matches)))}'


def main():
    lines: list[str] = []
    lines.append('# youtube credential inventory')
    lines.append(f'host={os.uname().nodename}')
    lines.append(f'cwd={ROOT}')
    lines.append('## env presence')
    for name in TOKEN_ENV_CANDIDATES:
        value = os.environ.get(name, '')
        status = 'SET' if value else 'MISSING'
        lines.append(f'{name}={status}')
    lines.append('## candidate canonical paths')
    for path in CANONICAL_FILES:
        if path.exists():
            st = path.stat()
            lines.append(f'FOUND {path} size={st.st_size} mtime={st.st_mtime}')
        else:
            lines.append(f'MISSING {path}')
    lines.append('## pm2 names')
    pm2_dump = Path.home() / '.pm2' / 'dump.pm2'
    if pm2_dump.exists():
        try:
            data = json.loads(pm2_dump.read_text(encoding='utf-8', errors='ignore'))
            for item in data:
                name = item.get('name')
                if name:
                    lines.append(name)
        except Exception:
            lines.append('pm2_dump_unreadable')
    else:
        lines.append('pm2_dump_missing')
    lines.append('## crontab/log script presence')
    for candidate in [
        ROOT / 'scripts' / 'youtube' / 'cron_retry_onda37.sh',
        ROOT / 'scripts' / 'youtube' / 'upload_academia_youtube.py',
        ROOT / 'scripts' / 'youtube' / 'republish_academia.py',
    ]:
        lines.append(f'EXISTS {candidate}={candidate.exists()}')
    lines.append('## logs')
    logs_dir = Path('/var/www/oneverso/logs')
    if logs_dir.exists():
        for p in sorted(logs_dir.glob('youtube*')):
            try:
                lines.append(f'LOG {p} size={p.stat().st_size}')
            except Exception:
                pass
        for p in sorted(logs_dir.glob('*onda37*')):
            try:
                lines.append(f'LOG {p} size={p.stat().st_size}')
            except Exception:
                pass
    else:
        lines.append('logs_dir_missing')
    lines.append('## candidate files by content')
    seen: set[str] = set()
    for base in SEARCH_ROOTS:
        if not base.exists():
            continue
        for pattern in SEARCH_PATTERNS:
            for path in base.rglob(pattern):
                try:
                    rp = str(path.resolve())
                except Exception:
                    rp = str(path)
                if rp in seen:
                    continue
                seen.add(rp)
                summary = summarize_file(path)
                if summary:
                    lines.append(summary)
    OUT.write_text('\n'.join(lines) + '\n', encoding='utf-8')
    print(str(OUT))


if __name__ == '__main__':
    main()
