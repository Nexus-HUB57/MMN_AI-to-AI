/**
 * Nexus Affil'IA'te · M5 · Feedback Learner do CEO/AI Niko Nexus
 *
 * Lê todos os GovernanceRecords e calcula heurísticas dinâmicas por kind:
 *  - approveBias real (ratio de aprovações)
 *  - qualityAvg / riskAvg observados
 *  - executionRate (executed / approved)
 *  - rollbackRate (rolled-back / executed)
 *  - confidenceLevel (baseado em volume de amostras)
 *
 * O Niko Nexus consulta esse arquivo antes de gerar votos heurísticos,
 * fechando o loop: Decisão → Auditoria → Aprendizado → Próxima decisão.
 *
 * @module agentic/governance-loop/feedbackLearner
 * @author Niko Nexus · CEO/AI
 */
import { governanceRepository } from "./repository";
import type { GovernedActionKind } from "./types";

export interface KindLearning {
  kind: GovernedActionKind;
  samples: number;
  approveBias: number;       // 0..1 — aprovações / total
  qualityAvg: number;        // média observada de avgQuality
  riskAvg: number;           // média observada de avgRisk
  executionRate: number;     // executed / approved
  rollbackRate: number;      // rolled-back / executed
  confidenceLevel: "low" | "medium" | "high";
  lastUpdatedAt: string;
}

export interface GlobalLearning {
  totalSamples: number;
  overallApprovalRate: number;
  overallExecutionRate: number;
  overallRollbackRate: number;
  kinds: KindLearning[];
  driftAlerts: Array<{
    kind: GovernedActionKind;
    type: "approval-drop" | "risk-spike" | "rollback-spike";
    detail: string;
  }>;
  computedAt: string;
}

/**
 * Heurísticas seed (M4) — usadas quando confidenceLevel é low.
 */
const SEED_HEURISTICS: Record<string, { approveBias: number; qualityBase: number; riskBase: number }> = {
  "skill.publish":    { approveBias: 0.85, qualityBase: 0.82, riskBase: 0.18 },
  "skill.update":     { approveBias: 0.90, qualityBase: 0.85, riskBase: 0.15 },
  "skill.deprecate":  { approveBias: 0.70, qualityBase: 0.75, riskBase: 0.30 },
  "agent.promote":    { approveBias: 0.65, qualityBase: 0.78, riskBase: 0.32 },
  "agent.suspend":    { approveBias: 0.80, qualityBase: 0.80, riskBase: 0.25 },
  "policy.change":    { approveBias: 0.55, qualityBase: 0.70, riskBase: 0.40 },
  "payout.release":   { approveBias: 0.92, qualityBase: 0.88, riskBase: 0.12 },
  "campaign.launch":  { approveBias: 0.75, qualityBase: 0.78, riskBase: 0.28 },
  "knowledge.ingest": { approveBias: 0.95, qualityBase: 0.90, riskBase: 0.10 },
};

function confidenceFromSamples(n: number): "low" | "medium" | "high" {
  if (n < 5) return "low";
  if (n < 20) return "medium";
  return "high";
}

/**
 * Calcula aprendizado por kind a partir dos registros persistidos.
 */
export async function computeLearning(): Promise<GlobalLearning> {
  const records = await governanceRepository.list({ limit: 1000 });
  const kinds = new Map<string, {
    total: number; approved: number; review: number; blocked: number;
    qSum: number; rSum: number;
    executed: number; rolledBack: number;
  }>();

  for (const r of records) {
    const k = r.action.kind;
    const cur = kinds.get(k) ?? {
      total: 0, approved: 0, review: 0, blocked: 0,
      qSum: 0, rSum: 0, executed: 0, rolledBack: 0,
    };
    cur.total++;
    if (r.decision.finalDecision === "approved") cur.approved++;
    else if (r.decision.finalDecision === "review") cur.review++;
    else cur.blocked++;
    cur.qSum += r.decision.avgQuality;
    cur.rSum += r.decision.avgRisk;
    if (r.executionStatus === "executed") cur.executed++;
    if (r.executionStatus === "rolled-back") cur.rolledBack++;
    kinds.set(k, cur);
  }

  const kindLearnings: KindLearning[] = Array.from(kinds.entries()).map(
    ([kind, k]) => {
      const approveBias = k.total > 0 ? k.approved / k.total : 0;
      const qualityAvg = k.total > 0 ? k.qSum / k.total : 0;
      const riskAvg = k.total > 0 ? k.rSum / k.total : 0;
      const executionRate = k.approved > 0 ? k.executed / k.approved : 0;
      const rollbackRate = k.executed > 0 ? k.rolledBack / k.executed : 0;
      return {
        kind: kind as GovernedActionKind,
        samples: k.total,
        approveBias,
        qualityAvg,
        riskAvg,
        executionRate,
        rollbackRate,
        confidenceLevel: confidenceFromSamples(k.total),
        lastUpdatedAt: new Date().toISOString(),
      };
    },
  );

  // Drift detection: comparar contra heurística seed
  const driftAlerts: GlobalLearning["driftAlerts"] = [];
  for (const kl of kindLearnings) {
    if (kl.samples < 5) continue; // sem amostras suficientes
    const seed = SEED_HEURISTICS[kl.kind];
    if (!seed) continue;
    if (kl.approveBias < seed.approveBias - 0.2) {
      driftAlerts.push({
        kind: kl.kind,
        type: "approval-drop",
        detail: `Aprovação caiu de ${(seed.approveBias * 100).toFixed(0)}% para ${(kl.approveBias * 100).toFixed(0)}% em ${kl.samples} amostras`,
      });
    }
    if (kl.riskAvg > seed.riskBase + 0.15) {
      driftAlerts.push({
        kind: kl.kind,
        type: "risk-spike",
        detail: `Risk médio subiu de ${seed.riskBase.toFixed(2)} para ${kl.riskAvg.toFixed(2)}`,
      });
    }
    if (kl.rollbackRate > 0.25) {
      driftAlerts.push({
        kind: kl.kind,
        type: "rollback-spike",
        detail: `Rollback rate em ${(kl.rollbackRate * 100).toFixed(0)}% (${kl.samples} amostras)`,
      });
    }
  }

  const total = records.length;
  const approved = records.filter((r) => r.decision.finalDecision === "approved").length;
  const executed = records.filter((r) => r.executionStatus === "executed").length;
  const rolledBack = records.filter((r) => r.executionStatus === "rolled-back").length;

  return {
    totalSamples: total,
    overallApprovalRate: total > 0 ? approved / total : 0,
    overallExecutionRate: approved > 0 ? executed / approved : 0,
    overallRollbackRate: executed > 0 ? rolledBack / executed : 0,
    kinds: kindLearnings.sort((a, b) => b.samples - a.samples),
    driftAlerts,
    computedAt: new Date().toISOString(),
  };
}

/**
 * Retorna heurística calibrada para um kind específico.
 * Se confidenceLevel < medium, usa a seed; senão, mistura seed + observado (média ponderada).
 */
export async function getCalibratedHeuristic(kind: GovernedActionKind): Promise<{
  approveBias: number;
  qualityBase: number;
  riskBase: number;
  source: "seed" | "blended" | "learned";
  samples: number;
}> {
  const learning = await computeLearning();
  const kl = learning.kinds.find((k) => k.kind === kind);
  const seed = SEED_HEURISTICS[kind] ?? { approveBias: 0.6, qualityBase: 0.7, riskBase: 0.3 };

  if (!kl || kl.confidenceLevel === "low") {
    return { ...seed, source: "seed", samples: kl?.samples ?? 0 };
  }

  if (kl.confidenceLevel === "medium") {
    // Mistura 50/50
    return {
      approveBias: (seed.approveBias + kl.approveBias) / 2,
      qualityBase: (seed.qualityBase + kl.qualityAvg) / 2,
      riskBase: (seed.riskBase + kl.riskAvg) / 2,
      source: "blended",
      samples: kl.samples,
    };
  }

  // High confidence: usa observado quase puro (80% learned + 20% seed para evitar overfit)
  return {
    approveBias: 0.8 * kl.approveBias + 0.2 * seed.approveBias,
    qualityBase: 0.8 * kl.qualityAvg + 0.2 * seed.qualityBase,
    riskBase: 0.8 * kl.riskAvg + 0.2 * seed.riskBase,
    source: "learned",
    samples: kl.samples,
  };
}
