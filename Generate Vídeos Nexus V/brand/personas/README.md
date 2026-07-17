# 🎭 Personas Nexus — Catálogo de Assets

**Generate Vídeos Nexus V · Nexus Affil'IA'te · 2026**

Catálogo consolidado de todas as personas usadas na produção de vídeo-aulas, com assets de imagem, áudio, roteiros e diretrizes.

---

## 📁 Estrutura

```
brand/personas/
├── ive/                              # Persona Sra. Nexus Ive
│   ├── ive_nexus_1.png               # Imagem de referência
│   ├── ive_nexus_2.png
│   ├── ive_nexus_3.png
│   ├── ive_nexus_ref_1.png
│   ├── ive_training_room.png
│   └── ive_training_v1.png           # Imagem principal
├── alencar/                          # Persona Sir. Nexus Alencar
│   ├── alencar_meeting_v1.png        # Imagem principal
│   ├── alencar_nexus_ref_1.png
│   ├── nexus_alencar_1.png
│   ├── nexus_alencar_2.png
│   ├── nexus_alencar_3.png
│   ├── voz_sir_nexus_alencar.wav     # Áudio de referência (TTS clone)
│   ├── roteiro-aula01.md             # Roteiro: Entendendo o IOAID
│   └── slides-aula01.md              # Slides de apoio
├── celebration_ive_alencar.png       # Imagem comemorativa da dupla
├── diretrizes_voz_sra_nexus_ive.md   # Diretrizes de voz da Ive
├── diretrizes_voz_sir_nexus_alencar.md # Diretrizes de voz do Alencar
└── diretrizes_interacao_ive_alencar.md  # Co-atuação da dupla
```

---

## 🎭 Personas

### Sra. Nexus Ive
**Identidade:** Figura matriarcal, estratégica, acolhedora e autoritária. Co-representante da marca.

**Papel:** Mediadora, voz da ponderação, visão estratégica, acolhimento da audiência.

**Perfil vocal:** Serena, articulada, tranquilizadora. Sotaque sulista leve. Toque sensual nos finais de frase.

**Imagens:** 6 referências visuais disponíveis
**Áudio:** `voz_sra_nexus_ive.wav` (em `AcademIA/personas/`)
**Diretrizes:** `diretrizes_voz_sra_nexus_ive.md`
**Roteiros disponíveis:**
- `00-boas-vindas` (versão Ive) — `AcademIA/producao/roteiros/00-boas-vindas-ive.md`

**Atuação por nível:**
- **Fundamental:** Acolhedora, paciente, "pega pela mão"
- **Agente:** Instrutiva, prática
- **Master:** Estratégica, analítica
- **Elite:** Parceria de alto nível

### Sir. Nexus Alencar
**Identidade:** Figura técnica, prática e profunda. Co-representante da marca.

**Papel:** Instrutor técnico, demos, troubleshooting, análise de dados.

**Perfil vocal:** Serena, acolhedora, autoritária. Sotaque neutro, dicção precisa.

**Imagens:** 5 referências visuais disponíveis
**Áudio:** `voz_sir_nexus_alencar.wav` (referência para TTS clone)
**Diretrizes:** `diretrizes_voz_sir_nexus_alencar.md`
**Roteiros disponíveis:**
- `01-entendendo-ioaid` (versão Alencar) — `roteiro-aula01.md` + `slides-aula01.md`

**Atuação por nível:**
- **Fundamental:** Didático, paciente, evita jargão
- **Agente:** Hands-on, antecipa erros
- **Master:** Analítico, estratégico
- **Elite:** Especialista, papers acadêmicos

### Dupla Ive + Alencar
**Identidade:** Co-apresentação harmônica com cumplicidade implícita.

**Papel:** Complementaridade estratégica + técnica.

**Diretrizes:** `diretrizes_interacao_ive_alencar.md`

**Frases de reforço mútuo:**
- "Como bem colocou a Sra. Ive..."
- "E como o Sir. Alencar demonstrou..."
- "Excelente observação, Sra. Ive."

---

## 📊 Status por Persona

| Persona | Imagens | Áudio TTS | Diretrizes | Roteiros |
|---------|---------|-----------|------------|----------|
| **Sra. Nexus Ive** | 6 ✅ | 1 (32.7s) ✅ | ✅ | 1 (00-boas-vindas) |
| **Sir. Nexus Alencar** | 5 ✅ | 1 ✅ | ✅ | 1 (01-IOAID) |
| **Dupla** | 1 ✅ | 1 (69.9s) ✅ | ✅ | A gerar |

---

## 🎯 Cobertura de Roteiros por Nível

| Nível | Ive | Alencar | Dupla |
|-------|-----|---------|-------|
| **Fundamental** | 00-boas-vindas ✅ | 01-IOAID ✅ | A gerar |
| **Agente** | A gerar | A gerar | A gerar |
| **Master** | A gerar | A gerar | A gerar |
| **Elite** | A gerar | A gerar | A gerar |

---

## 🔗 Integração com AcademIA/producao/

As fichas técnicas oficiais ficam em `AcademIA/producao/personas/`:
- `AcademIA/producao/personas/sra_nexus_ive.md` (ficha completa)
- `AcademIA/producao/personas/sir_nexus_alencar.md` (ficha completa)

Os templates de roteiro (Ive, Alencar, Dupla) ficam em:
- `AcademIA/producao/templates/TEMPLATE_ROTEIRO_*.md`

---

## 📋 Próximas Ações

### Curto prazo
- [ ] Renderizar primeiro vídeo piloto (Ive 00-boas-vindas ou Alencar IOAID)
- [ ] Gerar roteiros Dupla para módulos Master/Elite
- [ ] Adicionar mais 4-5 roteiros por persona

### Médio prazo
- [ ] Gerar trilha sonora cyberpunk padronizada
- [ ] Criar vinhetas de intro/outro
- [ ] Padronizar cenários (3 templates)

---

**Última atualização:** 2026-06-22 · v1.0
