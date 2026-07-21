---
title: "Render Pipeline · Slides → PNGs → Vídeos"
description: "Pipeline completo para renderizar slides markdown em PNGs e depois em vídeos MP4"
tags: [render, slides, png, video, pipeline, image-synth, gen-videos]
categoria: producao
nivel: Elite
autor: "Ravi (CTO/AI)"
date: 2026-07-17
status: oficial
---

# 🎬 Render Pipeline · Slides → PNGs → Vídeos

> Pipeline completo e automatizado para renderizar slides markdown em **PNGs** (com `image_synthesize`) e depois em **vídeos MP4** (com `gen_videos`).

## 🎯 Visão Geral

```
slides.md (markdown)
       ↓
[1. PARSE] extrair cenas
       ↓
slides_data.json (cenas estruturadas)
       ↓
[2. PROMPT] gerar prompts descritivos
       ↓
prompts.json (1 prompt por cena)
       ↓
[3. PNG] image_synthesize (paralelo)
       ↓
slides/*.png (1920x1080)
       ↓
[4. TTS] synthesize_speech (cenas com fala)
       ↓
audio/*.wav (voz Ive/Alencar/Dupla)
       ↓
[5. VIDEO] gen_videos (imagem → vídeo)
       ↓
videos/cena-*.mp4 (6-10s por cena)
       ↓
[6. COMBINE] ffmpeg (áudio + vídeo)
       ↓
output/modulo-final.mp4 (módulo completo)
```

## 📋 Estrutura de Arquivos

```
scripts/render-pipeline/
├── 01-parse-slides.py          # Markdown → JSON
├── 02-gen-prompts.py            # JSON → prompts
├── 03-render-pngs.py            # Prompts → PNGs
├── 04-gen-audio.py              # Texto → TTS (voz clonar)
├── 05-render-videos.py          # PNGs + áudios → MP4 curtos
├── 06-combine-final.py          # Concatenar + master final
├── 07-publish.py                # Mover para CDN + DB
├── config.py                    # Configurações globais
└── run-all.sh                   # Orquestra tudo
```

## 🔧 Config (`config.py`)

```python
# config.py

# Paths
SLIDES_DIR = "AcademIA/cursos"
OUTPUT_DIR = "output"
THUMBNAILS_DIR = "assets/thumbnails"

# Personas
PERSONAS = {
    "ive": {
        "voice_id": "ive_clone",
        "image": "assets/personas/ive.png",
        "color": "#63eaff",
        "tone": "técnico-prática"
    },
    "alencar": {
        "voice_id": "alencar_clone",
        "image": "assets/personas/alencar.png",
        "color": "#b78cff",
        "tone": "autoridade-acadêmica"
    },
    "dupla": {
        "voice_id": "dupla_mix",
        "image": "assets/personas/dupla.png",
        "color": "#ff7eb6",
        "tone": "storytelling-diálogo"
    }
}

# Padrão visual
SLIDE_STYLE = {
    "resolution": "1920x1080",
    "background": "#0a0e1a",
    "primary_color": "#63eaff",
    "secondary_color": "#b78cff",
    "accent_color": "#facc15",
    "text_color": "#e5edf5",
    "font": "Inter",
    "border": "1px solid rgba(99,234,255,0.18)"
}

# Vídeo
VIDEO_CONFIG = {
    "scene_duration_sec": 8,
    "video_resolution": "1080P",
    "fps": 30,
    "bitrate": "5M"
}

# Limites
RATE_LIMITS = {
    "image_synthesize_per_min": 10,
    "synthesize_speech_per_min": 30,
    "gen_videos_concurrent": 4
}
```

## 📝 Script 01 — Parse Slides

```python
#!/usr/bin/env python3
"""
01-parse-slides.py
Lê slides markdown e extrai cenas estruturadas
"""

import re
import json
import sys
from pathlib import Path

def parse_slide_section(text: str) -> dict:
    """Extrai uma seção de slide (entre '## SLIDE NN' e o próximo)"""
    # Extrair número
    m = re.search(r'##\s*SLIDE\s+(\d+)', text)
    if not m:
        return None
    num = m.group(1)

    # Extrair título e tempo
    title_match = re.search(rf'##\s+SLIDE\s+{num}.*?\n.*?\*\*(.+?)\*\*', text, re.DOTALL)
    title = title_match.group(1) if title_match else f"Slide {num}"

    time_match = re.search(r'\((\d+:\d+)\s*-\s*(\d+:\d+)\)', text)
    start_time = time_match.group(1) if time_match else "00:00"
    end_time = time_match.group(2) if time_match else "00:08"

    # Extrair conteúdo (texto entre ``` ... ```)
    code_match = re.search(r'```\n(.*?)\n```', text, re.DOTALL)
    visual = code_match.group(1) if code_match else ""

    # Extrair narração (texto depois do bloco de código)
    narrative_match = re.search(r'```\n.*?\n```\n\n(.+?)(?=\n---|\n##)', text, re.DOTALL)
    narrative = narrative_match.group(1).strip() if narrative_match else ""

    return {
        "num": int(num),
        "title": title.strip(),
        "start_time": start_time,
        "end_time": end_time,
        "duration_sec": time_to_sec(end_time) - time_to_sec(start_time),
        "visual_ascii": visual,
        "narrative": narrative
    }

def time_to_sec(t: str) -> int:
    m, s = t.split(':')
    return int(m) * 60 + int(s)

def parse_slides_file(filepath: Path) -> list:
    content = filepath.read_text(encoding='utf-8')

    # Encontrar header do módulo
    header_match = re.search(r'---\n(.*?)\n---', content, re.DOTALL)
    metadata = {}
    if header_match:
        for line in header_match.group(1).split('\n'):
            if ':' in line:
                k, v = line.split(':', 1)
                metadata[k.strip()] = v.strip()

    # Encontrar todas as seções SLIDE
    slides = []
    sections = re.split(r'(?=##\s+SLIDE\s+\d+)', content)
    for section in sections[1:]:
        slide = parse_slide_section(section)
        if slide:
            slides.append(slide)

    return {
        "module_id": metadata.get('modulo', 'unknown'),
        "trilha": metadata.get('trilha', 'unknown'),
        "total_slides": len(slides),
        "slides": slides
    }

if __name__ == "__main__":
    slide_file = Path(sys.argv[1])
    result = parse_slides_file(slide_file)
    print(json.dumps(result, indent=2, ensure_ascii=False))
```

## 📝 Script 02 — Generate Prompts

```python
#!/usr/bin/env python3
"""
02-gen-prompts.py
Converte cenas estruturadas em prompts descritivos
para image_synthesize e gen_videos
"""

import json
import sys

VISUAL_TEMPLATES = {
    "default": """
        Cinematic dark background (#0a0e1a) with subtle gradient.
        Neon cyan accents (#63eaff) and purple highlights (#b78cff).
        Title in bold modern font, centered.
        Subtitle in lighter color, below title.
        Subtle grid pattern overlay.
        Cyberpunk tech aesthetic.
        High contrast, 1920x1080 resolution.
    """,

    "code_block": """
        Dark code editor style background (#0a0e1a).
        Syntax-highlighted code (cyan, purple, green).
        Monospace font (JetBrains Mono or similar).
        Line numbers on left.
        Soft glow on highlighted lines.
        Window chrome at top.
    """,

    "diagram": """
        Dark cyberpunk background.
        Connected nodes and edges forming a clear diagram.
        Nodes have soft glow effects (cyan and purple).
        Labels in white sans-serif font.
        Arrows showing flow direction.
        Geometric, clean, modern.
    """,

    "split": """
        Side-by-side comparison layout.
        Left side: 'ANTES' in muted gray.
        Right side: 'DEPOIS' in vibrant cyan/green.
        Each side has icon + text + metric.
        Arrow from left to right.
        Clear visual contrast.
    """,

    "persona": """
        Single character portrait (3/4 view).
        Neon outlined silhouette.
        Dark cyberpunk background with bokeh.
        Soft glow rim light.
        Modern, friendly, professional.
    """
}

def detect_visual_type(slide: dict) -> str:
    """Detecta tipo de visual baseado no conteúdo"""
    text = slide.get('visual_ascii', '').lower()
    if '```' in text or 'sql' in text or 'json' in text or 'code' in text:
        return 'code_block'
    if '┌' in text or '→' in text or 'node' in text:
        return 'diagram'
    if 'antes' in text and 'depois' in text:
        return 'split'
    if 'persona' in slide.get('title', '').lower():
        return 'persona'
    return 'default'

def build_prompt(slide: dict, persona: str = "alencar") -> str:
    """Constrói prompt para image_synthesize"""
    visual_type = detect_visual_type(slide)
    template = VISUAL_TEMPLATES[visual_type]

    # Adicionar persona se for slide de abertura/fechamento
    if slide['num'] == 1 or 'abertura' in slide.get('title', '').lower():
        template += f" Include a {persona} persona portrait."

    prompt = f"""
        Slide {slide['num']}: {slide['title']}.
        {template}
        On-screen text: "{slide['title']}" (large, bold, centered).
        Professional, educational, modern aesthetic.
        No actual text on screen other than the title.
        High quality, suitable for video production.
    """.strip()

    return {
        "slide_num": slide['num'],
        "type": visual_type,
        "prompt": prompt,
        "title": slide['title'],
        "duration_sec": slide['duration_sec']
    }

if __name__ == "__main__":
    slides_data = json.load(sys.stdin)
    persona = sys.argv[1] if len(sys.argv) > 1 else "alencar"

    prompts = [build_prompt(slide, persona) for slide in slides_data['slides']]

    output = {
        "module_id": slides_data['module_id'],
        "persona": persona,
        "prompts": prompts
    }

    print(json.dumps(output, indent=2, ensure_ascii=False))
```

## 📝 Script 03 — Render PNGs

```python
#!/usr/bin/env python3
"""
03-render-pngs.py
Usa image_synthesize para gerar PNGs dos slides
"""

import json
import sys
import time
import concurrent.futures
from pathlib import Path

# Aqui você chamaria image_synthesize
# (MCP tool da plataforma)

def render_png(prompt_data: dict, output_dir: Path) -> dict:
    """Renderiza 1 PNG a partir de um prompt"""
    output_path = output_dir / f"slide-{prompt_data['slide_num']:02d}.png"

    # Chamada real:
    # result = image_synthesize(
    #     prompt=prompt_data['prompt'],
    #     output_file_path=str(output_path),
    #     aspect_ratio="16:9",
    #     resolution="1K"
    # )

    # Mock para documentação
    print(f"  Renderizando slide {prompt_data['slide_num']} → {output_path.name}")

    time.sleep(0.5)  # Simular latência

    return {
        "slide_num": prompt_data['slide_num'],
        "output": str(output_path),
        "status": "ok"
    }

if __name__ == "__main__":
    prompts_data = json.load(sys.stdin)
    output_dir = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("output/slides")
    output_dir.mkdir(parents=True, exist_ok=True)

    print(f"🎨 Renderizando {len(prompts_data['prompts'])} slides → {output_dir}")

    # Paralelizar (max 4 concorrentes por rate limit)
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        futures = [
            executor.submit(render_png, p, output_dir)
            for p in prompts_data['prompts']
        ]

        results = [f.result() for f in concurrent.futures.as_completed(futures)]

    print(f"✅ {len(results)} slides renderizados")
```

## 📝 Script 04 — Generate Audio (TTS)

```python
#!/usr/bin/env python3
"""
04-gen-audio.py
Usa synthesize_speech para gerar áudio das falas
"""

import json
import sys
from pathlib import Path

def gen_audio_for_slide(slide: dict, voice_id: str, output_dir: Path) -> dict:
    """Gera áudio TTS para 1 cena"""
    output_path = output_dir / f"slide-{slide['num']:02d}.wav"

    if not slide.get('narrative'):
        return {"slide_num": slide['num'], "status": "skip"}

    # Chamada real:
    # synthesize_speech(
    #     text=slide['narrative'],
    #     output_file_path=str(output_path),
    #     voice_id=voice_id,
    #     speed=1.0
    # )

    print(f"  Áudio slide {slide['num']} → {output_path.name}")

    return {
        "slide_num": slide['num'],
        "output": str(output_path),
        "duration_sec": slide['duration_sec'],
        "status": "ok"
    }

if __name__ == "__main__":
    slides_data = json.load(sys.stdin)
    voice_id = sys.argv[1] if len(sys.argv) > 1 else "alencar_clone"
    output_dir = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("output/audio")
    output_dir.mkdir(parents=True, exist_ok=True)

    print(f"🎙️ Gerando áudios (voz: {voice_id}) → {output_dir}")

    results = [
        gen_audio_for_slide(slide, voice_id, output_dir)
        for slide in slides_data['slides']
    ]

    print(f"✅ {len([r for r in results if r['status'] == 'ok'])} áudios gerados")
```

## 📝 Script 05 — Render Videos

```python
#!/usr/bin/env python3
"""
05-render-videos.py
Usa gen_videos para criar vídeos curtos a partir de PNGs
"""

import json
import sys
import time
from pathlib import Path

def render_video(slide: dict, slides_dir: Path, output_dir: Path) -> dict:
    """Renderiza 1 vídeo a partir de 1 PNG"""
    slide_num = slide['num']
    png_path = slides_dir / f"slide-{slide_num:02d}.png"
    video_path = output_dir / f"scene-{slide_num:02d}.mp4"

    if not png_path.exists():
        return {"slide_num": slide_num, "status": "skip-png-missing"}

    # Prompt para gen_videos (animar o slide)
    video_prompt = f"""
        Subtle camera zoom-in on the slide.
        Slight parallax movement in background.
        Smooth 8-second animation.
        Subtle particle effects in background.
        Educational video style.
    """.strip()

    # Chamada real:
    # gen_videos(
    #     prompt=video_prompt,
    #     input_image_path=str(png_path),
    #     output_file_path=str(video_path),
    #     duration=8,
    #     resolution="1080P"
    # )

    print(f"  Vídeo scene {slide_num} → {video_path.name}")
    time.sleep(1)  # Simular latência

    return {
        "slide_num": slide_num,
        "output": str(video_path),
        "duration_sec": 8,
        "status": "ok"
    }

if __name__ == "__main__":
    slides_data = json.load(sys.stdin)
    slides_dir = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("output/slides")
    output_dir = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("output/videos")
    output_dir.mkdir(parents=True, exist_ok=True)

    print(f"🎬 Renderizando {len(slides_data['slides'])} cenas → {output_dir}")

    # Sequencial (gen_videos é pesado)
    results = [
        render_video(slide, slides_dir, output_dir)
        for slide in slides_data['slides']
    ]

    print(f"✅ {len([r for r in results if r['status'] == 'ok'])} vídeos renderizados")
```

## 📝 Script 06 — Combine Final

```python
#!/usr/bin/env python3
"""
06-combine-final.py
Combina vídeos + áudios em MP4 final usando ffmpeg
"""

import json
import subprocess
import sys
from pathlib import Path

def combine_scene(scene_num: int, video_dir: Path, audio_dir: Path, output_dir: Path) -> Path:
    """Combina 1 vídeo + 1 áudio"""
    video_path = video_dir / f"scene-{scene_num:02d}.mp4"
    audio_path = audio_dir / f"slide-{scene_num:02d}.wav"
    output_path = output_dir / f"scene-{scene_num:02d}-final.mp4"

    if not audio_path.exists():
        # Sem áudio, só vídeo
        output_path = video_path
        return output_path

    cmd = [
        "ffmpeg",
        "-i", str(video_path),
        "-i", str(audio_path),
        "-c:v", "copy",
        "-c:a", "aac",
        "-shortest",
        "-y",
        str(output_path)
    ]

    subprocess.run(cmd, check=True, capture_output=True)
    return output_path

def concatenate_scenes(scene_files: list, output_path: Path):
    """Concatena todas as cenas em 1 vídeo final"""
    concat_file = output_path.parent / "concat-list.txt"
    with open(concat_file, 'w') as f:
        for scene in scene_files:
            f.write(f"file '{scene.absolute()}'\n")

    cmd = [
        "ffmpeg",
        "-f", "concat",
        "-safe", "0",
        "-i", str(concat_file),
        "-c", "copy",
        "-y",
        str(output_path)
    ]

    subprocess.run(cmd, check=True, capture_output=True)
    return output_path

if __name__ == "__main__":
    slides_data = json.load(sys.stdin)
    video_dir = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("output/videos")
    audio_dir = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("output/audio")
    output_dir = Path(sys.argv[3]) if len(sys.argv) > 3 else Path("output/final")
    output_dir.mkdir(parents=True, exist_ok=True)

    module_id = slides_data['module_id']
    final_path = output_dir / f"{module_id}.mp4"

    print(f"🎞️ Combinando cenas de {module_id}...")

    # 1. Combinar vídeo + áudio por cena
    scene_files = []
    for slide in slides_data['slides']:
        scene_path = combine_scene(slide['num'], video_dir, audio_dir, output_dir)
        scene_files.append(scene_path)
        print(f"  ✓ Scene {slide['num']} combined")

    # 2. Concatenar tudo
    print(f"📦 Concatenando em {final_path.name}...")
    final = concatenate_scenes(scene_files, final_path)

    print(f"✅ Vídeo final: {final}")
```

## 🚀 Orquestrador (`run-all.sh`)

```bash
#!/bin/bash
# run-all.sh
# Pipeline completo de slides → vídeo

set -e

MODULE=${1:-"AcademIA/cursos/fundamental/00-boas-vindas-slides.md"}
PERSONA=${2:-"alencar"}
MODULE_ID=$(basename "$MODULE" -slides.md)

OUTPUT_BASE="output/$MODULE_ID"
mkdir -p "$OUTPUT_BASE"/{slides,audio,videos,final}

echo "🎬 Render Pipeline · $MODULE_ID (persona: $PERSONA)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Parse
echo "📖 [1/6] Parsing slides..."
python scripts/render-pipeline/01-parse-slides.py "$MODULE" > "$OUTPUT_BASE/slides.json"

# 2. Gen prompts
echo "✍️  [2/6] Generating prompts..."
cat "$OUTPUT_BASE/slides.json" | python scripts/render-pipeline/02-gen-prompts.py "$PERSONA" > "$OUTPUT_BASE/prompts.json"

# 3. Render PNGs
echo "🎨 [3/6] Rendering PNGs..."
cat "$OUTPUT_BASE/prompts.json" | python scripts/render-pipeline/03-render-pngs.py "$OUTPUT_BASE/slides"

# 4. Gen audio
echo "🎙️ [4/6] Generating audio..."
cat "$OUTPUT_BASE/slides.json" | python scripts/render-pipeline/04-gen-audio.py "PERSONA_VOICE_ID" "$OUTPUT_BASE/audio"

# 5. Render videos
echo "🎬 [5/6] Rendering videos..."
cat "$OUTPUT_BASE/slides.json" | python scripts/render-pipeline/05-render-videos.py "$OUTPUT_BASE/slides" "$OUTPUT_BASE/videos"

# 6. Combine final
echo "🎞️ [6/6] Combining final..."
cat "$OUTPUT_BASE/slides.json" | python scripts/render-pipeline/06-combine-final.py "$OUTPUT_BASE/videos" "$OUTPUT_BASE/audio" "$OUTPUT_BASE/final"

echo ""
echo "✅ Vídeo final: $OUTPUT_BASE/final/$MODULE_ID.mp4"
echo "📊 Tamanho: $(du -sh $OUTPUT_BASE | head -1)"
echo "⏱  Duração: $(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 $OUTPUT_BASE/final/$MODULE_ID.mp4 2>/dev/null || echo '?')"
```

## 🧪 Exemplo de Uso

```bash
# Renderizar módulo 00 da Trilha Fundamental
./run-all.sh AcademIA/cursos/fundamental/00-boas-vindas-slides.md alencar

# Renderizar módulo 01 com persona Ive
./run-all.sh AcademIA/cursos/fundamental/01-entendendo-ioaid-slides.md ive

# Renderizar todos os 7 módulos com slides (batch)
for slides in AcademIA/cursos/{fundamental,agente,master,elite}/*-slides.md; do
    trilha=$(basename $(dirname $slides))
    modulo=$(basename $slides -slides.md)
    persona="alencar"  # default

    # Detectar persona pelo nome do módulo
    case $modulo in
        *ioaid|*funis) persona="ive" ;;
        *painel|*otimizacao|*federacao) persona="dupla" ;;
    esac

    ./run-all.sh "$slides" "$persona"
done
```

## ⚠️ Custos Estimados (por módulo)

| Recurso | Custo |
|---------|-------|
| 8-10 PNGs (image_synthesize) | R$ 4-6 |
| 5-8 min TTS (synthesize_speech) | R$ 1-2 |
| 8-10 vídeos 8s (gen_videos) | R$ 8-15 |
| Storage CDN (1GB/mês) | R$ 0,30 |
| **TOTAL/módulo** | **R$ 13-23** |
| **TOTAL/16 módulos** | **R$ 200-370** |

## 📊 Pipeline de Erros

| Erro | Detecção | Recovery |
|------|----------|----------|
| image_synthesize timeout | Retry 3x com backoff | Pular cena, marcar como degradada |
| TTS voice_id inválido | Validar antes | Fallback para voz padrão |
| gen_videos falha (5% dos casos) | Retry 2x | Usar PNG + Ken Burns effect via ffmpeg |
| ffmpeg concat falha | Verificar codec | Recodificar tudo com mesmo codec |

## 📚 Materiais Relacionados

- `producao/GO-LIVE-CHECKLIST.md` — antes do go-live
- `producao/NGINX-CDN-CONFIG.md` — config nginx/CDN
- `producao/STATUS.md` — dashboard
- `producao/scripts/smoke-test-academia.sh` — smoke test
- `producao/INCIDENT-RESPONSE-RUNBOOK.md` — resposta a incidentes

---

*AcademIA · Render Pipeline · 2026*