/**
 * Domain Events System
 *
 * Implementação de Event-Driven Architecture para o MMN AI-to-AI.
 * Permite desacoplamento, escalabilidade, replay e auditoria.
 */

// ============================================================================
// EVENT TYPES
// ============================================================================

export enum DomainEventType {
  // Affiliate Events
  AFFILIATE_REGISTERED = 'AffiliateRegistered',
  AFFILIATE_ACTIVATED = 'AffiliateActivated',
  AFFILIATE_SUSPENDED = 'AffiliateSuspended',
  AFFILIATE_UPGRADED = 'AffiliateUpgraded',
  AFFILIATE_NETWORK_GROWTH = 'AffiliateNetworkGrowth',

  // Commission Events
  COMMISSION_GENERATED = 'CommissionGenerated',
  COMMISSION_APPROVED = 'CommissionApproved',
  COMMISSION_PAID = 'CommissionPaid',
  COMMISSION_REJECTED = 'CommissionRejected',
  COMMISSION_WITHDRAWN = 'CommissionWithdrawn',

  // Agentic Events
  AGENT_SESSION_STARTED = 'AgentSessionStarted',
  AGENT_SESSION_COMPLETED = 'AgentSessionCompleted',
  AGENT_SESSION_FAILED = 'AgentSessionFailed',
  AGENT_SKILL_ACTIVATED = 'AgentSkillActivated',
  AGENT_CONTENT_GENERATED = 'AgentContentGenerated',
  AGENT_CHECKPOINT_CREATED = 'AgentCheckpointCreated',

  // Marketplace Events
  MARKETPLACE_SYNC_COMPLETED = 'MarketplaceSyncCompleted',
  MARKETPLACE_PRODUCT_ADDED = 'MarketplaceProductAdded',
  MARKETPLACE_ORDER_PLACED = 'MarketplaceOrderPlaced',
  MARKETPLACE_ORDER_FULFILLED = 'MarketplaceOrderFulfilled',

  // XP Events
  XP_GRANTED = 'XPGranted',
  XP_LEVEL_UP = 'XPLevelUp',
  XP_MILESTONE_REACHED = 'XPMilestoneReached',

  // Billing Events
  INVOICE_PAID = 'InvoicePaid',
  INVOICE_OVERDUE = 'InvoiceOverdue',
  PAYMENT_PROCESSED = 'PaymentProcessed',
  PAYMENT_FAILED = 'PaymentFailed',

  // Career Events
  CAREER_LEVEL_UP = 'CareerLevelUp',
  RANK_ACHIEVED = 'RankAchieved',
  BONUS_UNLOCKED = 'BonusUnlocked',

  // Partner Events (Nexus Partners Pack)
  PARTNER_REGISTERED = 'PartnerRegistered',
  PARTNER_TIER_PROMOTED = 'PartnerTierPromoted',
  PARTNER_VOLUME_REGISTERED = 'PartnerVolumeRegistered',
  PARTNERSHIP_CREATED = 'PartnershipCreated',
  PARTNERSHIP_APPROVED = 'PartnershipApproved',
  PARTNERSHIP_REJECTED = 'PartnershipRejected',
  PARTNERSHIP_TERMINATED = 'PartnershipTerminated',

  // System Events
  SYSTEM_ALERT = 'SystemAlert',
  SLA_BREACH = 'SLABreach',
  SECURITY_EVENT = 'SecurityEvent'
}

// ============================================================================
// EVENT INTERFACE
// ============================================================================

export interface DomainEvent<T = unknown> {
  id: string;
  type: DomainEventType;
  aggregateId: string;
  aggregateType: string;
  timestamp: string;
  version: number;
  correlationId?: string;
  causationId?: string;
  metadata: Record<string, unknown>;
  payload: T;
}

// ============================================================================
// EVENT PAYLOADS
// ============================================================================

export interface AffiliateRegisteredPayload {
  affiliateId: string;
  sponsorId?: string;
  email: string;
  name: string;
  plan: string;
  rank?: string;
}

export interface CommissionGeneratedPayload {
  commissionId: string;
  affiliateId: string;
  orderId: string;
  amount: number;
  commissionType: 'direct' | 'indirect' | 'rank_bonus';
  percentage: number;
  status: 'pending' | 'approved' | 'paid';
}

export interface AgentSessionPayload {
  sessionId: string;
  agentId: string;
  userId?: string;
  channel: 'instagram' | 'whatsapp';
  status: 'started' | 'completed' | 'failed';
  qualityScore?: number;
  executionTimeMs?: number;
}

export interface XPGrantedPayload {
  userId: string;
  amount: number;
  reason: string;
  source: 'activity' | 'sale' | 'milestone' | 'bonus';
  newTotal: number;
}

export interface InvoicePaidPayload {
  invoiceId: string;
  userId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  transactionId?: string;
}

export interface CareerLevelUpPayload {
  userId: string;
  previousLevel: number;
  newLevel: number;
  previousRank: string;
  newRank: string;
  benefits: string[];
}

export interface PartnerRegisteredPayload {
  partnerId: string;
  userId: number;
  tier: 'silver' | 'gold' | 'platinum' | 'diamond';
  referralCode: string;
  metadata?: Record<string, unknown>;
}

export interface PartnerTierPromotedPayload {
  partnerId: string;
  previousTier: 'silver' | 'gold' | 'platinum' | 'diamond';
  newTier: 'silver' | 'gold' | 'platinum' | 'diamond';
  totalVolume: number;
  newCommissionRate: number;
  triggeredBy: 'volume_threshold' | 'admin_action' | 'algorithm';
}

export interface PartnerVolumeRegisteredPayload {
  partnerId: string;
  volume: number;
  volumeType: 'sale' | 'commission' | 'referral' | 'bonus';
  totalVolumeAfter: number;
  source?: string;
  triggeredPromotion?: boolean;
}

export interface PartnershipLifecyclePayload {
  partnershipId: string;
  partnerId: string;
  partnerName: string;
  status: 'pending' | 'active' | 'suspended' | 'terminated' | 'rejected';
  reason?: string;
  approvedBy?: number;
}

// ============================================================================
// EVENT HANDLER
// ============================================================================

export type EventHandler<T = unknown> = (event: DomainEvent<T>) => Promise<void> | void;

export interface EventSubscription {
  id: string;
  eventType: DomainEventType;
  handler: EventHandler;
  filter?: (event: DomainEvent) => boolean;
  priority: number;
}

// ============================================================================
// EVENT BUS
// ============================================================================

export class EventBus {
  private subscriptions = new Map<DomainEventType, EventSubscription[]>();
  private eventHistory: DomainEvent[] = [];
  private maxHistorySize = 1000;

  /**
   * Subscribe to an event type
   */
  subscribe<T>(
    eventType: DomainEventType,
    handler: EventHandler<T>,
    options?: { filter?: (event: DomainEvent) => boolean; priority?: number }
  ): string {
    const subscription: EventSubscription = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      eventType,
      handler: handler as EventHandler,
      filter: options?.filter,
      priority: options?.priority ?? 0
    };

    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, []);
    }

    const subscriptions = this.subscriptions.get(eventType)!;
    subscriptions.push(subscription);
    subscriptions.sort((a, b) => a.priority - b.priority);

    return subscription.id;
  }

  /**
   * Unsubscribe from an event
   */
  unsubscribe(subscriptionId: string): void {
    for (const [eventType, subscriptions] of this.subscriptions.entries()) {
      const index = subscriptions.findIndex(s => s.id === subscriptionId);
      if (index !== -1) {
        subscriptions.splice(index, 1);
        break;
      }
    }
  }

  /**
   * Publish an event
   */
  async publish<T>(event: DomainEvent<T>): Promise<void> {
    // Add to history
    this.addToHistory(event);

    // Get subscriptions for this event type
    const subscriptions = this.subscriptions.get(event.type) || [];

    // Execute all handlers
    const promises = subscriptions
      .filter(sub => !sub.filter || sub.filter(event))
      .map(sub => this.executeHandler(sub, event));

    await Promise.allSettled(promises);
  }

  /**
   * Execute event handler with error handling
   */
  private async executeHandler(subscription: EventSubscription, event: DomainEvent): Promise<void> {
    try {
      await subscription.handler(event);
    } catch (error) {
      console.error(`[EventBus] Handler error for ${event.type}:`, error);
    }
  }

  /**
   * Add event to history for replay
   */
  private addToHistory(event: DomainEvent): void {
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }

  /**
   * Replay events from history
   */
  async replay(
    eventTypes?: DomainEventType[],
    fromTimestamp?: string
  ): Promise<void> {
    const events = this.eventHistory.filter(event => {
      if (eventTypes && !eventTypes.includes(event.type)) return false;
      if (fromTimestamp && event.timestamp < fromTimestamp) return false;
      return true;
    });

    for (const event of events) {
      await this.publish(event);
    }
  }

  /**
   * Get event history
   */
  getHistory(
    options?: {
      eventType?: DomainEventType;
      aggregateId?: string;
      from?: string;
      to?: string;
      limit?: number;
    }
  ): DomainEvent[] {
    let events = this.eventHistory;

    if (options?.eventType) {
      events = events.filter(e => e.type === options.eventType);
    }

    if (options?.aggregateId) {
      events = events.filter(e => e.aggregateId === options.aggregateId);
    }

    if (options?.from) {
      events = events.filter(e => e.timestamp >= options.from!);
    }

    if (options?.to) {
      events = events.filter(e => e.timestamp <= options.to!);
    }

    if (options?.limit) {
      events = events.slice(-options.limit);
    }

    return events;
  }

  /**
   * Get subscribers count
   */
  getSubscribersCount(eventType: DomainEventType): number {
    return this.subscriptions.get(eventType)?.length ?? 0;
  }
}

// ============================================================================
// EVENT FACTORY
// ============================================================================

export class EventFactory {
  /**
   * Create a new domain event
   */
  static create<T>(
    type: DomainEventType,
    aggregateId: string,
    aggregateType: string,
    payload: T,
    options?: {
      correlationId?: string;
      causationId?: string;
      metadata?: Record<string, unknown>;
    }
  ): DomainEvent<T> {
    return {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      aggregateId,
      aggregateType,
      timestamp: new Date().toISOString(),
      version: 1,
      correlationId: options?.correlationId,
      causationId: options?.causationId,
      metadata: options?.metadata ?? {},
      payload
    };
  }

  /**
   * Create common events with factory methods
   */
  static affiliateRegistered(data: Omit<AffiliateRegisteredPayload, never>): DomainEvent<AffiliateRegisteredPayload> {
    return this.create(
      DomainEventType.AFFILIATE_REGISTERED,
      data.affiliateId,
      'Affiliate',
      data
    );
  }

  static commissionGenerated(data: Omit<CommissionGeneratedPayload, never>): DomainEvent<CommissionGeneratedPayload> {
    return this.create(
      DomainEventType.COMMISSION_GENERATED,
      data.commissionId,
      'Commission',
      data
    );
  }

  static agentSessionCompleted(data: Omit<AgentSessionPayload, never>): DomainEvent<AgentSessionPayload> {
    return this.create(
      DomainEventType.AGENT_SESSION_COMPLETED,
      data.sessionId,
      'AgentSession',
      data
    );
  }

  static xpGranted(data: Omit<XPGrantedPayload, never>): DomainEvent<XPGrantedPayload> {
    return this.create(
      DomainEventType.XP_GRANTED,
      data.userId,
      'User',
      data
    );
  }

  static careerLevelUp(data: Omit<CareerLevelUpPayload, never>): DomainEvent<CareerLevelUpPayload> {
    return this.create(
      DomainEventType.CAREER_LEVEL_UP,
      data.userId,
      'User',
      data
    );
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const eventBus = new EventBus();

export default eventBus;