---
title: "Especificação · Base Agent"
description: "Contrato canônico do Base Agent (fundação comum a todos os agentes do Nexus)"
tags: [lib-nexus, agents-specs, base-agent, canonico]
category: agents-specs
version: "1.0"
last_review: "2026-06-02"
status: canonico
---

# 🤖 Especificação · Base Agent

> Contrato canônico do **Base Agent** — fundação comum a **todos** os agentes do Nexus. Qualquer agent herda desta especificação.

---

## 🎯 Propósito

O `BaseAgent` é a classe base abstrata que define:
- **Ciclo de vida** de um agente
- **Contexto** de execução (memória, tools, permissões)
- **Contratos** de input/output
- **Mecanismos** de erro, retry, observabilidade
- **Integração** com SHO e Judge

Todos os outros agents (`marketingAgent`, `judgeRevisor`, etc.) **herdam** desta classe e customizam comportamento específico.

---

## 📐 TypeScript — Interface Canônica

```typescript
// /backend/src/agentic/agents/baseAgent.ts

export interface AgentContext {
  /** Identificador único do agent (para logs) */
  agentId: string;

  /** User/tenant que originou a chamada */
  tenantId: string;
  userId: string;

  /** SHO Level (S0-S4) — define nível de autonomia */
  shoLevel: 'S0' | 'S1' | 'S2' | 'S3' | 'S4';

  /** Skills disponíveis para o agent */
  skills: string[];

  /** Tools externas (API, DB, etc.) */
  tools: AgentTool[];

  /** LLM a ser usado */
  llm: LLMConfig;

  /** Memória de curto prazo (conversa atual) */
  shortTermMemory: MemoryEntry[];

  /** Memória de longo prazo (histórico do usuário) */
  longTermMemory: MemoryEntry[];

  /** Configurações de retry e timeout */
  retry: { maxAttempts: number; backoffMs: number };
  timeout: number; // ms

  /** Métricas (preenchidas durante execução) */
  metrics: AgentMetrics;
}

export interface AgentTool {
  name: string;
  description: string;
  schema: ZodSchema;
  handler: (input: any) => Promise<any>;
  requiresConsent?: 'marketing' | 'analytics' | 'personalization';
}

export interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'google' | 'local';
  model: string; // 'gpt-4o', 'claude-3-5-sonnet', etc.
  temperature: number; // 0-1
  maxTokens: number;
  systemPrompt: string;
}

export interface MemoryEntry {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface AgentInput<T = any> {
  task: string;
  payload: T;
  context?: Record<string, any>;
}

export interface AgentOutput {
  status: 'success' | 'error' | 'partial' | 'requires_human';
  result: any;
  confidence: number; // 0-1
  reasoning: string;
  metadata: {
    tokensUsed: number;
    costBRL: number;
    durationMs: number;
    model: string;
    tools: string[];
  };
  error?: AgentError;
}

export interface AgentError {
  code: string; // 'TIMEOUT', 'RATE_LIMIT', 'INVALID_INPUT', etc.
  message: string;
  retryable: boolean;
  details?: Record<string, any>;
}

export interface AgentMetrics {
  inputTokens: number;
  outputTokens: number;
  costBRL: number;
  durationMs: number;
  retries: number;
  toolsUsed: string[];
  judgeScore?: number;
}
```

---

## 🔄 Ciclo de Vida

### 1. **Init**
```typescript
const agent = new BaseAgent({
  agentId: 'agent_001',
  tenantId: 'tenant_abc',
  userId: 'user_xyz',
  shoLevel: 'S2',
  skills: ['copywriter-persuasivo'],
  tools: [hotmartTool, sendgridTool],
  llm: { provider: 'openai', model: 'gpt-4o', temperature: 0.7, maxTokens: 4000, systemPrompt: '...' },
  shortTermMemory: [],
  longTermMemory: [],
  retry: { maxAttempts: 3, backoffMs: 1000 },
  timeout: 30000
});
```

### 2. **Validate**
Verifica:
- SHO Level é compatível com a tarefa
- Tenant tem permissão
- Tools requerem consentimento — verifica
- Input é válido

### 3. **Plan** (se LLM suporta)
- LLM planeja quais tools/skills invocar
- Pode usar function calling

### 4. **Execute**
- Chama LLM com contexto completo
- Processa function calls
- Executa tools em paralelo quando possível
- Coleta outputs

### 5. **Judge** (opcional, depende de config)
- Judge Revisor avalia o output
- Se score < 0.7, retry ou escalação

### 6. **Respond**
- Retorna AgentOutput estruturado
- Atualiza memória
- Loga métricas

---

## ⚙️ Comportamentos Herdados (que todos os agents têm)

### 1. Retry com Backoff Exponencial
```typescript
async function withRetry<T>(fn: () => Promise<T>, maxAttempts: number, backoffMs: number): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === maxAttempts) throw err;
      if (!isRetryable(err)) throw err;
      await sleep(backoffMs * Math.pow(2, attempt - 1));
    }
  }
  throw new Error('unreachable');
}
```

### 2. Timeout
```typescript
const timeoutPromise = new Promise((_, reject) => 
  setTimeout(() => reject(new AgentError('TIMEOUT', 'Agent exceeded timeout', false)), this.context.timeout)
);
const result = await Promise.race([execute(), timeoutPromise]);
```

### 3. Métricas Automáticas
- Latência
- Tokens consumidos
- Custo em BRL
- Tools usadas
- Judge score (se aplicável)

### 4. Audit Log
```typescript
await db.insert(auditLog).values({
  agentId: this.context.agentId,
  userId: this.context.userId,
  task: input.task,
  status: output.status,
  tokensUsed: metrics.inputTokens + metrics.outputTokens,
  costBRL: metrics.costBRL,
  durationMs: metrics.durationMs,
  timestamp: new Date()
});
```

### 5. Error Handling Padronizado
```typescript
try {
  return await this.execute(input);
} catch (err) {
  if (err instanceof AgentError) {
    return {
      status: 'error',
      result: null,
      confidence: 0,
      reasoning: err.message,
      error: err,
      metadata: { /* ... */ }
    };
  }
  throw err; // Erro inesperado — não captura
}
```

### 6. Observabilidade (OpenTelemetry)
- Span por execução
- Métricas: latência, tokens, custo
- Logs estruturados (JSON)
- Trace ID correlacionado

---

## 🔌 Integração com SHO

O Base Agent recebe **decisões** do SHO:
- **Qual LLM usar** (custo/qualidade trade-off)
- **Qual temperature** (criatividade vs determinismo)
- **Se chamar Judge** (threshold de qualidade)
- **Se escalar para humano** (S0, S1)

E devolve:
- Métricas
- Audit log
- Output estruturado

---

## 🛡️ Integração com Federation Gate

Toda chamada do Base Agent passa pelo **PII Gate**:
- Detecta dados pessoais (regex, NER)
- Filtra antes de enviar para LLM
- Substitui por tokens
- Restaura após resposta

```typescript
// Pseudocódigo
const sanitized = federationGate.sanitize(input);
const output = await this.execute(sanitized);
const restored = federationGate.restore(output);
return restored;
```

---

## 🧪 Testes Esperados

Todo Base Agent (e seus herdeiros) deve ter:

### Testes Unitários
- ✅ Validação de input
- ✅ Retry em erros transient
- ✅ Timeout funciona
- ✅ Métricas são coletadas
- ✅ Error handling padronizado

### Testes de Integração
- ✅ Com LLM mock
- ✅ Com Judge Revisor
- ✅ Com PII Gate
- ✅ Com audit log

### Testes de Comportamento
- ✅ SHO Level S0 → pede aprovação humana
- ✅ SHO Level S3 → executa autônomo
- ✅ Erro não-retryable → não tenta de novo
- ✅ Custo é registrado corretamente

---

## 📊 Métricas de Sucesso

| Métrica | Meta |
|---|---|
| Latência média | < 5s |
| Taxa de erro | < 2% |
| Taxa de retry bem-sucedido | > 80% |
| Judge score médio | ≥ 0.80 |
| Custo médio por chamada | < R$ 0.10 |

---

## 🔗 Documentos Relacionados

- `01-marketing-agent.md` — herda desta base
- `02-judge-revisor.md` — consome output desta base
- `03-federation-gate.md` — protege esta base
- `../api-docs/00-trpc-overview.md` — expõe via tRPC
- `../best-practices/01-error-handling.md` — padrões de erro
- `../best-practices/02-performance.md` — performance

---

**Versão 1.0** · Atualizado 2026-06-02 · Mantido pela Equipe Nexus
