# 🤖 Nexus Affil'IA'te — IOAID · SaaS

> Infraestrutura SaaS proprietária para escalar operações de **parcerias, creators e afiliados**, com governança comercial, automação inteligente e visão analítica em tempo real.

[![Production](https://img.shields.io/badge/production-oneverso.com.br-00E5FF)](https://oneverso.com.br)
[![Skills Operacionais](https://img.shields.io/badge/skills_operacionais-8%2F45-7B61FF)](#-runtime-de-skills-operacionais)
[![Autonomy Score](https://img.shields.io/badge/autonomy_score-77/100-22c55e)](#-runtime-de-skills-operacionais)
[![License](https://img.shields.io/badge/license-Proprietary-94a3b8)](#)

---

## 🎯 Visão geral

O **Nexus Affil'IA'te** é um SaaS estratégico que unifica:
- 🔗 **Rastreamento ponta a ponta** de afiliados, creators e parceiros
- 💰 **Comissionamento dinâmico** com regras de atribuição customizáveis
- 🤖 **Agentes IA operacionais** para conteúdo, prospecção, distribuição e retenção
- 📊 **Visão analítica** em tempo real do ROI por canal e LTV por parceiro
- 🛡️ **Governança comercial** com aprovações granulares e trilha auditável

**Portal**: [oneverso.com.br](https://oneverso.com.br) · **API**: `api.oneverso.com.br` (Render)

---

## ✨ Os 3 principais diferenciais do OnVerso

### 1) Runtime de Skills Operacionais IA com 8 handlers em produção

O sistema entrega um runtime operacional com **8 skills especializados já em produção**, equivalentes a **17,8%** de um roadmap de 45 skills planejados. Esses handlers cobrem desde **copywriting persuasivo** até **segmentação de audiências**, **prospecção outbound** e **análise de tendências**, com execução autônoma e histórico reaproveitável por replay.

### 2) Autonomy Score em tempo real (0-100)

O **Autonomy Score** é um indicador proprietário calculado continuamente com base em **6 dimensões ponderadas**: percentual de tarefas autônomas (30%), acurácia do LLM-as-Judge (20%), cobertura operacional (15%), latência média (15%), aprovação manual (10%) e diversidade de canais (10%). O resultado é exposto em bandas objetivas: `low`, `developing`, `operational` e `advanced`.

### 3) Arquitetura SaaS escalável com governança comercial granular

O OnVerso unifica **rastreamento ponta a ponta**, **comissionamento dinâmico**, **regras de atribuição customizáveis** e uma **fila de aprovações granulares** (`needs_review`) com **RBAC em 5 escopos**: `runtime:read`, `runtime:execute`, `runtime:approve`, `runtime:reject` e `runtime:rerun`. A base técnica combina **Node.js 22 + tRPC + Drizzle ORM em Postgres**, com suporte a execução distribuída via **BullMQ/Redis** e visão analítica em tempo real do **ROI por canal** e **LTV por parceiro**.

---

## 🏗️ Arquitetura

```
┌──────────────────────────────────────────────────────────────────┐
│                       FRONTEND (oneverso.com.br)                  │
│              React 18 + Vite + Wouter + Tailwind + tRPC          │
│                    Hospedagem: HostGator (estático)              │
└─────────────────────────────┬────────────────────────────────────┘
                              │ HTTPS
┌─────────────────────────────▼────────────────────────────────────┐
│                  BACKEND tRPC (api.oneverso.com.br)              │
│       Node 22 + Express + tRPC v11 + Drizzle ORM (Postgres)     │
│                  Hospedagem: Render (Docker)                     │
│                                                                  │
│   ┌─────────────────┐  ┌──────────────────┐  ┌────────────────┐ │
│   │  Skills Runtime │  │ Auto-Publisher   │  │ Analytics Cron │ │
│   │  (8 handlers)   │  │ Worker (5 ch.)   │  │ (6h interval)  │ │
│   └─────────────────┘  └──────────────────┘  └────────────────┘ │
│   ┌─────────────────┐  ┌──────────────────┐  ┌────────────────┐ │
│   │ Approvals Queue │  │ Execution History│  │ Telemetry Ring │ │
│   │ (needs_review)  │  │ (com replay)     │  │ (Autonomy)     │ │
│   └─────────────────┘  └──────────────────┘  └────────────────┘ │
└─────────┬────────────────────────┬──────────────────────────────┘
          │                        │
          ▼                        ▼
   Postgres (Render)         BullMQ/Redis (opcional)
   Tabelas: agent_telemetry,  Modo dual:
   skill_approvals, etc.       in-memory (dev) | bullmq (prod)
```

---

## 🚀 Runtime de Skills Operacionais

8 handlers em produção (17.8% do roadmap de 45 skills):

| Slug | Categoria | Função |
|------|-----------|--------|
| `copywriter-persuasivo` | content | Gera headline + body + CTA + hooks A/B |
| `detector-tendencias` | intelligence | Score 4-dim + clusters + outreach opportunities |
| `auto-publisher` | publishing | Calendário multi-canal com idempotência |
| `judge-revisor` | decision | LLM-as-Judge (heurística + OpenAI dual-mode) |
| `prospeccao-outbound` | sales | Lead Score RFM-E + sequência 3-toques |
| `follow-up-strategist` | retention | Plano por fase (cooling/warming/retention/win-back) |
| `analytics-reporter` | analytics | Relatório executivo + healthSignals + recommendations |
| `audience-segmenter` | intelligence | Segmentação RFM-E em 5 clusters + playbooks |

### Endpoints principais
```
GET  /api/trpc/agentSkillsRuntime.listHandlers
GET  /api/trpc/agentSkillsRuntime.telemetry
GET  /api/trpc/agentSkillsRuntime.autonomyScore
GET  /api/trpc/agentSkillsRuntime.workerStats
GET  /api/trpc/agentSkillsRuntime.dispatcherStatus
GET  /api/trpc/agentSkillsRuntime.approvalsList
GET  /api/trpc/agentSkillsRuntime.executionHistory
GET  /api/trpc/agentSkillsRuntime.analyticsLatest

POST /api/trpc/agentSkillsRuntime.execute          [protected]
POST /api/trpc/agentSkillsRuntime.approvalsDecide  [runtime:approve|reject]
POST /api/trpc/agentSkillsRuntime.executionReplay  [runtime:rerun]
POST /api/trpc/agentSkillsRuntime.analyticsTrigger [runtime:execute]

GET  /api/trpc/adminAuth.status
POST /api/trpc/adminAuth.login
GET  /api/trpc/adminAuth.verify
```

### Autonomy Score (0-100)

Calculado em tempo real a partir de 6 indicadores ponderados:

| Indicador | Peso |
|-----------|------|
| % tarefas autônomas | 30% |
| Acurácia do LLM-as-Judge | 20% |
| Cobertura operacional | 15% |
| Latência média | 15% |
| % aprovação manual | 10% |
| Diversidade de canais | 10% |

Bandas: `low` (<35) · `developing` (35-59) · `operational` (60-79) · `advanced` (≥80)

---

## 📂 Estrutura do repositório

```
MMN_AI-to-AI/
├── backend/                          # tRPC server (Node 22 + Express)
│   ├── src/
│   │   ├── agentic/
│   │   │   ├── skills/               # 8 handlers operacionais
│   │   │   │   ├── copywriterPersuasivo.ts
│   │   │   │   ├── detectorTendencias.ts
│   │   │   │   ├── autoPublisher.ts
│   │   │   │   ├── judgeRevisor.ts
│   │   │   │   ├── prospeccaoOutbound.ts
│   │   │   │   ├── followUpStrategist.ts
│   │   │   │   ├── analyticsReporter.ts
│   │   │   │   ├── audienceSegmenter.ts
│   │   │   │   ├── dispatcher.ts     # Registro central
│   │   │   │   └── types.ts
│   │   │   ├── approvalsQueue.ts     # Fila needs_review
│   │   │   ├── executionHistory.ts   # Histórico com replay
│   │   │   ├── runtimeTelemetry.ts   # Ring buffer in-memory
│   │   │   ├── telemetryRepository.ts # Persistência DB best-effort
│   │   │   ├── runtimeRbac.ts        # Escopos granulares
│   │   │   ├── analyticsCron.ts      # Cron interno
│   │   │   ├── autonomyScore.ts      # Cálculo 0-100
│   │   │   └── judge/                # LLM-as-Judge clássico (legacy)
│   │   ├── routers/
│   │   │   ├── adminAuthRouter.ts    # SHA-256 + HMAC token
│   │   │   ├── agentSkillsRuntimeRouter.ts # Endpoints runtime
│   │   │   └── ... (outros routers MMN)
│   │   ├── workers/
│   │   │   ├── autoPublisherWorker.ts # Fila publicação
│   │   │   └── channelDispatchers.ts  # WhatsApp/Resend/Facebook reais
│   │   ├── appRouter.ts
│   │   └── index.ts
│   ├── dist/                         # esbuild output
│   └── package.json
│
├── frontend/                         # React 18 + Vite + Tailwind
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx              # Apresentação institucional
│   │   │   ├── Login.tsx             # Auth admin+afiliado
│   │   │   ├── Cadastro.tsx          # Onboarding 3-steps
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── AdminRuntime.tsx      # Painel skills + telemetria
│   │   │   ├── AdminDashboardLayout.tsx
│   │   │   └── ... (outras páginas)
│   │   ├── components/
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx       # Server-side admin auth
│   │   ├── lib/
│   │   │   └── trpc.ts
│   │   └── App.tsx
│   ├── public/
│   │   └── favicon.svg               # Robô IA Nexus
│   ├── index.html                    # Título + meta tags
│   └── package.json
│
├── database/
│   ├── schemas/
│   │   ├── agentTelemetry.ts         # Tabela telemetria persistida
│   │   └── ... (outros schemas Drizzle)
│   └── migrations/
│       ├── 0002_agent_telemetry.sql  # Postgres migration
│       └── ... (legacy MySQL)
│
├── infra/
│   ├── Dockerfile                    # Multi-stage build
│   ├── RENDER_DEPLOY.md              # Guia operacional Render
│   └── drizzle.config.ts
│
├── docs/
│   └── planning/
│       └── SKILL_RENTAL_AND_AGENT_AUTONOMY.md
│
├── hostgator_mmn/                    # Deploy local (gitignored)
│   └── stage_final/                  # Build pronto para FTP
│
├── render.yaml                       # Blueprint Render
├── README.md                         # Este arquivo
└── ROADMAP.md                        # Próximos passos
```

---

## ⚡ Quick Start

### Pré-requisitos
- Node.js 22+
- npm 10+

### Backend local
```bash
cd backend
npm install
npm run dev
# → http://localhost:3000 (configurável via PORT)
# Desenvolvimento: tsx watch com hot-reload
# Produção: npm run build && npm start
```

### Frontend local
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173 (Vite dev server com HMR)
```

### Build de produção
```bash
# Backend
cd backend && npm run build      # dist/index.js (~750KB, esbuild)

# Frontend
cd frontend && npm run build    # dist/ (assets + index.html)
```

---

## 🔐 Variáveis de ambiente

### Backend (Render)
```env
NODE_ENV=production
PORT=3000
FRONTEND_ORIGIN=https://oneverso.com.br
ALLOWED_ORIGINS=https://oneverso.com.br,https://www.oneverso.com.br,https://api.oneverso.com.br

# Admin server-side (obrigatórias para login admin via backend)
ADMIN_SESSION_SECRET=<gerado pelo Render>
ADMIN_EMAIL_SHA256=<sha256 do e-mail autorizado>
ADMIN_PASSWORD_SHA256=<sha256 da senha autorizada>

# Banco / cache (opcionais; standalone funciona sem)
DATABASE_URL=postgres://...
REDIS_URL=redis://...

# LLM (opcional; judge cai em heurística se ausente)
OPENAI_API_KEY=sk-...

# Cron analytics (opcional)
ENABLE_ANALYTICS_CRON=true
ANALYTICS_CRON_HOURS=6

# Dispatchers reais (opcionais; viram stubs se ausentes)
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_ACCESS_TOKEN=...
WHATSAPP_DEFAULT_RECIPIENT=...
RESEND_API_KEY=...
RESEND_FROM=...
RESEND_DEFAULT_RECIPIENT=...
FACEBOOK_PAGE_ID=...
FACEBOOK_PAGE_TOKEN=...

# Integrações marketplace (opcionais)
HOTMART_CLIENT_ID=...
HOTMART_CLIENT_SECRET=...
SHOPEE_AFFILIATE_USERNAME=...
```

### Frontend (build-time)
```env
VITE_TRPC_URL=https://api.oneverso.com.br/api/trpc
VITE_API_URL=https://api.oneverso.com.br

# Social login (opcional; botões ficam indisponíveis quando ausente)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
```

---

## 🚢 Deploy

### Backend → Render
1. Conectar repo no painel Render → **New → Blueprint** (detecta `render.yaml`)
2. Configurar segredos (`ADMIN_*`, `HOTMART_*`, etc.) em Environment
3. Adicionar custom domain `api.oneverso.com.br` + CNAME no HostGator
4. Auto-deploy a cada push em `main`

### Frontend → HostGator
```bash
# Build local
cd frontend && npm run build

# Sync para staging
cp -r frontend/dist/assets hostgator_mmn/stage_final/
cp frontend/dist/index.html hostgator_mmn/stage_final/

# Deploy FTP (lftp)
lftp -e "mirror -R --delete --only-newer hostgator_mmn/stage_final/assets public_html/assets; \
         put hostgator_mmn/stage_final/index.html -o public_html/index.html; bye" \
     -u user,pass ftp://ftp.oneverso.com.br
```

---

## 🛡️ Segurança

- **Admin auth**: SHA-256 server-side + HMAC token (12h TTL)
- **Rate limiting**: 5 tentativas → bloqueio 10min (admin local)
- **RBAC granular**: 5 escopos (`runtime:read|execute|approve|reject|rerun`)
- **CORS estrito**: `ALLOWED_ORIGINS` controla origens permitidas
- **Timing-safe compare**: `crypto.timingSafeEqual` em todas as comparações de hash
- **Compliance LGPD**: skills sinalizam opt-in ausente e bloqueiam outreach

---

## 📚 Documentação adicional

- [`infra/RENDER_DEPLOY.md`](infra/RENDER_DEPLOY.md) — Guia operacional Render passo a passo
- [`docs/planning/SKILL_RENTAL_AND_AGENT_AUTONOMY.md`](docs/planning/SKILL_RENTAL_AND_AGENT_AUTONOMY.md) — Plano de autonomia e aluguel de skills
- [`ROADMAP.md`](ROADMAP.md) — Próximos passos

---

## 📞 Contato

- **Portal**: [oneverso.com.br](https://oneverso.com.br)
- **E-mail**: equipenexus@oneverso.com.br
- **WhatsApp**: +55 19 99269-1954
- **Reunião Executiva**: Sábados, 09h30–12h00 — Comunidade GitHub Nexus Affil'IA'te

---

<sub>Nexus Affil'IA'te · IOAID SaaS · by oneverso.com.br · Equipe Nexus</sub>
