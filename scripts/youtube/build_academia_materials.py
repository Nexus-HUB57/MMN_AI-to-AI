#!/usr/bin/env python3
from __future__ import annotations
import csv, json, re, shutil, subprocess, unicodedata
from pathlib import Path

ROOT = Path('/var/www/oneverso/current')
OUT = ROOT / 'AcademIA' / 'youtube'
DESC = OUT / 'descriptions'
THUMBS = OUT / 'thumbnails'

GLOBAL_TAGS = [
    'AcademIA Nexus', 'OneVerso', 'IA aplicada', 'Agentes de IA',
    'Automação inteligente', 'Afiliados com IA', 'Marketing com IA',
    'Operação com IA', 'MMN AI to AI'
]

CATALOG = [
    {'code':'00','series':'Fundamentos','title':'Boas-vindas à AcademIA Nexus','summary':'visão geral da AcademIA, trilhas de aprendizagem, lógica da plataforma e próximos passos para iniciar sua jornada.','video_rel':'public/academia/videos/video-00-boas-vindas-full.mp4','thumb_src':'AcademIA/videos/thumbnails/thumb-00-boas-vindas.png','db_lessons':['fund-00'],'ready':True,'keywords':['boas-vindas','academia nexus','onboarding','trilhas de aprendizagem']},
    {'code':'01','series':'Fundamentos','title':'Entendendo o IOAID','summary':'introdução à infraestrutura operacional de inteligência distribuída e ao modelo de orquestração que sustenta a operação Nexus.','video_rel':'public/academia/videos/video-01-ioaid.mp4','thumb_src':'AcademIA/videos/thumbnails/thumb-01-ioaid.png','db_lessons':['fund-01'],'ready':True,'keywords':['IOAID','infraestrutura distribuída','inteligência operacional','arquitetura de IA']},
    {'code':'02','series':'Fundamentos','title':'O Sistema SHO (Self-Healing Orchestrator)','summary':'como o mecanismo de auto-healing reduz falhas, fecha loops operacionais e aumenta resiliência em sistemas orientados por IA.','video_rel':'public/academia/videos/video-02-sho.mp4','thumb_src':'AcademIA/videos/thumbnails/thumb-02-sho.png','db_lessons':['fund-02'],'ready':True,'keywords':['SHO','self-healing','resiliência','orquestração','automação']},
    {'code':'03','series':'Fundamentos','title':'Painel do Afiliado — Visão Geral da Operação','summary':'leitura prática das principais telas, indicadores e fluxos que sustentam a operação de afiliados dentro da plataforma.','video_rel':'public/academia/videos/video-03-painel.mp4','thumb_src':'AcademIA/videos/thumbnails/thumb-03-painel.png','db_lessons':['fund-03'],'ready':True,'keywords':['painel do afiliado','dashboard','métricas','comissões','rede']},
    {'code':'04','series':'Agentes','title':'Construindo Seu Primeiro Agente em 4 Minutos','summary':'demonstração direta de criação de um primeiro agente útil, com foco em velocidade de execução e valor prático imediato.','video_rel':'public/academia/videos/mod00-primeiro-agente.mp4','thumb_src':'AcademIA/videos/thumbnails/thumb-04-primeiro-agente.png','db_lessons':['agent-00'],'ready':True,'keywords':['primeiro agente','agentes de IA','automação','setup rápido']},
    {'code':'05','series':'Agentes','title':'Skills Essenciais — Copywriter + Audience-Segmenter','summary':'as skills que transformam conteúdo, segmentação e posicionamento em execução orientada por IA.','video_rel':'public/academia/videos/mod01-skills-essenciais.mp4','thumb_src':'AcademIA/videos/thumbnails/thumb-05-skills.png','db_lessons':['agent-01'],'ready':True,'keywords':['copywriter','segmentação','skills','audiência','IA aplicada']},
    {'code':'06','series':'Agentes','title':'Disparando no WhatsApp em Escala','summary':'como estruturar disparo, distribuição e cadência de mensagens com consistência operacional e ganho de escala.','video_rel':'public/academia/videos/mod02-disparo-whatsapp.mp4','thumb_src':'AcademIA/videos/thumbnails/thumb-06-disparo.png','db_lessons':['agent-02'],'ready':True,'keywords':['WhatsApp','escala','cadência','disparo','operações']},
    {'code':'07','series':'Agentes','title':'Judge Revisor — A IA que Decide por Você','summary':'uso de um agente avaliador para revisar decisões, elevar qualidade de execução e reduzir erro humano em produção.','video_rel':'public/academia/videos/mod03-judge-revisor.mp4','thumb_src':'AcademIA/videos/thumbnails/thumb-07-judge.png','db_lessons':['agent-03'],'ready':True,'keywords':['judge','revisor','decisão','governança','qualidade']},
    {'code':'08','series':'Master','title':'Otimização de Conversão — A Matemática da Receita','summary':'princípios de otimização de conversão, gargalos de receita e decisões de melhoria baseadas em dados.','video_rel':'public/academia/videos/video-master-otimizacao.mp4','thumb_src':'AcademIA/videos/thumbnails/thumb-08-otimizacao.png','db_lessons':[],'ready':True,'keywords':['conversão','receita','otimização','CRO','performance']},
    {'code':'09','series':'Master','title':'Funis e Lifecycle — O Sistema Completo','summary':'arquitetura de funis, retenção e lifecycle para escalar relacionamento e receita de ponta a ponta.','video_rel':'','thumb_src':'AcademIA/videos/thumbnails/thumb-09-funis-lifecycle.webp','db_lessons':[],'ready':False,'keywords':['funis','lifecycle','retenção','CRM','receita recorrente']},
    {'code':'10','series':'Master','title':'A/B Testing com Judge — Ciência da Experimentação','summary':'como usar hipóteses, variações e mecanismos de julgamento assistido por IA para melhorar decisões de produto e oferta.','video_rel':'','thumb_src':'AcademIA/videos/thumbnails/thumb-10-ab-test-judge.webp','db_lessons':[],'ready':False,'keywords':['A/B testing','experimentação','judge','otimização','método científico']},
    {'code':'11','series':'Master','title':'Análise de Coortes e Churn — A Arte de Reter','summary':'métricas de retenção, leitura de coortes e combate ao churn com inteligência operacional.','video_rel':'','thumb_src':'AcademIA/videos/thumbnails/thumb-11-coortes-churn.webp','db_lessons':[],'ready':False,'keywords':['coortes','churn','retenção','analytics','cohort analysis']},
    {'code':'12','series':'Elite','title':'Blueprints Elite — O Jogo do Top 10%','summary':'estruturas, playbooks e mentalidade de execução para avançar da operação comum para performance de elite.','video_rel':'','thumb_src':'AcademIA/videos/thumbnails/thumb-12-blueprints-elite.webp','db_lessons':[],'ready':False,'keywords':['elite','blueprints','playbooks','performance','top 10%']},
    {'code':'13','series':'Elite','title':'Multi-Tenant e White-Label na Prática','summary':'como estruturar operação replicável, multi-tenant e white-label para escalar com governança.','video_rel':'','thumb_src':'AcademIA/videos/thumbnails/thumb-13-multi-tenant.webp','db_lessons':[],'ready':False,'keywords':['multi-tenant','white-label','escala','arquitetura','SaaS']},
    {'code':'14','series':'Elite','title':'Federação de Agentes Zero-Trust','summary':'a camada avançada de coordenação entre agentes, com foco em segurança, governança e autonomia operacional.','video_rel':'public/academia/videos/video-elite-federacao.mp4','thumb_src':'AcademIA/videos/thumbnails/thumb-14-federacao-agentes.webp','db_lessons':[],'ready':True,'keywords':['federação de agentes','zero-trust','governança','agentes','segurança']},
]

BULLETS = {
    '00':['como a AcademIA está organizada','como escolher sua trilha inicial','qual a melhor sequência para começar hoje'],
    '01':['o que é o IOAID','por que a infraestrutura distribuída importa','como isso sustenta a operação Nexus'],
    '02':['como funciona o self-healing','onde o SHO reduz falhas','qual o impacto em escalabilidade e confiança'],
    '03':['as telas mais importantes do painel','o que observar em métricas e rede','como usar o painel para decisão rápida'],
    '04':['estrutura mínima de um agente útil','como sair do zero rapidamente','como transformar ideia em automação executável'],
    '05':['copy e segmentação orientadas por IA','quais skills trazem mais alavancagem','como melhorar a comunicação com precisão'],
    '06':['disparo em escala com controle','cadência e estrutura operacional','evitando gargalos de comunicação'],
    '07':['como um judge eleva a qualidade','onde a revisão automática ajuda','como reduzir erro e aumentar consistência'],
    '08':['gargalos de conversão','priorização de melhorias','como pensar receita com matemática operacional'],
    '09':['arquitetura de funil ponta a ponta','retenção e lifecycle','ligação entre marketing, produto e receita'],
    '10':['hipóteses e variações','como testar com método','uso de judge para acelerar decisões'],
    '11':['leitura de coortes','sinais de churn','intervenções para reter melhor'],
    '12':['estruturas de elite','playbooks replicáveis','o salto para o top 10%'],
    '13':['operações white-label','arquitetura multi-tenant','governança para escalar com parceiros'],
    '14':['coordenação entre agentes','segurança zero-trust','governança avançada de autonomia'],
}

def slugify(s: str) -> str:
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode('ascii')
    s = re.sub(r'[^a-zA-Z0-9]+', '-', s.lower()).strip('-')
    return s

def ensure_parent(p: Path):
    p.parent.mkdir(parents=True, exist_ok=True)

def ffmpeg_convert(src: Path, dst: Path):
    ensure_parent(dst)
    subprocess.run(['ffmpeg','-y','-i',str(src),str(dst)], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

ready_items, all_items = [], []
for idx, item in enumerate(CATALOG):
    code = item['code']
    title = item['title']
    next_title = CATALOG[idx+1]['title'] if idx+1 < len(CATALOG) else ''
    next_code = CATALOG[idx+1]['code'] if idx+1 < len(CATALOG) else ''
    video_path = ROOT / item['video_rel'] if item['video_rel'] else None
    thumb_src = ROOT / item['thumb_src'] if item['thumb_src'] else None
    thumb_out = THUMBS / f"{code}-{slugify(title)}.png"
    thumb_ready = False
    if thumb_src and thumb_src.exists():
        ensure_parent(thumb_out)
        if thumb_src.suffix.lower() == '.png':
            shutil.copy2(thumb_src, thumb_out)
        else:
            ffmpeg_convert(thumb_src, thumb_out)
        thumb_ready = True
    next_line = f"Próximo vídeo sugerido: {next_code} — {next_title}" if next_code else 'Série em expansão contínua pela AcademIA Nexus.'
    desc = (
        f"{title}\n\n"
        f"Neste episódio da AcademIA Nexus, você aprende {item['summary']}\n\n"
        f"O que você vai ver neste vídeo:\n" + '\n'.join(f"- {b}" for b in BULLETS[code]) + "\n\n"
        f"Série: {item['series']}\n"
        f"Código da aula: {code}\n"
        "Canal oficial: https://www.youtube.com/@NexusAffilIAte-w9p\n"
        "Plataforma: https://oneverso.com.br/academia/ead/curso\n"
        "Portal: https://oneverso.com.br\n\n"
        f"{next_line}\n\n"
        "Se este conteúdo fez sentido, avance para a próxima aula da trilha e acompanhe a evolução da operação com IA.\n\n"
        "#AcademIANexus #OneVerso #AgentesDeIA #AutomacaoInteligente\n"
    )
    rec = {
        'code': code,
        'series': item['series'],
        'title': title,
        'slug': f"video-{code}-{slugify(title)[:48]}",
        'youtube_title': f"AcademIA Nexus • {code} | {title}"[:100],
        'description': desc,
        'tags': GLOBAL_TAGS + item['keywords'] + [item['series'], title],
        'privacy_status': 'unlisted',
        'category_id': '27',
        'made_for_kids': False,
        'video_path': str(video_path) if video_path else '',
        'thumbnail_path': str(thumb_out) if thumb_ready else '',
        'db_lessons': item['db_lessons'],
        'ready': bool(item['ready'] and video_path and video_path.exists()),
        'status': 'ready_to_upload' if bool(item['ready'] and video_path and video_path.exists()) else 'script_ready_video_pending',
        'summary': item['summary'],
    }
    all_items.append(rec)
    if rec['ready']:
        ready_items.append(rec)
    (DESC / f"{code}-{slugify(title)}.txt").write_text(desc, encoding='utf-8')

OUT.mkdir(parents=True, exist_ok=True)
(OUT / 'publish_plan.json').write_text(json.dumps(all_items, ensure_ascii=False, indent=2), encoding='utf-8')
(OUT / 'upload_batch_ready.json').write_text(json.dumps(ready_items, ensure_ascii=False, indent=2), encoding='utf-8')
with (OUT / 'publish_plan.csv').open('w', newline='', encoding='utf-8') as f:
    w = csv.writer(f)
    w.writerow(['code','series','title','status','video_path','thumbnail_path','db_lessons'])
    for r in all_items:
        w.writerow([r['code'], r['series'], r['title'], r['status'], r['video_path'], r['thumbnail_path'], ','.join(r['db_lessons'])])
ready_count = sum(1 for r in all_items if r['ready'])
pending_count = len(all_items) - ready_count
lines = ['# Plano Editorial YouTube · AcademIA Nexus','',f'Prontos para upload imediato: **{ready_count}**',f'Roteiro pronto, vídeo pendente: **{pending_count}**','','## Lote pronto agora']
for r in ready_items:
    lines.append(f"- **{r['code']} · {r['title']}** — vídeo: `{Path(r['video_path']).name}` · thumb: `{Path(r['thumbnail_path']).name if r['thumbnail_path'] else 'sem-thumb'}`")
lines += ['','## Em produção']
for r in all_items:
    if not r['ready']:
        lines.append(f"- **{r['code']} · {r['title']}** — roteiro pronto, aguardando MP4 final")
(OUT / 'README.md').write_text('\n'.join(lines) + '\n', encoding='utf-8')
print(f'Materiais gerados: ready={ready_count} pending={pending_count}')
