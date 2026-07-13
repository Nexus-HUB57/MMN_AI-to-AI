#!/usr/bin/env python3
from __future__ import annotations
import argparse, json, os, subprocess, sys, time
from pathlib import Path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from googleapiclient.http import MediaFileUpload

ROOT = Path('/var/www/oneverso/current')
MANIFEST_DEFAULT = ROOT / 'AcademIA' / 'youtube' / 'upload_batch_ready.json'
RESULTS_DEFAULT = ROOT / 'AcademIA' / 'youtube' / 'upload_results.json'
TOKEN_FILE = ROOT / 'secrets' / 'youtube_token.json'
CHANNEL_HANDLE = '@NexusAffilIAte-w9p'
SCOPES = ['https://www.googleapis.com/auth/youtube.upload', 'https://www.googleapis.com/auth/youtube.force-ssl']
DB_NAME = 'nexus_prod'


def load_credentials() -> Credentials:
    if not TOKEN_FILE.exists():
        raise SystemExit(f'token file ausente: {TOKEN_FILE}')
    data = json.loads(TOKEN_FILE.read_text())
    creds = Credentials.from_authorized_user_info(data, scopes=data.get('scopes') or SCOPES)
    if creds.expired and creds.refresh_token:
        creds.refresh(Request())
        TOKEN_FILE.write_text(creds.to_json())
    if not creds.valid:
        raise SystemExit('credenciais OAuth inválidas para YouTube')
    return creds


def get_service():
    creds = load_credentials()
    return build('youtube', 'v3', credentials=creds, cache_discovery=False)


def get_existing_titles_and_ids(youtube):
    existing_titles = {}
    uploads_playlist = None
    channel_resp = youtube.channels().list(part='contentDetails,snippet', mine=True).execute()
    items = channel_resp.get('items', [])
    if items:
        uploads_playlist = items[0]['contentDetails']['relatedPlaylists']['uploads']
    if not uploads_playlist:
        return existing_titles
    page_token = None
    while True:
        resp = youtube.playlistItems().list(
            part='snippet,contentDetails', playlistId=uploads_playlist, maxResults=50, pageToken=page_token
        ).execute()
        for item in resp.get('items', []):
            title = (item.get('snippet', {}) or {}).get('title', '').strip()
            video_id = (item.get('contentDetails', {}) or {}).get('videoId', '')
            if title and video_id:
                existing_titles[title] = video_id
        page_token = resp.get('nextPageToken')
        if not page_token:
            break
    return existing_titles


def load_json(path: Path, default):
    if path.exists():
        return json.loads(path.read_text())
    return default


def upload_video(youtube, item):
    body = {
        'snippet': {
            'title': item['youtube_title'],
            'description': item['description'],
            'tags': item.get('tags', []),
            'categoryId': item.get('category_id', '27'),
        },
        'status': {
            'privacyStatus': item.get('privacy_status', 'unlisted'),
            'selfDeclaredMadeForKids': bool(item.get('made_for_kids', False)),
        }
    }
    media = MediaFileUpload(item['video_path'], chunksize=-1, resumable=True)
    request = youtube.videos().insert(part='snippet,status', body=body, media_body=media)
    response = None
    while response is None:
        status, response = request.next_chunk()
        if status:
            pct = int(status.progress() * 100)
            print(f"upload {item['code']} {pct}%", flush=True)
    return response['id']


def set_thumbnail(youtube, video_id: str, thumbnail_path: str):
    if not thumbnail_path or not Path(thumbnail_path).exists():
        return False
    youtube.thumbnails().set(videoId=video_id, media_body=MediaFileUpload(thumbnail_path)).execute()
    return True


def sync_db(video_id: str, item: dict):
    lesson_ids = item.get('db_lessons') or []
    if not lesson_ids:
        return 0
    lessons_sql = ','.join("'" + x.replace("'", "''") + "'" for x in lesson_ids)
    privacy = item.get('privacy_status', 'unlisted').replace("'", "''")
    sql = f"UPDATE academia_lessons SET youtube_video_id='{video_id}', youtube_status='{privacy}', youtube_channel='{CHANNEL_HANDLE}', updated_at=now(), updated_by='youtube-batch-uploader' WHERE lesson_id IN ({lessons_sql}); SELECT COUNT(*) FROM academia_lessons WHERE lesson_id IN ({lessons_sql}) AND youtube_video_id='{video_id}';"
    cmd = ['sudo', '-u', 'postgres', 'psql', DB_NAME, '-At', '-c', sql]
    res = subprocess.run(cmd, capture_output=True, text=True, check=True)
    out = [x.strip() for x in res.stdout.splitlines() if x.strip()]
    return int(out[-1]) if out else 0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--manifest', default=str(MANIFEST_DEFAULT))
    ap.add_argument('--results', default=str(RESULTS_DEFAULT))
    ap.add_argument('--limit', type=int, default=0)
    ap.add_argument('--dry-run', action='store_true')
    args = ap.parse_args()

    manifest_path = Path(args.manifest)
    results_path = Path(args.results)
    manifest = load_json(manifest_path, [])
    results = load_json(results_path, {'uploaded': []})
    uploaded_by_title = {x['youtube_title']: x for x in results.get('uploaded', [])}

    youtube = get_service()
    existing = get_existing_titles_and_ids(youtube)
    print(f'existing_titles={len(existing)}')

    queue = [x for x in manifest if x.get('ready')]
    if args.limit:
        queue = queue[:args.limit]
    print(f'queue={len(queue)} dry_run={args.dry_run}')

    for item in queue:
        title = item['youtube_title']
        if title in uploaded_by_title:
            print(f"skip results {title}")
            continue
        if title in existing:
            print(f"skip existing channel {title} -> {existing[title]}")
            results.setdefault('uploaded', []).append({
                'code': item['code'], 'youtube_title': title, 'video_id': existing[title],
                'url': f'https://www.youtube.com/watch?v={existing[title]}', 'db_rows_synced': 0, 'status': 'exists'
            })
            results_path.write_text(json.dumps(results, ensure_ascii=False, indent=2))
            continue
        if args.dry_run:
            print(f"dry-run upload {item['code']} | {title}")
            continue
        try:
            video_id = upload_video(youtube, item)
            thumb_ok = False
            try:
                thumb_ok = set_thumbnail(youtube, video_id, item.get('thumbnail_path', ''))
            except Exception as te:
                print(f'thumbnail warning {item["code"]}: {te}')
            db_rows = 0
            try:
                db_rows = sync_db(video_id, item)
            except Exception as de:
                print(f'db sync warning {item["code"]}: {de}')
            rec = {
                'code': item['code'],
                'youtube_title': title,
                'video_id': video_id,
                'url': f'https://www.youtube.com/watch?v={video_id}',
                'thumbnail_set': thumb_ok,
                'db_rows_synced': db_rows,
                'status': item.get('privacy_status', 'unlisted'),
                'uploaded_at': int(time.time()),
            }
            print(json.dumps(rec, ensure_ascii=False))
            results.setdefault('uploaded', []).append(rec)
            results_path.write_text(json.dumps(results, ensure_ascii=False, indent=2))
        except HttpError as e:
            print(f'upload error {item["code"]}: {e}', file=sys.stderr)
            results.setdefault('errors', []).append({'code': item['code'], 'title': title, 'error': str(e)})
            results_path.write_text(json.dumps(results, ensure_ascii=False, indent=2))
    print(f'results_saved={results_path}')

if __name__ == '__main__':
    main()
