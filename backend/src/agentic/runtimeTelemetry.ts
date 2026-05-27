/**
 * Telemetria operacional em memória do runtime de skills.
 * -----------------------------------------------------------------------------
 * Mantém uma janela rolante das últimas execuções (default 200) para alimentar
 * o cálculo do Autonomy Score com números reais (não estimativas).
 *
 * Esta é uma camada in-memory intencional: o objetivo é registrar telemetria
 * imediata sem depender de DB. Quando o Postgres do Render estiver online,
 * o registro pode ser duplicado para persistência sem alterar a API pública.
 *
 * Estrutura:
 *  - addExecution(record) → adiciona uma execução à janela.
 *  - getTelemetry() → snapshot agregado pronto para o Autonomy Score.
 *  - resetTelemetry() → utilitário de testes.
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
const ring: RuntimeExecutionRecord[] = [];

export function addExecution(record: Omit<RuntimeExecutionRecord, "at"> & { at?: number }): void {
  const entry: RuntimeExecutionRecord = {
    ...record,
    at: record.at ?? Date.now(),
  };
  ring.push(entry);
  if (ring.length > MAX_WINDOW) {
    ring.splice(0, ring.length - MAX_WINDOW);
  }
}

export function resetTelemetry(): void {
  ring.length = 0;
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
  windowSizeMax: number;
}

export function getTelemetry(): RuntimeTelemetrySnapshot {
  if (ring.length === 0) {
    return {
      sampleSize: 0,
      autonomousTasksPct: 0,
      manualApprovalPct: 0,
      avgLatencyMs: 0,
      activeChannels: 0,
      skillsExercised: [],
      windowSizeMax: MAX_WINDOW,
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
    windowSizeMax: MAX_WINDOW,
  };
}
