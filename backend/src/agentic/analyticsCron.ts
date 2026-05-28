/**
 * Cron interno · Analytics Reporter automático.
 * -----------------------------------------------------------------------------
 * Roda o `analytics-reporter` em background a cada janela configurada
 * (default 6h) e armazena os últimos N relatórios em memória.
 *
 * - Quando `ENABLE_ANALYTICS_CRON=false` o cron fica desligado.
 * - Quando habilitado, dispara imediatamente uma vez ao iniciar e depois
 *   periodicamente.
 *
 * Endpoint público `agentSkillsRuntime.analyticsLatest` retorna o último
 * snapshot disponível sem precisar reexecutar a skill.
 */

import { analyticsReporterHandler } from "./skills/analyticsReporter";

interface StoredReport {
  generatedAt: string;
  triggeredBy: "cron" | "manual";
  decision: "auto" | "needs_review";
  output: unknown;
}

const MAX_REPORTS = 20;
const reports: StoredReport[] = [];
let intervalHandle: ReturnType<typeof setInterval> | null = null;
let lastError: string | null = null;

export function getLatestAnalyticsReport(): StoredReport | null {
  return reports[0] ?? null;
}

export function listAnalyticsReports(limit = 10): StoredReport[] {
  return reports.slice(0, Math.max(1, Math.min(limit, MAX_REPORTS)));
}

export function getAnalyticsCronStatus(): {
  running: boolean;
  intervalHours: number;
  reportsStored: number;
  lastError: string | null;
} {
  return {
    running: intervalHandle !== null,
    intervalHours: Number(process.env.ANALYTICS_CRON_HOURS ?? 6),
    reportsStored: reports.length,
    lastError,
  };
}

async function runReport(trigger: "cron" | "manual"): Promise<void> {
  try {
    const input = analyticsReporterHandler.parseInput({ format: "executive", windowHours: 24 });
    const result = await analyticsReporterHandler.execute(input, {
      agentId: -1,
      userId: -1,
      agentName: "Cron · Analytics",
      performanceScore: 50,
      autonomyAllowed: true,
    });
    reports.unshift({
      generatedAt: new Date().toISOString(),
      triggeredBy: trigger,
      decision: result.decision,
      output: result.output,
    });
    if (reports.length > MAX_REPORTS) {
      reports.splice(MAX_REPORTS);
    }
    lastError = null;
    console.log(`[analyticsCron] Relatório gerado (trigger=${trigger}, decision=${result.decision}).`);
  } catch (error) {
    lastError = (error as Error).message;
    console.warn("[analyticsCron] Falha ao gerar relatório:", lastError);
  }
}

export function startAnalyticsCron(): void {
  if (intervalHandle) return;
  if (process.env.ENABLE_ANALYTICS_CRON === "false") {
    console.log("[analyticsCron] Desativado por flag ENABLE_ANALYTICS_CRON=false.");
    return;
  }
  const hours = Number(process.env.ANALYTICS_CRON_HOURS ?? 6);
  const intervalMs = Math.max(1, Math.min(168, hours)) * 60 * 60 * 1000;
  intervalHandle = setInterval(() => {
    void runReport("cron");
  }, intervalMs);
  // primeira execução imediata após boot
  void runReport("cron");
  console.log(`[analyticsCron] Iniciado (intervalo=${hours}h).`);
}

export async function triggerAnalyticsReportNow(): Promise<StoredReport | null> {
  await runReport("manual");
  return reports[0] ?? null;
}

export function stopAnalyticsCron(): void {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
  }
}
