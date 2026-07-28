#!/usr/bin/env python3
"""Gera um novo refresh token OAuth para o canal AcademIA Nexus.

Este script roda em máquina local (não no VPS). Ele abre o navegador,
pede consentimento com a conta dona do canal, e imprime na tela o
JSON no formato authorized_user pronto para colar no workflow
`youtube-token-rotate` do repositório MMN_AI-to-AI.

Pré-requisitos:
    pip install --user google-auth-oauthlib google-auth google-api-python-client

Uso:
    # Exporte o client_id e o client_secret oficiais do projeto
    # (obter no Google Cloud Console; nunca comitar esses valores).
    export YOUTUBE_CLIENT_ID="<seu-client-id>.apps.googleusercontent.com"
    export YOUTUBE_CLIENT_SECRET="<seu-client-secret>"
    python3 scripts/youtube/generate_refresh_token_local.py

Depois de concluir o consentimento no navegador, o script imprime
duas coisas no terminal:
    1) O refresh_token puro (para colar no input do workflow).
    2) O JSON authorized_user completo (backup local, NÃO COMITAR).

Confirme que a conta usada no navegador é a dona do canal
UCRBIjE5zxufWHR9lVmHRVGw antes de aprovar o consentimento.
"""
from __future__ import annotations

import json
import os
import sys

try:
    from google_auth_oauthlib.flow import InstalledAppFlow
except ImportError:
    print('missing_dependency: pip install google-auth-oauthlib', file=sys.stderr)
    sys.exit(2)

SCOPES = [
    'https://www.googleapis.com/auth/youtube',
    'https://www.googleapis.com/auth/youtube.force-ssl',
    'https://www.googleapis.com/auth/youtube.upload',
]

CLIENT_ID = os.environ.get('YOUTUBE_CLIENT_ID', '').strip()
CLIENT_SECRET = os.environ.get('YOUTUBE_CLIENT_SECRET', '').strip()


def main():
    if not CLIENT_ID or not CLIENT_SECRET:
        print('Defina YOUTUBE_CLIENT_ID e YOUTUBE_CLIENT_SECRET nas envs antes de rodar.', file=sys.stderr)
        sys.exit(2)

    client_config = {
        'installed': {
            'client_id': CLIENT_ID,
            'client_secret': CLIENT_SECRET,
            'auth_uri': 'https://accounts.google.com/o/oauth2/auth',
            'token_uri': 'https://oauth2.googleapis.com/token',
            'redirect_uris': ['http://localhost', 'http://localhost:8080'],
        }
    }

    flow = InstalledAppFlow.from_client_config(client_config, SCOPES)
    creds = flow.run_local_server(port=8080, prompt='consent', access_type='offline')

    if not creds.refresh_token:
        print('O Google não retornou refresh_token. Rode novamente com prompt=consent e access_type=offline.', file=sys.stderr)
        sys.exit(3)

    authorized_user = {
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'refresh_token': creds.refresh_token,
        'token_uri': 'https://oauth2.googleapis.com/token',
        'type': 'authorized_user',
        'scopes': SCOPES,
    }

    print('\n===== REFRESH_TOKEN (cole apenas isto no input do workflow) =====')
    print(creds.refresh_token)
    print('\n===== JSON authorized_user completo (backup local — nunca comitar) =====')
    print(json.dumps(authorized_user, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
