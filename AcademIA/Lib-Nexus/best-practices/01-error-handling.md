---
title: "Best Practices · Error Handling"
description: "Padrões canônicos de error handling para o Nexus (tipos, retry, observabilidade)"
tags: [lib-nexus, best-practices, error-handling, canonico]
category: best-practices
version: "1.0"
last_review: "2026-06-02"
status: canonico
---

# ⚠️ Best Practices · Error Handling

> Padrões canônicos de **error handling** para o Nexus. Toda aplicação, agent e skill deve seguir estas convenções.

---

## 🎯 Filosofia

> **Erros são esperados. Falha silenciosa é inaceitável.**

1. **Falhar rápido** — não esconder problemas
2. **Falhar com contexto** — mensagem clara + dados para debug
3. **Falhar com classificação** — saber se é transient ou permanente
4. **Falhar com auditoria** — todo erro é logado
5. **Falhar com retry quando faz sentido** — mas não retry infinito
6. **Falhar com fallback** — degradação graciosa
7. **Falhar com alerta** — notificar quando crítico

---

## 📚 Tipos de Erro (Canônicos)

### 1. `ValidationError`
- **Quando**: input inválido (Zod falhou, schema errado)
- **HTTP**: 400
- **Retryable**: ❌ Não
- **Mensagem**: "Campo 'email' é obrigatório"
- **Ação**: retornar 400 ao cliente com campo específico

```typescript
import { ZodError } from 'zod';

try {
  const data = schema.parse(input);
} catch (err) {
  if (err instanceof ZodError) {
    throw new ValidationError('Input inválido', {
      issues: err.issues
    });
  }
  throw err;
}
```

### 2. `AuthenticationError`
- **Quando**: sem credenciais ou inválidas
- **HTTP**: 401
- **Retryable**: ❌ Não
- **Mensagem**: "API Key inválida"

### 3. `AuthorizationError`
- **Quando**: sem permissão
- **HTTP**: 403
- **Retryable**: ❌ Não
- **Mensagem**: "Você não tem permissão para esta operação"

### 4. `NotFoundError`
- **Quando**: recurso não existe
- **HTTP**: 404
- **Retryable**: ❌ Não
- **Mensagem**: "Lead 'lead_abc123' não encontrado"

### 5. `ConflictError`
- **Quando**: conflito de estado (ex: email duplicado)
- **HTTP**: 409
- **Retryable**: ❌ Não
- **Mensagem**: "Já existe lead com este email"

### 6. `RateLimitError`
- **Quando**: limite de taxa excedido
- **HTTP**: 429
- **Retryable**: ✅ Sim, com backoff
- **Mensagem**: "Limite de 60 req/min excedido. Retry em 32s."

### 7. `TimeoutError`
- **Quando**: operação excedeu tempo
- **HTTP**: 504
- **Retryable**: ✅ Sim
- **Mensagem**: "Operação excedeu 30s"

### 8. `UpstreamError`
- **Quando**: dependência externa falhou (Hotmart, OpenAI)
- **HTTP**: 502
- **Retryable**: ✅ Sim
- **Mensagem**: "Hotmart indisponível. Tentaremos novamente."

### 9. `LLMError`
- **Quando**: chamada de LLM falhou
- **HTTP**: 502
- **Retryable**: ✅ Às vezes (depende do tipo)
- **Mensagem**: "LLM retornou erro: {{error_message}}"
- **Subtipos**:
  - `LLMTimeoutError` (retryable)
  - `LLMRateLimitError` (retryable com backoff longo)
  - `LLMContentFilterError` (não retryable — revisar prompt)
  - `LLMContextLengthError` (não retryable — encurtar)
  - `LLMInvalidResponseError` (retryable — instabilidade)

### 10. `JudgeRejectionError`
- **Quando**: Judge Revisor rejeitou output
- **HTTP**: 422
- **Retryable**: ✅ Às vezes (regenerar)
- **Mensagem**: "Output rejeitado pelo Judge. Score: 0.45. Issues: [...]"

### 11. `LGPDViolationError`
- **Quando**: violação LGPD detectada
- **HTTP**: 422
- **Retryable**: ❌ Não (bloqueio!)
- **Mensagem**: "Operação bloqueada por violação LGPD. Obtenha consentimento."

### 12. `InternalError`
- **Quando**: erro inesperado
- **HTTP**: 500
- **Retryable**: ✅ Às vezes
- **Mensagem**: "Erro inesperado. Código: err_abc123"
- **⚠️ NÃO vazar stack trace para o cliente!**

---

## 🔁 Retry com Backoff Exponencial

### Regra Canônica

```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;       // default: 3
    initialBackoffMs?: number;  // default: 1000
    maxBackoffMs?: number;      // default: 16000
    retryable?: (err: any) => boolean;
  } = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialBackoffMs = 1000,
    maxBackoffMs = 16000,
    retryable = isRetryableDefault
  } = options;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === maxAttempts || !retryable(err)) {
        throw err;
      }
      
      // Backoff: 1s, 2s, 4s, 8s, 16s (cap)
      const delay = Math.min(
        initialBackoffMs * Math.pow(2, attempt - 1),
        maxBackoffMs
      );
      
      // Jitter: ±20% para evitar thundering herd
      const jitter = delay * 0.2 * (Math.random() * 2 - 1);
      
      logger.warn('Retry due to error', {
        attempt,
        delay: delay + jitter,
        err: err.message
      });
      
      await sleep(delay + jitter);
    }
  }
  throw new Error('unreachable');
}

function isRetryableDefault(err: any): boolean {
  if (err instanceof TimeoutError) return true;
  if (err instanceof RateLimitError) return true;
  if (err instanceof UpstreamError) return true;
  if (err instanceof NetworkError) return true;
  if (err instanceof LLMTimeoutError) return true;
  if (err instanceof LLMRateLimitError) return true;
  if (err instanceof LLMInvalidResponseError) return true;
  if (err?.code === 'ECONNREFUSED') return true;
  if (err?.code === 'ETIMEDOUT') return true;
  return false;
}
```

### Por Tipo

| Tipo | Retry? | Backoff | Max Attempts |
|---|---|---|---|
| RateLimit | Sim | Longo (30s+) | 5 |
| Timeout | Sim | Curto (1s) | 3 |
| Upstream (5xx) | Sim | Médio (5s) | 3 |
| Network | Sim | Curto (1s) | 3 |
| Validation | Não | — | 1 |
| Auth/Authz | Não | — | 1 |
| NotFound | Não | — | 1 |
| LGPD | Não | — | 1 |

---

## 🛡️ Circuit Breaker

Evita **cascading failures** quando uma dependência está fora.

```typescript
class CircuitBreaker {
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private failureCount = 0;
  private failureThreshold = 5;
  private resetTimeoutMs = 60000;
  private lastFailureAt?: number;

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - (this.lastFailureAt || 0) > this.resetTimeoutMs) {
        this.state = 'half-open';
      } else {
        throw new UpstreamError('Circuit breaker aberto');
      }
    }

    try {
      const result = await fn();
      if (this.state === 'half-open') {
        this.state = 'closed';
        this.failureCount = 0;
      }
      return result;
    } catch (err) {
      this.failureCount++;
      this.lastFailureAt = Date.now();
      
      if (this.failureCount >= this.failureThreshold) {
        this.state = 'open';
        logger.error('Circuit breaker ABERTO', { failureCount: this.failureCount });
        await alerting.sendCritical('Circuit breaker aberto');
      }
      throw err;
    }
  }
}
```

---

## 📊 Observabilidade de Erros

### Logs Estruturados

```typescript
logger.error('Falha ao processar webhook', {
  error: {
    name: err.name,
    message: err.message,
    code: err.code,
    stack: err.stack, // ⚠️ NÃO em produção sem sanitização
    cause: err.cause
  },
  context: {
    requestId: ctx.requestId,
    tenantId: ctx.tenantId,
    userId: ctx.userId,
    endpoint: 'POST /v1/leads',
    method: 'create',
    durationMs: Date.now() - startTime
  },
  // ⚠️ NÃO logar PII (email, cpf, phone, name)
  pii_safe: true
});
```

### Métricas

```typescript
metrics.increment('errors.total', {
  type: err.constructor.name,
  code: err.code,
  endpoint: ctx.endpoint
});

metrics.histogram('errors.duration_ms', Date.now() - startTime, {
  endpoint: ctx.endpoint
});
```

### Alertas

| Severidade | Threshold | Notificação |
|---|---|---|
| **Critical** | Qualquer `InternalError` | PagerDuty + Slack #incidentes |
| **Critical** | LGPDViolation | Email DPO + Slack #lgpd |
| **High** | CircuitBreaker abre | Slack #sre |
| **High** | Taxa de erro > 5% por 5 min | Slack #sre |
| **Medium** | Rate limit exceeded > 100x/min | Slack #ops |
| **Low** | Timeout único | Log apenas |

---

## 🧪 Testes de Error Handling

### Cenários Obrigatórios

- ✅ Erro de validação retorna 400 com mensagem clara
- ✅ Erro de auth retorna 401
- ✅ Erro retryable é retentado com backoff
- ✅ Erro não-retryable NÃO é retentado
- ✅ Circuit breaker abre após N falhas
- ✅ Circuit breaker fecha após reset
- ✅ PII não vaza em logs
- ✅ Stack trace não vaza para o cliente
- ✅ Métricas de erro são registradas
- ✅ Alertas críticos são disparados

---

## 📐 Resposta ao Cliente (API)

### Princípios
- **Mensagem clara**: usuário (ou dev) entende o que aconteceu
- **Código específico**: programático, não genérico
- **Sem stack trace**: jamais vazar internals
- **Request ID**: sempre presente para suporte

### Template

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Campo 'email' é obrigatório e deve ser válido",
    "details": {
      "field": "email",
      "constraint": "must be a valid email"
    },
    "request_id": "req_abc123",
    "documentation_url": "https://docs.nexus.com.br/errors/VALIDATION_ERROR"
  }
}
```

---

## 🔐 Segurança no Error Handling

### ❌ NUNCA
- Vazar stack trace em produção
- Logar PII (email, cpf, etc.)
- Expor versões de bibliotecas
- Mostrar SQL queries com dados
- Revelar estrutura interna

### ✅ SEMPRE
- Mensagem genérica para erros 500
- Detalhes em log (com PII sanitizado)
- Request ID para correlação
- Alertas para o time
- Sanitização em PII Gate antes de logar

---

## 📊 Métricas de Sucesso

| Métrica | Meta |
|---|---|
| Taxa de erro 5xx | < 0.5% |
| MTTR (Mean Time To Recovery) | < 30 min |
| Taxa de retry bem-sucedido | > 80% |
| PII leak em logs | 0 (zero!) |
| Cobertura de circuit breaker | 100% de deps externas |

---

## 🔗 Documentos Relacionados

- `00-prompt-engineering.md` — erros de LLM
- `02-performance.md` — métricas
- `../agents-specs/00-base-agent.md` — BaseAgent usa estes padrões
- `../agents-specs/03-federation-gate.md` — erros de PII

---

**Versão 1.0** · Atualizado 2026-06-02 · Mantido pela Equipe Nexus
