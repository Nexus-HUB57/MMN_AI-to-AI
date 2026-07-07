/**
 * Nexus Affil'IA'te · M4 · Governance Loop · Types
 *
 * Loop fechado de governança autônoma:
 *
 *   CEO/AI (orchestrator)
 *      │
 *      ├─► detecta sinal / publica skill / propõe ação
 *      │
 *      ├─► Skill Marketplace (registro auditável)
 *      │
 *      ├─► Judge Federation (quorum N-de-M)
 *      │
 *      └─► Decisão final (approved | review | blocked)
 *              │
 *              └─► RAG (memória persistente / aprendizado)
 *
 * Cada decisão é assinada, datada e indexada para auditoria
 * e re-treino contínuo do CEO/AI Niko Nexus.
 *
 * @module agentic/governance-loop/types
 * @author Niko Nexus · CEO/AI
 */
import { z } from "zod";

// ─── Ações governadas pelo loop ────────────────────────────────────────────

export const governedActionKindSchema = z.enum([
  "skill.publish",     // publicar nova skill no Marketplace
  "skill.update",      // alterar preço / metadados de skill existente
  "skill.deprecate",   // remover/depreciar skill
  "agent.promote",     // promover agente (sandbox → verified → elite)
  "agent.suspend",     // suspender agente por má-conduta
  "policy.change",     // alteração de política do CEO/AI
  "payout.release",    // liberar pagamento ao publisher
  "campaign.launch",   // disparar campanha massiva
  "knowledge.ingest",  // ingerir novo documento no RAG
]);
export type GovernedActionKind = z.infer<typeof governedActionKindSchema>;

export const governedActionSchema = z.object({
  actionId: z.string().min(1),
  kind: governedActionKindSchema,
  initiator: z.string().min(1),       // ex: "ceo-ai:niko-nexus" ou userId
  subject: z.string().min(1),         // ex: skill slug, agentId, payoutId
  payload: z.record(z.any()).default({}),
  rationale: z.string().min(10),      // por que a ação foi proposta
  createdAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
  policyMode: z
    .enum(["simple-majority", "super-majority", "unanimous"])
    .default("super-majority"),
  minVoters: z.number().int().min(1).default(3),
});
export type GovernedAction = z.infer<typeof governedActionSchema>;

export const governanceDecisionSchema = z.object({
  actionId: z.string(),
  finalDecision: z.enum(["approved", "review", "blocked"]),
  consensus: z.number().min(0).max(1),
  avgQuality: z.number().min(0).max(1),
  avgRisk: z.number().min(0).max(1),
  votersCount: z.number().int().min(0),
  validVotes: z.number().int().min(0),
  rejectedVotes: z.array(
    z.object({ nodeId: z.string(), reason: z.string() }),
  ),
  rationale: z.string(),
  decidedAt: z.string().datetime(),
  // Hash do registro inteiro, para auditoria imutável
  auditDigest: z.string().min(16),
});
export type GovernanceDecision = z.infer<typeof governanceDecisionSchema>;

export const governanceRecordSchema = z.object({
  action: governedActionSchema,
  decision: governanceDecisionSchema,
  executedAt: z.string().datetime().optional(),
  executionStatus: z
    .enum(["pending", "executed", "rolled-back", "skipped"])
    .default("pending"),
  executionLog: z.string().optional(),
});
export type GovernanceRecord = z.infer<typeof governanceRecordSchema>;
