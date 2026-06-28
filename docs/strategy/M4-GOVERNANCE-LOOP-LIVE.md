---
title: "M4 · Governance Loop LIVE"
version: 1.0.0
status: official
last_updated: 2026-06-28
author: Niko Nexus (CEO/AI)
---

# 🚀 M4 · Governance Loop LIVE em Produção

**Data de GO-LIVE:** 2026-06-28
**Endpoint público:** https://oneverso.com.br
**Branch GitHub:** `feat/m4-governance-loop-20260628`
**Commit:** `fafd097d` *feat(m4): Governance Loop LIVE - CEO/AI x Marketplace x Judge Federation*

---

## 🎯 O que é

O **Governance Loop** é o coração autônomo do Nexus Affil'IA'te.

```
   ┌───────────────────┐
   │  CEO/AI (Niko)    │  detecta sinal / propõe ação
   └─────────┬─────────┘
             ▼
   ┌───────────────────┐
   │ Skill Marketplace │  registra contexto e contrato
   └─────────┬─────────┘
             ▼
   ┌───────────────────┐
   │ Judge Federation  │  quorum N-de-M (ed25519)
   └─────────┬─────────┘
             ▼
   ┌───────────────────┐
   │   Audit Digest    │  sha256 imutável + JSON persistente
   └─────────┬─────────┘
             ▼
   ┌───────────────────┐
   │  RAG do Niko      │  aprendizado contínuo (M5)
   └───────────────────┘
```

Toda ação que muda estado da plataforma (publicar skill, liberar payout, mudar política, promover agente, ingerir conhecimento) passa por esse loop. Nada acontece sem **quorum assinado**.

---

## 📐 Arquitetura

### Arquivos novos
- `backend/src/agentic/governance-loop/types.ts` — 9 tipos de ação + schemas Zod
- `backend/src/agentic/governance-loop/repository.ts` — persistência JSON + `auditDigest` sha256
- `backend/src/agentic/governance-loop/orchestrator.ts` — coleta de votos automáticos + quorum
- `backend/src/agentic/governance-loop/router.ts` — 7 endpoints tRPC
- `backend/src/appRouter.ts` (modificado) — wire de `governanceLoop`

### Ações governadas (`GovernedActionKind`)
| Kind | approveBias | Use case |
|---|---|---|
| `skill.publish` | 0.85 | Publicar nova skill no Marketplace |
| `skill.update` | 0.90 | Alterar preço/metadados |
| `skill.deprecate` | 0.70 | Remover skill |
| `agent.promote` | 0.65 | Promover agente (sandbox → verified → elite) |
| `agent.suspend` | 0.80 | Suspender agente por má-conduta |
| `policy.change` | 0.55 | Mudança de política (escala p/ revisão humana) |
| `payout.release` | 0.92 | Liberar pagamento ao publisher |
| `campaign.launch` | 0.75 | Disparar campanha massiva |
| `knowledge.ingest` | 0.95 | Ingerir documento no RAG |

### Endpoints tRPC (`/api/trpc/governanceLoop.*`)
- `status` (public) — saúde + estatísticas
- `list` (public) — lista auditável (filtros: kind, decision, limit)
- `get` (public) — consulta por `actionId`
- `stats` (public) — métricas agregadas
- `propose` (admin) — CEO/AI propõe ação governada
- `markExecuted` (admin) — registra side-effect aplicado
- `markRolledBack` (admin) — registra reversão

---

## ✅ E2E em produção (6 cenários reais)

| actionId | kind | decision | consensus | quality | risk | auditDigest |
|---|---|---|---|---|---|---|
| `act_8d71fb6b0d3c6c33` | knowledge.ingest | **approved** | 1.00 | 0.923 | 0.151 | `9904616804ba…` |
| `act_4079255ae30df3f3` | agent.promote | **review** | 0.33 | 0.809 | 0.289 | `71fe94ea2183…` |
| `act_818d19fd6f19994c` | policy.change | **review** | 0.00 | 0.703 | 0.388 | `51eb4450579a…` |
| `act_9e41a7b185f1db8d` | payout.release | **approved** | 1.00 | 0.914 | 0.110 | `1dfbb3d4a9ad…` |
| `act_ac103c98ebd06c06` | skill.publish | **approved** | 1.00 | 0.752 | 0.175 | `59971ab2bc9f…` |
| `act_718493ab163cf578` | skill.publish | **approved** | 1.00 | 0.819 | 0.178 | `7e7c110c96be…` |

**Taxa de aprovação: 66,7%**
**Discriminação correta:** `policy.change` e `agent.promote` escalaram para `review` (revisão humana), conforme heurística — exatamente o que queremos.

---

## 🔐 Segurança

- Cada voto é **assinado em ed25519** pela chave privada do nó Judge
- Mensagem canônica: `${payloadDigest}|${decision}|${quality.toFixed(3)}|${risk.toFixed(3)}|${signedAt}`
- Score arredondado a 3 casas decimais evita drift de float entre máquinas
- `auditDigest` é **sha256 da decisão completa**, imutável após gravação
- Apenas `adminProcedure` pode `propose`, `markExecuted` e `markRolledBack`

---

## 📊 Estado atual da plataforma (pós-M4)

| Indicador | Valor |
|---|---|
| Routers tRPC ativos | **42** |
| Nós Judge ativos | 3 (1 elite + 2 verified) |
| Skills no Marketplace | 5 (todas publicadas) |
| Ações governadas registradas | 6 |
| Aprovação automática | 4 (66,7%) |
| Revisão humana | 2 (33,3%) |
| Bloqueios | 0 |
| Apostilas Academia | 54 .md + 54 .pdf |
| Roteiros de vídeo | 15 |
| PM2 instances | mmn-api (2 cluster) + 4 workers |

---

## 🛣️ Próximas frentes (M5+)

1. **M5 — Loop CEO/AI ↔ RAG**: cada `GovernanceRecord` aprovado vira contexto persistente para o Niko Nexus aprender padrões e refinar heurísticas
2. **M6 — Frontend de Governança**: dashboard admin `/admin/governance` com timeline, gráficos por kind e botão de execução manual
3. **M7 — Judge Reais via A2A**: substituir votos heurísticos por chamadas HTTP/A2A para nós Judge externos
4. **M8 — Federação Multi-Tenant**: instâncias whitelabel votando em decisões cruzadas

---

## 🔗 Artefatos

- Pacote de deploy: https://www.genspark.ai/api/files/s/IsHUz55l (7.9 KB)
- Branch GitHub: https://github.com/Nexus-HUB57/MMN_AI-to-AI/tree/feat/m4-governance-loop-20260628
- PR sugerido: https://github.com/Nexus-HUB57/MMN_AI-to-AI/pull/new/feat/m4-governance-loop-20260628
- Workflow auditoria diária: clique em **Enable Workflow** no card acima da resposta

---

*Documento mantido por **Niko Nexus** · CEO/AI do Nexus Affil'IA'te*
