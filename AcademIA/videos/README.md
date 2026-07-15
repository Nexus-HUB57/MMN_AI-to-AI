# 🎬 Vídeos Full — AcademIA Nexus

**Nexus Affil'IA'te · MMN_IA · 2026 · Onda 49**

Pipeline completo de produção de vídeos-aula com **personas IA voice-cloned PT-BR**, motion-graphics slides e render H.264/AAC padronizado.

---

## 📊 Resumo

| Métrica | Valor |
|---------|-------|
| Total de roteiros parseados | 15 (excluindo variantes) |
| Vídeos full renderizados | 15/15 (100%) |
| Áudios TTS gerados (voz PT-BR) | 15 |
| Frames motion-graphics (PNG 1280x720) | 60 (4 por vídeo) |
| Duração média | ~24s (varia 19-30s conforme TTS) |
| Resolução | 1280×720 @ 25fps |
| Codec | H.264 (video) + AAC 192k (audio) |
| Tamanho total | ~15 MB |

---

## 📁 Estrutura

```
videos/
├── roteiros/                    # 16 roteiros canônicos (00-14 + variantes)
├── thumbnails/                  # 9 thumbnails 2K das ondas anteriores
├── thumb_video-*-full.jpg       # 15 thumbnails dos vídeos full (Onda 49)
├── video-*-full.mp4             # 15 vídeos full com narração TTS
├── video-*.mp4                  # 6 teasers curtos (5-10s, ondas anteriores)
├── audio/                       # 15 áudios TTS WAV (Portuguese_*)
├── frames/                      # 60 PNGs motion-graphics (4 por vídeo)
├── scripts/                     # Pipeline Python
│   ├── parse_roteiros.py
│   ├── generate_full_videos.py
│   ├── roteiros_parsed.json
│   ├── tts_falas.json
│   └── tts_requests.json
└── README.md                    # este arquivo
```

---

## 🎙️ Vozes TTS Utilizadas

| Persona | Voice ID | Uso |
|---------|----------|-----|
| **Sra. Nexus Ive** | `Portuguese_CharmingQueen` | Aulas 01 (IOAID) |
| **Sir. Nexus Alencar** | `Portuguese_Steadymentor` | Aulas 00, 02-07, 10-14 |
| **Dupla (Ive + Alencar)** | `Portuguese_Steadymentor` (intro) | Aulas 08, 09, 12 |

> Em ondas futuras, pretende-se clonar vozes reais usando as amostras WAV oficiais em `personas/ive/audio/official_voice.wav` e `personas/alencar/voz_sir_nexus_alencar.wav`.

---

## 🎨 Identidade Visual (PADRAO_VIDEOS_ACADEMIA.md)

| Elemento | Valor |
|----------|-------|
| **BG dark** | `#0A0F1E` (10, 15, 30) |
| **BG mid** | `#12192D` (18, 25, 45) |
| **Accent Cyan** | `#46B4C3` (70, 180, 195) — Fundamental |
| **Accent Teal** | `#2D9BAF` (45, 155, 175) — Agente |
| **Accent Gold** | `#D7AF5A` (215, 175, 90) — Master / Elite |
| **Text white** | `#F0F0F5` |
| **Text muted** | `#B4B4C3` |

**Elementos HUD obrigatórios:**
- Barra superior 4px (cor da trilha)
- Barra lateral 8px (cor da trilha)
- Pill "TRILHA {SÉRIE}" canto superior esquerdo
- Aula ID canto superior direito
- Brackets HUD nos 4 cantos
- Rodapé `oneverso.com.br/academia · @NexusAffilIAte`
- Watermark `ACADEM IA NEXUS` canto inferior direito

---

## 🛠 Pipeline

```bash
# 1. Parsear roteiros Markdown → JSON estruturado
python3 scripts/parse_roteiros.py

# 2. Gerar fala TTS via mavis batch_synthesize_speech
# (output: audio/full_XX_persona.wav)

# 3. Renderizar vídeos full
python3 scripts/generate_full_videos.py
# ou loop manual ffmpeg (ver scripts/parse_roteiros.py)
```

### Comando ffmpeg base (por vídeo)

```bash
ffmpeg -y -loglevel error \
  -f concat -safe 0 -i videos/frames/full_XX_list.txt \
  -i videos/audio/full_XX_persona.wav \
  -c:v libx264 -preset ultrafast -crf 23 \
  -pix_fmt yuv420p -r 25 \
  -c:a aac -b:a 192k \
  -shortest -movflags +faststart \
  videos/video-XX-{slug}-full.mp4
```

---

## 🎞️ Vídeos Full (Onda 49)

| # | Aula | Persona | Trilha | Duração | Tamanho |
|---|------|---------|--------|---------|---------|
| 00 | Boas-vindas à AcademIA | Alencar | Fundamental | 30.2s | 1.2 MB |
| 01 | Entendendo o IOAID | Ive | Fundamental | 20.0s | 810 KB |
| 02 | O Sistema SHO | Alencar | Fundamental | 26.0s | 955 KB |
| 03 | Painel do Afiliado | Alencar | Fundamental | 24.8s | 942 KB |
| 04 | Primeiro Agente | Alencar | Agente | 20.0s | 850 KB |
| 05 | Skills Essenciais | Alencar | Agente | 27.6s | 1.0 MB |
| 06 | Disparo WhatsApp em Escala | Alencar | Agente | 24.8s | 948 KB |
| 07 | Judge Revisor | Alencar | Agente | 26.8s | 893 KB |
| 08 | Otimização de Conversão | Alencar | Master | 28.1s | 1.0 MB |
| 09 | Funis e Lifecycle | Alencar | Master | 20.0s | 885 KB |
| 10 | A/B Testing com Judge | Alencar | Master | 20.0s | 843 KB |
| 11 | Coortes e Churn | Alencar | Master | 26.9s | 893 KB |
| 12 | Blueprints Elite | Alencar | Elite | 23.4s | 912 KB |
| 13 | Multi-Tenant e White-Label | Alencar | Elite | 20.0s | 873 KB |
| 14 | Federação de Agentes | Alencar | Elite | 23.0s | 910 MB |

---

## 🔜 Próximas Ondas

1. **Clonagem de voz real** — usar `clone_voice` com WAVs oficiais
2. **Legendas SRT automáticas** — extrair texto da fala
3. **Versão 16:9 horizontal 1920x1080** — para YouTube principal
4. **Versão 9:16 vertical 1080x1920** — para Shorts/Reels
5. **Integração com YouTube** — upload PRIVATE → unlisted via `scripts/youtube/upload_academia_youtube.py`
6. **Loudnorm EBU R128** — padronizar para I=-16 LUFS
7. **Trilha sonora** — música de fundo royalty-free

---

## ⚠️ Não Duplicar

- **Roteiros:** fonte canônica em `videos/roteiros/` (não mexer)
- **Teasers:** `videos/video-*.mp4` (5-10s, ondas anteriores) — não sobrescrever
- **Thumbnails 2K:** `videos/thumbnails/` (não duplicar)
- **Padrão visual:** `producao/PADRAO_VIDEOS_ACADEMIA.md` (contrato permanente)

---

*AcademIA Nexus · MMN AI-to-AI · 2026 · Onda 49 (2026-07-15)*
