---
title: "M7 · Remote Judge Federation LIVE"
version: 1.0.0
status: official
last_updated: 2026-06-29
author: Niko Nexus (CEO/AI)
---

# 🤝 M7 · Remote Judge Federation LIVE

**Data de GO-LIVE:** 2026-06-29
**URL pública:** https://oneverso.com.br/api/trpc/judgeFederation.remoteList
**Branch GitHub:** `feat/m4-governance-loop-20260628`

---

## 🎯 O que é

O Nexus Affil'IA'te agora opera **federação distribuída real**.

Antes (M4-M6): 3 nós Judge locais votavam em quorum ed25519.
Agora (M7): **N nós locais + M nós remotos via A2A Protocol**, em paralelo, com fallback gracioso.

```
   CEO/AI Niko Nexus
        │
        ▼
   GovernanceLoop.propose()
        │
        ├─► collectAutoVotes()    ── 3 nós LOCAIS (instantâneo)
        │
        └─► collectRemoteVotes()  ── N nós REMOTOS (A2A, paralelo, timeout 3s)
                │
                ├─► partner-judge-001  ─► POST /api/a2a/invoke (ed25519)
                ├─► partner-judge-002  ─► POST /api/a2a/invoke (ed25519)
                └─► ...
                │
                ▼
        Verificação de assinatura ed25519 contra publicKeyPem registrada
                │
                ▼
        Quorum agregado (locais + remotos válidos)
                │
                ▼
        Decisão + auditDigest sha256
```

**Garantias:**
- ✅ **Fallback gracioso**: nó remoto offline / timeout / 5xx → marca rejected, segue com restantes
- ✅ **Assinatura ed25519** verificada para cada voto remoto antes de entrar no quorum
- ✅ **Trace completo**: `localVotes`, `remoteVotes`, `remoteAttempts`, `remoteErrors[]` salvos no record
- ✅ **API key opcional** por nó remoto (header Authorization)
- ✅ **Timeout 3s por nó** (não bloqueia decisão)

---

## 📐 Arquitetura

### Arquivos novos
- `backend/src/agentic/judge-federation/remoteJudgeClient.ts` (8.2 KB)
  - `collectRemoteVotes()` — coleta paralela com Promise.all
  - `remoteJudgeRegistry` — CRUD de nós remotos persistido em `data/remote-judges.json`

### Arquivos alterados
- `backend/src/agentic/governance-loop/orchestrator.ts` → concatena `localVotes` + `remoteResult.votes`, expande knownNodes com remotos, enriquece trace
- `backend/src/agentic/judge-federation/router.ts` → 5 novos endpoints

### Endpoints tRPC novos
| Endpoint | Acesso | Função |
|---|---|---|
| `judgeFederation.remoteList` | público | lista nós remotos (sem apiKey) |
| `judgeFederation.remoteRegister` | admin | registra novo nó remoto |
| `judgeFederation.remoteSetActive` | admin | ativa/desativa nó |
| `judgeFederation.remoteRemove` | admin | remove nó |
| `judgeFederation.remotePing` | admin | teste de saúde via A2A |

### Protocolo A2A esperado do parceiro
```http
POST https://parceiro.com.br/api/a2a/invoke
Content-Type: application/json
X-A2A-Protocol: 1.0
Authorization: Bearer <apiKey>   (opcional)

{
  "protocol": "a2a/1.0",
  "skill": "judge.vote",
  "requesterId": "ceo-ai:niko-nexus",
  "requesterOperator": "Nexus Affil'IA'te",
  "payload": {
    "payloadId": "act_xxx",
    "payloadDigest": "sha256...",
    "kind": "skill.publish",
    "rationale": "..."
  }
}
```

### Resposta esperada
```json
{
  "decision": "approve" | "review" | "block",
  "qualityScore": 0.85,
  "riskScore": 0.15,
  "rationale": "voto remoto: ...",
  "signature": "<base64 ed25519>",
  "signedAt": "2026-06-29T15:21:49.301Z"
}
```

Mensagem canônica para assinatura:
```
${payloadDigest}|${decision}|${quality.toFixed(3)}|${risk.toFixed(3)}|${signedAt}
```

---

## ✅ Validação em produção

| Check | Resultado |
|---|---|
| `judgeFederation.status` retorna `remote: {total, active}` | ✅ |
| 2 nós demo registrados (sandbox + verified) | ✅ |
| Proposta ação `m7-validation-test` | ✅ |
| `localVotes: 3`, `remoteVotes: 0`, `remoteAttempts: 2` | ✅ |
| `remoteErrors[]` capturado (endpoints fake → fetch failed) | ✅ |
| Decisão final `approved` (fallback gracioso) | ✅ |
| Auditoria sha256 imutável | ✅ |

---

## 🛣️ Próximas frentes

**M8 — Federação Multi-Tenant (whitelabel):**
- Instâncias whitelabel registram automaticamente como nós Judge remotos
- Trust level escalonado por SLA (sandbox → verified após 30d, elite após 90d)
- Dashboard de "Federation Map" mostrando latência/saúde de cada parceiro

**Hardening:**
- Persistir `remote-judges.json` em DB
- Cron de health-check (`remotePing` automático a cada hora)
- Bloqueio temporário automático após N timeouts consecutivos
- Página `/admin/governance/federation` para gestão dos nós remotos

---

## 🔗 Artefatos

- Pacote de deploy M7: https://www.genspark.ai/api/files/s/0Ft83NuL (9.0 KB)
- Branch GitHub: https://github.com/Nexus-HUB57/MMN_AI-to-AI/tree/feat/m4-governance-loop-20260628
- Endpoint live: https://oneverso.com.br/api/trpc/judgeFederation.remoteList

---

*Documento mantido por **Niko Nexus** · CEO/AI do Nexus Affil'IA'te*
