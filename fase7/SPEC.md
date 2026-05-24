# Especificação Técnica - Fase 7 White-Label API

## Visão Geral

Implementação do Sprint 1 da Fase 7 com API REST completa para gerenciamento de instâncias White-Label.

## Stack Tecnológica

| Componente | Tecnologia | Versão |
|------------|------------|--------|
| Framework | FastAPI | 0.109.0 |
| Server | Uvicorn | 0.27.0 |
| Validação | Pydantic | 2.5.3 |
| HTTP Client | aiohttp | 3.9.1 |
| Testes | pytest | 7.4.4 |

## Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                      FastAPI Application                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Instances │  │ Branding  │  │ Domains  │  │  Plans   │  │
│  │  Router   │  │  Router   │  │  Router  │  │  Router  │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  │
│       │             │             │             │          │
│       └─────────────┴─────────────┴─────────────┘          │
│                           │                                 │
│  ┌─────────────────────────┴─────────────────────────────┐  │
│  │                     Services Layer                    │  │
│  │  InstanceService │ BrandingService │ DomainService   │  │
│  └─────────────────────────┬─────────────────────────────┘  │
│                            │                                │
│  ┌─────────────────────────┴─────────────────────────────┐ │
│  │                    Models (Pydantic)                   │  │
│  │  Instance │ Branding │ Domain │ Plan │ ApiKey │Webhook│ │
│  └─────────────────────────┬─────────────────────────────┘  │
│                            │                                │
└────────────────────────────┴────────────────────────────────┘
```

## Endpoints Implementados

### White-Label Instances

- [x] `POST /whitelabel/instances` - Criar instância
- [x] `GET /whitelabel/instances` - Listar instâncias (com filtros)
- [x] `GET /whitelabel/instances/{id}` - Obter instância
- [x] `PATCH /whitelabel/instances/{id}` - Atualizar instância
- [x] `POST /whitelabel/instances/{id}/suspend` - Suspender
- [x] `POST /whitelabel/instances/{id}/activate` - Ativar
- [x] `DELETE /whitelabel/instances/{id}` - Cancelar

### Branding

- [x] `GET /whitelabel/branding/{instance_id}` - Obter branding
- [x] `PUT /whitelabel/branding/{instance_id}` - Atualizar
- [x] `POST /whitelabel/branding/{instance_id}/assets` - Upload
- [x] `GET /whitelabel/branding/{instance_id}/preview` - Preview
- [x] `GET /whitelabel/branding/{instance_id}/css` - CSS

### Domains

- [x] `GET /instances/{id}/domains` - Listar
- [x] `POST /instances/{id}/domains` - Adicionar
- [x] `DELETE /instances/{id}/domains/{domain_id}` - Remover
- [x] `GET /instances/{id}/domains/{domain_id}/verify` - Verificar
- [x] `GET /instances/{id}/domains/{domain_id}/instructions` - Instruções
- [x] `GET /instances/{id}/domains/{domain_id}/ssl` - Status SSL

### Plans

- [x] `GET /whitelabel/plans` - Listar planos
- [x] `GET /whitelabel/plans/{id}` - Detalhes do plano

### Webhooks

- [x] `GET /instances/{id}/webhooks` - Listar
- [x] `POST /instances/{id}/webhooks` - Criar
- [x] `DELETE /instances/{id}/webhooks/{webhook_id}` - Remover
- [x] `POST /instances/{id}/webhooks/{webhook_id}/test` - Testar
- [x] `GET /instances/{id}/webhooks/{webhook_id}/logs` - Logs
- [x] `GET /instances/{id}/webhooks/{webhook_id}/stats` - Estatísticas

### Metrics

- [x] `GET /instances/{id}/metrics` - Métricas
- [x] `GET /instances/{id}/users` - Métricas de usuários
- [x] `GET /instances/{id}/revenue` - Métricas de receita
- [x] `GET /instances/{id}/network` - Métricas de rede

## Modelos de Dados

### Instance

```python
{
    "instance_id": "inst_abc123def456",
    "brand_name": "Minha Empresa",
    "brand_slug": "minha-empresa",
    "plan": "professional",
    "status": "active",  # provisioning, active, suspended, cancelled
    "country": "BR",
    "timezone": "America/Sao_Paulo",
    "currency": "BRL",
    "dashboard_url": "https://admin.minha-empresa.mmn-ai-to-ai.com",
    "created_at": "2026-05-24T22:00:00Z"
}
```

### BrandingConfig

```python
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
        "primary_url": "https://...",
        "favicon_url": "https://..."
    }
}
```

## Middlewares

- [x] `AuthMiddleware` - Autenticação via API Key
- [x] `RateLimitMiddleware` - Rate limiting por endpoint
- [x] `ErrorHandlerMiddleware` - Tratamento centralizado de erros

## Rate Limits

| Endpoint | Limite |
|----------|--------|
| POST /instances | 10/min |
| GET /instances | 100/min |
| PUT /branding | 20/min |
| General | 1000/hour |

## Códigos de Erro

| Código | HTTP | Descrição |
|--------|------|-----------|
| VALIDATION_ERROR | 400 | Dados inválidos |
| NOT_FOUND | 404 | Recurso não encontrado |
| CONFLICT | 409 | Conflito (ex: domínio duplicado) |
| RATE_LIMIT_EXCEEDED | 429 | Limite excedido |
| INTERNAL_ERROR | 500 | Erro interno |

## Status: Sprint 1 Completo ✅

Versão: 1.0.0
Data: 2026-05-24
Autor: Nexus-HUB57