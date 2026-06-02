# Nexus Open API v1 — Sprint 2

**Data:** 2026-06-02  
**Branch:** `feature/open-api-v1`  
**Objetivo da sprint:** endurecer o gateway REST com **Idempotency-Key**, **rate limiting** e **audit trail** para preparar a Open API para uso externo controlado.

## Entregas desta Sprint

### 1) Idempotency-Key para operações de escrita
Arquivo: `backend/src/open-api/idempotency.ts`

Implementado middleware para operações `POST`, `PUT`, `PATCH` e `DELETE`:

- exige o header `Idempotency-Key`
- detecta reutilização com payload idêntico
- retorna replay da resposta anterior quando a mesma operação é repetida
- bloqueia reuso da mesma chave com payload diferente
- bloqueia requisição concorrente ainda em processamento com a mesma chave

Headers relevantes:
- `X-Idempotency-Status: created`
- `X-Idempotency-Status: replayed`
- `X-Idempotency-Status: conflict`
- `X-Idempotency-Status: in_progress`

### 2) Rate limiting da Open API
Arquivo: `backend/src/open-api/rate-limit.ts`

Foram adicionadas duas camadas:

- **rate limit público por IP** para rotas abertas (`/api/v1`, `/api/v1/catalog/plans`)
- **rate limit autenticado por tenant + método + path** para rotas protegidas

Headers retornados:
- `X-RateLimit-Key`
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`
- `Retry-After`

Variáveis de ambiente suportadas:
- `NEXUS_OPEN_API_PUBLIC_RATE_LIMIT`
- `NEXUS_OPEN_API_PUBLIC_WINDOW_MS`
- `NEXUS_OPEN_API_TENANT_RATE_LIMIT`
- `NEXUS_OPEN_API_TENANT_WINDOW_MS`

### 3) Audit trail estruturado
Arquivo: `backend/src/open-api/audit.ts`

Foi implementado registro estruturado por request com:

- `requestId`
- `tenantId`
- método e path
- status HTTP
- duração em ms
- IP e user-agent
- status de idempotência
- dados de rate limit

Também foi adicionada rota protegida de consulta recente:

- `GET /api/v1/audit/recent?limit=20`

### 4) Ajustes de servidor / CORS
Arquivo: `backend/src/index.ts`

Atualizações:
- aceita o header `Idempotency-Key`
- expõe headers úteis para clientes web
- mantém o gateway montado em `/api/v1`

## Arquivos alterados nesta sprint

- `backend/src/index.ts`
- `backend/src/open-api/routes.ts`
- `backend/src/open-api/audit.ts`
- `backend/src/open-api/idempotency.ts`
- `backend/src/open-api/rate-limit.ts`

## Exemplo de uso

### Criar assinatura com idempotência
```bash
curl -X POST https://api.oneverso.com.br/api/v1/subscriptions \
  -H "Authorization: Bearer nxs_live_xxxxx" \
  -H "Idempotency-Key: sub-create-123" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 123,
    "planId": "nexus-start",
    "termMonths": 12
  }'
```

### Consultar trilha recente da tenant
```bash
curl https://api.oneverso.com.br/api/v1/audit/recent?limit=10 \
  -H "Authorization: Bearer nxs_live_xxxxx"
```

## Validação esperada

- build backend OK
- POST sem `Idempotency-Key` retorna `400`
- POST duplicado com mesma chave e mesmo payload retorna replay
- reutilização da mesma chave com payload diferente retorna `409`
- excesso de requests retorna `429`
- `GET /api/v1/audit/recent` retorna registros da tenant autenticada

## Próxima etapa recomendada (Sprint 3)

1. persistir idempotência em Redis
2. persistir audit trail em banco
3. integrar autenticação com `tenant_api_keys`
4. adicionar OpenAPI/Swagger
5. expandir endpoints de `commissions` e `partners`
