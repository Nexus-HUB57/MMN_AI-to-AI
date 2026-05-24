/**
 * Auth domain events.
 *
 * Stub inicial: ainda não há eventos publicados pelo authRouter.
 * Quando login/logout/refresh forem instrumentados, adicionar publishers aqui.
 */

import { eventBus, DomainEventType } from "../../_core/events/eventBus";
import { createDomainEvent } from "../shared/eventFactory";

export interface SecurityEventPayload {
  userId?: string;
  ip?: string;
  userAgent?: string;
  kind:
    | "login_success"
    | "login_failed"
    | "logout"
    | "password_reset"
    | "suspicious_activity";
  details?: Record<string, unknown>;
}

export async function publishSecurityEvent(
  payload: SecurityEventPayload,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await eventBus.publish(
    createDomainEvent<SecurityEventPayload>({
      type: DomainEventType.SECURITY_EVENT,
      aggregateId: payload.userId ?? payload.ip ?? "anonymous",
      aggregateType: "AuthSession",
      payload,
      metadata,
    }),
  );
}
