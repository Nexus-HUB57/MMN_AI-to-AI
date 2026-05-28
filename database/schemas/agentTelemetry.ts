import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * Telemetria persistida de execuções de skills do agente.
 * -----------------------------------------------------------------------------
 * Tabela complementar ao ring buffer in-memory (`runtimeTelemetry.ts`).
 * Quando o Postgres do Render estiver provisionado, cada execução é replicada
 * aqui em best-effort para sobreviver a restarts e permitir consultas
 * históricas (Autonomy Score retroativo, análise de regressão, etc.).
 */
export const agentTelemetry = pgTable(
  "agent_telemetry",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    skill: varchar("skill", { length: 80 }).notNull(),
    decision: varchar("decision", { length: 20 }).notNull(),
    success: boolean("success").notNull(),
    latencyMs: integer("latencyMs").notNull(),
    channel: varchar("channel", { length: 40 }),
    warningsCount: integer("warningsCount").notNull().default(0),
    /** Score do judge associado (quando aplicável) */
    judgeScore: integer("judgeScore"),
    /** Veredito do judge: pass | revise | fail | null */
    judgeVerdict: varchar("judgeVerdict", { length: 12 }),
    metadata: jsonb("metadata").$type<Record<string, unknown> | null>(),
    occurredAt: timestamp("occurredAt").notNull().defaultNow(),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (table) => ({
    skillIdx: index("agent_telemetry_skill_idx").on(table.skill),
    decisionIdx: index("agent_telemetry_decision_idx").on(table.decision),
    occurredAtIdx: index("agent_telemetry_occurredAt_idx").on(table.occurredAt),
  }),
);

export type AgentTelemetryRow = typeof agentTelemetry.$inferSelect;
export type NewAgentTelemetryRow = typeof agentTelemetry.$inferInsert;
