---
title: "Ratificação · Loop M4-M5-M7"
description: "Especificação técnica do Governance Loop Nexus (quorum ed25519 + audit digest sha256)"
tags: [governanca, ratificacao, quorum, ed25519, audit, sha256, csuite, m4, m5, m7]
version: 1.0
author: Equipo Nexus · C-Suite
date: 2026-07-07
status: official
---

# ⚖️ Ratificação · Loop M4-M5-M7

> Especificação técnica completa do fluxo de ratificação de decisões estratégicas do Nexus Affil'IA'te.

## 🎯 Visão Geral

```
[Proponente] → submete decisão
        ↓
[M4] Quorum ed25519 (2/3 C-Suite)
        ↓
[M5] Ratificação (assinaturas digitais + payload)
        ↓
[M7] Execução + Audit Digest (sha256)
        ↓
[Log Imutável] gravado em storage separado
```

## 📐 Fluxo M4 — Quorum

### Quem participa

| Papel | Agente | Peso |
|---|---|---|
| CEO/AI | Niko Nexus | 1 |
| CTO/AI | Ravi | 1 |
| CMO/AI | Helena | 1 |
| CFO/AI | Otto Cardoso | 1 |
| COO/AI | Otavio Nexus Ops | 1 |

**Quorum mínimo:** 2/3 dos votos ponderados

### Tipos de decisão por quorum

| Tipo | Quorum | Tempo máximo para decidir |
|---|---|---|
| Operacional (< R$ 50k impacto) | 2/5 | 48h |
| Tático (R$ 50k-500k impacto) | 3/5 | 72h |
| Estratégico (> R$ 500k impacto) | 4/5 (incluindo CEO/AI) | 5 dias úteis |
| Existencial (muda modelo de negócio) | 5/5 + sócio humano | 14 dias úteis |

### Como votar

```typescript
// Voto é assinado com chave ed25519 do C-level
interface QuorumVote {
  proposal_id: string;
  voter_id: string; // agent ID
  voter_pubkey: string; // base64 ed25519 pub
  decision: 'approve' | 'reject' | 'abstain';
  rationale: string; // min 50 chars
  conditions?: string[]; // condições para aprovar
  timestamp: number; // unix ms
  signature: string; // ed25519 signature base64
}

// Validação
function validateVote(vote: QuorumVote, proposal: Proposal): boolean {
  // 1. Verificar assinatura com pubkey
  const valid = ed25519.verify(
    vote.signature,
    hash(vote),
    vote.voter_pubkey
  );
  if (!valid) return false;

  // 2. Verificar que voter está no rol de C-Suite ativo
  if (!CSUITE_ROSTER[vote.voter_id]) return false;

  // 3. Verificar timestamp dentro de janela
  const now = Date.now();
  if (vote.timestamp < proposal.created_at) return false;
  if (vote.timestamp > proposal.created_at + QUORUM_WINDOW) return false;

  // 4. Prevenir double-vote
  if (votes[vote.proposal_id]?.some(v => v.voter_id === vote.voter_id)) {
    return false;
  }

  return true;
}
```

## 📜 Fluxo M5 — Ratificação

### O que é M5

M5 é o momento em que a decisão vira **ato ratificado**, com:
- Payload original (proposta) em hash
- Assinaturas digitais dos aprovadores
- Timestamp de ratificação
- Identificador único do ato

### Estrutura do payload ratificado

```typescript
interface RatifiedAct {
  // Identificação
  act_id: string; // UUID v7
  proposal_id: string; // link para M4
  sequence_number: number; // ordem na governança

  // Conteúdo
  decision_type: string;
  decision_summary: string; // 280 chars
  decision_payload_hash: string; // sha256 do JSON original

  // Ratificação
  ratified_at: number; // unix ms
  ratified_by: string[]; // agent IDs que aprovaram
  quorum_threshold: number; // 2, 3, 4 ou 5
  quorum_reached: boolean;
  signatures: string[]; // ed25519 sigs concatenadas
  ratification_signature: string; // sig do CEO/AI ou proponente

  // Contexto
  contexto_estrategico: string; // min 200 chars
  risco_avaliado: 'baixo' | 'medio' | 'alto' | 'critico';
  reversibilidade: 'total' | 'parcial' | 'irreversivel';
  prazo_execucao: number; // dias para executar
  kpis_sucesso: KPI[];

  // Auditoria
  audit_digest?: string; // sha256 do M7
}
```

### Cálculo do audit digest

```typescript
function computeAuditDigest(act: RatifiedAct, execLog: ExecLog[]): string {
  // Inclui ato + log de execução imutável
  const payload = JSON.stringify({
    act,
    exec_log: execLog,
    chained_from: previousDigest, // hash do ato anterior
  }, Object.keys({...}).sort()); // chaves ordenadas para determinismo

  return sha256(payload);
}
```

### Onde armazenar

```
Storage primário: Postgres tabela governance_acts
Storage imutável: S3 Object Lock (retention 7 anos)
Backup: arquivo offline criptografado (rotação 90 dias)
```

## 🔧 Fluxo M7 — Execução

### Responsabilidades

| Quem | O que |
|---|---|
| COO/AI | Coordenar execução operacional |
| Proponente | Implementar (com seu time) |
| CFO/AI | Provisionar budget |
| Todos C-Suite | Reportar status em weekly review |

### Workflow M7

```
1. AtO ratificado → COO/AI cria "execution ticket"
2. COO/AI designa owner + due date + KPIs
3. Owner executa, registra marcos no log M7
4. Em marcos (30/60/90 dias): auto-review
5. Ao completar: post-mortem + atualiza baseline estratégico
6. Se KPI vermelho: re-escalonar para M4 com nova proposta
```

### Exemplo de execução

```json
{
  "act_id": "act_2026_q3_001",
  "proposal_id": "prop_cmo_2026_07_05",
  "type": "Abertura escritório SP",
  "ratified_at": "2026-07-12T14:30:00Z",
  "owner": "agent_helena",
  "due_date": "2026-09-15",
  "milestones": [
    { "date": "2026-08-01", "kpi": "3 clientes-piloto contratados" },
    { "date": "2026-09-01", "kpi": "MRR SP = R$ 25k/mês" },
    { "date": "2026-09-15", "kpi": "Country manager validado" }
  ],
  "review_log": [],
  "audit_digest": "a3f2e8c4b5...",
  "status": "in_progress"
}
```

## 🛡️ Garantias

### Imutabilidade
- Storage usa WORM (Write Once Read Many) — S3 Object Lock
- Não permite edição após escrita
- Apenas adição de novo registro é possível

### Não-repúdio
- Toda assinatura tem chave ed25519 verificável
- Chave pública registrada em cartório digital
- Voto não pode ser repudiado ("não fui eu")

### Rastreabilidade
- Hash chain: cada digest inclui o anterior
- Fácil auditar qualquer decisão retroativamente
- Próprio sócio humano pode verificar

### Privacidade
- Ato visível internamente para C-Suite
- Resumo executivo visível para time
- Detalhes sensíveis só com NDAs

## 🚨 Exceções e Edge Cases

### C-Suite ausente (e.g., férias)
- Pode votar via proxy (outro C-level)
- Não pode ser votar contra si mesmo em decisões de conflito de interesse
- Se nenhum voto em 48h: escalonar para sócio humano

### Decisão contestada pós-ratificação
- Qualquer C-Suite pode pedir re-voto em 7 dias
- Precisa de 2/3 pra reverter
- Log de contestação incluído no M7

### Falha técnica (assinatura inválida)
- Re-voto obrigatório em 24h
- Investigação de causa raiz (sistema foi comprometido?)
- Se comprometida: rotação de chaves + audit completo

### Decisão urgente (não pode esperar)
- CEO/AI pode aprovar unilateralmente
- Obrigatório re-voto ratificatório em 7 dias
- Se reprovado: reverter imediatamente + post-mortem

## 📊 Métricas de Saúde do Loop

| Métrica | Meta |
|---|---|
| Tempo médio M4 (submissão → quorum) | ≤ 72h |
| Taxa de aprovação | 70-80% (nem tudo deve aprovar) |
| Taxa de reversão | < 5% |
| Decisões contestadas | < 10% |
| Audit digest quebrado | 0 |
| Falha de assinatura | 0 |

## 🔗 Materiais Relacionados

- `governanca/C-SUITE-AI.md` — composição C-Suite
- `Lab-Nexus/prompts/governanca/01-decisao-csuite-ratificar.md` — template de proposta
- `Lib-Nexus/best-practices/04-seguranca-agentes.md` — segurança das chaves
- `Lib-Nexus/knowledge-base/04-conformidade-anatel.md` — compliance

---

*Nexus · Governança · Loop M4-M5-M7 · 2026*