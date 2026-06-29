/**
 * Nexus Affil'IA'te · M9 · C-Suite Bridge · tRPC Router
 *
 * Endpoints públicos para descoberta do C-Suite + endpoint de voto que
 * Niko consulta via remoteJudge quando coleta votos remotos.
 *
 * @module agentic/c-suite-bridge/router
 * @author Niko Nexus · CEO/AI
 */
import crypto from "node:crypto";
import { z } from "zod";
import { adminProcedure, publicProcedure, router } from "../../config/trpc";
import { cSuiteRepository } from "./repository";
import { bootstrapCSuite } from "./bootstrap";
import { signWithJudgeKey } from "../judge-federation/keys";
import { getCalibratedHeuristic } from "../governance-loop/feedbackLearner";
import type { GovernedActionKind } from "../governance-loop/types";
import { GovernanceLoop } from "../governance-loop/orchestrator";
import {
  deliverableSchema,
  createDeliverableTicket,
  type DeliverableTicket,
} from "./deliverableHandler";

// Storage in-memory dos tickets (MVP). Migrar para JSON file na próxima iteração.
const deliverableTickets: DeliverableTicket[] = [];

/**
 * Geração de voto C-Suite — usa heurísticas calibradas (M5) por kind
 * + viés posicional (CTO mais técnico, CMO mais agressivo em campanhas, CEO equilibrado).
 */
async function generateCSuiteVote(opts: {
  agentId: string;
  privateKeyPem: string;
  payloadDigest: string;
  kind: string;
  rationale: string;
}) {
  const calibrated = await getCalibratedHeuristic(opts.kind as GovernedActionKind);

  // Bias posicional por papel (cada C-Level "olha" diferente para cada tipo de ação)
  let approveBias = calibrated.approveBias;
  let qualityBase = calibrated.qualityBase;
  let riskBase = calibrated.riskBase;

  if (opts.agentId.startsWith("cto-ai:")) {
    // CTO mais rigoroso em policy.change e agent.promote
    if (opts.kind === "policy.change" || opts.kind === "agent.promote") {
      approveBias *= 0.92;
      riskBase = Math.min(1, riskBase + 0.05);
    }
    // CTO mais permissivo em skill.* e knowledge.ingest
    if (opts.kind.startsWith("skill.") || opts.kind === "knowledge.ingest") {
      approveBias = Math.min(1, approveBias * 1.05);
    }
  } else if (opts.agentId.startsWith("cmo-ai:")) {
    // CMO mais permissivo em campaign.launch
    if (opts.kind === "campaign.launch") {
      approveBias = Math.min(1, approveBias * 1.08);
    }
    // CMO mais rigoroso em agent.suspend (pode afetar marca)
    if (opts.kind === "agent.suspend") {
      approveBias *= 0.9;
    }
  }
  // CEO equilibrado, mantém os valores calibrados

  // Jitter determinístico por (agentId, payloadDigest)
  const seed = crypto
    .createHash("sha256")
    .update(`${opts.agentId}:${opts.payloadDigest}`)
    .digest();
  const jitterRaw = seed.readUInt16BE(0) / 0xffff;
  const signedJitter = (jitterRaw - 0.5) * 0.2; // ±0.1
  const score = approveBias + signedJitter;

  let decision: "approve" | "review" | "block";
  if (score >= 0.7) decision = "approve";
  else if (score <= 0.35) decision = "block";
  else decision = "review";

  const qVar = (seed.readUInt8(2) - 128) / 1280;
  const rVar = (seed.readUInt8(3) - 128) / 1280;
  const qualityScore = Math.max(0, Math.min(1, qualityBase + qVar));
  const riskScore = Math.max(0, Math.min(1, riskBase + rVar));

  const signedAt = new Date().toISOString();
  const q = qualityScore.toFixed(3);
  const r = riskScore.toFixed(3);
  const message = `${opts.payloadDigest}|${decision}|${q}|${r}|${signedAt}`;
  const signature = signWithJudgeKey(message, opts.privateKeyPem);

  // Rationale contextual
  const rationale =
    decision === "approve"
      ? `${opts.agentId}: aprovo dentro do mandato (heuristica calibrada source=${calibrated.source})`
      : decision === "block"
        ? `${opts.agentId}: risco alto para ${opts.kind} sob meu mandato`
        : `${opts.agentId}: sugiro revisao humana antes de prosseguir com ${opts.kind}`;

  return {
    decision,
    qualityScore: Number(q),
    riskScore: Number(r),
    rationale,
    signature,
    signedAt,
  };
}

export const cSuiteRouter = router({
  /** Status do C-Suite */
  status: publicProcedure.query(async () => {
    const stats = await cSuiteRepository.stats();
    return {
      ok: true,
      service: "c-suite-bridge",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      stats,
    };
  }),

  /** Lista pública do C-Suite (sem privateKey) */
  list: publicProcedure.query(async () => {
    const agents = await cSuiteRepository.list();
    return { ok: true, total: agents.length, agents };
  }),

  /** Detalhe por agentId */
  get: publicProcedure
    .input(z.object({ agentId: z.string().min(1) }))
    .query(async ({ input }) => {
      const agent = await cSuiteRepository.getById(input.agentId);
      return { ok: agent !== null, agent };
    }),

  /** Bootstrap idempotente (admin) — útil para forçar reconciliação */
  bootstrap: adminProcedure
    .input(
      z.object({
        baseUrl: z.string().url().optional(),
      }).default({}),
    )
    .mutation(async ({ input }) => {
      const result = await bootstrapCSuite({ baseUrl: input.baseUrl });
      return { ok: true, ...result };
    }),

  /**
   * M9.5 · Submeter um pacote pronto para deploy.
   * Ravi/Helena chamam isso para entregar trabalho. O pacote NAO é executado
   * automaticamente — fica em "pending-deploy" até Niko/humano processar.
   * Registra audit digest sha256 do contrato.
   */
  submitDeliverable: publicProcedure
    .input(deliverableSchema)
    .mutation(async ({ input }) => {
      const ticket = createDeliverableTicket(input);
      deliverableTickets.push(ticket);

      // Propoe automaticamente no Governance Loop
      const proposal = await GovernanceLoop.propose({
        kind: input.governanceKind,
        initiator: input.agentId,
        subject: `delivery-${input.feature}`,
        payload: {
          ticketId: ticket.ticketId,
          packageUrl: input.packageUrl,
          packageDigest: ticket.packageDigest,
          branch: input.branch,
          targetPaths: input.targetPaths,
          readmeUrl: input.readmeUrl,
          buildSteps: input.buildSteps,
          smokeTestCommands: input.smokeTestCommands,
        },
        rationale: input.rationale,
      });
      ticket.governanceActionId = proposal.record.action.actionId;

      return {
        ok: true,
        ticket,
        governance: {
          actionId: proposal.record.action.actionId,
          decision: proposal.record.decision.finalDecision,
          consensus: proposal.record.decision.consensus,
          auditDigest: proposal.record.decision.auditDigest,
        },
        message: `Pacote registrado. Aguarde Niko processar. Use ticketId=${ticket.ticketId} para acompanhar.`,
      };
    }),

  /** M9.5 · Listar deliverables pendentes (admin vê fila de deploy) */
  listDeliverables: publicProcedure
    .input(
      z
        .object({
          agentId: z.string().optional(),
          status: z
            .enum(["pending-deploy", "deployed", "rolled-back", "rejected"])
            .optional(),
          limit: z.number().int().min(1).max(100).default(50),
        })
        .default({ limit: 50 }),
    )
    .query(async ({ input }) => {
      let tickets = [...deliverableTickets].reverse();
      if (input.agentId) tickets = tickets.filter((t) => t.agentId === input.agentId);
      if (input.status) tickets = tickets.filter((t) => t.status === input.status);
      tickets = tickets.slice(0, input.limit);
      return { ok: true, total: tickets.length, tickets };
    }),

  /** M9.5 · Atualizar status do deliverable (admin marca deployed/rolled-back) */
  updateDeliverable: adminProcedure
    .input(
      z.object({
        ticketId: z.string(),
        status: z.enum(["deployed", "rolled-back", "rejected"]),
        log: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const ticket = deliverableTickets.find((t) => t.ticketId === input.ticketId);
      if (!ticket) return { ok: false, error: "ticket-not-found" };
      ticket.status = input.status;
      return { ok: true, ticket };
    }),

  /**
   * Endpoint A2A-compatible que o Niko chama quando coleta votos remotos.
   * Recebe payload e retorna voto assinado pelo agente C-level correspondente
   * ao nodeId (judge-cto-ai-ravi → cto-ai:ravi).
   *
   * Aceita ambos os formatos: A2A protocol body (skill: "judge.vote")
   * ou body direto com nodeId/payloadDigest/kind/rationale.
   */
  judgeVote: publicProcedure
    .input(
      z.object({
        // Resolução por nodeId OU agentId direto
        nodeId: z.string().optional(),
        agentId: z.string().optional(),
        // Payload da decisão
        payloadId: z.string().min(1),
        payloadDigest: z.string().min(16),
        kind: z.string().min(1),
        rationale: z.string().max(2048).default(""),
      }),
    )
    .mutation(async ({ input }) => {
      // Resolver agentId a partir de nodeId ou input direto
      let agentId = input.agentId;
      if (!agentId && input.nodeId) {
        // Convenção: judge-ceo-ai-niko-nexus → ceo-ai:niko-nexus
        const stripped = input.nodeId.replace(/^judge-/, "");
        const restored = stripped.replace(/-ai-/, "-ai:");
        agentId = restored;
      }
      if (!agentId) {
        return { ok: false, error: "agentId-or-nodeId-required" };
      }
      const agent = await cSuiteRepository.getById(agentId);
      if (!agent || !agent.active) {
        return { ok: false, error: "agent-not-found-or-inactive" };
      }
      const privateKey = await cSuiteRepository.getPrivateKey(agentId);
      if (!privateKey) {
        return { ok: false, error: "private-key-not-available" };
      }
      const vote = await generateCSuiteVote({
        agentId,
        privateKeyPem: privateKey,
        payloadDigest: input.payloadDigest,
        kind: input.kind,
        rationale: input.rationale,
      });
      return { ok: true, ...vote };
    }),
});
