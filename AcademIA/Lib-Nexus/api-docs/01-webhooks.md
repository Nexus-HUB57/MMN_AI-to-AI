---
title: "Webhooks · Integrações Externas"
description: "Documentação canônica dos webhooks do Nexus (Hotmart, Kiwify, Stripe, Eduzz, Shopee)"
tags: [lib-nexus, api-docs, webhooks, canonico, integracao]
category: api-docs
version: "1.0"
last_review: "2026-06-02"
status: canonico
---

# 🪝 Webhooks · Integrações Externas

> Documentação canônica dos **webhooks** que o Nexus **consome** de gateways externos (Hotmart, Kiwify, Stripe, Eduzz, Shopee) e como processá-los com **segurança** e **idempotência**.

---

## 🎯 Conceito

**Webhook** = notificação HTTP enviada por um serviço externo quando um **evento** acontece. Em vez de fazer polling ("tem evento novo?"), o Nexus recebe via POST.

### Fluxo Canônico
```
[Gateway] ──POST──► [Endpoint HTTPS] ──valida──► [Fila] ──processa──► [DB]
                          │
                          └──► responde 200 IMEDIATAMENTE
```

**Requisito crítico**: responder **200 OK em ≤ 5s**. Processamento pesado vai para **fila assíncrona** (BullMQ).

---

## 🔐 Segurança

### Validação de Assinatura (HMAC SHA-256)

Todo gateway envia uma **assinatura** no header. O Nexus valida com **HMAC SHA-256** + comparação **timing-safe**.

```typescript
import crypto from 'crypto';
import { timingSafeEqual } from 'crypto';

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  const sigBuffer = Buffer.from(signature, 'hex');
  const expBuffer = Buffer.from(expected, 'hex');
  
  if (sigBuffer.length !== expBuffer.length) return false;
  
  return timingSafeEqual(sigBuffer, expBuffer);
}
```

### Endpoints
| Gateway | URL | Header de assinatura | Formato |
|---|---|---|---|
| **Hotmart** | `/webhooks/hotmart` | `X-Hotmart-Signature` | hex |
| **Kiwify** | `/webhooks/kiwify` | `X-Kiwify-Signature` | hex |
| **Stripe** | `/webhooks/stripe` | `Stripe-Signature` | t=...,v1=... |
| **Eduzz** | `/webhooks/eduzz` | `X-Eduzz-Signature` | hex |
| **Shopee** | `/webhooks/shopee` | `Authorization` | HMAC-SHA256 |

---

## 📦 Payloads Validados

### Hotmart — `PURCHASE_APPROVED`
```json
{
  "id": "evt_abc123",
  "event": "PURCHASE_APPROVED",
  "version": "2.0.0",
  "data": {
    "purchase": {
      "transaction": "HP123456789",
      "status": "APPROVED",
      "price": { "value": 497.00, "currency_code": "BRL" },
      "buyer": {
        "name": "Maria Silva",
        "email": "maria@example.com",
        "phone": "11999998888",
        "document": "12345678900"
      },
      "product": { "id": "PROD123", "name": "Curso X", "ucode": "curso-x-v1" },
      "affiliate": { "ucode": "affil-joao", "email": "joao@example.com" }
    }
  }
}
```

### Kiwify — `compra_aprovada`
```json
{
  "id": "evt_xyz789",
  "event": "compra_aprovada",
  "order_id": "KW987654321",
  "order_status": "paid",
  "product": { "product_id": "PROD456", "product_name": "Curso Y" },
  "customer": {
    "full_name": "Maria Silva",
    "email": "maria@example.com",
    "mobile": "5511999998888",
    "cpf": "12345678900"
  },
  "payment": { "method": "credit_card", "installments": 12, "amount": 497.00 },
  "affiliate": { "id": "AFF789", "name": "João", "commission": 248.50 }
}
```

### Stripe — `payment_intent.succeeded`
```json
{
  "id": "evt_stripe_abc",
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_3OabcXYZ",
      "amount": 49700,
      "currency": "brl",
      "customer": "cus_ABC123",
      "metadata": { "product_id": "PROD123", "affiliate_id": "affil-joao" }
    }
  }
}
```

### Eduzz — `sale_approved`
```json
{
  "id": "evt_eduzz_123",
  "event": "sale_approved",
  "transaction": {
    "id": "EDZ123456",
    "status": "approved",
    "payment_method": "credit_card",
    "amount": "497.00"
  },
  "product": { "id": "PROD789", "name": "Mentoria", "code": "ment-12k-v1" },
  "customer": {
    "id": "CUST123",
    "name": "Maria Silva",
    "email": "maria@example.com",
    "phone": "11999998888",
    "document": "12345678900"
  },
  "affiliate": { "id": "AFF456", "name": "João" }
}
```

### Shopee — Order Status Update
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "orders": [
      {
        "order_sn": "SH123456789",
        "order_status": "COMPLETED",
        "total_amount": 99.90,
        "currency": "BRL",
        "buyer_user_id": 12345,
        "buyer_username": "maria.silva"
      }
    ]
  }
}
```

---

## 🔄 Processamento Assíncrono

### Padrão: Endpoint → Fila → Worker

```typescript
// 1. Endpoint recebe webhook
// /backend/src/webhooks/hotmart.ts
import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import { webhookQueue } from '../queue';

export const hotmartRouter = router({
  webhook: publicProcedure
    .input(z.object({ /* schema Hotmart */ }))
    .mutation(async ({ ctx, input }) => {
      // 1. Validar assinatura
      if (!verifyWebhookSignature(ctx.req.body, ctx.req.headers['x-hotmart-signature'], process.env.HOTMART_SECRET)) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      // 2. Verificar idempotência
      const existing = await ctx.db.query.webhookEvents.findFirst({
        where: (e, { eq }) => eq(e.eventId, input.id)
      });
      if (existing) {
        return { status: 'already_processed' };
      }

      // 3. Salvar evento (audit trail)
      await ctx.db.insert(webhookEvents).values({
        eventId: input.id,
        source: 'hotmart',
        payload: input,
        receivedAt: new Date()
      });

      // 4. Enfileirar para processamento
      await webhookQueue.add('process-hotmart', input, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 }
      });

      // 5. Responder 200 IMEDIATAMENTE
      return { status: 'queued' };
    })
});

// 2. Worker processa
// /backend/src/workers/webhookProcessor.ts
import { Worker } from 'bullmq';
import { processHotmartPurchase } from '../integrations/hotmart';

const worker = new Worker('webhooks', async (job) => {
  if (job.name === 'process-hotmart') {
    await processHotmartPurchase(job.data);
  }
  // ... outros gateways
}, { connection: redisConnection });

worker.on('failed', (job, err) => {
  logger.error('Webhook processing failed', { jobId: job.id, err });
});
```

---

## 🛡️ Idempotência

**Problema**: gateway pode enviar o mesmo evento 2+ vezes (retry automático).

**Solução**: deduplicação por `event_id`.

```typescript
// Salvar event_id antes de processar
await db.insert(webhookEvents).values({
  eventId: input.id,
  source: 'hotmart',
  processedAt: null
});

// Verificar antes de processar
const already = await db.query.webhookEvents.findFirst({
  where: (e, { eq, and }) => and(
    eq(e.eventId, input.id),
    eq(e.processedAt, null)
  )
});
```

**Tabela de retenção**: 30 dias. Após isso, `event_id` pode ser reusado pelo gateway, então removemos.

---

## 🔁 Retry com Backoff Exponencial

```typescript
import { Queue, QueueOptions } from 'bullmq';

const webhookQueue = new Queue('webhooks', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 1000 // 1s, 2s, 4s, 8s, 16s
    },
    removeOnComplete: { age: 86400, count: 1000 }, // 24h
    removeOnFail: { age: 604800 } // 7 dias (para debug)
  }
});
```

**Após 5 tentativas falhas**: alerta crítico + dead-letter queue.

---

## 🧪 Testes de Webhook

### Sandbox / Staging
Cada gateway tem **ambiente sandbox**:
- Hotmart: `https://sandbox.hotmart.com`
- Stripe: `sk_test_*` keys
- Kiwify: `https://sandbox.kiwify.com.br`

### Teste Local (ngrok)
```bash
# 1. Subir ngrok
ngrok http 3000

# 2. Configurar webhook no gateway
https://abc123.ngrok.io/webhooks/hotmart

# 3. Disparar evento teste
curl -X POST https://sandbox.hotmart.com/webhooks/test \
  -H "X-Hotmart-Signature: $(echo -n '{...}' | openssl dgst -sha256 -hmac $SECRET | cut -d' ' -f2)" \
  -d @payload.json
```

---

## 📊 Métricas de Sucesso

| Métrica | Meta |
|---|---|
| Webhook recebido com sucesso | ≥ 99% |
| Latência de processamento (p95) | ≤ 5s |
| Taxa de retry bem-sucedido | ≥ 95% |
| Idempotência | 100% (zero duplicação) |
| Eventos perdidos | 0 |

---

## ⚠️ Erros Comuns

❌ Esquecer de validar assinatura → fraude/evento fake
❌ Processar síncrono (longo) → gateway timeout, retry infinito
❌ Sem idempotência → cobrança dupla, mensagens duplicadas
❌ Salvar PII em logs → LGPD violada
❌ Endpoint HTTP (sem TLS) → dados vazam
❌ Não tratar todos os eventos do gateway →漏漏

✅ **Sempre validar assinatura**
✅ **Async processing (fila)**
✅ **Tabela de idempotência com TTL**
✅ **Logs sem PII (anonimizar)**
✅ **Tratar TODOS os eventos do gateway**

---

## 🔗 Documentos Relacionados

- `00-trpc-overview.md` — API interna
- `02-rest-public.md` — REST pública (parceiros)
- `../agents-specs/03-federation-gate.md` — PII Gate nos webhooks
- `../knowledge-base/03-conformidade-lgpd.md` — LGPD
- `../../playbooks/PB-CRISES-gestao-crise-data-loss.md` — crise

---

**Versão 1.0** · Atualizado 2026-06-02 · Mantido pela Equipe Nexus
