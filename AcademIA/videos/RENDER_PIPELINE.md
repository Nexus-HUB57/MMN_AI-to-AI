# 🎬 Pipeline de Renderização de Vídeos — AcademIA

> **Documento de governança.** Define COMO renderizar vídeos sem sobrepor arquivos existentes.

## 📋 Princípio Fundamental

**REGRA DE OURO:** Cada vídeo da AcademIA tem **estrutura fixa** em 3 locais distintos:
1. **Roteiro** (markdown) → `AcademIA/videos/roteiros/{NN}-{slug}-roteiro.md`
2. **Thumb** (imagem 16:9) → `AcademIA/videos/thumbnails/thumb-{NN}-{slug}.{ext}`
3. **Vídeo renderizado** (mp4) → `AcademIA/videos/video-{NN}-{slug}.mp4` ⭐

**NN** = número com zero à esquerda (00, 01, ..., 14)
**slug** = kebab-case do título curto

## 🎯 Catálogo Atual

| # | Slug | Roteiro | Thumb | Vídeo | Status |
|---|------|---------|-------|-------|--------|
| 00 | boas-vindas | ✅ | ✅ | ✅ **71.8s @ 1080p** | **Completo** |
| 00 | boas-vindas-poc | — | — | ✅ 5.9s @ 768p | POC antigo (preservado) |
| 05 | skills-assembly | — | — | ✅ 5.9s @ 768p | Teaser antigo |
| 07 | judge-scales | — | — | ✅ 5.9s @ 768p | Teaser antigo |
| - | elite-federacao | ✅ | — | ✅ 10.1s @ 768p | Teaser antigo |
| - | master-otimizacao | ✅ | — | ✅ 10.1s @ 768p | Teaser antigo |
| - | hero-jornada | — | — | ✅ 10.1s @ 768p | Trailer |

> **Nota:** Os arquivos `-poc` e os "teasers" são versões curtas (5-10s) anteriores a este pipeline. Foram preservados com sufixo descritivo para evitar confusão.

## 🔧 Pipeline de Renderização (comprovado)

### Stack Utilizada (nativa, sem custo de API externa)

```
1. Roteiro markdown (texto da narração por cena)
   ↓
2. synthesize_speech (TTS público) → cenas em .wav
   ↓
3. image_synthesize (IA de imagem) → frames em .png
   ↓
4. ffmpeg (composição cena por cena) → cenas em .mp4
   ↓
5. ffmpeg (concatenação) → vídeo final
```

### Vozes TTS utilizadas

- **Alencar** (voz masculina, didática): `Portuguese_Deep-VoicedGentleman`
- **Ive** (voz feminina, acolhedora): `Portuguese_Kind-heartedGirl`

### Comandos FFmpeg (modelo)

```bash
# Cena individual
ffmpeg -y -loop 1 -i frames/cena{N}.png -i audio/cena{N}.wav \
  -t {DURACAO_S} \
  -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black,fade=t=in:0:2" \
  -c:v libx264 -preset ultrafast -crf 23 -pix_fmt yuv420p -r 30 \
  -c:a aac -b:a 128k -shortest cena{N}.mp4

# Concatenação
for f in cena1 cena2 cena3 cena4 cena5; do echo "file '$f.mp4'"; done > lista.txt
ffmpeg -y -f concat -safe 0 -i lista.txt \
  -c:v libx264 -preset ultrafast -crf 23 -pix_fmt yuv420p -r 30 \
  -c:a aac -b:a 128k output/video-final.mp4
```

## 📁 Estrutura de Pastas

```
AcademIA/videos/
├── README.md                       ← status geral dos roteiros
├── RENDER_PIPELINE.md              ← ESTE ARQUIVO
├── thumbnails/                     ← capas 16:9 (2K)
├── roteiros/                       ← roteiros markdown
├── video-{NN}-{slug}.mp4           ← vídeos renderizados finais
├── video-{NN}-{slug}-poc.mp4       ← POCs/teasers antigos (preservados)
└── render/                         ← arquivos de trabalho (NÃO commitar)
    └── {NN}-{slug}/
        ├── audio/
        ├── frames/
        └── output/
```

## ⚠️ REGRA ANTI-SOBREPOSIÇÃO

**NUNCA** substituir arquivos em:
- `docs/ebook_covers/`
- `docs/ebooks/`
- `docs/assets/`
- `docs/ebooks_markdown/`
- `assets/ebook_covers/`
- Outras pastas legadas

**SEMPRE** criar em `AcademIA/videos/` (com slug descritivo único).

**Antes de criar qualquer arquivo:**
1. Verificar se já existe com `find . -name "video-XX-*"`
2. Se existir, **renomear com sufixo descritivo** (ex: `-poc`, `-v1`, `-teaser`)
3. **NUNCA sobrescrever** um vídeo existente sem confirmação
4. Documentar mudança no `CHANGELOG.md`

## 🚀 Próximos Passos

- Renderizar roteiros 01-14 usando o mesmo pipeline (~30-60 min cada)
- Criar variações 9:16 (Shorts/Reels) com ffmpeg crop
- Adicionar legendas .SRT via Whisper ou manual
- Publicar no YouTube/Vimeo

## 📊 Métricas de Performance

| Vídeo | Áudios | Frames | Tempo Render | Tamanho | Resolução |
|-------|--------|--------|--------------|---------|-----------|
| 00-boas-vindas | 4 cenas (TTS) | 5 frames (IA) | ~2 min | 6.6MB | 1920x1080 |

**Custo estimado por vídeo:** ~$0.05-0.10 (imagens + TTS) vs. $5-50 (provedor pago)
**Velocidade:** 30-60 min por vídeo (piloto → produção)

---

**Por MMN AI-to-AI · 2026**
