/**
 * Nexus Affil'IA'te · Sistema Orquestrador
 *
 * Endpoint unificado que agrega o estado vivo de:
 *   - C-Suite AI (Niko, Ravi, Helena, Otto)
 *   - Federacao Judge (local + remoto)
 *   - Governance Loop (acoes recentes, decisoes, audit)
 *   - Multi-Tenant (whitelabel)
 *   - Skill Marketplace e Skills Runtime
 *   - RAG learning + heuristicas
 *
 * Permite ao Sócio Humano observar todos os agentes em acao em tempo real.
 *
 * @module routers/orchestratorAdminRouter
 * @author Niko Nexus · CEO/AI
 */
import { z } from "zod";
import { adminProcedure, router } from "../config/trpc";
import { cSuiteRepository } from "../agentic/c-suite-bridge/repository";
import { remoteJudgeRegistry } from "../agentic/judge-federation/remoteJudgeClient";
import { GovernanceLoop } from "../agentic/governance-loop/orchestrator";

export const orchestratorAdminRouter = router({
  /**
   * Snapshot completo do ecossistema: C-Suite + Federacao + Governance + tendencias.
   * Usado pelo painel /admin/orchestrator para visualizacao em tempo real.
   */
  snapshot: adminProcedure.query(async () => {
    // C-Suite agentes ativos
    const cSuite = await cSuiteRepository.list();
    const cSuiteSummary = {
      total: cSuite.length,
      active: cSuite.filter((a) => a.active).length,
      byRole: cSuite.reduce<Record<string, number>>((acc, a) => {
        acc[a.role] = (acc[a.role] ?? 0) + 1;
        return acc;
      }, {}),
      members: cSuite.map((a) => ({
        agentId: a.agentId,
        name: a.name,
        role: a.role,
        workspace: a.workspace,
        active: a.active,
        trustLevel: a.trustLevel,
        joinedAt: a.joinedAt,
        judgeNodeId: a.judgeNodeId,
        reportsTo: a.reportsTo,
        permittedKindsCount: a.permittedKinds?.length ?? 0,
      })),
    };

    // Federacao Judge
    const remoteJudges = await remoteJudgeRegistry.list();
    const federation = {
      remoteTotal: remoteJudges.length,
      remoteActive: remoteJudges.filter((j) => j.active).length,
      byTrust: remoteJudges.reduce<Record<string, number>>((acc, j) => {
        acc[j.trustLevel] = (acc[j.trustLevel] ?? 0) + 1;
        return acc;
      }, {}),
      nodes: remoteJudges.map((j) => ({
        nodeId: j.nodeId,
        name: j.name,
        operator: j.operator,
        trustLevel: j.trustLevel,
        active: j.active,
        endpoint: j.endpoint,
      })),
    };

    // Governance Loop: stats + ultimas 10 acoes
    const stats = await GovernanceLoop.stats();
    const recentActions = await GovernanceLoop.list({ limit: 10 });
    const governance = {
      stats,
      recent: recentActions.map((r) => ({
        actionId: r.action.actionId,
        kind: r.action.kind,
        subject: r.action.subject,
        initiator: r.action.initiator,
        decision: r.decision.finalDecision,
        consensus: r.decision.consensus,
        avgQuality: r.decision.avgQuality,
        avgRisk: r.decision.avgRisk,
        votersCount: r.decision.votersCount,
        executionStatus: r.executionStatus,
        createdAt: r.action.createdAt,
        executedAt: r.executedAt,
        auditDigest: r.decision.auditDigest?.slice(0, 16),
      })),
    };

    return {
      ok: true,
      generatedAt: new Date().toISOString(),
      cSuite: cSuiteSummary,
      federation,
      governance,
    };
  }),

  /**
   * Stream de acoes recentes (paginado).
   * Permite observar o loop de governanca em tempo real.
   */
  activityStream: adminProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(100).default(30),
        kind: z.string().optional(),
      }).optional(),
    )
    .query(async ({ input }) => {
      const limit = input?.limit ?? 30;
      const records = await GovernanceLoop.list({
        limit,
        kind: input?.kind as any,
      });
      return {
        ok: true,
        count: records.length,
        items: records.map((r) => ({
          actionId: r.action.actionId,
          kind: r.action.kind,
          subject: r.action.subject,
          initiator: r.action.initiator,
          rationale: r.action.rationale,
          decision: r.decision.finalDecision,
          consensus: r.decision.consensus,
          executionStatus: r.executionStatus,
          createdAt: r.action.createdAt,
          executedAt: r.executedAt,
        })),
      };
    }),
});

export type OrchestratorAdminRouter = typeof orchestratorAdminRouter;
