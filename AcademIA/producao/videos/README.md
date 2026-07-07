# 🎬 Vídeos — AcademIA

**Nexus Affil'IA'te · MMN_IA · 2026**

Esta pasta contém os vídeos finalizados dos módulos da Academ'IA, com personas **Sra. Nexus Ive** e **Sir. Nexus Alencar** em solo ou co-apresentação.

---

## 🎥 Vídeos Disponíveis

### ✅ V1 · Boas-vindas ao Nexus — Sir. Nexus Alencar (solo)

- **Arquivo:** `v1_alencar_00_boas_vindas.mp4`
- **Thumbnail:** `thumb_v1_alencar.jpg`
- **Duração:** ~7 min 10 s (430 s)
- **Resolução:** 1920×1080 (FullHD)
- **Codec:** H.264 (video) + AAC 192 kbps (audio)
- **Tamanho:** 11 MB
- **Persona:** Sir. Nexus Alencar (Mentor Técnico)
- **Nível:** Fundamental
- **Roteiro fonte:** [`../roteiros/00-boas-vindas-alencar.md`](../roteiros/00-boas-vindas-alencar.md)
- **Cenas:** 7 (intro + 6 falas + outro)
- **Voz TTS:** `Portuguese_Steadymentor`

**Conteúdo das cenas:**
1. Abertura — Recepção técnica e respeitosa
2. A Arquitetura — Como o sistema realmente funciona (5 camadas)
3. O Conceito de IOAID (acrônimo expandido)
3b. Os 4 Pilares da arquitetura
4. Sistema SHO — Híbrido de Orquestração
5. Latência, Custo e Conformidade (métricas)
6. Como Pedir Ajuda e Próximos Passos

---

### ✅ V2 · Entendendo o IOAID — Dupla Ive + Alencar

- **Arquivo:** `v2_dupla_01_ioaid.mp4`
- **Thumbnail:** `thumb_v2_dupla.jpg`
- **Duração:** ~6 min 29 s (389 s)
- **Resolução:** 1920×1080 (FullHD)
- **Codec:** H.264 (video) + AAC 192 kbps (audio)
- **Tamanho:** 9.6 MB
- **Personas:** Sra. Nexus Ive + Sir. Nexus Alencar (co-apresentação)
- **Nível:** Fundamental
- **Roteiro fonte:** [`../roteiros/01-ioaid-dupla.md`](../roteiros/01-ioaid-dupla.md)
- **Cenas:** 7 (intro + 9 falas alternadas + outro)
- **Vozes TTS:**
  - **Sra. Nexus Ive:** `Portuguese_CharmingQueen`
  - **Sir. Nexus Alencar:** `Portuguese_Steadymentor`

**Conteúdo das cenas:**
1. Abertura Conjunta — A pergunta fundamental
2. A Visão Estratégica — Por que distribuída?
3. A Execução Técnica — As camadas da IOAID
4. O Caso Real — Anatomia de uma mensagem
5. Reflexão — O que isso significa para o afiliado
6. 4 Erros comuns dos afiliados
7. Encerramento Conjunto — Próximo passo

---

## 🎨 Identidade Visual

| Elemento | Valor |
|----------|-------|
| **Paleta Nexus** | Dark `(10, 14, 30)` · Blue `(30, 64, 175)` · Cyan `(56, 189, 248)` · Vinho `(90, 20, 60)` · Gold `(212, 175, 55)` |
| **Tipografia** | DejaVu Sans Bold (títulos) · DejaVu Sans Regular (corpo) · DejaVu Serif (subtítulos) |
| **Elementos HUD** | Brackets de canto, mini-redes neurais decorativas, glow radial sutil |
| **Avatar Alencar** | Paleta azul-marinho/grafite, Kippah estilizada, barba grisalha |
| **Avatar Ive** | Paleta vinho/oliva/preto, cabelo curto negro, tatuagem sutil sob olho |

---

## 🛠 Pipeline de Produção

```
[1. ROTEIRO] → [2. TTS] → [3. SLIDES] → [4. RENDER] → [5. CONCAT]
     markdown      PT-BR     PIL/Pillow    ffmpeg       ffmpeg
                  voices    1920x1080    H.264       concat
```

### Detalhes Técnicos

| Etapa | Ferramenta | Output |
|-------|-----------|--------|
| Roteiro | Markdown estruturado | Texto por cena |
| Áudio TTS | `synthesize_speech` com vozes PT-BR | MP3 24 kHz mono |
| Frames | PIL (Pillow) com gradientes e HUD | WEBP 1920×1080 |
| Render | ffmpeg + libx264 | MP4 por cena |
| Concat | ffmpeg concat demuxer | MP4 final |

### Comandos-chave

```bash
# Geração de frames
python3 gen_slides.py

# Renderização completa
bash render_videos.sh

# Thumbnail
ffmpeg -ss 5 -i video.mp4 -frames:v 1 -q:v 2 thumb.jpg
```

---

## 📋 Status de Produção

| # | Módulo | Persona | Status |
|---|--------|---------|--------|
| V1 | 00 Boas-vindas (Alencar) | Solo | ✅ Renderizado |
| V2 | 01 IOAID (Dupla) | Dupla | ✅ Renderizado |
| V3 | 00 Boas-vindas (Ive) | Solo | 📋 Roteiro pronto (existente) |
| V4 | 00 Boas-vindas (Dupla) | Dupla | 🔄 Pendente |
| V5 | 02 Sistema SHO | Alencar | 🔄 Pendente |
| V6 | 00 Primeiro Agente | Alencar | 🔄 Pendente |
| ... | ... | ... | ... |

---

## 🎙️ Vozes TTS Utilizadas

| Persona | Voice ID | Caráter |
|---------|----------|---------|
| **Sra. Nexus Ive** | `Portuguese_CharmingQueen` | Voz autoritária com calor humano |
| **Sir. Nexus Alencar** | `Portuguese_Steadymentor` | Voz madura, didática e técnica |

> **Nota:** As vozes foram selecionadas para corresponder à personalidade descrita nas fichas técnicas (`AcademIA/personas/`). Em iterações futuras, pretende-se clonar vozes reais usando as amostras WAV oficiais (`voz_sra_nexus_ive.wav`, `voz_sir_nexus_alencar.wav`).

---

## 📦 Assets Correlatos

- **Roteiros:** `../roteiros/`
- **Frames:** `../assets/frames/` (15 WEBPs)
- **Vinhetas:** `../assets/vinhetas/` (intro + outro)
- **Áudios:** `../assets/audios/` (17 MP3s — 9 Alencar + 9 Dupla)

---

## 🚀 Próximos Passos

1. **Clonagem de voz real** — usar `clone_voice` com as amostras WAV oficiais (quando disponível)
2. **V3 — Boas-vindas (Ive)** — gerar versão solo usando roteiro existente
3. **V4 — Boas-vindas (Dupla)** — co-apresentação
4. **V5 — Sistema SHO (Alencar)** — roteiro + áudio + vídeo
5. **Render em 4K** — para publicação em TVs e monitores premium
6. **Legendas SRT** — gerar automaticamente a partir do roteiro
7. **Tradução EN/ES** — para escalar audiência

---

*AcademIA · Nexus Affil'IA'te · 2026 · Versão 1.0.0 · 2026-07-07*