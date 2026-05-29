/**
 * Skill Marketplace Types
 * -----------------------------------------------------------------------------
 * Types and interfaces for the skill marketplace module.
 */

export interface MarketplaceSkill {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  version: string;
  author: {
    id: string;
    name: string;
    verified: boolean;
  };
  pricing: {
    purchasePrice: number;
    rentalPrice: number;
    rentalPeriodDays: number;
    currency: string;
  };
  capabilities: {
    inputs: string[];
    outputs: string[];
    categories: string[];
    integrations: string[];
  };
  stats: {
    downloads: number;
    rentals: number;
    rating: number;
    reviews: number;
  };
  tier: "basic" | "intermediate" | "advanced" | "enterprise";
  status: "draft" | "pending_review" | "published" | "archived";
  createdAt: string;
  updatedAt: string;
}

export interface SkillReview {
  id: string;
  skillId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  pros: string[];
  cons: string[];
  createdAt: string;
}

export interface RentalSubscription {
  id: string;
  skillId: string;
  userId: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  status: "active" | "cancelled" | "expired" | "pending";
  lastBillingDate: string | null;
  nextBillingDate: string | null;
}

export interface RevenueShare {
  skillId: string;
  authorId: string;
  totalRevenue: number;
  totalSubscriptions: number;
  currentPeriodRevenue: number;
  payoutStatus: "pending" | "processing" | "paid";
  lastPayoutDate: string | null;
  nextPayoutDate: string | null;
}

export interface MarketplaceOrder {
  id: string;
  userId: string;
  skillId: string;
  type: "purchase" | "rental" | "subscription";
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "refunded";
  paymentMethod: string;
  createdAt: string;
  completedAt: string | null;
}

export interface CreatorRegistration {
  id: string;
  userId: string;
  displayName: string;
  bio: string;
  website: string | null;
  expertise: string[];
  verificationStatus: "pending" | "in_review" | "verified" | "rejected";
  payoutInfo: {
    bank: string;
    agency: string;
    account: string;
    accountType: "checking" | "savings";
    document: string;
  };
  createdAt: string;
}

export type SkillCategory =
  | "content"
  | "sales"
  | "marketing"
  | "analytics"
  | "automation"
  | "integration"
  | "strategy"
  | "i18n"
  | "finance"
  | "retention"
  | "governance"
  | "optimization"
  | "intelligence";

export interface MarketplaceSearchFilters {
  query: string;
  category: SkillCategory | null;
  tier: MarketplaceSkill["tier"] | null;
  priceMin: number | null;
  priceMax: number | null;
  sortBy: "popularity" | "rating" | "newest" | "price_asc" | "price_desc";
  page: number;
  pageSize: number;
}

export interface MarketplaceSearchResult {
  skills: MarketplaceSkill[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
