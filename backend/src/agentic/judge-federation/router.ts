/**
 * Nexus Affil'IA'te · Judge Federation · tRPC Router
 *
 * @module agentic/judge-federation/router
 * @author Niko Nexus · CEO/AI
 */
import crypto from "node:crypto";
import { z } from "zod";
import { adminProcedure, publicProcedure, router } from "../../config/trpc";
import { signWithJudgeKey } from "./keys";
import { judgeRegistry } from "./registry";
import { remoteJudgeRegistry } from "./remoteJudgeClient";
import {
  evaluateQuorum,
  judgeVoteSchema,
  quorumPolicySchema,
} from "./quorum";

function digest(payload: unknown): string {
  return crypto
    .createHash("sha256")
    .update(typeof payload === "string" ? payload : JSON.stringify(payload))
    .digest("hex");
}

export const judgeFederationRouter = router({
  /** M7 · Lista de nós remotos (sem apiKey) */
  remoteList: publicProcedure.query(async () => {
    const nodes = await remoteJudgeRegistry.list();
    return {
      ok: true,
      total: nodes.length,
      active: nodes.filter((n) => n.active).length,
      nodes,
    };
  }),

  /** M7 · Registrar novo nó remoto (admin) */
  remoteRegister: adminProcedure
    .input(
      z.object({
        nodeId: z.string().min(3),
        name: z.string().min(1),
        operator: z.string().min(1),
        endpoint: z.string().url(),
        publicKeyPem: z.string().min(40),
        trustLevel: z.enum(["sandbox", "verified", "elite"]).default("sandbox"),
        active: z.boolean().default(true),
        apiKey: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const node = await remoteJudgeRegistry.register(input);
      return { ok: true, node };
    }),

  /** M7 · Ativar/desativar nó remoto (admin) */
  remoteSetActive: adminProcedure
    .input(z.object({ nodeId: z.string(), active: z.boolean() }))
    .mutation(async ({ input }) => {
      const node = await remoteJudgeRegistry.setActive(input.nodeId, input.active);
      return { ok: true, node };
    }),

  /** M7 · Remover nó remoto (admin) */
  remoteRemove: adminProcedure
    .input(z.object({ nodeId: z.string() }))
    .mutation(async ({ input }) => {
      const removed = await remoteJudgeRegistry.remove(input.nodeId);
      return { ok: removed };
    }),

  /** M7 · Test ping a nó remoto (admin) */
  remotePing: adminProcedure
    .input(z.object({ nodeId: z.string() }))
    .mutation(async ({ input }) => {
      const result = await remoteJudgeRegistry.testPing(input.nodeId);
      return { ok: result.ok, ...result };
    }),

  /** Saúde + status da federação */
  status: publicProcedure.query(async () => {
    const nodes = await judgeRegistry.listFull();
    const remoteNodes = await remoteJudgeRegistry.list();
    return {
      ok: true,
      remote: {
        total: remoteNodes.length,
        active: remoteNodes.filter((n) => n.active).length,
      },
      service: "judge-federation",
      timestamp: new Date().toISOString(),
      nodeCount: nodes.length,
      activeNodes: nodes.filter((n) => n.active).length,
      trustLevels: {
        elite: nodes.filter((n) => n.trustLevel === "elite").length,
        verified: nodes.filter((n) => n.trustLevel === "verified").length,
        sandbox: nodes.filter((n) => n.trustLevel === "sandbox").length,
      },
    };
  }),

  /** Lista de nós conhecidos (chave pública anonimizada) */
  listNodes: publicProcedure.query(async () => {
    const nodes = await judgeRegistry.listFull();
    return { ok: true, count: nodes.length, nodes };
  }),

  /** Solicita uma decisão de quorum. Coleta votos locais dos 3 nós seed. */
  evaluate: publicProcedure
    .input(
      z.object({
        payloadId: z.string().min(1),
        payload: z.unknown(),
        qualityHint: z.number().min(0).max(1).optional(),
        riskHint: z.number().min(0).max(1).optional(),
        policy: quorumPolicySchema.optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const payloadDigest = digest(input.payload);
      const nodes = await judgeRegistry.list();

      // MVP: cada nó local "avalia" e assina o voto.
      // Em produção (M8), votos vêm via HTTP de nós federados externos.
      const baseQuality = input.qualityHint ?? 0.75;
      const baseRisk = input.riskHint ?? 0.2;

      const votes = [];
      for (const node of nodes) {
        const full = await judgeRegistry.getByNodeId(node.nodeId);
        if (!full?.privateKeyPem) continue;

        // Pequena variância por nó para simular independência
        const qRaw = clamp(
          baseQuality + (Math.random() - 0.5) * 0.1,
          0,
          1,
        );
        const rRaw = clamp(baseRisk + (Math.random() - 0.5) * 0.08, 0, 1);
        const q = Number(qRaw.toFixed(3));
        const r = Number(rRaw.toFixed(3));
        const decision =
          q >= 0.65 && r <= 0.35 ? "approve" : r > 0.7 ? "block" : "review";
        const signedAt = new Date().toISOString();
        const message = `${payloadDigest}|${decision}|${q.toFixed(3)}|${r.toFixed(3)}|${signedAt}`;
        const signature = signWithJudgeKey(message, full.privateKeyPem);

        votes.push({
          nodeId: node.nodeId,
          decision,
          qualityScore: q,
          riskScore: r,
          rationale: `Auto-avaliação MVP do nó ${node.nodeId}`,
          signature,
          signedAt,
        });
      }

      // nodes para verificação: precisa do publicKeyPem completo
      const knownNodes = [] as Array<{ nodeId: string; publicKeyPem: string; trustLevel: 'sandbox' | 'verified' | 'elite'; active: boolean }>;
      for (const n of nodes) {
        const full = await judgeRegistry.getByNodeId(n.nodeId);
        if (full) {
          knownNodes.push({
            nodeId: n.nodeId,
            publicKeyPem: full.publicKeyPem,
            trustLevel: full.trustLevel,
            active: full.active,
          });
        }
      }

      const decision = evaluateQuorum(
        {
          payloadId: input.payloadId,
          payloadDigest,
          policy:
            input.policy ?? {
              mode: "super-majority",
              minVoters: 3,
              qualityThreshold: 0.6,
              riskThreshold: 0.4,
            },
          votes: votes.map((v) => judgeVoteSchema.parse(v)),
        },
        knownNodes,
      );

      return {
        ok: true,
        payloadId: input.payloadId,
        payloadDigest,
        votes,
        decision,
      };
    }),

  /** Admin: ativar/desativar nó */
  setNodeActive: adminProcedure
    .input(z.object({ nodeId: z.string(), active: z.boolean() }))
    .mutation(async ({ input }) => {
      const node = await judgeRegistry.setActive(input.nodeId, input.active);
      return { ok: true, node: { nodeId: node.nodeId, active: node.active } };
    }),
});

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}
