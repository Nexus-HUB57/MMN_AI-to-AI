---
title: "CHANGELOG · Academ'IA"
description: "Histórico de versões da Academ'IA · HUB de Conhecimento & Sabedoria"
tags: [changelog, versionamento, historico, academia]
version: 1.2.2
last_updated: 2026-06-26
---

# 📜 CHANGELOG · Academ'IA

> Histórico de versões do HUB Academ'IA — Nexus Affil'IA'te. Segue **Semantic Versioning**: MAJOR (breaking), MINOR (compatível, novo asset), PATCH (correções, polish).

---

## [1.2.2] — 2026-06-26 · "Expansão Pedagógica + Workflows"

### ✨ Adicionado

- 📚 **6 tutoriais novos** (`tutoriais/`):
  - `15-debugar-agente-lento.md` — diagnóstico de latência em 5 passos
  - `16-criar-skill-customizada.md` — skill custom com testes TypeScript
  - `17-integrar-meta-ads.md` — integração Meta Marketing API
  - `18-configurar-backup-automatico.md` — backup 3-2-1
  - `19-ler-metricas-sho.md` — 8 métricas-chave do SHO
  - `20-exportar-relatorio-mensal.md` — relatórios executivos
- 🎮 **2 playbooks novos** (`playbooks/`):
  - `PB-LANCAMENTO-black-friday.md` — playbook completo 11 dias
  - `PB-ONBOARDING-novo-afiliado.md` — onboarding 14 dias com metas
- 🎤 **2 webinars novos** (`webinars/`):
  - `WB-2026-04-agentes-autonomos-prod.md` — cases reais em produção
  - `WB-2026-05-federacao-multi-tenant.md` — solo → enterprise
- 🔄 **2 workflows novos** (`Lab-Nexus/workflows/`):
  - `make/02-workflow-recovery-carrinho.json` — recuperação multi-canal
  - `n8n/03-workflow-onboarding-trial.md` — trial → pago
- 🧠 **3 prompts novos** (`Lab-Nexus/prompts/`):
  - `analise/04-diagnostico-churn-preventivo.md` — diagnóstico de churn
  - `copywriting/03-copy-headline-anuncio.md` — 5 headlines com framework
  - `copywriting/04-script-vsl.md` — VSL 15-25min completo
  - `estrategia/04-plano-conteudo-90-dias.md` — calendário trimestral

### 📊 Métricas

| | v1.2.0 | v1.2.2 |
|---|---|---|
| Tutoriais | 14 | 20 |
| Playbooks | 8 | 10 |
| Webinars | 4 | 6 |
| Workflows | 3 | 5 |
| Prompts | 8 | 11 |
| Tools | 44 | 44 |

---

## [1.2.0] — 2026-06-24 · "Expansão Acadêmica + Auditoria"

### ✨ Adicionado

- 🎬 **2 workshops novos** (`treinamentos/`):
  - `WS-04-oficina-sho-avancado.md` — SHO em modo S2/S3 com guardrails, audit trail, rollback reversível (Nível Master)
  - `WS-05-oficina-federacao-agentes.md` — Federação multi-tenant, mTLS pinned, reputation system, ledger distribuído (Nível Master→Elite)
- 🧪 **4 ferramentas operacionais novas** (`Lab-Nexus/tools/`):
  - `analytics/07-comparador-creators.md` — comparador de até 10 creators em 12 métricas com score composto
  - `automation/08-rate-limiter-pausa-inteligente.md` — rate limiter adaptativo com smart pause por canal
  - `design/06-prompt-visual-carrossel-v2.md` — gerador de briefings para carrossel Instagram/LinkedIn
  - `marketing/10-icp-detector.md` — detector automático de Ideal Customer Profile com 5 dimensões
- 📊 **3 templates novos** (`Lab-Nexus/templates/`):
  - `social/02-template-stories-sequencia.html` — sequência de 7 stories Instagram/TikTok
  - `landing/03-template-otimizado-conversao.html` — landing page AIDA + FAQ + prova social
  - `email/04-template-carrinho-abandonado.html` — email de recuperação com urgência e prova
- 🔄 **Schema de auditoria** (`sync/audit-log-schema.md`) — schema JSONL completo para logs de auditoria MCP com 6 seções (actor, operation, context, decision, outcome, metadata)

### 🩹 Correções

- **Duplicatas removidas** em `tutoriais/`:
  - `12-federa#U00e7#U00e3o-2-nos.md` (encoding quebrado)
  - `13-federa#U00e7#U00e3o-3-nos-mtls-pinned.md` (encoding quebrado)
  - Versões corretas com UTF-8 já existiam: `12-federação-2-nos.md`, `13-federação-3-nos-mtls-pinned.md`
- **INDEX.md atualizado** com contagem real de assets (v1.2.1)
- **Personas Alencar/Ive documentadas** — pasta `AcademIA/personas/alencar/` com imagem oficial, voz, roteiro-aula01 e slides (commit anterior)

### 📊 Métricas

| | v1.1.1 | v1.2.0 |
|---|---|---|
| **Apostilas** | 10 | 10 |
| **Cursos** (total) | 15 | 15 |
| **Ferramentas (Lab-Nexus)** | 40 | 44 |
| **Prompts (Lab-Nexus)** | 8 | 8 |
| **Templates (Lab-Nexus)** | 3 | 6 |
| **Workflows (Lab-Nexus)** | 3 | 3 |
| **Tutoriais** | 14 (+2 duplicatas) | 14 |
| **Playbooks** | 7 | 8 |
| **Webinars** | 3 | 4 |
| **Treinamentos/Workshops** | 6 | 8 |
| **Certificações** | 4 | 5 |
| **Personas** | 2 (parcial) | 2 (completas com roteiro, slides, voz) |
| **Audit schema** | — | 1 (v1.0) |

---

## [1.1.1] — 2026-06-02 · "Integridade de manifestos"

### 🩹 Correções

- **2 skills reclassificadas** de operacional → planned (handlers `.ts` ainda não implementados):
  - `sms-conversacional` → `planned_release: Q3-2026`
  - `plano-conteudo-90d` → `planned_release: Q3-2026`
- **3 skills adicionadas ao manifesto** que já existiam como handlers `.ts` no monorepo mas estavam órfãs:
  - `cold-emailer` (handler `coldEmailer.ts` existe)
  - `webhook-router` (handler `webhookRouter.ts` existe)
  - `backup-encryption` (planned, `Q4-2026` — handler ainda não existe)
- **`types.ts`** adicionado à `operational_skills_audit.handlers` (estava listado em disco mas ausente do audit)
- **Todos os `course_anchor` do manifesto** prefixados com `AcademIA/` (resolve paths relativos ambíguos)
- **`lab_nexus_to_skill_mapping` do agent-bridge** — todos os paths prefixados com `AcademIA/`
- **`trirf_mapping.courses_completed_required` do agent-bridge** — todos os paths prefixados com `AcademIA/`

### 🛠️ Tooling

- **Novo GitHub Action** `checks/skill-manifest-integrity.yml`:
  - Roda em PR e push que tocam manifesto, bridge, cursos, lab ou handlers
  - Valida schema, contadores (`total_skills`/`operational`/`planned`), slugs únicos kebab-case, whitelists (`category`, `level`, `trilha_academia`)
  - Valida paths de skills (`code_path`, `spec_path`, `lab_path`, `course_anchor`)
  - Valida `lab_nexus_to_skill_mapping` (paths existem + slugs batem com manifesto)
  - Valida `trirf_mapping.courses_completed_required` (paths existem)
  - Sanity check do `operational_skills_audit` (handlers declarados vs handlers em disco)
  - Exit code != 0 falha o CI; report legível com erros categorizados
- **Validador Python standalone** `checks/lib/validate_manifest.py` (sem deps externas, Python 3.11+)

### 📊 Métricas

| | v1.1.0 | v1.1.1 |
|---|---|---|
| `manifest_version` | 1.1.0 | 1.1.1 |
| `total_skills` | 16 | 19 |
| `operational` | 15 | 15 |
| `planned` | 1 | 4 |
| `operational_skills_audit.total_handlers` | 27 | 28 |

---

## [1.1.0] — 2026-06-02 · "Consolidação + Onboarding Elite"

### ✨ Adicionado

- 📕 **2 tutoriais novos**:
  - `tutoriais/13-federação-3-nos-mtls-pinned.md` — escalando federação para 3+ nós com mTLS pinned, capacidades e TTL de aprovação (Nível Elite)
  - `tutoriais/14-ler-skill-manifest.md` — como ler e contribuir no `skill-manifest.json` (Nível Agente)

- 🧪 **2 ferramentas novas no Lab-Nexus**:
  - `tools/marketing/09-plano-conteudo-90-dias.md` — planejamento trimestral de conteúdo com funil integrado (Nível Master)
  - `tools/copy/13-disparo-sms-conversacional.md` — templates + prompt para SMS transacional/relacional (Nível Agente)

- 💡 **2 prompts novos** (fechando lacunas do INDEX):
  - `prompts/analise/03-diagnostico-funil-completo.md`
  - `prompts/estrategia/03-posicionamento-competitivo.md`

- 📡 **1 webinar novo** (anúncio + preparação):
  - `webinars/WB-2026-03-academia-open-house.md` — Open House de 2026-06-15 (🟡 agendado)

- 📑 **Novos documentos de governança**:
  - `RESUMO_EXECUTIVO.md` — TL;DR de 1 página (entrada única)
  - `CHANGELOG.md` (este arquivo)

### 🩹 Correções

- `sync/skill-manifest.json`:
  - `code_path` de `white-label-sync` corrigido: `fase7/whiteLabelSync.ts` (inexistente) → `backend/src/domains/whitelabel/index.ts`
  - `code_path` de `federation-gate` corrigido: `fase8/federation/gate.ts` (inexistente) → `AcademIA/Lib-Nexus/agents-specs/03-federation-gate.md` (com flag `spec_only: true`)
  - Adicionada seção `operational_skills_audit` com 27 paths validados no monorepo
  - Adicionadas 2 skills novas: `plano-conteudo-90d` e `sms-conversacional`

- `sync/agent-bridge.json`:
  - Adicionados 2 mapeamentos novos em `lab_nexus_to_skill_mapping` (plano-conteudo-90d + sms-conversacional)
  - Bump de `academia_version` para `1.1.0`

### 🔄 Modificado

- `tutoriais/README.md` — catálogo agora lista 14 tutoriais (era 12)
- `INDEX.md` — contagens atualizadas (40 tools, 8 prompts, 3 webinars) e links para os 2 tutoriais novos
- `Lab-Nexus/README.md` — contagem de assets ajustada (50 → 54) e menção aos novos arquivos

---

## [1.0.0] — 2026-06-02 · "Lançamento oficial do HUB"

### 🎉 Release inicial

- 🎓 **3 camadas estruturadas**:
  - **Cursos** — 4 trilhas (Fundamental, Agente, Master, Elite) com 15 cursos curados
  - **Lab-Nexus** — 38 ferramentas categorizadas + 6 prompts + 3 templates HTML + 3 workflows JSON
  - **Lib-Nexus** — 15 documentos canônicos (glossário, IOAID, specs de agentes, API docs, best practices)

- 📕 **Pastas auxiliares**:
  - `treinamentos/` — 3 workshops práticos
  - `webinars/` — 2 webinars realizados + calendário 2026
  - `certificacoes/` — 3 certificações progressivas (CON, CEN, CEN+) + modelo de avaliação
  - `playbooks/` — 7 playbooks de operação (rotina, lançamento, crise, LGPD)
  - `tutoriais/` — 12 tutoriais how-to rápidos

- 🔄 **Sistema de sync entre Academ'IA e Runtime**:
  - `sync/agent-bridge.json` — mapeamento trilhas → skills → SHO (4 níveis)
  - `sync/skill-manifest.json` — catálogo de 14 skills com linkage à trilha
  - `sync/MCP-CONFIG.md` — 4 servidores MCP configurados

- 🛡️ **Governança**:
  - LGPD-safe em todos os exemplos
  - Code-first (exemplos > prosa)
  - Cross-linked com tags transversais
  - Obsidian-ready (frontmatter YAML)

- 📐 **Padrão de qualidade** (Lab-Quality-Standard) para tools, prompts, templates, workflows

---

## 🎯 Próximas versões (roadmap público)

### [1.2.0] — Previsto Q3-2026

- 🎬 Adicionar 2 workshops novos: `WS-04` Operação SHO Avançado, `WS-05` Federação de Agentes (hands-on)
- 🧪 Adicionar 4 ferramentas operacionais no Lab:
  - `tools/analytics/07-comparador-creators.md`
  - `tools/automation/08-rate-limiter-pausa-inteligente.md`
  - `tools/design/06-prompt-visual-carrossel-v2.md`
  - `tools/marketing/10-icp-detector.md`
- 📊 Adicionar 3 templates: `templates/social/02-template-stories-sequencia.html`, `templates/landing/03-template-otimizado-conversao.html`, `templates/email/04-template-carrinho-abandonado.html`
- 🔄 Adicionar `sync/audit-log-schema.md` — schema do log de auditoria MCP

### [2.0.0] — Previsto Q4-2026

- 💎 Migração do conteúdo Elite para formato interativo (com simuladores embedded)
- 🌐 i18n: versão em inglês (EN-US) das 4 trilhas de curso
- 🧠 Skill auto-tuning integrado ao Academ'IA (prompts do Lab-Nexus alimentam o Judge)
- 📦 Empacotamento do Academ'IA como MCP server oficial instalável via `npx`

---

## 📊 Métricas de Crescimento

| Versão | Data | Cursos | Tools | Prompts | Templates | Workflows | Tutoriais | Playbooks |
|---|---|---|---|---|---|---|---|---|
| 1.0.0 | 2026-06-02 | 15 | 38 | 6 | 3 | 3 | 12 | 7 |
| **1.1.0** | **2026-06-02** | **15** | **40** | **8** | **3** | **3** | **14** | **7** |
| 1.2.0 (meta) | Q3-2026 | 15 | 44 | 8 | 6 | 4 | 16 | 8 |
| 2.0.0 (meta) | Q4-2026 | 15 + EN | 50+ | 12+ | 8+ | 6+ | 20+ | 10+ |

---

## 🤝 Como Contribuir

1. Abra PR descrevendo a mudança
2. Revisão por 1 mantenedor da área
3. (Para Lib-Nexus) Revisão por 2 contribuidores Elite
4. Merge + bump de versão automático

Toda contribuição precisa seguir o **Lab-Quality-Standard** (spec + playbook + asset + métricas + riscos).

---

**Mantido por:** Equipe Nexus Affil'IA'te
**Contato:** equipenexus@oneverso.com.br
**Repositório:** https://github.com/Nexus-HUB57/MMN_AI-to-AI
