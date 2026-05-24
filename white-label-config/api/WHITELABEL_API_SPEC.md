# API REST - White-Label Management

## Visão Geral

Este documento especifica a API REST para gerenciamento completo de instâncias White-Label da plataforma MMN_AI-to-AI.

## Base URL

```
Production: https://api.mmn-ai-to-ai.com/v1
Staging:    https://api.staging.mmn-ai-to-ai.com/v1
Local:      http://localhost:3000/v1
```

## Autenticação

### Bearer Token

```http
Authorization: Bearer {API_KEY}
```

### Tipos de API Keys

| Tipo | Permissões |
|------|------------|
| Partner Key | Gerenciar instâncias próprias |
| Admin Key | Acesso total à plataforma |
| Instance Key | Operações dentro de uma instância |

## Instâncias

### Criar Instância

```http
POST /whitelabel/instances
```

**Request Body:**
```json
{
  "brand_name": "Minha Empresa",
  "brand_slug": "minha-empresa",
  "plan": "professional",
  "admin_email": "admin@minhaempresa.com",
  "admin_name": "João Silva",
  "country": "BR",
  "timezone": "America/Sao_Paulo",
  "currency": "BRL"
}
```

**Response (201 Created):**
```json
{
  "instance_id": "inst_abc123def456",
  "brand_name": "Minha Empresa",
  "brand_slug": "minha-empresa",
  "plan": "professional",
  "status": "provisioning",
  "created_at": "2026-05-24T22:50:00Z",
  "dashboard_url": "https://admin.minhaempresa.mmn-ai-to-ai.com",
  "api_endpoint": "https://api.minhaempresa.mmn-ai-to-ai.com/v1"
}
```

### Listar Instâncias

```http
GET /whitelabel/instances
GET /whitelabel/instances?status=active&plan=professional
```

**Query Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| status | string | filtering por status (provisioning, active, suspended, cancelled) |
| plan | string | filtering por plano |
| page | integer | Número da página (default: 1) |
| limit | integer | Itens por página (default: 20, max: 100) |

**Response:**
```json
{
  "data": [
    {
      "instance_id": "inst_abc123def456",
      "brand_name": "Minha Empresa",
      "plan": "professional",
      "status": "active",
      "user_count": 1520,
      "created_at": "2026-05-24T22:50:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

### Obter Instância

```http
GET /whitelabel/instances/{instance_id}
```

### Atualizar Instância

```http
PATCH /whitelabel/instances/{instance_id}
```

**Request Body:**
```json
{
  "brand_name": "Nova Empresa",
  "plan": "enterprise",
  "timezone": "America/New_York"
}
```

### Suspender Instância

```http
POST /whitelabel/instances/{instance_id}/suspend
```

### Reativar Instância

```http
POST /whitelabel/instances/{instance_id}/activate
```

### Cancelar Instância

```http
DELETE /whitelabel/instances/{instance_id}
```

---

## Branding

### Obter Configuração de Branding

```http
GET /whitelabel/instances/{instance_id}/branding
```

### Atualizar Branding

```http
PUT /whitelabel/instances/{instance_id}/branding
```

**Request Body:**
```json
{
  "colors": {
    "primary": "#2563EB",
    "secondary": "#1E40AF",
    "accent": "#F59E0B",
    "background": "#FFFFFF",
    "text": "#1F2937"
  },
  "fonts": {
    "primary": "Inter, sans-serif",
    "headings": "Poppins, sans-serif"
  },
  "logo": {
    "primary_url": "https://cdn.minhaempresa.com/logo.png",
    "secondary_url": "https://cdn.minhaempresa.com/logo-small.png",
    "favicon_url": "https://cdn.minhaempresa.com/favicon.ico"
  }
}
```

### Upload de Assets

```http
POST /whitelabel/instances/{instance_id}/branding/assets
Content-Type: multipart/form-data

file: [binary image]
type: logo_primary | logo_secondary | favicon | og_image
```

**Response:**
```json
{
  "asset_id": "asset_xyz789",
  "url": "https://cdn.mmn-ai-to-ai.com/instances/inst_abc123/assets/logo-primary.png",
  "type": "logo_primary"
}
```

---

## Domínios

### Listar Domínios

```http
GET /whitelabel/instances/{instance_id}/domains
```

### Adicionar Domínio

```http
POST /whitelabel/instances/{instance_id}/domains
```

**Request Body:**
```json
{
  "domain": "plataforma.minhaempresa.com",
  "type": "primary | alias",
  "ssl_enabled": true
}
```

### Verificar Domínio (DNS)

```http
GET /whitelabel/instances/{instance_id}/domains/{domain_id}/verify
```

**Response:**
```json
{
  "domain": "plataforma.minhaempresa.com",
  "verification_status": "verified",
  "dns_records": {
    "cname": "cname.mmn-ai-to-ai.com",
    "txt": "txt-verification-abc123"
  }
}
```

### Remover Domínio

```http
DELETE /whitelabel/instances/{instance_id}/domains/{domain_id}
```

---

## Usuários

### Listar Usuários da Instância

```http
GET /whitelabel/instances/{instance_id}/users
```

### Criar Usuário Admin

```http
POST /whitelabel/instances/{instance_id}/users
```

**Request Body:**
```json
{
  "email": "admin@minhaempresa.com",
  "name": "João Silva",
  "role": "admin",
  "password": "securePassword123!"
}
```

---

## Métricas e Analytics

### Dashboard de Métricas

```http
GET /whitelabel/instances/{instance_id}/metrics
GET /whitelabel/instances/{instance_id}/metrics?period=30d
```

**Response:**
```json
{
  "period": "30d",
  "metrics": {
    "total_users": 1520,
    "active_users": 1280,
    "new_users": 145,
    "gmv": 245000.00,
    "commission_paid": 24500.00,
    "conversion_rate": 3.2
  },
  "trends": {
    "users_growth": "+12%",
    "gmv_growth": "+8%",
    "conversion_growth": "+0.5%"
  }
}
```

---

## Planos e Billing

### Listar Planos

```http
GET /whitelabel/plans
```

**Response:**
```json
{
  "plans": [
    {
      "id": "starter",
      "name": "Starter",
      "price_monthly": 2997,
      "price_yearly": 28772,
      "features": {
        "users": 1000,
        "domains": 1,
        "api_calls": 100000,
        "commission": 5
      }
    },
    {
      "id": "professional",
      "name": "Professional",
      "price_monthly": 7997,
      "price_yearly": 76772,
      "features": {
        "users": 10000,
        "domains": 3,
        "api_calls": 1000000,
        "commission": 10
      }
    },
    {
      "id": "enterprise",
      "name": "Enterprise",
      "price_monthly": null,
      "price_yearly": null,
      "features": {
        "users": -1,
        "domains": -1,
        "api_calls": -1,
        "commission": 15
      }
    }
  ]
}
```

### Atualizar Plano

```http
PUT /whitelabel/instances/{instance_id}/plan
```

**Request Body:**
```json
{
  "plan_id": "enterprise",
  "billing_cycle": "yearly"
}
```

---

## Webhooks

### Registrar Webhook

```http
POST /whitelabel/instances/{instance_id}/webhooks
```

**Request Body:**
```json
{
  "url": "https://minhaempresa.com/webhook",
  "events": [
    "instance.activated",
    "user.signup",
    "commission.credited"
  ],
  "secret": "whsec_webhook_secret"
}
```

### Listar Webhooks

```http
GET /whitelabel/instances/{instance_id}/webhooks
```

### Testar Webhook

```http
POST /whitelabel/instances/{instance_id}/webhooks/{webhook_id}/test
```

---

## Códigos de Erro

| Código | HTTP Status | Descrição |
|--------|-------------|-----------|
| WL_001 | 400 | Dados de requisição inválidos |
| WL_002 | 404 | Instância não encontrada |
| WL_003 | 409 | Domínio já cadastrado |
| WL_004 | 422 | Domínio não verificado |
| WL_005 | 429 | Rate limit excedido |
| WL_006 | 403 | Plano não permite este recurso |
| WL_007 | 500 | Erro interno do servidor |

---

## Rate Limits

| Endpoint | Limite |
|----------|--------|
| POST /instances | 10 req/min |
| GET /instances | 100 req/min |
| PUT /branding | 20 req/min |
| General | 1000 req/hour |

---

**Versão**: 1.0
**Última Atualização**: 2026-05-24
**Mantido por**: Nexus-HUB57