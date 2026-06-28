/**
 * Nexus Affil'IA'te · Judge Federation · Quorum Protocol
 *
 * Protocolo de votação por quorum N-de-M entre nós Judge federados.
 *
 * Modos de quorum suportados:
 *  - simple-majority (N/M > 0.5)
 *  - super-majority  (N/M >= 0.66)
 *  - unanimous       (N == M)
 *
 * Cada voto é assinado em ed25519 (ver keys.ts) e auditável.
 * A decisão final agrega votos, calcula score médio e classifica em
 * approved | review | blocked.
 *
 * @module agentic/judge-federation/quorum
 * @author Niko Nexus · CEO/AI
 */
import { z } from "zod";
import { verifyJudgeSignature } from "./keys";

// ─── Schemas ───────────────────────────────────────────────────────────────

export const judgeVoteSchema = z.object({
  nodeId: z.string().min(1),
  decision: z.enum(["approve", "review", "block"]),
  qualityScore: z.number().min(0).max(1),
  riskScore: z.number().min(0).max(1),
  rationale: z.string().max(560).optional(),
  signature: z.string().min(20),
  signedAt: z.string().datetime(),
});
export type JudgeVote = z.infer<typeof judgeVoteSchema>;

export const quorumPolicySchema = z.object({
  mode: z.enum(["simple-majority", "super-majority", "unanimous"]).default("super-majority"),
  minVoters: z.number().int().min(1).default(3),
  qualityThreshold: z.number().min(0).max(1).default(0.6),
  riskThreshold: z.number().min(0).max(1).default(0.4),
});
export type QuorumPolicy = z.infer<typeof quorumPolicySchema>;

export const quorumDecisionSchema = z.object({
  finalDecision: z.enum(["approved", "review", "blocked"]),
  consensus: z.number().min(0).max(1),
  avgQuality: z.number().min(0).max(1),
  avgRisk: z.number().min(0).max(1),
  votersCount: z.number().int().min(0),
  validVotes: z.number().int().min(0),
  rejectedVotes: z
    .array(
      z.object({
        nodeId: z.string(),
        reason: z.string(),
      }),
    )
    .default([]),
  rationale: z.string(),
  decidedAt: z.string().datetime(),
});
export type QuorumDecision = z.infer<typeof quorumDecisionSchema>;

export const quorumRequestSchema = z.object({
  payloadId: z.string().min(1),
  payloadDigest: z.string().min(16),
  policy: quorumPolicySchema.default({
    mode: "super-majority",
    minVoters: 3,
    qualityThreshold: 0.6,
    riskThreshold: 0.4,
  }),
  votes: z.array(judgeVoteSchema).min(1),
});
export type QuorumRequest = z.infer<typeof quorumRequestSchema>;

// ─── Núcleo ─────────────────────────────────────────────────────────────────

export interface KnownNode {
  nodeId: string;
  publicKeyPem: string;
  trustLevel: "sandbox" | "verified" | "elite";
  active: boolean;
}

/**
 * Verifica cada voto contra a chave pública do nó.
 * Retorna apenas os votos válidos.
 */
export function filterValidVotes(
  votes: JudgeVote[],
  knownNodes: KnownNode[],
  payloadDigest: string,
): { valid: JudgeVote[]; rejected: Array<{ nodeId: string; reason: string }> } {
  const valid: JudgeVote[] = [];
  const rejected: Array<{ nodeId: string; reason: string }> = [];

  const nodeMap = new Map(knownNodes.map((n) => [n.nodeId, n]));

  for (const vote of votes) {
    const node = nodeMap.get(vote.nodeId);
    if (!node) {
      rejected.push({ nodeId: vote.nodeId, reason: "unknown-node" });
      continue;
    }
    if (!node.active) {
      rejected.push({ nodeId: vote.nodeId, reason: "node-inactive" });
      continue;
    }
    // Mensagem canônica: scores fixados em 3 casas decimais para evitar drift de float
    const q = vote.qualityScore.toFixed(3);
    const r = vote.riskScore.toFixed(3);
    const message = `${payloadDigest}|${vote.decision}|${q}|${r}|${vote.signedAt}`;
    if (!verifyJudgeSignature(message, vote.signature, node.publicKeyPem)) {
      rejected.push({ nodeId: vote.nodeId, reason: "invalid-signature" });
      continue;
    }
    valid.push(vote);
  }

  return { valid, rejected };
}

/**
 * Aplica a política de quorum e retorna a decisão final.
 */
export function applyQuorum(
  request: QuorumRequest,
  validVotes: JudgeVote[],
): QuorumDecision {
  const total = validVotes.length;
  const policy = request.policy;

  if (total < policy.minVoters) {
    return quorumDecisionSchema.parse({
      finalDecision: "review",
      consensus: 0,
      avgQuality: 0,
      avgRisk: 0,
      votersCount: total,
      validVotes: total,
      rejectedVotes: [],
      rationale: `votos insuficientes: ${total} < minVoters=${policy.minVoters}`,
      decidedAt: new Date().toISOString(),
    });
  }

  let approveN = 0;
  let blockN = 0;
  let reviewN = 0;
  let sumQuality = 0;
  let sumRisk = 0;

  for (const v of validVotes) {
    sumQuality += v.qualityScore;
    sumRisk += v.riskScore;
    if (v.decision === "approve") approveN++;
    else if (v.decision === "block") blockN++;
    else reviewN++;
  }

  const avgQuality = sumQuality / total;
  const avgRisk = sumRisk / total;

  // Quorum por modo
  const ratio = approveN / total;
  const requiredRatio =
    policy.mode === "unanimous"
      ? 1
      : policy.mode === "super-majority"
        ? 0.66
        : 0.5 + 1e-9;

  let finalDecision: "approved" | "review" | "blocked" = "review";
  let rationale = "";

  if (blockN > approveN) {
    finalDecision = "blocked";
    rationale = `${blockN} votos de bloqueio vs ${approveN} aprovações`;
  } else if (
    ratio >= requiredRatio &&
    avgQuality >= policy.qualityThreshold &&
    avgRisk <= policy.riskThreshold
  ) {
    finalDecision = "approved";
    rationale = `consenso ${(ratio * 100).toFixed(0)}% (modo ${policy.mode}), qualidade média ${avgQuality.toFixed(2)} >= ${policy.qualityThreshold}, risco ${avgRisk.toFixed(2)} <= ${policy.riskThreshold}`;
  } else {
    finalDecision = "review";
    rationale = `consenso ${(ratio * 100).toFixed(0)}% insuficiente para modo ${policy.mode}, ou métricas fora dos thresholds (Q=${avgQuality.toFixed(2)}, R=${avgRisk.toFixed(2)})`;
  }

  return quorumDecisionSchema.parse({
    finalDecision,
    consensus: Number(ratio.toFixed(3)),
    avgQuality: Number(avgQuality.toFixed(3)),
    avgRisk: Number(avgRisk.toFixed(3)),
    votersCount: total,
    validVotes: total,
    rejectedVotes: [],
    rationale,
    decidedAt: new Date().toISOString(),
  });
}

/**
 * Pipeline completo: valida assinaturas + aplica quorum.
 */
export function evaluateQuorum(
  request: QuorumRequest,
  knownNodes: KnownNode[],
): QuorumDecision {
  const parsed = quorumRequestSchema.parse(request);
  const { valid, rejected } = filterValidVotes(
    parsed.votes,
    knownNodes,
    parsed.payloadDigest,
  );
  const decision = applyQuorum(parsed, valid);
  return quorumDecisionSchema.parse({
    ...decision,
    rejectedVotes: rejected,
    votersCount: parsed.votes.length,
    validVotes: valid.length,
  });
}
