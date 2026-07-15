#!/usr/bin/env python3
"""AcademIA Nexus · Compositor Full Videos
Gera videos full 60-140s com motion-graphics slides + TTS voice-cloned.
Output: AcademIA/videos/video-XX-*-full.mp4
"""
from __future__ import annotations
import json
import subprocess
import shutil
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import textwrap

ROOT = Path('/workspace/MMN_AI-to-AI/AcademIA')
VIDEOS = ROOT / 'videos'
ASSETS = VIDEOS / 'assets'
FRAMES = VIDEOS / 'frames'
SLIDES = VIDEOS / 'slides'
AUDIO = VIDEOS / 'audio'
PARSED = VIDEOS / 'scripts' / 'roteiros_parsed.json'

# Cores (PADRAO_VIDEOS_ACADEMIA.md)
BG_DARK = (10, 15, 30)
BG_MID = (18, 25, 45)
BG_LIGHT = (24, 32, 58)
ACCENT_CYAN = (70, 180, 195)      # fundamental / agente
ACCENT_TEAL = (45, 155, 175)      # agente
ACCENT_GOLD = (215, 175, 90)      # master / elite
ACCENT_PURPLE = (140, 100, 200)   # elite accent
TEXT_WHITE = (240, 240, 245)
TEXT_MUTED = (180, 180, 195)
TEXT_DIM = (140, 140, 160)

W, H = 1280, 720
FPS = 25

FONT_BOLD = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
FONT_REG = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
FONT_SERIF = '/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf'

# Persona voice mapping
VOICES = {
    'ive': 'Portuguese_CharmingQueen',
    'alencar': 'Portuguese_Steadymentor',
    'dupla': ['Portuguese_CharmingQueen', 'Portuguese_Steadymentor'],
}


def get_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(FONT_BOLD if bold else FONT_REG, size)


def pick_accent(cor: str) -> tuple:
    return {
        'cyan': ACCENT_CYAN,
        'teal': ACCENT_TEAL,
        'gold': ACCENT_GOLD,
    }.get(cor, ACCENT_CYAN)


def draw_hud(d: ImageDraw.ImageDraw, accent: tuple, code: str, trilha: str, persona: str):
    """HUD padrão: barra superior, barra lateral, pill trilha, rodapé, watermark"""
    # barra superior
    d.rectangle([(0, 0), (W, 4)], fill=accent)
    # barra lateral
    d.rectangle([(0, 4), (8, H)], fill=accent)
    # pill TRILHA
    pill_w, pill_h = 240, 32
    d.rounded_rectangle([(24, 20), (24 + pill_w, 20 + pill_h)], radius=16, fill=accent)
    f = get_font(13, bold=True)
    d.text((24 + pill_w // 2, 20 + pill_h // 2), f"TRILHA {trilha.upper()}", font=f, fill=BG_DARK, anchor='mm')
    # top-right lesson code
    d.text((W - 24, 36), f"AULA {code}", font=get_font(14, bold=True), fill=TEXT_MUTED, anchor='rm')
    # rodapé
    d.text((24, H - 20), "oneverso.com.br/academia · @NexusAffilIAte", font=get_font(13), fill=TEXT_DIM, anchor='lm')
    # marca d'água canto inferior direito
    d.text((W - 24, H - 20), "ACADEM IA NEXUS", font=get_font(13, bold=True), fill=TEXT_DIM, anchor='rm')
    # brackets HUD cantos
    bracket = 24
    for x, y in [(20, 70), (W - 20 - bracket, 70)]:
        d.line([(x, y), (x + bracket, y)], fill=accent, width=2)
        d.line([(x, y), (x, y + bracket)], fill=accent, width=2)
    for x, y in [(20, H - 80), (W - 20 - bracket, H - 80)]:
        d.line([(x, y), (x + bracket, y)], fill=accent, width=2)
        d.line([(x, y), (x, y - bracket)], fill=accent, width=2)


def draw_persona_badge(d: ImageDraw.ImageDraw, persona: str, accent: tuple, x: int, y: int):
    """Badge da persona"""
    labels = {
        'ive': ('SRA. NEXUS IVE', 'Estrategista · Matriarca'),
        'alencar': ('SIR NEXUS ALENCAR', 'Mentor Técnico'),
        'dupla': ('IVE + ALENCAR', 'Co-apresentação'),
    }
    nome, papel = labels.get(persona, ('PERSONA', ''))
    # avatar circle
    r = 36
    d.ellipse([(x - r, y - r), (x + r, y + r)], fill=accent, outline=TEXT_WHITE, width=2)
    # initials
    initials = 'I' if persona == 'ive' else ('A' if persona == 'alencar' else 'I+A')
    d.text((x, y), initials, font=get_font(28, bold=True), fill=BG_DARK, anchor='mm')
    # nome
    d.text((x + r + 16, y - 8), nome, font=get_font(15, bold=True), fill=TEXT_WHITE, anchor='lm')
    d.text((x + r + 16, y + 12), papel, font=get_font(12), fill=TEXT_MUTED, anchor='lm')


def make_slide_title(slide_path: Path, code: str, title: str, subtitle: str, persona: str, trilha: str, accent: tuple):
    """Slide de abertura: hero com título"""
    img = Image.new('RGB', (W, H), BG_DARK)
    d = ImageDraw.Draw(img)
    # gradiente diagonal
    for i in range(H):
        alpha = i / H
        c = tuple(int(BG_DARK[k] * (1 - alpha) + BG_MID[k] * alpha) for k in range(3))
        d.line([(0, i), (W, i)], fill=c)
    # glow central
    for r in range(360, 60, -10):
        a = max(0, (r - 60) / 300) * 0.05
        color = tuple(int(accent[k] * a + BG_MID[k] * (1 - a)) for k in range(3))
        d.ellipse([(W // 2 - r, H // 2 - r), (W // 2 + r, H // 2 + r)], outline=color)
    # código grande
    d.text((W // 2, 180), code, font=get_font(120, bold=True), fill=accent, anchor='mm')
    # divider
    d.line([(W // 2 - 80, 280), (W // 2 + 80, 280)], fill=accent, width=3)
    # título
    d.text((W // 2, 360), title, font=get_font(48, bold=True), fill=TEXT_WHITE, anchor='mm')
    # subtítulo
    if subtitle:
        wrapped = textwrap.wrap(subtitle, width=50)[:2]
        for i, line in enumerate(wrapped):
            d.text((W // 2, 430 + i * 36), line, font=get_font(22), fill=TEXT_MUTED, anchor='mm')
    # persona badge
    draw_persona_badge(d, persona, accent, W // 2, 560)
    draw_hud(d, accent, code, trilha, persona)
    img.save(slide_path, 'WEBP', quality=85)


def make_slide_content(slide_path: Path, code: str, title: str, bullets: list, narration: str, persona: str, trilha: str, accent: tuple, t_sec: int):
    """Slide de conteúdo: bullets + narração"""
    img = Image.new('RGB', (W, H), BG_DARK)
    d = ImageDraw.Draw(img)
    # gradiente
    for i in range(H):
        alpha = i / H
        c = tuple(int(BG_DARK[k] * (1 - alpha) + BG_MID[k] * alpha * 0.5) for k in range(3))
        d.line([(0, i), (W, i)], fill=c)
    # timestamp
    d.text((W - 24, 80), f"{t_sec // 60:02d}:{t_sec % 60:02d}", font=get_font(14, bold=True), fill=accent, anchor='rt')
    # código + trilha
    d.text((W - 24, 100), f"{trilha} · {code}", font=get_font(11), fill=TEXT_MUTED, anchor='rt')
    # título da cena
    wrapped_title = textwrap.wrap(title, width=36)[:2]
    for i, line in enumerate(wrapped_title):
        d.text((60, 90 + i * 50), line, font=get_font(36, bold=True), fill=TEXT_WHITE, anchor='lm')
    # divider
    d.line([(60, 200), (300, 200)], fill=accent, width=3)
    # bullets
    y = 230
    for b in bullets[:5]:
        d.ellipse([(70, y + 14), (84, y + 28)], fill=accent)
        wrapped = textwrap.wrap(b, width=44)[:3]
        for j, line in enumerate(wrapped):
            d.text((100, y + j * 28 + 6), line, font=get_font(20, bold=(j == 0)), fill=TEXT_WHITE if j == 0 else TEXT_MUTED, anchor='lm')
        y += 28 + (len(wrapped) - 1) * 28 + 16
        if y > 520:
            break
    # persona badge bottom-left
    draw_persona_badge(d, persona, accent, 100, H - 60)
    # narração excerpt (caption-like, top-right small)
    if narration:
        cap = textwrap.wrap(narration[:200], width=48)[:2]
        for i, line in enumerate(cap):
            d.text((W - 60, 140 + i * 22), f"\u201c{line}\u201d", font=get_font(13), fill=TEXT_DIM, anchor='rt')
    draw_hud(d, accent, code, trilha, persona)
    img.save(slide_path, 'WEBP', quality=85)


def make_slide_cta(slide_path: Path, code: str, title: str, persona: str, trilha: str, accent: tuple):
    """Slide de CTA: chamada para ação"""
    img = Image.new('RGB', (W, H), BG_DARK)
    d = ImageDraw.Draw(img)
    for i in range(H):
        alpha = i / H
        c = tuple(int(BG_DARK[k] * (1 - alpha) + BG_MID[k] * alpha) for k in range(3))
        d.line([(0, i), (W, i)], fill=c)
    # logo
    d.text((W // 2, 200), "\u26a1", font=get_font(80), fill=accent, anchor='mm')
    d.text((W // 2, 300), "ACADEM IA NEXUS", font=get_font(48, bold=True), fill=TEXT_WHITE, anchor='mm')
    d.text((W // 2, 360), f"Aula {code} \u00b7 {trilha}", font=get_font(22), fill=TEXT_MUTED, anchor='mm')
    # CTA box
    box_w, box_h = 720, 100
    bx = (W - box_w) // 2
    by = 430
    d.rounded_rectangle([(bx, by), (bx + box_w, by + box_h)], radius=20, outline=accent, width=3)
    d.text((W // 2, by + 30), "\ud83d\ude80 oneverso.com.br/academia", font=get_font(24, bold=True), fill=TEXT_WHITE, anchor='mm')
    d.text((W // 2, by + 65), "Pr\u00f3xima aula: rota Fund\u2192Agente\u2192Master\u2192Elite", font=get_font(18), fill=TEXT_MUTED, anchor='mm')
    # persona
    draw_persona_badge(d, persona, accent, W // 2, 600)
    draw_hud(d, accent, code, trilha, persona)
    img.save(slide_path, 'WEBP', quality=85)


def tts_generate(text: str, out_path: Path, voice_id: str) -> bool:
    """Chama a tool synthesize_speech via Python wrapper"""
    try:
        # import interno (mavis tool)
        from mavis.tools.tts import synthesize_speech  # type: ignore
    except ImportError:
        # fallback: chama via subprocess (curl) - pulamos, só log
        print(f"  [TTS stub] {voice_id} -> {out_path.name}: {text[:60]}...")
        return False
    return False


def tts_batch(requests: list[dict]) -> list[dict]:
    """TTS batch via mavis tool batch_synthesize_speech"""
    try:
        from mavis import mavis  # type: ignore
        # converte requests
        result = mavis(command='tts_batch', args={'requests': requests})
        return result.get('files', [])
    except Exception as e:
        print(f"  [TTS err] {e}")
        return []


def main():
    data = json.loads(PARSED.read_text(encoding='utf-8'))
    print(f"\n=== Compondo {len(data)} v\u00eddeos full 60-140s ===\n")

    # 1) Gerar TTS em batch (1 arquivo por cena, concatenado depois)
    tts_requests = []
    for roteiro in data:
        code = roteiro['code']
        persona = roteiro['meta']['persona']
        voice = VOICES.get(persona, 'Portuguese_Steadymentor')
        trilha = roteiro['meta']['trilha']
        cor = roteiro['meta']['cor']
        # usa s\u00f3 as 2-3 primeiras falas (60-140s target)
        # cria uma fala unificada para o v\u00eddeo
        fala_unica = ' '.join([' '.join(c['narracoes'][:2]) for c in roteiro['cenas'][:3]])
        fala_unica = fala_unica.strip()[:1500]  # limite seguro
        if not fala_unica:
            fala_unica = f"Bem-vindo \u00e0 AcademIA Nexus. Esta \u00e9 a aula {code}: {roteiro['meta']['title']}."
        out_audio = AUDIO / f"full_{code}_{persona}.mp3"
        tts_requests.append({
            'text': fala_unica,
            'output_file_path': str(out_audio),
            'voice_id': voice if isinstance(voice, str) else voice[0],
        })
    print(f"  TTS requests: {len(tts_requests)}")
    # tenta gerar via mavis
    files = tts_batch(tts_requests)
    if not files:
        print("  TTS indispon\u00edvel - gerando v\u00eddeos sem narra\u00e7\u00e3o (silence track)")
        # gera audios de sil\u00eAncio como placeholder
        for r in tts_requests:
            p = Path(r['output_file_path'])
            p.parent.mkdir(parents=True, exist_ok=True)
            # silence 90s mp3 via ffmpeg
            subprocess.run([
                'ffmpeg', '-y', '-loglevel', 'error',
                '-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=24000',
                '-t', '90', '-c:a', 'aac', '-b:a', '128k', str(p)
            ], check=False)

    # 2) Para cada roteiro, gerar slides + render
    FRAMES.mkdir(parents=True, exist_ok=True)
    SLIDES.mkdir(parents=True, exist_ok=True)
    AUDIO.mkdir(parents=True, exist_ok=True)
    ASSETS.mkdir(parents=True, exist_ok=True)

    for roteiro in data:
        code = roteiro['code']
        title = roteiro['meta']['title']
        trilha = roteiro['meta']['trilha']
        cor = roteiro['meta']['cor']
        persona = roteiro['meta']['persona']
        accent = pick_accent(cor)

        # Seleciona 3 cenas: abertura, 1 conte\u00fado, CTA
        # CENA 0: t\u00edtulo hero
        # CENA 1-2: conte\u00fado
        # CENA final: CTA
        target_dur = 90  # segundos
        slide_specs = [
            {'type': 'title', 't': 0, 'title': title, 'subtitle': f'Aula {code} \u00b7 {trilha}', 'nars': roteiro['cenas'][0]['narracoes'][:1] if roteiro['cenas'] else [], 'dur': 8},
            {'type': 'content', 't': 8, 'title': roteiro['cenas'][0]['titulo'] if roteiro['cenas'] else title, 'bullets': roteiro['cenas'][0]['bullets'][:5] if roteiro['cenas'] else [], 'nars': roteiro['cenas'][0]['narracoes'][:2] if roteiro['cenas'] else [], 'dur': 35},
            {'type': 'content', 't': 43, 'title': roteiro['cenas'][1]['titulo'] if len(roteiro['cenas']) > 1 else 'Pr\u00f3ximo Passo', 'bullets': roteiro['cenas'][1]['bullets'][:5] if len(roteiro['cenas']) > 1 else ['Continue sua jornada', 'Acesse a plataforma', 'Pratique hoje'], 'nars': roteiro['cenas'][1]['narracoes'][:2] if len(roteiro['cenas']) > 1 else [], 'dur': 35},
            {'type': 'cta', 't': 78, 'title': 'Pr\u00f3ximo Passo', 'dur': 12},
        ]

        # gera PNGs 1280x720
        frame_paths = []
        for i, spec in enumerate(slide_specs):
            fp = FRAMES / f"full_{code}_f{i}.png"
            if spec['type'] == 'title':
                sub = spec.get('subtitle', '')
                make_slide_title(fp, code, spec['title'], sub, persona, trilha, accent)
            elif spec['type'] == 'content':
                nar = ' '.join(spec.get('nars', []))[:200]
                make_slide_content(fp, code, spec['title'], spec.get('bullets', []), nar, persona, trilha, accent, spec['t'])
            else:  # cta
                make_slide_cta(fp, code, title, persona, trilha, accent)
            frame_paths.append((fp, spec['dur']))

        # concat frames em v\u00eddeo (image loop) + \u00e1udio
        # cria concat list
        concat_list = FRAMES / f"full_{code}_list.txt"
        with concat_list.open('w') as f:
            for fp, dur in frame_paths:
                f.write(f"file '{fp}'\n")
                f.write(f"duration {dur}\n")
            # \u00faltimo frame sem duration (para n\u00e3o cortar)
            f.write(f"file '{frame_paths[-1][0]}'\n")

        audio_path = AUDIO / f"full_{code}_{persona}.mp3"
        out_path = VIDEOS / f"video-{code}-{slugify(title)}-full.mp4"
        # verifica se j\u00e1 existe
        if out_path.exists():
            print(f"  SKIP {out_path.name}")
            continue

        # renderiza v\u00eddeo
        cmd = [
            'ffmpeg', '-y', '-loglevel', 'error',
            '-f', 'concat', '-safe', '0', '-i', str(concat_list),
            '-i', str(audio_path),
            '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '23',
            '-pix_fmt', 'yuv420p', '-r', str(FPS),
            '-c:a', 'aac', '-b:a', '192k',
            '-shortest',
            '-movflags', '+faststart',
            str(out_path),
        ]
        try:
            subprocess.run(cmd, check=True, timeout=300)
            size = out_path.stat().st_size
            print(f"  OK  {out_path.name}  ({size // 1024} KB)")
        except Exception as e:
            print(f"  ERR {out_path.name}: {e}")

    print(f"\n=== {len(data)} v\u00eddeos full processados ===")


def slugify(s: str) -> str:
    import re, unicodedata
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode('ascii')
    s = re.sub(r'[^a-zA-Z0-9]+', '-', s.lower()).strip('-')
    return s


if __name__ == '__main__':
    main()
