---
title: "01-webhooks-payload"
description: "Material oficial Academ'IA · lab-nexus"
tags: [lab-nexus, academia]
version: 1.0.0
last_updated: 2026-06-24
status: official
---

title: "01 · Webhooks — Payloads Validados"
description: "Payloads validados de webhooks (Hotmart, Kiwify, Stripe, Eduzz, Shopee) + handlers"
tags: [lab-nexus, automation, webhook, hotmart, kiwify, stripe]
category: automation
level: agente
estimated_time: "30 min"
author: "Equipe Nexus"
version: "1.0"
last_review: "2026-06-02"
linked_skill: webhook-router
course_anchor: cursos/agente/02-disparo-whatsapp.md
🪝 01 · Webhooks — Payloads Validados
Schemas JSON de webhooks para 6 gateways brasileiros + handlers TypeScript prontos para uso.

🎯 Spec
Atributo	Valor
O que é	Schemas de payload para 6 gateways + handlers idempotentes
Quando usar	Setup inicial de integração, debugging, validação
Pré-requisitos	Nível 🥈 Agente; endpoint HTTPS configurado
Tempo estimado	30 min para integrar 1 gateway
Skill que executa	webhook-router
Judge que valida	compliance-auditor
📋 Playbook — Fluxo Canônico
1. Configurar endpoint HTTPS
yaml

Copy
requisitos:

  - "HTTPS válido (certificado SSL)"

  - "URL pública acessível"

  - "Resposta 200 em até 5s (evitar timeout)"

  - "Implementar retry com backoff no emissor"


exemplo_url: "https://api.nexus.com.br/webhooks/hotmart"
2. Validar assinatura
yaml

Copy
processo:

  - "Gateway envia header X-Signature (HMAC SHA-256)"

  - "Seu servidor recalcula HMAC com seu secret"

  - "Compara em tempo constante (timingSafeEqual)"

  - "Rejeita se diferente (status 401)"

  - "Logs de auditoria"
3. Processar idempotentemente
yaml

Copy
principio: "Mesmo evento entregue 2x = processar 1x apenas"

implementacao:

  - "Salvar event_id em tabela de idempotência"

  - "Verificar antes de processar"

  - "Status 200 mesmo se duplicado (evita retry)"
4. Responder rápido (≤ 5s)
yaml

Copy
processo_async:

  - "Endpoint responde 200 IMEDIATAMENTE"

  - "Processamento pesado vai para fila (SQS, Redis, etc.)"

  - "Worker processa em background"

  - "Logs estruturados para auditoria"
📦 Asset (6 Payloads Validados)
💳 Hotmart — Compra Aprovada
json

Copy
{

  "id": "evt_abc123",

  "event": "PURCHASE_APPROVED",

  "version": "2.0.0",

  "data": {

    "purchase": {

      "transaction": "HP123456789",

      "status": "APPROVED",

      "order_date": 1717267200000,

      "approved_date": 1717267500000,

      "price": {

        "value": 497.00,

        "currency_code": "BRL"

      },

      "payment": {

        "type": "CREDIT_CARD",

        "installments_number": 1

      },

      "product": {

        "id": "PROD123",

        "name": "Curso Nexus Pro",

        "ucode": "nexus-pro-v1"

      },

      "buyer": {

        "name": "Maria Silva",

        "email": "maria@example.com",

        "phone": "11999998888",

        "document": "12345678900"

      },

      "affiliate": {

        "name": "João Afiliado",

        "email": "joao@example.com",

        "ucode": "affil-joao"

      }

    }

  }

}
💳 Kiwify — Compra Aprovada
json

Copy
{

  "id": "evt_xyz789",

  "event": "compra_aprovada",

  "order_id": "KW987654321",

  "order_status": "paid",

  "created_at": "2026-06-02T10:30:00Z",

  "approved_at": "2026-06-02T10:31:15Z",

  "product": {

    "product_id": "PROD456",

    "product_name": "Curso Funil Lucrativo"

  },

  "customer": {

    "full_name": "Maria Silva",

    "email": "maria@example.com",

    "mobile": "5511999998888",

    "cpf": "12345678900"

  },

  "payment": {

    "method": "credit_card",

    "installments": 12,

    "amount": 497.00,

    "currency": "BRL"

  },

  "affiliate": {

    "id": "AFF789",

    "name": "João Afiliado",

    "commission": 248.50

  }

}
💳 Stripe — Payment Intent Succeeded
json

Copy
{

  "id": "evt_stripe_abc",

  "type": "payment_intent.succeeded",

  "created": 1717267500,

  "data": {

    "object": {

      "id": "pi_3OabcXYZ",

      "amount": 49700,

      "currency": "brl",

      "payment_method_types": ["card"],

      "status": "succeeded",

      "customer": "cus_ABC123",

      "metadata": {

        "product_id": "PROD123",

        "affiliate_id": "affil-joao"

      },

      "charges": {

        "data": [

          {

            "id": "ch_ABC123",

            "receipt_url": "https://stripe.com/receipt/..."

          }

        ]

      }

    }

  }

}
💳 Eduzz — Compra Aprovada
json

Copy
{

  "id": "evt_eduzz_123",

  "event": "sale_approved",

  "billet_url": null,

  "installments_link": null,

  "transaction": {

    "id": "EDZ123456",

    "status": "approved",

    "payment_method": "credit_card",

    "installments": 1,

    "amount": "497.00",

    "currency": "BRL"

  },

  "product": {

    "id": "PROD789",

    "name": "Mentoria 12k",

    "code": "ment-12k-v1"

  },

  "customer": {

    "id": "CUST123",

    "name": "Maria Silva",

    "email": "maria@example.com",

    "phone": "11999998888",

    "document": "12345678900"

  },

  "affiliate": {

    "id": "AFF456",

    "name": "João Afiliado"

  }

}
🛒 Shopee — Order Status Update
json

Copy
{

  "code": 0,

  "message": "success",

  "data": {

    "orders": [

      {

        "order_sn": "SH123456789",

        "order_status": "COMPLETED",

        "update_time": 1717267500,

        "total_amount": 99.90,

        "currency": "BRL",

        "buyer_user_id": 12345,

        "buyer_username": "maria.silva",

        "item_list": [

          {

            "item_id": 98765,

            "item_name": "Curso Nexus Pro",

            "model_quantity_purchased": 1,

            "model_discounted_price": 99.90

          }

        ]

      }

    ]

  }

}
📧 Generic — Custom Form (Lead)
json

Copy
{

  "id": "evt_lead_001",

  "event": "lead_captured",

  "timestamp": "2026-06-02T10:30:00Z",

  "source": "landing_page_curso",

  "data": {

    "name": "Maria Silva",

    "email": "maria@example.com",

    "phone": "11999998888",

    "utm_source": "facebook",

    "utm_campaign": "lancamento-2026-06",

    "utm_content": "video-a",

    "page_url": "https://nexus.com.br/curso-pro",

    "referrer": "https://facebook.com/ads"

  }

}
📦 Asset (Handler TypeScript Pronto)
typescript

Copy
// /backend/src/webhooks/hotmart.ts

import crypto from 'crypto';

import { z } from 'zod';

import { db } from '../db';

import { webhookEvents } from '../db/schema';


const HotmartPayload = z.object({

  id: z.string(),

  event: z.literal('PURCHASE_APPROVED'),

  data: z.object({

    purchase: z.object({

      transaction: z.string(),

      status: z.literal('APPROVED'),

      buyer: z.object({

        email: z.string().email(),

        name: z.string(),

        phone: z.string().optional(),

      }),

      product: z.object({

        id: z.string(),

        name: z.string(),

        ucode: z.string(),

      }),

      affiliate: z.object({

        ucode: z.string(),

        email: z.string(),

      }).optional(),

    }),

  }),

});


export async function handleHotmartWebhook(req: Request, res: Response) {

  // 1. Validar assinatura

  const signature = req.headers['x-hotmart-signature'];

  const body = JSON.stringify(req.body);

  const expected = crypto

    .createHmac('sha256', process.env.HOTMART_SECRET!)

    .update(body)

    .digest('hex');

  

  if (signature !== expected) {

    return res.status(401).json({ error: 'Invalid signature' });

  }

  

  // 2. Validar schema

  const parse = HotmartPayload.safeParse(req.body);

  if (!parse.success) {

    return res.status(400).json({ error: 'Invalid payload' });

  }

  

  // 3. Idempotência

  const existing = await db

    .select()

    .from(webhookEvents)

    .where(eq(webhookEvents.eventId, parse.data.id))

    .limit(1);

  

  if (existing.length > 0) {

    return res.status(200).json({ status: 'already processed' });

  }

  

  // 4. Salvar evento (auditoria)

  await db.insert(webhookEvents).values({

    eventId: parse.data.id,

    source: 'hotmart',

    payload: req.body,

    processedAt: new Date(),

  });

  

  // 5. Processar async (fila)

  await processPurchaseApproved(parse.data.data.purchase);

  

  // 6. Responder 200 IMEDIATAMENTE

  return res.status(200).json({ status: 'received' });

}
📊 Métricas de Sucesso
Métrica	Meta
Webhooks processados com sucesso	≥ 99%
Tempo de resposta do endpoint	≤ 2s (p95)
Idempotência	100% (zero duplicação)
Retries com sucesso após falha	≥ 95%
Latência webhook → banco	≤ 5s
⚠️ Riscos & Anti-patterns

❌ Não validar assinatura → fraude, evento fake

❌ Processar síncrono (>5s) → gateway timeout, retry infinito

❌ Não ter idempotência → cobrança dupla, mensagens duplicadas

❌ Salvar PII em logs → LGPD violada

❌ Endpoint HTTP (sem TLS) → dados vazam

✅ Sempre validar assinatura

✅ Async processing (fila)

✅ Tabela de idempotência com TTL

✅ Logs sem PII (anonimizar)

🔗 Próximas ferramentas

→ tools/automation/02-triggers-eventos.md — automatize fluxos

→ tools/automation/05-backup-criptografado.md — segurança

→ Lib-Nexus/api-docs/01-webhooks.md — referência

Versão 1.0 · Atualizado 2026-06-02 · Mantido pela Equipe Nexus