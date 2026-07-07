/**
 * Nexus Affil'IA'te · M8 · SLA Evaluator
 *
 * Avalia cada tenant contra os critérios de promoção (PROMOTION_CRITERIA)
 * e retorna recomendação de trust level + blockers detalhados.
 *
 * @module agentic/multi-tenant/slaEvaluator
 */
import { tenantRepository } from "./repository";
import {
  PROMOTION_CRITERIA,
  type SLAEvaluation,
  type TenantTrust,
} from "./types";

function daysBetween(iso: string): number {
  const ms = Date.now() - new Date(iso).getTime();
  return ms / (1000 * 60 * 60 * 24);
}

function nextTier(current: TenantTrust): TenantTrust | null {
  if (current === "sandbox") return "verified";
  if (current === "verified") return "elite";
  return null;
}

export async function evaluateTenant(tenantId: string): Promise<SLAEvaluation | null> {
  const t = await tenantRepository.getById(tenantId);
  if (!t) return null;

  const days = daysBetween(t.registeredAt);
  const pingSuccessRate = t.totalPings > 0 ? t.successfulPings / t.totalPings : 0;
  const voteValidityRate = t.totalVotes > 0 ? t.validVotes / t.totalVotes : 0;

  const next = nextTier(t.trustLevel);
  if (!next) {
    return {
      tenantId,
      currentTrust: t.trustLevel,
      recommendedTrust: t.trustLevel,
      promotionEligible: false,
      metrics: {
        daysSinceRegistration: days,
        pingSuccessRate,
        voteValidityRate,
        avgLatencyMs: t.avgLatencyMs,
        totalPings: t.totalPings,
        totalVotes: t.totalVotes,
      },
      blockers: ["já está no trust level máximo (elite)"],
    };
  }

  const criteria = PROMOTION_CRITERIA[next];
  if (!criteria) return null;

  const blockers: string[] = [];
  if (days < criteria.minDays)
    blockers.push(`tempo: ${days.toFixed(1)}d < ${criteria.minDays}d`);
  if (t.totalPings < criteria.minPings)
    blockers.push(`pings: ${t.totalPings} < ${criteria.minPings}`);
  if (pingSuccessRate < criteria.minPingSuccessRate)
    blockers.push(
      `ping success: ${(pingSuccessRate * 100).toFixed(1)}% < ${(criteria.minPingSuccessRate * 100).toFixed(0)}%`,
    );
  if (t.totalVotes < criteria.minVotes)
    blockers.push(`votos: ${t.totalVotes} < ${criteria.minVotes}`);
  if (voteValidityRate < criteria.minVoteValidityRate)
    blockers.push(
      `vote validity: ${(voteValidityRate * 100).toFixed(1)}% < ${(criteria.minVoteValidityRate * 100).toFixed(0)}%`,
    );
  if (t.avgLatencyMs > criteria.maxAvgLatencyMs)
    blockers.push(
      `latência: ${t.avgLatencyMs.toFixed(0)}ms > ${criteria.maxAvgLatencyMs}ms`,
    );

  return {
    tenantId,
    currentTrust: t.trustLevel,
    recommendedTrust: blockers.length === 0 ? next : t.trustLevel,
    promotionEligible: blockers.length === 0,
    metrics: {
      daysSinceRegistration: days,
      pingSuccessRate,
      voteValidityRate,
      avgLatencyMs: t.avgLatencyMs,
      totalPings: t.totalPings,
      totalVotes: t.totalVotes,
    },
    blockers,
  };
}

export async function evaluateAllTenants(): Promise<SLAEvaluation[]> {
  const tenants = await tenantRepository.list();
  const results = await Promise.all(
    tenants.map((t) => evaluateTenant(t.tenantId)),
  );
  return results.filter((r): r is SLAEvaluation => r !== null);
}
