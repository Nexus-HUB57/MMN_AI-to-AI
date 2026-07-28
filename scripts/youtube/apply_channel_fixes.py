#!/usr/bin/env python3
from __future__ import annotations

import base64
import json
import os
import sys
from pathlib import Path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_ACTIONS = ROOT / 'AcademIA' / 'youtube' / 'youtube_channel_fix_actions_2026-07-27.json'
OUT_DIR = ROOT / 'AcademIA' / 'youtube' / 'reports'
OUT_DIR.mkdir(parents=True, exist_ok=True)
SCOPES = ['https://www.googleapis.com/auth/youtube', 'https://www.googleapis.com/auth/youtube.force-ssl']
TOKEN_ENV_CANDIDATES = [
    'YOUTUBE_TOKEN_JSON',
    'YOUTUBE_OAUTH_TOKEN_JSON',
    'GOOGLE_OAUTH_TOKEN_JSON',
    'YOUTUBE_TOKEN',
    'YOUTUBE_OAUTH_TOKEN',
]
FILE_TOKEN_CANDIDATES = [
    ROOT / 'secrets' / 'youtube_token.json',
    Path('/var/www/oneverso/current/secrets/youtube_token.json'),
    Path('/var/www/oneverso/secrets/youtube_token.json'),
    Path('/root/secrets/youtube_token.json'),
]
SEARCH_ROOTS = [Path('/var/www'), Path('/root'), Path('/home')]
SEARCH_PATTERNS = ['*youtube*token*.json', '*oauth*token*.json', '*google*oauth*.json', '*token*.json', '*.txt', '.env', '.env.*']


def _valid_authorized_user_obj(data):
    return isinstance(data, dict) and data.get('refresh_token') and data.get('client_id') and data.get('client_secret')


def _parse_authorized_user_text(text: str):
    samples = []
    raw = (text or '').strip()
    if raw:
        samples.append(raw)
        stripped = raw.strip('"').strip("'")
        if stripped and stripped not in samples:
            samples.append(stripped)
        try:
            decoded = base64.b64decode(stripped).decode('utf-8', errors='ignore').strip()
            if decoded and decoded not in samples:
                samples.append(decoded)
        except Exception:
            pass
    for sample in samples:
        try:
            data = json.loads(sample)
        except Exception:
            continue
        if _valid_authorized_user_obj(data):
            return data
    return None


def _discover_token_data():
    for name in TOKEN_ENV_CANDIDATES:
        value = os.environ.get(name, '').strip()
        if not value:
            continue
        data = _parse_authorized_user_text(value)
        if data:
            return data, name
    for path in FILE_TOKEN_CANDIDATES:
        try:
            if path.exists():
                data = _parse_authorized_user_text(path.read_text(encoding='utf-8', errors='ignore'))
                if data:
                    return data, str(path)
        except Exception:
            continue
    seen = set()
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
                try:
                    if not path.is_file() or path.stat().st_size > 2_000_000:
                        continue
                    text = path.read_text(encoding='utf-8', errors='ignore')
                except Exception:
                    continue
                data = _parse_authorized_user_text(text)
                if data:
                    return data, rp
                if path.name.startswith('.env'):
                    for raw_line in text.splitlines():
                        line = raw_line.strip()
                        if not line or line.startswith('#') or '=' not in line:
                            continue
                        key, value = line.split('=', 1)
                        if key.strip() in TOKEN_ENV_CANDIDATES:
                            data = _parse_authorized_user_text(value.strip())
                            if data:
                                return data, f'{rp}:{key.strip()}'
    return None, None


def load_credentials() -> Credentials:
    data, used_name = _discover_token_data()
    if not data:
        raise SystemExit('Nenhum secret OAuth do YouTube encontrado nas envs candidatas nem nos arquivos/localizacoes esperados')
    creds = Credentials.from_authorized_user_info(data, scopes=data.get('scopes') or SCOPES)
    if creds.expired and creds.refresh_token:
        creds.refresh(Request())
    if not creds.valid:
        raise SystemExit(f'Credenciais OAuth inválidas usando {used_name}')
    print(f'[auth] secret carregado via {used_name}', flush=True)
    return creds


def yt_service():
    return build('youtube', 'v3', credentials=load_credentials(), cache_discovery=False)


def get_video(service, video_id: str):
    resp = service.videos().list(part='snippet,status', id=video_id).execute()
    items = resp.get('items', [])
    return items[0] if items else None


def update_privacy(service, video_id: str, privacy: str):
    item = get_video(service, video_id)
    if not item:
        return {'ok': False, 'error': 'video_not_found'}
    body = {
        'id': video_id,
        'snippet': {
            'categoryId': item['snippet'].get('categoryId', '27'),
            'title': item['snippet'].get('title', ''),
            'description': item['snippet'].get('description', ''),
        },
        'status': dict(item.get('status', {})),
    }
    body['status']['privacyStatus'] = privacy
    service.videos().update(part='snippet,status', body=body).execute()
    return {'ok': True, 'new_privacy': privacy, 'title': item['snippet'].get('title', '')}


def set_thumbnail(service, video_id: str, thumbnail_path: Path):
    if not thumbnail_path.exists():
        return {'ok': False, 'error': f'thumbnail_missing:{thumbnail_path}'}
    service.thumbnails().set(videoId=video_id, media_body=MediaFileUpload(str(thumbnail_path))).execute()
    return {'ok': True, 'thumbnail_path': str(thumbnail_path.relative_to(ROOT))}


def maybe_update_title(service, video_id: str, new_title: str | None):
    if not new_title:
        return {'ok': True, 'skipped': True}
    item = get_video(service, video_id)
    if not item:
        return {'ok': False, 'error': 'video_not_found'}
    body = {
        'id': video_id,
        'snippet': dict(item['snippet']),
        'status': dict(item.get('status', {})),
    }
    body['snippet']['title'] = new_title
    service.videos().update(part='snippet,status', body=body).execute()
    return {'ok': True, 'title': new_title}


def main():
    actions_path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_ACTIONS
    actions = json.loads(actions_path.read_text(encoding='utf-8'))
    service = yt_service()
    results = []
    for item in actions['items']:
        video_id = item['video_id']
        entry = {
            'video_id': video_id,
            'action': item['action'],
            'notes': item.get('notes', ''),
        }
        try:
            if item['action'] == 'set_private':
                entry['result'] = update_privacy(service, video_id, 'private')
            elif item['action'] == 'set_privacy':
                entry['result'] = update_privacy(service, video_id, item['privacy_status'])
            elif item['action'] == 'set_thumbnail':
                thumb = ROOT / item['thumbnail_repo']
                try:
                    thumb_res = set_thumbnail(service, video_id, thumb)
                except Exception as e:
                    thumb_res = {'ok': False, 'error': str(e)}
                try:
                    title_res = maybe_update_title(service, video_id, item.get('canonical_title'))
                except Exception as e:
                    title_res = {'ok': False, 'error': str(e)}
                entry['result'] = {'thumbnail': thumb_res, 'title': title_res}
            elif item['action'] == 'set_private_and_thumbnail':
                try:
                    priv_res = update_privacy(service, video_id, 'private')
                except Exception as e:
                    priv_res = {'ok': False, 'error': str(e)}
                thumb = ROOT / item['thumbnail_repo']
                try:
                    thumb_res = set_thumbnail(service, video_id, thumb)
                except Exception as e:
                    thumb_res = {'ok': False, 'error': str(e)}
                entry['result'] = {'privacy': priv_res, 'thumbnail': thumb_res}
            else:
                entry['result'] = {'ok': False, 'error': f"unknown_action:{item['action']}"}
        except Exception as e:
            entry['result'] = {'ok': False, 'error': str(e)}
        print(json.dumps(entry, ensure_ascii=False), flush=True)
        results.append(entry)

    out = {
        'date': '2026-07-27',
        'actions_file': str(actions_path.relative_to(ROOT)) if actions_path.is_relative_to(ROOT) else str(actions_path),
        'results': results,
    }
    out_path = OUT_DIR / 'youtube_channel_fix_results_2026-07-27.json'
    out_path.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'[done] {out_path}', flush=True)


if __name__ == '__main__':
    main()
