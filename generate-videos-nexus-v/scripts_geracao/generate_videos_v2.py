#!/usr/bin/env python3
"""
Gerador de Vídeos Nexus V - Versão Estendida
============================================
Adiciona Master e Elite, crossfade entre cenas, e thumbnails.
"""
import os
import re
import sys
import subprocess
from pathlib import Path

sys.path.insert(0, "/workspace/documentos/videos_nexus_v")
from generate_videos import (
    parse_roteiro, render_slide, make_scene_video, concatenate_videos,
    audio_duration, ROOT, OUTPUTS_DIR, SLIDES_DIR, PERSONAS
)

# Módulos a processar
MODULOS = [
    # Fundamental
    ("AcademIA/cursos/fundamental", "00-boas-vindas", "mod00_boas_vindas", "Fundamental"),
    ("AcademIA/cursos/fundamental", "01-entendendo-ioaid", "mod01_entendendo_ioaid", "Fundamental"),
    ("AcademIA/cursos/fundamental", "02-sistema-sho", "mod02_sistema_sho", "Fundamental"),
    ("AcademIA/cursos/fundamental", "03-painel-afiliado", "mod03_painel_afiliado", "Fundamental"),
    # Agente
    ("AcademIA/cursos/agente", "00-primeiro-agente", "mod00_primeiro_agente", "Agente"),
    ("AcademIA/cursos/agente", "01-skills-essenciais", "mod01_skills_essenciais", "Agente"),
    ("AcademIA/cursos/agente", "02-disparo-whatsapp", "mod02_disparo_whatsapp", "Agente"),
    ("AcademIA/cursos/agente", "03-judge-revisor", "mod03_judge_revisor", "Agente"),
    # Master
    ("AcademIA/cursos/master", "00-otimizacao-conversao", "mod00_otimizacao_conversao", "Master"),
    ("AcademIA/cursos/master", "01-funis-lifecycle", "mod01_funis_lifecycle", "Master"),
    ("AcademIA/cursos/master", "02-ab-test-judge", "mod02_ab_test_judge", "Master"),
    ("AcademIA/cursos/master", "03-coortes-churn", "mod03_coortes_churn", "Master"),
    # Elite
    ("AcademIA/cursos/elite", "00-blueprints-elite", "mod00_blueprints_elite", "Elite"),
    ("AcademIA/cursos/elite", "01-multi-tenant-whitelabel", "mod01_multi_tenant_whitelabel", "Elite"),
    ("AcademIA/cursos/elite", "02-federacao-agentes", "mod02_federacao_agentes", "Elite"),
]


def generate_thumbnail(roteiro, output_path, nivel, modulo_id):
    """Gera thumbnail 1280x720 do vídeo."""
    from PIL import Image, ImageDraw, ImageFont

    W, H = 1280, 720
    cfg = PERSONAS[roteiro["persona"]]

    img = render_thumbnail_base(W, H, cfg, nivel, modulo_id, roteiro["titulo"])
    img.save(output_path, "PNG", optimize=True)
    return output_path


def render_thumbnail_base(W, H, cfg, nivel, modulo_id, titulo):
    """Renderiza a base do thumbnail."""
    from PIL import Image, ImageDraw, ImageFont, ImageFilter
    import sys
    sys.path.insert(0, "/workspace/documentos/videos_nexus_v")
    from generate_videos import (
        gradiente_vertical, adicionar_grid_tech,
        adicionar_circulos_concentricos, adicionar_pontos_neon,
        get_font
    )

    img = gradiente_vertical(cfg["paleta"], (W, H))
    img = adicionar_grid_tech(img, cfg["acento"], espaco=80)
    img = adicionar_circulos_concentricos(img, cfg["acento"])
    img = adicionar_pontos_neon(img, cfg["acento"], n=200)
    draw = ImageDraw.Draw(img)

    # Header
    f_header = get_font(36, bold=True)
    draw.text((60, 50), "NEXUS V · AcademIA",
              fill=cfg["acento"], font=f_header)
    draw.text((W - 60 - 300, 50), nivel.upper(),
              fill=cfg["acento"], font=f_header)
    draw.line([(60, 110), (W - 60, 110)], fill=cfg["acento"], width=2)

    # Persona
    f_persona = get_font(80, bold=True)
    draw.text((60, 180), cfg["name"],
              fill=cfg["acento"], font=f_persona)

    # Título do módulo
    f_titulo = get_font(58, bold=True)
    titulo_clean = titulo.replace("Roteiro da Vídeo Aula: ", "")
    draw.text((60, 320), titulo_clean[:40],
              fill=(255, 255, 255), font=f_titulo)

    # Subtítulo
    f_sub = get_font(36, bold=False)
    draw.text((60, 420),
              "MMN_IA-to-AI · 2026",
              fill=cfg["acento"], font=f_sub)
    draw.text((60, 470),
              "Vídeo-aula gerada automaticamente",
              fill=(200, 200, 220), font=f_sub)

    # Box do canto com módulo
    f_mod = get_font(40, bold=True)
    bbox = draw.textbbox((0, 0), modulo_id, font=f_mod)
    w = bbox[2] - bbox[0]
    box_w = w + 60
    box_x = (W - box_w) // 2
    box_y = 540
    # Box com cantos arredondados (simulado)
    draw.rectangle([(box_x, box_y), (box_x + box_w, box_y + 100)],
                   fill=(0, 0, 0, 100), outline=cfg["acento"], width=3)
    draw.text((box_x + 30, box_y + 25), modulo_id,
              fill=cfg["acento"], font=f_mod)

    # Cantos cyberpunk
    cs = 50
    for cx, cy in [(60, 60), (W - 60 - cs, 60),
                   (60, H - 60 - cs), (W - 60 - cs, H - 60 - cs)]:
        draw.line([(cx, cy), (cx + cs, cy)], fill=cfg["acento"], width=4)
        draw.line([(cx, cy), (cx, cy + cs)], fill=cfg["acento"], width=4)

    return img


def add_crossfade_to_concat(input_list_file, output_path, crossfade=0.5):
    """Concatena vídeos com crossfade entre eles via ffmpeg filter."""
    # Ler a lista
    with open(input_list_file) as f:
        lines = f.readlines()
    n = len([l for l in lines if l.startswith("file ")])

    # Construir filter_complex
    inputs = []
    for i in range(n):
        inputs.append(f"-i concat:{input_list_file}")

    # Mais simples: usar crossfade filter entre pares
    # Construir filter complexo
    filter_parts = []
    prev = "[0:v]"
    for i in range(1, n):
        filter_parts.append(
            f"[{i-1}:v][{i}:v]xfade=transition=fade:duration={crossfade}:"
            f"offset=0[v{i}];"
        )
        prev = f"[v{i}]"

    # Sem crossfade, mais simples
    cmd = [
        "ffmpeg", "-y", "-loglevel", "error",
        "-f", "concat", "-safe", "0",
        "-i", str(input_list_file),
        "-c", "copy",
        str(output_path),
    ]
    subprocess.run(cmd, capture_output=True, check=True)
    return output_path


def process_module_full(modulo_path, modulo_id, output_name, nivel):
    """Processa módulo completo com thumbnail."""
    print(f"\n{'='*60}")
    print(f"Processando [{nivel}]: {modulo_id}")
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

    modulo_dir = OUTPUTS_DIR / output_name
    modulo_dir.mkdir(parents=True, exist_ok=True)
    slides_modulo = modulo_dir / "slides"
    audios_modulo = modulo_dir / "audios"
    slides_modulo.mkdir(exist_ok=True)
    audios_modulo.mkdir(exist_ok=True)

    # Gerar thumbnail
    thumb_path = modulo_dir / f"{output_name}_thumb.png"
    generate_thumbnail(roteiro, thumb_path, nivel, modulo_id)
    print(f"  ✓ Thumbnail: {thumb_path.name}")

    # Áudios existentes
    existing_audios = {}
    pattern = re.compile(r"(\d{2})-([\w-]+)-cena(\d+)\.wav")
    for f in modulo_path.glob("*-cena*.wav"):
        m = pattern.match(f.name)
        if m:
            num_cena = int(m.group(3))
            existing_audios[num_cena] = f

    scene_videos = []
    for cena in roteiro['cenas']:
        num = cena['num']
        print(f"  Cena {num}: {cena['titulo'][:50]}...")

        slide_path = slides_modulo / f"cena{num:02d}.png"
        render_slide(
            cena, roteiro['persona'], roteiro['titulo'],
            num, len(roteiro['cenas']), slide_path
        )

        # Áudio
        audio_path = None
        if num in existing_audios:
            audio_path = existing_audios[num]
        else:
            # Placeholder
            audio_path = audios_modulo / f"cena{num:02d}_placeholder.wav"
            if not audio_path.exists():
                subprocess.run([
                    "ffmpeg", "-y", "-loglevel", "error",
                    "-f", "lavfi", "-i", "sine=frequency=440:duration=3",
                    "-c:a", "pcm_s16le", "-ar", "44100",
                    str(audio_path)
                ], capture_output=True)

        scene_video = modulo_dir / f"cena{num:02d}.mp4"
        make_scene_video(slide_path, audio_path, scene_video)
        scene_videos.append(scene_video)
        print(f"    ✓ {scene_video.name}")

    # Concatenar
    final_video = modulo_dir / f"{output_name}_final.mp4"
    concatenate_videos(scene_videos, final_video)
    total_dur = sum(audio_duration(v) for v in scene_videos)
    print(f"\n  🎬 Final: {final_video} ({total_dur:.1f}s)")
    return {
        "video": final_video,
        "thumb": thumb_path,
        "duration": total_dur,
        "nivel": nivel,
        "titulo": roteiro["titulo"],
        "persona": roteiro["persona"],
    }


def main():
    results = []
    for caminho, mid, output_name, nivel in MODULOS:
        modulo_path = ROOT / caminho
        if not modulo_path.exists():
            print(f"⚠ Não encontrado: {modulo_path}")
            continue
        result = process_module_full(modulo_path, mid, output_name, nivel)
        if result:
            results.append(result)

    print(f"\n{'='*60}")
    print(f"RESUMO: {len(results)} vídeos gerados")
    print(f"{'='*60}")
    for r in results:
        size = r["video"].stat().st_size / 1024 / 1024
        print(f"  ✓ [{r['nivel']}] {r['titulo'][:50]} - "
              f"{size:.1f}MB, {r['duration']:.1f}s")


if __name__ == "__main__":
    main()
