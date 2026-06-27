---
title: "Especificação · Federation Gate (PII Gate)"
description: "Contrato canônico do Federation Gate — proteção de PII em federação multi-tenant"
tags: [lib-nexus, agents-specs, federation, pii, multi-tenant, canonico]
category: agents-specs
version: "1.0"
last_review: "2026-06-02"
status: official
---

# 🌐 Especificação · Federation Gate (PII Gate)

> Contrato canônico do **Federation Gate** — componente crítico de **segurança e privacidade** que protege dados pessoais (PII) em cenários de **federação multi-tenant** e **chamadas inter-nó**.

---

## 🎯 Propósito

O `FederationGate` é um **filtro determinístico** (não usa LLM) que:

1. **Detecta** dados pessoais (PII) em qualquer payload (request ou response)
2. **Sanitiza** (substitui por tokens) antes de sair do tenant
3. **Restaura** (substitui tokens pelos valores reais) após retorno
4. **Registra** auditoria de toda transformação
5. **Bloqueia** operações que violem LGPD

É um **single chokepoint** — **toda** chamada que cruza fronteiras (multi-tenant, multi-nó, LLM externa) **passa** por ele.

---

## 🔐 Quando é Invocado

### Cenários Obrigatórios
1. **Chamada de LLM externa** — antes de enviar prompt (OpenAI, Anthropic, etc.)
2. **Chamada inter-nó** — quando Nexus Hub fala com Nexus Partner
3. **Multi-tenant white-label** — quando tenant A fala com tenant B
4. **Exportação de dados** — quando dados saem do sistema
5. **Webhook externo** — quando envia para gateway de pagamento

### Cenários Opcionais
- Logs (anonimizar)
- Backup (criptografar)
- Analytics agregados (anonimizar)

---

## 📐 TypeScript — Interface

```typescript
// /backend/src/federation/gate.ts

export interface GateInput {
  /** Payload a ser sanitizado */
  payload: any;
  /** Origem do payload */
  origin: {
    tenantId: string;
    userId?: string;
    nodeId: string;
  };
  /** Destino */
  destination: {
    type: 'llm' | 'node' | 'tenant' | 'webhook' | 'log' | 'backup';
    id: string; // provider name, nodeId, tenantId, etc.
  };
  /** Contexto adicional */
  context?: {
    purpose: string; // 'marketing_copy', 'analysis', etc.
    legalBasis?: 'consent' | 'contract' | 'legitimate_interest';
    dataSubjectId?: string;
  };
  /** Política de tratamento */
  policy?: {
    allowPII?: boolean; // default: false
    blockOnViolation?: boolean; // default: true
    logLevel?: 'none' | 'metadata' | 'full';
  };
}

export interface GateOutput {
  /** Payload sanitizado */
  sanitized: any;
  /** Mapa de tokens para restauração */
  tokenMap: Map<string, string>;
  /** PII detectada */
  piiDetected: PIIMatch[];
  /** Violações bloqueadas */
  violations: Violation[];
  /** Se foi permitido enviar */
  allowed: boolean;
  /** Audit log entry */
  audit: AuditEntry;
}

export interface PIIMatch {
  type: PIIType;
  value: string;
  token: string;
  location: string; // JSON path, ex: "user.email"
  confidence: 'high' | 'medium' | 'low';
  detectionMethod: 'regex' | 'ner' | 'validator' | 'lookup';
}

export type PIIType =
  | 'cpf'
  | 'cnpj'
  | 'email'
  | 'phone'
  | 'name'
  | 'address'
  | 'credit_card'
  | 'bank_account'
  | 'pix_key'
  | 'rg'
  | 'cnh'
  | 'passport'
  | 'ip'
  | 'user_agent'
  | 'geolocation'
  | 'date_of_birth'
  | 'health_info'
  | 'biometric'
  | 'political_opinion'
  | 'religious_belief'
  | 'sexual_orientation';

export interface Violation {
  type: 'pii_to_external' | 'cross_tenant_leak' | 'unconsented_data' | 'retention_exceeded' | 'no_legal_basis';
  severity: 'critical' | 'major' | 'minor';
  description: string;
  affectedSubjects: number;
  recommendation: string;
}

export interface AuditEntry {
  id: string;
  timestamp: number;
  origin: GateInput['origin'];
  destination: GateInput['destination'];
  piiTypesDetected: PIIType[];
  action: 'sanitized' | 'blocked' | 'allowed_raw' | 'logged_only';
  reason: string;
}

export class FederationGate {
  private piiDetector: PIIDetector;
  private consentRegistry: ConsentRegistry;
  private auditLogger: AuditLogger;
  private vault: SecureVault;

  async process(input: GateInput): Promise<GateOutput> {
    const startTime = Date.now();
    const audit: AuditEntry = {
      id: uuid(),
      timestamp: startTime,
      origin: input.origin,
      destination: input.destination,
      piiTypesDetected: [],
      action: 'sanitized',
      reason: ''
    };

    try {
      // 1. Detectar PII
      const piiDetected = await this.piiDetector.detect(input.payload);
      audit.piiTypesDetected = [...new Set(piiDetected.map(p => p.type))];

      // 2. Se não há PII, retornar payload como está
      if (piiDetected.length === 0) {
        audit.action = 'allowed_raw';
        audit.reason = 'no_pii_detected';
        await this.auditLogger.log(audit);
        return {
          sanitized: input.payload,
          tokenMap: new Map(),
          piiDetected: [],
          violations: [],
          allowed: true,
          audit
        };
      }

      // 3. Verificar consentimento (se aplicável)
      const violations: Violation[] = [];
      if (input.destination.type === 'llm' || input.destination.type === 'node' || input.destination.type === 'tenant') {
        for (const pii of piiDetected) {
          const hasConsent = await this.consentRegistry.hasConsent(
            pii,
            input.context?.dataSubjectId,
            input.destination
          );
          if (!hasConsent) {
            violations.push({
              type: 'unconsented_data',
              severity: 'critical',
              description: `PII ${pii.type} sem consentimento para destino ${input.destination.type}`,
              affectedSubjects: 1,
              recommendation: 'Obter consentimento ou bloquear envio'
            });
          }
        }
      }

      // 4. Bloquear se houver violação crítica
      if (violations.some(v => v.severity === 'critical') && input.policy?.blockOnViolation !== false) {
        audit.action = 'blocked';
        audit.reason = `critical_violation: ${violations[0].type}`;
        await this.auditLogger.log(audit);
        return {
          sanitized: null,
          tokenMap: new Map(),
          piiDetected,
          violations,
          allowed: false,
          audit
        };
      }

      // 5. Sanitizar — substituir PII por tokens
      const { sanitized, tokenMap } = this.sanitize(input.payload, piiDetected);

      // 6. Logar auditoria
      audit.action = 'sanitized';
      audit.reason = `replaced_${piiDetected.length}_pii_fields`;
      await this.auditLogger.log(audit);

      return {
        sanitized,
        tokenMap,
        piiDetected,
        violations,
        allowed: true,
        audit
      };
    } catch (err) {
      audit.action = 'blocked';
      audit.reason = `error: ${err.message}`;
      await this.auditLogger.log(audit);
      throw err;
    }
  }

  /** Restaura tokens pelos valores originais (apenas dentro do mesmo tenant) */
  async restore(sanitized: any, tokenMap: Map<string, string>, context: { tenantId: string; userId: string }): Promise<any> {
    // Verificar que o contexto é o mesmo que originou a sanitização
    const isAuthorized = await this.vault.isAuthorized(tokenMap, context);
    if (!isAuthorized) {
      throw new Error('Unauthorized restoration attempt');
    }
    return this.unsanitize(sanitized, tokenMap);
  }
}
```

---

## 🔍 Detecção de PII

### Por Regex (determinístico)
```typescript
const PII_PATTERNS = {
  cpf: /\d{3}\.?\d{3}\.?\d{3}-?\d{2}/g,
  cnpj: /\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}/g,
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  phone: /\(?\d{2}\)?\s?9?\d{4}-?\d{4}/g,
  credit_card: /\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}/g,
  pix_key: /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi
};
```

### Por NER (Inteligência)
- Usa modelo de NER (Named Entity Recognition) para detectar nomes, endereços, organizações
- Modelo spaCy ou similar rodando on-premise (não envia para LLM)

### Por Lookup (Validação)
- CPFs são validados pelo algoritmo de checksum
- CNPJs idem
- Emails validados por DNS
- Cartões validados por Luhn

---

## 🔒 Política de Tratamento

### Por Tipo de PII

| Tipo | Enviar para LLM? | Cross-tenant? | Logar? |
|---|---|---|---|
| CPF | ❌ Nunca (anonimizar) | ❌ Nunca | Só hash |
| CNPJ | ❌ Nunca (anonimizar) | ❌ Nunca | Só hash |
| Email | ⚠️ Com consentimento | ⚠️ Com consentimento | Só hash |
| Telefone | ⚠️ Com consentimento | ⚠️ Com consentimento | Só hash |
| Nome | ⚠️ Com consentimento | ⚠️ Com consentimento | Só hash |
| IP | ❌ Nunca (anonimizar) | ❌ Nunca | Truncar |
| User Agent | ❌ Nunca (anonimizar) | ❌ Nunca | Truncar |
| Geolocalização | ❌ Nunca | ❌ Nunca | Agregar apenas |
| Data nascimento | ❌ Nunca (manter idade) | ❌ Nunca | Só idade |
| Saúde | ❌ Nunca | ❌ Nunca | ❌ Nunca |
| Religião | ❌ Nunca | ❌ Nunca | ❌ Nunca |
| Orientação sexual | ❌ Nunca | ❌ Nunca | ❌ Nunca |

---

## 🛡️ Vault de Tokens

O `SecureVault` armazena os mapeamentos token→valor original:

```typescript
class SecureVault {
  // Armazenado em memória (apenas para a sessão)
  // OU criptografado em disco (com key do tenant)
  // NUNCA em texto claro no DB
}
```

### Regras
- Tokens são **válidos apenas para a sessão** que os criou
- Expiração: 1 hora (após isso, valores precisam ser recarregados)
- Restauração cross-tenant: **bloqueada**
- Logs: só o **token**, nunca o valor

---

## 📊 Métricas de Sucesso

| Métrica | Meta |
|---|---|
| Latência | < 50ms (p95) |
| Acurácia de detecção (PII) | ≥ 99% |
| Falsos positivos | < 5% |
| Vazamentos de PII | 0 (zero!) |
| Audit log coverage | 100% |
| Tempo de retenção de logs | 5 anos (legal) |

---

## ⚠️ Cenários de Bloqueio (allowed = false)

1. PII crítica sem consentimento → BLOQUEIO
2. Cross-tenant sem autorização → BLOQUEIO
3. Dados sensíveis (saúde, religião) → BLOQUEIO
4. Sem base legal clara → BLOQUEIO
5. Retenção excedida → BLOQUEIO

---

## 🧪 Testes Críticos

- ✅ PII nunca vaza em logs
- ✅ Token não pode ser restaurado por outro tenant
- ✅ Bloqueio funciona em cenário crítico
- ✅ Performance aceitável (< 50ms)
- ✅ Restauração cross-tenant é bloqueada

---

## 🔗 Documentos Relacionados

- `00-base-agent.md` — todo agent passa pelo Gate
- `01-marketing-agent.md` — usa Gate antes de LLM
- `02-judge-revisor.md` — Judge também é sanitizado
- `../knowledge-base/03-conformidade-lgpd.md` — regras
- `../best-practices/01-error-handling.md` — falhas no Gate

---

**Versão 1.0** · Atualizado 2026-06-02 · Mantido pela Equipe Nexus
