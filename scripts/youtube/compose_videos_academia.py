#!/usr/bin/env python3
"""AcademIA Nexus - Video Composer
Composes 5 videos: intro slide (persona) + motion-graphics slides sync'd to voice-cloned narration
"""
from __future__ import annotations
import subprocess, os, json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path('/home/user/nexus-videos')
ASSETS = ROOT / 'assets'
FRAMES = ROOT / 'frames'
OUT = ROOT / 'output'
NARR = Path('/home/user/narracoes')

FONT_BOLD = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
FONT_REG = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'

# Nexus brand palette
BG_DARK = (10, 15, 30)          # deep navy
BG_MID = (18, 25, 45)           # mid navy
ACCENT_TEAL = (70, 180, 195)    # nexus teal
ACCENT_GOLD = (215, 175, 90)    # burgundy-gold
TEXT_WHITE = (240, 240, 245)
TEXT_MUTED = (180, 180, 195)

W, H = 1280, 720

VIDEOS = [
    {
        'code': '09', 'series': 'Master', 'trail_color': ACCENT_TEAL,
        'title': 'Funis e Lifecycle',
        'subtitle': 'O Sistema Completo',
        'persona_img': 'dupla_ive_alencar.png',
        'persona_label': 'Sra. Ive  ·  Sir Alencar',
        'narracao': 'narracao-09.mp3',
        'duracao': 102.816,
        'slides': [
            {'t': 6, 'title': 'A jornada tem 7 etapas', 'sub': 'Descoberta → Retenção'},
            {'t': 22, 'title': 'Etapa 1-3', 'sub': 'Descoberta · Engajamento · Nutrição', 'bullets': ['CTR & custo por clique', 'Taxa de resposta', 'Engajamento com conteúdo']},
            {'t': 42, 'title': 'Etapa 4-6', 'sub': 'Qualificação · Conversão · Onboarding', 'bullets': ['BANT score', 'Ticket médio', 'Taxa de ativação']},
            {'t': 62, 'title': 'Etapa 7 — O Ouro', 'sub': 'Retenção e expansão', 'bullets': ['90% da receita futura vem daqui', 'LTV · NPS · recompra']},
            {'t': 82, 'title': 'Triggers automáticos', 'sub': 'Cada gatilho dispara ação', 'bullets': ['Entrada · Saída · Ação', 'Funil vira máquina']},
            {'t': 96, 'title': 'Próximo passo', 'sub': 'Mapeie seu lifecycle · Aja onde o churn concentra', 'bullets': ['oneverso.com.br/academia/ead/curso']},
        ],
    },
    {
        'code': '10', 'series': 'Master', 'trail_color': ACCENT_TEAL,
        'title': 'A/B Testing com Judge',
        'subtitle': 'Ciência da Experimentação',
        'persona_img': 'alencar_ref.png',
        'persona_label': 'Sir Nexus Alencar',
        'narracao': 'narracao-10.mp3',
        'duracao': 98.244,
        'slides': [
            {'t': 6, 'title': 'A/B test válido tem 8 componentes', 'sub': 'Ciência, não achismo'},
            {'t': 20, 'title': 'Componentes 1-4', 'sub': 'Fundamentos', 'bullets': ['Hipótese clara (variante · métrica · público)', 'Métrica primária única', 'Baseline conhecido', 'Variantes isoladas']},
            {'t': 42, 'title': 'Componentes 5-6', 'sub': 'Rigor estatístico', 'bullets': ['Amostra adequada (milhares, não 50)', 'Duração pré-definida']},
            {'t': 62, 'title': 'Componentes 7-8', 'sub': 'Disciplina de decisão', 'bullets': ['Significância ≥ 95% (p < 0.05)', 'Sem peeking — só abre no final']},
            {'t': 80, 'title': 'Judge Revisor', 'sub': 'Automatiza validação estatística', 'bullets': ['Cálculo de amostra · Decisão final', 'Ciência plugada no seu funil']},
            {'t': 92, 'title': 'Pare de decidir no achismo', 'sub': 'oneverso.com.br/academia'},
        ],
    },
    {
        'code': '11', 'series': 'Master', 'trail_color': ACCENT_TEAL,
        'title': 'Coortes e Churn',
        'subtitle': 'A Arte de Reter',
        'persona_img': 'ive_ref.png',
        'persona_label': 'Sra. Nexus Ive',
        'narracao': 'narracao-11.mp3',
        'duracao': 104.220,
        'slides': [
            {'t': 6, 'title': 'Adquirir custa 5-7× mais que reter', 'sub': 'Retenção é estratégia pura'},
            {'t': 22, 'title': 'Análise de Coortes', 'sub': 'A ferramenta mais poderosa', 'bullets': ['Grupo que compartilha característica no tempo', 'Heatmap semanal · retenção decrescente']},
            {'t': 42, 'title': '3 insights toda semana', 'sub': 'Leitura clássica do heatmap', 'bullets': ['Retenção absoluta', 'Retenção relativa (novo × antigo)', 'Ponto de churn concentrado']},
            {'t': 62, 'title': 'Onde o churn concentra?', 'sub': 'Cada semana revela um problema', 'bullets': ['Semana 1 → 1ª experiência', 'Semana 4 → produto', 'Semana 8 → engajamento']},
            {'t': 82, 'title': 'Modelo preditivo de churn', 'sub': '4 sinais alimentam o modelo', 'bullets': ['Queda de uso · Redução de resposta', 'Feedback negativo · Mudança de contexto', 'Score verde · amarelo · vermelho']},
            {'t': 98, 'title': 'Aja antes do churn acontecer', 'sub': 'oneverso.com.br/academia'},
        ],
    },
    {
        'code': '12', 'series': 'Elite', 'trail_color': ACCENT_GOLD,
        'title': 'Blueprints Elite',
        'subtitle': 'O Jogo do Top 10%',
        'persona_img': 'dupla_ive_alencar.png',
        'persona_label': 'Sra. Ive  ·  Sir Alencar',
        'narracao': 'narracao-12.mp3',
        'duracao': 102.060,
        'slides': [
            {'t': 6, 'title': 'Elite = plataforma, não trabalho', 'sub': 'O top 10% constrói sistemas'},
            {'t': 20, 'title': 'Blueprint 1', 'sub': 'Operação Multi-Canal Orquestrada', 'bullets': ['6-10 canais simultâneos', 'Mesmo SHO · Mesmo Judge', 'CAC blended cai 40-60%']},
            {'t': 42, 'title': 'Blueprint 2', 'sub': 'Multi-Tenant e White-Label', 'bullets': ['10 tenants × R$ 30-50k/mês', '20-30% de fee = R$ 60-150k recorrente', 'Custo marginal ≈ zero']},
            {'t': 66, 'title': 'Blueprint 3', 'sub': 'Federação de Agentes Zero-Trust', 'bullets': ['Escopo limitado por agente', 'Cada decisão auditada', 'Governança nativa']},
            {'t': 86, 'title': 'Elite não é salto', 'sub': 'É evolução', 'bullets': ['Domine as trilhas anteriores primeiro']},
            {'t': 96, 'title': 'Trilha Elite', 'sub': 'oneverso.com.br/academia'},
        ],
    },
    {
        'code': '13', 'series': 'Elite', 'trail_color': ACCENT_GOLD,
        'title': 'Multi-Tenant e White-Label',
        'subtitle': 'Na Prática',
        'persona_img': 'alencar_ref.png',
        'persona_label': 'Sir Nexus Alencar',
        'narracao': 'narracao-13.mp3',
        'duracao': 123.984,
        'slides': [
            {'t': 6, 'title': 'O blueprint que monetiza de verdade', 'sub': 'Do zero em 6 passos'},
            {'t': 18, 'title': 'Passo 1 · Novo Tenant', 'sub': 'Admin > Tenants > Novo', 'bullets': ['Nome · subdomínio · marca', 'Plano · administrador · limites']},
            {'t': 36, 'title': 'Passo 2 · Isolamento', 'sub': 'Aqui 90% erra', 'bullets': ['Base de leads por tenant_id', 'Queries filtradas em toda operação', 'SHO tem isolamento nativo']},
            {'t': 56, 'title': 'Passo 3-4', 'sub': 'Skills e Judge', 'bullets': ['Skills core herdadas', 'Skills verticais customizadas', 'Judge ajustável dentro de limites']},
            {'t': 76, 'title': 'Passo 5 · Infraestrutura', 'sub': 'SHO provisiona', 'bullets': ['DB dedicado · fila própria', 'SSL do subdomínio · chaves API', '30-45 min · 80% automatizado']},
            {'t': 98, 'title': 'White-label em 5 min', 'sub': 'Sub-afiliado sente como dele', 'bullets': ['Logo · cor primária · cor secundária', 'Favicon · domínio · e-mail']},
            {'t': 116, 'title': 'Afiliado → Plataforma', 'sub': 'oneverso.com.br/academia'},
        ],
    },
]


def load_font(size, bold=True):
    return ImageFont.truetype(FONT_BOLD if bold else FONT_REG, size)


def draw_bg_gradient(draw: ImageDraw.ImageDraw, w: int, h: int, top: tuple, bottom: tuple):
    for y in range(h):
        r = int(top[0] + (bottom[0] - top[0]) * y / h)
        g = int(top[1] + (bottom[1] - top[1]) * y / h)
        b = int(top[2] + (bottom[2] - top[2]) * y / h)
        draw.line([(0, y), (w, y)], fill=(r, g, b))


def draw_geometric_bg(img: Image.Image, accent: tuple):
    """Subtle geometric accent lines / dots for premium feel."""
    draw = ImageDraw.Draw(img, 'RGBA')
    # thin accent line top-left
    draw.rectangle([80, 60, 84, 200], fill=(*accent, 200))
    # dot pattern top-right
    for i in range(6):
        for j in range(4):
            x = W - 320 + i * 40
            y = 80 + j * 40
            draw.ellipse([x-2, y-2, x+2, y+2], fill=(*accent, 100))
    # bottom accent bar
    draw.rectangle([80, H - 60, 240, H - 56], fill=(*accent, 220))
    # academia logo watermark bottom-right
    logo_font = load_font(24)
    draw.text((W - 380, H - 65), 'ACADEM  IA  NEXUS', font=logo_font, fill=(*TEXT_MUTED, 220))


def make_capa_slide(v: dict, out_path: Path, persona_img_path: Path):
    """Big cover slide with persona photo + title."""
    img = Image.new('RGB', (W, H), BG_DARK)
    d = ImageDraw.Draw(img)
    draw_bg_gradient(d, W, H, BG_DARK, BG_MID)

    # Load persona photo, blur bg copy for atmosphere
    persona = Image.open(persona_img_path).convert('RGB')
    pw, ph = persona.size
    # Fill background with blurred persona (very dim)
    bg_scale = max(W / pw, H / ph) * 1.2
    bg_p = persona.resize((int(pw * bg_scale), int(ph * bg_scale))).filter(ImageFilter.GaussianBlur(radius=45))
    bx = (bg_p.width - W) // 2
    by = (bg_p.height - H) // 2
    bg_p = bg_p.crop((bx, by, bx + W, by + H))
    overlay = Image.new('RGBA', (W, H), (10, 15, 30, 205))
    bg_p = Image.alpha_composite(bg_p.convert('RGBA'), overlay).convert('RGB')
    img.paste(bg_p, (0, 0))
    d = ImageDraw.Draw(img, 'RGBA')

    # Persona portrait on the right (cropped and framed)
    p_target_h = 780
    p_scale = p_target_h / ph
    persona_r = persona.resize((int(pw * p_scale), p_target_h))
    p_offset_x = W - persona_r.width - 100
    p_offset_y = (H - p_target_h) // 2
    # rounded soft shadow behind portrait
    shadow = Image.new('RGBA', (persona_r.width + 40, persona_r.height + 40), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle([0, 0, shadow.width, shadow.height], radius=30, fill=(0, 0, 0, 120))
    shadow = shadow.filter(ImageFilter.GaussianBlur(radius=15))
    img.paste(shadow, (p_offset_x - 20, p_offset_y - 10), shadow)
    # portrait with rounded mask
    mask = Image.new('L', persona_r.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, persona_r.width, persona_r.height], radius=24, fill=255)
    img.paste(persona_r, (p_offset_x, p_offset_y), mask)

    # Left text block
    d = ImageDraw.Draw(img, 'RGBA')
    # series pill
    trail = v['trail_color']
    d.rounded_rectangle([120, 180, 380, 235], radius=27, fill=(*trail, 220))
    trail_font = load_font(24)
    d.text((150, 190), f"TRILHA {v['series'].upper()}", font=trail_font, fill=(15, 20, 40, 255))
    # main title (huge)
    title_font = load_font(96)
    d.text((120, 280), v['title'], font=title_font, fill=TEXT_WHITE)
    # subtitle
    sub_font = load_font(56, bold=False)
    d.text((120, 410), v['subtitle'], font=sub_font, fill=(*trail, 255))
    # accent bar
    d.rectangle([120, 510, 320, 516], fill=(*trail, 255))
    # persona label
    persona_font = load_font(32)
    d.text((120, 550), v['persona_label'], font=persona_font, fill=TEXT_MUTED)
    # bottom brand
    brand_font = load_font(22)
    d.text((120, H - 130), f"AcademIA Nexus  ·  Vídeo {v['code']}", font=brand_font, fill=(*trail, 255))
    d.text((120, H - 90), 'oneverso.com.br', font=brand_font, fill=TEXT_MUTED)

    draw_geometric_bg(img, trail)
    img.save(out_path, quality=94)


def make_content_slide(v: dict, slide: dict, out_path: Path):
    img = Image.new('RGB', (W, H), BG_DARK)
    d = ImageDraw.Draw(img)
    draw_bg_gradient(d, W, H, BG_DARK, BG_MID)
    d = ImageDraw.Draw(img, 'RGBA')

    trail = v['trail_color']
    # top strip with series + code
    d.rectangle([0, 0, W, 6], fill=(*trail, 255))
    top_font = load_font(24)
    d.text((80, 30), f"TRILHA {v['series'].upper()}  ·  Vídeo {v['code']}  ·  AcademIA Nexus", font=top_font, fill=TEXT_MUTED)

    # left accent bar
    d.rectangle([80, 200, 88, 800], fill=(*trail, 255))

    # title
    title_font = load_font(76)
    d.text((130, 200), slide['title'], font=title_font, fill=TEXT_WHITE)
    # subtitle
    sub_font = load_font(42, bold=False)
    d.text((130, 310), slide['sub'], font=sub_font, fill=(*trail, 255))

    # bullets if any
    bullets = slide.get('bullets') or []
    if bullets:
        y = 420
        for b in bullets:
            # dot
            d.ellipse([135, y + 22, 155, y + 42], fill=(*trail, 255))
            bf = load_font(38)
            d.text((185, y), b, font=bf, fill=TEXT_WHITE)
            y += 88
    else:
        # showcase big number-less block: highlight ring right side
        ring_center = (W - 380, 540)
        for r in range(200, 210):
            d.ellipse([ring_center[0]-r, ring_center[1]-r, ring_center[0]+r, ring_center[1]+r], outline=(*trail, 90 - (r-200)*4))

    # footer branding
    footer_font = load_font(22)
    d.text((80, H - 60), 'oneverso.com.br/academia   ·   @NexusAffilIAte', font=footer_font, fill=TEXT_MUTED)

    draw_geometric_bg(img, trail)
    img.save(out_path, quality=94)


def build_video(v: dict, verbose=True):
    code = v['code']
    slide_dir = FRAMES / f"v{code}"
    slide_dir.mkdir(parents=True, exist_ok=True)
    if verbose:
        print(f"\n=== Vídeo {code} · {v['title']} ===")

    # capa
    capa_path = slide_dir / 'capa.jpg'
    make_capa_slide(v, capa_path, ASSETS / v['persona_img'])

    # content slides
    slide_paths = [(0.0, capa_path)]
    for i, s in enumerate(v['slides'], start=1):
        p = slide_dir / f"slide_{i:02d}.jpg"
        make_content_slide(v, s, p)
        slide_paths.append((float(s['t']), p))
    # sentinel end time
    total = float(v['duracao']) + 0.5
    slide_paths.append((total, None))

    # build ffmpeg concat with per-slide duration
    concat_file = slide_dir / 'concat.txt'
    lines = []
    for i in range(len(slide_paths) - 1):
        t_start, path = slide_paths[i]
        t_end = slide_paths[i + 1][0]
        dur = max(0.5, t_end - t_start)
        lines.append(f"file '{path.resolve()}'\nduration {dur:.3f}")
    # last frame requires explicit final file entry per ffmpeg concat demuxer
    lines.append(f"file '{slide_paths[-2][1].resolve()}'")
    concat_file.write_text('\n'.join(lines))

    # temp silent video from slides
    slides_video = OUT / f"tmp_{code}_slides.mp4"
    cmd = [
        'ffmpeg', '-y', '-f', 'concat', '-safe', '0', '-i', str(concat_file),
        '-vf', f'scale={W}:{H}:force_original_aspect_ratio=decrease,pad={W}:{H}:(ow-iw)/2:(oh-ih)/2:color=black,fps=25,format=yuv420p',
        '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '23', '-r', '25', '-threads', '2',
        str(slides_video)
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    # final: mux with narration audio (loudnorm + fade)
    final_path = OUT / f"video-{code}-{v['title'].lower().replace(' ', '-').replace('/', '-').replace('.', '')}.mp4"
    narr_path = NARR / v['narracao']
    cmd2 = [
        'ffmpeg', '-y',
        '-i', str(slides_video),
        '-i', str(narr_path),
        '-c:v', 'copy',
        '-c:a', 'aac', '-b:a', '192k',
        '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11,afade=t=in:st=0:d=0.5,afade=t=out:st=' + str(v['duracao'] - 0.8) + ':d=0.8',
        '-map', '0:v:0', '-map', '1:a:0',
        '-shortest',
        str(final_path)
    ]
    subprocess.run(cmd2, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    slides_video.unlink(missing_ok=True)

    size = final_path.stat().st_size
    if verbose:
        print(f"  → {final_path.name}  ({size/1024/1024:.1f} MB)")
    return final_path


if __name__ == '__main__':
    OUT.mkdir(parents=True, exist_ok=True)
    results = []
    for v in VIDEOS:
        try:
            p = build_video(v)
            results.append({'code': v['code'], 'path': str(p), 'ok': True})
        except Exception as e:
            print(f"FAILED {v['code']}: {e}")
            results.append({'code': v['code'], 'error': str(e), 'ok': False})
    (OUT / 'build_report.json').write_text(json.dumps(results, ensure_ascii=False, indent=2))
    print('\n=== FINAL ===')
    for r in results:
        print(r)
