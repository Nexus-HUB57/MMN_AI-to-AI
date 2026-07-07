/**
 * Onda 1 Router · Nexus Affil'IA'te
 * Expõe Otto CFO, Autonomy Score, Auto-Heal e Milestone público dos 1000 afiliados.
 *
 * Endpoints públicos (read-only): autonomyScore.current, milestones.publicProgress
 * Endpoints administrativos: cfo.*, autoHeal.*, autonomyScore.persist, milestones.update
 */
import { z } from "zod";
import { Pool } from "pg";
import { router, publicProcedure, adminProcedure } from "../config/trpc";
import { OttoService } from "../agentic/cfo/otto-service";
import { SlaService } from "../agentic/coo/sla-service";
import { AutonomyScorer } from "../agentic/autonomy-score/scorer";
import { AutoHealOrchestrator, type FaultClass } from "../agentic/auto-heal/orchestrator";
import { NikoSandbox } from "../agentic/niko-sandbox/service";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const faultClassSchema = z.enum([
  "queue.stalled","endpoint.degraded","cache.inconsistent",
  "build.broken","judge.offline","commission.divergence",
  "payout.stuck","fraud.suspect",
]);

export const onda1Router = router({
  // ----- CFO/AI Otto -----
  cfoSnapshot: adminProcedure.query(async () => {
    return await OttoService.getFinancialSnapshot();
  }),
  cfoUnitEconomics: adminProcedure.query(async () => {
    return await OttoService.getUnitEconomics();
  }),
  cfoProjection: adminProcedure
    .input(z.object({ horizonDays: z.number().int().min(7).max(365).default(90) }).optional())
    .query(async ({ input }) => {
      return await OttoService.getCashflowProjection(input?.horizonDays ?? 90);
    }),
  cfoPersistDaily: adminProcedure.mutation(async () => {
    await OttoService.persistDailySnapshot();
    return { ok: true, persistedAt: new Date().toISOString() };
  }),

  // ----- Autonomy Score -----
  autonomyScoreCurrent: publicProcedure.query(async () => {
    return await AutonomyScorer.compute();
  }),
  autonomyScoreHistory: publicProcedure
    .input(z.object({ limit: z.number().int().min(1).max(180).default(30) }).optional())
    .query(async ({ input }) => {
      return await AutonomyScorer.history(input?.limit ?? 30);
    }),
  autonomyScorePersist: adminProcedure.mutation(async () => {
    const s = await AutonomyScorer.compute();
    await AutonomyScorer.persist(s);
    return { ok: true, score: s };
  }),

  // ----- Auto-Heal -----
  autoHealSummary: adminProcedure.query(async () => {
    return await AutoHealOrchestrator.summary();
  }),
  autoHealRecent: adminProcedure
    .input(z.object({ limit: z.number().int().min(1).max(200).default(50) }).optional())
    .query(async ({ input }) => {
      return await AutoHealOrchestrator.listRecent(input?.limit ?? 50);
    }),
  autoHealTrigger: adminProcedure
    .input(z.object({
      faultClass: faultClassSchema,
      signal: z.record(z.unknown()).default({}),
    }))
    .mutation(async ({ input }) => {
      return await AutoHealOrchestrator.tryHeal(input.faultClass as FaultClass, input.signal);
    }),

  // ----- Public Milestones (contador home) -----
  milestonePublicProgress: publicProcedure.query(async () => {
    const q = await pool.query(`
      SELECT m.milestone_key, m.target_value, m.display_label, m.reached, m.reached_at,
             (SELECT count(*) FROM affiliates WHERE status IN ('active','approved'))::BIGINT AS current_value
      FROM platform_milestones m
      WHERE m.milestone_key='founders-1000-affiliates' AND m.public_visible=true
    `);
    const row = q.rows[0] ?? null;
    if (!row) return { ok: false, milestone: null };
    const current = Number(row.current_value);
    const target = Number(row.target_value);
    const pct = Math.min(100, Math.floor((current / target) * 100));
    return {
      ok: true,
      milestone: {
        key: row.milestone_key,
        current,
        target,
        pct,
        label: row.display_label,
        reached: row.reached,
        reachedAt: row.reached_at,
      },
    };
  }),
  // ----- Onda 2: Niko Sandbox -----
  nikoSandboxStatus: publicProcedure.query(async () => await NikoSandbox.status()),
  nikoSandboxRecall: adminProcedure
    .input(z.object({ limit: z.number().int().min(1).max(200).default(20) }).optional())
    .query(async ({ input }) => await NikoSandbox.recall(input?.limit ?? 20)),
  nikoSandboxRemember: adminProcedure
    .input(z.object({
      episode_type: z.string(), subject: z.string(),
      decision: z.string().optional(), rationale: z.string(),
      outcome: z.string().optional(), learnings: z.string().optional(),
      linked_metrics: z.record(z.unknown()).optional(),
      wave_id: z.string().optional(),
      autonomy_level: z.enum(['propose_only','execute_low','execute_medium','locked_from_execution']).optional(),
    }))
    .mutation(async ({ input }) => await NikoSandbox.remember(input)),

  // ----- COO/AI Otavio · SLA Dashboard (Onda 7 M2) -----
  slaSnapshot: publicProcedure.query(async () => {
    return await SlaService.getSnapshot();
  }),

});

export type Onda1Router = typeof onda1Router;
