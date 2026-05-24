/**
 * Affiliate domain types — Fase Beta continuation.
 *
 * Tipos compartilhados entre `service.ts`, `repository.ts` e `router.ts` para
 * o domínio de afiliados. Mantidos em paralelo às tabelas Drizzle para
 * preservar contratos atuais sem reabrir o schema legado.
 */

export const DEFAULT_AFFILIATE_PLAN = "affiliate";

export const DEFAULT_AFFILIATE_CONTENT_STRATEGY = {
  platforms: ["instagram", "facebook", "whatsapp"],
  postingFrequency: "daily",
  tone: "professional",
  targetAudience: "general",
} as const;

export interface AffiliateRegistrationContext {
  userId: number;
  userName: string | null;
  userEmail: string | null;
  sponsorCode: string;
  commissionPercentage: number;
}

export interface AffiliateRegistrationResult {
  affiliateId: number;
  affiliateCode: string;
  sponsorAffiliateId: number;
  sponsorUserId: number;
  status: string;
  createdAgent: boolean;
}

export interface AffiliateStatsSnapshot {
  total: number;
  pending: number;
}
