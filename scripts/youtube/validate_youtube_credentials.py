#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from pathlib import Path

from google.auth.exceptions import RefreshError
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

from apply_channel_fixes import SCOPES, _discover_token_data

DATE = '2026-07-29'


def main() -> int:
    parser = argparse.ArgumentParser(description='Valida o secret OAuth atual do YouTube e gera um relatório seguro.')
    parser.add_argument('--report', required=True, help='Caminho do JSON de saída')
    args = parser.parse_args()

    report_path = Path(args.report)
    report_path.parent.mkdir(parents=True, exist_ok=True)

    data, source = _discover_token_data()
    report: dict[str, object] = {
        'date': DATE,
        'source': source,
        'token_found': bool(data),
        'refresh_token_present': bool(data and data.get('refresh_token')),
        'scopes_in_secret': data.get('scopes') if isinstance(data, dict) else [],
        'oauth_valid': False,
    }

    if not data:
        report['error'] = 'oauth_secret_not_found'
        report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
        print(json.dumps(report, ensure_ascii=False))
        return 1

    try:
        creds = Credentials.from_authorized_user_info(data, scopes=data.get('scopes') or SCOPES)
        if creds.expired and creds.refresh_token:
            creds.refresh(Request())
        if not creds.valid:
            raise RuntimeError('oauth_credentials_invalid_after_refresh')

        youtube = build('youtube', 'v3', credentials=creds, cache_discovery=False)
        channels = youtube.channels().list(part='id,snippet', mine=True).execute().get('items', [])
        first = channels[0] if channels else {}
        report.update(
            {
                'oauth_valid': True,
                'channel_accessible': bool(channels),
                'channel_id': first.get('id'),
                'channel_title': (first.get('snippet') or {}).get('title'),
            }
        )
    except RefreshError as exc:
        report.update(
            {
                'error_type': 'RefreshError',
                'error': str(exc),
            }
        )
        report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
        print(json.dumps(report, ensure_ascii=False))
        return 2
    except Exception as exc:  # noqa: BLE001
        report.update(
            {
                'error_type': type(exc).__name__,
                'error': str(exc),
            }
        )
        report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
        print(json.dumps(report, ensure_ascii=False))
        return 3

    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps(report, ensure_ascii=False))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
