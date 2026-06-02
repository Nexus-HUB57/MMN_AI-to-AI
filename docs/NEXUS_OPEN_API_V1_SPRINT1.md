# Nexus Open API v1 — Sprint 1 Scaffold

**Data:** 2026-06-02
**Branch:** `feature/open-api-v1`
**Objetivo da sprint:** disponibilizar o primeiro gateway REST público sobre o domínio de Subscriptions, reutilizando a lógica interna já existente em tRPC/services.

## Entregas desta Sprint

### 1) Gateway REST público
Endpoints adicionados no backend Express via `backend/src/open-api/routes.ts`:

- `GET /api/v1/`
- `GET /api/v1/catalog/plans`
- `GET /api/v1/subscriptions`
- `POST /api/v1/subscriptions`
- `GET /api/v1/subscriptions/:id`

### 2) Autenticação por API Key
Middleware criado em `backend/src/open-api/auth.ts`.

Formato esperado:

```http
Authorization: Bearer nxs_xxxxxxxxxxxxxxxxx
```

Na Sprint 1, a validação usa **registro em variáveis de ambiente**:

- `NEXUS_OPEN_API_KEYS=tenant-a:nxs_live_123;tenant-b:nxs_live_456`
- ou `NEXUS_OPEN_API_KEY=nxs_live_123` + `NEXUS_OPEN_API_TENANT_ID=tenant-a`

> A integração direta com `tenant_api_keys` continua recomendada e fica planejada para a Sprint 2, após harmonização do schema white-label com o bootstrap atual do backend.

### 3) Tenant scoping inicial
Como o domínio `subscriptions` ainda não possui coluna nativa `tenantId`, o scaffold da Open API aplica o escopo inicial por metadata:

- na criação de assinatura, o gateway grava:
  - `apiTenantId`
  - `apiProvisionedBy = nexus_open_api_v1`
  - `apiProvisionedAt`
- nas leituras (`list` e `detail`), o gateway só retorna assinaturas cujo metadata pertença à tenant da API key.

> **Importante:** este é um escopo transitório de Sprint 1. A recomendação para Sprint 2/3 é evoluir o schema para `tenantId` nativo em `subscriptions` e `subscription_events`.

## Arquivos alterados

- `backend/src/index.ts`
- `backend/src/open-api/auth.ts`
- `backend/src/open-api/routes.ts`

## Exemplo de uso

### Catálogo público
```bash
curl https://api.oneverso.com.br/api/v1/catalog/plans
```

### Criar assinatura
```bash
curl -X POST https://api.oneverso.com.br/api/v1/subscriptions \
  -H "Authorization: Bearer nxs_live_xxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 123,
    "planId": "nexus-start",
    "termMonths": 12,
    "metadata": {
      "source": "external_crm"
    }
  }'
```

### Listar assinaturas da tenant
```bash
curl https://api.oneverso.com.br/api/v1/subscriptions \
  -H "Authorization: Bearer nxs_live_xxxxx"
```

## Próximas entregas (Sprint 2)

1. `Idempotency-Key` para mutations
2. rate limiting por API key
3. audit trail específico da Open API
4. documentação OpenAPI/Swagger
5. expansão de endpoints para `cancel`, `change-plan`, `commissions` e `partners`

## Observações técnicas

- O gateway REST não substitui tRPC; ele **adapta** e expõe capacidades já prontas.
- A autenticação atual é funcional, mas ainda depende de registro por variável de ambiente.
- Na próxima etapa, a recomendação é migrar para persistência em `tenant_api_keys`, armazenando **hash da API key** e exibindo a chave completa apenas na criação/rotação.
