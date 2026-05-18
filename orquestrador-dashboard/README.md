# Orquestrador Dashboard - Documentação Técnica

## Índice

1. [Análise Técnica do Sistema](#análise-técnica-do-sistema)
2. [Estrutura do Repositório](#estrutura-do-repositório)
3. [Arquitetura](#arquitetura)
4. [Stack Tecnológico](#stack-tecnológico)
5. [Configuração](#configuração)
6. [Organização de Arquivos](#organização-de-arquivos)
7. [Próximos Passos](#próximos-passos)

---

## Análise Técnica do Sistema

### Estado Atual

O repositório `MMN_AI-to-AI` contém um dashboard React completo com integração Supabase. A análise atual revela:

| Aspecto | Status | Descrição |
|---------|--------|-----------|
| Frontend | ✅ Pronto | Dashboard funcional com React + TypeScript |
| Integração Supabase | ✅ Configurado | Cliente SDK integrado |
| Autenticação | ⚠️ Pendente | Estrutura preparada mas não implementada |
| Backend API | ⚠️ Pendente | Necessário desenvolver endpoints |
| Database Schema | ⚠️ Pendente | Tipos definidos, schema SQL necessário |
| UI/UX | ✅ Implementado | Componentes modernos com TailwindCSS |
| Responsividade | ✅ Implementado | Suporte mobile/desktop |

### Pontos Fortes

- Arquitetura bem modularizada com components, hooks, pages, types, lib
- Tipagem TypeScript completa para todas as entidades
- UI components reutilizáveis e bem documentados
- Integração Supabase ready com tipos exportados
- Design system com badges, cards, tables, progress bars

### Áreas de Melhoria

1. **Autenticação**: Implementar sistema de login/registro
2. **Dashboard Layout**: Adicionar sidebar colapsável com navegação
3. **Database Schema**: Criar SQL schema completo para Supabase
4. **API Routes**: Desenvolver backend Node.js para operações CRUD
5. **Documentação**: Expandir guias de desenvolvimento

---

## Estrutura do Repositório

```
orquestrador-dashboard/
├── src/
│   ├── components/          # Componentes React reutilizáveis
│   │   ├── ui.tsx           # Componentes base (Card, Badge, Table, etc.)
│   │   └── ErrorBoundary.tsx
│   ├── hooks/               # Custom hooks React
│   │   └── use-mobile.tsx
│   ├── lib/                 # Utilitários e configurações
│   │   ├── supabase.ts      # Cliente Supabase + tipos
│   │   └── utils.ts         # Funções utilitárias (cn, etc.)
│   ├── pages/              # Páginas principais
│   │   └── Dashboard.tsx   # Dashboard completo
│   ├── types/              # Definições TypeScript
│   │   └── index.ts        # Interfaces (Agent, Task, Affiliate, etc.)
│   ├── App.tsx             # Componente raiz com rotas
│   ├── main.tsx           # Entry point
│   └── index.css          # Estilos globais + Tailwind
├── public/
│   └── use.txt            # Arquivo placeholder
├── dist/                  # Build de produção (gerado)
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── eslint.config.js
├── components.json        # Configuração shadcn/ui
├── index.html
├── .env                   # Variáveis de ambiente (IGNORADO)
├── .env.example           # Template para variáveis
└── .gitignore
```

---

## Arquitetura

### Camadas da Aplicação

```
┌─────────────────────────────────────────────┐
│           UI Components (View)              │
│     Cards, Tables, Badges, Progress          │
├─────────────────────────────────────────────┤
│           Pages (Controllers)                │
│        Dashboard, Agents, Tasks              │
├─────────────────────────────────────────────┤
│            Hooks (Lógica)                   │
│       useMobile, useAuth, useData            │
├─────────────────────────────────────────────┤
│          Services (Business)                 │
│     Supabase Client, API Calls              │
├─────────────────────────────────────────────┤
│           Data Layer                        │
│        Supabase Database                    │
└─────────────────────────────────────────────┘
```

### Fluxo de Dados

1. **User Action** → Component Event
2. **Page Handler** → Processa lógica de negócio
3. **Service Layer** → Chama Supabase ou API
4. **Data Response** → Atualiza estado
5. **UI Update** → Re-render com novos dados

---

## Stack Tecnológico

### Frontend

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| React | 18.3.1 | Biblioteca UI |
| TypeScript | 5.6.2 | Type safety |
| Vite | 6.2.6 | Build tool |
| TailwindCSS | 3.4.16 | Estilização |
| Radix UI | latest | Componentes base |
| Lucide React | 0.364.0 | Ícones |
| Recharts | 2.15.2 | Gráficos |
| React Router | 6.30.0 | Roteamento |
| React Hook Form | 7.55.0 | Formulários |
| Zod | 3.24.2 | Validação |
| Shadcn/ui | - | Componentes |
| Sonner | 1.7.4 | Toasts |

### Backend

| Tecnologia | Status | Propósito |
|------------|--------|-----------|
| Supabase | Configurado | Database + Auth |
| Node.js | A implementar | API Server |
| Drizzle | A implementar | ORM |

---

## Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Obtenha essas credenciais no [Supabase Dashboard](https://supabase.com/dashboard).

### Instalação

```bash
# Instalar dependências
pnpm install

# Desenvolvimento
pnpm dev

# Build produção
pnpm build

# Preview produção
pnpm preview
```

---

## Organização de Arquivos

### Princípios de Organização

1. **Feature-based**: Arquivos agrupados por funcionalidade
2. **Separation of Concerns**: UI separada da lógica
3. **Type Safety**: Todos os tipos em `/types`
4. **Reutilização**: Componentes compartilhados em `/components`

### Convenções de Nomenclatura

| Tipo | Convenção | Exemplo |
|------|-----------|---------|
| Componentes | PascalCase | `Dashboard.tsx` |
| Hooks | camelCase + use | `useAuth.tsx` |
| Types/Interfaces | PascalCase | `Agent.ts` |
| Utilitários | camelCase | `formatDate.ts` |
| Constantes | SCREAMING_SNAKE | `MAX_RETRIES` |

### Estrutura de Imports

```typescript
// 1. React/core
import { useState, useEffect } from 'react'

// 2. Third-party
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// 3. Internal components
import { Card, Badge } from '@/components/ui'

// 4. Internal hooks
import { useAuth } from '@/hooks/useAuth'

// 5. Types
import type { Agent } from '@/types'

// 6. Utils
import { cn, formatDate } from '@/lib/utils'
```

---

## Próximos Passos

### Fase 1: Backend e Database

- [ ] Executar `supabase-schema.sql` no Supabase Dashboard
- [ ] Configurar Row Level Security (RLS)
- [ ] Implementar autenticação com Supabase Auth
- [ ] Criar API endpoints Node.js

### Fase 2: Features

- [ ] Sistema de login/registro
- [ ] CRUD completo de Agentes
- [ ] CRUD completo de Tarefas
- [ ] Sistema de Afiliados
- [ ] Gestão de Comissões
- [ ] Previsões com ML

### Fase 3: DevOps

- [ ] GitHub Actions para CI/CD
- [ ] Deploy automático
- [ ] Monitoramento e logs
- [ ] Backup database

### Fase 4: UX/UI

- [ ] Gráficos interativos
- [ ] Notificações em tempo real
- [ ] Tema dark/light
- [ ] Internacionalização (i18n)

---

## Recursos

- [Documentação React](https://react.dev)
- [Documentação Supabase](https://supabase.com/docs)
- [TailwindCSS](https://tailwindcss.com)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)

---

**Versão**: 1.0.0
**Última Atualização**: 2024-05-19
**Autor**: Nexus HUB57