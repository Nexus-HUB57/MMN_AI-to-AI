/**
 * Nexus Affil'IA'te · M4 · Governance Loop · Orchestrator
 *
 * Núcleo que costura CEO/AI → Skill Marketplace → Judge Federation → Audit.
 *
 * Fluxo:
 *   1. `proposeAction(action)` registra a ação e calcula digest.
 *   2. Coleta votos automáticos dos nós Judge ativos (modo simulado/real).
 *   3. Aplica quorum (`evaluateQuorum`).
 *   4. Persiste GovernanceRecord assinado (auditDigest sha256).
 *   5. Se approved → executa side-effect (publicar skill, promover agente, etc).
 *   6. Indexa decisão no RAG para aprendizado contínuo do Niko Nexus.
 *
 * @module agentic/governance-loop/orchestrator
 * @author Niko Nexus · CEO/AI
 */
import crypto from "node:crypto";
import {
  governedActionSchema,
  governanceDecisionSchema,
  governanceRecordSchema,
  type GovernedAction,
  type GovernanceRecord,
} from "./types";
import { governanceRepository, computeAuditDigest } from "./repository";
import { judgeRegistry } from "../judge-federation/registry";
import { signWithJudgeKey } from "../judge-federation/keys";
import { evaluateQuorum, type JudgeVote } from "../judge-federation/quorum";
import { getCalibratedHeuristic } from "./feedbackLearner";
import { collectRemoteVotes, remoteJudgeRegistry } from "../judge-federation/remoteJudgeClient";

// ─── Util ──────────────────────────────────────────────────────────────────

function digestPayload(payload: unknown): string {
  return crypto
    .createHash("sha256")
    .update(typeof payload === "string" ? payload : JSON.stringify(payload))
    .digest("hex");
}

function newActionId(): string {
  return `act_${crypto.randomBytes(8).toString("hex")}`;
}

// ─── Geração de votos automáticos (heurística MVP) ─────────────────────────
//
// Em produção esta camada chamará nós Judge reais via HTTP/A2A.
// No MVP, gera votos determinísticos baseados em heurísticas por kind
// e assina com a chave privada local de cada nó.
//

interface AutoVoteHeuristic {
  approveBias: number; // 0..1
  qualityBase: number;
  riskBase: number;
}

const HEURISTICS: Record<string, AutoVoteHeuristic> = {
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

function pickDecision(bias: number, jitter: number): JudgeVote["decision"] {
  const score = bias + jitter;
  if (score >= 0.7) return "approve";
  if (score <= 0.35) return "block";
  return "review";
}

async function collectAutoVotes(
  action: GovernedAction,
  payloadDigest: string,
): Promise<JudgeVote[]> {
  const nodes = await judgeRegistry.list();
  const activeNodes = nodes.filter((n) => n.active);
  // M5: heurística calibrada dinamicamente pelo aprendizado do Niko Nexus
  const calibrated = await getCalibratedHeuristic(action.kind);
  const heur = {
    approveBias: calibrated.approveBias,
    qualityBase: calibrated.qualityBase,
    riskBase: calibrated.riskBase,
  };

  const votes: JudgeVote[] = [];
  for (const node of activeNodes) {
    // jitter determinístico por (actionId, nodeId)
    const seed = crypto
      .createHash("sha256")
      .update(`${action.actionId}:${node.nodeId}`)
      .digest();
    const jitterRaw = seed.readUInt16BE(0) / 0xffff; // 0..1
    const signedJitter = (jitterRaw - 0.5) * 0.3;    // -0.15..+0.15
    const decision = pickDecision(heur.approveBias, signedJitter);

    // Quality/Risk com pequena variação por nó
    const qVar = (seed.readUInt8(2) - 128) / 1280; // ±0.1
    const rVar = (seed.readUInt8(3) - 128) / 1280;
    const qualityScore = Math.min(
      1,
      Math.max(0, heur.qualityBase + qVar),
    );
    const riskScore = Math.min(
      1,
      Math.max(0, heur.riskBase + rVar),
    );

    const signedAt = new Date().toISOString();
    const q = qualityScore.toFixed(3);
    const r = riskScore.toFixed(3);
    const message = `${payloadDigest}|${decision}|${q}|${r}|${signedAt}`;
    const privateKeyPem = await judgeRegistry.getPrivateKey(node.nodeId);
    if (!privateKeyPem) continue;
    const signature = signWithJudgeKey(message, privateKeyPem);
    if (!signature) continue;

    votes.push({
      nodeId: node.nodeId,
      decision,
      qualityScore: Number(q),
      riskScore: Number(r),
      rationale:
        decision === "approve"
          ? `${node.nodeId}: ação ${action.kind} dentro dos limites de qualidade/risco`
          : decision === "block"
            ? `${node.nodeId}: risco acima do limiar para ${action.kind}`
            : `${node.nodeId}: revisão humana sugerida para ${action.kind}`,
      signature,
      signedAt,
    });
  }
  return votes;
}

// ─── API pública do Governance Loop ────────────────────────────────────────

export interface ProposeActionInput {
  kind: GovernedAction["kind"];
  initiator: string;
  subject: string;
  payload?: Record<string, unknown>;
  rationale: string;
  policyMode?: GovernedAction["policyMode"];
  minVoters?: number;
}

export interface GovernanceResult {
  record: GovernanceRecord;
  trace: {
    payloadDigest: string;
    votesCollected: number;
    nodesAvailable: number;
  };
}

export const GovernanceLoop = {
  async propose(input: ProposeActionInput): Promise<GovernanceResult> {
    const action: GovernedAction = governedActionSchema.parse({
      actionId: newActionId(),
      kind: input.kind,
      initiator: input.initiator,
      subject: input.subject,
      payload: input.payload ?? {},
      rationale: input.rationale,
      createdAt: new Date().toISOString(),
      policyMode: input.policyMode ?? "super-majority",
      minVoters: input.minVoters ?? 3,
    });

    const payloadDigest = digestPayload({
      actionId: action.actionId,
      kind: action.kind,
      subject: action.subject,
      payload: action.payload,
    });

    // M7: votos remotos via A2A (paralelo aos locais)
    const localVotes = await collectAutoVotes(action, payloadDigest);
    const remoteResult = await collectRemoteVotes({
      payloadId: action.actionId,
      payloadDigest,
      kind: action.kind,
      rationale: action.rationale,
    });
    const votes = [...localVotes, ...remoteResult.votes];

    const knownLocalNodes = await judgeRegistry.list();
    const remoteNodes = await remoteJudgeRegistry.listFull();
    const knownNodes = [
      ...knownLocalNodes,
      ...remoteNodes
        .filter((n) => n.active)
        .map((n) => ({
          nodeId: n.nodeId,
          publicKeyPem: n.publicKeyPem,
          trustLevel: n.trustLevel,
          active: n.active,
        })),
    ];

    const quorumOutcome = evaluateQuorum(
      {
        payloadId: action.actionId,
        payloadDigest,
        policy: {
          mode: action.policyMode,
          minVoters: action.minVoters,
          qualityThreshold: 0.6,
          riskThreshold: 0.4,
        },
        votes,
      },
      knownNodes,
    );

    const decisionBase = {
      actionId: action.actionId,
      finalDecision: quorumOutcome.finalDecision,
      consensus: quorumOutcome.consensus,
      avgQuality: quorumOutcome.avgQuality,
      avgRisk: quorumOutcome.avgRisk,
      votersCount: quorumOutcome.votersCount,
      validVotes: quorumOutcome.validVotes,
      rejectedVotes: quorumOutcome.rejectedVotes,
      rationale: quorumOutcome.rationale,
      decidedAt: quorumOutcome.decidedAt,
    };

    const auditDigest = computeAuditDigest(action, decisionBase);
    const decision = governanceDecisionSchema.parse({
      ...decisionBase,
      auditDigest,
    });

    const record: GovernanceRecord = governanceRecordSchema.parse({
      action,
      decision,
      executionStatus: "pending",
    });
    await governanceRepository.append(record);

    return {
      record,
      trace: {
        payloadDigest,
        votesCollected: votes.length,
        nodesAvailable: knownNodes.filter((n) => n.active).length,
        localVotes: localVotes.length,
        remoteVotes: remoteResult.votes.length,
        remoteAttempts: remoteResult.remoteAttempts,
        remoteErrors: remoteResult.remoteErrors,
      },
    };
  },

  async markExecuted(actionId: string, log?: string) {
    return governanceRepository.updateExecution(actionId, "executed", log);
  },

  async markRolledBack(actionId: string, log?: string) {
    return governanceRepository.updateExecution(actionId, "rolled-back", log);
  },

  async list(opts?: {
    limit?: number;
    kind?: string;
    decision?: "approved" | "review" | "blocked";
  }) {
    return governanceRepository.list(opts);
  },

  async stats() {
    return governanceRepository.stats();
  },

  async getByActionId(actionId: string) {
    return governanceRepository.getByActionId(actionId);
  },
};
