# Orquestrador Dashboard

> Status atual: **artefato paralelo / protótipo de interface**, não a aplicação principal oficial do monorepo.
>
> A convergência funcional do orquestrador deve ocorrer no frontend oficial em `frontend/`, especialmente pela página `frontend/src/pages/OrchestratorDashboard.tsx` e integração com backend tRPC.

**Multi-Module AI Agent Management Interface for Nexus-HUB57 AI-to-AI Marketing Platform**

Dashboard React para gerenciamento e monitoramento do sistema Orquestrador - uma arquitetura de agentes IA especializados que orquestram tarefas de marketing multinível (MMN) e operações P2P.

## Features

- **Visão Geral (Overview)**: Dashboard com métricas em tempo real do sistema
- **Gerenciamento de Tasks**: Criação, monitoramento e rastreamento de tarefas
- **Monitoramento de Agentes**: Status e métricas dos 5 módulos de IA
- **Análise de Tendências**: Gráficos de performance e indicadores
- **Gestão de Metas**: Definição e acompanhamento de objetivos
- **Programa de Afiliados**: Gerenciamento de rede de afiliados
- **Dropshipping**: Interface para operações automatizadas

## Arquitetura de Agentes

```
┌─────────────────────────────────────────────────────────────┐
│                    ORQUESTRADOR CENTRAL                      │
│         (Orquestração de fluxo entre módulos)               │
└─────────────────────────────────────────────────────────────┘
        │           │           │           │           │
        ▼           ▼           ▼           ▼           ▼
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ AFILIADO │ │PREditivo │ │GENERATIVO│ │  ORQUEST │ │ AGENTE   │
│          │ │          │ │          │ │  RADOR   │ │ CA       │
│ - Links  │ │ - Análise│ │ - Copy   │ │ - Fluxo  │ │ - Execução│
│ - Comissões│ - Forecast│ │ - Imagens │ │ - Tasks │ │ - Scripts│
└──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘
```

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build**: Vite
- **Styling**: Tailwind CSS + Radix UI
- **Charts**: Recharts
- **Backend**: Supabase (PostgreSQL)
- **API**: tRPC-style pattern

## Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment Variables

Crie um arquivo `.env` na raiz do projeto:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Ou copie o template:

```bash
cp .env.example .env
```

### 3. Setup Database

Execute o schema SQL no Supabase Dashboard > SQL Editor:

```bash
# Conteúdo está em supabase-schema.sql
```

O schema cria as seguintes tabelas:
- `agents` - Registro dos agentes IA
- `tasks` - Tarefas do sistema
- `affiliates` - Dados de afiliados
- `commissions` - Comissões e pagamentos
- `predictions` - Análises preditivas
- `generated_content` - Conteúdo gerado por IA
- `workflows` - Fluxos de trabalho
- `executions` - Execuções de comandos
- `events` - Log de eventos

### 4. Run Development Server

```bash
pnpm dev
```

### 5. Build for Production

```bash
pnpm build
```

## Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `pnpm dev` | Servidor de desenvolvimento |
| `pnpm build` | Build de produção |
| `pnpm preview` | Preview do build |
| `pnpm lint` | Verificação de lint |

## Estrutura do Projeto

```
orquestrador-dashboard/
├── src/
│   ├── components/
│   │   └── ErrorBoundary.tsx
│   ├── hooks/
│   │   ├── use-mobile.tsx
│   │   └── useOrquestrador.ts    # Hooks para Supabase
│   ├── lib/
│   │   ├── supabase.ts           # Cliente Supabase
│   │   └── utils.ts
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   ├── main.tsx
│   └── Orquestrador.tsx         # Componente principal
├── supabase-schema.sql          # Schema do banco
├── .env.example                 # Template de variáveis
└── tailwind.config.js
```

## Integração com Supabase

O dashboard utiliza Supabase para:

1. **Persistência de Dados**: Agents, tasks, afiliados
2. **Tempo Real**: Updates automáticos via subscriptions
3. **Auth**: Sistema de autenticação integrado
4. **RLS**: Segurança em nível de linha

### Tipos de Dados

```typescript
// Agent
{
  id: string
  name: string
  type: 'afiliado' | 'preditivo' | 'generativo' | 'orquestrador' | 'agente_ca'
  status: 'idle' | 'busy' | 'offline'
  capabilities: string[]
  metrics: { tasksCompleted, tasksFailed, avgResponseTime, lastActive }
}

// Task
{
  id: string
  type: 'affiliate_management' | 'predictive_analysis' | 'content_generation'
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  data: Record<string, any>
  assigned_agent_id: string
}
```

## Deploy

### Build

```bash
pnpm build
```

Os arquivos estáticos serão gerados em `dist/`.

### Deploy Automático

O projeto está configurado para deploy automático via GitHub Actions ou ferramentas CI/CD.

## Licença

Proprietary - Nexus-HUB57