---
title: "WS-06 · Oficina de Automação de Conteúdo"
description: "Pipeline completo de produção de conteúdo com agentes IA + revisão humana"
tags: [workshop, automacao, conteudo, agentes, ia, pipeline]
nivel: Master
duracao: 4h (2 encontros de 2h)
vagas: 30
pre_requisitos: ["WS-01 ou conhecimento equivalente de copy", "acesso a API OpenAI ou Claude"]
autor: Equipo Nexus
date: 2026-07-07
---

# 🛠️ WS-06 · Oficina de Automação de Conteúdo

> Aprenda a montar um pipeline onde **agentes IA produzem 80% do conteúdo e humanos revisam/curvem 20%**, mantendo qualidade editorial e escala 10x.

## 🎯 Objetivos de Aprendizagem

Ao final, você será capaz de:
- ✅ Montar pipeline de conteúdo multi-formato (blog, social, email, vídeo)
- ✅ Configurar agentes especializados (researcher, writer, editor, designer)
- ✅ Implementar revisão humana em checkpoints críticos
- ✅ Medir qualidade vs. produção pura
- ✅ Escalar de 10 → 100+ peças/semana sem perder qualidade

## 📅 Estrutura do Workshop

### **Encontro 1 (2h) — Arquitetura do Pipeline**

**1.1 — Mapa do pipeline moderno (30 min)**
```
[Input: tema + objetivo + canal]
       ↓
[Agente Researcher] → pesquisa, fontes, dados (5 min)
       ↓
[Agente Planner] → outline, estrutura, ângulos (3 min)
       ↓
[Agente Writer] → primeira versão (8 min)
       ↓
[Agente Editor] → revisão técnica, SEO, tom (3 min)
       ↓
[Agente Designer] → visual, thumbnails, carrossel (10 min)
       ↓
[Checkpoints Humanos] (curadoria + ajustes)
       ↓
[Publicação multi-canal]
       ↓
[Análise de performance] → feedback loop → melhoria contínua
```

**1.2 — Configurando os 5 agentes (60 min)**

Hands-on. Cada aluno configura:
- **Researcher Agent** (Claude/Perplexity API) — busca estruturada
- **Planner Agent** (GPT-4) — gera outline com SEO + estrutura persuasiva
- **Writer Agent** (Claude Opus) — texto base seguindo guidelines da marca
- **Editor Agent** (GPT-4) — checklist de 30 pontos (gramática, tom, SEO, conversão)
- **Designer Agent** (Canva/Midjourney API) — visuais e thumbnails

**1.3 — Sistema de revisão humana (30 min)**
- **Checkpoint 1** (pós-researcher): validar fontes e ângulo (5 min/peça)
- **Checkpoint 2** (pós-editor): curadoria de 100% antes de publicar (10 min/peça)
- **Checkpoint 3** (pós-publicação): análise 48h depois (5 min/peça)

**Total tempo humano: ~20 min por peça vs. ~120 min escrevendo do zero = 6x ganho**

---

### **Encontro 2 (2h) — Operação, Métricas e Escala**

**2.1 — Operação semanal (45 min)**

Cronograma real:
- **Seg 9h:** planejar 10 peças (Planner Agent + humano aprova)
- **Seg 14h:** writers produzem 10 peças (paralelo, 30 min)
- **Ter 9h:** editors revisam (paralelo, 15 min/peça)
- **Ter 14h:** designers produzem visuais (paralelo)
- **Qua:** checkpoints humanos + agendamento
- **Qui-Dom:** publicação distribuída + monitoramento
- **Total: 5h humanas para 10 peças finalizadas** (vs. 25h manuais)

**2.2 — Métricas de qualidade vs. produção (30 min)**

| Métrica | Produção manual | Produção IA | Meta balanceada |
|---|---|---|---|
| Tempo/peça | 90-120 min | 20 min | 30 min |
| Custo/peça | R$ 80-200 | R$ 3-8 | R$ 12-25 |
| Save rate | 4-8% | 2-4% | ≥ 4% |
| Share rate | 1-3% | 0.5-1.5% | ≥ 1.5% |
| Conversão | 2-5% | 1-3% | ≥ 3% |

**2.3 — Escalar para 100+ peças/semana (45 min)**
- **Camada 1:** pipeline único (10-30 peças/semana)
- **Camada 2:** multi-formato (1 tema → 5 derivações, 30-100 peças/semana)
- **Camada 3:** multi-idioma + multi-nicho (100-300 peças/semana)
- **Camada 4:** distribuído com times editores (300+ peças/semana)

**Ferramentas:**
- `Lab-Nexus/prompts/estrategia/04-plano-conteudo-90-dias.md` (planejamento)
- `Lab-Nexus/prompts/copywriting/08-copy-headline-anuncio.md`
- `Lab-Nexus/prompts/copywriting/09-script-vsl.md`
- `Lab-Nexus/tools/design/01-template-carrossel.md`
- `Lab-Nexus/templates/social/01-template-carrossel-educativo.html`

---

## 🛠️ Recursos Inclusos

- ✅ Templates de prompts para os 5 agentes
- ✅ Workflows Make/n8n prontos
- ✅ Checklists de qualidade por formato
- ✅ Acesso a comunidade de alunos por 90 dias
- ✅ 2 calls de mentoria em grupo pós-workshop

## 📋 Pré-requisitos

- Conta OpenAI/Anthropic com API key
- Conta Make ou n8n
- Acesso ao Canva Pro ou Midjourney
- 8h disponíveis para implementação pós-workshop

## 🎓 Avaliação

Para receber certificado WS-06:
- [ ] Implementar pipeline mínimo (3 agentes)
- [ ] Produzir 10 peças reais em 7 dias
- [ ] Atingir métricas mínimas (save rate ≥ 3% OU conversão ≥ 2%)
- [ ] Submeter relatório final (template fornecido)

## 💰 Investimento

- **Workshop:** R$ 497 (ou 3x R$ 187)
- **Incluído:** materiais + 90 dias comunidade + 2 calls mentoria
- **Bônus:** acesso vitalício a updates do workshop

---

## 📚 Materiais de Apoio

- `tutoriais/16-criar-skill-customizada.md` (customizar agentes)
- `tutoriais/15-debugar-agente-lento.md` (otimização)
- `playbooks/PB-EMAIL-operacao-diaria.md` (operação email)
- `playbooks/PB-WHATSAPP-operacao-diaria.md` (operação WhatsApp)
- `webinars/WB-2026-04-agentes-autonomos-prod.md` (cases reais)

---

*AcademIA · Treinamento WS-06 · 2026*