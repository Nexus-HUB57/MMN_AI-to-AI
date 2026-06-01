/**
 * Partners domain — event subscribers.
 *
 * Wiring de reações automáticas a eventos publicados pelo domínio Partners.
 *
 * v1.4.0 (Pivot de Modelo):
 *  - Remoção total do sistema de XP/carreira/gamificação.
 *  - Transição para modelo de Assinatura Comercial.
 *  - PARTNER_TIER_PROMOTED → Notificação multi-canal via notifyTierPromotion.
 *  - PARTNER_TIER_PROMOTED (Platinum/Diamond) → PARTNER_HIGH_VALUE_PROMOTION (Governança).
 */

import {
  eventBus,
  DomainEventType,
  type DomainEvent,
  type PartnerTierPromotedPayload,
  type PartnerHighValuePromotionPayload,
  EventFactory,
} from "../../_core/events/eventBus";
import { notifyTierPromotion } from "../notifications/notificationService";
import { getPartnerRecordById } from "./repository";

/**
 * Registra os handlers de eventos do domínio Partners.
 * Retorna um objeto com o método dispose para remover as inscrições.
 */
export function registerPartnersEventHandlers() {
  const tierPromotedHandler = async (event: DomainEvent<PartnerTierPromotedPayload>) => {
    const { partnerId, previousTier, newTier, triggeredBy } = event.payload;
    
    // Resolve o parceiro no repositório
    const partner = getPartnerRecordById(Number(partnerId));
    if (!partner) {
      console.warn(`[PartnersSubscriber] Partner not found for ID: ${partnerId}`);
      return;
    }

    // 1. Notificação Multi-canal (Email + Push + In-App)
    try {
      // O notificationService espera affiliateId, mas no contexto de Partners usamos partnerId
      await notifyTierPromotion(
        partner.userId,
        partner.id,
        previousTier,
        newTier,
        partner.benefits,
        `Parceiro #${partner.id}` // Em produção, buscaríamos o nome real do usuário
      );
    } catch (error) {
      console.error(`[PartnersSubscriber] Failed to send tier promotion notification:`, error);
    }

    // 2. Governança: Alerta Admin para promoções de alto valor
    if (newTier === 'platinum' || newTier === 'diamond') {
      const highValuePayload: PartnerHighValuePromotionPayload = {
        partnerId,
        userId: partner.userId,
        newTier,
        triggeredBy,
        correlationId: event.correlationId,
        causationId: event.id,
        sourceEventType: event.type,
      };

      await eventBus.publish(
        EventFactory.create(
          DomainEventType.PARTNER_HIGH_VALUE_PROMOTION,
          partnerId,
          'Partner',
          highValuePayload,
          {
            correlationId: event.correlationId,
            causationId: event.id,
          }
        )
      );
    }
  };

  const subId = eventBus.subscribe(
    DomainEventType.PARTNER_TIER_PROMOTED,
    tierPromotedHandler
  );

  return {
    dispose: () => {
      eventBus.unsubscribe(subId);
    },
  };
}
