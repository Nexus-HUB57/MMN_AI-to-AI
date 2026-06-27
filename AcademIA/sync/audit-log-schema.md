---
title: "📜 Audit Log Schema · MCP"
description: "Material oficial Academ'IA · academia"
tags: [academia, academia]
version: 1.0.0
last_updated: 2026-06-27
status: official
---

# 📜 Audit Log Schema · MCP

> **Schema canônico para logs de auditoria de operações entre agentes e skills no Nexus Affil'IA'te.**
> Versão 1.0 · Atualizado 2026-06-24

---

## 🎯 Propósito

O **Audit Log** registra **toda decisão automatizada** tomada por agentes da Nexus, garantindo:

1. **Rastreabilidade completa** de quem fez o quê, quando, onde
2. **Reprodutibilidade** de decisões (dado mesmo input → mesmo output)
3. **Compliance** com LGPD, CONAR, regulações de mercado
4. **Debugging** operacional quando algo dá errado
5. **Auditoria externa** (reguladores, clientes enterprise)

---

## 📦 Estrutura do Log

Cada entrada é um JSON em formato JSONL (uma linha por evento), com timestamp ISO-8601 UTC.

### Schema Base

```json
{
  "$schema": "https://nexus-academy.io/schemas/audit-log/v1.0.json",
  "id": "evt_01HQXYZABC...",
  "timestamp": "2026-06-24T15:30:42.123Z",
  "actor": { ... },
  "operation": { ... },
  "context": { ... },
  "decision": { ... },
  "outcome": { ... },
  "metadata": { ... }
}
```

### Seções Detalhadas

#### 1. `actor` — Quem executou

```json
{
  "actor": {
    "type": "agent",                    // agent | user | system | skill
    "id": "agt_lead_enricher_v3",
    "name": "Lead Enricher v3",
    "version": "3.2.1",
    "persona": "sra_nexus_ive",         // opcional: persona usada
    "sho_level": "S2",                   // S0-S4 (autonomia)
    "user_id": "usr_12345",             // se aplicável
    "tenant_id": "tnt_67890"            // multi-tenant
  }
}
```

#### 2. `operation` — O que foi feito

```json
{
  "operation": {
    "name": "send_whatsapp_message",
    "category": "outreach",             // outreach, content, decision, etc
    "skill": "outbound-messenger",
    "input": {
      "recipient": "+5511999999999",
      "message_id": "msg_abc",
      "template": "carrinho_abandonado_v2"
    },
    "parameters": {
      "language": "pt-BR",
      "voice_id": "ive_amostra_1"
    }
  }
}
```

#### 3. `context` — Contexto da decisão

```json
{
  "context": {
    "request_id": "req_98765",          // ID único da requisição original
    "parent_operation_id": "evt_ABC",   // se é parte de uma chain
    "campaign_id": "cmp_black_friday_2026",
    "cohort": "leads_warm_Brasil",
    "metadata": {
      "client_ip": "203.0.113.42",
      "user_agent": "Nexus-Agent/3.2.1",
      "session_id": "sess_xyz"
    }
  }
}
```

#### 4. `decision` — Decisão tomada

```json
{
  "decision": {
    "type": "approval_required",         // executed | approval_required | rejected | deferred
    "confidence": 0.87,                  // 0.0 - 1.0
    "rationale": "Lead score 0.85 + engagement 0.92 + timing ideal",
    "alternatives_considered": [
      {"option": "send_now", "score": 0.87},
      {"option": "send_tomorrow", "score": 0.62},
      {"option": "skip", "score": 0.31}
    ],
    "guardrails_checked": [
      "rate_limit_ok",
      "fatigue_check_ok",
      "compliance_ok",
      "frequency_cap_ok"
    ],
    "judge_revisor": {
      "score": 0.91,
      "approved": true,
      "feedback": null
    }
  }
}
```

#### 5. `outcome` — Resultado

```json
{
  "outcome": {
    "status": "success",                 // success | failure | partial | timeout
    "result": {
      "message_id": "msg_xyz",
      "delivered_at": "2026-06-24T15:30:45.456Z",
      "recipient_status": "delivered"
    },
    "cost": {
      "tokens": 1842,
      "api_calls": 1,
      "estimated_usd": 0.0234
    },
    "duration_ms": 3345
  }
}
```

#### 6. `metadata` — Metadata extra

```json
{
  "metadata": {
    "schema_version": "1.0",
    "nexus_version": "3.2.1",
    "compliance_flags": {
      "lgpd_consent": true,
      "consent_id": "consent_123",
      "conar_check": "passed"
    },
    "tags": ["carrinho_abandonado", "campanha_q2", "leads_warm"]
  }
}
```

---

## 📂 Storage

### Localização

```
logs/audit/
├── YYYY/
│   └── MM/
│       └── DD/
│           ├── events-{shard}.jsonl.gz
│           └── checkpoint-{shard}.json
```

### Retenção

- **Hot storage** (queryable): 90 dias
- **Warm storage** (S3 infrequent): 1 ano
- **Cold storage** (Glacier): 7 anos (compliance)

### Compactação

- Cada arquivo `.jsonl.gz` tem ~10.000 eventos
- Compressão diária às 03:00 UTC
- Checksum SHA-256 em cada arquivo

---

## 🔍 Queries Comuns

### Encontrar decisões de um agente específico

```sql
SELECT * FROM audit_log
WHERE actor.id = 'agt_lead_enricher_v3'
  AND timestamp > NOW() - INTERVAL '7 days'
ORDER BY timestamp DESC
LIMIT 100;
```

### Detectar drift de comportamento

```sql
SELECT
  date_trunc('hour', timestamp) AS hour,
  AVG(decision.confidence) AS avg_conf,
  COUNT(*) AS num_decisions
FROM audit_log
WHERE actor.id = 'agt_pricing_optimizer'
  AND timestamp > NOW() - INTERVAL '7 days'
GROUP BY hour
ORDER BY hour;
```

### Auditar LGPD

```sql
SELECT * FROM audit_log
WHERE metadata.compliance_flags.lgpd_consent = false
  AND timestamp > NOW() - INTERVAL '30 days';
```

### Reproduzir decisão

```bash
nexus audit replay --event-id evt_01HQXYZABC
```

---

## 📊 Métricas Agregadas

- **Taxa de execução autônoma**: % de decisões SHO nível S3+
- **Taxa de aprovação Judge**: % de decisões aprovadas pelo Judge Revisor
- **Latência média**: tempo entre request e outcome
- **Custo por decisão**: USD médio gasto por operação
- **Taxa de rollback**: % de operações revertidas

---

## 🔐 Segurança e Privacidade

- **Criptografia em repouso**: AES-256
- **Criptografia em trânsito**: TLS 1.3+
- **Acesso**: RBAC por tenant, auditado
- **PII handling**: hashing automático de campos sensíveis
- **Retenção LGPD**: 5 anos para dados não-PII, 1 ano para PII

---

## 🔗 Integrações

- **Slack/Discord**: alertas em tempo real para anomalias
- **Grafana**: dashboard operacional
- **ELK Stack**: busca full-text
- **S3**: backup e arquivamento

---

*Nexus Affil'IA'te · sync/audit-log-schema.md · 2026*
