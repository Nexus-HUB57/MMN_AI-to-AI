# Nexus Open API v1 — Sprint 3

**Data:** 2026-06-02  
**Branch:** `feature/open-api-v1-sprint3`  
**Objetivo da sprint:** tornar o gateway mais pronto para operação externa, conectando autenticação à base real de tenants quando disponível, persistindo trilhas operacionais em Redis/fallback, ampliando o ciclo de vida de assinaturas e expondo especificação OpenAPI em JSON.

## Entregas desta Sprint

### 1) Autenticação híbrida com `tenant_api_keys`
Arquivo: `backend/src/open-api/auth.ts`

Melhorias entregues:

- tentativa prioritária de validar chaves na tabela `tenant_api_keys`
- fallback automático para `NEXUS_OPEN_API_KEYS` e `NEXUS_OPEN_API_KEY`
- atualização assíncrona de `last_used_at`
- incremento de `api_calls_used` em `tenant_billing` quando a base estiver disponível
- contexto enriquecido com `tenantId`, `keyId`, `permissions` e `source`

Resultado: a Open API pode operar em modo bootstrap (env) e migrar para tenancy real sem quebra de compatibilidade.

### 2) Idempotência persistida em cache compartilhado
Arquivo: `backend/src/open-api/idempotency.ts`

A camada de idempotência passou a usar o serviço de cache compartilhado:

- armazena chaves em Redis quando disponível
- fallback automático para memória local
- preserva replay de respostas para múltiplas instâncias do backend quando Redis existir
- libera a chave em respostas `5xx`, permitindo retry seguro

### 3) Audit trail persistido
Arquivo: `backend/src/open-api/audit.ts`

A trilha recente deixa de ser apenas buffer em processo e passa a ser persistida via cache:

- trilha global recente
- trilha por tenant
- TTL configurável
- `GET /api/v1/audit/recent` agora lê da camada persistida

### 4) Especificação OpenAPI pública
Arquivo: `backend/src/open-api/routes.ts`

Nova rota pública:

- `GET /api/v1/openapi.json`

A especificação descreve:

- autenticação Bearer
- endpoints públicos e protegidos
- operações de criação, consulta, confirmação de pagamento, troca de plano e cancelamento de assinatura
- respostas padronizadas e cabeçalhos operacionais

### 5) Expansão do ciclo de vida de subscriptions
Arquivo: `backend/src/open-api/routes.ts`

Novos endpoints protegidos:

- `POST /api/v1/subscriptions/:id/confirm-payment`
- `POST /api/v1/subscriptions/:id/change-plan`
- `POST /api/v1/subscriptions/:id/cancel`

Esses endpoints reaproveitam a lógica já existente do domínio `subscriptions`, sem duplicar regras de negócio.

## Arquivos alterados nesta sprint

- `backend/src/open-api/auth.ts`
- `backend/src/open-api/idempotency.ts`
- `backend/src/open-api/audit.ts`
- `backend/src/open-api/routes.ts`
- `docs/NEXUS_OPEN_API_V1_SPRINT3.md`

## Checklist de validação esperado

- build backend OK
- `GET /api/v1/openapi.json` retorna spec válida
- autenticação funciona com fallback por env
- quando a tabela `tenant_api_keys` existir, a validação passa a usá-la automaticamente
- replay idempotente continua funcional
- respostas `5xx` não ficam presas na mesma `Idempotency-Key`
- `GET /api/v1/audit/recent` retorna registros persistidos
- novos endpoints de mutation do ciclo de vida de assinatura respondem corretamente

## Próxima etapa recomendada (Sprint 4)

1. criar persistência transacional de idempotência via Redis `SET NX`
2. mover audit trail para tabela dedicada com retenção e paginação
3. gerar SDKs JS/Python a partir do `openapi.json`
4. expor endpoints tenant-safe para `commissions` e `partners`
5. publicar documentação externa com exemplos por ambiente `sandbox` e `live`
