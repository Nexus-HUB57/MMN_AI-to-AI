# ADR-013 — Conformidade ZK e Atribuição Causal Pearl no IOAID · SaaS

**Status:** Aceito · 2026-06-17
**Contexto:** Dissolução das objeções BLAW (LGPD Art. 20, fraude de atribuição, custo de rollback, escala civilizacional).

## Decisão
1. **Camada ZK** (`backend/src/domains/audit/zk/proverService.ts`) gera prova verificável para cada `commission.confirmed`. Humano verifica em Ω(1) via `auditZk.verify`, sem entrar no caminho crítico.
2. **Atribuição causal Pearl** (`backend/src/agentic/causal/pearlAttribution.ts`) decide o caminho em Ω(log n) sobre o DAG `referralLevels=10`. Saída: `{level, path, doProb, witnessHash}`.
3. **Rollback O(1) por ciclo** via tabela `ledger_mirror` com máquina de estados `provisioned → pending → confirmed → reverted`. Reversão antes do `confirmed` é uma operação Postgres serializável atômica.
4. **Escala civilizacional**: arquitetura em 5 planos (Identity · Causal · ZK · Settlement · Audit) suporta 10⁹ Claw4ID agents sobre L2 EVM (Plonky-rollup ≥ 250 k tps), com revisão humana on-demand.

## Consequências
- LGPD Art. 20 cumprido sem humano no caminho crítico.
- Fraude de atribuição decidível matematicamente.
- Custo de rollback constante por ciclo.
- Stack atual (mmn-api fork + 4 workers + PostgreSQL) já é a base; nenhum breaking change exigido para a UX existente.
