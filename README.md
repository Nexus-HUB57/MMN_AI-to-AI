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
  <img src="https://img.shields.io/badge/versão-1.2.5-green?style=flat-square" alt="Versão" />
</p>

<h1 align="center">🤖 Nexus Affil'IA'te — AI-to-AI</h1>

<p align="center">
  <sub><code>v1.2.5</code> · <code>build 22966807</code> · <code>2026-08-10</code></sub>
</p>

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

## 📈 Plano de Carreira do Afiliado

A plataforma possui **15 tiers de progressão** organizados em 4 categorias, com **9 tipos de bônus** progressivos.

### Tiers de Progressão

| Nível | Título | Categoria | Requisitos |
|-------|--------|-----------|------------|
| 1 | **Afiliado I** | Base | Cadastro completo na plataforma |
| 2 | **Afiliado II** | Base | 5 indicações diretas ativas |
| 3 | **Afiliado III** | Base | 10 indicações + R$ 500 em vendas pessoais |
| 4 | **Prata I** | Prata | 25 indicações + R$ 2.000 em vendas |
| 5 | **Prata II** | Prata | 50 indicações + R$ 5.000 em vendas |
| 6 | **Prata III** | Prata | 100 indicações + R$ 10.000 em vendas |
| 7 | **Ouro I** | Ouro | Rede com 500+ membros + R$ 25.000 volume |
| 8 | **Ouro II** | Ouro | Rede com 1.000+ membros + R$ 50.000 volume |
| 9 | **Ouro III** | Ouro | Rede com 2.500+ membros + R$ 100.000 volume |
| 10 | **Diamante I** | Diamante | Rede com 5.000+ membros + R$ 250.000 volume |
| 11 | **Diamante II** | Diamante | Rede com 10.000+ membros + R$ 500.000 volume |
| 12 | **Diamante III** | Diamante | Rede com 25.000+ membros + R$ 1M volume |
| 13 | **Agente I** | Agentic | Qualificação completa + orquestração ativa |
| 14 | **Agente II** | Agentic | 3 sub-redes qualificadas |
| 15 | **Agente III** | Agentic | Nível máximo — governança da rede |

### 9 Tipos de Bônus

| # | Bônus | Descrição | Status |
|---|-------|-----------|--------|
| **#1** | **Revenda** | 100% do lucro sobre produtos vendidos diretamente | ✅ Ativo |
| **#2** | **OnePack** | Lucro por venda de packs (14 packs, R$ 2,50 a R$ 7.500 por tier) | ✅ Ativo |
| **#3** | **Consumo** | 1,5% a 4% por nível da rede N.O. (12 níveis de profundidade) | ✅ Ativo |
| **#4** | **N.O. (Network Orchestration)** | Bonificação fixa por qualificação de novos membros (R$ 500 a R$ 2.000) | ✅ Ativo |
| **#5** | **Inspiração** | Bônus por referências de alto impacto | 🔜 Roadmap |
| **#6** | **Grafo** | Bônus por densidade e conectividade da rede | 🔜 Roadmap |
| **#7** | **Corp** | Bônus corporativo para equipes empresariais | 🔜 Roadmap |
| **#8** | **HARP'IA** | Bônus por retenção e recorrência | 🔜 Roadmap |
| **#9** | **Nexus** | Bônus máximo — participação nos lucros da plataforma | 🔜 Roadmap |

#### Bônus #2 — OnePack (Detalhes)

| Pack | Nome | Preço | Tier Mínimo |
|------|------|-------|-------------|
| Pack A1 | Starter | R$ 49,90 | Afiliado I |
| Pack A2 | Plus | R$ 97,00 | Afiliado I |
| Pack B1 | Pro | R$ 197,00 | Afiliado II |
| Pack B2 | Pro+ | R$ 397,00 | Prata I |
| Pack C1 | Business | R$ 597,00 | Prata II |
| Pack C2 | Business+ | R$ 997,00 | Prata III |
| Pack D1 | Enterprise | R$ 1.997,00 | Ouro I |
| Pack D2 | Enterprise+ | R$ 2.997,00 | Ouro II |
| Pack E1 | Premium | R$ 4.997,00 | Ouro III |
| Pack E2 | Premium+ | R$ 7.497,00 | Diamante I |
| Pack F1 | Exclusive | R$ 14.997,00 | Diamante II |
| Pack F2 | Ultra | R$ 24.997,00 | Diamante III |
| Pack G1 | Legendary | R$ 49.997,00 | Agente II |
| Pack G2 | Nexus Black | R$ 99.997,00 | Agente III |

#### Bônus #3 — Consumo (12 Níveis)

| Nível N.O. | Percentual | Acumulado Máx. |
|-----------|-----------|----------------|
| Nível 1 | 1,5% | 1,5% |
| Nível 2 | 1,5% | 3,0% |
| Nível 3 | 2,0% | 5,0% |
| Nível 4 | 2,0% | 7,0% |
| Nível 5 | 2,5% | 9,5% |
| Nível 6 | 2,5% | 12,0% |
| Nível 7 | 3,0% | 15,0% |
| Nível 8 | 3,0% | 18,0% |
| Nível 9 | 3,5% | 21,5% |
| Nível 10 | 3,5% | 25,0% |
| Nível 11 | 4,0% | 29,0% |
| Nível 12 | 4,0% | 33,0% |

#### Bônus #4 — N.O. (Network Orchestration)

| Qualificador | Novo Membro | Bônus |
|-------------|------------|-------|
| Agente I+ | Afiliado | R$ 500 |
| Agente II+ | Prata | R$ 800 |
| Diamante I+ | Ouro | R$ 1.200 |
| Diamante II+ | Diamante | R$ 1.500 |
| Agente III | Agente I | R$ 2.000 |

> **Motor de Cálculo**: `backend/src/domains/commissions/commissionEngine.ts` — Implementação pure-function com 247 linhas, sem efeitos colaterais, com `CAREER_TIERS`, `PACKS`, `NO_BONUS_TABLE` e funções `calculateOnePackBonus()`, `calculateConsumptionBonus()`, `calculateNOBonus()`.

---

## 📅 Calendário de Eventos

A plataforma possui um calendário integrado (`/content/calendar`) com eventos oficiais, treinamentos e marcos do ecossistema. Gerenciado via `ContentCalendar.tsx` + backend `cronRouter.ts`.

### Eventos Oficiais Agendados

| Data | Evento | Tipo | Plataforma |
|------|--------|------|------------|
| 10/08/2026 | Abertura Janela de Saque — Agosto/26 | Marco | Internal |
| 15/08/2026 | Lancamento Oficial Nexus Affil'IA | Lancamento | YouTube |
| 18/08/2026 | Live Q&A — Perguntas dos Afiliados | Q&A | Instagram |
| 20/08/2026 | Webinar: Plano de Carreira — Bonus e Comissoes | Webinar | Zoom |
| 25/08/2026 | Treinamento: Como vender packs OnePack | Treinamento | YouTube |
| 01/09/2026 | Encontro de Lideres da Rede N.O. | Reuniao | Zoom |
| 05/09/2026 | Abertura Ciclo Comissoes — Setembro | Marco | Internal |
| 10/09/2026 | Hackathon Nexus AI — Construa seu Agente | Hackathon | Discord |
| 15/09/2026 | Workshop: Academia IA — Criacao de Conteudo | Workshop | YouTube |
| 01/10/2026 | Lancamento Bonus #5 Inspiracao | Lancamento | Internal |
| 10/10/2026 | Fechamento Ciclo Comissoes — Agosto | Marco | Internal |
| 15/10/2026 | Convencao Nexus Anual 2026 | Convencao | YouTube |

> **Tipos de evento**: Lancamento, Webinar, Treinamento, Reuniao, Marco, Workshop, Hackathon, Convencao, Q&A. Cada tipo possui cor e badge especificos no calendario visual.


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
| `PORT` | Porta do backend (produção: 3001, dev: 3000) | Sim |
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
npm run dev:backend    # tRPC na porta 3001 (produção) / 3000 (dev)

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
| `cron` | Agendador de tarefas e jobs recorrentes |
| `affiliateStore` | Loja do afiliado (produtos próprios + externos) |

### Motor de Comissões (`commissionEngine.ts`)

Arquivo: `backend/src/domains/commissions/commissionEngine.ts` (247 linhas)

```
CAREER_TIERS (15 tiers) ──► canSellPack(tier, packSlug)
PACKS (14 packs)        ──► calculateOnePackBonus(sellerTier, packSlug, config, isActive)
NO_BONUS_TABLE (6 rules) ──► calculateNOBonus(qualifierTier, newMemberTier, config)
                            ──► calculateConsumptionBonus(sellerTier, monthlyVolumes, config, isActive)
TIER_ORDER / getTierRank() ──► Utilidades de hierarquia
```

Design: **Pure functions**, zero efeitos colaterais, determinístico. O engine recebe configurações do `platform_settings` (via `admin.getCareerPlanConfig`) e calcula bônus sem acessar banco diretamente. Isso permite testes unitários sem mock de DB e auditoria determinística.

Integração com tRPC:
- `admin.getCareerPlanConfig` — Lê configurações atuais do DB
- `admin.updateCareerPlanConfig` — Atualiza configurações (admin-only)
- `admin.calculateOnePackBonus` — Calcula bônus OnePack para um tier/pack específico
- `admin.calculateConsumptionBonus` — Calcula bônus Consumo para um tier/volumes

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


---

## 🔒 Auditoria de Segurança

Varredura cirúrgica realizada em 10/08/2026 identificando **117 questões** (16 críticas, 31 altas, 34 médias, 36 baixas).

### Itens Corrigidos
| ID | Severidade | Correção |
|----|-----------|----------|
| SEC-01 | CRÍTICO | `commissions.getStats` movido de `publicProcedure` para `adminProcedure` — dados financeiros não são mais expostos publicamente |
| SEC-02 | ALTO | `await` adicionado em `getCommissionAmount()` no `publishCommissionPaid` — Promise não era resolvida antes do envio |
| SEC-03 | ALTO | Destruturação de `pool.query()` corrigida para `poolRes.rows[0]` — padrão seguro e explícito |
| SEC-04 | MÉDIO | Warning de segurança adicionado ao fallback de autenticação por headers (`x-user-id`/`x-user-role`) — deve ser removido quando frontend migrar para Firebase-only |
| SEC-05 | BAIXO | `useMemo` não utilizado removido de `AdminDashboard.tsx` |
| SEC-06 | BAIXO | Skeleton rows corrigido para 10 (matching table `limit: 10`) |
| SEC-07 | MÉDIO | `DashboardXpBadge` e `RealCostCenter` — hooks React removidos de chamadas via optional chaining (violava Rules of Hooks, causava erro de build) |
| SEC-08 | MÉDIO | Dados financeiros mock no Dashboard (`totalBalanceBrl = 3450`) zerados e marcados como pendentes de integração com API real |
| SEC-09 | BAIXO | Labels "ao vivo" no Dashboard substituídas por "beta" — dados não são tempo real |

### Backlog de Segurança (planejado)
- [ ] Remover fallback de autenticação por headers (C-01: risco de impersonação)
- [ ] Consolidar pools PostgreSQL (atualmente 3+ por worker × 6 workers = 180+ conexões)
- [ ] Mover `placeStoreOrder` para verificar pagamento real Pix antes de entregar (C-04)
- [ ] Adicionar `timingSafeEqual` em `checkPublicKey` (H-07)
- [ ] Migrar JSON file stores (`store-orders.json`, `store-external-products.json`) para PostgreSQL
- [ ] Ativar `strict: true` no TypeScript (ambos frontend e backend)
- [ ] Adicionar índices nas tabelas `network(sponsorId)`, `commissions(affiliateId, status)`, `affiliates(sponsorId)`
- [ ] Adicionar code splitting com `React.lazy()` no frontend (bundle atual > 500KB)
- [ ] Rewriter queries N+1 na network tree (recursive CTEs)
- [ ] Adicionar autenticação nos endpoints REST `/api/admin/*` e `/api/marketplace/*`
---

## 👥 Equipe

**Nexus Affil'IA'te** — Desenvolvido pela equipe [Nexus-HUB57](https://github.com/Nexus-HUB57)

> Plataforma em evolução contínua · SaaS Early-Stage · White-Label Ready

---

<p align="center">
  <strong>Nexus Affil'IA'te — AI-to-AI</strong><br/>
  <em>Transformando marketing de afiliados com inteligência autônoma distribuída</em>
</p>
