# Vídeos Nexus V - Vídeo-Aulas Geradas

**Data de geração:** 17 de junho de 2026
**Pipeline:** Generate Vídeos Nexus V + AcademIA/cursos

## Resumo

Este diretório contém os vídeos MP4 gerados pelo pipeline automatizado que combina:
- **Roteiros estruturados** de `AcademIA/cursos/{fundamental,agente}/*-roteiro.md`
- **Personas** Sra. Nexus Ive (matriarca/estrategista) e Sir. Nexus Alencar (técnico/mestre)
- **Slides cyberpunk** 1920x1080 renderizados com gradientes neon + grid técnico
- **Áudios narrados** (quando disponíveis) ou placeholders de silêncio

## Vídeos Entregues (8 módulos)

### Trilha Fundamental (com áudio real do Alencar)

| Módulo | Duração | Tamanho | Cenas | Persona | Áudio |
|--------|---------|---------|-------|---------|-------|
| `mod00_boas_vindas_final.mp4` | 261s (~4:21) | 15 MB | 7 | Alencar | ✅ Real (7 WAVs) |
| `mod01_entendendo_ioaid_final.mp4` | 210s (~3:30) | 14 MB | 5 | Ive | ✅ Real (5 WAVs) |
| `mod02_sistema_sho_final.mp4` | 167s (~2:47) | 11 MB | 4 | Ive | ✅ Real (4 WAVs) |
| `mod03_painel_afiliado_final.mp4` | 167s (~2:47) | 11 MB | 4 | Ive | ✅ Real (4 WAVs) |

### Trilha Agente (placeholders de áudio - aguardando TTS)

| Módulo | Duração | Tamanho | Cenas | Persona | Áudio |
|--------|---------|---------|-------|---------|-------|
| `mod00_primeiro_agente_final.mp4` | 15s | 2.1 MB | 5 | dupla | ⚠️ Placeholder |
| `mod01_skills_essenciais_final.mp4` | 15s | 2.2 MB | 5 | dupla | ⚠️ Placeholder |
| `mod02_disparo_whatsapp_final.mp4` | 12s | 1.7 MB | 4 | dupla | ⚠️ Placeholder |
| `mod03_judge_revisor_final.mp4` | 12s | 1.7 MB | 4 | dupla | ⚠️ Placeholder |

> **Nota sobre Agente:** Os 4 módulos da trilha Agente não possuem gravações de áudio originais no repositório. O servidor de TTS do ambiente estava temporariamente indisponível no momento da geração. Para regenerar com TTS, use o script `scripts_geracao/generate_videos.py` após o servidor de TTS estar online.

## Como Regenerar

```bash
# A partir da raiz do repositório
python3 "Generate Vídeos Nexus V/scripts_geracao/generate_videos.py"
```

O script detecta automaticamente:
- Todos os roteiros em `AcademIA/cursos/{fundamental,agente}/*-roteiro.md`
- Áudios WAV já existentes (`*-cenaN.wav` por módulo)
- Persona indicada no cabeçalho do roteiro (Ive, Alencar, ou dupla)
- Cores e estética cyberpunk (rosa+ciano neon, grid técnico, cantos em L)

## Pipeline Detalhado

1. **Parse do roteiro**: Expressão regular identifica cada cena (## Cena N: Título (duração))
2. **Extração de fala**: Separa discurso por persona (Ive vs Alencar)
3. **Renderização do slide**: 1920x1080 com gradiente, grid, círculos concêntricos, pontos neon
4. **Mapeamento de áudio**: Tenta usar áudio real; se ausente, gera placeholder de 3s
5. **Combinação ffmpeg**: slide (PNG loop) + áudio (WAV) → cena.mp4 (libx264 ultrafast)
6. **Concat final**: Junta todas as cenas via ffmpeg concat demuxer

## Próximos Passos

- [ ] Regenerar trilha Agente com TTS via `synthesize_speech` (voz `female-qn-qingse` para Ive, `male-qn-jingying` para Alencar)
- [ ] Adicionar trilha Master (4 módulos) e Elite (3 módulos)
- [ ] Implementar legendas automáticas (SRT) via Whisper
- [ ] Adicionar transições entre cenas (crossfade 0.5s)
- [ ] Hospedar vídeos em CDN/S3 para streaming

## Estatísticas Totais

- **8 vídeos gerados** (4 com áudio real, 4 com placeholders)
- **36 cenas** processadas (7+5+4+4 na Fundamental, 5+5+4+4 na Agente)
- **123 MB** total de MP4
- **~14 minutos** de conteúdo narrado (somando Fundamental)
