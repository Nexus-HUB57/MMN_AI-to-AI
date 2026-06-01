/**
 * Partners domain events.
 *
 * Publishers padronizados para o barramento de eventos.
 * Emite os eventos de Partner / Partnership consumidos por
 * outros domínios (commissions, webhooks, notifications, etc.).
 */

import {
  eventBus,
  DomainEventType,
  type PartnerRegisteredPayload,
  type PartnerTierPromotedPayload,
  type PartnerVolumeRegisteredPayload,
  type PartnershipLifecyclePayload,
} from "../../_core/events/eventBus";
import { createDomainEvent } from "../shared/eventFactory";

/**
 * Emite PARTNER_REGISTERED quando um novo parceiro é cadastrado.
 * Disparado pelo router `partners.create` / `partners.createPartnership`.
 */
export async function publishPartnerRegistered(
  payload: PartnerRegisteredPayload,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await eventBus.publish(
    createDomainEvent<PartnerRegisteredPayload>({
      type: DomainEventType.PARTNER_REGISTERED,
      aggregateId: payload.partnerId,
      aggregateType: "Partner",
      payload,
      metadata,
    }),
  );
}

/**
 * Emite PARTNER_TIER_PROMOTED quando há promoção de tier
 * (ex.: silver → gold, gold → platinum, ...).
 */
export async function publishPartnerTierPromoted(
  payload: PartnerTierPromotedPayload,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await eventBus.publish(
    createDomainEvent<PartnerTierPromotedPayload>({
      type: DomainEventType.PARTNER_TIER_PROMOTED,
      aggregateId: payload.partnerId,
      aggregateType: "Partner",
      payload,
      metadata,
    }),
  );
}

/**
 * Emite PARTNER_VOLUME_REGISTERED após cada registro de volume.
 * Sinaliza se houve promoção automática de tier.
 */
export async function publishPartnerVolumeRegistered(
  payload: PartnerVolumeRegisteredPayload,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await eventBus.publish(
    createDomainEvent<PartnerVolumeRegisteredPayload>({
      type: DomainEventType.PARTNER_VOLUME_REGISTERED,
      aggregateId: payload.partnerId,
      aggregateType: "Partner",
      payload,
      metadata,
    }),
  );
}

/**
 * Emite PARTNERSHIP_CREATED quando uma nova parceria é submetida.
 */
export async function publishPartnershipCreated(
  payload: PartnershipLifecyclePayload,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await eventBus.publish(
    createDomainEvent<PartnershipLifecyclePayload>({
      type: DomainEventType.PARTNERSHIP_CREATED,
      aggregateId: payload.partnershipId,
      aggregateType: "Partnership",
      payload,
      metadata,
    }),
  );
}

/**
 * Emite PARTNERSHIP_APPROVED após admin aprovar uma parceria.
 */
export async function publishPartnershipApproved(
  payload: PartnershipLifecyclePayload,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await eventBus.publish(
    createDomainEvent<PartnershipLifecyclePayload>({
      type: DomainEventType.PARTNERSHIP_APPROVED,
      aggregateId: payload.partnershipId,
      aggregateType: "Partnership",
      payload,
      metadata,
    }),
  );
}

/**
 * Emite PARTNERSHIP_REJECTED com o motivo.
 */
export async function publishPartnershipRejected(
  payload: PartnershipLifecyclePayload,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await eventBus.publish(
    createDomainEvent<PartnershipLifecyclePayload>({
      type: DomainEventType.PARTNERSHIP_REJECTED,
      aggregateId: payload.partnershipId,
      aggregateType: "Partnership",
      payload,
      metadata,
    }),
  );
}

/**
 * Emite PARTNERSHIP_TERMINATED ao encerrar uma parceria.
 */
export async function publishPartnershipTerminated(
  payload: PartnershipLifecyclePayload,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await eventBus.publish(
    createDomainEvent<PartnershipLifecyclePayload>({
      type: DomainEventType.PARTNERSHIP_TERMINATED,
      aggregateId: payload.partnershipId,
      aggregateType: "Partnership",
      payload,
      metadata,
    }),
  );
}
