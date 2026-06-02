---
title: "01 · Multi-tenant e White-label"
level: elite
duration: 90min
prerequisites: ["elite/00-blueprints-elite"]
tags: [multi-tenant, white-label, fase7, rls, branding, ssl]
last_updated: 2026-06-02
---

# 🏢 01 · Multi-tenant e White-label

> **Tempo:** 90 min · **Nível:** Elite · **Pré-requisitos:** 00 - Blueprints Elite + `fase7/` implementado

## Conceito

- **Multi-tenant** = uma única instância do Nexus serve múltiplos clientes (tenants), cada um com dados isolados.
- **White-label** = o tenant pode customizar marca, domínio e cores.

O módulo `fase7/` (White-Label Module) já está implementado e tem:

- **Instance Management** (CRUD, API key, rate limit)
- **Branding Engine** (logos, cores, fontes, domínio)
- **Domain Management** (subdomínios, SSL)
- **Tenant Billing** (planos, usage tracking, invoices)

## Diagrama de arquitetura

```
                        ┌──────────────────────┐
                        │   api.oneverso.br    │
                        │   (entrypoint único) │
                        └──────────┬───────────┘
                                   │ host header
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                    │
              ▼                    ▼                    ▼
      ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
      │ Tenant A     │    │ Tenant B     │    │ Tenant C     │
      │ marca.com.br │    │ app.outro.io │    │ sua.startup  │
      │ (azul)       │    │ (verde)      │    │ (preto)      │
      └──────┬───────┘    └──────┬───────┘    └──────┬───────┘
             │                   │                   │
             └───────────────────┼───────────────────┘
                                 │
                                 ▼
                    ┌──────────────────────┐
                    │   Backend multi-     │
                    │   tenant (Postgres   │
                    │   schema-per-tenant) │
                    └──────────────────────┘
```

## Isolamento: 3 estratégias

| Estratégia | Pros | Contras | Quando usar |
|---|---|---|---|
| **Schema-per-tenant** | Isolamento forte, backup fácil | Migração pesada | B2B médio/grande |
| **Row-level security (RLS)** | Migração simples, baixa opex | Risco de leak se RLS mal feito | SMB / escala |
| **DB-per-tenant** | Isolamento total | Caro, operacional pesado | Enterprise / saúde/finanças |

> **Nexus default:** row-level-security com RLS ativo em todas as tabelas (`backend/src/db/rls/`).

## Como configurar (passo a passo)

### 1. Criar a instância

```typescript
POST /api/instances

{
  "name": "MinhaMarca",
  "slug": "minhamarca",
  "plan": "pro",
  "branding": {
    "logo_url": "https://cdn.minhamarca.com/logo.png",
    "primary_color": "#FF6B35",
    "domain": "app.minhamarca.com.br"
  }
}
```

### 2. Configurar DNS

```
CNAME  app.minhamarca.com.br  →  cdn.oneverso.com.br
```

### 3. Provisionar SSL (automático via Caddy/Traefik)

### 4. Convidar admin do tenant

```
Admin Painel → Tenants → [MinhaMarca] → Convidar Admin
```

## API key e rate limit

Cada tenant recebe:

- `X-API-Key`: chave de 32 chars para integrações
- `X-Tenant-ID`: header obrigatório em todas as requests
- **Rate limit padrão:** 1000 req/min (plano Pro), 10000 (Enterprise)

```bash
curl -H "X-API-Key: xxxx" -H "X-Tenant-ID: 123" \
     https://api.oneverso.com.br/v1/affiliates
```

## Billing por tenant

- Cobrança via **Stripe Connect** (split entre Nexus e o tenant)
- Planos: Starter / Pro / Enterprise
- Métricas de billing: contatos armazenados, mensagens enviadas, skills ativas

## 🎯 Exercício

1. Crie **1 instância** de teste no painel
2. Configure branding (cor + logo)
3. Suba **1 subdomínio** (use `*.localhost` se não tiver DNS)
4. Crie **1 afiliado** dentro do tenant
5. Documente os passos para replicar

## ⏭️ Próximo passo

👉 [**02 · Federação de agentes**](02-federacao-agentes.md)

---

**Versão 1.0** · Atualizado 2026-06-02 · Fonte: `fase7/README.md` + `fase7/SPEC.md` + `docs/repository-review/ANALISE_TECNICA_SISTEMA_ATUAL.md`
