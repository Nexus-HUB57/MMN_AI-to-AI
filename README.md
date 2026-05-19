# Nexus System AfilIAte-AI

> Ecossistema de Marketing Multinível (MMN) no sistema híbrido de orquestração, onde o usuário/peer se cadastra e ajusta as funcionalidades operacionais e skills dos Agentes IA autônomos, numa operação singular operando em arquitetura de alta integridade. Sistema fusionado do legado PHP com stack moderna React/TypeScript.

## Documentação Canônica

⚠️ **IMPORTANTE:** Para uma visão completa e atualizada do sistema, consulte a **Documentação Canônica**:

📄 **[DOCUMENTAÇÃO CANÔNICA](docs/canonical/DOCUMENTACAO_CANONICA.md)**

Esta documentação centraliza todas as informações do sistema em um único documento de referência, incluindo:
- Visão Geral do Sistema
- Sistema MMN (Comissões e Carreiras)
- Painel Administrativo e RBAC
- Painel do Afiliado
- Agentes e Skills
- Marketplace Nexus
- Nível de Autonomia
- Potencial de Mercado
- Stack Tecnológica Completa
- Guia de Início Rápido
- Roadmap e Conformidade

**Análise Técnica Detalhada:**
📊 [Análise Técnica Fundamentalista v2.0](ANALISE_TECNICA_FUNDAMENTALISTA_v2.md)

---

## Status do Projeto

![Stage](https://img.shields.io/badge/Stage-MVP%2B-green)
![Conformidade](https://img.shields.io/badge/Conformidade-85--90%25-green)
![License](https://img.shields.io/badge/License-MIT-green)
![Agentic](https://img.shields.io/badge/Agentic-Layer-7C3AED)
![XP](https://img.shields.io/badge/XP%2FCarreiras-Implemented-blue)
![v1.0.8](https://img.shields.io/badge/v1.0.8-2026--05--20-blue)

**Aviso**: Este projeto está em desenvolvimento ativo. Algumas funcionalidades descritas neste documento estão em implementação ou planejadas para fases futuras.

## Revisão Atual do Sistema

A revisão técnica consolidada do estado atual do repositório está em:

- [`docs/repository-review/ANALISE_TECNICA_SISTEMA_ATUAL.md`](docs/repository-review/ANALISE_TECNICA_SISTEMA_ATUAL.md)
- [`docs/repository-review/RESUMO_EXECUTIVO_SISTEMA_ATUAL.md`](docs/repository-review/RESUMO_EXECUTIVO_SISTEMA_ATUAL.md)
- [`docs/repository-review/CONSOLIDACAO_DOCUMENTAL_FASE2.md`](docs/repository-review/CONSOLIDACAO_DOCUMENTAL_FASE2.md)
- [`docs/repository-review/ORQUESTRADOR_DASHBOARD_AVALIACAO.md`](docs/repository-review/ORQUESTRADOR_DASHBOARD_AVALIACAO.md)
- [`docs/repository-review/MAPA_ROTAS_E_UNIFICACAO_FRONTEND.md`](docs/repository-review/MAPA_ROTAS_E_UNIFICACAO_FRONTEND.md)
- [`docs/repository-review/README.md`](docs/repository-review/README.md)
- [`docs/README.md`](docs/README.md)

## Backoffice Admin MMN AI-to-AI

Para iniciar o desenvolvimento do Backoffice Admin, a trilha oficial desta etapa está em:

- [`docs/admin-backoffice/README.md`](docs/admin-backoffice/README.md)
- [`docs/admin-backoffice/PLANO_EXECUCAO_EM_FASES.md`](docs/admin-backoffice/PLANO_EXECUCAO_EM_FASES.md)
- [`docs/admin-backoffice/BACKLOG_INICIAL.md`](docs/admin-backoffice/BACKLOG_INICIAL.md)
- [`docs/admin-backoffice/INVENTARIO_ATUAL.md`](docs/admin-backoffice/INVENTARIO_ATUAL.md)
- [`docs/admin-backoffice/FASE_1_ENTREGA_INICIAL.md`](docs/admin-backoffice/FASE_1_ENTREGA_INICIAL.md)

## Stack Tecnológica

| Categoria | Tecnologia | Versão |
|-----------|------------|--------|
| **Frontend Web** | React 18 + Vite + wouter (router) + TailwindCSS + TanStack Query | ^18.3.1 / ^6.0.7 |
| **Backend** | Node.js + TypeScript + tRPC v11 | ^22.10.0 |
| **Banco de Dados** | MySQL (Drizzle ORM) + Redis + BullMQ | ^0.38.4 / ^5.28.2 |
| **Mobile** | React Native + Expo Router (diretório `mobile/`) | 0.78.0 / ~54 |
| **IA** | Google Genkit (Gemini) + OpenAI | ^1.0.0 / ^4.77.0 |
| **Auth** | JWT (Firebase/NextAuth no roadmap) | - |

## Avanços Recentes (v1.0.4)

### ✅ Migração Legacy → Sistema Oficial

| Funcionalidade | Status | Descrição |
|---------------|--------|-----------|
| Newsletter System | ✅ Migrado | Subscribe/Unsubscribe/List com endpoints tRPC |
| CMS Pages | ✅ Migrado | CRUD de páginas dinâmicas com meta tags |
| Billing System | ✅ Migrado | Faturas, itens e histórico de cobrança |
| Database Schemas | ✅ Criados | Tabelas para newsletters, cms_pages, invoices |

### ✅ Sistema de XP/Carreiras Implementado

| Componente | Status | Descrição |
|------------|--------|-----------|
| Schema de Carreiras | ✅ Implementado | 27 níveis organizados em 5 categorias |
| Cálculo de XP | ✅ Implementado | XP por vendas, comissões e bônus |
| Progressão Automática | ✅ Implementado | Cálculo de nível baseado em XP total |
| Leaderboard | ✅ Implementado | Top 10 afiliados por XP |
| Histórico de XP | ✅ Implementado | Transações detalhadas |
| Dashboard com Métricas Reais | ✅ Implementado | Dados reais do banco de dados |

### ✅ Camada Agentic Implementada

| Componente | Status | Descrição |
|------------|--------|-----------|
| Persistência de Sessões | ✅ Implementado | Gradual para sessões e memória agentic |
| Monitoramento | ✅ Implementado | Camada de monitoramento e orquestração |
| Orquestração Multi-Agente | ✅ Implementado | Infraestrutura de coordenação |
| Logs de Auditoria | ✅ Implementado | Rastreamento completo de operações |

## Como Iniciar

### 1. Preparação

Pré-requisitos validados:
- Node.js 20+
- npm 10+
- Docker Desktop ou Docker Engine (opcional, para MySQL/Redis locais)

```bash
git clone https://github.com/Nexus-HUB57/MMN_AI-to-AI.git
cd MMN_AI-to-AI

# Instalação do monorepo (raiz + workspaces)
npm install

# Se houver problemas com workspaces npm, instale manualmente:
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
cd mobile && npm install && cd ..
```

> **Nota**: Em alguns ambientes, o npm workspaces pode apresentar limitações. Se `npm install` não instalar as dependências dos workspaces, execute `npm install` diretamente em cada diretório (`backend/`, `frontend/`, `mobile/`).

### 2. Infraestrutura (Docker)

```bash
npm run infrastructure:up      # docker compose up -d
npm run infrastructure:logs    # acompanhar logs
npm run infrastructure:down   # derrubar containers
```

### 3. Banco de Dados

```bash
npm run db:generate    # drizzle-kit generate
npm run db:migrate     # drizzle-kit migrate
npm run db:push        # drizzle-kit push (para desenvolvimento)
```

### 4. Variáveis de Ambiente

Copie `.env.example` para `.env` e preencha:
- `DATABASE_URL` → string MySQL
- `REDIS_URL` → redis://localhost:6379
- `OPENAI_API_KEY`, `JWT_SECRET`, `MYSQL_ROOT_PASSWORD`, `PORT`

### 5. Execução em Desenvolvimento

```bash
# Frontend + Backend juntos
npm run dev

# Separadamente:
npm run dev:frontend    # Vite dev server (porta 5173)
npm run dev:backend     # tsx watch do backend/src/index.ts
npm run dev:mobile      # Expo dev server

# Workers BullMQ
npm --workspace backend run worker:content
npm --workspace backend run worker:commissions
npm --workspace backend run worker:marketplace
npm --workspace backend run worker:orders

# Genkit dev (Gemini)
npm run genkit:dev
```

### 6. Build de Produção

```bash
npm run build
npm run start
```

## Funcionalidades Implementadas

### ✅ Funcionalidades Core

| Funcionalidade | Status | Descrição |
|----------------|--------|-----------|
| Stack Tecnológica | ✅ Completo | React + Vite + tRPC + TailwindCSS + Drizzle + MySQL + Redis + BullMQ |
| Autenticação JWT | ✅ Funcional | Contexto tRPC com JWT implementado |
| Sistema MMN Básico | ✅ Funcional | Comissões em cascata até 15 níveis, compressão dinâmica |
| Marketplaces | ✅ Parcial | Mercado Livre, Shopee, Hotmart integrados |
| Roteador LLM | ✅ Funcional | Google Genkit (Gemini) + OpenAI |
| Content Generation | ✅ Parcial | Textos, variações, hashtags, sentimento |
| Dropshipping | ✅ Funcional | Pedidos, tracking, integrações marketplace |
| Upgrades/Skills | ✅ Funcional | Sistema de upgrades com tipos e preços |
| Frontend React | ✅ Funcional | ~55 páginas/components, Dashboard, layouts |
| Orquestração Agentic | ✅ Funcional | Camada de coordenação multi-agente |

### ✅ Sistema de Newsletter (Migrado do Legacy)

| Componente | Status | Descrição |
|------------|--------|-----------|
| Inscrição | ✅ Implementado | Formulário de cadastro com email/nome |
| Cancelamento | ✅ Implementado | Endpoint para unsubscribe |
| Listagem Admin | ✅ Implementado | Listar inscritos com filtros |
| Estatísticas | ✅ Implementado | Contador de inscritos ativos/total |

**Endpoints tRPC:**
- `newsletter.subscribe` - Inscrever email
- `newsletter.unsubscribe` - Cancelar inscrição
- `newsletter.list` - Listar inscritos (admin)
- `newsletter.getByEmail` - Buscar por email
- `newsletter.count` - Estatísticas

### ✅ Sistema de CMS Pages (Migrado do Legacy)

| Componente | Status | Descrição |
|------------|--------|-----------|
| CRUD de Páginas | ✅ Implementado | Criar, editar, deletar páginas |
| Slugs Únicos | ✅ Implementado | URLs amigáveis por página |
| Meta Tags | ✅ Implementado | Title e description SEO |
| Categorias | ✅ Implementado | Organização por categoria |
| Status | ✅ Implementado | draft/published/archived |

**Endpoints tRPC:**
- `cms.getPage` - Buscar página pública (slug)
- `cms.list` - Listar páginas (admin)
- `cms.create` - Criar página
- `cms.update` - Atualizar página
- `cms.delete` - Deletar página
- `cms.getCategories` - Listar categorias

### ✅ Sistema de Billing/Faturas (Migrado do Legacy)

| Componente | Status | Descrição |
|------------|--------|-----------|
| Faturas | ✅ Implementado | Criação e gestão de faturas |
| Itens de Fatura | ✅ Implementado | Múltiplos itens por fatura |
| Status Workflow | ✅ Implementado | pending/paid/overdue/cancelled |
| Histórico | ✅ Implementado | Log de todas as ações |
| Estatísticas Admin | ✅ Implementado | Totais por status |
| Callback Pagamento | ✅ Implementado | Confirmação de gateway |

**Endpoints tRPC:**
- `billing.getInvoice` - Buscar fatura por ID
- `billing.listInvoices` - Listar faturas do usuário
- `billing.createInvoice` - Criar fatura (admin)
- `billing.updateInvoiceStatus` - Atualizar status
- `billing.getHistory` - Histórico de ações
- `billing.getStats` - Estatísticas (admin)
- `billing.confirmPayment` - Callback de pagamento

### ✅ Marketplace Nexus (100%)

| Componente | Status | Descrição |
|------------|--------|-----------|
| Schema do Banco | ✅ Implementado | Tabelas para produtos, pedidos, cupons, wishlists |
| Router tRPC | ✅ Implementado | 15+ endpoints para CRUD de produtos, pedidos, cupons |
| Catálogo | ✅ Implementado | Grid de produtos com filtros, busca e paginação |
| Carrinho | ✅ Implementado | Gerenciamento de itens, cupons, cálculos |
| Detalhe do Produto | ✅ Implementado | Galeria de imagens, variações, avaliações |
| Checkout | ✅ Implementado | Fluxo completo com endereço, envio e pagamento |

**Endpoints tRPC:**
- `marketplace.listProducts` - Listar produtos com filtros
- `marketplace.getProduct` - Buscar produto por slug
- `marketplace.createProduct` - Criar produto (admin)
- `marketplace.updateProduct` - Atualizar produto
- `marketplace.listCategories` - Listar categorias
- `marketplace.createCategory` - Criar categoria
- `marketplace.listOrders` - Listar pedidos
- `marketplace.getOrder` - Buscar pedido
- `marketplace.createOrder` - Criar pedido
- `marketplace.updateOrderStatus` - Atualizar status
- `marketplace.listProductReviews` - Listar avaliações
- `marketplace.createReview` - Criar avaliação
- `marketplace.moderateReview` - Moderar avaliação (admin)
- `marketplace.listCoupons` - Listar cupons
- `marketplace.createCoupon` - Criar cupom
- `marketplace.validateCoupon` - Validar cupom
- `marketplace.getDashboardStats` - Estatísticas (admin)

**Componentes Frontend:**
- `MarketplaceProductCard.tsx` - Card de produto com hover, galeria, wishlist
- `MarketplaceCatalog.tsx` - Catálogo com filtros, busca, ordenação, paginação
- `MarketplaceCart.tsx` - Carrinho com gerenciamento de itens e cupons
- `MarketplaceProductDetail.tsx` - Página de detalhes com galeria, variações, reviews
- `MarketplaceCheckout.tsx` - Fluxo de checkout completo em 5 etapas

### ✅ Sistema BeYour Banker (100%)

| Componente | Status | Descrição |
|-----------|--------|-----------|
| Saldo do Afiliado | ✅ Implementado | Saldo disponível, pendente e bloqueado |
| Contas Bancárias | ✅ Implementado | CADASTRO de contas com PIX |
| Solicitações de Saque | ✅ Implementado | Workflow completo (pendente → aprovado → processado) |
| Histórico de Transações | ✅ Implementado | Log completo de todas operações |
| Relatórios Mensais | ✅ Implementado | Relatórios consolidados |
| Admin Panel | ✅ Implementado | Aprovação e processamento de saques |

### ✅ Sistema de Posts Automatizados (100%)

| Componente | Status | Descrição |
|-----------|--------|-----------|
| Contas Sociais | ✅ Implementado | Vinculação WhatsApp, Instagram, Facebook |
| Calendário de Posts | ✅ Implementado | Agendamento e gerenciamento |
| Horários de Pico | ✅ Implementado | Recomendações de horários |
| Tracking de Links | ✅ Implementado | UTM e rastreamento de cliques |
| Métricas de Performance | ✅ Implementado | Análise por canal e campanha |

### ✅ Sistema de Tracking Neural (100%)

| Componente | Status | Descrição |
|-----------|--------|-----------|
| Links de Rastreamento | ✅ Implementado | Short codes únicos por afiliado |
| Eventos de Conversão | ✅ Implementado | Cliques, visualizações, cadastros, compras |
| Métricas por Afiliado | ✅ Implementado | Performance individual |
| Estatísticas Globais | ✅ Implementado | Dashboard admin completo |

### ✅ Funcionalidades Implementadas

| Funcionalidade | Status | Descrição |
|----------------|--------|-----------|
| Marketplace Nexus | ✅ Implementado | Catálogo próprio de produtos com carrinho, checkout e filtros |
| Circuit Breakers | ✅ Implementado | Proteção contra falhas em cascata com retry inteligente |
| Sistema de Permissões (RBAC) | ✅ Implementado | Roles, permissions e resource-based access granular |
| Autenticação Firebase/NextAuth | ✅ Implementado | Login social, JWT refresh tokens, custom claims |
| Sistema de Sorteios (Grafo+IA) | ✅ Implementado | Sorteios justos baseados na rede com verificação por IA |
| Holdings/Dividendos | ✅ Implementado | Participação acionária e distribuição de dividendos |
| Títulos de Capitalização | ✅ Implementado | Produtos financeiros com sorteios periódicos |
| Integração PIX Real | ⚠️ Planejado | Integração com API bancária |
| Automação WhatsApp API | ⚠️ Planejado | Envio automático via API oficial |

### ❌ Funcionalidades Remanescentes

| Funcionalidade | Status | Prioridade |
|----------------|--------|------------|

## Roadmap Agentic

### Documentação de Evolução

- [Roadmap Agentic de Execução](docs/agentic/ROADMAP_AGENTIC_EXECUCAO.md)
- [Arquitetura Agentic Alvo](docs/agentic/ARQUITETURA_AGENTIC_ALVO.md)
- [Operação Agentic, SRE e Compliance](docs/agentic/OPERACAO_AGENTIC_SRE_COMPLIANCE.md)
- [Épicos e Issues Detalhadas](docs/agentic/EPICOS_E_ISSUES_AGENTIC.md)
- [Plano de Execução por Sprint](docs/agentic/PLANO_SPRINTS_AGENTIC.md)

## Métricas de Conformidade

| Categoria | Implementado | Total | Percentual |
|-----------|-------------|-------|------------|
| Core Backend | 9 | 10 | 90% |
| Camada Agentic | 5 | 7 | 71% |
| Sistema XP/Carreiras | 6 | 10 | 60% |
| Dashboard | 1 | 1 | 100% |
| Frontend/UI | 7 | 12 | 58% |
| Sistema MMN | 5 | 8 | 63% |
| Integração IA | 4 | 5 | 80% |
| Automação Social | 5 | 6 | 83% |
| Sistema Financeiro | 9 | 10 | 90% |
| Sistema de Permissões (RBAC) | 5 | 5 | 100% |
| Sistema de Sorteios | 4 | 4 | 100% |
| Circuit Breakers | 3 | 3 | 100% |
| Tracking/Analytics | 4 | 5 | 80% |
| Newsletter | 4 | 5 | 80% |
| CMS Pages | 5 | 6 | 83% |
| Billing/Faturas | 7 | 8 | 88% |

**Conformidade Geral: ~85-90%**

## Estrutura do Projeto

```
MMN_AI-to-AI/
├── backend/
│   ├── src/
│   │   ├── _core/          # Core utilities
│   │   ├── agentic/        # Camada agentic
│   │   ├── config/         # Configurações
│   │   ├── database/       # Schema e migrations
│   │   ├── drizzle/        # Drizzle ORM
│   │   ├── genkit/         # Google Genkit
│   │   ├── integrations/    # Integrações externas
│   │   ├── routers/        # Routers tRPC
│   │   │   ├── newsletterRouter.ts  # Sistema de Newsletter
│   │   │   ├── cmsRouter.ts        # Sistema de CMS
│   │   │   └── billingRouter.ts     # Sistema de Faturas
│   │   ├── services/       # Lógica de negócio (xpService.ts)
│   │   ├── trpc/           # tRPC context
│   │   ├── workers/        # BullMQ workers
│   │   └── index.ts        # Entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   │   ├── NewsletterSubscription.tsx  # Form Newsletter
│   │   │   ├── CMSPages.tsx                # CMS Admin/Pages
│   │   │   └── BillingHistory.tsx          # Histórico Faturas
│   │   ├── contexts/       # Contextos (Auth, etc)
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Utilitários
│   │   ├── pages/          # Páginas
│   │   ├── App.tsx         # App principal
│   │   └── main.tsx        # Entry point
│   └── package.json
├── mobile/                  # React Native + Expo
├── database/
│   └── schemas/            # Schemas Drizzle
│       ├── schema.ts       # Schemas core
│       └── schema-legacy-migration.ts  # Newsletter, CMS, Billing
├── docs/
│   └── agentic/            # Documentação agentic
├── legacy/                  # Sistema legacy PHP (referência)
├── infra/                  # Docker + configurações
└── package.json            # Monorepo root
```

## Estrutura do Banco de Dados

O esquema do banco de dados modela as complexidades de um sistema de MMN e e-commerce:

### Tabelas Core
- **users**: Informações básicas dos usuários e autenticação
- **affiliates**: Perfil de afiliado, código, percentual de comissão
- **network**: Árvore da rede multinível
- **products/orders**: Catálogo de produtos e pedidos (dropshipping)
- **commissions/payments**: Fluxo financeiro e comissões
- **agents/agent_upgrades**: Configuração de agentes e upgrades

### Tabelas de Sistema (Migradas do Legacy)
- **newsletters**: Cadastro de emails para newsletter
- **cms_pages**: Páginas de conteúdo dinâmico
- **invoices**: Faturas e cobranças
- **invoice_items**: Itens de cada fatura
- **billing_history**: Histórico de ações no billing

### Tabelas de Carreira
- **career_levels**: 27 níveis de carreira (XP/Carreiras)
- **affiliate_xp**: Pontos de experiência por afiliado
- **xp_transactions**: Histórico de transações de XP
- **dashboard_metrics**: Métricas consolidadas do dashboard

## Arquitetura

```mermaid
graph TB
    subgraph Frontend
        A[React + Vite] --> B[tRPC Client]
    end

    subgraph Backend
        B --> C[tRPC Server]
        C --> D[Services]
        D --> E[(MySQL)]
        D --> F[(Redis)]
        F --> G[BullMQ Workers]
    end

    subgraph Legacy_Migration
        N[Newsletter]
        O[CMS Pages]
        P[Billing]
        N --> D
        O --> D
        P --> D
    end

    subgraph Agentic
        H[Agentic Orchestrator]
        I[Memory Layer]
        J[Monitoring]
        H --> I
        H --> J
    end

    subgraph XP_System
        K[XP Service]
        L[Career Levels]
        M[Leaderboard]
        K --> L
        K --> M
    end

    subgraph AI
        Q[LLM Router] --> R[OpenAI]
        Q --> S[Gemini]
    end

    C --> H
    C --> K
    G --> H
    G --> K
    C --> Q
```

## Plano de Carreira (PD/SCC) - Sistema Implementado

O sistema contempla um plano de carreira estruturado com 27 níveis organizados em 5 categorias:

1. **Afiliado** (levels 1-3): Iniciante → Bronze → Prata
2. **Preditivo** (levels 4-6): Analista Jr → Pl → Sr
3. **Generativo** (levels 7-9): Creator Jr → Pl → Sr
4. **Orquestrador** (levels 10-12): Orquestrador Jr → Pl → Sr
5. **IA Agêntica** (levels 13-27): Agente → Diretor → VP → Partner → Chairman

### XP e Progressão

- **XP Sources**: Vendas (10x), Comissões (5x), Bônus (15x), Network (3x)
- XP mensal resetado automaticamente
- Progressão automática baseada em desempenho
- Bônus de comissão por nível (até 90%)

### Endpoints tRPC Disponíveis

| Endpoint | Descrição |
|----------|----------|
| `xp.getMyXP` | Detalhes de XP do afiliado logado |
| `xp.getAffiliateXP` | XP de afiliado específico |
| `xp.getCareerLevels` | Lista de 27 níveis de carreira |
| `xp.getLeaderboard` | Top 10 afiliados por XP |
| `xp.getXPHistory` | Histórico de transações |
| `dashboard.getMyDashboard` | Dashboard completo com métricas reais |
| `newsletter.subscribe` | Inscrever email na newsletter |
| `newsletter.unsubscribe` | Cancelar inscrição |
| `cms.getPage` | Buscar página CMS por slug |
| `cms.list` | Listar páginas (admin) |
| `billing.getInvoice` | Buscar fatura |
| `billing.listInvoices` | Listar faturas |

## Sistema Legacy - Referência

O diretório `/legacy/` contém o sistema original PHP com 1470 arquivos que foi analisado e parcialmente migrado:

| Componente Legacy | Status Migração |
|-------------------|-----------------|
| Newsletter System | ✅ Migrado (newsletterRouter.ts) |
| CMS Pages | ✅ Migrado (cmsRouter.ts) |
| Sistema de Faturas | ✅ Migrado (billingRouter.ts) |
| Backoffice Admin | ⚠️ Em análise | **referência https://nxnja0f28xnc.space.minimax.io/**
| Sistema MMN Core | ✅ Já existente |
| Automação Cron | ⚠️ Em análise |

## Referência de API tRPC

### Autenticação

Todos os endpoints protegidos requerem token JWT no header `Authorization: Bearer <token>`.

### Newsletter API

```typescript
// Inscrever email na newsletter
newsletter.subscribe({ email: string, name?: string, source?: string })

// Cancelar inscrição
newsletter.unsubscribe({ email: string })

// Listar inscritos (admin)
newsletter.list({ onlyActive?: boolean, page?: number, limit?: number })

// Buscar inscrito por email
newsletter.getByEmail({ email: string })

// Estatísticas de inscritos
newsletter.count()
```

### CMS API

```typescript
// Buscar página pública por slug
cms.getPage({ slug: string })

// Listar páginas (admin)
cms.list({ category?: string, status?: 'draft'|'published'|'archived', page?: number, limit?: number })

// Criar página
cms.create({ title: string, slug: string, content?: string, metaTitle?: string, metaDescription?: string, category?: string, status?: string, order?: number })

// Atualizar página
cms.update({ id: number, title?: string, slug?: string, content?: string, ... })

// Deletar página
cms.delete({ id: number })

// Listar categorias
cms.getCategories()
```

### Billing API

```typescript
// Buscar fatura por ID
billing.getInvoice({ id: number })

// Listar faturas
billing.listInvoices({ status?: string, startDate?: Date, endDate?: Date, page?: number, limit?: number })

// Criar fatura (admin)
billing.createInvoice({ userId: number, amount: number, description: string, dueDate: Date, items?: array })

// Atualizar status da fatura
billing.updateInvoiceStatus({ id: number, status: string, paidAt?: Date })

// Histórico de cobranças
billing.getHistory({ invoiceId?: number, page?: number, limit?: number })

// Estatísticas (admin)
billing.getStats()

// Confirmar pagamento (gateway callback)
billing.confirmPayment({ invoiceId: number, paymentId: string, amount: number })
```

### XP/Carreiras API

```typescript
// XP do afiliado logado
xp.getMyXP()

// XP de afiliado específico
xp.getAffiliateXP({ affiliateId: number })

// Lista de níveis de carreira
xp.getCareerLevels()

// Leaderboard (top 10)
xp.getLeaderboard()

// Histórico de XP
xp.getXPHistory({ page?: number, limit?: number })

// Dashboard completo
dashboard.getMyDashboard()
```

## Guias de Contribuição

### Fluxo de Desenvolvimento

1. **Fork** o repositório
2. **Clone** seu fork: `git clone https://github.com/<seu-user>/MMN_AI-to-AI.git`
3. **Crie uma branch** para sua feature: `git checkout -b feature/nova-funcionalidade`
4. **Commit** suas mudanças: `git commit -m 'feat: adiciona nova funcionalidade'`
5. **Push** para a branch: `git push origin feature/nova-funcionalidade`
6. Abra um **Pull Request** no GitHub

### Convenções de Commits

| Tipo | Descrição |
|------|-----------|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `docs` | Alterações em documentação |
| `style` | Formatação, falta de ponto e vírgula, etc |
| `refactor` | Refatoração de código |
| `test` | Adição ou correção de testes |
| `chore` | Atualização de build, dependências, etc |

### Estrutura de Branching

| Branch | Propósito |
|--------|----------|
| `main` | Código em produção |
| `develop` | Integração de features |
| `feature/*` | Novas funcionalidades |
| `fix/*` | Correções |
| `hotfix/*` | Correções urgentes em produção |

### Padrões de Código

- **TypeScript**: Strict mode habilitado
- **Naming**: camelCase para variáveis/funções, PascalCase para componentes/classes
- **Imports**: Ordem: React → libs externas → componentes internos → utils
- **tRPC**: Procedures públicas para leitura, protegidas para escrita com autenticação

### Testes

```bash
# Backend
npm run test --workspace=backend

# Frontend
npm run test --workspace=frontend
```

## Solução de Problemas

### Erro de Conexão com Banco

Verifique se o container MySQL está rodando:
```bash
docker ps | grep mysql
```

Se não estiver, inicie com:
```bash
npm run infrastructure:up
```

### Erro de Permissão em node_modules

Remova e reinstale:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Problemas com tRPC

Se os endpoints não carregam, verifique:
1. Backend está rodando na porta correta (default: 3000)
2. Variáveis de ambiente em `.env`
3. Conexão com banco de dados

### Reset de Banco de Dados

```bash
# Para desenvolvimento, pode usar push:
npm run db:push

# Ou migre do zero:
npm run db:migrate
npm run db:seed  # se disponível
```

## Infraestrutura Técnica

### Docker Services

| Serviço | Porta | Descrição |
|---------|-------|-----------|
| MySQL | 3306 | Banco de dados principal |
| Redis | 6379 | Cache e filas BullMQ |
| API | 3000 | Backend tRPC |
| Frontend | 5173 | Vite dev server |

### Variáveis de Ambiente

```env
# Banco
DATABASE_URL=mysql://root:password@localhost:3306/mmn_db
MYSQL_ROOT_PASSWORD=secret

# Redis
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=your-secret-key-min-32-chars

# IA
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...

# Server
PORT=3000
NODE_ENV=development
```

### Monitoramento

- **Logs**: `npm run infrastructure:logs`
- **Health Check**: `GET http://localhost:3000/health`
- **tRPC Inspector**: `http://localhost:3000/trpc`

## Recursos Adicionais

- [Guia do Administrador](docs/admin-guide.md)
- [Guia do Afiliado](docs/affiliate-guide.md)
- [Integração de Modelos IA](docs/Guia_Integracao_Modelos_IA_Proprietarios.md)
- [Arquitetura Agentic](docs/agentic/ARQUITETURA_AGENTIC_ALVO.md)
- [Roadmap Agentic](docs/agentic/ROADMAP_AGENTIC_EXECUCAO.md)
- [Manual de Integração](docs/integration-manual.md)
- [Referência API tRPC](docs/trpc-api.md)

## Changelog

### v1.0.7 (2026-05-19)
- **feat(circuit-breaker)**: Sistema completo de Circuit Breakers
  - `CircuitBreaker.ts`: Implementação do padrão com estados CLOSED/OPEN/HALF_OPEN
  - `circuitBreakerMiddleware.ts`: Middleware tRPC para proteção de procedures
  - Métricas de saúde e dashboard para monitoramento
  - Pre-configurado para serviços críticos (Mercado Livre, Shopee, PIX, etc.)
- **feat(rbac)**: Sistema de Permissões RBAC completo
  - `rbacSchema.ts`: Schemas para roles, permissions, policies
  - `rbacService.ts`: Lógica de verificação e decorators tRPC
  - 8 roles padrão (super_admin, admin, manager, affiliate, etc)
  - 45+ permissões granulares por recurso
  - Custom permissions e resource policies por usuário
- **feat(auth)**: Firebase Auth Integration
  - `firebaseAuth.ts`: SDK Firebase Admin com autenticação
  - Login social (Google, Facebook, Apple)
  - JWT custom claims para roles
  - Session management com refresh tokens
- **feat(raffle)**: Sistema de Sorteios com Grafo+IA
  - `raffleSchema.ts`: Schemas para raffles, tickets, winners
  - Verificação de elegibilidade por nível de rede
  - Algoritmo Fisher-Yates com seed para reprodutibilidade
  - Relatórios de verificação com hash
- **feat(holdings)**: Sistema de Holdings e Dividendos
  - `holdingsSchema.ts`: Participações acionárias e dividendos
  - Compra/venda de ações com cálculo de preço médio
  - Distribuição automática de dividendos por período
  - Portfólio consolidado do usuário
- **feat(capitalization)**: Títulos de Capitalização
  - `capitalizationSchema.ts`: Títulos, pagamentos, sorteios
  - Compra de títulos com pagamentos mensais
  - Cálculo de valor de resgate com multa
  - Sorteios periódicos baseados em participação
- **conformidade**: Atualizada para 85-90%

### v1.0.6 (2026-05-19)
- **feat(marketplace)**: Implementação completa do Marketplace Nexus
  - Schema de banco: marketplaceProducts, productCategories, productVariations, marketplaceOrders, orderItems, productReviews, wishlists, wishlistItems, coupons, affiliateMarketplaceSettings
  - Router tRPC: 17 endpoints para CRUD completo de produtos, pedidos, cupons e avaliações
  - Componentes Frontend:
    - `MarketplaceProductCard.tsx`: Card de produto com hover effects, galeria de imagens, wishlist, badges de desconto e status
    - `MarketplaceCatalog.tsx`: Catálogo com filtros avançados (categoria, tipo, preço, avaliação), busca, ordenação, paginação e view modes (grid/list)
    - `MarketplaceCart.tsx`: Carrinho com gerenciamento de itens, controle de quantidade, aplicação de cupons e cálculos automáticos
    - `MarketplaceProductDetail.tsx`: Página de detalhes com galeria, variações, tabs (descrição/avaliações/envio), reviews
    - `MarketplaceCheckout.tsx`: Fluxo de checkout em 5 etapas (carrinho, endereço, envio, pagamento, confirmação)
  - Página principal `Marketplaces.tsx` atualizada com mock data para demonstração
- **docs**: Marketplace Nexus adicionado à documentação com todos os endpoints e componentes
- **conformidade**: Atualizada para 75-80%

### v1.0.5 (2026-05-19)
- **fix(.gitignore)**: Corrigido rastreamento de package-lock.json em workspaces npm
  - Removido package-lock.json do rastreamento em subdiretórios
  - Mantido package-lock.json apenas na raiz para monorepo
  - Garantido que workspaces npm funcionem corretamente
- **docs**: Atualizada seção "Como Iniciar" com instruções de instalação manual para workspaces
- **docs**: Adicionada nota sobre limitações de npm workspaces em alguns ambientes

### v1.0.4 (2026-05-19)
- **feat(migration)**: Migração de funcionalidades do sistema Legacy PHP
  - `newsletterRouter.ts`: Sistema de newsletter com subscribe/unsubscribe
  - `cmsRouter.ts`: Sistema de páginas CMS dinâmicas
  - `billingRouter.ts`: Sistema de faturas e cobranças
  - `schema-legacy-migration.ts`: Tabelas para newsletters, cms_pages, invoices
- **feat(frontend)**: Novos componentes React
  - `NewsletterSubscription.tsx`: Formulário de inscrição
  - `CMSPages.tsx`: Renderização e administração de páginas
  - `BillingHistory.tsx`: Histórico de faturas e admin
- **docs**: Atualização do README com funcionalidades migradas
- **conformidade**: Atualizada para 65-70%

### v1.0.3 (2026-05-19)
- **feat(xp)**: Sistema de XP/Carreiras implementado
  - Schema: career_levels, affiliate_xp, xp_transactions, dashboard_metrics
  - 27 níveis de carreira organizados em 5 categorias
  - Cálculo de XP por vendas, comissões e bônus
  - Progressão automática de níveis
  - Leaderboard com top afiliados
- **feat(dashboard)**: Dashboard com métricas reais
  - Novo endpoint `dashboard.getMyDashboard`
  - Dados reais do banco de dados
  - Cálculo de network size recursivo
- **docs**: Conformidade atualizada para 55-60%

### v1.0.2 (2026-05-19)
- **feat(agentic)**: Expande persistência e monitoramento
- **feat(agentic)**: Adiciona persistência gradual para sessões e memória
- **feat(agentic)**: Adiciona camada de monitoramento e orquestração
- **fix**: Correções de inconsistências técnicas
- **feat(contract)**: Amplia routers bootstrap expostos no appRouter
- **fix(build)**: Estabiliza pipeline bootstrap do monorepo
- **chore**: Atualiza versões de dependências para compatibilidade

### v1.0.1 (2026-05-18)
- **fix**: Correções de inconsistências técnicas
- **fix**: Correção de inconsistências no componente AffiliateProfile

## Licença

MIT BNJ57

---

**Autor:** Lucas Thomaz
**Última Atualização:** 2026-05-19
**Versão:** 1.0.7
