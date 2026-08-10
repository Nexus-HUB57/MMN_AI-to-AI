<p align="center">
  <img src="https://img.shields.io/badge/Nexus-Affil%27IA%27te-blue?style=for-the-badge" alt="Nexus Affil'IA'te" />
  <br/>
  <img src="https://img.shields.io/badge/React_18-61DAFB?logo=react&logoColor=black&style=flat-square" alt="React 18" />
  <img src="https://img.shields.io/badge/Vite_6-646CFF?logo=vite&logoColor=white&style=flat-square" alt="Vite 6" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white&style=flat-square" alt="TypeScript" />
  <img src="https://img.shields.io/badge/tRPC_11-398CCB?style=flat-square" alt="tRPC 11" />
  <img src="https://img.shields.io/badge/Drizzle_ORM-F97316?style=flat-square" alt="Drizzle ORM" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white&style=flat-square" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Redis-DC382D?logo=redis&logoColor=white&style=flat-square" alt="Redis" />
  <img src="https://img.shields.io/badge/BullMQ-6A1B9A?style=flat-square" alt="BullMQ" />
  <img src="https://img.shields.io/badge/TailwindCSS-06B6D4?logo=tailwindcss&logoColor=black&style=flat-square" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/PM2-2B033A?logo=pm2&logoColor=white&style=flat-square" alt="PM2" />
  <img src="https://img.shields.io/badge/Node.js_20-339933?logo=node.js&logoColor=white&style=flat-square" alt="Node.js 20" />
  <br/>
  <img src="https://img.shields.io/badge/Plataforma-MMN_+__IA-blueviolet?style=for-the-badge" alt="MMN + AI" />
  <img src="https://img.shields.io/badge/Licença-Privada-red?style=flat-square" alt="Licença" />
  <img src="https://img.shields.io/badge/versão-1.0.0-green?style=flat-square" alt="Versão" />
</p>

<h1 align="center">🤖 Nexus Affil'IA'te — AI-to-AI</h1>

<p align="center">
  <strong>Infraestrutura Operacional de Inteligência Distribuída</strong><br/>
  Plataforma de Marketing de Afiliados impulsionada por Agentes de IA autônomos · SaaS Early-Stage
</p>

---

## 📖 Sobre o Projeto

O **Nexus Affil'IA'te** é um ecossistema SaaS que une **Multilevel Marketing (MMN)** com **Agentes de IA autônomos** operando 24/7 em uma arquitetura *AI-to-AI*. A plataforma evoluiu de um sistema legado PHP para uma stack moderna full-stack, mantendo compatibilidade com dados existentes.

> **Diferencial Principal** — Não é apenas uma plataforma MMN tradicional, mas uma **infraestrutura operacional de agentes autônomos de IA** aplicados a marketing, vendas e operação distribuída.

**Modelo Híbrido**: Intervenção humana propositiva + Agentes IA 100% autônomos no operacional, seguindo o **SHO — Sistema Híbrido de Orquestração** em evolução contínua para **AOI — Autonomous Operational Intelligence**.

**Website**: [oneverso.com.br](https://www.oneverso.com.br)

---

## 🏗️ Arquitetura

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| **Frontend** | React + Vite + TypeScript | 18 / 6 / 5.7 |
| **Estilização** | TailwindCSS + Radix UI + CVA | 3.4 / latest |
| **Roteamento** | Wouter (SPA) | 3.3 |
| **API** | tRPC + TanStack React Query | 11 / 5.62 |
| **Backend** | Node.js + Express + esbuild | 20+ / 4.21 / 0.24 |
| **ORM** | Drizzle ORM (schema-first) | 0.45 |
| **Banco de Dados** | PostgreSQL (Render Managed) | 15+ |
| **Cache / Filas** | Redis + BullMQ (ioredis) | latest / 5.28 |
| **Autenticação** | Firebase Auth (client + admin) | 13.10 |
| **AI / LLM** | Genkit + LangChain + OpenAI | 1.28 / 0.3 / 4.77 |
| **Process Manager** | PM2 (cluster mode) | latest |
| **Mobile** | Expo + React Native | latest |
| **CI/CD** | GitHub Actions + PM2 Deploy | — |

---

## 📁 Estrutura do Projeto

<details>
<summary>📂 Clique para expandir</summary>

```
MMN_AI-to-AI/
├── frontend/                   # React 18 + Vite + Tailwind + tRPC Client
│   └── src/pages/              # 90+ páginas (Admin, Dashboard, Marketplace...)
├── backend/                    # Node.js + tRPC + Drizzle + Workers
│   └── src/
│       ├── routers/            # 60+ routers tRPC
│       ├── workers/            # BullMQ workers (content, commissions, orders, marketplace)
│       ├── services/           # Lógica de negócio
│       ├── integrations/       # Hotmart, Shopee, WhatsApp, Resend, Facebook
│       ├── agentic/            # Orquestração de Agentes IA
│       ├── genkit/             # Google Genkit flows
│       └── drizzle/schema.ts   # Schema central
├── database/schemas/           # Schemas Drizzle (16+ arquivos)
├── infra/                      # Docker Compose, deploy scripts
├── mobile/                     # Expo (React Native)
├── docs/                       # Documentação
├── tests/                      # Vitest (unit + integration)
├── deploy/                     # Scripts de deploy (Hostgator VPS)
├── packs/                      # Definição de Packs / Ativações
├── AcademIA/                   # Conteúdo EAD
├── ai/                         # Scripts e configs de IA
├── scripts/                    # Utilitários
├── ecosystem.config.js         # PM2 config (API + 4 workers)
├── drizzle.config.ts           # Drizzle Kit config
├── .env.example                # Template de variáveis de ambiente
├── pnpm-workspace.yaml         # Workspaces (frontend, backend, mobile)
└── package.json                # Monorepo root
```

</details>

---

## ⚡ Funcionalidades Principais

### 🎛️ Admin Dashboard
Painel administrativo completo com gestão de usuários, rede, comissões, aprovações, materiais, agendamentos, governança e orquestração de agentes.

### 🌐 Gestão de Rede (MMN)
Estrutura de rede multinível com código de afiliado, patrocinador, visualização em árvore, relatórios de profundidade e métricas de ativação mensal.

### 💰 Sistema de Comissões & Plano de Carreira
Cálculo automático de comissões multinível com 5 faixas de carreira, bônus de ativação, bônus de profundidade e bônus especiais. Processamento via BullMQ worker dedicado.

### 🛒 Marketplace Nexus
Integração com **Hotmart** e **Shopee Afiliados** — sync automático de produtos, análise de tendências (trending score, sazonalidade, lucratividade), margens de afiliado e loja personalizada.

### 💳 Pix Checkout
Sistema de checkout via Pix para ativações de pacotes, com geração de QR Code, controle de expiração e confirmação de pagamento.

### 🤖 Agentes IA — Lab Nexus
Plataforma de criação e gestão de agentes autônomos de IA com skills configuráveis, runtime de execução, orquestração de goals e métricas de performance. Integração com OpenAI, Genkit e LangChain.

### 📚 Academia EAD
Plataforma de ensino a distância com módulos, aulas, rastreamento de progresso e certificações para capacitação de afiliados.

### 📦 Sistema de Packs
Pacotes de ativação com entitlements, upgrades de agentes e liberação progressiva de funcionalidades conforme o plano.

### 📊 Geração de Conteúdo IA
Hub de criação de conteúdo para redes sociais com templates, agendamento de posts, análise de engajamento e dispatch para WhatsApp, Facebook e e-mail.

---

## 📈 Plano de Carreira

A plataforma possui 5 faixas de progressão com recompensas crescentes:

| Faixa | Título | Descrição |
|-------|--------|-----------|
| 1 | **Agente Afiliado** | Entrada no ecossistema — acesso básico ao marketplace e ferramentas |
| 2 | **Agente Conector** | Rede em crescimento — bônus de profundidade N2 habilitado |
| 3 | **Agente Gestor** | Gestão de equipe — bônus de liderança e materiais avançados |
| 4 | **Agente Estrategista** | Estratégia avançada — Lab Nexus completo e orquestração IA |
| 5 | **Agente Agentic IA** | Nível máximo — acesso total, comissões maximizadas, API aberta |

**Tipos de Bônus:**
- **Bônus Direto** — Comissão sobre vendas pessoais
- **Bônus de Profundidade** — Comissões multinível (N1 a N5)
- **Bônus de Ativação** — Recompensa por metas de rede
- **Bônus de Liderança** — Premiação por performance da equipe
- **Bônus Especial** — Incentivos sazonais e campanhas

---

## 🔧 Configuração e Deploy

### Pré-requisitos
- **Node.js** >= 20
- **PostgreSQL** 15+
- **Redis** (opcional, standalone funciona sem)
- **pnpm** ou **npm** 9+

### Instalação

```bash
# Clonar o repositório
git clone https://github.com/Nexus-HUB57/MMN_AI-to-AI.git
cd MMN_AI-to-AI

# Instalar dependências dos workspaces
npm run install:workspaces

# Copiar e configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais

# Push do schema no banco
npm run db:push
```

### Variáveis de Ambiente Principais

| Variável | Descrição | Obrigatória |
|----------|-----------|-------------|
| `NODE_ENV` | `development` / `production` | Sim |
| `PORT` | Porta do backend (default: 3000) | Sim |
| `DATABASE_URL` | Connection string PostgreSQL | Sim |
| `REDIS_URL` | Connection string Redis | Não* |
| `ADMIN_SESSION_SECRET` | Chave secreta para sessões admin | Sim |
| `ADMIN_EMAIL_SHA256` | SHA256 do email admin autorizado | Sim |
| `ADMIN_PASSWORD_SHA256` | SHA256 da senha admin autorizada | Sim |
| `FIREBASE_PROJECT_ID` | Projeto Firebase | Sim |
| `FIREBASE_CLIENT_EMAIL` | Service account Firebase | Sim |
| `FIREBASE_PRIVATE_KEY` | Chave privada Firebase | Sim |
| `OPENAI_API_KEY` | API Key OpenAI (para Agentes IA) | Não** |
| `VITE_FIREBASE_API_KEY` | Firebase Client SDK | Sim |
| `VITE_TRPC_URL` | URL do backend tRPC | Sim |

> \* Standalone funciona sem Redis, mas filas BullMQ não operam.  
> \*\* Sem OpenAI, o sistema usa heurística como fallback.

### Desenvolvimento Local

```bash
# Iniciar frontend + backend simultaneamente
npm run dev

# Ou separadamente
npm run dev:frontend   # Vite na porta 5173
npm run dev:backend    # tRPC na porta 3000

# Drizzle Studio (visualizador de banco)
npm run db:studio
```

### Build de Produção

```bash
# Build frontend (Vite) + backend (esbuild)
npm run build:production

# Iniciar com PM2 (cluster mode, 2 instâncias API + 4 workers)
pm2 start ecosystem.config.js --env production
```

### Deploy com PM2

O `ecosystem.config.js` configura 5 processos:

| Processo | Script | Modo | Instâncias |
|----------|--------|------|------------|
| `mmn-api` | `backend/dist/index.js` | cluster | 2 |
| `mmn-worker-content` | `contentGenerationWorker.js` | fork | 1 |
| `mmn-worker-commissions` | `commissionProcessingWorker.js` | fork | 1 |
| `mmn-worker-marketplace` | `marketplaceSyncWorker.js` | fork | 1 |
| `mmn-worker-orders` | `orderProcessingWorker.js` | fork | 1 |

**Comandos PM2 essenciais:**
```bash
pm2 start ecosystem.config.js --env production
pm2 monit          # Monitoramento em tempo real
pm2 logs           # Logs de todos os processos
pm2 restart all    # Reiniciar tudo
pm2 save           # Salvar lista de processos
pm2 startup        # Auto-start no boot
```

---

## 🔌 API — Visão Geral tRPC

A API é servida via **tRPC v11** em `/api/trpc`. Principais routers:

| Router | Descrição |
|--------|-----------|
| `admin` | Dashboard, gestão de usuários, rede, pagamentos |
| `adminAuth` | Autenticação admin (SHA256 session) |
| `auth` | Login/registro via Firebase Auth |
| `commissions` | Cálculo e listagem de comissões |
| `network` / `networkExtended` | Árvore de indicações, métricas de rede |
| `marketplace` / `marketplaceNexus` | Produtos, tendências, sync de marketplaces |
| `payments` / `pix` / `pixHistory` | Checkout Pix, saques, histórico |
| `labNexus` | Criação e gestão de Agentes IA |
| `agentRuntime` / `agentSkills` | Execução e skills de agentes |
| `agentic` / `orchestration` | Orquestração e goals de agentes |
| `packs` / `packEntitlements` | Sistema de pacotes e ativações |
| `academiaEad` / `academiaPublic` | Plataforma EAD |
| `contentGeneration` / `aiContentHub` | Geração de conteúdo com IA |
| `social` / `postScheduler` | Postagem em redes sociais |
| `users` / `profile` | Perfil e dados do usuário |
| `upgrades` / `skills` / `skillsMarketplace` | Upgrades e marketplace de skills |
| `health` | Health check do sistema |
| `dropshipping` | Gestão de dropshipping |
| `billing` | Faturamento e assinaturas |

---

## 🗄️ Banco de Dados — Tabelas Principais

| Tabela | Descrição |
|--------|-----------|
| `users` | Usuários do sistema (Firebase Auth + legado) |
| `affiliates` | Dados de afiliado (código, patrocinador, comissões, pontos) |
| `network` | Relações de rede (userId → sponsorId, nível) |
| `commissions` | Registro de comissões (nível, fonte, status) |
| `bonuses` | Bônus especiais (tipo, valor, status) |
| `products` | Produtos sincronizados de marketplaces |
| `orders` | Pedidos de vendas (Hotmart, Shopee) |
| `payments` / `pix_history` | Pagamentos e saques via Pix |
| `marketplace_accounts` | Credenciais de integração com marketplaces |
| `marketplace_products_ext` | Produtos estendidos com métricas de tendência |
| `product_trends` | Análise de tendência (score, sazonalidade, demanda) |
| `affiliate_margins` | Margens e estimativa de ganhos por afiliado |
| `agents` | Agentes IA de cada usuário (status, score, estratégia) |
| `activation_packs` / `pack_activations` | Pacotes e ativações de features |
| `content_templates` / `scheduled_posts` | Templates de conteúdo e agendamentos |
| `generated_content` / `content_analytics` | Conteúdo gerado por IA e métricas |
| `orchestration_goals` / `orchestration_tasks` | Orquestração de agentes IA |
| `job_logs` / `performance_metrics` | Logs e métricas de workers BullMQ |
| `notifications` | Centro de notificações |
| `materials` | Materiais de marketing para download |
| `upgrades` / `agent_upgrades` | Upgrades disponíveis e ativados |

---

## 👥 Equipe

**Nexus Affil'IA'te** — Desenvolvido pela equipe [Nexus-HUB57](https://github.com/Nexus-HUB57)

> Plataforma em evolução contínua · SaaS Early-Stage · White-Label Ready
## 🔒 Auditoria de Segurança (10/08/2026)

Varredura cirúrgica identificou **117 questões** (16 críticas, 31 altas, 34 médias, 36 baixas).

### Correções Aplicadas

| ID | Severidade | Correção |
|----|-----------|----------|
| SEC-01 | CRÍTICO | `commissions.getStats` movido para `adminProcedure` |
| SEC-02 | ALTO | `await` adicionado em `getCommissionAmount()` |
| SEC-03 | ALTO | Destruturação `pool.query()` corrigida para `rows[0]` |
| SEC-04 | MÉDIO | Warning de segurança no header auth fallback |
| SEC-05 | MÉDIO | Hooks React removidos de optional chaining (esbuild fix) |
| SEC-06 | MÉDIO | Dados financeiros mock zerados no Dashboard |
| SEC-07 | BAIXO | `useMemo` não utilizado removido |
| SEC-08 | BAIXO | Skeleton rows corrigido (5 → 10) |
| SEC-09 | BAIXO | Labels "ao vivo" → "beta" |

### Backlog de Segurança

- [ ] Remover fallback de autenticação por headers (`x-user-id`/`x-user-role`)
- [ ] Consolidar pools PostgreSQL (180+ conexões ociosas com 6 workers)
- [ ] Verificar pagamento real Pix antes de entregar em `placeStoreOrder`
- [ ] Adicionar `timingSafeEqual` em `checkPublicKey`
- [ ] Migrar JSON file stores para PostgreSQL
- [ ] Ativar `strict: true` no TypeScript
- [ ] Adicionar índices: `network(sponsorId)`, `commissions(affiliateId, status)`, `affiliates(sponsorId)`
- [ ] Code splitting com `React.lazy()` (bundle > 500KB)
- [ ] Rewriter queries N+1 na network tree (recursive CTEs)
- [ ] Adicionar autenticação nos endpoints REST `/api/admin/*`

---

## 📈 Plano de Carreira Detalhado

A plataforma possui **15 tiers** de progressão em 4 categorias e **9 tipos de bônus**.

<details>
<summary>📋 Tiers de Progressão (15 níveis)</summary>

| Nível | Título | Categoria |
|-------|--------|-----------|
| 1 | Afiliado I | Base |
| 2 | Afiliado II | Base |
| 3 | Afiliado III | Base |
| 4 | Prata I | Prata |
| 5 | Prata II | Prata |
| 6 | Prata III | Prata |
| 7 | Ouro I | Ouro |
| 8 | Ouro II | Ouro |
| 9 | Ouro III | Ouro |
| 10 | Diamante I | Diamante |
| 11 | Diamante II | Diamante |
| 12 | Diamante III | Diamante |
| 13 | Agente I | Agentic |
| 14 | Agente II | Agentic |
| 15 | Agente III | Agentic |

</details>

<details>
<summary>💎 9 Tipos de Bônus</summary>

| # | Bônus | Descrição | Status |
|---|-------|-----------|--------|
| #1 | Revenda | 100% do lucro sobre vendas diretas | ✅ Ativo |
| #2 | OnePack | Lucro por venda de 14 packs (R$ 2,50 a R$ 7.500) | ✅ Ativo |
| #3 | Consumo | 1,5% a 4% por nível da rede N.O. (12 níveis) | ✅ Ativo |
| #4 | N.O. | Bonificação por qualificação (R$ 500 a R$ 2.000) | ✅ Ativo |
| #5 | Inspiração | Referências de alto impacto | 🔜 Roadmap |
| #6 | Grafo | Densidade e conectividade da rede | 🔜 Roadmap |
| #7 | Corp | Equipes empresariais | 🔜 Roadmap |
| #8 | HARP'IA | Retenção e recorrência | 🔜 Roadmap |
| #9 | Nexus | Participação nos lucros | 🔜 Roadmap |

</details>

<details>
<summary>📦 Bônus #2 — OnePack (14 packs)</summary>

| Pack | Nome | Preço | Tier Mín. |
|------|------|-------|-----------|
| A1 | Starter | R$ 49,90 | Afiliado I |
| A2 | Plus | R$ 97,00 | Afiliado I |
| B1 | Pro | R$ 197,00 | Afiliado II |
| B2 | Pro+ | R$ 397,00 | Prata I |
| C1 | Business | R$ 597,00 | Prata II |
| C2 | Business+ | R$ 997,00 | Prata III |
| D1 | Enterprise | R$ 1.997,00 | Ouro I |
| D2 | Enterprise+ | R$ 2.997,00 | Ouro II |
| E1 | Premium | R$ 4.997,00 | Ouro III |
| E2 | Premium+ | R$ 7.497,00 | Diamante I |
| F1 | Exclusive | R$ 14.997,00 | Diamante II |
| F2 | Ultra | R$ 24.997,00 | Diamante III |
| G1 | Legendary | R$ 49.997,00 | Agente II |
| G2 | Nexus Black | R$ 99.997,00 | Agente III |

</details>

<details>
<summary>📊 Bônus #3 — Consumo (12 níveis)</summary>

| Nível N.O. | % | Acumulado |
|-----------|---|-----------|
| 1 | 1,5% | 1,5% |
| 2 | 1,5% | 3,0% |
| 3 | 2,0% | 5,0% |
| 4 | 2,0% | 7,0% |
| 5 | 2,5% | 9,5% |
| 6 | 2,5% | 12,0% |
| 7 | 3,0% | 15,0% |
| 8 | 3,0% | 18,0% |
| 9 | 3,5% | 21,5% |
| 10 | 3,5% | 25,0% |
| 11 | 4,0% | 29,0% |
| 12 | 4,0% | 33,0% |

</details>

<details>
<summary>🎯 Bônus #4 — N.O. (Network Orchestration)</summary>

| Qualificador | Novo Membro | Bônus |
|-------------|------------|-------|
| Agente I+ | Afiliado | R$ 500 |
| Agente II+ | Prata | R$ 800 |
| Diamante I+ | Ouro | R$ 1.200 |
| Diamante II+ | Diamante | R$ 1.500 |
| Agente III | Agente I | R$ 2.000 |

> **Motor**: `backend/src/domains/commissions/commissionEngine.ts` — Pure functions, 247 linhas.

</details>

---

## 📅 Calendário de Eventos da Plataforma

Integrado em `/content/calendar` — gerenciado via `ContentCalendar.tsx` + `cronRouter.ts`.

| Data | Evento | Tipo | Plataforma |
|------|--------|------|------------|
| 10/08 | Abertura Janela de Saque — Agosto | Marco | Internal |
| 15/08 | Lançamento Oficial Nexus Affil'IA | Lançamento | YouTube |
| 18/08 | Live Q&A — Perguntas dos Afiliados | Q&A | Instagram |
| 20/08 | Webinar: Plano de Carreira | Webinar | Zoom |
| 25/08 | Treinamento: Como vender packs OnePack | Treinamento | YouTube |
| 01/09 | Encontro de Lideres da Rede N.O. | Reunião | Zoom |
| 05/09 | Abertura Ciclo Comissões — Setembro | Marco | Internal |
| 10/09 | Hackathon Nexus AI — Construa seu Agente | Hackathon | Discord |
| 15/09 | Workshop: Academia IA | Workshop | YouTube |
| 01/10 | Lançamento Bônus #5 Inspiração | Lançamento | Internal |
| 15/10 | Convenção Nexus Anual 2026 | Convenção | YouTube |

---

## 🏗️ Motor de Comissões — Arquitetura

```
commissionsRouter.ts
  ├── getStats (adminProcedure) — stats financeiros protegidos
  ├── list / getById — listagem de comissões
  ├── updateStatus — aprovação/rejeição com auditoria
  └── approveBatch — aprovação em lote

commissionEngine.ts (pure functions)
  ├── CAREER_TIERS[15] — definição de tiers
  ├── PACKS[14] — packs com preço e tier mínimo
  ├── NO_BONUS_TABLE[6] — regras de bonificação N.O.
  ├── calculateOnePackBonus() — bônus por venda de pack
  ├── calculateConsumptionBonus() — bônus por consumo da rede
  └── calculateNOBonus() — bônus por qualificação

adminRouter.ts
  ├── getCareerPlanConfig — lê config do DB
  ├── updateCareerPlanConfig — atualiza config
  ├── calculateOnePackBonus — calcula para tier/pack específico
  └── calculateConsumptionBonus — calcula para tier/volumes
```

---

<p align="center">
  <strong>Nexus Affil'IA'te — AI-to-AI</strong><br/>
  <em>Transformando marketing de afiliados com inteligência autônoma distribuída</em>
</p>
