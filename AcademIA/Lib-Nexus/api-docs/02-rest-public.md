---
title: "API REST Pública"
description: "Documentação canônica da API REST pública (parceiros, integrações externas)"
tags: [lib-nexus, api-docs, rest, public, canonico, integracao]
category: api-docs
version: "1.0"
last_review: "2026-06-02"
status: official
---

# 🌐 API REST Pública

> Documentação canônica da **API REST pública** do Nexus — usada por **parceiros, integrações externas** e **white-label customers** que precisam de acesso programático.

---

## 🎯 Quando Usar REST Público

| Cenário | Usar |
|---|---|
| App interno do Nexus | tRPC |
| Integração com parceiro externo | **REST público** |
| Webhook para gateway | Webhook handler |
| Parceiro white-label | **REST público** + chaves |
| Mobile app nativo | **REST público** |
| Excel/Sheets/PowerBI | **REST público** |

---

## 🏗️ Arquitetura

### Stack
- **Framework**: Fastify (perf)
- **Versão**: HTTP/1.1 + HTTP/2
- **Auth**: API Key (header) + OAuth 2.0 (avançado)
- **Documentação**: OpenAPI 3.1 (gerada automaticamente)
- **Versionamento**: URL (`/v1/...`)
- **Rate limit**: 60 req/min (basic) / 600 req/min (pro)

### URL Base
```
Produção: https://api.nexus.com.br/v1
Sandbox:  https://api.sandbox.nexus.com.br/v1
```

---

## 🔐 Autenticação

### API Key (header)
```http
GET /v1/leads
X-API-Key: nxs_live_abc123def456...
X-Tenant-Id: tenant_abc
Content-Type: application/json
```

### OAuth 2.0 (parceiros)
```http
POST /oauth/token
Authorization: Basic <client_id:client_secret>
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials&scope=leads:read
```

Resposta:
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "leads:read"
}
```

Uso:
```http
GET /v1/leads
Authorization: Bearer eyJhbGc...
```

---

## 📐 Convenções

### REST Canônico
- `GET /v1/resource` — listar
- `GET /v1/resource/:id` — obter
- `POST /v1/resource` — criar
- `PUT /v1/resource/:id` — atualizar (completo)
- `PATCH /v1/resource/:id` — atualizar (parcial)
- `DELETE /v1/resource/:id` — deletar

### Paginação
```http
GET /v1/leads?page=2&limit=20&sort=-createdAt
```

Resposta:
```json
{
  "data": [ /* 20 leads */ ],
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 1234,
    "total_pages": 62,
    "has_next": true,
    "has_prev": true
  }
}
```

### Filtros
```http
GET /v1/leads?tag=quente&created_after=2026-01-01&source=facebook
```

### Errors
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email inválido",
    "details": {
      "field": "email",
      "value": "maria@",
      "constraint": "must be a valid email"
    },
    "request_id": "req_abc123"
  }
}
```

---

## 📚 Endpoints Canônicos

### Leads

#### `POST /v1/leads` — Criar lead
```http
POST /v1/leads
Content-Type: application/json
X-API-Key: nxs_live_...

{
  "name": "Maria Silva",
  "email": "maria@example.com",
  "phone": "11999998888",
  "source": "facebook",
  "tags": ["quente", "interessado"],
  "consent": true,
  "consent_at": "2026-06-02T10:30:00Z"
}
```

Resposta (201):
```json
{
  "id": "lead_abc123",
  "name": "Maria Silva",
  "email": "maria@example.com",
  "phone": "11999998888",
  "source": "facebook",
  "tags": ["quente", "interessado"],
  "created_at": "2026-06-02T10:30:05Z"
}
```

#### `GET /v1/leads` — Listar leads
```http
GET /v1/leads?page=1&limit=20&tag=quente&source=facebook
```

Resposta (200):
```json
{
  "data": [
    {
      "id": "lead_abc123",
      "name": "Maria Silva",
      "email": "maria@example.com",
      "source": "facebook",
      "tags": ["quente"],
      "created_at": "2026-06-02T10:30:05Z"
    }
  ],
  "pagination": { /* ... */ }
}
```

#### `GET /v1/leads/:id` — Obter lead
```http
GET /v1/leads/lead_abc123
```

#### `PATCH /v1/leads/:id` — Atualizar
```http
PATCH /v1/leads/lead_abc123
Content-Type: application/json

{
  "tags": ["cliente", "vip"]
}
```

#### `DELETE /v1/leads/:id` — Deletar (LGPD)
```http
DELETE /v1/leads/lead_abc123
```
Resposta: 204 No Content (soft delete, anonimização após 30 dias).

### Orders (Compras)

#### `POST /v1/orders` — Criar pedido
#### `GET /v1/orders/:id` — Obter pedido

### Affiliates

#### `GET /v1/affiliates` — Listar
#### `GET /v1/affiliates/:id/stats` — Estatísticas

### Analytics

#### `GET /v1/analytics/funnel` — Dados de funil
```http
GET /v1/analytics/funnel?period=last_30d
```

#### `GET /v1/analytics/kpis` — KPIs
```http
GET /v1/analytics/kpis?period=today
```

Resposta:
```json
{
  "data": {
    "visits": 1234,
    "leads": 246,
    "conversion_rate": 0.199,
    "cpl": 12.50,
    "revenue": 12450.00
  }
}
```

### Webhooks (saída)

#### `POST /v1/webhooks` — Registrar webhook
```http
POST /v1/webhooks
{
  "url": "https://parceiro.com/webhook",
  "events": ["lead.created", "order.paid"],
  "secret": "wh_sec_abc123..."
}
```

#### `GET /v1/webhooks/:id/logs` — Logs de entrega

---

## 🔄 Webhooks (Saída)

O Nexus pode **enviar** webhooks para parceiros quando eventos acontecem.

### Eventos Disponíveis
- `lead.created`
- `lead.updated`
- `lead.deleted`
- `order.created`
- `order.paid`
- `order.refunded`
- `affiliate.converted`
- `affiliate.payout`

### Payload
```json
{
  "id": "evt_xyz",
  "type": "lead.created",
  "created_at": "2026-06-02T10:30:00Z",
  "tenant_id": "tenant_abc",
  "data": {
    "lead": {
      "id": "lead_abc123",
      "name": "Maria Silva",
      "email": "maria@example.com"
    }
  }
}
```

### Assinatura
Header: `X-Nexus-Signature: sha256=<hex>`

Verificação (lado do parceiro):
```javascript
const crypto = require('crypto');

function verify(req, secret) {
  const sig = req.headers['x-nexus-signature'].replace('sha256=', '');
  const expected = crypto
    .createHmac('sha256', secret)
    .update(req.rawBody)
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}
```

---

## 🛡️ Rate Limiting

### Headers de Resposta
```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1717267500
```

### Limites por Plano
| Plano | RPM | Burst | Webhooks/dia |
|---|---|---|---|
| Free | 60 | 100 | 100 |
| Pro | 600 | 1000 | 10.000 |
| Enterprise | Custom | Custom | Custom |

### Resposta 429
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Limite de 60 req/min excedido. Tente em 32s.",
    "retry_after_ms": 32000
  }
}
```

---

## 📊 Métricas de Sucesso

| Métrica | Meta |
|---|---|
| Latência p95 | < 300ms |
| Latência p99 | < 800ms |
| Uptime | 99.5% |
| Error rate | < 0.5% |
| Webhook delivery rate | ≥ 99% |

---

## 🧪 Sandbox

```bash
# Sandbox URL
https://api.sandbox.nexus.com.br/v1

# API Key de teste
nxs_test_abc123...

# Exemplo
curl -X POST https://api.sandbox.nexus.com.br/v1/leads \
  -H "X-API-Key: nxs_test_abc123..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Lead",
    "email": "test@example.com",
    "source": "api_test",
    "consent": true
  }'
```

---

## ⚠️ Erros Comuns

❌ Esquecer header `X-API-Key` → 401
❌ Usar API key de produção em sandbox (ou vice-versa) → 401
❌ Não enviar `consent: true` para LGPD → 422
❌ Enviar PII em logs → 500 + alerta
❌ Esquecer paginação em listas → timeout + dados cortados
❌ Tratar webhook como "garantido" → implementar retry

✅ **Sempre API Key no header**
✅ **Sempre `consent: true` para criar lead**
✅ **Paginar sempre**
✅ **Webhook: implementar retry + dedup**
✅ **Logs sem PII**

---

## 🔗 Documentos Relacionados

- `00-trpc-overview.md` — API interna
- `01-webhooks.md` — webhooks de entrada
- `../knowledge-base/03-conformidade-lgpd.md` — LGPD
- `../../sync/agent-bridge.json` — mapeamento

---

**Versão 1.0** · Atualizado 2026-06-02 · Mantido pela Equipe Nexus
