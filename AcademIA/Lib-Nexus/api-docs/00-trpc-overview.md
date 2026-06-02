---
title: "API tRPC · Visão Geral"
description: "Documentação canônica da API interna via tRPC (end-to-end type-safe)"
tags: [lib-nexus, api-docs, trpc, canonico, internal-api]
category: api-docs
version: "1.0"
last_review: "2026-06-02"
status: canonico
---

# 🔌 API tRPC · Visão Geral

> Documentação canônica da **API interna** do Nexus, construída com **tRPC** (TypeScript Remote Procedure Call) para **type-safety end-to-end**.

---

## 🎯 O que é tRPC

[tRPC](https://trpc.io) é um framework que permite definir **procedures** (endpoints) no servidor e chamá-los do cliente com **autocomplete total** e **validação Zod nativa**. Elimina a necessidade de:

- Gerar OpenAPI/Swagger
- Escrever clientes HTTP manualmente
- Sincronizar tipos entre front e back

---

## 🏗️ Arquitetura

### Stack
- **Servidor**: Node.js + Fastify + tRPC v11
- **Cliente**: React (Next.js) + tRPC client
- **Validação**: Zod (compartilhado front/back)
- **Auth**: Better Auth + JWT
- **Documentação**: Gerada a partir dos tipos (não manual)

### Pastas
```
backend/src/api/
├── trpc.ts                    # Setup do tRPC
├── context.ts                 # Contexto (user, tenant, etc.)
├── root.ts                    # AppRouter raiz
└── routers/                   # Routers por domínio
    ├── agents.ts              # Operações de agents
    ├── affiliates.ts          # CRUD de afiliados
    ├── billing.ts             # Assinaturas
    ├── leads.ts               # CRM
    ├── analytics.ts           # Métricas
    └── admin.ts               # Admin (apenas role=admin)
```

---

## 📐 Anatomia de um Procedure

### Procedure Básico
```typescript
// /backend/src/api/routers/leads.ts
import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';

const LeadSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  createdAt: z.date()
});

export const leadsRouter = router({
  // Query (GET)
  byId: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .output(LeadSchema)
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.leads.findFirst({
        where: (leads, { eq }) => eq(leads.id, input.id)
      });
    }),

  // Mutation (POST)
  create: protectedProcedure
    .input(z.object({
      email: z.string().email(),
      name: z.string().min(1),
      phone: z.string().optional()
    }))
    .output(LeadSchema)
    .mutation(async ({ ctx, input }) => {
      // Validação LGPD
      if (!input.consent) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Consentimento LGPD obrigatório'
        });
      }
      
      return await ctx.db.insert(leads).values(input).returning();
    }),

  // Subscription (WebSocket)
  onChange: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .subscription(async ({ ctx, input }) => {
      // Stream de eventos
    })
});
```

### Procedure com Middleware
```typescript
import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';

// Middleware customizado: verifica role
const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
  return next({ ctx: { ...ctx, isAdmin: true } });
});

export const adminRouter = router({
  deleteUser: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(users).where(eq(users.id, input.id));
      return { success: true };
    })
});
```

---

## 🔐 Autenticação e Autorização

### JWT + Better Auth
```typescript
// /backend/src/api/trpc.ts
import { initTRPC, TRPCError } from '@trpc/server';
import { getAuth } from '../auth';

const t = initTRPC.context<Context>().create();

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  const session = await getAuth(ctx.req);
  
  if (!session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  
  return next({
    ctx: {
      ...ctx,
      user: session.user,
      tenantId: session.user.tenantId
    }
  });
});
```

### Multi-Tenant (Row-Level Security)
```typescript
export const leadsRouter = router({
  list: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().default(0)
    }))
    .query(async ({ ctx, input }) => {
      // SEMPRE filtra por tenant
      return await ctx.db.query.leads.findMany({
        where: (leads, { eq, and }) => and(
          eq(leads.tenantId, ctx.tenantId)
        ),
        limit: input.limit,
        offset: input.offset
      });
    })
});
```

---

## 🔥 Error Handling

### Códigos Canônicos
- `BAD_REQUEST` (400) — input inválido
- `UNAUTHORIZED` (401) — sem auth
- `FORBIDDEN` (403) — sem permissão
- `NOT_FOUND` (404) — recurso não existe
- `CONFLICT` (409) — conflito (ex: email duplicado)
- `UNPROCESSABLE_CONTENT` (422) — validação de regra de negócio
- `TOO_MANY_REQUESTS` (429) — rate limit
- `INTERNAL_SERVER_ERROR` (500) — erro inesperado

### Custom Errors
```typescript
// Backend
throw new TRPCError({
  code: 'UNPROCESSABLE_CONTENT',
  message: 'Lead já existe com este email',
  cause: { email: 'maria@example.com' }
});

// Frontend (cliente)
const { data, error } = trpc.leads.create.useMutation(...);
if (error) {
  if (error.data?.code === 'CONFLICT') {
    // Mostrar mensagem específica
  }
}
```

---

## 📊 Rate Limiting

```typescript
// /backend/src/api/middleware/rateLimit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(60, '1 m'), // 60 req/min
  analytics: true
});

export const rateLimitedProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const { success, limit, reset, remaining } = await ratelimit.limit(ctx.user.id);
  
  if (!success) {
    throw new TRPCError({
      code: 'TOO_MANY_REQUESTS',
      message: `Rate limit: ${limit} req/min. Tente em ${reset}ms`
    });
  }
  
  return next();
});
```

### Limites por Procedure
- **Queries simples**: 60 req/min
- **Mutations**: 30 req/min
- **LLM calls**: 10 req/min (caro)
- **Webhooks**: 100 req/min (alta volumetria)

---

## 🧪 Validação (Zod)

### Input
```typescript
.input(z.object({
  email: z.string().email(),
  age: z.number().int().min(18).max(120),
  tags: z.array(z.string()).max(10).optional(),
  consent: z.literal(true) // LGPD: precisa ser true
}))
```

### Output
```typescript
.output(z.object({
  id: z.string().uuid(),
  status: z.enum(['active', 'inactive', 'banned'])
}))
```

### Refinements Customizados
```typescript
.refine(data => data.password === data.passwordConfirm, {
  message: 'Senhas não conferem',
  path: ['passwordConfirm']
})
```

---

## 🌍 Cliente (Frontend)

### Setup
```typescript
// /apps/web/lib/trpc.ts
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@backend/api/root';

export const trpc = createTRPCReact<AppRouter>();
```

### Uso em Componente
```typescript
'use client';
import { trpc } from '@/lib/trpc';

export function LeadList() {
  // Hook tipado com autocomplete
  const { data, isLoading, error } = trpc.leads.list.useQuery({ limit: 20 });
  
  if (isLoading) return <Spinner />;
  if (error) return <Error error={error} />;
  
  return (
    <ul>
      {data?.map(lead => (
        <li key={lead.id}>{lead.name} ({lead.email})</li>
      ))}
    </ul>
  );
}
```

### Server Component (Next.js)
```typescript
// RSC com tRPC
import { createCaller } from '@backend/api/root';
import { createContext } from '@backend/api/context';

export async function LeadListRSC() {
  const ctx = await createContext();
  const caller = createCaller(ctx);
  const leads = await caller.leads.list({ limit: 20 });
  
  return <ul>{leads.map(l => <li key={l.id}>{l.name}</li>)}</ul>;
}
```

---

## 📚 Lista de Routers

| Router | Procedures | Auth |
|---|---|---|
| `agents` | execute, list, get | protected |
| `affiliates` | list, get, create, update, delete | protected |
| `billing` | subscribe, cancel, getInvoice | protected |
| `leads` | list, get, create, update, delete, export | protected |
| `analytics` | funnel, cohort, attribution, kpis | protected |
| `automations` | list, get, create, trigger | protected |
| `webhooks` | list, get, retry, replay | protected |
| `admin` | users, tenants, audit-log | admin |

(Routers completos serão detalhados em documentos específicos por router.)

---

## 🔗 Versionamento

- **Major version** (v1, v2) — mudanças breaking
- **Minor version** — novas procedures
- **Patch** — fixes

Atual: **v1.0.0**

---

## 📊 Métricas de Sucesso

| Métrica | Meta |
|---|---|
| Latência p95 | < 200ms |
| Latência p99 | < 500ms |
| Error rate | < 0.5% |
| Type coverage | 100% |
| Documentação | Auto-gerada |

---

## 🔗 Documentos Relacionados

- `01-webhooks.md` — webhooks externos
- `02-rest-public.md` — REST pública
- `../agents-specs/00-base-agent.md` — agents consomem tRPC
- `../best-practices/01-error-handling.md` — error patterns

---

**Versão 1.0** · Atualizado 2026-06-02 · Mantido pela Equipe Nexus
