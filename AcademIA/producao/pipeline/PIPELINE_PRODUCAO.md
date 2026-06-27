---
title: "🔄 Pipeline de Produção Profissional de Vídeos"
description: "Material oficial Academ'IA · academia"
tags: [academia, academia]
version: 1.0.0
last_updated: 2026-06-27
status: official
---

# 🔄 Pipeline de Produção Profissional de Vídeos

**AcademIA · Nexus Affil'IA'te · 2026**

Fluxo completo de produção de vídeo-aulas, do conceito à publicação, com personas IA (Ive, Alencar, Dupla).

---

## 📋 Visão Geral

```
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│ 1.ROTEIRO│ → │2.REVISÃO │ → │  3. VOZ  │ → │ 4. VÍDEO │ → │ 5. PÓS   │ → │6.PUBLIC. │
└──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘
   30min         15min          20min          40min         30min         10min
```

**Tempo total estimado:** ~2h30 por módulo (6-10 min de vídeo final)

---

## 1️⃣ ROTEIRO (30 min)

**Responsável:** Autor/Content Designer + LLM (Manus)

### Entradas
- Módulo definido (ex: `00-boas-vindas`)
- Persona (Ive, Alencar, Dupla)
- Nível (Fundamental, Agente, Master, Elite)
- Diretrizes da persona (de `producao/personas/`)

### Processo
1. Selecionar template apropriado em `templates/`
2. Preencher com conteúdo do módulo
3. Validar estrutura: 5-10 cenas, 6-10 min total
4. Adicionar marcações de visual (cenário, slides, transições)
5. Rodar checklist de validação automática

### Saídas
- Arquivo `academia/cursos/{nivel}/{modulo}-roteiro.md`
- Arquivo `academia/cursos/{nivel}/{modulo}-slides.md` (se aplicável)

### Validação
- ✅ Mínimo 5 cenas, máximo 10
- ✅ Duração estimada: 6-10 minutos
- ✅ Cada cena tem **Visual** + **Persona: fala**
- ✅ Vocabulário alinhado com persona
- ✅ CTA (call to action) no final

---

## 2️⃣ REVISÃO (15 min)

**Responsável:** Editor + Lead AcadémIA

### Processo
1. Leitura técnica: estrutura, fluxo, clareza
2. Leitura de persona: tom, vocabulário, sotaque
3. Leitura didática: conceito → exemplo → aplicação
4. Verificação de conformidade LGPD e boas práticas
5. Marcação de ajustes (inline comments)

### Saídas
- Roteiro aprovado (status: ✅)
- Ajustes documentados (se houver)

### Critérios de Aprovação
- ✅ Conceitos corretos e atualizados
- ✅ Linguagem acessível ao nível do curso
- ✅ Tom consistente com persona
- ✅ Sem promessas irreais
- ✅ CTA claro e acionável

---

## 3️⃣ VOZ (20 min)

**Responsável:** TTS (Text-to-Speech) Clonado

### Entradas
- Roteiro aprovado
- Áudio de referência da persona:
  - **Ive**: `AcademIA/personas/voz_sra_nexus_ive.wav` (32.7s)
  - **Alencar**: a definir (quando enviado)
  - **Dupla**: `AcademIA/personas/dialogo_ive_alencar.wav` (69.9s)

### Processo
1. Quebrar roteiro em **cenas individuais** (1 WAV por cena)
2. Gerar áudio via TTS clonado (MiniMax ou similar)
3. Validar qualidade: naturalidade, ritmo, pronúncia
4. Ajustar pausas, entonação, velocidade
5. Salvar em `academia/cursos/{nivel}/{modulo}-cena{N}.wav`

### Especificações Técnicas
- **Formato:** WAV PCM 16-bit
- **Sample rate:** 24 kHz (mono)
- **Duração alvo por cena:** 30-90 segundos
- **Ruído de fundo:** < -50 dB

### Saídas
- 5-10 arquivos `.wav` por módulo (1 por cena)
- Total: ~16 MB por módulo (média)

---

## 4️⃣ VÍDEO (40 min)

**Responsável:** Image-to-Video AI

### Entradas
- Imagem de referência da persona:
  - **Ive**: `AcademIA/personas/sra_nexus_ive.png`
  - **Alencar**: a definir
- Áudios das cenas (WAV)
- Slides/Materiais de apoio (PNG/JPG)

### Processo
1. **Setup de avatar:** usar imagem de referência como first frame
2. **Image-to-video por cena:** gerar movimento sutil (30-90s)
3. **Composição:** avatar + cenário corporativo + slides
4. **Transições:** fade suave entre cenas (0.5s)
5. **Renderização:** MP4 1080p (1920x1080), 30fps, H.264

### Especificações Técnicas
- **Resolução:** 1920x1080 (horizontal) ou 1080x1920 (vertical)
- **Codec:** H.264
- **Bitrate:** 8-12 Mbps
- **FPS:** 30
- **Duração:** 6-10 minutos

### Cenários Recomendados
- Escritório moderno com logo Nexus discreto
- Fundo gradiente cyberpunk (preto + neon)
- Softbox lighting simulado

### Saídas
- `academia/cursos/{nivel}/{modulo}-video.mp4` (versão horizontal)
- `academia/cursos/{nivel}/{modulo}-video-vertical.mp4` (opcional)

---

## 5️⃣ PÓS-PRODUÇÃO (30 min)

**Responsável:** Editor de Vídeo

### Processo
1. **Mixagem de áudio:** equalização, compressão, normalização (-14 LUFS)
2. **Color grading:** correção de cor, vinheta sutil
3. **Vinhetas:** intro (3s) + outro (3s) com branding Nexus
4. **Lower thirds:** nome da persona + cargo (aparece 5s no início)
5. **Slides:** sincronizar com narração (cue points)
6. **Trilha sonora:** música ambiente sutil (volume -20 dB)
7. **Export:** MP4 H.264 + WebM (fallback)

### Ferramentas
- DaVinci Resolve (gratuito)
- FFmpeg (CLI para automação)
- Audacity (áudio)

### Saídas
- `academia/cursos/{nivel}/{modulo}-final.mp4` (1080p, master)
- `academia/cursos/{nivel}/{modulo}-final-720p.mp4` (mobile)

---

## 6️⃣ PUBLICAÇÃO (10 min)

**Responsável:** DevOps / AcademIA Manager

### Processo
1. Upload para storage S3 / CDN
2. Versionamento por módulo: `v1.0`, `v1.1`, etc.
3. Geração de thumbnails (3 variações)
4. Indexação no `catalog/CATALOGO_MODULOS.md`
5. Atualização do `courseData.ts` na plataforma web
6. Notificação à audiência (newsletter / Slack)

### Saídas
- Vídeo publicado em CDN com URL pública
- Thumbnail em 3 formatos (16:9, 1:1, 9:16)
- Entrada no catálogo de cursos
- Atualização em `Generate Vídeos Nexus V/server/courseData.ts`

---

## 🎯 Métricas de Qualidade

### Por Módulo
- **Duração:** 6-10 min
- **Resolução:** ≥ 1080p
- **Áudio:** -14 LUFS, < -50 dB ruído
- **Bitrate:** ≥ 8 Mbps
- **Cenas:** 5-10

### Por Persona
- **Ive:** tom sereno, sotaque sulista leve, "guria" ocasional
- **Alencar:** tom didático, claro, "olha só", "compreenda"
- **Dupla:** complementaridade, "como Ive bem colocou", "Alencar acrescenta"

### Por Nível
- **Fundamental:** tom acolhedor, paciente, didático
- **Agente:** tom instrutivo, prático, foco em execução
- **Master:** tom estratégico, analítico, desafiador
- **Elite:** tom de parceria, alto nível, "de igual para igual"

---

## 🚀 Automação (Roadmap)

### Curto prazo (Q3 2026)
- [ ] Script Python para gerar roteiros via LLM
- [ ] Script para quebrar roteiros em cenas
- [ ] Batch TTS com MiniMax
- [ ] Renderização automatizada com FFmpeg

### Médio prazo (Q4 2026)
- [ ] Pipeline end-to-end em CI/CD
- [ ] Versionamento automático de vídeos
- [ ] A/B testing de thumbnails
- [ ] Analytics de retenção por cena

### Longo prazo (2027+)
- [ ] Avatar neural em tempo real
- [ ] Lip-sync automático com TTS
- [ ] Tradução multi-idioma automática
- [ ] Personalização de trilha sonora por módulo

---

## 📞 Contatos e Suporte

- **Coordenação AcademIA:** @coordenador-academ-ia
- **Suporte técnico:** plataforma OneVerso → ticket
- **Documentação adicional:** `Generate Vídeos Nexus V/README.md`

---

**Última atualização:** 2026-06-16 · v1.0
