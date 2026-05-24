/**
 * Billing domain events.
 */

import {
  eventBus,
  DomainEventType,
  type InvoicePaidPayload,
} from "../../_core/events/eventBus";
import { createDomainEvent } from "../shared/eventFactory";

export async function publishInvoicePaid(
  payload: InvoicePaidPayload,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await eventBus.publish(
    createDomainEvent<InvoicePaidPayload>({
      type: DomainEventType.INVOICE_PAID,
      aggregateId: payload.invoiceId,
      aggregateType: "Invoice",
      payload,
      metadata,
    }),
  );
}

export async function publishInvoiceOverdue(
  invoiceId: string,
  userId: string,
  amount: number,
  daysOverdue: number,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await eventBus.publish(
    createDomainEvent({
      type: DomainEventType.INVOICE_OVERDUE,
      aggregateId: invoiceId,
      aggregateType: "Invoice",
      payload: { invoiceId, userId, amount, daysOverdue },
      metadata,
    }),
  );
}

export async function publishPaymentProcessed(
  paymentId: string,
  userId: string,
  amount: number,
  method: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await eventBus.publish(
    createDomainEvent({
      type: DomainEventType.PAYMENT_PROCESSED,
      aggregateId: paymentId,
      aggregateType: "Payment",
      payload: { paymentId, userId, amount, method },
      metadata,
    }),
  );
}

export async function publishPaymentFailed(
  paymentId: string,
  userId: string,
  amount: number,
  reason: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await eventBus.publish(
    createDomainEvent({
      type: DomainEventType.PAYMENT_FAILED,
      aggregateId: paymentId,
      aggregateType: "Payment",
      payload: { paymentId, userId, amount, reason },
      metadata,
    }),
  );
}
