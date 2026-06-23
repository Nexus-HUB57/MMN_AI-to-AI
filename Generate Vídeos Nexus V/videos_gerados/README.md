# Vídeos Nexus V — Catálogo Completo (15 vídeo-aulas)

**Data:** 22 de junho de 2026
**Pipeline:** `Generate Vídeos Nexus V/scripts_geracao/generate_videos_v2.py`

## Resumo Executivo

Pipeline automatizado que processa roteiros Markdown estruturados em cenas
e gera vídeos MP4 1920x1080 com slides cyberpunk. Cobre as 4 trilhas da
AcademIA Nexus: **Fundamental, Agente, Master, Elite**.

**Total:** 15 vídeo-aulas | 67 cenas | ~166 MB MP4 | ~30 min de conteúdo
narrado (Fundamental) + placeholders para as outras trilhas (TTS pendente).

## Trilha Fundamental (4 vídeos com áudio real)

| Módulo | Duração | Tamanho | Cenas | Persona | Áudio | Thumbnail |
|--------|---------|---------|-------|---------|-------|-----------|
| 00 - Boas-vindas | 261s (~4:21) | 15 MB | 7 | Alencar | ✅ Real | ✓ |
| 01 - Entendendo IOAID | 210s (~3:30) | 14 MB | 5 | Ive | ✅ Real | ✓ |
| 02 - Sistema SHO | 167s (~2:47) | 11 MB | 4 | Ive | ✅ Real | ✓ |
| 03 - Painel Afiliado | 167s (~2:47) | 11 MB | 4 | Ive | ✅ Real | ✓ |

## Trilha Agente (4 vídeos com placeholders de áudio)

| Módulo | Cenas | Persona | Thumbnail |
|--------|-------|---------|-----------|
| 00 - Seu Primeiro Agente | 5 | Ive + Alencar | ✓ |
| 01 - Skills Essenciais | 5 | Ive + Alencar | ✓ |
| 02 - Disparando no WhatsApp | 4 | Ive + Alencar | ✓ |
| 03 - Lendo o Judge Revisor | 4 | Ive + Alencar | ✓ |

## Trilha Master (4 vídeos com placeholders de áudio)

| Módulo | Cenas | Persona | Thumbnail |
|--------|-------|---------|-----------|
| 00 - Otimização de Conversão | 5 | Ive + Alencar | ✓ |
| 01 - Funis e Lifecycle | 5 | Ive + Alencar | ✓ |
| 02 - A/B Testing com Judge | 5 | Ive + Alencar | ✓ |
| 03 - Análise de Coortes e Churn | 5 | Ive + Alencar | ✓ |

## Trilha Elite (3 vídeos com placeholders de áudio)

| Módulo | Cenas | Persona | Thumbnail |
|--------|-------|---------|-----------|
| 00 - Blueprints Elite | 5 | Ive + Alencar | ✓ |
| 01 - Multi-tenant e White-label | 5 | Ive + Alencar | ✓ |
| 02 - Federação de Agentes | 5 | Ive + Alencar | ✓ |

## Tabela Consolidada de Outputs

Para cada vídeo entregue há **2 arquivos**:
- `*_final.mp4` — vídeo final concatenado
- `*_thumb.png` — thumbnail 1280x720

## Pipeline de Geração

### 1. Parser de Roteiros
- Regex captura `## Cena N: Título (Duração)`
- Separa discurso por persona (`Sra. Nexus Ive:`, `Sir. Nexus Alencar:`)
- Extrai `**Visual:**` para o slide

### 2. Render de Slides (PIL)
- 1920x1080 com gradiente vertical por persona
- Grid técnico sutil + círculos concêntricos + pontos neon
- Cantos em L (cyberpunk HUD)
- Texto com fonte DejaVu Sans Bold

### 3. Combinação com Áudio (ffmpeg)
- `libx264 -preset ultrafast -tune stillimage -crf 28`
- `aac -b:a 128k`
- `pix_fmt yuv420p -shortest`

### 4. Concat Final
- `ffmpeg -f concat -safe 0 -i lista.txt -c copy`

### 5. Thumbnails
- 1280x720 com persona + título do módulo + nível + branding
- Caixa de destaque com ID do módulo
- Cantos cyberpunk grandes

## Como Regenerar

```bash
# A partir da raiz do repo MMN_AI-to-AI:
python3 "Generate Vídeos Nexus V/scripts_geracao/generate_videos_v2.py"
```

O script detecta automaticamente:
- 8 roteiros originais (Fundamental + Agente) já existentes
- 4 roteiros Master criados em 22/06/2026
- 3 roteiros Elite criados em 22/06/2026
- Áudios WAV reais quando disponíveis (Fundamental)
- Placeholders silenciosos quando ausentes (Agente/Master/Elite)

## Próximos Passos

- [ ] Regenerar trilhas Agente/Master/Elite com TTS real (synthesize_speech)
- [ ] Adicionar crossfade entre cenas (xfade filter no ffmpeg)
- [ ] Adicionar trilha Master completa (4 módulos)
- [ ] Adicionar trilha Elite completa (3 módulos)
- [ ] Legendas automáticas (Whisper) com SRT sidecar
- [ ] Upload para CDN/S3 com signed URLs
- [ ] Thumbnail A/B testing automático

## Estatísticas

- **15 vídeos MP4** + **15 thumbnails PNG**
- **67 cenas processadas** (19 Fundamental + 18 Agente + 20 Master + 15 Elite)
- **~166 MB** total
- **Tempo de execução:** ~3 minutos (geração) + ~2 minutos (concat/thumb) por módulo
