// =============================================================================
// Nexus Marketplace · Catálogo oficial sincronizado com docs/planning/Age.txt
// e docs/planning/Plano de Carreira Peer.
//
// O sistema possui 15 níveis no PD/SCC:
//   - Afiliado:        I (A²)   · II (A²II)   · III (A²III)
//   - SCC Preditivo:   I (AG)   · II (AGII)   · III (AGIII)
//   - SCC Generativo:  I (AGN)  · II (AGNII)  · III (AGNIII)
//   - SCC Orquestrador: I (AO)  · II (AOII)   · III (AOIII)
//   - IA Agêntica SCC+: I (AA)  · II (AAII)   · III (AAIII)
//
// Regras críticas:
//   1) Apenas o Pack A² (Afiliado I) ATIVA o Agente IA via OpenClaw.
//      Todos os packs subsequentes apenas evoluem este mesmo agente.
//   2) Após cadastro, só o Pack A² fica disponível. Os demais são bloqueados
//      até que XP, diretos e pack anterior sejam concluídos integralmente.
//   3) Skills do agente: 15 Básico (Nível I) + 15 Intermediário (Nível II) +
//      15 Avançado (Nível III). Cada pack libera uma quantidade exata.
//      A sincronização com o agente segue a metodologia OpenClaw.
// =============================================================================

export type CareerStage =
  | "affiliate"
  | "predictive"
  | "generative"
  | "orchestrator"
  | "agentic";

export type CareerLevelKey =
  | "prospect"
  | "affiliate_i"
  | "affiliate_ii"
  | "affiliate_iii"
  | "predictive_i"
  | "predictive_ii"
  | "predictive_iii"
  | "generative_i"
  | "generative_ii"
  | "generative_iii"
  | "orchestrator_i"
  | "orchestrator_ii"
  | "orchestrator_iii"
  | "agentic_i"
  | "agentic_ii"
  | "agentic_iii";

export type CatalogAccess = "active" | "available" | "locked";

export type PromptTier = "basico" | "intermediario" | "avancado" | "pleno";

export interface SkillBreakdown {
  basico: number;
  intermediario: number;
  avancado: number;
}

export interface NexusPack {
  slug: string;
  order: number;
  name: string;
  shortName: string;
  stage: CareerStage;
  description: string;
  priceCents: number;
  xpGranted: number;
  levelGranted: CareerLevelKey;
  promptTier: PromptTier;
  /**
   * Skills cumulativas que ficam liberadas no agente após este pack.
   * Já consideram tudo o que o pack anterior trouxe.
   */
  skills: SkillBreakdown;
  ebooks: number;
  preuPacks: number;
  sisuPacksA2: number;
  badge?: string;
  requirements: {
    minXp: number;
    minDirectReferrals: number;
    requiredPackSlugs: string[];
  };
  highlights: string[];
  bringsAgent?: boolean;
}

export interface EbookBundle {
  slug: string;
  name: string;
  description: string;
  ebookCount: number;
  resalePriceLabel: string;
  unlockPackSlug: string;
}

export interface SkillBundle {
  slug: string;
  name: string;
  description: string;
  skillSummary: string;
  unlockPackSlug: string;
  level: "basico" | "intermediario" | "avancado";
  highlights: string[];
}

export interface NexusSkill {
  slug: string;
  name: string;
  description: string;
  category: string;
  level: "basico" | "intermediario" | "avancado";
  /** Ordem no catálogo do nível (1..15). Usado para determinar liberação. */
  order: number;
}

export interface MarketplaceEbook {
  slug: string;
  order: number;
  title: string;
  subtitle: string;
  description: string;
  costCents: number;
  resalePriceCents: number;
  pages: number;
  category: string;
  coverGradient: string;
  htmlPath: string;
  pdfPath: string;
  highlights: string[];
  unlockPackSlug: string;
}

export interface ExternalMarketplaceChannel {
  slug: string;
  name: string;
  description: string;
  status: "ativo" | "em_breve" | "manutencao";
  color: string;
  icon: string;
  externalUrl?: string;
  internalUrl?: string;
}

export type PixKeyType = "cpf" | "email" | "telefone" | "aleatoria";

export interface MarketplaceProfile {
  version: number;
  userId?: string;
  userName?: string;
  userEmail?: string;
  cpf?: string;
  pixKey?: string;
  pixType?: PixKeyType;
  phone?: string;
  autoWithdraw?: boolean;
  currentXp: number;
  directReferrals: number;
  currentLevel: CareerLevelKey;
  activePackSlugs: string[];
  /**
   * Sub-contas SiSu pertencentes ao mesmo CPF — vinculadas ao titular.
   * Liberadas conforme o pack avança (sisuPacksA2).
   */
  sisuSubAccounts: SisuSubAccount[];
  /**
   * Saldo em BTC alocado via Binance custódia (lock 90 dias).
   */
  btcAllocated: number;
  btcLockUntil?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SisuSubAccount {
  id: string;
  packSlug: string;
  label: string;
  createdAt: string;
  status: "ativa" | "pausada" | "em_setup";
  monthlyResultCents: number;
  directs: number;
  level: CareerLevelKey;
}

export interface OperationalStockItem {
  id: string;
  type: "pack" | "ebooks" | "preu";
  title: string;
  description: string;
  quantity: number;
  badge: string;
  sourcePackSlug: string;
  availableForAgent: boolean;
}

export interface ProgressSnapshot {
  currentPack: NexusPack | null;
  nextPack: NexusPack | null;
  xpCurrent: number;
  xpTarget: number;
  xpProgress: number;
  directCurrent: number;
  directTarget: number;
  directProgress: number;
}

export const MARKETPLACE_PROFILE_STORAGE_KEY = "mmn-ai-marketplace-profile";

// -----------------------------------------------------------------------------
// Career labels
// -----------------------------------------------------------------------------
export const CAREER_LEVELS: Record<CareerLevelKey, { label: string; subtitle: string }> = {
  prospect:        { label: "Pré-ativação",                 subtitle: "Cadastro concluído, aguardando ativação do Pack A²." },
  affiliate_i:     { label: "Agente Afiliado Nível I",      subtitle: "Entrada oficial com Pack A² e Agente IA básico." },
  affiliate_ii:    { label: "Agente Afiliado Nível II",     subtitle: "Upgrade A²II — expande N.O com diretos qualificados." },
  affiliate_iii:   { label: "Agente Afiliado Nível III",    subtitle: "Upgrade A²III — destaque na rede direta." },
  predictive_i:    { label: "SCC Preditivo Nível I",        subtitle: "Pack AG — entrada profissional multilevel." },
  predictive_ii:   { label: "SCC Preditivo Nível II",       subtitle: "Pack AGII — operação preditiva expandida." },
  predictive_iii:  { label: "SCC Preditivo Nível III",      subtitle: "Pack AGIII — consolidação preditiva." },
  generative_i:    { label: "SCC Generativo Nível I",       subtitle: "Pack AGN — nível profissional generativo." },
  generative_ii:   { label: "SCC Generativo Nível II",      subtitle: "Pack AGNII — operação generativa avançada." },
  generative_iii:  { label: "SCC Generativo Nível III",     subtitle: "Pack AGNIII — generativo C-level inicial." },
  orchestrator_i:  { label: "SCC Orquestrador Nível I",     subtitle: "Pack AO — C-level inicial e Sandbox Nexus." },
  orchestrator_ii: { label: "SCC Orquestrador Nível II",    subtitle: "Pack AOII — operação corporativa orquestrada." },
  orchestrator_iii:{ label: "SCC Orquestrador Nível III",   subtitle: "Pack AOIII — orquestração plena." },
  agentic_i:       { label: "IA Agêntica SCC+ Nível I",     subtitle: "Pack AA — nível CEO, Hall de Sócios." },
  agentic_ii:      { label: "IA Agêntica SCC+ Nível II",    subtitle: "Pack AAII — royalties, dividendos, TPR." },
  agentic_iii:     { label: "IA Agêntica SCC+ Nível III",   subtitle: "Pack AAIII — acesso pleno e patrocínio Harp'IA." },
};

// -----------------------------------------------------------------------------
// 15 Packs do PD/SCC
// -----------------------------------------------------------------------------
export const NEXUS_PACKS: NexusPack[] = [
  // ---------------- AFILIADO ----------------
  {
    slug: "pack-a2", order: 1, stage: "affiliate",
    name: 'Pack Agente Afiliado "A²"', shortName: "A²",
    description:
      "Pack inicial. Único que ATIVA o Agente IA via OpenClaw. Liberado automaticamente após o cadastro.",
    priceCents: 1000, xpGranted: 1000, levelGranted: "affiliate_i",
    promptTier: "basico",
    skills: { basico: 2, intermediario: 0, avancado: 0 },
    ebooks: 10, preuPacks: 0, sisuPacksA2: 0,
    badge: "Liberado no cadastro", bringsAgent: true,
    requirements: { minXp: 0, minDirectReferrals: 0, requiredPackSlugs: [] },
    highlights: [
      "1 Agente IA (Prompt Básico) — ativação OpenClaw",
      "2 Skills Nível I",
      "10 e-books para revenda a R$ 0,99",
      "Acesso BackOffice + BeYour Banker",
    ],
  },
  {
    slug: "pack-a2ii", order: 2, stage: "affiliate",
    name: 'Pack Agente Afiliado "A²II"', shortName: "A²II",
    description: "Upgrade A²II — expande N.O e dobra o catálogo comercial.",
    priceCents: 3000, xpGranted: 5000, levelGranted: "affiliate_ii",
    promptTier: "basico",
    skills: { basico: 3, intermediario: 0, avancado: 0 },
    ebooks: 30, preuPacks: 0, sisuPacksA2: 1,
    badge: "Upgrade",
    requirements: { minXp: 5000, minDirectReferrals: 2, requiredPackSlugs: ["pack-a2"] },
    highlights: [
      "Upgrade do Agente IA para 3 Skills Nível I",
      "30 e-books · 1 Pack A² SiSu",
      "10% comissão 1º nível N.O · paridade R$1 = 1 XP",
    ],
  },
  {
    slug: "pack-a2iii", order: 3, stage: "affiliate",
    name: 'Pack Agente Afiliado "A²III"', shortName: "A²III",
    description: "Upgrade A²III — destaque do afiliado com rede direta ampliada.",
    priceCents: 5000, xpGranted: 10000, levelGranted: "affiliate_iii",
    promptTier: "basico",
    skills: { basico: 5, intermediario: 0, avancado: 0 },
    ebooks: 50, preuPacks: 0, sisuPacksA2: 2,
    badge: "Upgrade",
    requirements: { minXp: 10000, minDirectReferrals: 5, requiredPackSlugs: ["pack-a2ii"] },
    highlights: [
      "5 Skills Nível I · 50 e-books · 2 Packs A² SiSu",
      "Bônus OnePack começa a contar (R$ 2,50 por A²II do N.O)",
      "Indicação direta + Grafo+IA expandido",
    ],
  },
  // ---------------- PREDITIVO ----------------
  {
    slug: "pack-ag", order: 4, stage: "predictive",
    name: 'Pack Agente Preditivo "AG"', shortName: "AG",
    description: "Pack AG — entrada profissional preditiva e marketing digital.",
    priceCents: 25000, xpGranted: 65000, levelGranted: "predictive_i",
    promptTier: "intermediario",
    skills: { basico: 5, intermediario: 0, avancado: 0 },
    ebooks: 0, preuPacks: 10, sisuPacksA2: 5,
    badge: "Profissional",
    requirements: { minXp: 65000, minDirectReferrals: 10, requiredPackSlugs: ["pack-a2iii"] },
    highlights: [
      "Prompt Intermediário + 5 Skills Nível I",
      "10 PREU (250 e-books) + 5 Packs A² SiSu",
      "BeYour Banker Silver · comissão 1º (10%) e 2º nível (5%)",
    ],
  },
  {
    slug: "pack-agii", order: 5, stage: "predictive",
    name: 'Pack Agente Preditivo "AGII"', shortName: "AGII",
    description: "Pack AGII — operação preditiva expandida.",
    priceCents: 50000, xpGranted: 210000, levelGranted: "predictive_ii",
    promptTier: "intermediario",
    skills: { basico: 5, intermediario: 2, avancado: 0 },
    ebooks: 0, preuPacks: 20, sisuPacksA2: 10,
    badge: "Escala preditiva",
    requirements: { minXp: 210000, minDirectReferrals: 20, requiredPackSlugs: ["pack-ag"] },
    highlights: [
      "5 Skills Nível I + 2 Skills Nível II",
      "20 PREU (500 e-books) + 10 Packs A² SiSu",
      "Sorteios Zetta · 5% no 3º nível N.O",
    ],
  },
  {
    slug: "pack-agiii", order: 6, stage: "predictive",
    name: 'Pack Agente Preditivo "AGIII"', shortName: "AGIII",
    description: "Pack AGIII — consolidação preditiva e maior margem de marketplace.",
    priceCents: 75000, xpGranted: 315000, levelGranted: "predictive_iii",
    promptTier: "intermediario",
    skills: { basico: 5, intermediario: 5, avancado: 0 },
    ebooks: 0, preuPacks: 30, sisuPacksA2: 20,
    badge: "Consolidação",
    requirements: { minXp: 315000, minDirectReferrals: 30, requiredPackSlugs: ["pack-agii"] },
    highlights: [
      "5 Skills Nível I + 5 Skills Nível II",
      "30 PREU (750 e-books) + 20 Packs A² SiSu + 1 Pack AG SiSu",
      "75% lucro Marketplace · 10% comissão 2º nível N.O",
    ],
  },
  // ---------------- GENERATIVO ----------------
  {
    slug: "pack-agn", order: 7, stage: "generative",
    name: 'Pack Agente Generativo "AGN"', shortName: "AGN",
    description: "Pack AGN — entrada profissional generativa.",
    priceCents: 100000, xpGranted: 850000, levelGranted: "generative_i",
    promptTier: "intermediario",
    skills: { basico: 7, intermediario: 5, avancado: 0 },
    ebooks: 100, preuPacks: 40, sisuPacksA2: 30,
    badge: "Profissional Generativo",
    requirements: { minXp: 850000, minDirectReferrals: 10, requiredPackSlugs: ["pack-agiii"] },
    highlights: [
      "7 Skills Nível I + 5 Skills Nível II",
      "40 PREU (1.000 e-books) + 30 Packs A² SiSu",
      "BeYour Banker Gold · 15% comissão 1º nível · Sorteios VIP",
    ],
  },
  {
    slug: "pack-agnii", order: 8, stage: "generative",
    name: 'Pack Agente Generativo "AGNII"', shortName: "AGNII",
    description: "Pack AGNII — operação generativa avançada.",
    priceCents: 200000, xpGranted: 2700000, levelGranted: "generative_ii",
    promptTier: "intermediario",
    skills: { basico: 7, intermediario: 7, avancado: 0 },
    ebooks: 2000, preuPacks: 80, sisuPacksA2: 40,
    badge: "Avançado Generativo",
    requirements: { minXp: 2700000, minDirectReferrals: 20, requiredPackSlugs: ["pack-agn"] },
    highlights: [
      "7 Skills Nível I + 7 Skills Nível II",
      "80 PREU (2.000 e-books) + 40 Packs A² SiSu",
      "Comissão até 4º nível N.O · Sorteios VIP até R$ 100.000",
    ],
  },
  {
    slug: "pack-agniii", order: 9, stage: "generative",
    name: 'Pack Agente Generativo "AGNIII"', shortName: "AGNIII",
    description: "Pack AGNIII — generativo C-level inicial.",
    priceCents: 300000, xpGranted: 4050000, levelGranted: "generative_iii",
    promptTier: "intermediario",
    skills: { basico: 7, intermediario: 7, avancado: 2 },
    ebooks: 3000, preuPacks: 120, sisuPacksA2: 50,
    badge: "C-level Inicial",
    requirements: { minXp: 4050000, minDirectReferrals: 30, requiredPackSlugs: ["pack-agnii"] },
    highlights: [
      "7 Skills Nível I + 7 Skills Nível II + 2 Skills Nível III",
      "120 PREU (3.000 e-books) + 50 Packs A² + 1 Pack AGN SiSu",
      "15% (1º/2º nível) e 10% (3º nível) de comissão",
    ],
  },
  // ---------------- ORQUESTRADOR ----------------
  {
    slug: "pack-ao", order: 10, stage: "orchestrator",
    name: 'Pack Agente Orquestrador "AO"', shortName: "AO",
    description: "Pack AO — C-level inicial com Sandbox Nexus.",
    priceCents: 500000, xpGranted: 5500000, levelGranted: "orchestrator_i",
    promptTier: "avancado",
    skills: { basico: 3, intermediario: 1, avancado: 0 },
    ebooks: 5000, preuPacks: 200, sisuPacksA2: 100,
    badge: "C-level",
    requirements: { minXp: 5500000, minDirectReferrals: 10, requiredPackSlugs: ["pack-agniii"] },
    highlights: [
      "Prompt Avançado + 3 Skills Nível I + 1 Skill Nível II",
      "200 PREU (5.000 e-books) + 100 Packs A² SiSu",
      "BeYour Banker Black · Nexus Academ'IA Nível I + Sandbox Nexus",
    ],
  },
  {
    slug: "pack-aoii", order: 11, stage: "orchestrator",
    name: 'Pack Agente Orquestrador "AOII"', shortName: "AOII",
    description: "Pack AOII — operação corporativa orquestrada.",
    priceCents: 1000000, xpGranted: 11000000, levelGranted: "orchestrator_ii",
    promptTier: "avancado",
    skills: { basico: 5, intermediario: 3, avancado: 0 },
    ebooks: 10000, preuPacks: 400, sisuPacksA2: 200,
    badge: "Corporativo",
    requirements: { minXp: 11000000, minDirectReferrals: 20, requiredPackSlugs: ["pack-ao"] },
    highlights: [
      "Prompt Avançado + 5 Skills Nível I + 3 Skills Nível II",
      "400 PREU (10.000 e-books) + 200 Packs A² SiSu",
      "10 Títulos de Capitalização (R$ 10.000) · Comissão até 5º nível (10%)",
    ],
  },
  {
    slug: "pack-aoiii", order: 12, stage: "orchestrator",
    name: 'Pack Agente Orquestrador "AOIII"', shortName: "AOIII",
    description: "Pack AOIII — orquestração plena.",
    priceCents: 2000000, xpGranted: 17000000, levelGranted: "orchestrator_iii",
    promptTier: "avancado",
    skills: { basico: 7, intermediario: 5, avancado: 2 },
    ebooks: 20000, preuPacks: 800, sisuPacksA2: 300,
    badge: "Orquestração Plena",
    requirements: { minXp: 17000000, minDirectReferrals: 30, requiredPackSlugs: ["pack-aoii"] },
    highlights: [
      "Prompt Avançado + 7 Skills Nível I + 5 Skills Nível II + 2 Skills Nível III",
      "800 PREU (20.000 e-books) + 300 Packs A² + 1 Pack AO SiSu",
      "20 Títulos de Capitalização · 20% comissão até 3º nível",
    ],
  },
  // ---------------- IA AGÊNTICA ----------------
  {
    slug: "pack-aa", order: 13, stage: "agentic",
    name: 'Pack IA Agêntica "AA"', shortName: "AA",
    description: "Pack AA — nível CEO. Entrada no Hall de Sócios Nexus.",
    priceCents: 5000000, xpGranted: 35000000, levelGranted: "agentic_i",
    promptTier: "avancado",
    skills: { basico: 7, intermediario: 7, avancado: 5 },
    ebooks: 50000, preuPacks: 2000, sisuPacksA2: 500,
    badge: "CEO",
    requirements: { minXp: 35000000, minDirectReferrals: 10, requiredPackSlugs: ["pack-aoiii"] },
    highlights: [
      "7 Skills Nível I + 7 Nível II + 5 Skills Nível III",
      "2.000 PREU (50.000 e-books) + 500 Packs A² SiSu",
      "BeYour Banker Investments · 100 TPR · Hall de Sócios Nexus",
    ],
  },
  {
    slug: "pack-aaii", order: 14, stage: "agentic",
    name: 'Pack IA Agêntica "AAII"', shortName: "AAII",
    description: "Pack AAII — royalties, dividendos e TPR ampliados.",
    priceCents: 10000000, xpGranted: 70000000, levelGranted: "agentic_ii",
    promptTier: "avancado",
    skills: { basico: 7, intermediario: 7, avancado: 7 },
    ebooks: 100000, preuPacks: 4000, sisuPacksA2: 1000,
    badge: "Royalties",
    requirements: { minXp: 70000000, minDirectReferrals: 20, requiredPackSlugs: ["pack-aa"] },
    highlights: [
      "7 Skills Nível I + 7 Nível II + 7 Skills Nível III",
      "4.000 PREU (100.000 e-books) + 1.000 Packs A² SiSu",
      "250 TPR · Royalties mensais · 40 Títulos Impactos",
    ],
  },
  {
    slug: "pack-aaiii", order: 15, stage: "agentic",
    name: 'Pack IA Agêntica "AAIII"', shortName: "AAIII",
    description: "Pack AAIII — acesso pleno e patrocínio Harp'IA até R$ 500.000.",
    priceCents: 20000000, xpGranted: 110000000, levelGranted: "agentic_iii",
    promptTier: "pleno",
    skills: { basico: 15, intermediario: 15, avancado: 15 },
    ebooks: 200000, preuPacks: 6000, sisuPacksA2: 2000,
    badge: "Pleno · Hall N",
    requirements: { minXp: 110000000, minDirectReferrals: 30, requiredPackSlugs: ["pack-aaii"] },
    highlights: [
      "Acesso PLENO ao Prompt Básico + Intermediário + Avançado",
      "6.000 PREU (200.000 e-books) + 2.000 Packs A² SiSu",
      "500 TPR · Royalties até R$ 500.000 · Hall N + Patrocínio Harp'IA",
    ],
  },
];

// -----------------------------------------------------------------------------
// 45 Skills (15 + 15 + 15) — OpenClaw sync
// -----------------------------------------------------------------------------
function range(n: number) { return Array.from({ length: n }, (_, i) => i + 1); }

export const SKILL_LIBRARY: NexusSkill[] = [
  // -------- Básico (Nível I) --------
  ...[
    { name: "Prospecção em WhatsApp", category: "Mensageria" },
    { name: "Postagem automática Instagram", category: "Social Media" },
    { name: "Postagem automática Facebook", category: "Social Media" },
    { name: "Atendimento ao cliente", category: "CX" },
    { name: "Copywriting básico", category: "Conteúdo" },
    { name: "Resposta automática DM", category: "Mensageria" },
    { name: "Agendamento de posts", category: "Social Media" },
    { name: "Pesquisa de tendências", category: "Inteligência" },
    { name: "Geração de imagens IA", category: "Conteúdo" },
    { name: "Análise de métricas básicas", category: "Analytics" },
    { name: "Captação de leads orgânica", category: "Aquisição" },
    { name: "Funil de vendas simples", category: "Vendas" },
    { name: "Gestão de catálogo de e-books", category: "Marketplace" },
    { name: "Onboarding de novos diretos", category: "Rede" },
    { name: "Acompanhamento de XP/Nível", category: "Carreira" },
  ].map((skill, i) => ({
    slug: `skill-basico-${i + 1}`,
    name: skill.name,
    description: `Skill operacional do agente — categoria ${skill.category}.`,
    category: skill.category,
    level: "basico" as const,
    order: i + 1,
  })),
  // -------- Intermediário (Nível II) --------
  ...[
    { name: "Tráfego pago Meta Ads", category: "Performance" },
    { name: "Tráfego pago Google Ads", category: "Performance" },
    { name: "Tráfego pago TikTok Ads", category: "Performance" },
    { name: "Lançamentos digitais", category: "Vendas" },
    { name: "RAG documental (base própria)", category: "Inteligência" },
    { name: "Automação multi-canal (n8n/Zap)", category: "Automação" },
    { name: "CRM avançado e lead scoring", category: "CRM" },
    { name: "Webinars automatizados", category: "Vendas" },
    { name: "Pesquisa preditiva de demanda", category: "Inteligência" },
    { name: "Dropshipping cross-marketplace", category: "Marketplace" },
    { name: "Copywriting persuasivo (PNL)", category: "Conteúdo" },
    { name: "Editor de vídeo curto IA", category: "Conteúdo" },
    { name: "Recomendação personalizada", category: "Analytics" },
    { name: "Comissões e splits programáveis", category: "Financeiro" },
    { name: "Otimização de funil multi-etapa", category: "Vendas" },
  ].map((skill, i) => ({
    slug: `skill-intermediario-${i + 1}`,
    name: skill.name,
    description: `Skill avançada com prompt intermediário — categoria ${skill.category}.`,
    category: skill.category,
    level: "intermediario" as const,
    order: i + 1,
  })),
  // -------- Avançado (Nível III) --------
  ...[
    { name: "Orquestração multi-agente (LangGraph)", category: "Orquestração" },
    { name: "Auto-prompting reflexivo", category: "Orquestração" },
    { name: "Negociação corporativa B2B", category: "B2B" },
    { name: "Análise de risco financeiro IA", category: "Financeiro" },
    { name: "Marketing M&A de holdings", category: "Estratégia" },
    { name: "Gestão de royalties e TPR", category: "Financeiro" },
    { name: "Modelagem de holding multi-startup", category: "Estratégia" },
    { name: "Sandbox Nexus (deploy de startups)", category: "Plataforma" },
    { name: "Forecasting Zettascale", category: "Inteligência" },
    { name: "Auto-retraining via OpenClaw", category: "OpenClaw" },
    { name: "Compliance / LGPD / EU AI Act", category: "Governança" },
    { name: "Capital allocation BTC custódia", category: "Financeiro" },
    { name: "Hall N (gestão de socios)", category: "Governança" },
    { name: "Patrocínio Harp'IA (incubadora)", category: "Estratégia" },
    { name: "Pleno acesso prompt unificado", category: "OpenClaw" },
  ].map((skill, i) => ({
    slug: `skill-avancado-${i + 1}`,
    name: skill.name,
    description: `Skill de elite — prompt avançado / pleno — categoria ${skill.category}.`,
    category: skill.category,
    level: "avancado" as const,
    order: i + 1,
  })),
];

// -----------------------------------------------------------------------------
// Bundles legados (apenas para compatibilidade da UI antiga)
// -----------------------------------------------------------------------------
export const EBOOK_BUNDLES: EbookBundle[] = NEXUS_PACKS.filter((p) => p.ebooks > 0 || p.preuPacks > 0).map((pack) => ({
  slug: `ebooks-${pack.slug}`,
  name: `Biblioteca ${pack.shortName}`,
  description: `E-books vinculados ao ${pack.name}.`,
  ebookCount: pack.ebooks + pack.preuPacks * 25,
  resalePriceLabel: "R$ 0,99 por e-book",
  unlockPackSlug: pack.slug,
}));

export const SKILL_BUNDLES: SkillBundle[] = NEXUS_PACKS.map((pack) => ({
  slug: `skills-${pack.slug}`,
  name: `Skills · ${pack.shortName}`,
  description: `Pacote de skills liberadas no ${pack.name}.`,
  skillSummary: formatSkillSummary(pack.skills, pack.promptTier),
  unlockPackSlug: pack.slug,
  level: pack.promptTier === "basico" ? "basico" : pack.promptTier === "intermediario" ? "intermediario" : "avancado",
  highlights: pack.highlights,
}));

export function formatSkillSummary(skills: SkillBreakdown, tier: PromptTier) {
  const parts: string[] = [];
  if (skills.basico) parts.push(`${skills.basico} Skills Nível I`);
  if (skills.intermediario) parts.push(`${skills.intermediario} Skills Nível II`);
  if (skills.avancado) parts.push(`${skills.avancado} Skills Nível III`);
  const tierLabel =
    tier === "pleno" ? "Acesso PLENO (Básico+Intermediário+Avançado)"
    : tier === "avancado" ? "Prompt Avançado"
    : tier === "intermediario" ? "Prompt Intermediário"
    : "Prompt Básico";
  return `${tierLabel} · ${parts.join(" + ") || "Sem novas skills"}`;
}

// -----------------------------------------------------------------------------
// 5 e-books iniciais Marketplace (custo R$0,50 / revenda R$1,00)
// -----------------------------------------------------------------------------
export const MARKETPLACE_EBOOKS: MarketplaceEbook[] = [
  { slug: "ebook-fundamentos-da-ia",      order: 1, title: "Fundamentos da Inteligência Artificial", subtitle: "Do Sonho à Realidade",
    description: "24 páginas com história da IA, ML, Deep Learning, ética e aplicações reais.",
    costCents: 50, resalePriceCents: 100, pages: 24, category: "Fundamentos",
    coverGradient: "from-[#0b2b3b] to-[#1a4a6f]",
    htmlPath: "/ebooks/01-fundamentos-da-ia.html", pdfPath: "/ebooks/pdf/01-fundamentos-da-ia.pdf",
    highlights: ["História da IA de 1950 a hoje","IA Fraca x Forte","ML e Deep Learning","Glossário ilustrado"],
    unlockPackSlug: "pack-a2" },
  { slug: "ebook-modelos-de-linguagem",   order: 2, title: "A Revolução dos Modelos de Linguagem", subtitle: "ChatGPT, Gemini, Llama",
    description: "22 páginas sobre LLMs, Transformer, engenharia de prompt, RAG, alucinações e agentes.",
    costCents: 50, resalePriceCents: 100, pages: 22, category: "LLMs",
    coverGradient: "from-[#2b3b0b] to-[#4a6f1a]",
    htmlPath: "/ebooks/02-modelos-de-linguagem.html", pdfPath: "/ebooks/pdf/02-modelos-de-linguagem.pdf",
    highlights: ["Arquitetura Transformer","GPT/Claude/Llama/Gemini","Zero-shot e CoT","RAG e alucinações"],
    unlockPackSlug: "pack-a2" },
  { slug: "ebook-visao-computacional",    order: 3, title: "Visão Computacional", subtitle: "Quando as máquinas aprendem a enxergar",
    description: "CNNs, YOLO, segmentação, GANs, deepfakes, carros autônomos e medicina.",
    costCents: 50, resalePriceCents: 100, pages: 20, category: "Visão",
    coverGradient: "from-[#3b0b2b] to-[#6f1a4a]",
    htmlPath: "/ebooks/03-visao-computacional.html", pdfPath: "/ebooks/pdf/03-visao-computacional.pdf",
    highlights: ["Como computador 'vê'","CNNs e segmentação","GANs e difusão","Casos Tesla, FaceID"],
    unlockPackSlug: "pack-a2" },
  { slug: "ebook-ia-generativa-criativa", order: 4, title: "IA Generativa Criativa", subtitle: "Texto, imagem, áudio e vídeo",
    description: "Ferramentas e workflows criativos para monetização no Marketplace Nexus.",
    costCents: 50, resalePriceCents: 100, pages: 20, category: "Generativa",
    coverGradient: "from-[#1b2b3b] to-[#228b6f]",
    htmlPath: "/ebooks/04-ia-generativa-criativa.html", pdfPath: "/ebooks/pdf/04-ia-generativa-criativa.pdf",
    highlights: ["Texto/imagem/áudio/vídeo","Ferramentas profissionais","Workflows criativos","Licenciamento"],
    unlockPackSlug: "pack-a2" },
  { slug: "ebook-etica-e-futuro-da-ia",   order: 5, title: "Ética e Futuro da IA", subtitle: "Riscos, regulação e AGI",
    description: "Vieses, deepfakes, EU AI Act, alinhamento e cenários futuros.",
    costCents: 50, resalePriceCents: 100, pages: 20, category: "Ética",
    coverGradient: "from-[#3b1b1b] to-[#8b2c2c]",
    htmlPath: "/ebooks/05-etica-e-futuro-da-ia.html", pdfPath: "/ebooks/pdf/05-etica-e-futuro-da-ia.pdf",
    highlights: ["Vieses algorítmicos","EU AI Act","AGI e alinhamento","Cenários futuros"],
    unlockPackSlug: "pack-a2" },
];

// -----------------------------------------------------------------------------
// Canais externos do Marketplace
// -----------------------------------------------------------------------------
export const EXTERNAL_MARKETPLACES: ExternalMarketplaceChannel[] = [
  { slug: "nexus-storie", name: "Marketplace Nexus Storie",
    description: "Vitrine oficial dos produtos exclusivos do ecossistema Nexus.",
    status: "ativo", color: "#00E5FF", icon: "ShoppingBag",
    internalUrl: "/marketplaces/ebooks" },
  { slug: "hotmart", name: "Hotmart",
    description: "Plataforma global de infoprodutos e dropshipping digital.",
    status: "ativo", color: "#EF4E23", icon: "Flame",
    externalUrl: "https://app-vlc.hotmart.com" },
  { slug: "shopee", name: "Shopee",
    description: "Marketplace varejo Brasil/SE Ásia — produtos físicos + afiliados.",
    status: "ativo", color: "#EE4D2D", icon: "ShoppingCart",
    externalUrl: "https://affiliate.shopee.com.br" },
  { slug: "mercado-livre", name: "Mercado Livre",
    description: "Marketplace líder LatAm — dropshipping e revenda.",
    status: "ativo", color: "#FFE600", icon: "Tag",
    externalUrl: "https://www.mercadolivre.com.br" },
];

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------
export function formatCurrency(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function createDefaultMarketplaceProfile(user?: {
  id?: string; name?: string; email?: string; cpf?: string;
}): MarketplaceProfile {
  const now = new Date().toISOString();
  return {
    version: 2,
    userId: user?.id,
    userName: user?.name,
    userEmail: user?.email,
    cpf: user?.cpf,
    pixKey: undefined,
    currentXp: 0,
    directReferrals: 0,
    currentLevel: "prospect",
    activePackSlugs: [],
    sisuSubAccounts: [],
    btcAllocated: 0,
    createdAt: now,
    updatedAt: now,
  };
}

function isSameMarketplaceUser(current: MarketplaceProfile, incoming?: { id?: string; email?: string }) {
  if (!incoming?.id && !incoming?.email) return true;
  const currentId = current.userId?.trim();
  const currentEmail = current.userEmail?.trim().toLowerCase();
  const incomingId = incoming.id?.trim();
  const incomingEmail = incoming.email?.trim().toLowerCase();
  if (!currentId && !currentEmail) return true;
  if (incomingId && currentId && incomingId === currentId) return true;
  if (incomingEmail && currentEmail && incomingEmail === currentEmail) return true;
  return false;
}

export function loadMarketplaceProfile(): MarketplaceProfile {
  if (typeof window === "undefined") return createDefaultMarketplaceProfile();
  try {
    const raw = window.localStorage.getItem(MARKETPLACE_PROFILE_STORAGE_KEY);
    if (!raw) return createDefaultMarketplaceProfile();
    const parsed = JSON.parse(raw) as MarketplaceProfile;
    return {
      ...createDefaultMarketplaceProfile(),
      ...parsed,
      activePackSlugs: Array.isArray(parsed.activePackSlugs) ? parsed.activePackSlugs : [],
      sisuSubAccounts: Array.isArray(parsed.sisuSubAccounts) ? parsed.sisuSubAccounts : [],
    };
  } catch {
    return createDefaultMarketplaceProfile();
  }
}

export function saveMarketplaceProfile(profile: MarketplaceProfile) {
  if (typeof window === "undefined") return profile;
  const next = { ...profile, updatedAt: new Date().toISOString() };
  window.localStorage.setItem(MARKETPLACE_PROFILE_STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function ensureAffiliateMarketplaceProfile(user?: { id?: string; name?: string; email?: string; cpf?: string }) {
  const current = loadMarketplaceProfile();
  if (!isSameMarketplaceUser(current, user)) {
    return saveMarketplaceProfile(createDefaultMarketplaceProfile(user));
  }
  return saveMarketplaceProfile({
    ...current,
    userId: user?.id || current.userId,
    userName: user?.name || current.userName,
    userEmail: user?.email || current.userEmail,
    cpf: user?.cpf || current.cpf,
  });
}

export function updateMarketplaceProfile(patch: Partial<MarketplaceProfile>) {
  return saveMarketplaceProfile({ ...loadMarketplaceProfile(), ...patch });
}

export function getPackBySlug(slug: string) {
  return NEXUS_PACKS.find((p) => p.slug === slug) ?? null;
}

export function getHighestActivePack(profile: MarketplaceProfile) {
  return NEXUS_PACKS.filter((p) => profile.activePackSlugs.includes(p.slug)).sort((a, b) => b.order - a.order)[0] ?? null;
}

export function hasPackOrHigher(profile: MarketplaceProfile, packSlug: string) {
  const target = getPackBySlug(packSlug);
  const highest = getHighestActivePack(profile);
  if (!target || !highest) return false;
  return highest.order >= target.order;
}

export function getPackAccess(profile: MarketplaceProfile, pack: NexusPack): {
  status: CatalogAccess; missingCriteria: string[];
} {
  if (profile.activePackSlugs.includes(pack.slug)) return { status: "active", missingCriteria: [] };
  if (pack.slug === "pack-a2") return { status: "available", missingCriteria: [] };
  const missing: string[] = [];
  if (pack.requirements.requiredPackSlugs.some((slug) => !profile.activePackSlugs.includes(slug))) {
    missing.push(`Ativar plano anterior (${pack.requirements.requiredPackSlugs.map((s) => getPackBySlug(s)?.shortName ?? s).join(", ")})`);
  }
  if (profile.currentXp < pack.requirements.minXp) missing.push(`Alcançar ${pack.requirements.minXp.toLocaleString("pt-BR")} XP`);
  if (profile.directReferrals < pack.requirements.minDirectReferrals) missing.push(`Concluir ${pack.requirements.minDirectReferrals} diretos qualificados`);
  return { status: missing.length === 0 ? "available" : "locked", missingCriteria: missing };
}

export function activatePack(profile: MarketplaceProfile, packSlug: string) {
  const pack = getPackBySlug(packSlug);
  if (!pack) return profile;
  const access = getPackAccess(profile, pack);
  if (access.status === "locked") return profile;
  const nextActive = Array.from(new Set([...profile.activePackSlugs, pack.slug]));
  // SiSu: cria sub-contas se pack libera novos sisuPacksA2
  const additionalSisu = Math.max(0, pack.sisuPacksA2 - profile.sisuSubAccounts.filter((s) => s.packSlug === "pack-a2").length);
  const newSisu = Array.from({ length: additionalSisu }, (_, i) => ({
    id: `${pack.slug}-sisu-${Date.now()}-${i + 1}`,
    packSlug: "pack-a2",
    label: `Sub-conta A² · SiSu #${profile.sisuSubAccounts.length + i + 1}`,
    createdAt: new Date().toISOString(),
    status: "em_setup" as const,
    monthlyResultCents: 0,
    directs: 0,
    level: "affiliate_i" as const,
  }));
  return saveMarketplaceProfile({
    ...profile,
    currentLevel: pack.levelGranted,
    currentXp: Math.max(profile.currentXp, pack.xpGranted),
    directReferrals: Math.max(profile.directReferrals, pack.requirements.minDirectReferrals),
    activePackSlugs: nextActive,
    sisuSubAccounts: [...profile.sisuSubAccounts, ...newSisu],
  });
}

export function getProgressSnapshot(profile: MarketplaceProfile): ProgressSnapshot {
  const currentPack = getHighestActivePack(profile);
  const nextPack = currentPack
    ? NEXUS_PACKS.find((p) => p.order === currentPack.order + 1) ?? null
    : NEXUS_PACKS[0] ?? null;
  const xpTarget = nextPack?.requirements.minXp ?? (profile.currentXp || 1);
  const directTarget = nextPack?.requirements.minDirectReferrals ?? (profile.directReferrals || 1);
  return {
    currentPack, nextPack,
    xpCurrent: profile.currentXp,
    xpTarget,
    xpProgress: nextPack ? Math.min(100, Math.round((profile.currentXp / Math.max(1, xpTarget)) * 100)) : 100,
    directCurrent: profile.directReferrals,
    directTarget,
    directProgress: nextPack ? Math.min(100, Math.round((profile.directReferrals / Math.max(1, directTarget)) * 100)) : 100,
  };
}

export function getUnlockedEbookBundles(profile: MarketplaceProfile) {
  return EBOOK_BUNDLES.map((bundle) => ({
    ...bundle,
    status: hasPackOrHigher(profile, bundle.unlockPackSlug) ? ("active" as const) : ("locked" as const),
    unlockPack: getPackBySlug(bundle.unlockPackSlug),
  }));
}

export function getUnlockedSkillBundles(profile: MarketplaceProfile) {
  return SKILL_BUNDLES.map((bundle) => ({
    ...bundle,
    status: hasPackOrHigher(profile, bundle.unlockPackSlug) ? ("active" as const) : ("locked" as const),
    unlockPack: getPackBySlug(bundle.unlockPackSlug),
  }));
}

export function getOperationalInventory(profile: MarketplaceProfile): OperationalStockItem[] {
  const activePacks = NEXUS_PACKS.filter((pack) => profile.activePackSlugs.includes(pack.slug)).sort(
    (a, b) => a.order - b.order,
  );

  const packItems: OperationalStockItem[] = activePacks.map((pack) => ({
    id: `stock-pack-${pack.slug}`,
    type: "pack",
    title: pack.name,
    description: `Pack adquirido via ativação mensal. O agente IA usa este plano para habilitar vendas, skills e rotinas operacionais.`,
    quantity: 1,
    badge: pack.shortName,
    sourcePackSlug: pack.slug,
    availableForAgent: true,
  }));

  const productItems: OperationalStockItem[] = activePacks.flatMap((pack) => {
    const items: OperationalStockItem[] = [];

    if (pack.ebooks > 0) {
      items.push({
        id: `stock-ebooks-${pack.slug}`,
        type: "ebooks",
        title: `Biblioteca comercial ${pack.shortName}`,
        description: `${pack.ebooks.toLocaleString("pt-BR")} e-books liberados para revenda direta pelo agente IA.`,
        quantity: pack.ebooks,
        badge: "E-books",
        sourcePackSlug: pack.slug,
        availableForAgent: true,
      });
    }

    if (pack.preuPacks > 0) {
      items.push({
        id: `stock-preu-${pack.slug}`,
        type: "preu",
        title: `Pacotes PREU ${pack.shortName}`,
        description: `${pack.preuPacks.toLocaleString("pt-BR")} pacotes PREU disponíveis para operação comercial do agente.`,
        quantity: pack.preuPacks,
        badge: "PREU",
        sourcePackSlug: pack.slug,
        availableForAgent: true,
      });
    }

    return items;
  });

  return [...packItems, ...productItems];
}

export interface MarketplaceEbookState extends MarketplaceEbook {
  status: CatalogAccess;
}

export function getMarketplaceEbooks(profile: MarketplaceProfile): MarketplaceEbookState[] {
  return MARKETPLACE_EBOOKS.map((ebook) => ({
    ...ebook,
    status: hasPackOrHigher(profile, ebook.unlockPackSlug) ? ("active" as const) : ("locked" as const),
  }));
}

/**
 * Retorna o conjunto cumulativo de skills do agente, baseado no pack mais alto ativo.
 * É exatamente o que o painel /agents e /skills devem mostrar.
 */
export function getAgentSkillEntitlement(profile: MarketplaceProfile): {
  promptTier: PromptTier;
  unlockedCount: SkillBreakdown;
  totalCount: SkillBreakdown;
  skills: Array<NexusSkill & { unlocked: boolean }>;
} {
  const highest = getHighestActivePack(profile);
  const unlocked: SkillBreakdown = highest?.skills ?? { basico: 0, intermediario: 0, avancado: 0 };
  const total: SkillBreakdown = { basico: 15, intermediario: 15, avancado: 15 };
  return {
    promptTier: highest?.promptTier ?? "basico",
    unlockedCount: unlocked,
    totalCount: total,
    skills: SKILL_LIBRARY.map((skill) => ({
      ...skill,
      unlocked: skill.order <= (unlocked[skill.level] ?? 0),
    })),
  };
}

export function getLevelLabel(level: CareerLevelKey) {
  return CAREER_LEVELS[level]?.label ?? level;
}
export function getLevelSubtitle(level: CareerLevelKey) {
  return CAREER_LEVELS[level]?.subtitle ?? "";
}

// -----------------------------------------------------------------------------
// BTC custody (Binance) — conversão BRL→BTC com lock de 90 dias
// -----------------------------------------------------------------------------
export const BTC_LOCK_DAYS = 90;

export function allocateBrlToBtc(profile: MarketplaceProfile, brlCents: number, btcPriceBrl: number) {
  if (brlCents <= 0 || btcPriceBrl <= 0) return profile;
  const btcAmount = (brlCents / 100) / btcPriceBrl;
  const lockUntil = new Date();
  lockUntil.setDate(lockUntil.getDate() + BTC_LOCK_DAYS);
  return saveMarketplaceProfile({
    ...profile,
    btcAllocated: Number((profile.btcAllocated + btcAmount).toFixed(8)),
    btcLockUntil: lockUntil.toISOString(),
  });
}

export function isBtcLocked(profile: MarketplaceProfile) {
  if (!profile.btcLockUntil) return false;
  return new Date(profile.btcLockUntil) > new Date();
}
