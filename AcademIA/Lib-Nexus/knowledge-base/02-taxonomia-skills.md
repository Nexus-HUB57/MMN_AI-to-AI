---
title: "Taxonomia de Skills · Catálogo Unificado"
description: "Catálogo canônico das 45 skills do marketplace Nexus, com taxonomia por categoria e nível"
tags: [lib-nexus, knowledge-base, skills, taxonomia, canonico]
category: knowledge-base
version: "1.0"
last_review: "2026-06-02"
status: canonico
---

# 🧬 Taxonomia de Skills · Catálogo Unificado

> **Catálogo canônico** das 45 skills do marketplace Nexus. 27 operacionais + 18 planejadas. Usado pelo runtime para validar permissões e pelo marketplace para exibição.

---

## 🎯 O que é uma Skill

Uma **skill** é uma **função atômica** que um agente executa. Cada skill tem:

- **slug** único (kebab-case)
- **nome** amigável
- **categoria** (copy, marketing, analytics, automation, design, quality, federation)
- **nível** (basic, intermediary, advanced, elite)
- **preço** (BRL, em créditos Nexus)
- **trilha da Academ'IA** que ensina a usar
- **status** (operational | planned)
- **código path** no monorepo

---

## 📊 Visão Geral

| Categoria | Operacional | Planejada | Total |
|---|---|---|---|
| `copy` | 5 | 2 | 7 |
| `marketing` | 4 | 1 | 5 |
| `analytics` | 5 | 1 | 6 |
| `automation` | 3 | 2 | 5 |
| `design` | 2 | 2 | 4 |
| `quality` | 3 | 1 | 4 |
| `federation` | 2 | 1 | 3 |
| `pricing` | 1 | 1 | 2 |
| `lifecycle` | 1 | 1 | 2 |
| `research` | 1 | 1 | 2 |
| `data` | 0 | 2 | 2 |
| `other` | 0 | 3 | 3 |
| **TOTAL** | **27** | **18** | **45** |

---

## 🟢 Skills Operacionais (27)

### 📣 Copy (5)

#### `copywriter-persuasivo`
- **Categoria**: copy
- **Nível**: basic
- **Preço**: 24 créditos
- **Trilha**: fundamental
- **Descrição**: Gera copy persuasiva (headlines, e-mails, VSL, anúncios)
- **Inputs**: produto, público, promessa, objeção, tom, canal
- **Outputs**: variantes de copy + score Judge
- **Code path**: `backend/src/agentic/skills/copywriterPersuasivo.ts`
- **Tags**: `#copy` `#copywriter` `#fundamentos`

#### `cold-emailer`
- **Categoria**: copy
- **Nível**: intermediary
- **Preço**: 36 créditos
- **Trilha**: agente
- **Descrição**: Gera sequências de e-mail frio B2B
- **Inputs**: lead, segmento, oferta, tom
- **Outputs**: 3 e-mails (abordagem, follow-up, quebra objeção)

#### `vsl-script-writer`
- **Categoria**: copy
- **Nível**: advanced
- **Preço**: 72 créditos
- **Trilha**: master
- **Descrição**: Escreve roteiros completos de VSL (15-30 min)
- **Inputs**: produto, mecanismo, provas, preço
- **Outputs**: roteiro 4 atos + indicações de ritmo

#### `landing-page-writer`
- **Categoria**: copy
- **Nível**: advanced
- **Preço**: 60 créditos
- **Trilha**: master
- **Descrição**: Escreve copy completa de landing page (8 seções)
- **Inputs**: produto, persona, mecanismo, prova
- **Outputs**: copy LP + microcopy + FAQ

#### `ad-copy-generator`
- **Categoria**: copy
- **Nível**: intermediary
- **Preço**: 36 créditos
- **Trilha**: agente
- **Descrição**: Gera copy para Meta Ads / Google Ads (3 formatos)
- **Inputs**: produto, público, canal, formato
- **Outputs**: primary text, headline, description, CTA

### 📊 Marketing (4)

#### `audience-segmenter`
- **Categoria**: marketing
- **Nível**: intermediary
- **Preço**: 48 créditos
- **Trilha**: agente
- **Descrição**: Segmenta leads por critérios demográficos, comportamentais e RFM
- **Inputs**: base de leads, critério, meta
- **Outputs**: segmentos + query SQL + tamanho estimado
- **Tags**: `#segmentacao` `#rfm` `#leads`

#### `funnel-architect`
- **Categoria**: marketing
- **Nível**: advanced
- **Preço**: 84 créditos
- **Trilha**: master
- **Descrição**: Desenha funis completos (topo, meio, fundo + retenção)
- **Inputs**: produto, persona, orçamento, meta
- **Outputs**: arquitetura de funil + unit economics

#### `persona-builder`
- **Categoria**: marketing
- **Nível**: basic
- **Preço**: 30 créditos
- **Trilha**: fundamental
- **Descrição**: Cria buyer persona completa (8 seções)
- **Inputs**: dados de clientes, entrevistas, CRM
- **Outputs**: persona canônica

#### `editorial-planner`
- **Categoria**: marketing
- **Nível**: basic
- **Preço**: 24 créditos
- **Trilha**: fundamental
- **Descrição**: Cria calendário editorial mensal (4 pilares)
- **Inputs**: persona, objetivos, mês
- **Outputs**: pauta 16-20 posts

### 📈 Analytics (5)

#### `analytics-reporter`
- **Categoria**: analytics
- **Nível**: basic
- **Preço**: 18 créditos
- **Trilha**: fundamental
- **Descrição**: Gera relatórios de KPIs (15 essenciais)
- **Inputs**: dados do banco, período
- **Outputs**: dashboard + insights + alertas
- **Tags**: `#analytics` `#kpi` `#dashboards`

#### `roi-attributor`
- **Categoria**: analytics
- **Nível**: advanced
- **Preço**: 60 créditos
- **Trilha**: master
- **Descrição**: Atribui receita por canal (5 modelos de atribuição)
- **Inputs**: dados de touchpoints, modelo escolhido
- **Outputs**: receita por canal + confiança estatística

#### `cohort-analyzer`
- **Categoria**: analytics
- **Nível**: advanced
- **Preço**: 72 créditos
- **Trilha**: master
- **Descrição**: Analisa coortes (retenção, churn, LTV)
- **Inputs**: tabela de coorte, objetivo
- **Outputs**: padrões + ações priorizadas (ICE)

#### `ab-test-designer`
- **Categoria**: analytics
- **Nível**: intermediary
- **Preço**: 36 créditos
- **Trilha**: agente
- **Descrição**: Desenha experimentos A/B estatisticamente válidos
- **Inputs**: hipótese, baseline, MDE
- **Outputs**: setup do teste + calculadora de duração

#### `funnel-analyzer`
- **Categoria**: analytics
- **Nível**: intermediary
- **Preço**: 48 créditos
- **Trilha**: agente
- **Descrição**: Analisa funil multi-estágio e identifica gargalos
- **Inputs**: dados de funil, meta por estágio
- **Outputs**: diagnóstico + ações ICE

### 🤖 Automation (3)

#### `webhook-router`
- **Categoria**: automation
- **Nível**: intermediary
- **Preço**: 36 créditos
- **Trilha**: agente
- **Descrição**: Roteia webhooks (Hotmart, Kiwify, Stripe, Eduzz, Shopee)
- **Inputs**: payload, validação HMAC
- **Outputs**: evento processado + fila
- **Tags**: `#webhook` `#integracao` `#gateway`

#### `lifecycle-orchestrator`
- **Categoria**: automation
- **Nível**: advanced
- **Preço**: 72 créditos
- **Trilha**: master
- **Descrição**: Orquestra sequências lifecycle (5-14 dias)
- **Inputs**: evento gatilho, segmento
- **Outputs**: emails + delays + condições de saída

#### `auto-publisher`
- **Categoria**: automation
- **Nível**: intermediary
- **Preço**: 36 créditos
- **Trilha**: agente
- **Descrição**: Publica conteúdo em redes (Instagram, LinkedIn, Twitter)
- **Inputs**: conteúdo, plataforma, horário
- **Outputs**: post agendado + URL

### 🎨 Design (2)

#### `briefing-generator`
- **Categoria**: design
- **Nível**: basic
- **Preço**: 18 créditos
- **Trilha**: fundamental
- **Descrição**: Gera briefing criativo estruturado (10 seções)
- **Inputs**: objetivo, persona, formato
- **Outputs**: briefing completo para designer

#### `thumbnail-prompt-builder`
- **Categoria**: design
- **Nível**: basic
- **Preço**: 24 créditos
- **Trilha**: fundamental
- **Descrição**: Gera prompt para IA de imagem (Midjourney, DALL-E)
- **Inputs**: tema, emoção, plataforma
- **Outputs**: prompt estruturado

### ✅ Quality (3)

#### `judge-revisor`
- **Categoria**: quality
- **Nível**: intermediary
- **Preço**: 36 créditos
- **Trilha**: agente
- **Descrição**: Avalia qualidade de outputs (copy, análise, decisão)
- **Inputs**: output a avaliar, critérios
- **Outputs**: score 0-1 + justificativa + sugestões
- **Tags**: `#quality` `#judge` `#avaliacao`

#### `compliance-auditor`
- **Categoria**: quality
- **Nível**: intermediary
- **Preço**: 36 créditos
- **Trilha**: agente
- **Descrição**: Audita conformidade (LGPD, CONAR, ética)
- **Inputs**: copy, configuração, fluxo
- **Outputs**: lista de violações + correções

#### `prompt-tuner`
- **Categoria**: quality
- **Nível**: advanced
- **Preço**: 60 créditos
- **Trilha**: master
- **Descrição**: Otimiza prompts com base em feedback do Judge
- **Inputs**: prompt atual, scores, exemplos bons/ruins
- **Outputs**: prompt refinado + justificativa

### 🌐 Federation (2)

#### `federation-gate`
- **Categoria**: federation
- **Nível**: advanced
- **Preço**: 84 créditos
- **Trilha**: elite
- **Descrição**: Gerencia PII Gate (multi-tenant, zero-trust)
- **Inputs**: payload, origem, destino
- **Outputs**: payload filtrado + audit log
- **Tags**: `#federacao` `#pii` `#multi-tenant`

#### `tenant-manager`
- **Categoria**: federation
- **Nível**: advanced
- **Preço**: 60 créditos
- **Trilha**: elite
- **Descrição**: Provisiona e gerencia tenants (white-label)
- **Inputs**: dados do tenant, plano
- **Outputs**: tenant criado + config + chaves

### 💰 Pricing (1)

#### `pricing-optimizer`
- **Categoria**: pricing
- **Nível**: advanced
- **Preço**: 72 créditos
- **Trilha**: master
- **Descrição**: Otimiza preço com base em valor, concorrência e elasticidade
- **Inputs**: produto, custos, mercado
- **Outputs**: preço recomendado + 3 testes A/B

### 🔄 Lifecycle (1)

#### `follow-up-strategist`
- **Categoria**: lifecycle
- **Nível**: intermediary
- **Preço**: 48 créditos
- **Trilha**: agente
- **Descrição**: Cria estratégias de follow-up (carrinho, inativo, pós-venda)
- **Inputs**: estado do lead, contexto
- **Outputs**: sequência de mensagens + timing

### 🔍 Research (1)

#### `market-researcher`
- **Categoria**: research
- **Nível**: intermediary
- **Preço**: 48 créditos
- **Trilha**: agente
- **Descrição**: Pesquisa mercado (5-forças, SWOT, posicionamento)
- **Inputs**: nicho, concorrentes conhecidos
- **Outputs**: relatório + oportunidades

---

## 🟡 Skills Planejadas (18)

### `video-script-master` (advanced, R$ 84) — copy
- Roteiro completo de vídeo longo (VSL, webinar, curso)

### `social-media-writer` (basic, R$ 24) — copy
- Gera posts para Instagram, LinkedIn, Twitter (1 por plataforma)

### `email-subject-tester` (intermediary, R$ 36) — copy
- Gera 10 subject lines + previsão de open rate

### `press-release-writer` (advanced, R$ 60) — copy
- Escreve press release profissional

### `webinar-architect` (advanced, R$ 84) — marketing
- Desenha webinars de alta conversão (60-90 min)

### `launch-planner` (advanced, R$ 84) — marketing
- Cria plano completo de lançamento (7-30 dias)

### `retention-specialist` (advanced, R$ 84) — marketing
- Diagnóstico de churn + plano de retenção

### `statistical-analyzer` (advanced, R$ 72) — analytics
- Análise estatística avançada (regressão, chi-quadrado, Bayesian)

### `attribution-modeler` (advanced, R$ 84) — analytics
- Modelagem de atribuição data-driven (Markov, Shapley)

### `incremental-tester` (advanced, R$ 72) — analytics
- Testes de incrementality (geo-holdout, PSA)

### `flow-builder` (intermediary, R$ 48) — automation
- Constrói fluxos n8n/Make via descrição em linguagem natural

### `scheduler` (basic, R$ 24) — automation
- Agenda posts e tarefas com base em horário ótimo

### `a-b-test-analyzer` (intermediary, R$ 36) — analytics
- Lê resultado de A/B test e recomenda ação

### `brand-guardian` (intermediary, R$ 48) — design
- Audita branding (cores, tipografia, tom)

### `image-prompter` (basic, R$ 24) — design
- Gera prompt para Midjourney/DALL-E com base em briefing

### `semrush-reader` (intermediary, R$ 48) — research
- Lê dados de Semrush, SimilarWeb e gera insights

### `etl-builder` (advanced, R$ 72) — data
- Constrói pipelines ETL (extract, transform, load)

### `federation-trust` (advanced, R$ 84) — federation
- Gerencia protocolo de confiança entre nós

---

## 🔄 Versionamento e Changelog

| Versão | Data | Mudança |
|---|---|---|
| 1.0.0 | 2026-06-02 | Lançamento inicial — 27 operacionais, 18 planejadas |

---

## 📚 Documentos Relacionados

- `00-glossario.md` — termos
- `01-modelo-ioaid.md` — onde skills vivem (L3)
- `../agents-specs/00-base-agent.md` — agent que executa skills
- `../../sync/skill-manifest.json` — manifesto de runtime
- `../../cursos/fundamental/01-skills-essenciais.md` — curso

---

**Versão 1.0** · Atualizado 2026-06-02 · Mantido pela Equipe Nexus
