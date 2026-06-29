---
title: "Deploy de Plataforma Multi-tenant White-label"
tutorial_code: TUT-ELI-01
level: elite
duration: 35min
tags: [tutorial, multi-tenant, whitelabel, deploy, elite, saas]
last_updated: 2026-06-28
prerequisites: ["TUT-MAS-12-configurar-ab-test-judge", "apostila-12-seguranca-ofensiva"]
---

# 🏢 Deploy de Plataforma Multi-tenant White-label

> **Tempo:** 35 min · **Nível:** Elite · **Pré-requisitos:** Operação Master estável

## Problema

Você construiu uma operação Nexus madura e quer oferecê-la como **plataforma white-label** para outros afiliados usarem. Mas:
- Como isolar dados entre clientes?
- Como permitir customização visual por cliente?
- Como cobrar por uso?
- Como escalar para 100+ clientes?

## Solução

### 1. Arquitetura Multi-tenant

```yaml
# infra/multi_tenant.yaml
tenants:
  - id: tenant_001
    subdomain: empresa1.oneverso.com.br
    branding:
      logo: /tenants/001/logo.png
      primary_color: "#FF6B35"
      secondary_color: "#004E89"
      custom_domain: app.empresa1.com.br
    plan: pro  # starter | pro | enterprise
    limits:
      max_contacts: 10000
      max_messages_per_month: 50000
      max_skills: 30
    features:
      custom_skills: true
      white_label: true
      api_access: true
      priority_support: true

database_strategy: "single_db_with_tenant_id"
isolation_level: "row_level_security"
audit_log_retention_days: 365
```

### 2. Schema de Banco com Tenant Isolation

```sql
-- Migration: add_tenant_isolation.sql

-- Adicionar coluna tenant_id em todas as tabelas
ALTER TABLE contacts ADD COLUMN tenant_id INT NOT NULL REFERENCES tenants(id);
ALTER TABLE messages ADD COLUMN tenant_id INT NOT NULL REFERENCES tenants(id);
ALTER TABLE skills ADD COLUMN tenant_id INT NOT NULL REFERENCES tenants(id);
ALTER TABLE campaigns ADD COLUMN tenant_id INT NOT NULL REFERENCES tenants(id);
ALTER TABLE audit_logs ADD COLUMN tenant_id INT NOT NULL REFERENCES tenants(id);

-- Índices para performance
CREATE INDEX idx_contacts_tenant ON contacts(tenant_id);
CREATE INDEX idx_messages_tenant ON messages(tenant_id);
CREATE INDEX idx_audit_logs_tenant_created ON audit_logs(tenant_id, created_at);

-- Row Level Security (PostgreSQL)
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_contacts ON contacts
  USING (tenant_id = current_setting('app.current_tenant_id')::INT);

CREATE POLICY tenant_isolation_messages ON messages
  USING (tenant_id = current_setting('app.current_tenant_id')::INT);

CREATE POLICY tenant_isolation_skills ON skills
  USING (tenant_id = current_setting('app.current_tenant_id')::INT);
```

### 3. Middleware de Tenant Context

```python
# middleware/tenant_context.py
from fastapi import Request, HTTPException
import asyncpg

class TenantContextMiddleware:
    """
    Middleware que injeta tenant_id em cada request,
    baseado no subdomain ou custom domain.
    """

    def __init__(self, app):
        self.app = app
        self.tenant_cache = {}  # subdomain -> tenant_id

    async def __call__(self, request: Request, call_next):
        # 1. Extrair tenant do hostname
        host = request.headers.get("host", "")
        tenant_id = self._resolve_tenant(host)

        if tenant_id is None:
            raise HTTPException(404, "Tenant not found")

        # 2. Injetar no contexto do banco
        async with self.app.state.db.acquire() as conn:
            await conn.execute(
                f"SET app.current_tenant_id = {tenant_id}"
            )

        request.state.tenant_id = tenant_id
        return await call_next(request)

    def _resolve_tenant(self, host: str) -> int | None:
        # Cache hit
        if host in self.tenant_cache:
            return self.tenant_cache[host]

        # Parse subdomain
        subdomain = host.split(".")[0]
        # Lookup in DB (cachear)
        # ... implementação real
        tenant_id = db_lookup(subdomain)
        self.tenant_cache[host] = tenant_id
        return tenant_id
```

### 4. White-label via Tema Dinâmico

```typescript
// frontend/src/theme/dynamicTheme.ts

export interface TenantBranding {
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily?: string;
  customCss?: string;
}

export function applyTenantTheme(branding: TenantBranding) {
  const root = document.documentElement;

  // Apply CSS variables
  root.style.setProperty('--color-primary', branding.primaryColor);
  root.style.setProperty('--color-secondary', branding.secondaryColor);

  // Update logo
  const logoEl = document.querySelector('[data-tenant-logo]');
  if (logoEl) {
    (logoEl as HTMLImageElement).src = branding.logo;
  }

  // Apply custom CSS if provided
  if (branding.customCss) {
    const style = document.createElement('style');
    style.textContent = branding.customCss;
    document.head.appendChild(style);
  }

  // Update favicon
  const favicon = document.querySelector('link[rel="icon"]');
  if (favicon && branding.logo) {
    (favicon as HTMLLinkElement).href = branding.logo;
  }
}
```

### 5. Planos e Billing

```python
# billing/plans.py
from dataclasses import dataclass
from enum import Enum

class Plan(Enum):
    STARTER = "starter"
    PRO = "pro"
    ENTERPRISE = "enterprise"

@dataclass
class PlanConfig:
    name: Plan
    price_brl_monthly: int
    max_contacts: int
    max_messages_per_month: int
    max_skills: int
    features: list[str]

PLANS = {
    Plan.STARTER: PlanConfig(
        name=Plan.STARTER,
        price_brl_monthly=297,
        max_contacts=1000,
        max_messages_per_month=5000,
        max_skills=10,
        features=["basic_branding", "email_support"],
    ),
    Plan.PRO: PlanConfig(
        name=Plan.PRO,
        price_brl_monthly=997,
        max_contacts=10000,
        max_messages_per_month=50000,
        max_skills=30,
        features=[
            "white_label",
            "custom_domain",
            "priority_support",
            "api_access",
            "custom_skills",
        ],
    ),
    Plan.ENTERPRISE: PlanConfig(
        name=Plan.ENTERPRISE,
        price_brl_monthly=4997,
        max_contacts=999999,  # unlimited
        max_messages_per_month=999999,
        max_skills=999999,
        features=[
            "white_label",
            "custom_domain",
            "dedicated_account_manager",
            "sla_99_9",
            "soc2_compliance",
            "custom_integrations",
            "on_premise_option",
        ],
    ),
}
```

### 6. Provisionamento de Novo Tenant

```bash
# CLI: provisionar novo cliente
python -m nexus.cli provision \
  --name "Empresa XYZ" \
  --subdomain empresa-xyz \
  --plan pro \
  --admin-email admin@empresaxyz.com \
  --admin-name "João da Silva"

# Output esperado:
# ✓ Tenant created: id=42
# ✓ Database schema migrated
# ✓ Subdomain configured: empresa-xyz.oneverso.com.br
# ✓ Initial skills installed: 10
# ✓ Admin user invited
# ✓ DNS verified
# ✓ SSL certificate installed
# ✓ Welcome email sent
# Tenant is live at: https://empresa-xyz.oneverso.com.br
```

### 7. Monitoramento por Tenant

```sql
-- Dashboard de uso por tenant
SELECT
  t.name as tenant_name,
  t.plan,
  COUNT(DISTINCT c.id) as total_contacts,
  COUNT(DISTINCT m.id) FILTER (WHERE m.created_at > NOW() - INTERVAL '30 days') as msgs_30d,
  SUM(m.cost_usd) FILTER (WHERE m.created_at > NOW() - INTERVAL '30 days') as cost_30d,
  CASE
    WHEN COUNT(DISTINCT m.id) FILTER (WHERE m.created_at > NOW() - INTERVAL '30 days') > p.max_messages_per_month
    THEN 'OVER_LIMIT'
    ELSE 'OK'
  END as status
FROM tenants t
LEFT JOIN contacts c ON c.tenant_id = t.id
LEFT JOIN messages m ON m.tenant_id = t.id
JOIN plans p ON p.name = t.plan
GROUP BY t.id, t.name, t.plan, p.max_messages_per_month
ORDER BY cost_30d DESC;
```

## Verificação

✅ Você tem schema com tenant_id e RLS
✅ Middleware injeta contexto automaticamente
✅ White-label funciona (cores, logo, domínio)
✅ Billing configurado (3 planos)
✅ Provisionamento automatizado via CLI
✅ Monitoramento por tenant funcional

## Próximos passos

- Configurar federação entre tenants Elite
- Implementar SSO (Single Sign-On)
- Estudar Tutorial 14 (Conectar agente federado)
