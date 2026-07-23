---
title: "ONDA-49 · Videoaulas 15-33 · Slides B2 + MP4"
version: "1.0"
date: "2026-07-23"
persona: "dupla (Alencar + Ive)"
pattern: "MMN_IA · AcademIA · Videoaulas"
---

# 🌊 ONDA-49 · Videoaulas 15-33 — Slides B2 + Renders MP4

**19 videoaulas cobrindo trilhas Fundamental → Master → Elite → Cursos especializados**

## 📊 Deliverables desta onda

| Categoria | Quantidade | Local |
|---|---|---|
| **Roteiros MD** | 19 (15-33) | `AcademIA/videos/roteiros/` |
| **Slides B2 (PNG 1920×1080)** | 95 (19 × 5 cenas) | `AcademIA/videos/slides/aula-NN/` |
| **Vídeos MP4 720p (com áudio TTS)** | 9 | `AcademIA/videos/renders/` |
| **Apostilas novas** | 3 (31, 32, 33) | `AcademIA/apostilas/` |
| **Script gerador** | 1 | `AcademIA/videos/scripts/gen_slides_b2.py` |

## 🎨 Design System (Slides B2)

- **Paleta**: Navy `#0A1628` · Gold `#D4AF37` · Cyan `#22D3EE`
- **Fontes**: Inter (900/800/600/400) · JetBrains Mono (700)
- **Resolução slides**: 1920×1080 lossless
- **Resolução vídeo**: 1280×720 @ 25fps · libx264 crf24 · AAC 96k

## 🎭 5 cenas por aula

| # | Layout | Duração | Conteúdo |
|---|---|---|---|
| 01 | Hero | 10s | Título + ícone + trilha + progress bar |
| 02 | Stats | 15s | 3 cards com números-chave |
| 03 | Cards Framework | 15s | 4 pilares em grid 2×2 |
| 04 | Pyramid | 15s | Hierarquia de maturidade (5 níveis) |
| 05 | CTA | 15s | Chamada para `oneverso.com.br/academia` |

## 📚 Índice das 19 videoaulas

| # | Título | Trilha | Slides | MP4 | Status |
|---|---|---|---|---|---|
| 15 | Métricas & ROI do Ecossistema | Fundamental | ✅ | ⏳ | Aguarda áudio TTS |
| 16 | Trilha Fundamental IA | Fundamental | ✅ | ⏳ | Aguarda áudio TTS |
| 17 | SEO + IA · Marketing de Conteúdo | Master | ✅ | ✅ | **Render OK** |
| 18 | Pentest de Agentes IA | Elite | ✅ | ⏳ | Aguarda áudio TTS |
| 19 | Monetização Avançada em Escala | Master | ✅ | ⏳ | Aguarda áudio TTS |
| 20 | Trilha Elite Engenharia | Elite | ✅ | ⏳ | Aguarda áudio TTS |
| 21 | Trilha Master Arquitetura | Master | ✅ | ⏳ | Aguarda áudio TTS |
| 22 | Trilha Master Mentoria | Master | ✅ | ⏳ | Aguarda áudio TTS |
| 23 | Curso RAG Prático | Curso | ✅ | ⏳ | Aguarda áudio TTS |
| 24 | Curso Agents LangGraph | Curso | ✅ | ⏳ | Aguarda áudio TTS |
| 25 | Curso Prompt Engineering | Curso | ✅ | ⏳ | Aguarda áudio TTS |
| 26 | Curso Vector DB | Curso | ✅ | ✅ | **Render OK** |
| 27 | Curso Voice AI | Curso | ✅ | ✅ | **Render OK** |
| 28 | Curso Multimodal RAG | Curso | ✅ | ✅ | **Render OK** |
| 29 | AI-to-AI Protocol | Fundamental | ✅ | ✅ | **Render OK** |
| 30 | Federação Zero-Trust | Fundamental | ✅ | ✅ | **Render OK** |
| 31 | Observability em IA | Elite | ✅ | ✅ | **Render OK** |
| 32 | Fine-Tuning de LLMs | Elite | ✅ | ✅ | **Render OK** |
| 33 | AI Safety & Governança | Elite | ✅ | ✅ | **Render OK** |

## 🚀 Como regenerar/editar slides

```bash
cd AcademIA/videos/scripts
pip install playwright
python3 -m playwright install chromium
python3 gen_slides_b2.py
# Output: 95 PNGs em /tmp/nexus_p1/slides/ (ajuste OUT path se necessário)
```

## ⚠️ Pendências (próxima onda ONDA-50)

| Item | Bloqueio | Solução |
|---|---|---|
| 10 MP4 restantes (aulas 15-16, 18-25) | Áudio TTS voice-clone com schema issue | Retomar via `fal-client` Python direto com `FAL_KEY` |
| Capas YouTube 16:9 personalizadas | Fluxo `image_generation → UploadFileWrapper` validado, aguardando execução |
| Voz canônica Ive (regenerar #26-33) | Chunks atuais usam pitch-shift +6 semitons | Voice-clone com sample oficial (2:21 Ive) |

**Autor**: Nexus AI-to-AI Pipeline · **Hub**: MMN AI-to-AI · **Data**: 2026-07-23
