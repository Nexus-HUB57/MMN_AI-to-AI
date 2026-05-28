/**
 * Telemetria operacional do runtime de skills.
 * -----------------------------------------------------------------------------
 * Camada in-memory com janela rolante (default 200 execuções) que alimenta o
 * cálculo real do Autonomy Score. Mantém também a média móvel das avaliações
 * do LLM-as-Judge (`judge-revisor`) para preencher `judgeAccuracyPct` real.
 *
 * Persistência opcional:
 *  - Se o banco estiver disponível e o módulo `database/schemas/db` exportar
 *    `createAgentTelemetryRecord`, replicamos cada execução em best-effort
 *    sem bloquear a resposta. Isso permite sobrevivência a restarts no
 *    Render quando o Postgres estiver provisionado.
 */

export interface RuntimeExecutionRecord {
  skill: string;
  decision: "auto" | "needs_review";
  success: boolean;
  latencyMs: number;
  channel?: string;
  warningsCount: number;
  at: number;
}

const MAX_WINDOW = 200;
const MAX_JUDGE_WINDOW = 50;
const ring: RuntimeExecutionRecord[] = [];
const judgeRing: number[] = [];

function tryPersist(record: RuntimeExecutionRecord): void {
  // Best-effort: importa dinamicamente o repositório de telemetria. Quando o
  // DATABASE_URL está configurado, grava na tabela `agent_telemetry`; caso
  // contrário é no-op silencioso.
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const repo = require("./telemetryRepository");
    if (typeof repo?.persistTelemetry === "function") {
      Promise.resolve(repo.persistTelemetry(record)).catch(() => undefined);
    }
  } catch {
    // módulo não resolvido — segue só em memória
  }
}

export function addExecution(record: Omit<RuntimeExecutionRecord, "at"> & { at?: number }): void {
  const entry: RuntimeExecutionRecord = {
    ...record,
    at: record.at ?? Date.now(),
  };
  ring.push(entry);
  if (ring.length > MAX_WINDOW) {
    ring.splice(0, ring.length - MAX_WINDOW);
  }
  tryPersist(entry);
}

export function recordJudgeEvaluation(score: number): void {
  if (!Number.isFinite(score)) return;
  const normalized = Math.max(0, Math.min(100, score));
  judgeRing.push(normalized);
  if (judgeRing.length > MAX_JUDGE_WINDOW) {
    judgeRing.splice(0, judgeRing.length - MAX_JUDGE_WINDOW);
  }
}

export function resetTelemetry(): void {
  ring.length = 0;
  judgeRing.length = 0;
}

export interface RuntimeTelemetrySnapshot {
  sampleSize: number;
  /** % de execuções decididas como `auto` (proxy de autonomia real). */
  autonomousTasksPct: number;
  /** % de execuções com success=true e warningsCount=0 (proxy de aprovação). */
  manualApprovalPct: number;
  /** média de latência em ms entre as execuções da janela. */
  avgLatencyMs: number;
  /** número de canais distintos observados na janela. */
  activeChannels: number;
  /** lista das skills executadas com pelo menos uma execução na janela. */
  skillsExercised: string[];
  /** Acurácia média do LLM-as-Judge (0-100), `null` se ainda não houver avaliação. */
  judgeAccuracyPct: number | null;
  /** quantidade de avaliações do judge na janela rolante. */
  judgeSampleSize: number;
  windowSizeMax: number;
  judgeWindowSizeMax: number;
}

export function getTelemetry(): RuntimeTelemetrySnapshot {
  const base: Omit<RuntimeTelemetrySnapshot, "autonomousTasksPct" | "manualApprovalPct" | "avgLatencyMs" | "activeChannels" | "skillsExercised" | "sampleSize"> = {
    judgeAccuracyPct:
      judgeRing.length === 0
        ? null
        : Math.round(judgeRing.reduce((acc, value) => acc + value, 0) / judgeRing.length),
    judgeSampleSize: judgeRing.length,
    windowSizeMax: MAX_WINDOW,
    judgeWindowSizeMax: MAX_JUDGE_WINDOW,
  };

  if (ring.length === 0) {
    return {
      sampleSize: 0,
      autonomousTasksPct: 0,
      manualApprovalPct: 0,
      avgLatencyMs: 0,
      activeChannels: 0,
      skillsExercised: [],
      ...base,
    };
  }

  const autonomous = ring.filter((entry) => entry.decision === "auto").length;
  const approved = ring.filter((entry) => entry.success && entry.warningsCount === 0).length;
  const latencySum = ring.reduce((acc, entry) => acc + entry.latencyMs, 0);
  const channels = new Set<string>();
  const skills = new Set<string>();
  for (const entry of ring) {
    if (entry.channel) channels.add(entry.channel);
    skills.add(entry.skill);
  }

  return {
    sampleSize: ring.length,
    autonomousTasksPct: Math.round((autonomous / ring.length) * 100),
    manualApprovalPct: Math.round((approved / ring.length) * 100),
    avgLatencyMs: Math.round(latencySum / ring.length),
    activeChannels: channels.size,
    skillsExercised: Array.from(skills),
    ...base,
  };
}
