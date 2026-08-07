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

<h1 align="center">Nexus Affil'IA'te — AI-to-AI</h1>

<p align="center">
  <strong>Infraestrutura Operacional de Inteligência Distribuída</strong><br/>
  Plataforma de Marketing de Afiliados impulsionada por Agentes de IA autônomos
</p>

---

## Sobre o Projeto

O **Nexus Affil'IA'te** é um ecossistema SaaS que une **Multilevel Marketing (MMN)** com **Agentes de IA autônomos** operando 24/7 em uma arquitetura AI-to-AI. A plataforma evoluiu de um sistema legado PHP para uma stack moderna full-stack, mantendo compatibilidade com dados existentes.

> **Diferencial Principal** — Nao é apenas uma plataforma MMN tradicional, mas uma **infraestrutura operacional de agentes autônomos de IA** aplicados a marketing, vendas e operação distribuída.

**Modelo Híbrido**: Intervenção humana propositiva + Agentes IA 100% autônomos no operacional, seguindo o **SHO — Sistema Híbrido de Orquestração** em evolução contínua para **AOI — Autonomous Operational Intelligence**.

**Website**: [oneverso.com.br](https://www.oneverso.com.br)

---

## Arquitetura

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

## Estrutura do Projeto

<details>
<summary>Arvore de diretorios</summary>

```
MMN_AI-to-AI/
├── frontend/                   # React 18 + Vite + Tailwind + tRPC Client
│   └── src/pages/              # 90+ paginas (Admin, Dashboard, Marketplace...)
├── backend/                    # Node.js + tRPC + Drizzle + Workers
│   └── src/
│       ├── routers/            # 60+ routers tRPC
│       ├── workers/            # BullMQ workers (content, commissions, orders, marketplace)
│       ├── services/           # Logica de negocio
│       ├── integrations/       # Hotmart, Shopee, WhatsApp, Resend, Facebook
│       ├── agentic/            # Orquestracao de Agentes IA
│       ├── genkit/             # Google Genkit flows
│       └── drizzle/schema.ts   # Schema central
├── database/schemas/           # Schemas Drizzle (16+ arquivos)
├── infra/                      # Docker Compose, deploy scripts
├── mobile/                     # Expo (React Native)
├── docs/                       # Documentacao
├── tests/                      # Vitest (unit + integration)
├── deploy/                     # Scripts de deploy (Hostgator VPS)
├── packs/                      # Definicao de Packs / Ativacoes
├── AcademIA/                   # Conteudo EAD
├── ai/                         # Scripts e configs de IA
├── scripts/                    # Utilitarios
├── ecosystem.config.js         # PM2 config (API + 4 workers)
├── drizzle.config.ts           # Drizzle Kit config
├── .env.example                # Template de variaveis de ambiente
├── pnpm-workspace.yaml         # Workspaces (frontend, backend, mobile)
└── package.json                # Monorepo root
```

</details>

---

## Funcionalidades Principais

### Admin Dashboard
Painel administrativo completo com gestao de usuarios, rede, comissoes, aprovacoes, materiais, agendamentos, governanca e orquestracao de agentes.

### Gestao de Rede (MMN)
Estrutura de rede multinivel com codigo de afiliado, patrocinador, visualizacao em arvore, relatorios de profundidade e metricas de ativacao mensal.

### Sistema de Comissoes & Plano de Carreira
Calculo automatico de comissoes multinivel com 5 faixas de carreira, bonus de ativacao, bonus de profundidade e bonus especiais. Processamento via BullMQ worker dedicado.

### Marketplace Nexus
Integracao com **Hotmart** e **Shopee Afiliados** — sync automatico de produtos, analise de tendencias (trending score, sazonalidade, lucratividade), margens de afiliado e loja personalizada.

### Pix Checkout
Sistema de checkout via Pix para ativacoes de pacotes, com geracao de QR Code, controle de expiracao e confirmacao de pagamento.

### Agentes IA — Lab Nexus
Plataforma de criacao e gestao de agentes autonomos de IA com skills configuraveis, runtime de execucao, orquestracao de goals e metricas de performance. Integracao com OpenAI, Genkit e LangChain.

### Academia EAD
Plataforma de ensino a distancia com modulos, aulas, rastreamento de progresso e certificacoes para capacitacao de afiliados.

### Sistema de Packs
Pacotes de ativacao com entitlements, upgrades de agentes e liberacao progressiva de funcionalidades conforme o plano.

### Geracao de Conteudo IA
Hub de criacao de conteudo para redes sociais com templates, agendamento de posts, analise de engajamento e dispatch para WhatsApp, Facebook e e-mail.

---

## Plano de Carreira

A plataforma possui 5 faixas de progressao com recompensas crescentes:

| Faixa | Titulo | Descricao |
|-------|--------|----------|
| 1 | **Agente Afiliado** | Entrada no ecossistema — acesso basico ao marketplace e ferramentas |
| 2 | **Agente Conector** | Rede em crescimento — bonus de profundidade N2 habilitado |
| 3 | **Agente Gestor** | Gestao de equipe — bonus de lideranca e materiais avancados |
| 4 | **Agente Estrategista** | Estrategia avancada — Lab Nexus completo e orquestracao IA |
| 5 | **Agente Agentic IA** | Nivel maximo — acesso total, comissoes maximizadas, API aberta |

**Tipos de Bonus:**
- **Bonus Direto** — Comissao sobre vendas pessoais
- **Bonus de Profundidade** — Comissoes multinivel (N1 a N5)
- **Bonus de Ativacao** — Recompensa por metas de rede
- **Bonus de Lideranca** — Premiacao por performance da equipe
- **Bonus Especial** — Incentivos sazonais e campanhas

---

## Configuracao e Deploy

### Pre-requisitos
- **Node.js** >= 20
- **PostgreSQL** 15+
- **Redis** (opcional, standalone funciona sem)
- **pnpm** ou **npm** 9+

### Instalacao

```bash
git clone https://github.com/Nexus-HUB57/MMN_AI-to-AI.git
cd MMN_AI-to-AI
npm run install:workspaces
cp .env.example .env
npm run db:push
```

### Variaveis de Ambiente Principais

| Variavel | Descricao | Obrigatoria |
|----------|-----------|-------------|
| `NODE_ENV` | `development` / `production` | Sim |
| `PORT` | Porta do backend (default: 3000) | Sim |
| `DATABASE_URL` | Connection string PostgreSQL | Sim |
| `REDIS_URL` | Connection string Redis | Nao* |
| `ADMIN_SESSION_SECRET` | Chave secreta para sessoes admin | Sim |
| `ADMIN_EMAIL_SHA256` | SHA256 do email admin autorizado | Sim |
| `ADMIN_PASSWORD_SHA256` | SHA256 da senha admin autorizada | Sim |
| `FIREBASE_PROJECT_ID` | Projeto Firebase | Sim |
| `FIREBASE_CLIENT_EMAIL` | Service account Firebase | Sim |
| `FIREBASE_PRIVATE_KEY` | Chave privada Firebase | Sim |
| `OPENAI_API_KEY` | API Key OpenAI (para Agentes IA) | Nao** |
| `VITE_FIREBASE_API_KEY` | Firebase Client SDK | Sim |
| `VITE_TRPC_URL` | URL do backend tRPC | Sim |

> \* Standalone funciona sem Redis, mas filas BullMQ nao operam.  
> \*\* Sem OpenAI, o sistema usa heuristica como fallback.

### Desenvolvimento Local

```bash
npm run dev                # Frontend + Backend simultaneamente
npm run dev:frontend       # Vite na porta 5173
npm run dev:backend        # tRPC na porta 3000
npm run db:studio          # Visualizador de banco
```

### Build de Producao

```bash
npm run build:production
pm2 start ecosystem.config.js --env production
```

### Deploy com PM2

O `ecosystem.config.js` configura 5 processos:

| Processo | Script | Modo | Instancias |
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

## API — Visao Geral tRPC

A API e servida via **tRPC v11** em `/api/trpc`. Principais routers:

| Router | Descricao |
|--------|----------|
| `admin` | Dashboard, gestao de usuarios, rede, pagamentos |
| `adminAuth` | Autenticacao admin (SHA256 session) |
| `auth` | Login/registro via Firebase Auth |
| `commissions` | Calculo e listagem de comissoes |
| `network` / `networkExtended` | Arvore de indicacoes, metricas de rede |
| `marketplace` / `marketplaceNexus` | Produtos, tendencias, sync de marketplaces |
| `payments` / `pix` / `pixHistory` | Checkout Pix, saques, historico |
| `labNexus` | Criacao e gestao de Agentes IA |
| `agentRuntime` / `agentSkills` | Execucao e skills de agentes |
| `agentic` / `orchestration` | Orquestracao e goals de agentes |
| `packs` / `packEntitlements` | Sistema de pacotes e ativacoes |
| `academiaEad` / `academiaPublic` | Plataforma EAD |
| `contentGeneration` / `aiContentHub` | Geracao de conteudo com IA |
| `social` / `postScheduler` | Postagem em redes sociais |
| `users` / `profile` | Perfil e dados do usuario |
| `upgrades` / `skills` / `skillsMarketplace` | Upgrades e marketplace de skills |
| `health` | Health check do sistema |
| `dropshipping` | Gestao de dropshipping |
| `billing` | Faturamento e assinaturas |

---

## Banco de Dados — Tabelas Principais

| Tabela | Descricao |
|--------|----------|
| `users` | Usuarios do sistema (Firebase Auth + legado) |
| `affiliates` | Dados de afiliado (codigo, patrocinador, comissoes, pontos) |
| `network` | Relacoes de rede (userId, sponsorId, nivel) |
| `commissions` | Registro de comissoes (nivel, fonte, status) |
| `bonuses` | Bonus especiais (tipo, valor, status) |
| `products` | Produtos sincronizados de marketplaces |
| `orders` | Pedidos de vendas (Hotmart, Shopee) |
| `payments` / `pix_history` | Pagamentos e saques via Pix |
| `marketplace_accounts` | Credenciais de integracao com marketplaces |
| `marketplace_products_ext` | Produtos estendidos com metricas de tendencia |
| `product_trends` | Analise de tendencia (score, sazonalidade, demanda) |
| `affiliate_margins` | Margens e estimativa de ganhos por afiliado |
| `agents` | Agentes IA de cada usuario (status, score, estrategia) |
| `activation_packs` / `pack_activations` | Pacotes e ativacoes de features |
| `content_templates` / `scheduled_posts` | Templates de conteudo e agendamentos |
| `generated_content` / `content_analytics` | Conteudo gerado por IA e metricas |
| `orchestration_goals` / `orchestration_tasks` | Orquestracao de agentes IA |
| `job_logs` / `performance_metrics` | Logs e metricas de workers BullMQ |
| `notifications` | Centro de notificacoes |
| `materials` | Materiais de marketing para download |
| `upgrades` / `agent_upgrades` | Upgrades disponiveis e ativados |

---

## Equipe

**Nexus Affil'IA'te** — Desenvolvido pela equipe [Nexus-HUB57](https://github.com/Nexus-HUB57)

> Plataforma em evolucao continua · SaaS Early-Stage · White-Label Ready

---

<p align="center">
  <strong>Nexus Affil'IA'te — AI-to-AI</strong><br/>
  <em>Transformando marketing de afiliados com inteligência autonoma distribuida</em>
</p>
