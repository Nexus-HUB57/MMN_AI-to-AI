/**
 * Commission Engine — Nexus Affil'IA · IOAID
 *
 * Calculates all bonus types from the Career Plan (Plano de Carreira do Afiliado):
 *  #1 Revenda/Dropshipping — 100% resale profit
 *  #2 Bônus OnePack — fixed R$ per pack sold to NO downline
 *  #3 Bônus de Consumo — % of monthly activation volumes per NO level
 *  #4 Bônus N.O — fixed R$ when qualifying new orchestrators
 *  #5 Bônus Inspiration — % of ecosystem results (future)
 *  #6-9 Grafo, Corp, HARP'IA, Nexus (future / gamification)
 *
 * All monetary values are in **centavos** (integer) to avoid floating-point issues.
 */

import { Pool } from "pg";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface OnePackBonusRule {
  bonus_cents: number;
  seller_tier: string;
  pack_price_cents?: number;
}

export interface ConsumptionBonusTier {
  n: number;    // network level (1-5)
  pct: number;  // percentage (e.g. 3 = 3%)
}

export interface NOBonusRule {
  bonus_cents: number;
}

export interface CareerPlanConfig {
  onepack_bonus: Record<string, OnePackBonusRule>;
  consumption_bonus: Record<string, ConsumptionBonusTier[]>;
  no_bonus: Record<string, NOBonusRule>;
  inspiration_bonus?: Record<string, any>;
}

export interface MonthlyVolume {
  level: number;
  totalCents: number;
}

export interface BonusCalculationResult {
  bonus_type: string;
  amount_cents: number;
  description: string;
  breakdown?: any[];
}

// ---------------------------------------------------------------------------
// OnePack Bonus Calculation
// ---------------------------------------------------------------------------

/**
 * Calculate the OnePack bonus for a seller when they sell a specific pack.
 *
 * Rules from Plano de Carreira:
 * - Only activated affiliates (monthly activation) receive bonuses
 * - Seller can only sell packs <= their own qualification tier
 * - Bonus is a fixed R$ amount per pack sold
 *
 * @param sellerTier - The seller's career qualification (e.g. "aff_iii", "pred_i", "gen_i")
 * @param packSlug - The pack being sold (e.g. "A2II", "AG", "AO", "AA")
 * @param config - The career plan configuration from platform_settings
 * @param isActive - Whether the seller has active monthly activation
 * @returns Bonus in centavos
 */
export function calculateOnePackBonus(
  sellerTier: string,
  packSlug: string,
  config: CareerPlanConfig,
  isActive: boolean
): number {
  if (!isActive) return 0;

  const rule = config.onepack_bonus[packSlug];
  if (!rule) return 0;

  // Verify seller tier hierarchy — seller must be >= pack's required tier
  const tierOrder = [
    "aff_iii",
    "pred_i", "pred_ii", "pred_iii",
    "gen_i", "gen_ii", "gen_iii",
    "orch_i", "orch_ii", "orch_iii",
    "agentic_i", "agentic_ii", "agentic_iii",
  ];
  const sellerRank = tierOrder.indexOf(sellerTier);
  const packRank = tierOrder.indexOf(rule.seller_tier);
  if (sellerRank < 0 || packRank < 0) return 0;
  if (sellerRank < packRank) return 0; // Can't sell packs above qualification

  return rule.bonus_cents;
}

// ---------------------------------------------------------------------------
// Consumption Bonus Calculation
// ---------------------------------------------------------------------------

/**
 * Calculate the consumption bonus for an affiliate based on their tier
 * and the monthly activation volumes across their NO network levels.
 *
 * Rules from Plano de Carreira:
 * - Only Pred I+ (with monthly activation) qualify
 * - Each tier has specific % rates per network level
 * - Bonus = sum of (volume_at_level * pct_at_level) for each configured level
 *
 * @param sellerTier - The seller's career qualification
 * @param monthlyVolumes - Array of {level, totalCents} for each NO level
 * @param config - The career plan configuration
 * @param isActive - Whether the seller has active monthly activation
 * @returns Object with total bonus and per-level breakdown
 */
export function calculateConsumptionBonus(
  sellerTier: string,
  monthlyVolumes: MonthlyVolume[],
  config: CareerPlanConfig,
  isActive: boolean
): { total_cents: number; breakdown: Array<{level: number; volumeCents: number; pct: number; bonusCents: number}> } {
  const empty = { total_cents: 0, breakdown: [] };
  if (!isActive) return empty;

  const tierRules = config.consumption_bonus[sellerTier];
  if (!tierRules || tierRules.length === 0) return empty;

  let totalCents = 0;
  const breakdown: Array<{level: number; volumeCents: number; pct: number; bonusCents: number}> = [];

  for (const rule of tierRules) {
    const vol = monthlyVolumes.find(v => v.level === rule.n);
    const volumeCents = vol?.totalCents ?? 0;
    const bonusCents = Math.floor(volumeCents * rule.pct / 100);
    totalCents += bonusCents;
    breakdown.push({
      level: rule.n,
      volumeCents,
      pct: rule.pct,
      bonusCents,
    });
  }

  return { total_cents: totalCents, breakdown };
}

// ---------------------------------------------------------------------------
// N.O Bonus Calculation
// ---------------------------------------------------------------------------

/**
 * Calculate the N.O bonus when an orchestrator qualifies a new orchestrator.
 *
 * Rules from Plano de Carreira:
 * - Only Orchest I+ qualify
 * - Bonus depends on the QUALIFYING orchestrator's tier and the NEW member's tier
 * - e.g., Orch III qualifying Orch III = R$2000
 *
 * @param qualifierTier - The qualifying orchestrator's tier
 * @param newMemberTier - The newly qualified orchestrator's tier
 * @param config - The career plan configuration
 * @returns Bonus in centavos
 */
export function calculateNOBonus(
  qualifierTier: string,
  newMemberTier: string,
  config: CareerPlanConfig
): number {
  const key = `${qualifierTier}->${newMemberTier}`;
  const rule = config.no_bonus[key];
  return rule?.bonus_cents ?? 0;
}

// ---------------------------------------------------------------------------
// Tier hierarchy utilities
// ---------------------------------------------------------------------------

export const CAREER_TIERS = {
  // Agente Afiliado
  aff_i:     { category: "affiliate",  level: 1, label: "Agente Afiliado Nível I",     pack: "A2" },
  aff_ii:    { category: "affiliate",  level: 2, label: "Agente Afiliado Nível II",    pack: "A2" },
  aff_iii:   { category: "affiliate",  level: 3, label: "Agente Afiliado Nível III",   pack: "A2III" },
  // Agente Preditivo
  pred_i:    { category: "predictive", level: 1, label: "Agente Preditivo Nível I",    pack: "AG" },
  pred_ii:   { category: "predictive", level: 2, label: "Agente Preditivo Nível II",   pack: "AGII" },
  pred_iii:  { category: "predictive", level: 3, label: "Agente Preditivo Nível III",  pack: "AGIII" },
  // Agente Generativo
  gen_i:     { category: "generative", level: 1, label: "Agente Generativo Nível I",    pack: "AGN" },
  gen_ii:    { category: "generative", level: 2, label: "Agente Generativo Nível II",   pack: "AGNII" },
  gen_iii:   { category: "generative", level: 3, label: "Agente Generativo Nível III",  pack: "AGNIII" },
  // Agente Orquestrador
  orch_i:    { category: "orchestrator", level: 1, label: "Agente Orquestrador Nível I",   pack: "AO" },
  orch_ii:   { category: "orchestrator", level: 2, label: "Agente Orquestrador Nível II",  pack: "AOII" },
  orch_iii:  { category: "orchestrator", level: 3, label: "Agente Orquestrador Nível III", pack: "AOIII" },
  // Agente Agentic IA
  agentic_i:    { category: "agentic", level: 1, label: "Agente Agentic IA Nível I",    pack: "AA" },
  agentic_ii:   { category: "agentic", level: 2, label: "Agente Agentic IA Nível II",   pack: "AAII" },
  agentic_iii:  { category: "agentic", level: 3, label: "Agente Agentic IA Nível III",  pack: "AAIII" },
} as const;

export const TIER_ORDER = Object.keys(CAREER_TIERS);

export function getTierRank(tierKey: string): number {
  return TIER_ORDER.indexOf(tierKey);
}

export function canSellPack(sellerTier: string, packRequiredTier: string): boolean {
  return getTierRank(sellerTier) >= getTierRank(packRequiredTier);
}

// ---------------------------------------------------------------------------
// Pack Reference Data
// ---------------------------------------------------------------------------

export const PACKS: Record<string, { slug: string; name: string; price_cents: number; category: string; required_tier: string }> = {
  A2:     { slug: "A2",     name: "Pack A2 (Iniciação)",     price_cents: 1000,    category: "affiliate",   required_tier: "aff_i" },
  A2II:   { slug: "A2II",   name: "Pack A2II",               price_cents: 3000,    category: "affiliate",   required_tier: "aff_iii" },
  A2III:  { slug: "A2III",  name: "Pack A2III",              price_cents: 5000,    category: "affiliate",   required_tier: "aff_iii" },
  AG:     { slug: "AG",     name: "Pack AG",                 price_cents: 25000,   category: "predictive",  required_tier: "pred_i" },
  AGII:   { slug: "AGII",   name: "Pack AGII",               price_cents: 50000,   category: "predictive",  required_tier: "pred_ii" },
  AGIII:  { slug: "AGIII",  name: "Pack AGIII",              price_cents: 75000,   category: "predictive",  required_tier: "pred_iii" },
  AGN:    { slug: "AGN",    name: "Pack AGN",                price_cents: 100000,  category: "generative",  required_tier: "gen_i" },
  AGNII:  { slug: "AGNII",  name: "Pack AGNII",              price_cents: 200000,  category: "generative",  required_tier: "gen_ii" },
  AGNIII: { slug: "AGNIII", name: "Pack AGNIII",             price_cents: 300000,  category: "generative",  required_tier: "gen_iii" },
  AO:     { slug: "AO",     name: "Pack AO",                 price_cents: 500000,  category: "orchestrator", required_tier: "orch_i" },
  AOII:   { slug: "AOII",   name: "Pack AOII",               price_cents: 1000000, category: "orchestrator", required_tier: "orch_ii" },
  AOIII:  { slug: "AOIII",  name: "Pack AOIII",              price_cents: 2000000, category: "orchestrator", required_tier: "orch_iii" },
  AA:     { slug: "AA",     name: "Pack AA",                 price_cents: 5000000, category: "agentic",     required_tier: "agentic_i" },
  AAII:   { slug: "AAII",   name: "Pack AAII",               price_cents: 10000000, category: "agentic",     required_tier: "agentic_ii" },
  AAIII:  { slug: "AAIII",  name: "Pack AAIII",              price_cents: 20000000, category: "agentic",     required_tier: "agentic_iii" },
};

// ---------------------------------------------------------------------------
// N.O Bonus Reference Table (from Plano de Carreira)
// ---------------------------------------------------------------------------

export const NO_BONUS_TABLE: Record<string, NOBonusRule> = {
  "orch_i->orch_i":     { bonus_cents: 50000 },    // R$500
  "orch_ii->orch_i":    { bonus_cents: 50000 },    // R$500
  "orch_ii->orch_ii":   { bonus_cents: 100000 },   // R$1000
  "orch_iii->orch_i":   { bonus_cents: 50000 },    // R$500
  "orch_iii->orch_ii":  { bonus_cents: 100000 },   // R$1000
  "orch_iii->orch_iii": { bonus_cents: 200000 },   // R$2000
};
