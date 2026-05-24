# Especificação Técnica - Fase 7 White-Label API

## Visão Geral

Implementação da **Fase 7** com **Sprint 1** (Core API) e **Sprint 2** (Branding Engine) completos.

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

### Domains

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/whitelabel/instances/{id}/domains` | GET | Listar |
| `/whitelabel/instances/{id}/domains` | POST | Adicionar |
| `/whitelabel/instances/{id}/domains/{domain_id}` | DELETE | Remover |
| `/whitelabel/instances/{id}/domains/{domain_id}/verify` | GET | Verificar |
| `/whitelabel/instances/{id}/domains/{domain_id}/instructions` | GET | Instruções |
| `/whitelabel/instances/{id}/domains/{domain_id}/ssl` | GET | Status SSL |

### Plans

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/whitelabel/plans` | GET | Listar planos |
| `/whitelabel/plans/{id}` | GET | Detalhes do plano |

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

## Status: Sprint 1 e Sprint 2 Completos ✅

| Sprint | Status | Entregas |
|--------|--------|----------|
| Sprint 1: Core API | ✅ Completo | CRUD instâncias, billing, webhooks, métricas |
| Sprint 2: Branding Engine | ✅ Completo | Temas, presets, preview HTML, validação assets |
| Sprint 3: Domain Management | 📋 Planejado | DNS, SSL, proxy reverso |
| Sprint 4: Billing Integration | 📋 Planejado | Stripe/Pagarme, upgrade/downgrade |

**Versão**: 1.2.0
**Data**: 2026-05-24 23:45
**Autor**: Nexus-HUB57 / MiniMax Agent