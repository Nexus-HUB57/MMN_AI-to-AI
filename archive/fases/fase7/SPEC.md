# Especificação Técnica - Fase 7 White-Label API

## Visão Geral

Implementação da **Fase 7** com **Sprint 1** (Core API), **Sprint 2** (Branding Engine), **Sprint 3** (Domain Management) e **Sprint 4** (Billing Integration) completos.

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
│  │  InstanceService │ BrandingService │ DomainService     │  │
│  │  WebhookService  │  ApiKeyService                      │  │
│  └─────────────────────────┬─────────────────────────────┘  │
│                            │                               │
│  ┌─────────────────────────┴─────────────────────────────┐ │
│  │                    Models (Pydantic)                  │ │
│  │  Instance │ Branding │ Domain │ Plan │ ApiKey │Webhook│ │
│  └─────────────────────────┬─────────────────────────────┘ │
│                            │                              │
└────────────────────────────┴───────────────────────────────┘
```

## Endpoints Implementados

### Sprint 1 - White-Label Instances ✅

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/whitelabel/instances` | POST | Criar instância |
| `/whitelabel/instances` | GET | Listar instâncias (com filtros) |
| `/whitelabel/instances/{id}` | GET | Obter instância |
| `/whitelabel/instances/{id}` | PATCH | Atualizar instância |
| `/whitelabel/instances/{id}/suspend` | POST | Suspender |
| `/whitelabel/instances/{id}/activate` | POST | Ativar |
| `/whitelabel/instances/{id}` | DELETE | Cancelar |

### Sprint 2 - Branding Engine ✅

#### Theme Presets

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/whitelabel/branding/presets` | GET | Listar presets disponíveis |
| `/whitelabel/branding/presets/{preset_id}` | GET | Detalhes do preset |
| `/whitelabel/branding/{instance_id}/apply-preset/{preset_id}` | POST | Aplicar preset |

**Presets Disponíveis**:

| ID | Nome | Descrição |
|----|------|-----------|
| `modern_blue` | Azul Moderno | Tema profissional com tons de azul vibrante |
| `corporate_gray` | Cinza Corporativo | Visual minimalista e profissional |
| `vibrant_purple` | Roxo Vibrante | Cores criativas e modernas |
| `nature_green` | Verde Natureza | Visual fresco e sustentável |
| `elegant_black` | Preto Elegante | Visual luxuoso e sofisticado |
| `sunset_orange` | Laranja Entardecer | Energia e vitalidade |
| `royal_gold` | Ouro Real | Premium e exclusivo |
| `minimal_white` | Branco Minimalista | Clean e essencial |

#### Branding Management

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/whitelabel/branding/{instance_id}` | GET | Obter branding |
| `/whitelabel/branding/{instance_id}` | PUT | Atualizar branding |
| `/whitelabel/branding/{instance_id}/preview` | GET | Preview JSON |
| `/whitelabel/branding/{instance_id}/preview/html` | GET | Preview HTML completo |
| `/whitelabel/branding/{instance_id}/css` | GET | CSS customizado |

#### Asset Management

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/whitelabel/branding/{instance_id}/assets` | POST | Upload de asset |
| `/whitelabel/branding/{instance_id}/validate-asset` | POST | Validar asset (sem upload) |

### Sprint 3 - Domain Management ✅

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/whitelabel/domains/{instance_id}` | GET | Listar domínios da instância |
| `/whitelabel/domains/{instance_id}` | POST | Adicionar domínio |
| `/whitelabel/domains/{instance_id}/{domain_id}` | DELETE | Remover domínio |
| `/whitelabel/domains/{instance_id}/{domain_id}/verify` | GET | Iniciar verificação DNS |
| `/whitelabel/domains/{instance_id}/{domain_id}/confirm-verification` | POST | Confirmar verificação |
| `/whitelabel/domains/{instance_id}/{domain_id}/dns-check` | GET | Verificar propagação DNS |
| `/whitelabel/domains/{instance_id}/{domain_id}/instructions` | GET | Instruções detalhadas |
| `/whitelabel/domains/{instance_id}/{domain_id}/ssl` | GET | Status do certificado SSL |
| `/whitelabel/domains/{instance_id}/{domain_id}/renew-ssl` | POST | Renovar certificado SSL |
| `/whitelabel/domains/{instance_id}/{domain_id}/config` | GET | Configuração completa |
| `/whitelabel/domains/{instance_id}/{domain_id}/preview` | GET | Preview do domínio |

#### Features Implementadas

| Feature | Status | Descrição |
|---------|--------|-----------|
| **Custom Domains** | ✅ | Gerenciamento de domínios customizados |
| **DNS Verification** | ✅ | Verificação automática de registros DNS |
| **SSL Provisioning** | ✅ | Provisionamento automático Let's Encrypt |
| **Reverse Proxy** | ✅ | Configuração de proxy reverso |
| **DNS Propagation** | ✅ | Verificação de propagação DNS |
| **Preview Generation** | ✅ | Geração de preview da configuração |

### Plans

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/whitelabel/plans` | GET | Listar planos |
| `/whitelabel/plans/{id}` | GET | Detalhes do plano |

### Sprint 4 - Billing Integration ✅

#### Subscriptions

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/whitelabel/billing/subscriptions` | POST | Criar assinatura |
| `/whitelabel/billing/subscriptions` | GET | Listar assinaturas |
| `/whitelabel/billing/subscriptions/{id}` | GET | Detalhes da assinatura |
| `/whitelabel/billing/subscriptions/instance/{instance_id}` | GET | Assinatura da instância |
| `/whitelabel/billing/subscriptions/{id}` | PATCH | Atualizar assinatura |
| `/whitelabel/billing/subscriptions/{id}/cancel` | POST | Cancelar assinatura |
| `/whitelabel/billing/subscriptions/{id}/reactivate` | POST | Reativar assinatura |
| `/whitelabel/instances/{id}/change-plan` | POST | Upgrade/Downgrade |

#### Payments

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/whitelabel/billing/payments` | POST | Criar pagamento |
| `/whitelabel/billing/payments/{id}` | GET | Detalhes do pagamento |
| `/whitelabel/billing/payments/{id}/process` | POST | Processar pagamento |
| `/whitelabel/billing/payments/{id}/refund` | POST | Estornar pagamento |
| `/whitelabel/instances/{id}/payments` | GET | Listar pagamentos |

#### Invoices

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/whitelabel/billing/invoices` | POST | Criar fatura |
| `/whitelabel/billing/invoices/{id}` | GET | Detalhes da fatura |
| `/whitelabel/instances/{id}/invoices` | GET | Listar faturas |
| `/whitelabel/billing/invoices/{id}/mark-paid` | POST | Marcar como paga |

#### Coupons

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/whitelabel/billing/coupons` | POST | Criar cupom |
| `/whitelabel/billing/coupons/validate/{code}` | GET | Validar cupom |
| `/whitelabel/billing/coupons/apply` | POST | Aplicar cupom |

#### Pricing & Summary

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/whitelabel/billing/pricing/{plan}/{cycle}` | GET | Preço do plano |
| `/whitelabel/billing/pricing/preview` | POST | Preview de preço |
| `/whitelabel/instances/{id}/summary` | GET | Resumo de billing |
| `/whitelabel/instances/{id}/usage` | GET | Métricas de uso |

#### Payment Methods

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/whitelabel/instances/{id}/payment-methods` | GET | Listar métodos |
| `/whitelabel/instances/{id}/payment-methods` | POST | Adicionar método |
| `/whitelabel/instances/{id}/payment-methods/{method_id}` | DELETE | Remover método |

#### Webhook

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/whitelabel/billing/webhook/{provider}` | POST | Webhook (Stripe/Pagarme) |

### Webhooks

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/whitelabel/instances/{id}/webhooks` | GET | Listar |
| `/whitelabel/instances/{id}/webhooks` | POST | Criar |
| `/whitelabel/instances/{id}/webhooks/{webhook_id}` | DELETE | Remover |
| `/whitelabel/instances/{id}/webhooks/{webhook_id}/test` | POST | Testar |
| `/whitelabel/instances/{id}/webhooks/{webhook_id}/logs` | GET | Logs |
| `/whitelabel/instances/{id}/webhooks/{webhook_id}/stats` | GET | Estatísticas |

### Metrics

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/whitelabel/instances/{id}/metrics` | GET | Métricas |
| `/whitelabel/instances/{id}/users` | GET | Métricas de usuários |
| `/whitelabel/instances/{id}/revenue` | GET | Métricas de receita |
| `/whitelabel/instances/{id}/network` | GET | Métricas de rede |

## Modelos de Dados

### BrandingConfig (Expandido Sprint 2)

```python
{
    "instance_id": "inst_abc123def456",
    "theme_preset": "modern_blue",  # Sprint 2
    "colors": {
        "primary": "#2563EB",
        "secondary": "#1E40AF",
        "accent": "#F59E0B",
        "background": "#FFFFFF",
        "text": "#1F2937",
        "muted": "#9CA3AF",
        "border": "#E5E7EB",
        "success": "#10B981",
        "error": "#EF4444",
        "warning": "#F59E0B"
    },
    "fonts": {
        "primary": "Inter, system-ui, sans-serif",
        "headings": "Poppins, system-ui, sans-serif",
        "mono": "JetBrains Mono, monospace"
    },
    "logo": {
        "primary_url": "https://...",
        "secondary_url": "https://...",
        "favicon_url": "https://...",
        "og_image_url": "https://..."
    },
    "theme_customization": {  # Sprint 2
        "border_radius": "8px",
        "button_style": "rounded",
        "card_shadow": "0 1px 3px rgba(0,0,0,0.1)",
        "animation_speed": "0.3s"
    }
}
```

### AssetValidationResult (Sprint 2)

```python
{
    "valid": true,
    "errors": [],
    "warnings": ["SVGs devem ser sanitizados para evitar XSS"],
    "metadata": {
        "size_bytes": 102400,
        "content_type": "image/png",
        "filename": "logo.png"
    }
}
```

### ThemePresetInfo (Sprint 2)

```python
{
    "id": "modern_blue",
    "name": "Azul Moderno",
    "description": "Tema profissional com tons de azul vibrante",
    "colors": {
        "primary": "#2563EB",
        "secondary": "#1E40AF",
        "accent": "#3B82F6",
        "background": "#FFFFFF",
        "text": "#1F2937"
    }
}
```

### DomainConfig (Sprint 3)

```python
{
    "id": "dom_uuid123",
    "instance_id": "inst_abc123",
    "domain": "plataforma.empresa.com",
    "domain_type": "alias",  # primary ou alias
    "ssl_enabled": true,
    "verification_status": "verified",  # pending, verifying, verified, failed
    "dns_records": {
        "cname": "abc12345.cname.mmn-ai-to-ai.com",
        "txt": "txt-verification-abc12345"
    },
    "verified_at": "2026-05-24T23:55:00Z"
}
```

### SSLStatus (Sprint 3)

```python
{
    "domain": "plataforma.empresa.com",
    "ssl_enabled": true,
    "certificate_status": "valid",  # pending, valid, expired, error, disabled
    "issuer": "Let's Encrypt",
    "expires_at": "2026-09-24T23:55:00Z",
    "auto_renew": true
}
```

### ReverseProxyConfig (Sprint 3)

```python
{
    "enabled": true,
    "ssl_enabled": true,
    "ssl_provider": "lets_encrypt",
    "ssl_auto_renew": true,
    "redirect_https": true,
    "cache_enabled": false,
    "cdn_enabled": false
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
| POST /branding/assets | 30/min |
| General | 1000/hour |

## Códigos de Erro

| Código | HTTP | Descrição |
|--------|------|-----------|
| VALIDATION_ERROR | 400 | Dados inválidos |
| ASSET_TOO_LARGE | 400 | Arquivo muito grande |
| ASSET_INVALID_TYPE | 400 | Tipo de arquivo não permitido |
| NOT_FOUND | 404 | Recurso não encontrado |
| PRESET_NOT_FOUND | 404 | Preset de tema não encontrado |
| CONFLICT | 409 | Conflito (ex: domínio duplicado) |
| RATE_LIMIT_EXCEEDED | 429 | Limite excedido |
| INTERNAL_ERROR | 500 | Erro interno |

## Status: Sprint 1, Sprint 2 e Sprint 3 Completos ✅

| Sprint | Status | Entregas |
|--------|--------|----------|
| Sprint 1: Core API | ✅ Completo | CRUD instâncias, billing, webhooks, métricas |
| Sprint 2: Branding Engine | ✅ Completo | Temas, presets, preview HTML, validação assets |
| Sprint 3: Domain Management | ✅ Completo | DNS, SSL, proxy reverso, propagação, preview |
| Sprint 4: Billing Integration | ✅ Completo | Stripe/Pagarme, upgrade/downgrade, faturas |

**Versão**: 1.4.0
**Data**: 2026-05-25 00:25
**Autor**: Nexus-HUB57 / MiniMax Agent