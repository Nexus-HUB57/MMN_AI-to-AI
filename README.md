# Nexus System AfilIAte-AI

> Ecossistema de Marketing Multinível (MMN) orquestrado por agentes de IA autônomos, operando em uma arquitetura de alta integridade.

## Status do Projeto

![Stage](https://img.shields.io/badge/Stage-MVP%2B-green)
![Conformidade](https://img.shields.io/badge/Conformidade-55--60%25-yellow)
![License](https://img.shields.io/badge/License-MIT-green)
![Agentic](https://img.shields.io/badge/Agentic-Layer-7C3AED)
![XP](https://img.shields.io/badge/XP%2FCarreiras-Implemented-blue)

**Aviso**: Este projeto está em desenvolvimento ativo. Algumas funcionalidades descritas neste documento estão em implementação ou planejadas para fases futuras.

## Stack Tecnológica

| Categoria | Tecnologia | Versão |
|-----------|------------|--------|
| **Frontend Web** | React 18 + Vite + wouter (router) + TailwindCSS + TanStack Query | ^18.3.1 / ^6.0.7 |
| **Backend** | Node.js + TypeScript + tRPC v11 | ^22.10.0 |
| **Banco de Dados** | MySQL (Drizzle ORM) + Redis + BullMQ | ^0.38.4 / ^5.28.2 |
| **Mobile** | React Native + Expo Router (diretório `mobile/`) | 0.78.0 / ~54 |
| **IA** | Google Genkit (Gemini) + OpenAI | ^1.0.0 / ^4.77.0 |
| **Auth** | JWT (Firebase/NextAuth no roadmap) | - |

## Avanços Recentes (v1.0.3)

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

```bash
git clone https://github.com/Nexus-HUB57/MMN_AI-to-AI.git
cd MMN_AI-to-AI
npm install
```

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

### ✅ Funcionalidades Implementadas

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

### ✅ Sistema BeYour Banker (100%)

| Componente | Status | Descrição |
|-----------|--------|-----------|
| Saldo do Afiliado | ✅ Implementado | Saldo disponível, pendente e bloqueado |
| Contas Bancárias | ✅ Implementado | CADASTRO de contas com PIX |
| Solicitações de Saque | ✅ Implementado | Workflow completo (pendente → aprovado → processado) |
| Histórico de Transações | ✅ Implementado | Log completo de todas operações |
| Relatórios Mensais | ✅ Implementado | Relatórios consolidados |
| Admin Panel | ✅ Implementado | Aprovação e processamento de saques |

### ✅ Camada Agentic (70%)

| Componente | Status | Descrição |
|------------|--------|-----------|
| Sistema de Memória | ✅ Implementado | Persistência gradual para sessões |
| Monitoramento | ✅ Implementado | Camada de observabilidade |
| Orquestração | ✅ Implementado | Coordenação de agentes |
| Logs de Auditoria | ✅ Implementado | Rastreamento completo |
| Persistência de Estado | ✅ Implementado | Gestão de estado agentic |

### ✅ Sistema de XP/Carreiras (60%)

| Componente | Status | Descrição |
|------------|--------|-----------|
| 27 Níveis de Carreira | ✅ Implementado | 5 categorias (Afiliado → Chairman) |
| Cálculo de XP | ✅ Implementado | Multiplicadores por fonte (vendas, comissões, etc.) |
| Progressão Automática | ✅ Implementado | Nível calculado por XP total |
| Leaderboard | ✅ Implementado | Top afiliados por XP |
| Dashboard com Métricas Reais | ✅ Implementado | Dados do banco de dados |

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

### ⚠️ Funcionalidades em Desenvolvimento

| Funcionalidade | Status | Descrição |
|----------------|--------|-----------|
| Marketplace Nexus | ⚠️ Planejado | Catálogo próprio de produtos |
| Integração PIX Real | ⚠️ Planejado | Integração com API bancária |
| Automação WhatsApp API | ⚠️ Planejado | Envio automático via API oficial |

### ❌ Funcionalidades Futuras (Roadmap)

| Funcionalidade | Status | Prioridade |
|----------------|--------|------------|
| Autenticação Firebase/NextAuth | 📋 RoadMap | Média |
| Sorteios (Grafo+IA) | 📋 Planejado | Média |
| Títulos de Capitalização | 📋 Planejado | Baixa |
| Holdings/Dividendos | 📋 Planejado | Média |
| Circuit Breakers | 📋 Planejado | Alta |
| Modelos de Permissão Detalhados | 📋 Planejado | Alta |

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
| Sistema Financeiro | 6 | 8 | 75% |
| Tracking/Analytics | 4 | 5 | 80% |

**Conformidade Geral: ~70-75%**

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
│   │   ├── services/       # Lógica de negócio (xpService.ts)
│   │   ├── trpc/           # tRPC context
│   │   ├── workers/        # BullMQ workers
│   │   └── index.ts        # Entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes React
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
├── docs/
│   └── agentic/            # Documentação agentic
├── infra/                  # Docker + configurações
└── package.json            # Monorepo root
```

## Estrutura do Banco de Dados

O esquema do banco de dados modela as complexidades de um sistema de MMN e e-commerce:

- **users**: Informações básicas dos usuários e autenticação
- **affiliates**: Perfil de afiliado, código, percentual de comissão
- **network**: Árvore da rede multinível
- **products/orders**: Catálogo de produtos e pedidos (dropshipping)
- **commissions/payments**: Fluxo financeiro e comissões
- **agents/agent_upgrades**: Configuração de agentes e upgrades
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
        N[LLM Router] --> O[OpenAI]
        N --> P[Gemini]
    end

    C --> H
    C --> K
    G --> H
    G --> K
    C --> N
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

## Limitações Conhecidas

⚠️ **MVP+ Status**: O projeto está em estágio MVP+ com os seguintes avanços:

1. ✅ Sistema de XP/Carreiras implementado (27 níveis)
2. ✅ Dashboard com métricas reais do banco de dados
3. ✅ Camada agentic implementada com persistência de memória
4. ✅ Monitoramento e orquestração funcionais
5. ⚠️ Sistema financeiro (BeYour Banker) em planejamento
6. ⚠️ Automação de posts sociais em design

### Prioridades de Desenvolvimento

1. Sistema financeiro (BeYour Banker)
2. Automação de posts sociais
3. Tracking de conversões
4. Marketplace Nexus próprio

## Contribuição

Consulte a documentação em `docs/agentic/` para diretrizes de desenvolvimento e roadmap de implementação agentic.

## Changelog

### v1.0.3 (2024-05-19)
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

### v1.0.2 (2024-05-19)
- **feat(agentic)**: Expande persistência e monitoramento
- **feat(agentic)**: Adiciona persistência gradual para sessões e memória
- **feat(agentic)**: Adiciona camada de monitoramento e orquestração
- **fix**: Correções de inconsistências técnicas
- **feat(contract)**: Amplia routers bootstrap expostos no appRouter
- **fix(build)**: Estabiliza pipeline bootstrap do monorepo
- **chore**: Atualiza versões de dependências para compatibilidade

### v1.0.1 (2024-05-18)
- **fix**: Correções de inconsistências técnicas
- **fix**: Correção de inconsistências no componente AffiliateProfile

## Licença

MIT