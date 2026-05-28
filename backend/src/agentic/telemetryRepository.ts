/**
 * Repositório opcional de telemetria persistida.
 * -----------------------------------------------------------------------------
 * Encapsula a inserção na tabela `agent_telemetry`. Quando o `DATABASE_URL`
 * estiver configurado no Render (Postgres provisionado), cada execução é
 * gravada de forma assíncrona. Em ambiente standalone, a função é no-op.
 *
 * Tipos consumidos:
 *  - RuntimeExecutionRecord (do `runtimeTelemetry.ts`)
 *  - opcionais: judgeScore + judgeVerdict via metadata.
 */

import { randomUUID } from "node:crypto";

import type { RuntimeExecutionRecord } from "./runtimeTelemetry";

type DrizzleInsert = (values: any) => { values: () => Promise<unknown> | unknown };

let cachedDb: any | null | undefined;

function loadDb(): any | null {
  if (cachedDb !== undefined) return cachedDb;
  if (!process.env.DATABASE_URL) {
    cachedDb = null;
    return null;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const drizzleClient = require("../../../database/schemas/db");
    if (typeof drizzleClient?.db === "object" && drizzleClient?.db) {
      cachedDb = drizzleClient.db;
      return cachedDb;
    }
  } catch {
    // database não disponível
  }
  cachedDb = null;
  return null;
}

function loadSchema(): any | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require("../../../database/schemas/agentTelemetry");
  } catch {
    return null;
  }
}

export async function persistTelemetry(record: RuntimeExecutionRecord, extra?: {
  judgeScore?: number;
  judgeVerdict?: "pass" | "revise" | "fail";
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const db = loadDb();
  const schema = loadSchema();
  if (!db || !schema?.agentTelemetry) return;

  try {
    const row = {
      id: randomUUID(),
      skill: record.skill,
      decision: record.decision,
      success: record.success,
      latencyMs: record.latencyMs,
      channel: record.channel ?? null,
      warningsCount: record.warningsCount,
      judgeScore: extra?.judgeScore ?? null,
      judgeVerdict: extra?.judgeVerdict ?? null,
      metadata: extra?.metadata ?? null,
      occurredAt: new Date(record.at),
    };
    const insert = db.insert(schema.agentTelemetry) as ReturnType<DrizzleInsert>;
    await Promise.resolve(insert.values(row));
  } catch (error) {
    // Best-effort: persistência falhou mas a operação principal segue.
    console.warn("[telemetryRepository] persistTelemetry skipped:", (error as Error).message);
  }
}
