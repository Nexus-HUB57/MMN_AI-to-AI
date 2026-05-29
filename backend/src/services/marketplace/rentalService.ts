/**
 * Skill Rental Service
 * -----------------------------------------------------------------------------
 * Handles skill rental subscriptions and billing.
 */

import { randomUUID } from "node:crypto";
import { addDays, differenceInDays, format } from "date-fns";

import type { RentalSubscription } from "./types";

/**
 * Create a new rental subscription
 */
export async function createRentalSubscription(params: {
  userId: string;
  skillId: string;
  skillName: string;
  rentalPrice: number;
  autoRenew: boolean;
}): Promise<{
  success: boolean;
  subscription?: RentalSubscription;
  error?: string;
}> {
  const now = new Date();
  const endDate = addDays(now, 30);

  const subscription: RentalSubscription = {
    id: randomUUID(),
    skillId: params.skillId,
    userId: params.userId,
    startDate: now.toISOString(),
    endDate: endDate.toISOString(),
    autoRenew: params.autoRenew,
    status: "active",
    lastBillingDate: now.toISOString(),
    nextBillingDate: addDays(now, 30).toISOString(),
  };

  return {
    success: true,
    subscription,
  };
}

/**
 * Get active rentals for a user
 */
export async function getUserRentals(userId: string): Promise<RentalSubscription[]> {
  const mockRentals: RentalSubscription[] = [
    {
      id: "rent-001",
      skillId: "skill-001",
      userId,
      startDate: "2026-05-01T00:00:00Z",
      endDate: "2026-05-31T00:00:00Z",
      autoRenew: true,
      status: "active",
      lastBillingDate: "2026-05-01T00:00:00Z",
      nextBillingDate: "2026-05-31T00:00:00Z",
    },
  ];

  return mockRentals.filter((r) => r.userId === userId);
}

/**
 * Get rental by ID
 */
export async function getRentalById(rentalId: string): Promise<RentalSubscription | null> {
  return {
    id: rentalId,
    skillId: "skill-001",
    userId: "user-001",
    startDate: "2026-05-01T00:00:00Z",
    endDate: "2026-05-31T00:00:00Z",
    autoRenew: true,
    status: "active",
    lastBillingDate: "2026-05-01T00:00:00Z",
    nextBillingDate: "2026-05-31T00:00:00Z",
  };
}

/**
 * Cancel rental subscription
 */
export async function cancelRental(
  rentalId: string,
  cancelImmediately: boolean = false,
): Promise<{
  success: boolean;
  newEndDate?: string;
  error?: string;
}> {
  const rental = await getRentalById(rentalId);
  if (!rental) {
    return { success: false, error: "Rental not found" };
  }

  const endDate = cancelImmediately
    ? new Date().toISOString()
    : rental.endDate;

  return {
    success: true,
    newEndDate: endDate,
  };
}

/**
 * Renew rental subscription
 */
export async function renewRental(
  rentalId: string,
  additionalDays: number = 30,
): Promise<{
  success: boolean;
  newEndDate?: string;
  nextBillingDate?: string;
  error?: string;
}> {
  const rental = await getRentalById(rentalId);
  if (!rental) {
    return { success: false, error: "Rental not found" };
  }

  const currentEnd = new Date(rental.endDate);
  const newEndDate = addDays(currentEnd, additionalDays);
  const nextBilling = addDays(newEndDate, additionalDays);

  return {
    success: true,
    newEndDate: newEndDate.toISOString(),
    nextBillingDate: nextBilling.toISOString(),
  };
}

/**
 * Check and expire old rentals
 */
export async function expireRentals(): Promise<{
  expired: number;
  renewed: number;
  errors: number;
}> {
  const now = new Date();
  const summary = { expired: 0, renewed: 0, errors: 0 };

  // TODO: Implement actual database query
  console.info("[Rental] Checking for expired rentals");

  // Auto-renew logic would trigger next billing here
  // For non-auto-renew, set status to "expired"

  return summary;
}

/**
 * Get rental statistics
 */
export async function getRentalStats(
  userId: string,
): Promise<{
  activeCount: number;
  expiringIn7Days: number;
  totalSpent: number;
  daysUntilExpiry: number[];
}> {
  const rentals = await getUserRentals(userId);
  const now = new Date();

  let expiringIn7Days = 0;
  const daysUntilExpiry: number[] = [];

  for (const rental of rentals) {
    if (rental.status === "active") {
      const days = differenceInDays(new Date(rental.endDate), now);
      daysUntilExpiry.push(days);

      if (days <= 7 && days >= 0) {
        expiringIn7Days++;
      }
    }
  }

  return {
    activeCount: rentals.filter((r) => r.status === "active").length,
    expiringIn7Days,
    totalSpent: rentals.length * 497, // Placeholder calculation
    daysUntilExpiry,
  };
}

/**
 * Convert rental to purchase
 */
export async function convertRentalToPurchase(
  rentalId: string,
  purchaseDiscount: number = 0.3,
): Promise<{
  success: boolean;
  purchasePrice?: number;
  rentalCredit?: number;
  error?: string;
}> {
  const rental = await getRentalById(rentalId);
  if (!rental) {
    return { success: false, error: "Rental not found" };
  }

  // Calculate credit from rental payments made
  const rentalCredit = 149.10; // Example: 1 month rental credit
  const purchasePrice = 497 - rentalCredit * purchaseDiscount;

  return {
    success: true,
    purchasePrice: Math.round(purchasePrice * 100) / 100,
    rentalCredit,
  };
}
