/**
 * Affiliate domain events.
 *
 * Helpers que padronizam a publicação de eventos do domínio Affiliate via
 * `eventBus`. Esta camada centraliza payload + tipo, evitando que cada router
 * conheça os detalhes internos do `DomainEvent`.
 */

import {
  eventBus,
  DomainEventType,
  type AffiliateRegisteredPayload,
} from "../../_core/events/eventBus";
import { createDomainEvent } from "../shared/eventFactory";

export async function publishAffiliateRegistered(
  payload: AffiliateRegisteredPayload,
  metadata?: Record<string, unknown>,
): Promise<void> {
  const event = createDomainEvent<AffiliateRegisteredPayload>({
    type: DomainEventType.AFFILIATE_REGISTERED,
    aggregateId: payload.affiliateId,
    aggregateType: "Affiliate",
    payload,
    metadata,
  });
  await eventBus.publish(event);
}

export async function publishAffiliateActivated(
  affiliateId: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await eventBus.publish(
    createDomainEvent({
      type: DomainEventType.AFFILIATE_ACTIVATED,
      aggregateId: affiliateId,
      aggregateType: "Affiliate",
      payload: { affiliateId },
      metadata,
    }),
  );
}

export async function publishAffiliateUpgraded(
  affiliateId: string,
  fromPlan: string,
  toPlan: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await eventBus.publish(
    createDomainEvent({
      type: DomainEventType.AFFILIATE_UPGRADED,
      aggregateId: affiliateId,
      aggregateType: "Affiliate",
      payload: { affiliateId, fromPlan, toPlan },
      metadata,
    }),
  );
}
