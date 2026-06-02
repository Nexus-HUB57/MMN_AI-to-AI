# Nexus Open API v1 — Sprint 5

**Data:** 2026-06-02  
**Objetivo:** evoluir a superfície pública da Nexus Open API com recursos de onboarding para integradores, preparando o ecossistema de SDKs e webhooks sem quebrar compatibilidade da Sprint 4.

## Entregas implementadas

### 1) Stage atualizado para `sprint-5`
Arquivo principal: `backend/src/open-api/routes.ts`

O discovery endpoint e os cabeçalhos versionados passam a anunciar a nova etapa da Open API, sinalizando evolução compatível da superfície pública.

### 2) Metadados públicos de SDK
Novos endpoints públicos:

- `GET /api/v1/sdk/javascript`
- `GET /api/v1/sdk/python`

Esses endpoints expõem metadados mínimos para onboarding de integradores, incluindo nome de pacote, status, origem do schema (`/api/v1/openapi.json`) e comando de instalação esperado.

### 3) Catálogo de eventos outbound
Novo endpoint público:

- `GET /api/v1/webhooks/events`

Ele descreve os eventos previstos para integração outbound, incluindo eventos de subscription, commission e partner.

### 4) Exemplos de payload
Novo endpoint público:

- `GET /api/v1/webhooks/examples`

Fornece exemplos de payload para acelerar integração, testes de parser e documentação externa.

## Compatibilidade

A Sprint 5 mantém compatibilidade retroativa com a Sprint 4:

- endpoints de subscriptions, commissions e partners permanecem estáveis
- autenticação Bearer API key continua ativa
- audit, idempotência e rate limiting permanecem habilitados
- `GET /api/v1/openapi.json` continua como fonte canônica do schema

## Próximos passos

- gerar SDKs reais a partir do schema OpenAPI
- adicionar assinatura/verificação HMAC para webhooks outbound
- criar mutações seguras adicionais para parceiros e parcerias
- publicar exemplos completos de integração por linguagem
