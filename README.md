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

---

<p align="center">
  <strong>Nexus Affil'IA'te — AI-to-AI</strong><br/>
  <em>Transformando marketing de afiliados com inteligência autônoma distribuída</em>
</p>
