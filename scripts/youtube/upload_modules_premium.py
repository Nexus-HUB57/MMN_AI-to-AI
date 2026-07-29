#!/usr/bin/env python3
"""Upload premium multi-módulo do canal AcademIA Nexus.

Uso:
    python3 scripts/youtube/upload_modules_premium.py <codigo> [<codigo> ...] [--privacy unlisted|private|public] [--privatize-legacy]

Cada código (00, 01, 02, ...) tem em MODULES: master, thumbnail, description,
title canônico, tags, category e lista opcional de vídeos legados para
privatizar automaticamente ao terminar o upload.
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

CATEGORY_ID = '27'
COMMON_TAGS = [
    'AcademIA Nexus', 'OneVerso', 'IA aplicada', 'Agentes de IA',
    'Automação inteligente', 'Afiliados com IA', 'Marketing com IA',
    'Operação com IA', 'MMN AI to AI', 'Nexus Affil IA te',
]

MODULES: dict[str, dict] = {
    '00': {
        'master': 'AcademIA/youtube/masters/video-00-boas-vindas-a-academia-nexus-master.mp4',
        'thumb':  'AcademIA/youtube/thumbnails_yt/00-boas-vindas-a-academia-nexus.jpg',
        'desc':   'AcademIA/youtube/descriptions/00-boas-vindas-a-academia-nexus.txt',
        'title':  'AcademIA Nexus • 00 | Boas-vindas à AcademIA Nexus',
        'tags':   COMMON_TAGS + ['Boas-vindas', 'Onboarding', 'Fundamentos'],
        'legacy': ['cBhbg51peQk', 'txsJDc1oxps', 'G45HLp3c_4k'],
    },
    '01': {
        'master': 'AcademIA/youtube/masters/video-01-entendendo-o-ioaid-master.mp4',
        'thumb':  'AcademIA/youtube/thumbnails_yt/01-entendendo-o-ioaid.jpg',
        'desc':   'AcademIA/youtube/descriptions/01-entendendo-o-ioaid.txt',
        'title':  'AcademIA Nexus • 01 | Entendendo o IOAID',
        'tags':   COMMON_TAGS + ['IOAID', 'Infraestrutura', 'Fundamentos'],
        'legacy': ['bSabrgNNgik'],
    },
    '02': {
        'master': 'AcademIA/youtube/masters/video-02-o-sistema-sho-self-healing-orchestrator-master.mp4',
        'thumb':  'AcademIA/youtube/thumbnails_yt/02-o-sistema-sho-self-healing-orchestrator.jpg',
        'desc':   'AcademIA/youtube/descriptions/02-o-sistema-sho-self-healing-orchestrator.txt',
        'title':  'AcademIA Nexus • 02 | O Sistema SHO (Self-Healing Orchestrator)',
        'tags':   COMMON_TAGS + ['SHO', 'Self-Healing', 'Resiliência', 'Fundamentos'],
        'legacy': ['eSSXuixQn5Q'],
    },
    '03': {
        'master': 'AcademIA/youtube/masters/video-03-painel-do-afiliado-visao-geral-da-operacao-master.mp4',
        'thumb':  'AcademIA/youtube/thumbnails_yt/03-painel-do-afiliado-visao-geral-da-operacao.jpg',
        'desc':   'AcademIA/youtube/descriptions/03-painel-do-afiliado-visao-geral-da-operacao.txt',
        'title':  'AcademIA Nexus • 03 | Painel do Afiliado — Visão Geral da Operação',
        'tags':   COMMON_TAGS + ['Painel do Afiliado', 'Dashboard', 'Fundamentos'],
        'legacy': ['vkClkh6MSQQ'],
    },
    '04': {
        'master': 'AcademIA/youtube/masters/video-04-construindo-seu-primeiro-agente-em-4-minutos-master.mp4',
        'thumb':  'AcademIA/youtube/thumbnails_yt/04-construindo-seu-primeiro-agente-em-4-minutos.jpg',
        'desc':   'AcademIA/youtube/descriptions/04-construindo-seu-primeiro-agente-em-4-minutos.txt',
        'title':  'AcademIA Nexus • 04 | Construindo Seu Primeiro Agente em 4 Minutos',
        'tags':   COMMON_TAGS + ['Primeiro Agente', 'Agentes de IA', 'Agentes'],
        'legacy': ['b3Oi53XqITs', 'zz32ZJGR7p4'],
    },
    '05': {
        'master': 'AcademIA/youtube/masters/video-05-skills-essenciais-copywriter-audience-segmenter-master.mp4',
        'thumb':  'AcademIA/youtube/thumbnails_yt/05-skills-essenciais-copywriter-audience-segmenter.jpg',
        'desc':   'AcademIA/youtube/descriptions/05-skills-essenciais-copywriter-audience-segmenter.txt',
        'title':  'AcademIA Nexus • 05 | Skills Essenciais — Copywriter + Audience-Segmenter',
        'tags':   COMMON_TAGS + ['Copywriter', 'Audience Segmenter', 'Skills', 'Agentes'],
        'legacy': ['ssaFYNd7WgI', 'w_4l0ALsStc'],
    },
    '06': {
        'master': 'AcademIA/youtube/masters/video-06-disparando-no-whatsapp-em-escala-master.mp4',
        'thumb':  'AcademIA/youtube/thumbnails_yt/06-disparando-no-whatsapp-em-escala.jpg',
        'desc':   'AcademIA/youtube/descriptions/06-disparando-no-whatsapp-em-escala.txt',
        'title':  'AcademIA Nexus • 06 | Disparando no WhatsApp em Escala',
        'tags':   COMMON_TAGS + ['WhatsApp', 'Disparo em Escala', 'Agentes'],
        'legacy': ['wtH1eaSpBuw', '65fqupRFcvQ'],
    },
    '07': {
        'master': 'AcademIA/youtube/masters/video-07-judge-revisor-a-ia-que-decide-por-voce-master.mp4',
        'thumb':  'AcademIA/youtube/thumbnails_yt/07-judge-revisor-a-ia-que-decide-por-voce.jpg',
        'desc':   'AcademIA/youtube/descriptions/07-judge-revisor-a-ia-que-decide-por-voce.txt',
        'title':  'AcademIA Nexus • 07 | Judge Revisor — A IA que Decide por Você',
        'tags':   COMMON_TAGS + ['Judge Revisor', 'Qualidade em IA', 'Agentes'],
        'legacy': ['wfHFfynxU6w', '8ykspV1wLJU'],
    },
    '08': {
        'master': 'AcademIA/youtube/masters/video-08-otimizacao-de-conversao-a-matematica-da-receita-master.mp4',
        'thumb':  'AcademIA/youtube/thumbnails_yt/08-otimizacao-de-conversao-a-matematica-da-receita.jpg',
        'desc':   'AcademIA/youtube/descriptions/08-otimizacao-de-conversao-a-matematica-da-receita.txt',
        'title':  'AcademIA Nexus • 08 | Otimização de Conversão — A Matemática da Receita',
        'tags':   COMMON_TAGS + ['Otimização de Conversão', 'Receita', 'Master'],
        'legacy': ['DR2YwM-Xihw', 'Wn4rheukroY'],
    },
    '09': {
        'master': 'AcademIA/youtube/masters/video-09-funis-e-lifecycle-o-sistema-completo-master.mp4',
        'thumb':  'AcademIA/youtube/thumbnails_yt/09-funis-e-lifecycle-o-sistema-completo.jpg',
        'desc':   'AcademIA/youtube/descriptions/09-funis-e-lifecycle-o-sistema-completo.txt',
        'title':  'AcademIA Nexus • 09 | Funis e Lifecycle — O Sistema Completo',
        'tags':   COMMON_TAGS + ['Funis', 'Lifecycle', 'Master'],
        'legacy': ['i-hkO0TV9ak'],
    },
    '10': {
        'master': 'AcademIA/youtube/masters/video-10-a-b-testing-com-judge-ciencia-da-experimentacao-master.mp4',
        'thumb':  'AcademIA/youtube/thumbnails_yt/10-a-b-testing-com-judge-ciencia-da-experimentacao.jpg',
        'desc':   'AcademIA/youtube/descriptions/10-a-b-testing-com-judge-ciencia-da-experimentacao.txt',
        'title':  'AcademIA Nexus • 10 | A/B Testing com Judge — Ciência da Experimentação',
        'tags':   COMMON_TAGS + ['A/B Testing', 'Experimentação', 'Master'],
        'legacy': ['WhjGWNUdHco'],
    },
    '11': {
        'master': 'AcademIA/youtube/masters/video-11-analise-de-coortes-e-churn-a-arte-de-reter-master.mp4',
        'thumb':  'AcademIA/youtube/thumbnails_yt/11-analise-de-coortes-e-churn-a-arte-de-reter.jpg',
        'desc':   'AcademIA/youtube/descriptions/11-analise-de-coortes-e-churn-a-arte-de-reter.txt',
        'title':  'AcademIA Nexus • 11 | Análise de Coortes e Churn — A Arte de Reter',
        'tags':   COMMON_TAGS + ['Coortes', 'Churn', 'Retenção', 'Master'],
        'legacy': ['VV2a4aZRiS4'],
    },
    '12': {
        'master': 'AcademIA/youtube/masters/video-12-blueprints-elite-o-jogo-do-top-10-master.mp4',
        'thumb':  'AcademIA/youtube/thumbnails_yt/12-blueprints-elite-o-jogo-do-top-10.jpg',
        'desc':   'AcademIA/youtube/descriptions/12-blueprints-elite-o-jogo-do-top-10.txt',
        'title':  'AcademIA Nexus • 12 | Blueprints Elite — O Jogo do Top 10%',
        'tags':   COMMON_TAGS + ['Blueprints Elite', 'Playbooks', 'Elite'],
        'legacy': ['bNZf1fl1xhw'],
    },
    '13': {
        'master': 'AcademIA/youtube/masters/video-13-multi-tenant-e-white-label-na-pratica-master.mp4',
        'thumb':  'AcademIA/youtube/thumbnails_yt/13-multi-tenant-e-white-label-na-pratica.jpg',
        'desc':   'AcademIA/youtube/descriptions/13-multi-tenant-e-white-label-na-pratica.txt',
        'title':  'AcademIA Nexus • 13 | Multi-Tenant e White-Label na Prática',
        'tags':   COMMON_TAGS + ['Multi-Tenant', 'White-Label', 'Elite'],
        'legacy': ['YaRtNYuWFqw'],
    },
    '14': {
        'master': 'AcademIA/youtube/masters/video-14-federacao-de-agentes-zero-trust-master.mp4',
        'thumb':  'AcademIA/youtube/thumbnails_yt/14-federacao-de-agentes-zero-trust.jpg',
        'desc':   'AcademIA/youtube/descriptions/14-federacao-de-agentes-zero-trust.txt',
        'title':  'AcademIA Nexus • 14 | Federação de Agentes Zero-Trust',
        'tags':   COMMON_TAGS + ['Zero-Trust', 'Federação de Agentes', 'Elite'],
        'legacy': ['bwRwb3tghUQ', '4mFsg88GyFM'],
    },
}


def upload_video(service, master: Path, title: str, description: str, tags: list[str], privacy: str) -> dict:
    if not master.exists():
        return {'ok': False, 'error': f'master_missing:{master}'}
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
    media = MediaFileUpload(str(master), chunksize=-1, resumable=True, mimetype='video/mp4')
    request = service.videos().insert(part='snippet,status', body=body, media_body=media)
    response = None
    last = -1
    while response is None:
        status, response = request.next_chunk()
        if status:
            pct = int(status.progress() * 100)
            if pct != last:
                print(f'upload_progress={pct}%', flush=True)
                last = pct
    return {
        'ok': True,
        'video_id': response.get('id'),
        'url': f"https://www.youtube.com/watch?v={response.get('id')}",
        'privacy': response.get('status', {}).get('privacyStatus'),
    }


def set_thumbnail(service, video_id: str, thumb: Path) -> dict:
    if not thumb.exists():
        return {'ok': False, 'error': f'thumbnail_missing:{thumb}'}
    try:
        service.thumbnails().set(videoId=video_id, media_body=MediaFileUpload(str(thumb))).execute()
        return {'ok': True, 'thumbnail_path': str(thumb.relative_to(ROOT))}
    except Exception as exc:  # noqa: BLE001
        return {'ok': False, 'error': str(exc)}


def run_module(service, codigo: str, privacy: str, privatize_legacy: bool) -> dict:
    if codigo not in MODULES:
        return {'ok': False, 'error': f'unknown_module:{codigo}'}
    mod = MODULES[codigo]
    master = ROOT / mod['master']
    thumb = ROOT / mod['thumb']
    desc_file = ROOT / mod['desc']
    description = desc_file.read_text(encoding='utf-8') if desc_file.exists() else mod['title']

    print(f'[start] module={codigo} master={master}', flush=True)
    upload_result = upload_video(service, master, mod['title'], description, mod['tags'], privacy)
    print(json.dumps({'module': codigo, 'upload_result': upload_result}, ensure_ascii=False), flush=True)

    thumb_result = None
    if upload_result.get('ok'):
        thumb_result = set_thumbnail(service, upload_result['video_id'], thumb)
        print(json.dumps({'module': codigo, 'thumb_result': thumb_result}, ensure_ascii=False), flush=True)

    legacy_results = []
    if privatize_legacy and upload_result.get('ok'):
        for legacy_id in mod.get('legacy', []):
            try:
                res = update_privacy(service, legacy_id, 'private')
            except Exception as exc:  # noqa: BLE001
                res = {'ok': False, 'error': str(exc)}
            legacy_results.append({'video_id': legacy_id, 'result': res})
            print(json.dumps({'module': codigo, 'legacy_privacy': legacy_results[-1]}, ensure_ascii=False), flush=True)

    return {
        'module': codigo,
        'title': mod['title'],
        'requested_privacy': privacy,
        'upload_result': upload_result,
        'thumb_result': thumb_result,
        'legacy_results': legacy_results,
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('modules', nargs='+', help='Códigos dos módulos (00, 01, 02, ...)')
    parser.add_argument('--privacy', default='unlisted', choices=['private', 'unlisted', 'public'])
    parser.add_argument('--privatize-legacy', action='store_true')
    parser.add_argument('--report-name', default='youtube_modules_premium_upload_2026-07-29.json')
    args = parser.parse_args()

    creds = load_credentials()
    service = build('youtube', 'v3', credentials=creds, cache_discovery=False)

    results = []
    for codigo in args.modules:
        results.append(run_module(service, codigo, args.privacy, args.privatize_legacy))

    report = {
        'date': '2026-07-29',
        'modules': args.modules,
        'requested_privacy': args.privacy,
        'privatize_legacy': args.privatize_legacy,
        'results': results,
    }
    out_path = OUT_DIR / args.report_name
    out_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'[done] {out_path}', flush=True)

    if not all(r.get('upload_result', {}).get('ok') for r in results):
        sys.exit(1)


if __name__ == '__main__':
    main()
