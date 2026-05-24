/**
 * Commissions domain events.
 */

import {
  eventBus,
  DomainEventType,
  type CommissionGeneratedPayload,
} from "../../_core/events/eventBus";
import { createDomainEvent } from "../shared/eventFactory";

export async function publishCommissionGenerated(
  payload: CommissionGeneratedPayload,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await eventBus.publish(
    createDomainEvent<CommissionGeneratedPayload>({
      type: DomainEventType.COMMISSION_GENERATED,
      aggregateId: payload.commissionId,
      aggregateType: "Commission",
      payload,
      metadata,
    }),
  );
}

export async function publishCommissionApproved(
  commissionId: string,
  approverId: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await eventBus.publish(
    createDomainEvent({
      type: DomainEventType.COMMISSION_APPROVED,
      aggregateId: commissionId,
      aggregateType: "Commission",
      payload: { commissionId, approverId },
      metadata,
    }),
  );
}

export async function publishCommissionPaid(
  commissionId: string,
  payoutId: string,
  amount: number,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await eventBus.publish(
    createDomainEvent({
      type: DomainEventType.COMMISSION_PAID,
      aggregateId: commissionId,
      aggregateType: "Commission",
      payload: { commissionId, payoutId, amount },
      metadata,
    }),
  );
}

export async function publishCommissionRejected(
  commissionId: string,
  reason: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await eventBus.publish(
    createDomainEvent({
      type: DomainEventType.COMMISSION_REJECTED,
      aggregateId: commissionId,
      aggregateType: "Commission",
      payload: { commissionId, reason },
      metadata,
    }),
  );
}
