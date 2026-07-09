#!/usr/bin/env python3
"""AcademIA Nexus - YouTube Republish
1. Deleta os 10 vídeos genéricos antigos do canal
2. Faz reupload dos 11 vídeos refeitos (04-08, 14, 09-13) como PRIVATE
3. Sincroniza DB e AcademIA/youtube/upload_results.json
"""
from __future__ import annotations
import json, subprocess, sys, time
from pathlib import Path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from googleapiclient.http import MediaFileUpload

ROOT = Path('/var/www/oneverso/current')
TOKEN = ROOT / 'secrets' / 'youtube_token.json'
RESULTS = ROOT / 'AcademIA' / 'youtube' / 'upload_results.json'
DELETED = ROOT / 'AcademIA' / 'youtube' / 'deleted_generics.json'
CHANNEL = '@NexusAffilIAte-w9p'

# Lesson mapping for each video code
LESSON_MAP = {
    "00": ["fund-00"],
    "01": ["fund-01"],
    "02": ["fund-02"],
    "03": ["fund-03"],
    "04": ["agent-00"],
    "05": ["agent-01"],
    "06": ["agent-02"],
    "07": ["agent-03"],
    "08": [],   # master-00 optional
    "09": ["master-01"],
    "10": ["master-02"],
    "11": ["master-03"],
    "12": ["elite-01"],
    "13": ["elite-02"],
    "14": [],   # elite standalone
}


def load_creds():
    data = json.loads(TOKEN.read_text())
    creds = Credentials.from_authorized_user_info(data, scopes=data.get('scopes'))
    if creds.expired and creds.refresh_token:
        creds.refresh(Request())
        TOKEN.write_text(creds.to_json())
    return creds


def yt():
    return build('youtube', 'v3', credentials=load_creds(), cache_discovery=False)


def step_delete_generics():
    print("=" * 60)
    print("PASSO 1: Deletar vídeos genéricos do canal")
    print("=" * 60)
    if not RESULTS.exists():
        print("Sem upload_results.json - nada a deletar")
        return []
    r = json.loads(RESULTS.read_text())
    to_delete = [x for x in r.get('uploaded', []) if x.get('video_id') and x.get('code') in {"04","05","06","07","08","14"}]
    print(f"vai deletar {len(to_delete)} vídeos genéricos:")
    for x in to_delete:
        print(f"  - {x['code']} {x['video_id']} · {x.get('youtube_title')}")
    y = yt()
    deleted = []
    for x in to_delete:
        try:
            y.videos().delete(id=x['video_id']).execute()
            print(f"  ✓ deletado {x['code']} {x['video_id']}")
            deleted.append(x)
        except HttpError as e:
            print(f"  ✗ erro {x['code']}: {e}")
    DELETED.write_text(json.dumps(deleted, ensure_ascii=False, indent=2))
    # Rewrite upload_results without the deleted ones
    remaining = [x for x in r.get('uploaded', []) if x not in deleted]
    r['uploaded'] = remaining
    RESULTS.write_text(json.dumps(r, ensure_ascii=False, indent=2))
    return deleted


def _sanitize(s):
    # YouTube rejects '<' and '>' in description
    return s.replace('<', '≤ ').replace('>', '≥ ')

def _description(code, title, series, summary, bullets, next_code=None, next_title=None):
    n = f"Próximo vídeo sugerido: {next_code} — {next_title}" if next_code else "Continue explorando a AcademIA Nexus."
    body = (
        f"{title}\n\n"
        f"Neste episódio da AcademIA Nexus, você aprende {summary}\n\n"
        "O que você vai ver:\n" + "\n".join(f"- {b}" for b in bullets) + "\n\n"
        f"Série: {series}\n"
        f"Código da aula: {code}\n"
        f"Canal oficial: https://www.youtube.com/{CHANNEL}\n"
        "Plataforma: https://oneverso.com.br/academia/ead/curso\n"
        "Portal: https://oneverso.com.br\n\n"
        f"{n}\n\n"
        "#AcademIANexus #OneVerso #AgentesDeIA #AutomacaoInteligente\n"
    )
    return _sanitize(body)


VIDEOS = [
    # (code, series, title, mp4_filename, thumbnail_name, summary, bullets)
    ("04", "Agente", "Seu Primeiro Agente em 4 Minutos",
     "video-04-seu-primeiro-agente.mp4", "04-construindo-seu-primeiro-agente-em-4-minutos.jpg",
     "como construir seu primeiro agente útil com objetivo claro, uma skill principal e canal de saída real.",
     ["Estrutura mínima de um agente em produção", "Como sair do zero rapidamente", "Validação com Judge Revisor + ativação gradual"]),
    ("05", "Agente", "Skills Essenciais — Copywriter + Audience-Segmenter",
     "video-05-skills-essenciais.mp4", "05-skills-essenciais-copywriter-audience-segmenter.jpg",
     "como as skills Copywriter e Audience-Segmenter transformam base bruta em marketing preditivo.",
     ["Copywriter · comunicação cirúrgica por canal e perfil", "Audience-Segmenter · clusters A/B/C/D", "Combinação = marketing preditivo real"]),
    ("06", "Agente", "Disparando no WhatsApp em Escala",
     "video-06-disparo-no-whatsapp-em-escala.mp4", "06-disparando-no-whatsapp-em-escala.jpg",
     "como estruturar disparo em escala com API oficial, cadência respeitosa e ganho medido de conversão.",
     ["5 regras de escala sustentável", "Cadência de 4 contatos com propósito", "3-5× mais conversão vs disparo bruto"]),
    ("07", "Agente", "Judge Revisor — A IA que Decide por Você",
     "video-07-judge-revisor.mp4", "07-judge-revisor-a-ia-que-decide-por-voce.jpg",
     "como o Judge Revisor valida cada mensagem em 5 critérios e eleva qualidade operacional.",
     ["5 critérios (tom · conformidade · persuasão · contexto · histórico)", "Decisão automática nota ≥ 7.5", "-90% em reclamação · +15-25% em conversão"]),
    ("08", "Master", "Otimização de Conversão — A Matemática da Receita",
     "video-08-otimizacao-de-conversao.mp4", "08-otimizacao-de-conversao-a-matematica-da-receita.jpg",
     "os princípios da otimização de conversão e as 4 alavancas que multiplicam receita.",
     ["Fórmula fundamental da receita", "Alavancas: conversão · ticket · frequência", "Priorização por impacto, não por sentimento"]),
    ("09", "Master", "Funis e Lifecycle — O Sistema Completo",
     "video-09-funis-e-lifecycle.mp4", "09-funis-e-lifecycle-o-sistema-completo.jpg",
     "as 7 etapas do lifecycle do lead e como triggers automatizados transformam funil em máquina.",
     ["7 etapas do lifecycle (Descoberta → Retenção)", "Etapa 7 · 90% da receita futura", "Triggers automáticos por etapa"]),
    ("10", "Master", "A/B Testing com Judge — Ciência da Experimentação",
     "video-10-a-b-testing-com-judge.mp4", "10-a-b-testing-com-judge-ciencia-da-experimentacao.jpg",
     "os 8 componentes obrigatórios de um A/B test válido e como o Judge automatiza rigor estatístico.",
     ["8 componentes: hipótese · métrica · baseline · amostra · duração · significância · sem peeking · isolamento", "95% de confiança, p < 0.05", "Judge = ciência plugada no funil"]),
    ("11", "Master", "Análise de Coortes e Churn — A Arte de Reter",
     "video-11-coortes-e-churn.mp4", "11-analise-de-coortes-e-churn-a-arte-de-reter.jpg",
     "como ler heatmaps de coortes, identificar ponto de churn e agir antes do cliente sair.",
     ["3 insights do heatmap semanal", "Onde o churn concentra revela o problema", "Modelo preditivo com 4 sinais + score verde/amarelo/vermelho"]),
    ("12", "Elite", "Blueprints Elite — O Jogo do Top 10%",
     "video-12-blueprints-elite.mp4", "12-blueprints-elite-o-jogo-do-top-10.jpg",
     "os 3 blueprints que separam o afiliado comum do operador de elite.",
     ["Blueprint 1 · Multi-canal orquestrado", "Blueprint 2 · Multi-tenant e white-label", "Blueprint 3 · Federação de agentes zero-trust"]),
    ("13", "Elite", "Multi-Tenant e White-Label na Prática",
     "video-13-multi-tenant-e-white-label.mp4", "13-multi-tenant-e-white-label-na-pratica.jpg",
     "os 6 passos de configuração multi-tenant e white-label que transformam afiliado em plataforma.",
     ["6 passos de provisionamento", "Isolamento de dados nativo do SHO", "White-label completo em 5 minutos"]),
    ("14", "Elite", "Federação de Agentes Zero-Trust",
     "video-14-federacao-de-agentes-zero-trust.mp4", "14-federacao-de-agentes-zero-trust.jpg",
     "os 5 princípios de federação zero-trust que permitem escalar de 10 para 100 agentes com governança.",
     ["Menor privilégio · escopo limitado", "Auditoria total · identidades revogáveis", "Políticas centralizadas · comunicação assinada"]),
]


def sync_db(code, video_id):
    lessons = LESSON_MAP.get(code, [])
    if not lessons:
        return 0
    ids = ",".join("'" + x.replace("'", "''") + "'" for x in lessons)
    sql = f"UPDATE academia_lessons SET youtube_video_id='{video_id}', youtube_status='private', youtube_channel='{CHANNEL}', updated_at=now(), updated_by='onda-34-republish' WHERE lesson_id IN ({ids});"
    res = subprocess.run(["sudo", "-u", "postgres", "psql", "nexus_prod", "-c", sql], capture_output=True, text=True)
    return len(lessons)


def step_upload(privacy='private'):
    print("=" * 60)
    print(f"PASSO 2: Upload dos 11 videos refeitos como {privacy.upper()}")
    print("=" * 60)
    y = yt()
    # Existing titles to avoid duplicates
    ch = y.channels().list(part='contentDetails', mine=True).execute()
    up_pl = ch['items'][0]['contentDetails']['relatedPlaylists']['uploads']
    existing = {}
    tok = None
    while True:
        resp = y.playlistItems().list(part='snippet,contentDetails', playlistId=up_pl, maxResults=50, pageToken=tok).execute()
        for it in resp.get('items', []):
            existing[it['snippet']['title'].strip()] = it['contentDetails']['videoId']
        tok = resp.get('nextPageToken')
        if not tok:
            break
    print(f"existing_titles={len(existing)}")

    results = json.loads(RESULTS.read_text()) if RESULTS.exists() else {"uploaded": []}
    uploaded = results.setdefault('uploaded', [])
    uploaded_by_code = {u.get('code'): u for u in uploaded}

    for code, series, title, mp4, thumb_name, summary, bullets in VIDEOS:
        # Skip if already correctly uploaded with same title/content
        # v2 suffix for the 6 replaced videos so they don't collide with the deprecated ones we cannot delete
        needs_v2 = code in {"04","05","06","07","08","14"}
        y_title = (f"AcademIA Nexus • {code} | {title}" + (" · v2" if needs_v2 else ""))[:100]
        if y_title in existing:
            print(f"[skip] {code} já existe: {existing[y_title]}")
            continue
        # Find next in series for CTA
        idx = next((i for i, v in enumerate(VIDEOS) if v[0] == code), None)
        if idx is not None and idx + 1 < len(VIDEOS):
            next_code = VIDEOS[idx + 1][0]
            next_title = VIDEOS[idx + 1][2]
        else:
            next_code = None
            next_title = None
        desc = _description(code, title, series, summary, bullets, next_code, next_title)
        mp4_path = ROOT / 'public' / 'academia' / 'videos' / mp4
        if not mp4_path.exists():
            print(f"[erro] mp4 ausente para {code}: {mp4_path}")
            continue
        body = {
            'snippet': {
                'title': y_title,
                'description': desc,
                'tags': ['AcademIA Nexus', 'OneVerso', 'Agentes de IA', 'Automação inteligente', 'IA aplicada', series, title],
                'categoryId': '27',
            },
            'status': {
                'privacyStatus': privacy,
                'selfDeclaredMadeForKids': False,
            }
        }
        try:
            req = y.videos().insert(part='snippet,status', body=body, media_body=MediaFileUpload(str(mp4_path), chunksize=-1, resumable=True))
            resp = None
            while resp is None:
                status, resp = req.next_chunk()
                if status:
                    print(f"  upload {code} {int(status.progress()*100)}%")
            vid = resp['id']
            print(f"[ok] {code} -> {vid}")
            # thumbnail
            thumb_path = ROOT / 'AcademIA' / 'youtube' / 'thumbnails_yt' / thumb_name
            thumb_ok = False
            if thumb_path.exists():
                try:
                    y.thumbnails().set(videoId=vid, media_body=MediaFileUpload(str(thumb_path))).execute()
                    thumb_ok = True
                except HttpError as te:
                    print(f"  thumbnail warn {code}: {te}")
            # db
            rows = sync_db(code, vid)
            rec = {
                'code': code, 'youtube_title': y_title, 'video_id': vid,
                'url': f'https://www.youtube.com/watch?v={vid}',
                'thumbnail_set': thumb_ok, 'db_rows_synced': rows,
                'status': privacy, 'uploaded_at': int(time.time()),
            }
            uploaded.append(rec)
            RESULTS.write_text(json.dumps(results, ensure_ascii=False, indent=2))
        except HttpError as e:
            print(f"[erro] {code}: {e}")
            results.setdefault('errors', []).append({'code': code, 'title': y_title, 'error': str(e)})
            RESULTS.write_text(json.dumps(results, ensure_ascii=False, indent=2))
    print("\nFEITO.")


if __name__ == '__main__':
    action = sys.argv[1] if len(sys.argv) > 1 else 'all'
    if action in ('delete', 'all'):
        step_delete_generics()
    if action in ('upload', 'all'):
        step_upload(privacy='private')
    print("Concluído.")
