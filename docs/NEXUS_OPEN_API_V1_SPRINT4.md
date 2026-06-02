# Nexus Open API v1 — Sprint 4

**Data:** 2026-06-02  
**Branch:** `feature/open-api-v1-sprint4`

## Objetivo
Expandir a Nexus Open API v1 além do ciclo de vida de assinaturas, adicionando endpoints de leitura para **commissions** e **partners**, reforçando o controle de escopo por módulos/permissões da API key e preparando a superfície pública para integrações globais do Nexus Partners Pack.

## Entregas

### 1) Controle de acesso por módulo e capacidade
Arquivo principal: `backend/src/open-api/routes.ts`

Foi adicionada uma camada de autorização complementar à autenticação Bearer existente:

- **capability = read/write** por rota
- **moduleAliases** por domínio (`subscriptions`, `commissions`, `partners`, `audit`)
- comportamento compatível com chaves antigas: quando a API key não possui objeto `permissions`, a rota permanece acessível
- para chaves com `permissions`, o gateway agora retorna `403` quando faltar escopo de leitura, escrita ou módulo

### 2) Novos endpoints de commissions
Arquivo principal: `backend/src/open-api/routes.ts`

Endpoints publicados na Sprint 4:

- `GET /api/v1/commissions`
- `GET /api/v1/commissions/stats`
- `GET /api/v1/commissions/{id}`
- `GET /api/v1/commissions/affiliates/{affiliateId}`
- `GET /api/v1/commissions/affiliates/{affiliateId}/pending-summary`

Capacidades expostas:

- listagem com filtros (`page`, `limit`, `status`, `affiliateId`, `startDate`, `endDate`)
- snapshot agregado de comissões
- detalhe com histórico/auditoria resumida
- visão por afiliado
- resumo pendente por afiliado

### 3) Novos endpoints de partners
Arquivo principal: `backend/src/open-api/routes.ts`

Endpoints publicados na Sprint 4:

- `GET /api/v1/partners`
- `GET /api/v1/partners/stats`
- `GET /api/v1/partners/tiers`
- `GET /api/v1/partners/partnerships`
- `GET /api/v1/partners/{id}`
- `GET /api/v1/partners/{id}/growth`
- `GET /api/v1/partners/{id}/benefits`
- `GET /api/v1/partners/{id}/volume-history`

Capacidades expostas:

- catálogo de parceiros com filtros por `tier`, `status`, `search`
- snapshot agregado do ecossistema de parceiros
- catálogo de tiers e ordenação oficial
- listagem de parcerias estratégicas
- detalhe composto do parceiro (benefícios, growth, histórico, partnerships)
- leitura explícita da análise algorítmica de crescimento
- breakdown de benefícios/comissão efetiva
- histórico de volume

### 4) OpenAPI spec expandida
Arquivo principal: `backend/src/open-api/routes.ts`

O documento `GET /api/v1/openapi.json` foi atualizado para refletir a Sprint 4, incluindo os novos caminhos de **commissions** e **partners** e o stage `sprint-4`.

## Compatibilidade

A Sprint 4 mantém compatibilidade com a Sprint 3:

- discovery endpoint continua em `GET /api/v1/`
- subscriptions lifecycle permanece estável
- autenticação híbrida via `tenant_api_keys` + fallback por variáveis continua ativa
- idempotência e audit trail permanecem habilitados

## Validação esperada

### Discovery
- `GET /api/v1/` deve responder `stage = sprint-4`

### OpenAPI spec
- `GET /api/v1/openapi.json` deve conter novos paths de `commissions` e `partners`

### Permissões
- API keys com `permissions.read = false` devem receber `403` em endpoints GET autenticados
- API keys com `permissions.modules = ["subscriptions"]` devem receber `403` ao acessar `commissions` e `partners`
- API keys sem `permissions` devem continuar compatíveis

### Read APIs
- `GET /api/v1/commissions/stats` deve responder snapshot agregado
- `GET /api/v1/partners/stats` deve responder snapshot agregado
- `GET /api/v1/partners/{id}/growth` deve responder análise algorítmica do parceiro

## Próximos passos sugeridos

### Sprint 5
- mutações seguras para `partners` e `partnerships`
- webhooks outbound por evento de comissão/parceiro
- geração de SDKs JavaScript e Python a partir de `openapi.json`
- persistência total de snapshots em cache compartilhado / Redis
