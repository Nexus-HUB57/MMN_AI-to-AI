#!/usr/bin/env python3
"""
Gerador de Vídeos Nexus V
==========================
Cria vídeo-aulas a partir de roteiros Markdown estruturados em cenas.
Para cada cena:
  1. Renderiza um slide 1920x1080 com título, persona, e visual cyberpunk
  2. Combina o slide (estático) com o áudio (WAV) em MP4
  3. Concatena todas as cenas em um vídeo final por módulo

Personas suportadas: Sra. Nexus Ive e Sir. Nexus Alencar
"""
import os
import re
import json
import subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import textwrap

# --- Configuração ---
ROOT = Path("/workspace/MMN_AI-to-AI")
OUT_DIR = Path("/workspace/documentos/videos_nexus_v")
SLIDES_DIR = OUT_DIR / "slides"
AUDIOS_TTS_DIR = OUT_DIR / "audios_tts"
OUTPUTS_DIR = OUT_DIR / "outputs"
SLIDES_DIR.mkdir(parents=True, exist_ok=True)
AUDIOS_TTS_DIR.mkdir(parents=True, exist_ok=True)
OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)

W, H = 1920, 1080  # Resolução 1080p

# Cores por persona
PERSONAS = {
    "Ive": {
        "name": "Sra. Nexus Ive",
        "paleta": [(20, 10, 30), (90, 30, 100), (200, 100, 180), (255, 150, 220)],
        "acento": (255, 130, 200),
        "cor_texto": (250, 240, 255),
        "tag": "MATRIARCA · ESTRATEGISTA",
    },
    "Alencar": {
        "name": "Sir. Nexus Alencar",
        "paleta": [(5, 15, 35), (20, 60, 140), (60, 130, 220), (130, 200, 255)],
        "acento": (100, 200, 255),
        "cor_texto": (235, 245, 255),
        "tag": "TÉCNICO · MESTRE",
    },
    "dupla": {
        "name": "Sra. Ive & Sir. Alencar",
        "paleta": [(15, 5, 30), (120, 30, 90), (200, 80, 150), (255, 180, 100)],
        "acento": (255, 200, 100),
        "cor_texto": (250, 250, 255),
        "tag": "DUPLA · CUMPLICIDADE",
    },
}


def get_font(size, bold=True):
    paths_bold = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    ]
    paths_reg = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    ]
    for p in (paths_bold if bold else paths_reg):
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def gradiente_vertical(cores, tamanho):
    img = Image.new("RGB", tamanho, cores[0])
    pixels = img.load()
    n = len(cores) - 1
    for y in range(tamanho[1]):
        t = y / tamanho[1]
        idx = min(int(t * n), n - 1)
        local_t = (t * n) - idx
        c1, c2 = cores[idx], cores[idx + 1]
        r = int(c1[0] * (1 - local_t) + c2[0] * local_t)
        g = int(c1[1] * (1 - local_t) + c2[1] * local_t)
        b = int(c1[2] * (1 - local_t) + c2[2] * local_t)
        for x in range(tamanho[0]):
            pixels[x, y] = (r, g, b)
    return img


def adicionar_grid_tech(img, cor, espaco=60):
    """Adiciona grid técnico sutil ao fundo."""
    overlay = Image.new("RGB", img.size, (0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    for x in range(0, img.size[0], espaco):
        draw.line([(x, 0), (x, img.size[1])], fill=cor, width=1)
    for y in range(0, img.size[1], espaco):
        draw.line([(0, y), (img.size[0], y)], fill=cor, width=1)
    overlay = overlay.filter(ImageFilter.GaussianBlur(0.3))
    return Image.blend(img, overlay, 0.15)


def adicionar_pontos_neon(img, cor, n=120):
    import random
    random.seed(42)
    overlay = Image.new("RGB", img.size, (0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    for _ in range(n):
        x = random.randint(0, img.size[0] - 1)
        y = random.randint(0, img.size[1] - 1)
        r = random.randint(2, 4)
        brilho = random.randint(180, 255)
        draw.ellipse((x - r, y - r, x + r, y + r),
                     fill=(brilho, brilho, brilho))
    overlay = overlay.filter(ImageFilter.GaussianBlur(0.6))
    return Image.blend(img, overlay, 0.3)


def adicionar_circulos_concentricos(img, cor, centro=None, n=5):
    if centro is None:
        centro = (img.size[0] // 2, img.size[1] // 2)
    overlay = Image.new("RGB", img.size, (0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    for r in range(200, 80, -25):
        draw.ellipse(
            (centro[0] - r, centro[1] - r, centro[0] + r, centro[1] + r),
            outline=cor, width=2
        )
    overlay = overlay.filter(ImageFilter.GaussianBlur(0.8))
    return Image.blend(img, overlay, 0.25)


def wrap_text(draw, text, font, max_width):
    """Quebra texto em múltiplas linhas."""
    words = text.split()
    lines = []
    current = []
    for w in words:
        test = " ".join(current + [w])
        bbox = draw.textbbox((0, 0), test, font=font)
        if bbox[2] - bbox[0] <= max_width:
            current.append(w)
        else:
            if current:
                lines.append(" ".join(current))
            current = [w]
    if current:
        lines.append(" ".join(current))
    return lines


def render_slide(cena, persona, modulo_titulo, num_cena, total_cenas,
                 output_path):
    """Renderiza um slide 1920x1080 para uma cena."""
    cfg = PERSONAS[persona]
    img = gradiente_vertical(cfg["paleta"], (W, H))
    img = adicionar_grid_tech(img, cfg["acento"], espaco=80)
    img = adicionar_circulos_concentricos(img, cfg["acento"])
    img = adicionar_pontos_neon(img, cfg["acento"], n=180)
    draw = ImageDraw.Draw(img)

    # Header
    f_header = get_font(28, bold=False)
    draw.text((60, 50), "NEXUS V · AcademIA", fill=cfg["acento"], font=f_header)
    draw.text((W - 60 - 400, 50), cfg["tag"],
              fill=cfg["acento"], font=f_header)

    # Linha decorativa
    draw.line([(60, 100), (W - 60, 100)], fill=cfg["acento"], width=2)

    # Persona (avatar simulado)
    f_persona = get_font(60, bold=True)
    draw.text((60, 150), cfg["name"], fill=cfg["acento"], font=f_persona)

    # Módulo e cena
    f_modulo = get_font(32, bold=False)
    draw.text((60, 230), f"{modulo_titulo}",
              fill=(200, 200, 220), font=f_modulo)
    f_cena = get_font(24, bold=True)
    draw.text((W - 60 - 250, 230),
              f"CENA {num_cena} de {total_cenas}",
              fill=cfg["acento"], font=f_cena)

    # Visual indicator (caixa cyberpunk)
    visual_y = 290
    f_visual_label = get_font(22, bold=True)
    draw.text((60, visual_y), "▌ VISUAL", fill=cfg["acento"],
              font=f_visual_label)
    f_visual = get_font(26, bold=False)
    visual_lines = wrap_text(draw, cena["visual"], f_visual, W - 180)
    y = visual_y + 40
    for line in visual_lines[:3]:  # máximo 3 linhas
        draw.text((60, y), line, fill=cfg["cor_texto"], font=f_visual)
        y += 36

    # Box do discurso
    box_y = 480
    box_h = 460
    # Fundo semi-transparente
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    box_draw = ImageDraw.Draw(overlay)
    box_draw.rectangle(
        [(60, box_y), (W - 60, box_y + box_h)],
        fill=(0, 0, 0, 80), outline=cfg["acento"], width=3
    )
    img = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")
    draw = ImageDraw.Draw(img)

    # Label do discurso
    f_label = get_font(24, bold=True)
    draw.text((90, box_y + 20), f"❝ {cfg['name']}",
              fill=cfg["acento"], font=f_label)

    # Texto do discurso
    f_disc = get_font(34, bold=False)
    discurso_lines = wrap_text(draw, cena["discurso"], f_disc, W - 220)
    y = box_y + 80
    for line in discurso_lines:
        draw.text((90, y), line, fill=cfg["cor_texto"], font=f_disc)
        y += 50
        if y > box_y + box_h - 30:
            break

    # Footer: indicador de cena e branding
    f_footer = get_font(20, bold=False)
    draw.text((60, H - 60),
              f"MMN_IA-to-AI · 2026 · Módulo {num_cena:02d}",
              fill=cfg["acento"], font=f_footer)
    draw.text((W - 60 - 350, H - 60),
              "Sistema SHO · IA Distribuída",
              fill=cfg["acento"], font=f_footer)

    # Cantos cyberpunk (L-shapes)
    corner_size = 40
    cs = corner_size
    for cx, cy in [(60, 60), (W - 60 - cs, 60),
                   (60, H - 60 - cs), (W - 60 - cs, H - 60 - cs)]:
        draw.line([(cx, cy), (cx + cs, cy)], fill=cfg["acento"], width=3)
        draw.line([(cx, cy), (cx, cy + cs)], fill=cfg["acento"], width=3)

    img.save(output_path, "PNG", optimize=True)
    return output_path


def audio_duration(wav_path):
    """Retorna duração do áudio em segundos."""
    result = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", str(wav_path)],
        capture_output=True, text=True
    )
    try:
        return float(result.stdout.strip())
    except ValueError:
        return 60.0  # fallback


def make_scene_video(slide_path, audio_path, output_path):
    """Combina slide (PNG estático) + áudio (WAV) em MP4."""
    duration = audio_duration(audio_path)
    cmd = [
        "ffmpeg", "-y", "-loglevel", "error",
        "-loop", "1", "-i", str(slide_path),
        "-i", str(audio_path),
        "-c:v", "libx264", "-preset", "ultrafast", "-tune", "stillimage", "-crf", "28",
        "-c:a", "aac", "-b:a", "128k",
        "-pix_fmt", "yuv420p",
        "-shortest",
        "-t", str(duration),
        str(output_path),
    ]
    subprocess.run(cmd, capture_output=True, check=True)
    return output_path


def concatenate_videos(video_list, output_path):
    """Concatena múltiplos MP4 em um único vídeo."""
    # Criar arquivo de lista para ffmpeg
    list_path = output_path.with_suffix(".txt")
    with open(list_path, "w") as f:
        for v in video_list:
            f.write(f"file '{v.absolute()}'\n")
    cmd = [
        "ffmpeg", "-y", "-f", "concat", "-safe", "0",
        "-i", str(list_path),
        "-c", "copy",
        str(output_path),
    ]
    subprocess.run(cmd, capture_output=True, check=True)
    list_path.unlink()
    return output_path


# ============== PARSER DE ROTEIROS ==============

def parse_roteiro(md_path):
    """Parse de roteiro Markdown estruturado em cenas."""
    with open(md_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Detectar persona
    persona = "Ive"
    if "Alencar" in content[:500]:
        persona = "Alencar"
    if "Ive" in content[:500] and "Alencar" in content[:500]:
        persona = "dupla"

    # Detectar título do módulo
    titulo_match = re.search(r"#\s+Roteiro da Vídeo Aula:\s*(.+)", content)
    titulo = titulo_match.group(1).strip() if titulo_match else "Módulo"

    # Parse das cenas
    cenas = []
    # Padrão: "## Cena N: Título (...)"
    cena_pattern = re.compile(
        r"##\s+Cena\s+(\d+):?\s*([^\(]+?)\s*\(([^)]+)\)",
        re.IGNORECASE
    )
    parts = cena_pattern.split(content)

    # parts[0] = prelúdio; depois grupos de 4: num, titulo, duracao, conteudo
    for i in range(1, len(parts), 4):
        try:
            num = int(parts[i])
            titulo_cena = parts[i + 1].strip()
            duracao = parts[i + 2].strip()
            corpo = parts[i + 3] if i + 3 < len(parts) else ""

            # Extrair Visual
            visual_match = re.search(r"\*\*Visual:\*\*\s*([^\n]+(?:\n(?!\*\*)[^\n]+)*)",
                                     corpo)
            visual = visual_match.group(1).strip() if visual_match else ""

            # Extrair Discurso (texto entre aspas ou após nome:)
            discurso_match = re.search(
                r"\*\*[^*]+:\*\*\s*\"([^\"]+)\"",
                corpo, re.DOTALL
            )
            if not discurso_match:
                # Tentar formato sem aspas
                discurso_match = re.search(
                    r"\*\*[^*]+:\*\*\s*(.+?)(?=\n\n|\n\*\*Visual|\Z)",
                    corpo, re.DOTALL
                )
            discurso = discurso_match.group(1).strip() if discurso_match else ""

            cenas.append({
                "num": num,
                "titulo": titulo_cena,
                "duracao": duracao,
                "visual": visual[:500],
                "discurso": discurso[:1500],
            })
        except (IndexError, ValueError) as e:
            continue

    return {"persona": persona, "titulo": titulo, "cenas": cenas}


# ============== PIPELINE PRINCIPAL ==============

def find_existing_audios(modulo_path):
    """Encontra áudios já existentes para o módulo."""
    audios = {}
    pattern = re.compile(r"(\d{2})-([\w-]+)-cena(\d+)\.wav")
    for f in modulo_path.glob("*-cena*.wav"):
        m = pattern.match(f.name)
        if m:
            num_cena = int(m.group(3))
            audios[num_cena] = f
    return audios


def process_module(modulo_path, modulo_id, output_name):
    """Processa um módulo completo: gera slides, áudios, e vídeo final."""
    print(f"\n{'='*60}")
    print(f"Processando: {modulo_id}")
    print(f"{'='*60}")

    roteiro_path = modulo_path / f"{modulo_id}-roteiro.md"
    if not roteiro_path.exists():
        print(f"  ✗ Roteiro não encontrado: {roteiro_path}")
        return None

    roteiro = parse_roteiro(roteiro_path)
    print(f"  Persona: {roteiro['persona']}")
    print(f"  Título: {roteiro['titulo']}")
    print(f"  Cenas: {len(roteiro['cenas'])}")

    if not roteiro['cenas']:
        print("  ✗ Nenhuma cena encontrada")
        return None

    # Criar diretórios
    modulo_dir = OUTPUTS_DIR / output_name
    modulo_dir.mkdir(parents=True, exist_ok=True)
    slides_modulo = modulo_dir / "slides"
    audios_modulo = modulo_dir / "audios"
    slides_modulo.mkdir(exist_ok=True)
    audios_modulo.mkdir(exist_ok=True)

    # Encontrar áudios existentes
    existing_audios = find_existing_audios(modulo_path)
    print(f"  Áudios existentes: {len(existing_audios)}")

    scene_videos = []
    for cena in roteiro['cenas']:
        num = cena['num']
        print(f"  Cena {num}: {cena['titulo'][:50]}...")

        # 1. Renderizar slide
        slide_path = slides_modulo / f"cena{num:02d}.png"
        render_slide(
            cena, roteiro['persona'], roteiro['titulo'],
            num, len(roteiro['cenas']), slide_path
        )
        print(f"    ✓ Slide: {slide_path.name}")

        # 2. Verificar áudio
        audio_path = None
        if num in existing_audios:
            audio_path = existing_audios[num]
        else:
            # Gerar placeholder TTS (silêncio com tom)
            audio_path = audios_modulo / f"cena{num:02d}_tts.wav"
            # Usar ffmpeg para gerar áudio de silêncio com tom de espera
            subprocess.run([
                "ffmpeg", "-y",
                "-f", "lavfi", "-i",
                f"sine=frequency=440:duration=3",
                "-c:a", "pcm_s16le", "-ar", "44100",
                str(audio_path)
            ], capture_output=True)
            print(f"    ⚠ Áudio TTS placeholder gerado (sem TTS real)")

        # 3. Gerar vídeo da cena
        scene_video = modulo_dir / f"cena{num:02d}.mp4"
        make_scene_video(slide_path, audio_path, scene_video)
        scene_videos.append(scene_video)
        print(f"    ✓ Vídeo: {scene_video.name}")

    # 4. Concatenar
    final_video = modulo_dir / f"{output_name}_final.mp4"
    concatenate_videos(scene_videos, final_video)
    print(f"\n  🎬 Vídeo final: {final_video}")
    print(f"     Duração total: {sum(audio_duration(v) for v in scene_videos):.1f}s")
    return final_video


def main():
    """Processa todos os módulos com roteiro."""
    modulos = [
        ("AcademIA/cursos/fundamental", "00-boas-vindas", "mod00_boas_vindas"),
        ("AcademIA/cursos/fundamental", "01-entendendo-ioaid", "mod01_entendendo_ioaid"),
        ("AcademIA/cursos/fundamental", "02-sistema-sho", "mod02_sistema_sho"),
        ("AcademIA/cursos/fundamental", "03-painel-afiliado", "mod03_painel_afiliado"),
        ("AcademIA/cursos/agente", "00-primeiro-agente", "mod00_primeiro_agente"),
        ("AcademIA/cursos/agente", "01-skills-essenciais", "mod01_skills_essenciais"),
        ("AcademIA/cursos/agente", "02-disparo-whatsapp", "mod02_disparo_whatsapp"),
        ("AcademIA/cursos/agente", "03-judge-revisor", "mod03_judge_revisor"),
    ]

    results = []
    for caminho, mid, output_name in modulos:
        modulo_path = ROOT / caminho
        if not modulo_path.exists():
            print(f"⚠ Diretório não encontrado: {modulo_path}")
            continue
        result = process_module(modulo_path, mid, output_name)
        if result:
            results.append(result)

    print(f"\n{'='*60}")
    print(f"RESUMO: {len(results)} vídeos gerados com sucesso")
    print(f"{'='*60}")
    for r in results:
        size = r.stat().st_size / 1024 / 1024
        print(f"  ✓ {r.name} ({size:.1f} MB)")


if __name__ == "__main__":
    main()
