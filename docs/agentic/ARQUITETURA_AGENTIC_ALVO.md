# Arquitetura Agentic Alvo — MMN_AI-to-AI

## Objetivo
Definir uma arquitetura alvo para a camada agentic sem romper o core transacional existente do sistema.

## Princípio Estrutural
A camada agentic **não substitui** o backend de MMN, pagamentos, pedidos e comissões. Ela atua como um **control plane** que coordena decisões, agenda execuções e invoca serviços oficiais do domínio.

## Macroarquitetura
```text
Frontend / Mobile / Dashboard
        ↓
tRPC API Gateway
        ↓
Core Services (MMN, Orders, Payments, Commissions, Tracking)
        ↓
Agentic Control Plane
  - Orchestrator
  - Judge / Policy Engine
  - Scheduler
  - Memory Services
  - Audit Trail
        ↓
BullMQ / Workers
        ↓
Tools Layer
  - Social
  - Messaging
  - Marketplace
  - CRM
  - Analytics
        ↓
External APIs
```

## Componentes

### 1. Core Services
Responsável pela lógica oficial do negócio:
- rede MMN;
- comissões;
- pedidos e tracking;
- pagamentos;
- regras financeiras e auditoria.

### 2. Agentic Control Plane
Camada dedicada à autonomia.

Subcomponentes:
- **Orchestrator**: define fluxo, nós, estado e transições;
- **Judge/Policy Engine**: aprova, bloqueia, revisa ou escala ações;
- **Scheduler**: dispara ciclos e agendas;
- **Memory Services**: recupera contexto operacional e semântico;
- **Audit Trail**: persiste cada decisão, ação e resultado.

### 3. Workers BullMQ
Responsáveis por executar tarefas assíncronas com:
- idempotência;
- retries;
- backoff;
- dead-letter queue;
- controle de concorrência.

### 4. Tools Layer
Abstrações para canais e integrações externas.

Cada tool deve expor um contrato previsível:

```ts
export type ToolExecutionResult = {
  success: boolean;
  status: 'executed' | 'queued' | 'blocked' | 'failed';
  retriable: boolean;
  provider: string;
  externalId?: string;
  raw?: unknown;
  errorCode?: string;
  errorMessage?: string;
};
```

## Fluxo Recomendado do Marketing Orchestrator
```text
analyzeTrends
→ createContent
→ policyGate
→ budgetGate
→ postContent
→ judgePostAction
→ monitorEngagement
→ learn
```

### Observações
- `policyGate` verifica marca, LGPD, canal, tema e risco.
- `budgetGate` impede estouro de custo por tenant/agente.
- `judgePostAction` analisa qualidade e risco residual após a ação.
- `learn` registra feedback operacional e de desempenho.

## Modelo de Dados Mínimo

### `agent_sessions`
Estado operacional do agente.

Campos sugeridos:
- `id`
- `agent_id`
- `user_id`
- `tenant_id`
- `thread_id`
- `status`
- `current_node`
- `checkpoint_ref`
- `last_executed_at`
- `created_at`
- `updated_at`

### `agent_action_audit`
Trilha imutável das ações.

Campos sugeridos:
- `id`
- `agent_id`
- `user_id`
- `session_id`
- `action_type`
- `action_payload`
- `action_result`
- `decision`
- `risk_level`
- `judge_score`
- `model_used`
- `tokens_in`
- `tokens_out`
- `estimated_cost`
- `created_at`

### `agent_policies`
Políticas operacionais por tenant/agente.

Campos sugeridos:
- `id`
- `tenant_id`
- `allowed_channels`
- `quiet_hours`
- `max_daily_actions`
- `max_daily_cost`
- `human_review_threshold`
- `blocked_topics`
- `blocked_terms`
- `escalation_rules`

### `agent_memories`
Memória episódica e operacional.

Campos sugeridos:
- `id`
- `agent_id`
- `user_id`
- `memory_type`
- `content`
- `metadata`
- `source_ref`
- `relevance_score`
- `created_at`

## Estratégia de Memória
Recomendação prática:
- **Redis** para estado efêmero e checkpoints rápidos;
- **MySQL** para auditoria e memória operacional;
- **vector store dedicado** para memória semântica (Qdrant, Chroma, Pinecone ou pgvector).

Evitar colocar toda a estratégia de memória vetorial apenas em JSON no MySQL.

## Judge / Policy Engine
O judge deve operar em dois momentos:

### Pré-ação
Decide se a ação pode ocorrer.

Resposta mínima recomendada:
- `decision`: approve | revise | block | escalate
- `risk_level`: low | medium | high | critical
- `policy_hits`: lista de regras violadas
- `estimated_cost`
- `needs_human_review`
- `safe_rewrite`

### Pós-ação
Avalia:
- qualidade da ação;
- risco residual;
- necessidade de correção;
- aprendizado a persistir.

## Regras de Design
- agentes não podem alterar diretamente saldos/comissões sem passar pelo core;
- workers não devem confiar apenas em “bom comportamento do LLM”; 
- toda integração externa deve ter suppress list e opt-out quando aplicável;
- canais sociais e mensageria devem obedecer rate limits, janelas e templates oficiais.
