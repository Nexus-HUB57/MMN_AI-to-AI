#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

from apply_channel_fixes import load_credentials
from googleapiclient.discovery import build

ROOT = Path(__file__).resolve().parents[2]
OUT_DIR = ROOT / 'AcademIA' / 'youtube' / 'reports'
OUT_DIR.mkdir(parents=True, exist_ok=True)
OUT = OUT_DIR / 'youtube_auth_context_2026-07-28.json'

TARGETS = [
    'cBhbg51peQk',
    'CXglMrEOab0',
    '9yNu41LmXYQ',
    'txsJDc1oxps',
    'eSSXuixQn5Q',
    'vkClkh6MSQQ',
    'bwRwb3tghUQ',
    'YaRtNYuWFqw',
    'bNZf1fl1xhw',
    'VV2a4aZRiS4',
    'i-hkO0TV9ak',
    'DR2YwM-Xihw',
    'b3Oi53XqITs',
    'wfHFfynxU6w',
    'wtH1eaSpBuw',
    'ssaFYNd7WgI',
]


def main():
    creds = load_credentials()
    scopes = list(getattr(creds, 'scopes', None) or [])
    service = build('youtube', 'v3', credentials=creds, cache_discovery=False)

    channels_resp = service.channels().list(part='snippet,contentDetails,statistics', mine=True).execute()
    channels = []
    for item in channels_resp.get('items', []):
        channels.append({
            'id': item.get('id'),
            'title': item.get('snippet', {}).get('title'),
            'customUrl': item.get('snippet', {}).get('customUrl'),
            'publishedAt': item.get('snippet', {}).get('publishedAt'),
            'relatedPlaylists': item.get('contentDetails', {}).get('relatedPlaylists', {}),
            'statistics': item.get('statistics', {}),
        })

    target_results = []
    for vid in TARGETS:
        try:
            resp = service.videos().list(part='snippet,status', id=vid).execute()
            items = resp.get('items', [])
            if not items:
                target_results.append({'video_id': vid, 'found': False})
                continue
            item = items[0]
            target_results.append({
                'video_id': vid,
                'found': True,
                'channelId': item.get('snippet', {}).get('channelId'),
                'channelTitle': item.get('snippet', {}).get('channelTitle'),
                'title': item.get('snippet', {}).get('title'),
                'privacyStatus': item.get('status', {}).get('privacyStatus'),
            })
        except Exception as e:
            target_results.append({'video_id': vid, 'found': False, 'error': str(e)})

    out = {
        'date': '2026-07-28',
        'scopes': scopes,
        'channels_mine': channels,
        'targets': target_results,
    }
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding='utf-8')
    print(OUT)


if __name__ == '__main__':
    main()
