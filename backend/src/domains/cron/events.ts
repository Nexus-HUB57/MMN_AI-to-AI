/**
 * Cron domain events.
 *
 * Eventos operacionais do scheduler/cron dispatcher: SLA breaches, alertas,
 * problemas de execução de jobs.
 */

import { eventBus, DomainEventType } from "../../_core/events/eventBus";
import { createDomainEvent } from "../shared/eventFactory";

export interface SlaBreachPayload {
  jobType: string;
  metric: "success_rate" | "p95" | "consecutive_failures" | "stuck";
  observedValue: number;
  threshold: number;
  windowHours: number;
}

export interface SystemAlertPayload {
  alertId: string;
  jobType?: string;
  severity: "info" | "warning" | "critical";
  title: string;
  description?: string;
}

export async function publishSlaBreach(
  payload: SlaBreachPayload,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await eventBus.publish(
    createDomainEvent<SlaBreachPayload>({
      type: DomainEventType.SLA_BREACH,
      aggregateId: payload.jobType,
      aggregateType: "CronJob",
      payload,
      metadata,
    }),
  );
}

export async function publishSystemAlert(
  payload: SystemAlertPayload,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await eventBus.publish(
    createDomainEvent<SystemAlertPayload>({
      type: DomainEventType.SYSTEM_ALERT,
      aggregateId: payload.alertId,
      aggregateType: "SystemAlert",
      payload,
      metadata,
    }),
  );
}
