/**
 * Cron Alerts Service
 *
 * Avalia o snapshot SLA do domínio Cron e emite alertas operacionais
 * persistidos como notificações para usuários admin. Mantém um registro
 * em memória para evitar spam (dedup por jobType + severidade + chave),
 * com janela configurável de "cooldown".
 *
 * Tipos de alerta gerados:
 * - cron_critical_failures: falhas consecutivas acima do threshold
 * - cron_stuck_job: job em `running` há mais que o threshold
 * - cron_degraded_success_rate: taxa de sucesso 7d abaixo do mínimo
 *
 * Características:
 * - idempotência por chave (job + tipo + bucket de severidade)
 * - cooldown padrão de 30 minutos
 * - integração com `createNotification` para todos os admins ativos
 * - tolerante a falhas de banco (loga, não derruba o caller)
 */
import { eq } from 'drizzle-orm';
import { createNotification, getDb } from '../../../database/schemas/db';
import { users } from '../../../database/schemas/schema-final';
import { computeCronSlaSnapshot, type JobSlaIndicator, type CronSlaSnapshot } from './cronSlaIndicators';

export type CronAlertSeverity = 'warning' | 'critical';
export type CronAlertType =
  | 'cron_critical_failures'
  | 'cron_stuck_job'
  | 'cron_degraded_success_rate';

export interface CronAlert {
  id: string;
  jobType: string;
  jobName?: string;
  alertType: CronAlertType;
  severity: CronAlertSeverity;
  title: string;
  message: string;
  detectedAt: string;
  acknowledgedAt?: string;
  metadata: Record<string, unknown>;
}

export interface EvaluateAlertsOptions {
  cooldownMinutes?: number;
  notifyAdmins?: boolean;
  successRateAlertThreshold?: number;
}

export interface EvaluateAlertsResult {
  evaluatedAt: string;
  totalAlerts: number;
  newAlerts: CronAlert[];
  activeAlerts: CronAlert[];
  acknowledgedAlerts: CronAlert[];
  snapshotSummary: {
    totalJobs: number;
    criticalJobs: number;
    degradedJobs: number;
    stuckJobs: number;
  };
}

interface CooldownEntry {
  alertId: string;
  emittedAt: number;
}

const DEFAULT_COOLDOWN_MINUTES = 30;
const DEFAULT_SUCCESS_RATE_ALERT = 70; // alerta quando sucesso 7d cai abaixo disso

// In-memory dedup store. Para deploy multi-instância, migrar para Redis.
const cooldownByKey = new Map<string, CooldownEntry>();

// In-memory acknowledged set (volátil; ideal: migrar para tabela dedicada).
const acknowledgedAlerts = new Map<string, CronAlert>();

// Alertas ativos atualmente conhecidos (substituídos a cada avaliação).
let lastActiveAlerts: CronAlert[] = [];
let lastEvaluatedAt: string | null = null;

/**
 * Avalia o snapshot SLA, gera alertas, registra notificações e devolve
 * o estado atual de alertas para consumo pelo Backoffice.
 */
export async function evaluateCronAlerts(
  options: EvaluateAlertsOptions = {}
): Promise<EvaluateAlertsResult> {
  const cooldownMinutes = options.cooldownMinutes ?? DEFAULT_COOLDOWN_MINUTES;
  const successRateAlertThreshold = options.successRateAlertThreshold ?? DEFAULT_SUCCESS_RATE_ALERT;
  const notifyAdmins = options.notifyAdmins ?? true;

  const snapshot = await computeCronSlaSnapshot();
  const now = new Date();

  const activeAlerts: CronAlert[] = [];
  const newAlerts: CronAlert[] = [];

  for (const indicator of snapshot.jobs) {
    const alerts = buildAlertsForJob(indicator, snapshot, successRateAlertThreshold, now);

    for (const alert of alerts) {
      activeAlerts.push(alert);

      // Pula se já foi reconhecido manualmente
      if (acknowledgedAlerts.has(alert.id)) {
        const acked = acknowledgedAlerts.get(alert.id)!;
        alert.acknowledgedAt = acked.acknowledgedAt;
        continue;
      }

      // Dedup por cooldown
      if (isWithinCooldown(alert.id, cooldownMinutes, now)) {
        continue;
      }

      newAlerts.push(alert);
      registerCooldown(alert.id, now);
    }
  }

  // Limpar acknowledgements de alertas que não estão mais ativos
  pruneAcknowledgements(activeAlerts);

  lastActiveAlerts = activeAlerts;
  lastEvaluatedAt = now.toISOString();

  if (notifyAdmins && newAlerts.length > 0) {
    await persistNotifications(newAlerts);
  }

  return {
    evaluatedAt: lastEvaluatedAt,
    totalAlerts: activeAlerts.length,
    newAlerts,
    activeAlerts,
    acknowledgedAlerts: Array.from(acknowledgedAlerts.values()),
    snapshotSummary: {
      totalJobs: snapshot.global.totalJobs,
      criticalJobs: snapshot.global.criticalJobs,
      degradedJobs: snapshot.global.degradedJobs,
      stuckJobs: snapshot.global.stuckJobs,
    },
  };
}

/**
 * Lista os alertas conhecidos pela última avaliação. Se nunca houve
 * avaliação, executa uma agora.
 */
export async function listActiveCronAlerts(): Promise<{
  evaluatedAt: string;
  alerts: CronAlert[];
}> {
  if (!lastEvaluatedAt) {
    await evaluateCronAlerts({ notifyAdmins: false });
  }

  return {
    evaluatedAt: lastEvaluatedAt ?? new Date().toISOString(),
    alerts: lastActiveAlerts.map((alert) => ({
      ...alert,
      acknowledgedAt: acknowledgedAlerts.get(alert.id)?.acknowledgedAt,
    })),
  };
}

/**
 * Reconhece um alerta manualmente. Enquanto ele permanecer ativo, não
 * gerará novas notificações.
 */
export function acknowledgeCronAlert(alertId: string): CronAlert | null {
  const target = lastActiveAlerts.find((alert) => alert.id === alertId);
  if (!target) {
    return null;
  }

  const acked: CronAlert = {
    ...target,
    acknowledgedAt: new Date().toISOString(),
  };
  acknowledgedAlerts.set(alertId, acked);
  return acked;
}

/**
 * Remove reconhecimento de um alerta (útil para reabrir incidente).
 */
export function clearAcknowledgement(alertId: string): boolean {
  return acknowledgedAlerts.delete(alertId);
}

/**
 * Limpa todo o estado em memória — útil para testes e ambientes efêmeros.
 */
export function resetCronAlertsState(): void {
  cooldownByKey.clear();
  acknowledgedAlerts.clear();
  lastActiveAlerts = [];
  lastEvaluatedAt = null;
}

// ---------------------------------------------------------------------------
// helpers internos
// ---------------------------------------------------------------------------

function buildAlertsForJob(
  indicator: JobSlaIndicator,
  snapshot: CronSlaSnapshot,
  successRateAlertThreshold: number,
  now: Date
): CronAlert[] {
  const alerts: CronAlert[] = [];

  if (indicator.isStuck) {
    alerts.push({
      id: makeAlertId(indicator.jobType, 'cron_stuck_job', `${indicator.stuckSinceMinutes ?? 0}`),
      jobType: indicator.jobType,
      jobName: indicator.jobName,
      alertType: 'cron_stuck_job',
      severity: 'critical',
      title: `Cron travado: ${indicator.jobName ?? indicator.jobType}`,
      message: `Job em execução há ${indicator.stuckSinceMinutes ?? '?'} minutos (limite ${snapshot.options.stuckThresholdMinutes} min).`,
      detectedAt: now.toISOString(),
      metadata: {
        stuckSinceMinutes: indicator.stuckSinceMinutes ?? null,
        threshold: snapshot.options.stuckThresholdMinutes,
        queueName: indicator.queueName,
      },
    });
  }

  if (indicator.consecutiveFailures >= snapshot.options.consecutiveFailuresAlertThreshold) {
    const bucket = bucketize(indicator.consecutiveFailures);
    alerts.push({
      id: makeAlertId(indicator.jobType, 'cron_critical_failures', bucket),
      jobType: indicator.jobType,
      jobName: indicator.jobName,
      alertType: 'cron_critical_failures',
      severity: 'critical',
      title: `Falhas consecutivas em ${indicator.jobName ?? indicator.jobType}`,
      message: `${indicator.consecutiveFailures} falhas consecutivas detectadas (threshold ${snapshot.options.consecutiveFailuresAlertThreshold}).`,
      detectedAt: now.toISOString(),
      metadata: {
        consecutiveFailures: indicator.consecutiveFailures,
        threshold: snapshot.options.consecutiveFailuresAlertThreshold,
        failureCount7d: indicator.failureCount7d,
      },
    });
  }

  if (
    indicator.totalRuns7d > 0 &&
    indicator.successRate7d < successRateAlertThreshold
  ) {
    const bucket = bucketize(100 - indicator.successRate7d);
    alerts.push({
      id: makeAlertId(indicator.jobType, 'cron_degraded_success_rate', bucket),
      jobType: indicator.jobType,
      jobName: indicator.jobName,
      alertType: 'cron_degraded_success_rate',
      severity: 'warning',
      title: `Sucesso degradado em ${indicator.jobName ?? indicator.jobType}`,
      message: `Taxa de sucesso 7d em ${indicator.successRate7d.toFixed(1)}% (limite ${successRateAlertThreshold}%).`,
      detectedAt: now.toISOString(),
      metadata: {
        successRate7d: indicator.successRate7d,
        successRate30d: indicator.successRate30d,
        threshold: successRateAlertThreshold,
        totalRuns7d: indicator.totalRuns7d,
        failureCount7d: indicator.failureCount7d,
      },
    });
  }

  return alerts;
}

function makeAlertId(jobType: string, type: CronAlertType, suffix: string): string {
  return `${type}:${jobType}:${suffix}`;
}

function bucketize(value: number): string {
  // Agrupamento estável para evitar gerar alerta novo a cada delta pequeno
  if (value <= 5) return '0-5';
  if (value <= 10) return '6-10';
  if (value <= 20) return '11-20';
  if (value <= 50) return '21-50';
  return '50+';
}

function isWithinCooldown(alertId: string, cooldownMinutes: number, now: Date): boolean {
  const entry = cooldownByKey.get(alertId);
  if (!entry) return false;
  const ageMinutes = (now.getTime() - entry.emittedAt) / (60 * 1000);
  return ageMinutes < cooldownMinutes;
}

function registerCooldown(alertId: string, now: Date): void {
  cooldownByKey.set(alertId, {
    alertId,
    emittedAt: now.getTime(),
  });
}

function pruneAcknowledgements(activeAlerts: CronAlert[]): void {
  const activeIds = new Set(activeAlerts.map((a) => a.id));
  for (const id of acknowledgedAlerts.keys()) {
    if (!activeIds.has(id)) {
      acknowledgedAlerts.delete(id);
    }
  }
}

async function persistNotifications(alerts: CronAlert[]): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return;

    const admins = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.role, 'admin'))
      .limit(50);

    if (!admins.length) {
      console.warn('[CronAlerts] Nenhum admin encontrado para receber notificações');
      return;
    }

    for (const alert of alerts) {
      for (const admin of admins) {
        await createNotification({
          userId: admin.id,
          type: `cron_alert:${alert.alertType}`,
          title: alert.title,
          content: alert.message,
        });
      }
    }

    console.log(
      `[CronAlerts] ${alerts.length} alerta(s) propagados a ${admins.length} admin(s)`
    );
  } catch (error) {
    console.error('[CronAlerts] Falha ao persistir notificações de alerta:', error);
  }
}
