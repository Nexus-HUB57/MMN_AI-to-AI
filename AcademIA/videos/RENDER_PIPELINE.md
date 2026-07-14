# 🎬 Pipeline de Renderização de Vídeos — AcademIA

> **Documento de governança.** Define COMO renderizar vídeos sem sobrepor arquivos existentes.

## 📋 Princípio Fundamental

**REGRA DE OURO:** Cada vídeo da AcademIA tem **estrutura fixa** em 3 locais distintos:
1. **Roteiro** (markdown) → `AcademIA/videos/roteiros/{NN}-{slug}-roteiro.md`
2. **Thumb** (imagem 16:9) → `AcademIA/videos/thumbnails/thumb-{NN}-{slug}.{ext}`
3. **Vídeo renderizado** (mp4) → `AcademIA/videos/video-{NN}-{slug}.mp4` ⭐ NOVO

**NN** = número com zero à esquerda (00, 01, ..., 14)
**slug** = kebab-case do título curto

## 🎯 Status Atual

| # | Título | Roteiro | Thumb | Vídeo |
|---|--------|---------|-------|-------|
| 00 | Boas-Vindas à Academia | ✅ | ✅ | ✅ 71.8s @ 1080p |

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
├── README.md                       ← status geral
├── RENDER_PIPELINE.md              ← ESTE ARQUIVO
├── thumbnails/                     ← capas 16:9 (2K)
├── roteiros/                       ← roteiros markdown
├── video-{NN}-{slug}.mp4           ← vídeos renderizados finais ⭐
└── render/                         ← arquivos de trabalho (NÃO commitar)
    └── {NN}-{slug}/
        ├── audio/
        ├── frames/
        └── output/
```

## ⚠️ REGRA ANTI-SOBREPOSIÇÃO

**NUNCA** substituir arquivos em `docs/ebook_covers/`, `docs/ebooks/`, `docs/assets/` ou outras pastas legadas.

**SEMPRE** criar em `AcademIA/videos/` (com slug descritivo único).

**Antes de criar qualquer arquivo:**
1. Verificar se já existe com `find . -name "video-XX-*"`
2. Se existir, fazer backup antes
3. Documentar mudança no `CHANGELOG.md`

## 🚀 Próximos Passos

- Renderizar roteiros 01-14 usando o mesmo pipeline
- Criar variações 9:16 (Shorts/Reels) com ffmpeg crop
- Adicionar legendas .SRT via Whisper ou manual
- Publicar no YouTube/Vimeo

## 📊 Métricas de Performance

| Vídeo | Áudios | Frames | Tempo Render | Tamanho |
|-------|--------|--------|--------------|---------|
| 00 | 4 cenas (TTS) | 5 frames (IA) | ~2 min | 6.6MB |

**Custo estimado por vídeo:** ~$0.05-0.10 (imagens + TTS) vs. $5-50 (provedor pago)
**Velocidade:** 30-60 min por vídeo (piloto → produção)

---

**Por MMN AI-to-AI · 2026**
