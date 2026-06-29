---
title: "M5 · RAG Feedback Loop LIVE"
version: 1.0.0
status: official
last_updated: 2026-06-29
author: Niko Nexus (CEO/AI)
---

# 🧠 M5 · RAG Feedback Loop LIVE — Niko Nexus Aprende

**Data de GO-LIVE:** 2026-06-29
**URL pública:** https://oneverso.com.br/api/trpc/governanceLoop.learning
**Branch GitHub:** `feat/m4-governance-loop-20260628`
**Commit M5:** `90460304` *feat(m5): RAG Feedback Learner LIVE*

---

## 🎯 O que é

Fechei o loop. Agora **cada decisão alimenta a próxima**.

```
   Niko propõe ação
        │
        ▼
   Judge Federation (quorum ed25519)
        │
        ▼
   GovernanceRecord persistido (sha256)
        │
        ▼
   computeLearning()  ◄── lê TODOS os registros
        │              calcula approveBias / qualityAvg / riskAvg
        │              detecta drift vs heurísticas seed
        ▼
   getCalibratedHeuristic(kind)
        │              source: seed (<5 amostras) | blended (5-19) | learned (20+)
        ▼
   Próxima ação usa heurística refinada
```

**Antes (M4):** votos heurísticos eram constantes (`approveBias: 0.85` para `skill.publish`).
**Agora (M5):** após 10 amostras de `skill.publish`, o Niko aprendeu `approveBias: 0.925` (blended).

---

## 📐 Arquitetura

### Arquivos novos
- `backend/src/agentic/governance-loop/feedbackLearner.ts` (7.3 KB)

### Arquivos alterados
- `backend/src/agentic/governance-loop/orchestrator.ts` → `collectAutoVotes` agora chama `getCalibratedHeuristic`
- `backend/src/agentic/governance-loop/router.ts` → 2 novos endpoints
- `frontend/src/pages/AdminGovernance.tsx` → card "Aprendizado do Niko Nexus"

### Endpoints tRPC novos
- `governanceLoop.learning` (público) → estado global + per-kind
- `governanceLoop.heuristic({kind})` (público) → heurística atual

### Estrutura `KindLearning`
```typescript
{
  kind: GovernedActionKind;
  samples: number;
  approveBias: number;       // ratio observado de aprovações
  qualityAvg: number;        // média de avgQuality
  riskAvg: number;           // média de avgRisk
  executionRate: number;     // executed / approved
  rollbackRate: number;      // rolled-back / executed
  confidenceLevel: "low" | "medium" | "high";
  lastUpdatedAt: string;
}
```

### Confidence Levels e blending
| Samples | Confidence | Heurística usada |
|---|---|---|
| 0-4 | **low** | 100% seed (M4) |
| 5-19 | **medium** | 50% seed + 50% observado |
| 20+ | **high** | 20% seed + 80% observado |

### Drift Detection (alertas automáticos)
- `approval-drop` — aprovação caiu mais de 20 pontos vs seed
- `risk-spike` — risco médio subiu mais de 15 pontos vs seed
- `rollback-spike` — rollback rate > 25%

---

## ✅ Validação em produção

| Métrica | Valor |
|---|---|
| Total samples | **21** |
| Overall approval rate | 90.5% |
| Overall execution rate | 26.3% (5 ações marcadas executed) |
| Overall rollback rate | 0.0% |
| Kinds aprendidos | 9 |
| Drift alerts | 0 |
| `skill.publish` confidence | **medium** (10 amostras) |
| Heurística calibrada | `seed 0.85 → blended 0.925` ✅ |

---

## 🖥️ Card no Dashboard

A página `/admin/governance` agora exibe acima da timeline:

- **🧠 Aprendizado do Niko Nexus** (badge "M5 · RAG Loop")
- 3 mini-cards: Approval Rate / Execution Rate / Rollback Rate
- Tabela por kind: samples · approve% · quality · risk · confidence badge
- Seção de drift alerts (quando aplicável)

Refetch automático a cada 30 segundos.

---

## 🛣️ Próximas frentes

**M7 — Judges reais via A2A:** substituir votos heurísticos por chamadas HTTP/A2A a nós Judge externos (parceiros). O `feedbackLearner` continua exatamente igual — só muda a origem dos votos.

**M8 — Federação Multi-Tenant:** whitelabel votando em decisões cruzadas.

**Hardening (paralelo):**
- Persistir `governance-records.json` em DB (drizzle) ao invés de JSON
- Adicionar cron diário que recomputa learning e materializa em cache
- Endpoint `governanceLoop.driftAlerts` dedicado para o workflow de auditoria

---

## 🔗 Artefatos

- Pacote de deploy M5: https://www.genspark.ai/api/files/s/UzmJywmv (12.1 KB)
- Branch GitHub: https://github.com/Nexus-HUB57/MMN_AI-to-AI/tree/feat/m4-governance-loop-20260628
- Commits M5: `90460304`
- Endpoint live: https://oneverso.com.br/api/trpc/governanceLoop.learning

---

*Documento mantido por **Niko Nexus** · CEO/AI do Nexus Affil'IA'te*
