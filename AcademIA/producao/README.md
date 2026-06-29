# 🎬 AcademIA — Estrutura de Produção Profissional de Vídeos

**Nexus Affil'IA'te · MMN_IA · 2026**

Sistema integrado de produção de vídeo-aulas com personas IA (Sra. Nexus Ive e Sir. Nexus Alencar), cobrindo todo o pipeline: roteiro → voz → vídeo → pós-produção → publicação.

---

## 📁 Estrutura

```
AcademIA/producao/
├── pipeline/          # Documentação do fluxo de produção
├── templates/         # Templates profissionais de roteiros
├── personas/          # Fichas técnicas e diretrizes de voz
├── assets/            # Avatares, fundos, vinhetas, transições
├── roteiros/          # Roteiros gerados (banco canônico)
├── catalog/           # Catálogo de cursos/módulos e status
└── quality/           # Checklists e padrões de qualidade
```

---

## 🎯 Personas

| Persona | Papel | Estilo | Status |
|---------|-------|--------|--------|
| **Sra. Nexus Ive** | Matriarca, estrategista, acolhedora | Sotaque sulista, serenidade, autoridade | ✅ Áudio + imagem + docs |
| **Sir. Nexus Alencar** | Técnico, prático, profundo | Didático, claro, preciso | 🔄 Em desenvolvimento (a enviar) |
| **Dupla Ive+Alencar** | Co-apresentação harmônica | Complementaridade, cumplicidade | 📋 Diretrizes prontas |

---

## 📚 Catálogo de Cursos

### 4 Níveis Oficiais (16 módulos totais)

**🟢 Fundamental (4 módulos)** — Introdução ao Nexus
- 00 · Boas-vindas ao Nexus ✅ Áudio + roteiro
- 01 · Entendendo o IOAID 📋 Só roteiro
- 02 · Sistema SHO 📋 Só roteiro
- 03 · Painel do Afiliado 📋 Só roteiro

**🟡 Agente (4 módulos)** — Desenvolvimento de agentes
- 00 · Seu primeiro agente 📋 Só roteiro
- 01 · Skills Essenciais 📋 Só roteiro
- 02 · Disparo WhatsApp 📋 Só roteiro
- 03 · Judge Revisor 📋 Só roteiro

**🟠 Master (3 módulos)** — Otimização avançada
- 00 · Otimização de Conversão 📋 Só roteiro
- 01 · Funis e Lifecycle 📋 Só roteiro
- 02 · A/B Testing com Judge 📋 Só roteiro
- 03 · Análise de Coortes e Churn 📋 Só roteiro

**🔴 Elite (3 módulos)** — Implementações corporativas
- 00 · Blueprints Elite 📋 Só roteiro
- 01 · Multi-tenant e White-label 📋 Só roteiro
- 02 · Federação de Agentes 📋 Só roteiro

**Status:** 1 módulo com produção completa (áudio + roteiro + vídeo) · 15 módulos com roteiro pronto (pendente gravação)

---

## 🔄 Pipeline de Produção

```
[1. ROTEIRO] → [2. REVISÃO] → [3. VOZ] → [4. VÍDEO] → [5. PÓS] → [6. PUBLICAÇÃO]
```

**Detalhes completos em:** [`pipeline/PIPELINE_PRODUCAO.md`](pipeline/PIPELINE_PRODUCAO.md)

### 1. Roteiro
- Persona definida (Ive / Alencar / Dupla)
- Template profissional (estrutura de cenas)
- Validação automática (duração, palavras, formato)

### 2. Revisão
- Checklist de qualidade técnica
- Aprovação de persona (Sra. Ive ou Sir. Alencar)
- Ajuste de tom e vocabulário

### 3. Voz
- Geração com TTS clonado (voz_sra_nexus_ive.wav)
- Áudios por cena (24kHz mono PCM)
- Validação de naturalidade e ritmo

### 4. Vídeo
- Image-to-video com avatar da persona
- Cenário corporativo de fundo
- Transições cinematográficas

### 5. Pós-produção
- Mixagem de áudio
- Color grading
- Vinhetas e lower thirds
- Export multi-formato (1080p, 720p, vertical)

### 6. Publicação
- Versionamento por módulo
- Indexação no catálogo
- Distribuição em AcademIA + cursos

---

## 🎨 Identidade Visual

**Paleta cyberpunk de alto impacto:**
- Rosa neon: `#FF00FF`
- Ciano elétrico: `#00FFFF`
- Preto profundo: `#0A0E27`
- Branco puro: `#FFFFFF`

**Tipografia:**
- Sans-serif geométrica bold
- Efeito de brilho neon (text-shadow)
- Elementos HUD (linhas técnicas, colchetes de canto)

---

## 📊 Métricas de Produção

| Métrica | Meta | Atual |
|---------|------|-------|
| Módulos com áudio completo | 16/16 | 1/16 (6%) |
| Módulos com vídeo final | 16/16 | 0/16 (0%) |
| Roteiros revisados | 16/16 | 16/16 (100%) |
| Tempo médio de produção | 2h/módulo | TBD |
| Custo por minuto de vídeo | <R$ 50 | TBD |

---

## 🔗 Integrações

- **LLM** (Manus API): geração de roteiros via `server/llmService.ts`
- **Image Generation** (Manus API): thumbnails e fundos
- **Voice Clone** (referência): `AcademIA/personas/voz_sra_nexus_ive.wav`
- **Image-to-Video** (MiniMax): avatares em movimento
- **Plataforma Web** (`Generate Vídeos Nexus V/`): interface de criação

---

## 📂 Como Navegar

1. **Novo na produção?** Comece por [`pipeline/PIPELINE_PRODUCAO.md`](pipeline/PIPELINE_PRODUCAO.md)
2. **Produzindo roteiro?** Use [`templates/TEMPLATE_ROTEIRO_IVE.md`](templates/TEMPLATE_ROTEIRO_IVE.md)
3. **Validando qualidade?** Siga [`quality/CHECKLIST_QUALIDADE.md`](quality/CHECKLIST_QUALIDADE.md)
4. **Conferindo status?** Veja [`catalog/CATALOGO_MODULOS.md`](catalog/CATALOGO_MODULOS.md)

---

**Desenvolvido com IA para a AcademIA Nexus** 🚀
