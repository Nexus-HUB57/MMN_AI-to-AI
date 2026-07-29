#!/usr/bin/env python3
"""Upload premium do módulo 00 (Boas-vindas à AcademIA Nexus) ao canal oficial.

Ações:
- Faz upload do master canônico premium para o canal.
- Aplica thumbnail canônica do módulo 00.
- Registra o resultado (video_id novo, url, tamanho) em relatório JSON.
- Se `--privatize-legacy` estiver ativo e o token tiver escopo suficiente,
  privatiza automaticamente os vídeos legados listados em LEGACY_IDS.

Requer secret OAuth com escopo `youtube.upload` (para publicar) e
`youtube.force-ssl` (para privatizar legados).
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from apply_channel_fixes import load_credentials, update_privacy
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

ROOT = Path(__file__).resolve().parents[2]
OUT_DIR = ROOT / 'AcademIA' / 'youtube' / 'reports'
OUT_DIR.mkdir(parents=True, exist_ok=True)
OUT = OUT_DIR / 'youtube_module00_premium_upload_2026-07-28.json'

MASTER = ROOT / 'AcademIA' / 'youtube' / 'masters' / 'video-00-boas-vindas-a-academia-nexus-master.mp4'
THUMBNAIL = ROOT / 'AcademIA' / 'youtube' / 'thumbnails_yt' / '00-boas-vindas-a-academia-nexus.jpg'
DESCRIPTION_FILE = ROOT / 'AcademIA' / 'youtube' / 'descriptions' / '00-boas-vindas-a-academia-nexus.txt'

CANONICAL_TITLE = 'AcademIA Nexus • 00 | Boas-vindas à AcademIA Nexus'
CANONICAL_TAGS = [
    'AcademIA Nexus', 'OneVerso', 'IA aplicada', 'Agentes de IA',
    'Automação inteligente', 'Afiliados com IA', 'Marketing com IA',
    'Operação com IA', 'MMN AI to AI', 'boas-vindas',
    'academia nexus', 'onboarding', 'Fundamentos', 'Nexus Affil IA te',
    'Cartão de visita Nexus',
]
CATEGORY_ID = '27'  # Education
DEFAULT_PRIVACY = 'unlisted'

LEGACY_IDS = [
    'cBhbg51peQk',
    'txsJDc1oxps',
    'G45HLp3c_4k',
]


def upload_video(service, title: str, description: str, tags: list[str], privacy: str):
    if not MASTER.exists():
        return {'ok': False, 'error': f'master_missing:{MASTER}'}
    body = {
        'snippet': {
            'title': title,
            'description': description,
            'tags': tags,
            'categoryId': CATEGORY_ID,
        },
        'status': {
            'privacyStatus': privacy,
            'selfDeclaredMadeForKids': False,
        },
    }
    media = MediaFileUpload(str(MASTER), chunksize=-1, resumable=True, mimetype='video/mp4')
    request = service.videos().insert(part='snippet,status', body=body, media_body=media)
    response = None
    last_progress = -1
    while response is None:
        status, response = request.next_chunk()
        if status:
            pct = int(status.progress() * 100)
            if pct != last_progress:
                print(f'upload_progress={pct}%', flush=True)
                last_progress = pct
    return {
        'ok': True,
        'video_id': response.get('id'),
        'url': f"https://www.youtube.com/watch?v={response.get('id')}",
        'privacy': response.get('status', {}).get('privacyStatus'),
    }


def set_thumbnail_safe(service, video_id: str):
    if not THUMBNAIL.exists():
        return {'ok': False, 'error': f'thumbnail_missing:{THUMBNAIL}'}
    try:
        service.thumbnails().set(videoId=video_id, media_body=MediaFileUpload(str(THUMBNAIL))).execute()
        return {'ok': True, 'thumbnail_path': str(THUMBNAIL.relative_to(ROOT))}
    except Exception as e:  # noqa: BLE001
        return {'ok': False, 'error': str(e)}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--privacy', default=DEFAULT_PRIVACY, choices=['private', 'unlisted', 'public'])
    parser.add_argument('--privatize-legacy', action='store_true')
    args = parser.parse_args()

    description = DESCRIPTION_FILE.read_text(encoding='utf-8') if DESCRIPTION_FILE.exists() else CANONICAL_TITLE

    creds = load_credentials()
    service = build('youtube', 'v3', credentials=creds, cache_discovery=False)

    print(f'[start] uploading master={MASTER}', flush=True)
    upload_result = upload_video(service, CANONICAL_TITLE, description, CANONICAL_TAGS, args.privacy)
    print(json.dumps({'upload_result': upload_result}, ensure_ascii=False), flush=True)

    thumb_result = None
    if upload_result.get('ok'):
        thumb_result = set_thumbnail_safe(service, upload_result['video_id'])
        print(json.dumps({'thumbnail_result': thumb_result}, ensure_ascii=False), flush=True)

    legacy_results = []
    if args.privatize_legacy:
        for legacy_id in LEGACY_IDS:
            try:
                res = update_privacy(service, legacy_id, 'private')
            except Exception as e:  # noqa: BLE001
                res = {'ok': False, 'error': str(e)}
            legacy_results.append({'video_id': legacy_id, 'result': res})
            print(json.dumps({'legacy_privacy_result': legacy_results[-1]}, ensure_ascii=False), flush=True)

    report = {
        'date': '2026-07-28',
        'master_master_source': str(MASTER.relative_to(ROOT)),
        'requested_privacy': args.privacy,
        'canonical_title': CANONICAL_TITLE,
        'upload_result': upload_result,
        'thumbnail_result': thumb_result,
        'legacy_privacy_results': legacy_results,
    }
    OUT.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'[done] {OUT}', flush=True)
    if not upload_result.get('ok'):
        sys.exit(1)


if __name__ == '__main__':
    main()
