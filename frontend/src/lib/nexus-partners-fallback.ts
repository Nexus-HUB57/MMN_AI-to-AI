export type CatalogPlan = {
  id: string;
  shortName: string;
  fullName: string;
  tagline: string;
  priceCents: number | null;
  billingCycle: "monthly" | "yearly" | "on_request";
  commissionRate: number;
  commissionModel: {
    cadence: "monthly_recurring";
    eligibility: string;
    byTerm: Record<number, number>;
  };
  features: string[];
  capacity: {
    aiAgents: number;
    ebooks: number;
    skills: number;
    referralLevels: number;
  };
  storefront: {
    subscriptionOnly: true;
    defaultTermMonths: number;
    availableTermsMonths: number[];
    licenseLabel: string;
    ctaLabel: string;
  };
  governance: {
    requiresAdminContact: boolean;
    highValue: boolean;
  };
};

export type LocalSubscriptionRecord = {
  id: string;
  planId: string;
  status: string;
  termMonths: number;
  createdAt: string;
  updatedAt: string;
  source: "local-fallback";
};

export type PartnerTier = "silver" | "gold" | "platinum" | "diamond";
export type PartnerStatus = "active" | "inactive" | "suspended";

export type FallbackPartner = {
  id: number;
  userId: number;
  tier: PartnerTier;
  referralCode: string;
  referralCount: number;
  totalVolume: number;
  commissionBalance: number;
  status: PartnerStatus;
  benefits: string[];
  createdAt: string;
  updatedAt: string;
};

export type FallbackPartnerStats = {
  totalPartners: number;
  activePartners: number;
  inactivePartners: number;
  totalVolume: number;
  totalCommissions: number;
  averageTier: PartnerTier;
  tierDistribution: Record<PartnerTier, number>;
  topPerformers: Array<{
    id: number;
    tier: PartnerTier;
    volume: number;
    referralCount: number;
  }>;
  growthRate: number;
  averageVolumePerPartner: number;
};

export type FallbackPartnersList = {
  partners: FallbackPartner[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type FallbackPartnerBenefits = {
  partnerId: number;
  tier: PartnerTier;
  volumeMultiplier: number;
  networkBonus: number;
  referralBonus: number;
  totalCommissionRate: number;
  currentBenefits: string[];
};

export type FallbackTierConfig = {
  tier: PartnerTier;
  label: string;
  minVolume: number;
  commissionRate: number;
  benefits: string[];
};

const SUBSCRIPTIONS_STORAGE_KEY = "nexus-partners-local-subscriptions-v1";
const PARTNERS_STORAGE_KEY = "nexus-partners-local-partners-v1";

const LICENSE_TERMS = [6, 12, 18, 24, 30, 36, 48];
const COMMISSION_ELIGIBILITY =
  "Afiliados que indicarem, comercializarem e efetivarem contratos ativos do Nexus Partners Pack";

export const FALLBACK_SUBSCRIPTION_PLANS: CatalogPlan[] = [
  {
    id: "nexus-start",
    shortName: "Nexus Partners Start",
    fullName: "Nexus Partners · Start",
    tagline: "Plano inicial do Nexus Partners Pack, contratado por assinatura como produto independente",
    priceCents: 10000,
    billingCycle: "monthly",
    commissionRate: 0.05,
    commissionModel: {
      cadence: "monthly_recurring",
      eligibility: COMMISSION_ELIGIBILITY,
      byTerm: { 6: 0.05, 12: 0.06, 18: 0.07, 24: 0.08, 30: 0.09, 36: 0.1, 48: 0.1 },
    },
    features: [
      "Rastreamento ponta a ponta de parceiros, creators e afiliados",
      "1 agente IA operacional ativado",
      "8 skills comerciais com replay consultável",
      "Dashboard comercial com trilha auditável",
    ],
    capacity: { aiAgents: 1, ebooks: 10, skills: 8, referralLevels: 2 },
    storefront: {
      subscriptionOnly: true,
      defaultTermMonths: 12,
      availableTermsMonths: LICENSE_TERMS,
      licenseLabel: "Assinatura mensal com contratação entre 6 e 48 meses",
      ctaLabel: "Assinar Start",
    },
    governance: { requiresAdminContact: false, highValue: false },
  },
  {
    id: "nexus-growth",
    shortName: "Nexus Partners Growth",
    fullName: "Nexus Partners · Growth",
    tagline: "Plano de escala operacional com analytics, governança e expansão multicanal",
    priceCents: 25000,
    billingCycle: "monthly",
    commissionRate: 0.05,
    commissionModel: {
      cadence: "monthly_recurring",
      eligibility: COMMISSION_ELIGIBILITY,
      byTerm: { 6: 0.05, 12: 0.06, 18: 0.07, 24: 0.08, 30: 0.09, 36: 0.1, 48: 0.1 },
    },
    features: [
      "Comissionamento dinâmico com regras customizáveis",
      "ROI por canal e LTV por parceiro em tempo real",
      "Governança de aprovações e operação assistida por IA",
      "Biblioteca operacional ampliada para acelerar implantação",
    ],
    capacity: { aiAgents: 3, ebooks: 250, skills: 8, referralLevels: 5 },
    storefront: {
      subscriptionOnly: true,
      defaultTermMonths: 12,
      availableTermsMonths: LICENSE_TERMS,
      licenseLabel: "Assinatura mensal disponível em 6, 12, 18, 24, 30, 36 e 48 meses",
      ctaLabel: "Assinar Growth",
    },
    governance: { requiresAdminContact: false, highValue: false },
  },
  {
    id: "nexus-enterprise",
    shortName: "Nexus Partners Enterprise",
    fullName: "Nexus Partners · Enterprise",
    tagline: "Plano enterprise sob consulta para desenho dedicado, governança ampliada e integração sob demanda",
    priceCents: null,
    billingCycle: "on_request",
    commissionRate: 0.07,
    commissionModel: {
      cadence: "monthly_recurring",
      eligibility: COMMISSION_ELIGIBILITY,
      byTerm: { 6: 0.07, 12: 0.08, 18: 0.09, 24: 0.1, 30: 0.11, 36: 0.15, 48: 0.15 },
    },
    features: [
      "Governança comercial granular enterprise",
      "Desenho dedicado da operação e onboarding consultivo",
      "Acesso expandido à operação IA e integrações sob demanda",
      "Suporte estratégico para expansão de canais, parceiros e squads",
    ],
    capacity: { aiAgents: 10, ebooks: 1000, skills: 20, referralLevels: 10 },
    storefront: {
      subscriptionOnly: true,
      defaultTermMonths: 24,
      availableTermsMonths: LICENSE_TERMS,
      licenseLabel: "Contrato enterprise sob consulta com janela entre 6 e 48 meses",
      ctaLabel: "Solicitar proposta",
    },
    governance: { requiresAdminContact: true, highValue: true },
  },
];

export const FALLBACK_TIER_CONFIGS: FallbackTierConfig[] = [
  {
    tier: "silver",
    label: "Silver",
    minVolume: 0,
    commissionRate: 0.05,
    benefits: ["dashboard_basic", "reports_weekly", "email_support"],
  },
  {
    tier: "gold",
    label: "Gold",
    minVolume: 5000,
    commissionRate: 0.08,
    benefits: ["dashboard_advanced", "reports_daily", "priority_support", "marketing_materials"],
  },
  {
    tier: "platinum",
    label: "Platinum",
    minVolume: 20000,
    commissionRate: 0.12,
    benefits: ["dashboard_advanced", "reports_realtime", "priority_support", "marketing_materials", "api_access", "custom_integrations"],
  },
  {
    tier: "diamond",
    label: "Diamond",
    minVolume: 100000,
    commissionRate: 0.15,
    benefits: ["all_features", "dedicated_account_manager", "custom_reporting", "early_access", "beta_features", "volume_discounts"],
  },
];

const DEFAULT_PARTNERS: FallbackPartner[] = [
  {
    id: 1001,
    userId: 501,
    tier: "silver",
    referralCode: "NEXUS-SILVER-A1B2",
    referralCount: 4,
    totalVolume: 1250,
    commissionBalance: 62.5,
    status: "active",
    benefits: ["dashboard_basic", "reports_weekly", "email_support"],
    createdAt: "2026-01-12T10:00:00.000Z",
    updatedAt: "2026-05-20T10:00:00.000Z",
  },
  {
    id: 1002,
    userId: 502,
    tier: "gold",
    referralCode: "NEXUS-GOLD-C3D4",
    referralCount: 28,
    totalVolume: 12400,
    commissionBalance: 992,
    status: "active",
    benefits: ["dashboard_advanced", "reports_daily", "priority_support", "marketing_materials"],
    createdAt: "2025-11-04T08:00:00.000Z",
    updatedAt: "2026-05-25T08:00:00.000Z",
  },
  {
    id: 1003,
    userId: 503,
    tier: "platinum",
    referralCode: "NEXUS-PLATINUM-E5F6",
    referralCount: 87,
    totalVolume: 41300,
    commissionBalance: 4956,
    status: "active",
    benefits: ["dashboard_advanced", "reports_realtime", "priority_support", "marketing_materials", "api_access", "custom_integrations"],
    createdAt: "2025-08-19T12:00:00.000Z",
    updatedAt: "2026-05-28T12:00:00.000Z",
  },
  {
    id: 1004,
    userId: 504,
    tier: "diamond",
    referralCode: "NEXUS-DIAMOND-G7H8",
    referralCount: 312,
    totalVolume: 187000,
    commissionBalance: 28050,
    status: "active",
    benefits: ["all_features", "dedicated_account_manager", "custom_reporting", "early_access", "beta_features", "volume_discounts"],
    createdAt: "2025-03-07T09:00:00.000Z",
    updatedAt: "2026-05-29T09:00:00.000Z",
  },
];

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function loadStoredPartners() {
  if (!canUseStorage()) return DEFAULT_PARTNERS;
  const parsed = safeParse<FallbackPartner[]>(window.localStorage.getItem(PARTNERS_STORAGE_KEY), DEFAULT_PARTNERS);
  if (!parsed.length) {
    window.localStorage.setItem(PARTNERS_STORAGE_KEY, JSON.stringify(DEFAULT_PARTNERS));
    return DEFAULT_PARTNERS;
  }
  return parsed;
}

function saveStoredPartners(partners: FallbackPartner[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(PARTNERS_STORAGE_KEY, JSON.stringify(partners));
}

function loadStoredSubscriptions() {
  if (!canUseStorage()) return [] as LocalSubscriptionRecord[];
  return safeParse<LocalSubscriptionRecord[]>(window.localStorage.getItem(SUBSCRIPTIONS_STORAGE_KEY), []);
}

function saveStoredSubscriptions(items: LocalSubscriptionRecord[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(SUBSCRIPTIONS_STORAGE_KEY, JSON.stringify(items));
}

function getTierConfig(tier: PartnerTier) {
  return FALLBACK_TIER_CONFIGS.find((config) => config.tier === tier) ?? FALLBACK_TIER_CONFIGS[0];
}

export function getFallbackSubscriptionCatalog() {
  return { plans: FALLBACK_SUBSCRIPTION_PLANS };
}

export function listLocalSubscriptions() {
  return loadStoredSubscriptions();
}

export function createLocalSubscription(plan: CatalogPlan, termMonths: number): LocalSubscriptionRecord {
  const now = new Date().toISOString();
  const next: LocalSubscriptionRecord = {
    id: `local_sub_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    planId: plan.id,
    termMonths,
    status: plan.priceCents == null || plan.governance.requiresAdminContact ? "proposal_requested" : "pending_checkout",
    createdAt: now,
    updatedAt: now,
    source: "local-fallback",
  };
  const items = [next, ...loadStoredSubscriptions().filter((item) => item.planId !== plan.id)];
  saveStoredSubscriptions(items);
  return next;
}

export function listFallbackTierConfigs() {
  return FALLBACK_TIER_CONFIGS;
}

export function listFallbackPartners(params: {
  tier?: string;
  status?: string;
  search?: string;
  page: number;
  limit: number;
}): FallbackPartnersList {
  const search = params.search?.trim().toLowerCase() ?? "";
  const filtered = loadStoredPartners().filter((partner) => {
    const tierMatch = !params.tier || partner.tier === params.tier;
    const statusMatch = !params.status || partner.status === params.status;
    const searchMatch =
      !search ||
      partner.referralCode.toLowerCase().includes(search) ||
      String(partner.id).includes(search) ||
      String(partner.userId).includes(search);
    return tierMatch && statusMatch && searchMatch;
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / params.limit));
  const page = Math.min(Math.max(1, params.page), totalPages);
  const start = (page - 1) * params.limit;

  return {
    partners: filtered.slice(start, start + params.limit),
    page,
    limit: params.limit,
    total,
    totalPages,
  };
}

export function getFallbackPartner(id: number) {
  return loadStoredPartners().find((partner) => partner.id === id) ?? null;
}

export function createFallbackPartner(input: { userId: number; tier: string }) {
  const partners = loadStoredPartners();
  const nextId = partners.reduce((max, partner) => Math.max(max, partner.id), 1000) + 1;
  const tier = (["silver", "gold", "platinum", "diamond"] as const).includes(input.tier as PartnerTier)
    ? (input.tier as PartnerTier)
    : "silver";
  const config = getTierConfig(tier);
  const now = new Date().toISOString();
  const next: FallbackPartner = {
    id: nextId,
    userId: input.userId,
    tier,
    referralCode: `NEXUS-${tier.toUpperCase()}-${String(nextId).slice(-4)}`,
    referralCount: 0,
    totalVolume: 0,
    commissionBalance: 0,
    status: "active",
    benefits: [...config.benefits],
    createdAt: now,
    updatedAt: now,
  };
  saveStoredPartners([next, ...partners]);
  return next;
}

export function getFallbackPartnerStats(): FallbackPartnerStats {
  const partners = loadStoredPartners();
  const totalVolume = partners.reduce((acc, partner) => acc + partner.totalVolume, 0);
  const totalCommissions = partners.reduce((acc, partner) => acc + partner.commissionBalance, 0);
  const activePartners = partners.filter((partner) => partner.status === "active").length;
  const inactivePartners = partners.length - activePartners;
  const tierDistribution: Record<PartnerTier, number> = {
    silver: 0,
    gold: 0,
    platinum: 0,
    diamond: 0,
  };

  partners.forEach((partner) => {
    tierDistribution[partner.tier] += 1;
  });

  const averageTier = (Object.entries(tierDistribution) as Array<[PartnerTier, number]>)
    .sort((a, b) => b[1] - a[1])[0]?.[0] ?? "silver";

  const topPerformers = [...partners]
    .sort((a, b) => b.totalVolume - a.totalVolume)
    .slice(0, 10)
    .map((partner) => ({
      id: partner.id,
      tier: partner.tier,
      volume: partner.totalVolume,
      referralCount: partner.referralCount,
    }));

  const baseline = partners.length * 1000;
  const growthRate = totalVolume > 0 && baseline > 0 ? Math.round(((totalVolume - baseline) / baseline) * 10000) / 100 : 0;

  return {
    totalPartners: partners.length,
    activePartners,
    inactivePartners,
    totalVolume,
    totalCommissions,
    averageTier,
    tierDistribution,
    topPerformers,
    growthRate,
    averageVolumePerPartner: partners.length ? totalVolume / partners.length : 0,
  };
}

export function calculateFallbackPartnerBenefits(partnerId: number): FallbackPartnerBenefits | null {
  const partner = getFallbackPartner(partnerId);
  if (!partner) return null;

  const tierConfig = getTierConfig(partner.tier);
  const volumeMultiplier = 1 + Math.min(1, Math.floor(Math.max(0, partner.totalVolume - tierConfig.minVolume) / 10000) * 0.05);
  const networkBonus = partner.referralCount > 0 ? Math.min(0.05, Math.floor(partner.referralCount / 10) * 0.002) : 0;
  const referralBonus = partner.referralCount >= 100 ? 0.15 : partner.referralCount >= 50 ? 0.1 : partner.referralCount >= 10 ? 0.05 : 0.02;

  return {
    partnerId,
    tier: partner.tier,
    volumeMultiplier,
    networkBonus,
    referralBonus,
    totalCommissionRate: (tierConfig.commissionRate + networkBonus + referralBonus) * volumeMultiplier,
    currentBenefits: partner.benefits,
  };
}
