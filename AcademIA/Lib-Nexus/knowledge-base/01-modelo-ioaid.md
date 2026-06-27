---
title: "Modelo IOAID · Arquitetura em 5 Camadas"
description: "Documentação canônica do modelo IOAID (Infraestrutura Operacional de Inteligência Distribuída)"
tags: [lib-nexus, knowledge-base, ioaid, arquitetura, canonico]
category: knowledge-base
version: "1.0"
last_review: "2026-06-02"
status: official
---

# 🏛️ Modelo IOAID · Arquitetura em 5 Camadas

> **Infraestrutura Operacional de Inteligência Distribuída** — A espinha arquitetural do Nexus Affil'IA'te. Este documento é **canônico**: tudo que conflitar com ele está errado.

---

## 🎯 O que é o IOAID

IOAID é a **arquitetura de referência** que organiza todos os componentes do Nexus em **5 camadas bem definidas**, cada uma com **responsabilidades específicas** e **contratos explícitos** com as camadas adjacentes.

### Princípios Fundamentais

1. **Separação de responsabilidades** — cada camada tem 1 papel claro
2. **Contratos explícitos** — entrada/saída bem definidos entre camadas
3. **Substituibilidade** — trocar implementação sem afetar adjacentes
4. **Observabilidade nativa** — cada camada expõe métricas e logs
5. **Escalabilidade horizontal** — cada camada escala independentemente
6. **Federável** — cada camada pode ser multi-instância sem acoplar

---

## 📐 As 5 Camadas (L1 → L5)

```
┌─────────────────────────────────────────────────┐
│  L5 · EXPERIÊNCIA                              │
│  UI/UX, Painel, Dashboards, Mobile              │
├─────────────────────────────────────────────────┤
│  L4 · FEDERAÇÃO                                │
│  Multi-tenant, White-label, Federação Zero-Trust│
├─────────────────────────────────────────────────┤
│  L3 · INTELIGÊNCIA                             │
│  Agentes, Skills, Prompts, Modelos de IA        │
├─────────────────────────────────────────────────┤
│  L2 · ORQUESTRAÇÃO                             │
│  SHO (Sistema Híbrido de Orquestração)         │
├─────────────────────────────────────────────────┤
│  L1 · RUNTIME                                  │
│  Node.js, TypeScript, PostgreSQL, Redis, K8s    │
└─────────────────────────────────────────────────┘
```

---

## L1 — Runtime

**Responsabilidade**: Infraestrutura técnica que executa tudo. Banco de dados, cache, computação, rede.

### Tecnologias Canônicas
- **Linguagem**: TypeScript 5.4+ (Node.js 20+)
- **Framework Web**: Fastify (perf) ou Express (compat)
- **Banco Relacional**: PostgreSQL 16
- **Cache / Fila**: Redis 7 + BullMQ
- **ORM**: Drizzle (preferido) ou Prisma
- **Container**: Docker + Kubernetes
- **Observabilidade**: OpenTelemetry + Grafana + Loki
- **CI/CD**: GitHub Actions + ArgoCD

### Componentes
- `apps/api/` — API principal (tRPC + REST)
- `apps/worker/` — Worker assíncrono (filas)
- `apps/scheduler/` — Cron jobs
- `packages/db/` — Schema do banco
- `packages/lib/` — Bibliotecas compartilhadas
- `infra/` — IaC (Terraform, Helm)

### SLOs
- **Disponibilidade**: 99.5% (≈ 3.6h/ano)
- **Latência p95**: ≤ 200ms (API)
- **Latência p99**: ≤ 500ms (API)
- **Uptime worker**: 99.9%

### Quem consulta
- Devs backend
- SRE / DevOps
- Auditoria de segurança

---

## L2 — Orquestração (SHO)

**Responsabilidade**: Decidir **o que** cada agente faz, **quando**, e **como** se coordena. É o **cérebro operacional** do Nexus.

### Componentes
- `backend/src/orchestrator/centralOrchestrator.ts` — orquestrador central
- `backend/src/orchestrator/sho.ts` — lógica do SHO
- `backend/src/orchestrator/scheduler.ts` — agendador
- `backend/src/orchestrator/stateMachine.ts` — máquina de estados

### SHO (Sistema Híbrido de Orquestração)

Combina **regras determinísticas** (código) com **decisões estocásticas** (LLM). O SHO decide:

- **Qual agente** executar para uma tarefa
- **Qual skill** invocar
- **Qual modelo** usar (GPT-4o, Claude, etc.)
- **Quais ferramentas** dar ao agente
- **Qual nível de autonomia** (S0-S4)
- **Quando escalar** para humano

### Níveis SHO (S0 → S4)

| Nível | Nome | Descrição | Quando usar |
|---|---|---|---|
| **S0** | Manual | Humano faz tudo | Emergência, validação inicial |
| **S1** | Assistido | Agente sugere, humano aprova | Operações sensíveis |
| **S2** | Supervisionado | Agente executa, humano revisa amostral | Operação padrão |
| **S3** | Autônomo | Agente executa com guardrails | Operação de alto volume |
| **S4** | Federado | Agentes de múltiplos nós cooperam | Multi-tenant avançado |

### Quem consulta
- Engenheiro de orquestração
- Tech lead
- Auditoria de compliance

---

## L3 — Inteligência

**Responsabilidade**: **Agentes**, **skills**, **prompts** e a integração com **modelos de IA**. Camada que "pensa".

### Estrutura de Pastas
```
backend/src/agentic/
├── agents/          # Personas + lógica
│   ├── baseAgent.ts
│   ├── marketingAgent.ts
│   ├── judgeRevisor.ts
│   └── federationGate.ts
├── skills/          # Funções atômicas
│   ├── copywriterPersuasivo.ts
│   ├── audienceSegmenter.ts
│   └── roiAttributor.ts
├── prompts/         # Templates de prompt
│   ├── system/
│   ├── user/
│   └── judge/
├── llm/             # Wrappers de modelo
│   ├── openai.ts
│   ├── anthropic.ts
│   └── router.ts
└── memory/          # Memória de curto/longo prazo
    ├── shortTerm.ts
    └── longTerm.ts
```

### Componentes Canônicos

**Agentes** (atualmente 6):
1. **baseAgent** — fundação comum
2. **marketingAgent** — execução de marketing
3. **copywriterAgent** — geração de copy
4. **analyticsAgent** — análise de dados
5. **judgeRevisor** — qualidade e auditoria
6. **federationGate** — multi-tenant e PII

**Skills** (atualmente 27 operacionais, 18 planejadas):
- `copywriter-persuasivo` — gera copy persuasiva
- `audience-segmenter` — segmenta leads
- `roi-attributor` — atribui receita por canal
- `ab-test-designer` — desenha experimentos
- `cohort-analyzer` — analisa coortes
- `webhook-router` — roteia webhooks
- `pricing-optimizer` — otimiza preços
- (ver `02-taxonomia-skills.md` para lista completa)

### Quem consulta
- Engenheiro de IA/ML
- Engenheiro de produtos
- Tech writer
- Afiliado (via Academ'IA)

---

## L4 — Federação

**Responsabilidade**: **Isolamento de tenants** (multi-tenant), **white-label**, e **federação entre nós** com confiança zero (zero-trust).

### Componentes
- `backend/src/federation/tenantManager.ts` — gerencia tenants
- `backend/src/federation/gate.ts` — PII gate
- `backend/src/federation/registry.ts` — registro de nós
- `backend/src/federation/trust.ts` — protocolo de confiança

### Multi-Tenant (Isolamento)

Cada tenant (cliente white-label) tem:
- **Schema isolado** no banco (ou row-level security)
- **Domínio próprio** (`app.cliente.com.br`)
- **Branding próprio** (logo, cores)
- **Chaves de API próprias**
- **Limites de uso próprios**

### Federação Zero-Trust

Quando 2 nós Nexus cooperam (ex: Nexus Hub + Nexus Partner):
- **mTLS obrigatório** (certificados por nó)
- **Token JWT de curta duração** (15min)
- **Scopes explícitos** por chamada
- **PII Gate** central — toda PII passa por filtro
- **Audit log** de toda chamada inter-nó

### Quem consulta
- Engenheiro de segurança
- Engenheiro de plataforma
- White-label customer

---

## L5 — Experiência

**Responsabilidade**: **UI/UX** de tudo que o usuário vê. Painel do afiliado, dashboards, formulários, mobile.

### Componentes
- `apps/web/` — Frontend principal (Next.js 14)
  - `app/afiliado/` — painel do afiliado
  - `app/admin/` — painel admin
  - `app/white-label/` — configuração white-label
- `apps/mobile/` — Mobile (React Native — planejado)
- `packages/ui/` — Design system compartilhado
- `packages/email-templates/` — Templates de e-mail

### Personas de UX
- 🥉 **Afiliado Iniciante** — vê dashboard simples
- 🥈 **Operador** — vê métricas e tools
- 🥇 **Estrategista** — vê analytics avançado
- 💎 **Elite** — vê tudo + pode customizar

### Quem consulta
- Designer
- Engenheiro frontend
- PM
- Afiliado

---

## 🔄 Como as Camadas se Comunicam

### Fluxo Típico: "Gerar copy de headline para afiliado X"

```
L5 (UI) ──► API request (tRPC)
   ↓
L4 (Federação) ──► Valida tenant, contexto
   ↓
L2 (Orquestração/SHO) ──► Decide: SHO Level S2, agente=copywriterAgent
   ↓
L3 (Inteligência) ──► Carrega skill copywriter-persuasivo, prompt CO-STAR
   ↓
L3 (LLM Router) ──► Chama GPT-4o com prompt
   ↓
L3 (Judge) ──► Avalia output (score 0.85)
   ↓
L2 (Orquestração) ──► Salva em DB, retorna para L5
   ↓
L5 (UI) ──► Exibe copy ao afiliado
```

### Invariantes Importantes

- **L1 nunca decide lógica de negócio** (só executa)
- **L2 nunca conhece implementação de skill** (delega para L3)
- **L3 nunca fala direto com L5** (passa por L2)
- **L4 nunca decide execução** (só autorização)
- **L5 nunca acessa DB diretamente** (sempre via API)

---

## 📊 Métricas Por Camada

### L1 (Runtime)
- Uptime, latência, throughput, uso de recursos

### L2 (Orquestração)
- Decisões/min, taxa de escalação humana, tempo médio de decisão

### L3 (Inteligência)
- Custo por chamada, latência por modelo, taxa de alucinação (medida pelo Judge)

### L4 (Federação)
- Tenants ativos, chamadas inter-nó, falhas de auth, vazamentos de PII (deve ser 0)

### L5 (Experiência)
- Page load time, conversion rate por persona, NPS

---

## 🛡️ Princípios de Segurança Cross-Camada

1. **Defense in depth** — cada camada tem suas defesas
2. **Least privilege** — cada componente tem só o que precisa
3. **PII Gate central** — TODA PII passa por L4 (federationGate)
4. **Audit log** — toda ação cross-camada é logada
5. **LGPD by design** — privacidade desde a arquitetura, não como patch

---

## 📚 Documentos Canônicos Ligados

- `00-glossario.md` — termos do IOAID
- `02-taxonomia-skills.md` — skills da L3
- `03-conformidade-lgpd.md` — LGPD cross-camada
- `../agents-specs/00-base-agent.md` — agent base da L3
- `../agents-specs/03-federation-gate.md` — gate da L4
- `../api-docs/00-trpc-overview.md` — API entre L2 e L5

---

**Versão 1.0** · Atualizado 2026-06-02 · Mantido pela Equipe Nexus
