/**
 * Histórico de execuções com suporte a replay.
 * -----------------------------------------------------------------------------
 * Mantém em memória as últimas N execuções de skills com input + output
 * completos, permitindo que o admin reexecute (replay) qualquer item da
 * listagem com um clique.
 *
 * Estrutura:
 *  - recordExecution({ skill, input, output, ... }) → adiciona entrada.
 *  - listExecutions({ skill, limit }) → lista filtrada por skill (opcional).
 *  - getExecution(id) → recupera execução completa para replay.
 *
 * O input completo é preservado para que o replay seja determinístico.
 */

export interface ExecutionHistoryRecord {
  id: string;
  executionId: string;
  skill: string;
  success: boolean;
  decision: "auto" | "needs_review";
  latencyMs: number;
  warningsCount: number;
  inputSummary: string;
  input: unknown;
  output: unknown;
  channelHint?: string;
  triggeredBy: string;
  createdAt: string;
}

const MAX_HISTORY = 100;
const history: ExecutionHistoryRecord[] = [];

function summarizeInput(input: unknown): string {
  if (input === null || input === undefined) return "—";
  if (typeof input === "string") return input.slice(0, 120);
  if (typeof input === "object") {
    try {
      const json = JSON.stringify(input);
      return json.length > 160 ? `${json.slice(0, 157)}...` : json;
    } catch {
      return "[input não serializável]";
    }
  }
  return String(input);
}

export interface RecordInput {
  executionId: string;
  skill: string;
  success: boolean;
  decision: "auto" | "needs_review";
  latencyMs: number;
  warningsCount: number;
  input: unknown;
  output: unknown;
  channelHint?: string;
  triggeredBy: string;
}

export function recordExecution(input: RecordInput): ExecutionHistoryRecord {
  const record: ExecutionHistoryRecord = {
    id: `exec_${input.executionId}`,
    executionId: input.executionId,
    skill: input.skill,
    success: input.success,
    decision: input.decision,
    latencyMs: input.latencyMs,
    warningsCount: input.warningsCount,
    inputSummary: summarizeInput(input.input),
    input: input.input,
    output: input.output,
    channelHint: input.channelHint,
    triggeredBy: input.triggeredBy,
    createdAt: new Date().toISOString(),
  };
  history.unshift(record);
  if (history.length > MAX_HISTORY) {
    history.splice(MAX_HISTORY);
  }
  return record;
}

export function listExecutions(options?: {
  skill?: string;
  limit?: number;
}): Array<Omit<ExecutionHistoryRecord, "input" | "output">> {
  const filtered = options?.skill
    ? history.filter((entry) => entry.skill === options.skill)
    : history;
  const limit = options?.limit ?? 30;
  return filtered.slice(0, limit).map((entry) => ({
    id: entry.id,
    executionId: entry.executionId,
    skill: entry.skill,
    success: entry.success,
    decision: entry.decision,
    latencyMs: entry.latencyMs,
    warningsCount: entry.warningsCount,
    inputSummary: entry.inputSummary,
    channelHint: entry.channelHint,
    triggeredBy: entry.triggeredBy,
    createdAt: entry.createdAt,
  }));
}

export function getExecution(id: string): ExecutionHistoryRecord | null {
  return history.find((entry) => entry.id === id) ?? null;
}

export function getExecutionStats(): {
  total: number;
  successRate: number;
  avgLatencyMs: number;
  bySkill: Record<string, number>;
} {
  if (history.length === 0) {
    return { total: 0, successRate: 0, avgLatencyMs: 0, bySkill: {} };
  }
  const successes = history.filter((entry) => entry.success).length;
  const latencySum = history.reduce((acc, entry) => acc + entry.latencyMs, 0);
  const bySkill: Record<string, number> = {};
  for (const entry of history) {
    bySkill[entry.skill] = (bySkill[entry.skill] ?? 0) + 1;
  }
  return {
    total: history.length,
    successRate: Math.round((successes / history.length) * 100),
    avgLatencyMs: Math.round(latencySum / history.length),
    bySkill,
  };
}

export function resetExecutionHistory(): void {
  history.length = 0;
}
