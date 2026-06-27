---
title: "Best Practices · Performance"
description: "Padrões canônicos de performance para o Nexus (cache, batching, async, otimização)"
tags: [lib-nexus, best-practices, performance, canonico, otimizacao]
category: best-practices
version: "1.0"
last_review: "2026-06-02"
status: official
---

# ⚡ Best Practices · Performance

> Padrões canônicos de **performance** para o Nexus. Toda decisão de arquitetura deve considerar: latência, throughput, custo.

---

## 🎯 Filosofia

> **Performance é feature, não otimização tardia.**

Princípios:

1. **Medir antes de otimizar** — sem dados, é achismo
2. **Otimizar o gargalo** — não o que é fácil
3. **Cache quando faz sentido** — mas com invalidação clara
4. **Async quando não precisa ser síncrono** — liberamos a request
5. **Batch quando possível** — reduz overhead por chamada
6. **Pagar pelo que usa** — serverless para spiky, dedicado para steady

---

## 📊 SLOs (Service Level Objectives)

### Por Tipo de Operação

| Operação | p50 | p95 | p99 | Disponibilidade |
|---|---|---|---|---|
| **API tRPC query simples** | < 50ms | < 200ms | < 500ms | 99.5% |
| **API tRPC mutation** | < 100ms | < 500ms | < 1.5s | 99.5% |
| **API tRPC query complexa** | < 500ms | < 2s | < 5s | 99% |
| **Chamada LLM (copy)** | < 3s | < 5s | < 10s | 99% |
| **Chamada LLM (análise)** | < 5s | < 10s | < 20s | 99% |
| **Webhook (entrada)** | < 100ms | < 500ms | < 2s | 99.5% |
| **Webhook (saída)** | < 200ms | < 1s | < 3s | 99% |
| **Job em fila** | < 30s | < 5min | < 30min | 99% |

---

## 🗄️ Banco de Dados

### Índices

```sql
-- Regra: toda query em produção deve usar índice

-- 1. Tenant isolation (multi-tenant)
CREATE INDEX idx_leads_tenant_id ON leads (tenant_id);
CREATE INDEX idx_leads_tenant_email ON leads (tenant_id, email);

-- 2. Foreign keys
CREATE INDEX idx_orders_customer_id ON orders (customer_id);
CREATE INDEX idx_orders_tenant_status ON orders (tenant_id, status);

-- 3. Ordenação frequente
CREATE INDEX idx_events_created_at_desc ON events (created_at DESC);

-- 4. Buscas textuais
CREATE INDEX idx_products_name_trgm ON products USING gin (name gin_trgm_ops);

-- 5. Parciais (economizam espaço)
CREATE INDEX idx_active_subscriptions ON subscriptions (user_id) 
  WHERE status = 'active';
```

### Query Optimization

```typescript
// ❌ RUIM: N+1 queries
const leads = await db.query.leads.findMany();
for (const lead of leads) {
  lead.orders = await db.query.orders.findMany({ where: eq(orders.leadId, lead.id) });
}

// ✅ BOM: 1 query com JOIN
const leads = await db.query.leads.findMany({
  with: { orders: true }
});

// ✅ MELHOR: Apenas campos necessários + paginação
const leads = await db.query.leads.findMany({
  columns: { id: true, name: true, email: true, createdAt: true },
  with: { orders: { columns: { id: true, total: true } } },
  limit: 20,
  offset: 0
});
```

### Connection Pooling

```typescript
// Usar PgBouncer ou driver com pool
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,                // pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});
```

---

## 🧠 Cache (Redis)

### Estratégia: Cache-Aside

```typescript
async function getLeadById(id: string): Promise<Lead | null> {
  const cacheKey = `lead:${id}`;
  
  // 1. Tentar cache
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // 2. Buscar no DB
  const lead = await db.query.leads.findFirst({ where: eq(leads.id, id) });
  if (!lead) return null;
  
  // 3. Armazenar no cache (TTL 1h)
  await redis.setex(cacheKey, 3600, JSON.stringify(lead));
  
  return lead;
}

// Invalidar ao atualizar
async function updateLead(id: string, data: Partial<Lead>) {
  await db.update(leads).set(data).where(eq(leads.id, id));
  await redis.del(`lead:${id}`); // Invalidação
}
```

### TTLs Recomendados

| Tipo de Dado | TTL |
|---|---|
| Sessão de usuário | 30 min |
| Perfil de usuário | 1h |
| Configuração de tenant | 6h |
| Lista de produtos | 24h |
| Lookup table (categorias, tags) | 24h |
| Resposta de LLM (cacheável) | 7 dias |
| Analytics agregado | 5 min |
| Métricas de KPI | 1 min |

### Cache Stampede Protection

```typescript
// ❌ RUIM: muitos requests simultâneos geram N queries
async function getHotData(key: string) {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);
  const fresh = await fetchFromSource();
  await redis.setex(key, 3600, JSON.stringify(fresh));
  return fresh;
}

// ✅ BOM: usar lock para evitar stampede
async function getHotDataWithLock(key: string) {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);
  
  // Adquirir lock
  const lockKey = `lock:${key}`;
  const acquired = await redis.set(lockKey, '1', 'NX', 'EX', 30);
  
  if (acquired) {
    // Eu vou buscar
    const fresh = await fetchFromSource();
    await redis.setex(key, 3600, JSON.stringify(fresh));
    await redis.del(lockKey);
    return fresh;
  } else {
    // Outro processo está buscando — esperar
    await sleep(100);
    return getHotDataWithLock(key); // retry
  }
}
```

---

## 🤖 LLM Performance

### Escolha de Modelo (custo vs qualidade)

| Modelo | Custo (input/output por 1M tokens) | Latência média | Uso |
|---|---|---|---|
| gpt-4o-mini | $0.15 / $0.60 | ~1s | Tarefas simples, alto volume |
| gpt-4o | $2.50 / $10.00 | ~2s | Tarefas complexas |
| claude-3-5-haiku | $0.80 / $4.00 | ~1.5s | Sumarização, classificação |
| claude-3-5-sonnet | $3.00 / $15.00 | ~3s | Raciocínio profundo |
| o1-preview | $15.00 / $60.00 | ~10s | Análise complexa, planejamento |

### Prompt Caching (Anthropic)

```typescript
// Reusar system prompt entre chamadas
const response = await anthropic.messages.create({
  model: 'claude-3-5-sonnet',
  system: [
    {
      type: 'text',
      text: longSystemPrompt,
      cache_control: { type: 'ephemeral' }
    }
  ],
  messages: [{ role: 'user', content: userInput }]
});
// Primeira chamada: paga tokens do system
// Chamadas seguintes: 90% desconto nos tokens cached
```

### Batching

```typescript
// ❌ RUIM: 1 chamada por lead
for (const lead of leads) {
  const result = await classifyLead(lead);
}

// ✅ BOM: 1 chamada com múltiplos leads
const results = await classifyLeadsBatch(leads); // Até 50 por chamada
```

### Streaming (resposta parcial mais rápido)

```typescript
// Para tarefas onde o usuário pode ler progressivamente
const stream = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [...],
  stream: true
});

for await (const chunk of stream) {
  // Enviar ao cliente via SSE
  res.write(`data: ${JSON.stringify(chunk)}\n\n`);
}
```

---

## 🔄 Async (Filas)

### Quando Usar

| Síncrono | Assíncrono |
|---|---|
| Resposta imediata ao usuário | Processamento em background |
| Latência crítica (< 1s) | Latência tolerável (segundos/minutos) |
| Falha significa erro do usuário | Falha é retryable |
| Output pequeno | Output grande ou múltiplos |

### Implementação com BullMQ

```typescript
import { Queue, Worker } from 'bullmq';

// Producer
const webhookQueue = new Queue('webhooks', { connection: redisConn });

await webhookQueue.add('process-hotmart', payload, {
  attempts: 3,
  backoff: { type: 'exponential', delay: 1000 },
  removeOnComplete: { age: 86400 }
});

// Worker
const worker = new Worker('webhooks', async (job) => {
  if (job.name === 'process-hotmart') {
    return await processHotmart(job.data);
  }
}, {
  connection: redisConn,
  concurrency: 10, // 10 jobs em paralelo
  limiter: { max: 100, duration: 1000 } // 100 jobs/s
});

worker.on('completed', (job) => logger.info('Job done', { jobId: job.id }));
worker.on('failed', (job, err) => logger.error('Job failed', { jobId: job.id, err }));
```

### Priorização

```typescript
// Fila única com prioridade
await queue.add('urgent-task', data, { priority: 1 }); // alta
await queue.add('normal-task', data, { priority: 5 }); // normal
await queue.add('background-task', data, { priority: 10 }); // baixa
```

---

## 📦 HTTP / API

### Compressão

```typescript
import compression from 'compression';
app.use(compression({
  threshold: 1024, // comprimir apenas > 1KB
  level: 6 // balanceado
}));
```

### Paginação

```typescript
// ❌ RUIM: enviar tudo
app.get('/v1/leads', async (req, res) => {
  const leads = await db.query.leads.findMany();
  res.json(leads);
});

// ✅ BOM: paginação com cursor (escala melhor que offset)
app.get('/v1/leads', async (req, res) => {
  const { cursor, limit = 20 } = req.query;
  const leads = await db.query.leads.findMany({
    cursor: cursor ? { id: cursor } : undefined,
    limit: Math.min(limit, 100),
    orderBy: (leads, { desc }) => desc(leads.createdAt)
  });
  
  res.json({
    data: leads,
    next_cursor: leads.length === limit ? leads[leads.length - 1].id : null
  });
});
```

### ETag (Cache HTTP)

```typescript
app.get('/v1/products/:id', async (req, res) => {
  const product = await getProduct(req.params.id);
  const etag = crypto.createHash('md5').update(JSON.stringify(product)).digest('hex');
  
  res.setHeader('ETag', etag);
  
  if (req.headers['if-none-match'] === etag) {
    return res.status(304).end();
  }
  
  res.json(product);
});
```

---

## 🌐 Frontend (Next.js)

### Server Components (RSC)

```typescript
// ✅ Server Component: roda no servidor, dados já chegam prontos
export default async function LeadList() {
  const leads = await db.query.leads.findMany({ limit: 20 });
  return <ul>{leads.map(l => <li key={l.id}>{l.name}</li>)}</ul>;
}

// ⚠️ Client Component: usar com parcimônia
'use client';
export function LeadListClient() {
  const { data, isLoading } = trpc.leads.list.useQuery();
  if (isLoading) return <Spinner />;
  return <ul>{data?.map(l => <li key={l.id}>{l.name}</li>)}</ul>;
}
```

### Image Optimization

```typescript
import Image from 'next/image';

<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority // preload LCP
  quality={85}
  placeholder="blur"
/>
```

### Code Splitting

```typescript
import dynamic from 'next/dynamic';

// Carregar sob demanda
const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <Skeleton />,
  ssr: false
});
```

### Bundle Size

```bash
# Medir
npx next build

# Alvo
# - First Load JS: < 100KB
# - Total por rota: < 200KB
# - LCP: < 2.5s
# - FID: < 100ms
# - CLS: < 0.1
```

---

## 📊 Métricas e Observabilidade

### OpenTelemetry

```typescript
import { trace, SpanStatusCode } from '@opentelemetry/api';

const tracer = trace.getTracer('nexus-api');

async function processLead(lead: Lead) {
  return tracer.startActiveSpan('process_lead', async (span) => {
    span.setAttribute('tenant.id', lead.tenantId);
    span.setAttribute('lead.id', lead.id);
    
    try {
      // ... lógica
      span.setStatus({ code: SpanStatusCode.OK });
    } catch (err) {
      span.recordException(err);
      span.setStatus({ code: SpanStatusCode.ERROR });
      throw err;
    } finally {
      span.end();
    }
  });
}
```

### Métricas Chave

```typescript
import { metrics } from '@opentelemetry/api';

const meter = metrics.getMeter('nexus-api');

const requestDuration = meter.createHistogram('http.server.duration', {
  description: 'Duração de request HTTP',
  unit: 'ms'
});

const llmCost = meter.createCounter('llm.cost_brl', {
  description: 'Custo de chamadas LLM em BRL'
});

const dbQueries = meter.createHistogram('db.query.duration', {
  description: 'Duração de queries ao DB',
  unit: 'ms'
});

// Uso
requestDuration.record(Date.now() - start, {
  'http.method': req.method,
  'http.route': req.route
});

llmCost.add(costBRL, {
  'llm.model': 'gpt-4o',
  'llm.provider': 'openai'
});
```

---

## 🧪 Testes de Performance

### Load Test (k6)

```javascript
// load-test.js
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 100 },  // ramp up
    { duration: '1m', target: 1000 },  // stress
    { duration: '30s', target: 0 }     // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<200', 'p(99)<500'],
    http_req_failed: ['rate<0.01']
  }
};

export default function () {
  const res = http.get('https://api.nexus.com.br/v1/products', {
    headers: { 'X-API-Key': 'nxs_test_...' }
  });
  check(res, {
    'status 200': (r) => r.status === 200,
    'latency < 200ms': (r) => r.timings.duration < 200
  });
}
```

```bash
k6 run load-test.js
```

### Profiling

```bash
# CPU profile
node --prof app.js
# Gerar visualização
node --prof-process isolate-*.log > profile.txt

# Memory
node --inspect app.js
# Abrir chrome://inspect

# DB query analysis
EXPLAIN ANALYZE SELECT * FROM leads WHERE tenant_id = 'tenant_abc';
```

---

## 💰 Otimização de Custo

### LLM é o Maior Custo

| Estratégia | Economia |
|---|---|
| Usar modelo menor quando possível | 80%+ |
| Prompt caching (Anthropic) | 90% em system prompts |
| Batching | 30-50% |
| Streaming (UX melhor, custo similar) | — |
| Limitar max_tokens agressivamente | 20-40% |
| Cache de resposta (idempotência) | 100% em retry |

### Tracking de Custo

```typescript
// Toda chamada LLM registra custo
await db.insert(llmUsageLog).values({
  agentId,
  userId,
  tenantId,
  model: 'gpt-4o',
  inputTokens: 1500,
  outputTokens: 800,
  costBRL: calculateCost('gpt-4o', 1500, 800), // ex: R$ 0.18
  timestamp: new Date()
});

// Métrica
metrics.histogram('llm.cost_brl', costBRL, { 'model': model });
```

### Alertas de Custo

```typescript
// Por tenant
if (tenantMonthCost > tenantBudget) {
  await alerting.sendWarning('Tenant excedeu budget', { tenantId });
  // Opcional: bloquear uso adicional
}

// Por skill
if (skillMonthCost > skillBudget) {
  await alerting.sendWarning('Skill excedeu budget', { skillId });
}
```

---

## 📊 Métricas de Sucesso

| Métrica | Meta |
|---|---|
| p95 API | < 200ms |
| p95 LLM call | < 5s |
| p95 webhook processing | < 5s |
| Cache hit rate | > 80% |
| DB connection pool utilization | < 80% |
| Worker queue lag | < 1 min |
| Custo LLM/1000 requests | < R$ 5 |
| Lighthouse score (web) | > 90 |
| Core Web Vitals | OK |

---

## 🔗 Documentos Relacionados

- `00-prompt-engineering.md` — otimizar prompts
- `01-error-handling.md` — retry, circuit breaker
- `../api-docs/00-trpc-overview.md` — onde performance importa
- `../knowledge-base/01-modelo-ioaid.md` — arquitetura

---

**Versão 1.0** · Atualizado 2026-06-02 · Mantido pela Equipe Nexus
