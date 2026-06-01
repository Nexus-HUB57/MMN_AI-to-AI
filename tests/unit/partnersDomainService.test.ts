import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { eventBus, DomainEventType, EventFactory } from '../../backend/src/_core/events/eventBus';
import { registerPartnersEventHandlers } from '../../backend/src/domains/partners/subscribers';
import * as notificationService from '../../backend/src/domains/notifications/notificationService';
import * as repository from '../../backend/src/domains/partners/repository';

// Mock do notificationService
vi.mock('../../backend/src/domains/notifications/notificationService', () => ({
  notifyTierPromotion: vi.fn().mockResolvedValue(undefined),
  notificationManager: {
    sendTierPromotion: vi.fn().mockResolvedValue([]),
    broadcast: vi.fn().mockResolvedValue([]),
  }
}));

describe('Partners Domain Subscriber (v1.4.0 - Subscription Model)', () => {
  let subscription: { dispose: () => void };

  beforeEach(() => {
    vi.clearAllMocks();
    repository.resetPartnerRepository();
    subscription = registerPartnersEventHandlers();
  });

  afterEach(() => {
    if (subscription) {
      subscription.dispose();
    }
  });

  it('deve enviar notificação multi-canal ao receber PARTNER_TIER_PROMOTED', async () => {
    const partner = repository.getPartnerRecordById(1001)!; // Silver
    
    const event = EventFactory.create(
      DomainEventType.PARTNER_TIER_PROMOTED,
      '1001',
      'Partner',
      {
        partnerId: '1001',
        previousTier: 'silver',
        newTier: 'gold',
        totalVolume: 5000,
        newCommissionRate: 0.08,
        triggeredBy: 'volume_threshold',
      }
    );

    await eventBus.publish(event);

    expect(notificationService.notifyTierPromotion).toHaveBeenCalledWith(
      partner.userId,
      partner.id,
      'silver',
      'gold',
      expect.any(Array),
      expect.stringContaining('Parceiro #1001')
    );
  });

  it('deve emitir PARTNER_HIGH_VALUE_PROMOTION para promoções Platinum', async () => {
    const publishSpy = vi.spyOn(eventBus, 'publish');
    
    const event = EventFactory.create(
      DomainEventType.PARTNER_TIER_PROMOTED,
      '1002',
      'Partner',
      {
        partnerId: '1002',
        previousTier: 'gold',
        newTier: 'platinum',
        totalVolume: 20000,
        newCommissionRate: 0.12,
        triggeredBy: 'admin_action',
      }
    );

    await eventBus.publish(event);

    // Verifica se o evento de governança foi publicado
    const highValueEvent = publishSpy.mock.calls.find(
      call => call[0].type === DomainEventType.PARTNER_HIGH_VALUE_PROMOTION
    );

    expect(highValueEvent).toBeDefined();
    expect(highValueEvent![0].payload).toMatchObject({
      newTier: 'platinum',
      partnerId: '1002',
    });
  });

  it('deve emitir PARTNER_HIGH_VALUE_PROMOTION para promoções Diamond', async () => {
    const publishSpy = vi.spyOn(eventBus, 'publish');
    
    const event = EventFactory.create(
      DomainEventType.PARTNER_TIER_PROMOTED,
      '1003',
      'Partner',
      {
        partnerId: '1003',
        previousTier: 'platinum',
        newTier: 'diamond',
        totalVolume: 100000,
        newCommissionRate: 0.15,
        triggeredBy: 'algorithm',
      }
    );

    await eventBus.publish(event);

    const highValueEvent = publishSpy.mock.calls.find(
      call => call[0].type === DomainEventType.PARTNER_HIGH_VALUE_PROMOTION
    );

    expect(highValueEvent).toBeDefined();
    expect(highValueEvent![0].payload).toMatchObject({
      newTier: 'diamond',
      partnerId: '1003',
    });
  });

  it('NÃO deve emitir PARTNER_HIGH_VALUE_PROMOTION para promoção Gold', async () => {
    const publishSpy = vi.spyOn(eventBus, 'publish');
    
    const event = EventFactory.create(
      DomainEventType.PARTNER_TIER_PROMOTED,
      '1001',
      'Partner',
      {
        partnerId: '1001',
        previousTier: 'silver',
        newTier: 'gold',
        totalVolume: 5000,
        newCommissionRate: 0.08,
        triggeredBy: 'volume_threshold',
      }
    );

    await eventBus.publish(event);

    const highValueEvent = publishSpy.mock.calls.find(
      call => call[0].type === DomainEventType.PARTNER_HIGH_VALUE_PROMOTION
    );

    expect(highValueEvent).toBeUndefined();
  });
});
