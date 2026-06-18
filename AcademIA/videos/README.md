---
title: "Vídeos Nexus V — Academia"
description: "Hub de roteiros, thumbnails, e vídeos curtos da Academia Nexus HUB57"
author: "MMN_IA Collective"
version: "1.0.0"
date: "2026-06-18"
pattern: "MMN_IA"
---

# 🎬 Vídeos Nexus V — Academia

> **Hub central de produção audiovisual da Academia Nexus HUB57**
> Roteiros · Thumbnails · Vídeos · Especificações técnicas

## 📂 Estrutura

```text
AcademIA/videos/
├── README.md                       ← este arquivo
├── thumbnails/                     ← Capas dos vídeos (1280x720)
│   ├── thumb-00-boas-vindas.png
│   ├── thumb-02-sho.png
│   └── thumb-04-primeiro-agente.png
├── roteiros/                       ← Roteiros detalhados
│   ├── 00-boas-vindas-academia-roteiro.md
│   ├── 02-sho-sistema-imune-roteiro.md
│   └── 04-primeiro-agente-roteiro.md
└── *.mp4                           ← Vídeos curtos renderizados
    └── video-00-boas-vindas.mp4    (prova de conceito 6s)
```

## 🎯 Status Atual (Junho 2026)

| # | Título | Roteiro | Thumbnail | Vídeo | Status |
|---|--------|---------|-----------|-------|--------|
| 00 | Boas-Vindas à Academia | ✅ | ✅ | ✅ 6s | POC pronto |
| 01 | Entendendo IOAID | ⏳ | ⏳ | ⏳ | Planejado |
| 02 | O Sistema SHO | ✅ | ✅ | ⏳ | Roteiro pronto |
| 03 | Painel do Afiliado | ⏳ | ⏳ | ⏳ | Planejado |
| 04 | Construindo Seu 1º Agente | ✅ | ✅ | ⏳ | Roteiro pronto |
| 05 | Skills Essenciais | ⏳ | ⏳ | ⏳ | Planejado |
| 06 | Disparo WhatsApp | ⏳ | ⏳ | ⏳ | Planejado |
| 07 | Judge Revisor | ⏳ | ⏳ | ⏳ | Planejado |

**Legenda:** ✅ Pronto · ⏳ Planejado · ❌ Bloqueado

## 🎨 Identidade Visual

- **Paleta principal:**
  - `#0A0E27` — Fundo escuro (deep space)
  - `#00D9FF` — Cyan (highlights, código)
  - `#B967FF` — Roxo (acentos, IA)
  - `#FFD700` — Dourado (sucesso, premium)
  - `#FF3366` — Vermelho (alerta, erro)

- **Tipografia:**
  - Títulos: **Montserrat Bold** ou **Inter Bold**
  - Código: **Fira Code** ou **JetBrains Mono**
  - Narração: voz masculina BR, ritmo calmo-técnico

- **Trilha sonora:** Eletrônica minimalista, 90-110 BPM, sem vocais

## 🛠️ Stack de Produção Sugerida

| Função | Ferramenta | Custo |
|--------|-----------|-------|
| Edição principal | DaVinci Resolve | Grátis |
| Motion graphics | After Effects ou Canva Pro | $$ |
| Animação 2D | Rive ou Lottie | $ |
| Narração IA | ElevenLabs Multilingual v2 | $$ |
| Geração de vídeo | Runway, Pika, ou Sora | $$$ |
| Thumbnails IA | Midjourney ou DALL-E | $$ |
| Render final | FFmpeg + H.264 | Grátis |
| Hospedagem | YouTube, Vimeo, ou Bunny.net | $ |

## 📊 Roadmap de Produção

### Fase 1 — POC (✅ Concluído)
- [x] 1 vídeo curto gerado (6s, 768p, prova de conceito)
- [x] 3 thumbnails (1280x720, 2K)
- [x] 3 roteiros completos
- [x] Estrutura de pastas organizada

### Fase 2 — Mínimo Viável (Planejado)
- [ ] Renderizar vídeos 1-4 com narração (1080p, 2-3min cada)
- [ ] Versões verticais 9:16 (60s) para Shorts/Reels
- [ ] Legendas .SRT em pt-BR
- [ ] Thumbnail definitiva para todos

### Fase 3 — Escala (Futuro)
- [ ] 15 vídeos (1 por curso das trilhas)
- [ ] 10 vídeos de apostila (deep-dives)
- [ ] 3 webinars gravados (full-length, 1h cada)
- [ ] Série "Por Trás do Código" (making-of)

## 🎯 Métricas de Sucesso

- **Qualidade:** NPS > 8.0 entre alunos que assistem
- **Engajamento:** > 60% assistem até o fim (taxa de retenção)
- **Conversão:** > 30% que assistem iniciam o curso
- **Reuso:** cada vídeo é matéria-prima para 3-5 Shorts

## 📜 Padrão MMN_IA aplicado

Todos os roteiros seguem:
- Frontmatter YAML com metadados
- Estrutura de cenas numeradas
- Especificações técnicas explícitas
- Checklist de entrega
- Tom de mistério + nostalgia + técnica

---

*"Um vídeo bem feito vale mais que 100 slides. Um vídeo bem roteirizado vale mais que 100 vídeos."*

**Por MMN AI-to-AI · 2026**
