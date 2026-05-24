/**
 * Marketplace domain events.
 */

import { eventBus, DomainEventType } from "../../_core/events/eventBus";
import { createDomainEvent } from "../shared/eventFactory";

export interface MarketplaceSyncCompletedPayload {
  marketplace: string;
  accountId?: string;
  itemsSynced: number;
  durationMs: number;
  jobId?: string;
}

export interface MarketplaceProductAddedPayload {
  productId: string;
  marketplace: string;
  title: string;
  price: number;
  currency: string;
}

export interface MarketplaceOrderPayload {
  orderId: string;
  marketplace: string;
  affiliateId?: string;
  amount: number;
  status: "placed" | "fulfilled" | "cancelled";
}

export async function publishMarketplaceSyncCompleted(
  payload: MarketplaceSyncCompletedPayload,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await eventBus.publish(
    createDomainEvent<MarketplaceSyncCompletedPayload>({
      type: DomainEventType.MARKETPLACE_SYNC_COMPLETED,
      aggregateId: payload.accountId ?? payload.marketplace,
      aggregateType: "MarketplaceAccount",
      payload,
      metadata,
    }),
  );
}

export async function publishMarketplaceProductAdded(
  payload: MarketplaceProductAddedPayload,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await eventBus.publish(
    createDomainEvent<MarketplaceProductAddedPayload>({
      type: DomainEventType.MARKETPLACE_PRODUCT_ADDED,
      aggregateId: payload.productId,
      aggregateType: "MarketplaceProduct",
      payload,
      metadata,
    }),
  );
}

export async function publishMarketplaceOrder(
  payload: MarketplaceOrderPayload,
  metadata?: Record<string, unknown>,
): Promise<void> {
  const type =
    payload.status === "fulfilled"
      ? DomainEventType.MARKETPLACE_ORDER_FULFILLED
      : DomainEventType.MARKETPLACE_ORDER_PLACED;
  await eventBus.publish(
    createDomainEvent<MarketplaceOrderPayload>({
      type,
      aggregateId: payload.orderId,
      aggregateType: "MarketplaceOrder",
      payload,
      metadata,
    }),
  );
}
