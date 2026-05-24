/**
 * Default audit subscribers para o `eventBus`.
 *
 * Conectado em `backend/src/index.ts` na inicialização do processo. Garante
 * que todo `DomainEvent` publicado por qualquer domínio seja registrado em
 * logs estruturados, servindo como trilha mínima de auditoria até a chegada
 * de Sentry/OpenTelemetry definidos no roadmap Beta.
 */

import { eventBus, DomainEventType, type DomainEvent } from "./eventBus";

const SEVERITY_BY_TYPE: Partial<Record<DomainEventType, "info" | "warn" | "error">> = {
  [DomainEventType.AGENT_SESSION_FAILED]: "error",
  [DomainEventType.PAYMENT_FAILED]: "error",
  [DomainEventType.INVOICE_OVERDUE]: "warn",
  [DomainEventType.COMMISSION_REJECTED]: "warn",
  [DomainEventType.SLA_BREACH]: "warn",
  [DomainEventType.SECURITY_EVENT]: "warn",
  [DomainEventType.SYSTEM_ALERT]: "warn",
  [DomainEventType.AFFILIATE_SUSPENDED]: "warn",
};

function logEvent(event: DomainEvent): void {
  const severity = SEVERITY_BY_TYPE[event.type] ?? "info";
  const record = {
    level: severity,
    tag: "domain-event",
    eventId: event.id,
    eventType: event.type,
    aggregateId: event.aggregateId,
    aggregateType: event.aggregateType,
    timestamp: event.timestamp,
    correlationId: event.correlationId,
    payload: event.payload,
  };
  const serialized = JSON.stringify(record);
  if (severity === "error") {
    console.error(serialized);
  } else if (severity === "warn") {
    console.warn(serialized);
  } else {
    console.log(serialized);
  }
}

let registered = false;

/**
 * Registra um listener por tipo de evento de domínio para gerar uma trilha
 * estruturada. Idempotente — chamadas repetidas são ignoradas.
 */
export function registerAuditSubscribers(): void {
  if (registered) return;
  registered = true;

  for (const type of Object.values(DomainEventType)) {
    eventBus.subscribe(type, logEvent, { priority: 100 });
  }

  console.log(
    JSON.stringify({
      level: "info",
      tag: "event-bus",
      message: "Audit subscribers registered",
      eventTypes: Object.values(DomainEventType).length,
    }),
  );
}

/**
 * Apenas para testes: permite re-registrar os subscribers em isolamento.
 */
export function __resetAuditSubscribersForTests(): void {
  registered = false;
}
