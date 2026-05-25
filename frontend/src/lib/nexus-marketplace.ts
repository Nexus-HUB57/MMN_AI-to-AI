export type CareerLevelKey =
  | "prospect"
  | "affiliate_i"
  | "affiliate_ii"
  | "affiliate_iii"
  | "predictive_i"
  | "predictive_ii";

export type CatalogAccess = "active" | "available" | "locked";

export interface NexusPack {
  slug: string;
  order: number;
  name: string;
  shortName: string;
  description: string;
  priceCents: number;
  xpGranted: number;
  levelGranted: CareerLevelKey;
  badge?: string;
  requirements: {
    minXp: number;
    minDirectReferrals: number;
    requiredPackSlugs: string[];
  };
  highlights: string[];
}

export interface EbookBundle {
  slug: string;
  name: string;
  description: string;
  ebookCount: number;
  resalePriceLabel: string;
  unlockPackSlug: string;
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

export interface SkillBundle {
  slug: string;
  name: string;
  description: string;
  skillSummary: string;
  unlockPackSlug: string;
  highlights: string[];
}

export interface MarketplaceProfile {
  version: number;
  userId?: string;
  userName?: string;
  userEmail?: string;
  currentXp: number;
  directReferrals: number;
  currentLevel: CareerLevelKey;
  activePackSlugs: string[];
  createdAt: string;
  updatedAt: string;
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

export const CAREER_LEVELS: Record<CareerLevelKey, { label: string; subtitle: string }> = {
  prospect: {
    label: "Pré-ativação",
    subtitle: "Usuário cadastrado aguardando ativação do primeiro pack.",
  },
  affiliate_i: {
    label: "Agente Afiliado Nível I",
    subtitle: "Entrada oficial no ecossistema com vendas diretas e Pack A².",
  },
  affiliate_ii: {
    label: "Agente Afiliado Nível II",
    subtitle: "Expansão do N.O com 2 diretos e upgrade A²II.",
  },
  affiliate_iii: {
    label: "Agente Afiliado Nível III",
    subtitle: "Escala da rede direta com 5 diretos e upgrade A²III.",
  },
  predictive_i: {
    label: "Agente Preditivo Nível I",
    subtitle: "Entrada na formação multilevel com Pack AG.",
  },
  predictive_ii: {
    label: "Agente Preditivo Nível II",
    subtitle: "Operação avançada de marketing digital com Pack AGII.",
  },
};

export const NEXUS_PACKS: NexusPack[] = [
  {
    slug: "pack-a2",
    order: 1,
    name: 'Pack Agente Afiliado "A²"',
    shortName: 'A²',
    description:
      "Pack inicial liberado após o cadastro. É a única ativação disponível para novos afiliados até que os critérios de carreira e XP sejam concluídos.",
    priceCents: 1000,
    xpGranted: 1000,
    levelGranted: "affiliate_i",
    badge: "Liberado no cadastro",
    requirements: {
      minXp: 0,
      minDirectReferrals: 0,
      requiredPackSlugs: [],
    },
    highlights: [
      "1 Agente IA com Prompt Básico",
      "2 Skills Nível I",
      "10 e-books para revenda a R$ 0,99",
      "Acesso ao BackOffice do Agente Afiliado",
      "Conta BeYour Banker para bônus e comissões",
    ],
  },
  {
    slug: "pack-a2ii",
    order: 2,
    name: 'Pack Agente Afiliado "A²II"',
    shortName: 'A²II',
    description:
      "Upgrade do afiliado para iniciar o primeiro nível do Networking Operacional com ganho em cascata e maior biblioteca comercial.",
    priceCents: 3000,
    xpGranted: 3000,
    levelGranted: "affiliate_ii",
    badge: "Upgrade de plano",
    requirements: {
      minXp: 3000,
      minDirectReferrals: 2,
      requiredPackSlugs: ["pack-a2"],
    },
    highlights: [
      "Upgrade do agente para 3 Skills Nível I",
      "30 e-books para revenda",
      "+ 1 Pack PNE A²",
      "10% sobre o 1º nível do N.O",
      "Paridade de vendas R$ 1 = 1 XP",
    ],
  },
  {
    slug: "pack-a2iii",
    order: 3,
    name: 'Pack Agente Afiliado "A²III"',
    shortName: 'A²III',
    description:
      "Upgrade de destaque do afiliado, ampliando o kit comercial, a força do agente e a capacidade de escala da rede direta.",
    priceCents: 5000,
    xpGranted: 6000,
    levelGranted: "affiliate_iii",
    badge: "Upgrade de plano",
    requirements: {
      minXp: 6000,
      minDirectReferrals: 5,
      requiredPackSlugs: ["pack-a2ii"],
    },
    highlights: [
      "Upgrade do agente para 5 Skills Nível I",
      "50 e-books para revenda",
      "+ 2 Packs PNE A²",
      "Indicação direta equivalente ao valor do Pack A²",
      "Maior participação em sorteios oficiais e metas Meta+IA",
    ],
  },
  {
    slug: "pack-ag",
    order: 4,
    name: 'Pack Agente Gerativo "AG"',
    shortName: 'AG',
    description:
      "Primeiro pack profissional do ciclo preditivo. Liberação exclusiva por upgrade após cumprimento integral dos critérios de XP e rede qualificada.",
    priceCents: 25000,
    xpGranted: 65000,
    levelGranted: "predictive_i",
    badge: "Profissional",
    requirements: {
      minXp: 65000,
      minDirectReferrals: 10,
      requiredPackSlugs: ["pack-a2iii"],
    },
    highlights: [
      "250 e-books exclusivos (10 PREU x25)",
      "Prompt intermediário com 5 Skills Nível I",
      "Conta BeYour Banker Silver",
      "+ 5 Packs A² como PNE",
      "Comissões multilevel de 1º e 2º nível",
    ],
  },
  {
    slug: "pack-agii",
    order: 5,
    name: 'Pack Agente Preditivo "AGII"',
    shortName: 'AGII',
    description:
      "Upgrade avançado de marketing digital e rede. Só é liberado quando o afiliado conclui integralmente os requisitos do plano / XP.",
    priceCents: 50000,
    xpGranted: 170000,
    levelGranted: "predictive_ii",
    badge: "Escala avançada",
    requirements: {
      minXp: 170000,
      minDirectReferrals: 20,
      requiredPackSlugs: ["pack-ag"],
    },
    highlights: [
      "500 e-books exclusivos (20 PREU x25)",
      "Prompt intermediário com 5 Skills Nível I + 2 Skills Nível II",
      "Conta BeYour Banker Silver",
      "Estratégia de Networking Operacional em escala",
      "Capacidade ampliada de tráfego, CRM e automação",
    ],
  },
];

export const EBOOK_BUNDLES: EbookBundle[] = [
  {
    slug: "ebooks-a2",
    name: "Biblioteca Inicial A²",
    description: "Coleção liberada com o Pack A² para começar vendas diretas no Marketplace Nexus.",
    ebookCount: 10,
    resalePriceLabel: "R$ 0,99 por e-book",
    unlockPackSlug: "pack-a2",
  },
  {
    slug: "ebooks-a2ii",
    name: "Biblioteca de Escala A²II",
    description: "Ampliação da biblioteca comercial para o afiliado que sobe ao Nível II.",
    ebookCount: 30,
    resalePriceLabel: "R$ 0,99 por e-book",
    unlockPackSlug: "pack-a2ii",
  },
  {
    slug: "ebooks-a2iii",
    name: "Biblioteca Premium A²III",
    description: "Pacote intensivo de e-books para operação com mais profundidade comercial.",
    ebookCount: 50,
    resalePriceLabel: "R$ 0,99 por e-book",
    unlockPackSlug: "pack-a2iii",
  },
  {
    slug: "ebooks-ag",
    name: "PREU Profissional AG",
    description: "Biblioteca profissional com 250 e-books exclusivos do Universo AI.",
    ebookCount: 250,
    resalePriceLabel: "R$ 0,99 por e-book",
    unlockPackSlug: "pack-ag",
  },
  {
    slug: "ebooks-agii",
    name: "PREU Escala AGII",
    description: "Biblioteca expandida com 500 e-books para operação profissional em escala.",
    ebookCount: 500,
    resalePriceLabel: "R$ 0,99 por e-book",
    unlockPackSlug: "pack-agii",
  },
];

export const MARKETPLACE_EBOOKS: MarketplaceEbook[] = [
  {
    slug: "ebook-fundamentos-da-ia",
    order: 1,
    title: "Fundamentos da Inteligência Artificial",
    subtitle: "Do Sonho à Realidade",
    description:
      "24 páginas com história da IA, ML, Deep Learning, ética e aplicações reais. Ideal para o primeiro contato profissional do afiliado com o tema.",
    costCents: 50,
    resalePriceCents: 100,
    pages: 24,
    category: "Fundamentos",
    coverGradient: "from-[#0b2b3b] to-[#1a4a6f]",
    htmlPath: "/ebooks/01-fundamentos-da-ia.html",
    pdfPath: "/ebooks/pdf/01-fundamentos-da-ia.pdf",
    highlights: [
      "História da IA de 1950 a hoje",
      "IA Fraca x IA Forte com tabelas",
      "Machine Learning e Deep Learning explicados",
      "Glossário ilustrado e exercícios práticos",
    ],
    unlockPackSlug: "pack-a2",
  },
  {
    slug: "ebook-modelos-de-linguagem",
    order: 2,
    title: "A Revolução dos Modelos de Linguagem",
    subtitle: "ChatGPT, Gemini, Llama e o futuro da comunicação com IA",
    description:
      "22 páginas sobre LLMs, Transformer, engenharia de prompt, RAG, alucinações, agentes autônomos e ética.",
    costCents: 50,
    resalePriceCents: 100,
    pages: 22,
    category: "LLMs",
    coverGradient: "from-[#2b3b0b] to-[#4a6f1a]",
    htmlPath: "/ebooks/02-modelos-de-linguagem.html",
    pdfPath: "/ebooks/pdf/02-modelos-de-linguagem.pdf",
    highlights: [
      "Arquitetura Transformer e atenção",
      "GPT, Claude, Llama, Gemini comparados",
      "Zero-shot, Few-shot e Chain-of-Thought",
      "RAG, alucinações e desafios reais",
    ],
    unlockPackSlug: "pack-a2",
  },
  {
    slug: "ebook-visao-computacional",
    order: 3,
    title: "Visão Computacional",
    subtitle: "Quando as máquinas aprendem a enxergar",
    description:
      "Ebook prático sobre CNNs, YOLO, segmentação, GANs, deepfakes e aplicações em carros autônomos e medicina.",
    costCents: 50,
    resalePriceCents: 100,
    pages: 20,
    category: "Visão",
    coverGradient: "from-[#3b0b2b] to-[#6f1a4a]",
    htmlPath: "/ebooks/03-visao-computacional.html",
    pdfPath: "/ebooks/pdf/03-visao-computacional.pdf",
    highlights: [
      "Como o computador enxerga pixels",
      "CNNs, YOLO e segmentação semântica",
      "GANs e modelos de difusão",
      "Casos reais (Tesla, FaceID, medicina)",
    ],
    unlockPackSlug: "pack-a2",
  },
  {
    slug: "ebook-ia-generativa-criativa",
    order: 4,
    title: "IA Generativa Criativa",
    subtitle: "Texto, imagem, áudio e vídeo gerados por máquinas",
    description:
      "Ferramentas, workflows criativos e licenciamento para quem quer monetizar conteúdo gerado por IA no Marketplace Nexus.",
    costCents: 50,
    resalePriceCents: 100,
    pages: 20,
    category: "Generativa",
    coverGradient: "from-[#1b2b3b] to-[#228b6f]",
    htmlPath: "/ebooks/04-ia-generativa-criativa.html",
    pdfPath: "/ebooks/pdf/04-ia-generativa-criativa.pdf",
    highlights: [
      "Texto, imagem, áudio e vídeo com IA",
      "Ferramentas profissionais por categoria",
      "Pipelines criativos e workflows",
      "Licenciamento e casos de uso comerciais",
    ],
    unlockPackSlug: "pack-a2",
  },
  {
    slug: "ebook-etica-e-futuro-da-ia",
    order: 5,
    title: "Ética e Futuro da IA",
    subtitle: "Riscos, regulação e o caminho para a AGI",
    description:
      "Discussão prática sobre vieses, deepfakes, regulação global, alinhamento, AGI e o que cada afiliado pode fazer.",
    costCents: 50,
    resalePriceCents: 100,
    pages: 20,
    category: "Ética",
    coverGradient: "from-[#3b1b1b] to-[#8b2c2c]",
    htmlPath: "/ebooks/05-etica-e-futuro-da-ia.html",
    pdfPath: "/ebooks/pdf/05-etica-e-futuro-da-ia.pdf",
    highlights: [
      "Vieses algorítmicos e casos reais",
      "EU AI Act e regulação no Brasil",
      "Problema do alinhamento e AGI",
      "Cenários utópicos, distópicos e realistas",
    ],
    unlockPackSlug: "pack-a2",
  },
];

export const SKILL_BUNDLES: SkillBundle[] = [
  {
    slug: "skills-a2",
    name: "Skills Operacionais Nível I · Start",
    description: "Conjunto inicial para ativar o Agente IA e iniciar o fluxo comercial.",
    skillSummary: "2 Skills Nível I",
    unlockPackSlug: "pack-a2",
    highlights: ["Prompt básico", "Primeiras automações", "Acesso ao backoffice"],
  },
  {
    slug: "skills-a2ii",
    name: "Skills Operacionais Nível I · Growth",
    description: "Upgrade do agente para atuação mais consistente em vendas diretas e rede.",
    skillSummary: "3 Skills Nível I",
    unlockPackSlug: "pack-a2ii",
    highlights: ["Prompt básico refinado", "Mais automação comercial", "Expansão do N.O"],
  },
  {
    slug: "skills-a2iii",
    name: "Skills Operacionais Nível I · Pro",
    description: "Configuração de destaque para afiliados com rede direta ampliada.",
    skillSummary: "5 Skills Nível I",
    unlockPackSlug: "pack-a2iii",
    highlights: ["Maior profundidade tática", "Mais autonomia do agente", "Operação comercial ampliada"],
  },
  {
    slug: "skills-ag",
    name: "Skills Intermediários · Preditivo I",
    description: "Habilidades intermediárias para o ciclo profissional de marketing digital.",
    skillSummary: "5 Skills Nível I + Prompt Intermediário",
    unlockPackSlug: "pack-ag",
    highlights: ["Preditivo", "Marketing digital", "Aprendizado continuado"],
  },
  {
    slug: "skills-agii",
    name: "Skills Intermediários · Preditivo II",
    description: "Expansão avançada de marketing, CRM e automação com Nível II incorporado.",
    skillSummary: "5 Skills Nível I + 2 Skills Nível II",
    unlockPackSlug: "pack-agii",
    highlights: ["Escala profissional", "Automação avançada", "Maior inteligência operacional"],
  },
];

export function formatCurrency(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function createDefaultMarketplaceProfile(user?: {
  id?: string;
  name?: string;
  email?: string;
}): MarketplaceProfile {
  const now = new Date().toISOString();
  return {
    version: 1,
    userId: user?.id,
    userName: user?.name,
    userEmail: user?.email,
    currentXp: 0,
    directReferrals: 0,
    currentLevel: "prospect",
    activePackSlugs: [],
    createdAt: now,
    updatedAt: now,
  };
}

function isSameMarketplaceUser(
  current: MarketplaceProfile,
  incoming?: { id?: string; email?: string },
) {
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
  if (typeof window === "undefined") {
    return createDefaultMarketplaceProfile();
  }

  try {
    const raw = window.localStorage.getItem(MARKETPLACE_PROFILE_STORAGE_KEY);
    if (!raw) return createDefaultMarketplaceProfile();

    const parsed = JSON.parse(raw) as MarketplaceProfile;
    return {
      ...createDefaultMarketplaceProfile(),
      ...parsed,
      activePackSlugs: Array.isArray(parsed.activePackSlugs) ? parsed.activePackSlugs : [],
    };
  } catch {
    return createDefaultMarketplaceProfile();
  }
}

export function saveMarketplaceProfile(profile: MarketplaceProfile) {
  if (typeof window === "undefined") return profile;
  const nextProfile = {
    ...profile,
    updatedAt: new Date().toISOString(),
  };
  window.localStorage.setItem(MARKETPLACE_PROFILE_STORAGE_KEY, JSON.stringify(nextProfile));
  return nextProfile;
}

export function ensureAffiliateMarketplaceProfile(user?: { id?: string; name?: string; email?: string }) {
  const current = loadMarketplaceProfile();

  if (!isSameMarketplaceUser(current, user)) {
    return saveMarketplaceProfile(createDefaultMarketplaceProfile(user));
  }

  const next = saveMarketplaceProfile({
    ...current,
    userId: user?.id || current.userId,
    userName: user?.name || current.userName,
    userEmail: user?.email || current.userEmail,
  });
  return next;
}

export function getPackBySlug(slug: string) {
  return NEXUS_PACKS.find((pack) => pack.slug === slug) ?? null;
}

export function getHighestActivePack(profile: MarketplaceProfile) {
  return NEXUS_PACKS
    .filter((pack) => profile.activePackSlugs.includes(pack.slug))
    .sort((a, b) => b.order - a.order)[0] ?? null;
}

export function hasPackOrHigher(profile: MarketplaceProfile, packSlug: string) {
  const targetPack = getPackBySlug(packSlug);
  const highestPack = getHighestActivePack(profile);
  if (!targetPack || !highestPack) return false;
  return highestPack.order >= targetPack.order;
}

export function getPackAccess(profile: MarketplaceProfile, pack: NexusPack): {
  status: CatalogAccess;
  missingCriteria: string[];
} {
  if (profile.activePackSlugs.includes(pack.slug)) {
    return { status: "active", missingCriteria: [] };
  }

  if (pack.slug === "pack-a2") {
    return { status: "available", missingCriteria: [] };
  }

  const missingCriteria: string[] = [];

  if (pack.requirements.requiredPackSlugs.some((slug) => !profile.activePackSlugs.includes(slug))) {
    const requiredLabels = pack.requirements.requiredPackSlugs
      .map((slug) => getPackBySlug(slug)?.shortName ?? slug)
      .join(", ");
    missingCriteria.push(`Ativar o plano anterior (${requiredLabels})`);
  }

  if (profile.currentXp < pack.requirements.minXp) {
    missingCriteria.push(`Alcançar ${pack.requirements.minXp.toLocaleString("pt-BR")} XP`);
  }

  if (profile.directReferrals < pack.requirements.minDirectReferrals) {
    missingCriteria.push(`Concluir ${pack.requirements.minDirectReferrals} afiliados diretos qualificados`);
  }

  return {
    status: missingCriteria.length === 0 ? "available" : "locked",
    missingCriteria,
  };
}

export function activatePack(profile: MarketplaceProfile, packSlug: string) {
  const pack = getPackBySlug(packSlug);
  if (!pack) return profile;

  const access = getPackAccess(profile, pack);
  if (access.status === "locked") return profile;

  const nextActivePackSlugs = Array.from(new Set([...profile.activePackSlugs, pack.slug]));

  return saveMarketplaceProfile({
    ...profile,
    currentLevel: pack.levelGranted,
    currentXp: Math.max(profile.currentXp, pack.xpGranted),
    directReferrals: Math.max(profile.directReferrals, pack.requirements.minDirectReferrals),
    activePackSlugs: nextActivePackSlugs,
  });
}

export function getProgressSnapshot(profile: MarketplaceProfile): ProgressSnapshot {
  const currentPack = getHighestActivePack(profile);
  const nextPack = currentPack
    ? NEXUS_PACKS.find((pack) => pack.order === currentPack.order + 1) ?? null
    : NEXUS_PACKS[0] ?? null;

  const xpTarget = nextPack?.requirements.minXp ?? (profile.currentXp || 1);
  const directTarget = nextPack?.requirements.minDirectReferrals ?? (profile.directReferrals || 1);

  return {
    currentPack,
    nextPack,
    xpCurrent: profile.currentXp,
    xpTarget,
    xpProgress: nextPack ? Math.min(100, Math.round((profile.currentXp / Math.max(1, xpTarget)) * 100)) : 100,
    directCurrent: profile.directReferrals,
    directTarget,
    directProgress: nextPack
      ? Math.min(100, Math.round((profile.directReferrals / Math.max(1, directTarget)) * 100))
      : 100,
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

export interface MarketplaceEbookState extends MarketplaceEbook {
  status: CatalogAccess;
}

export function getMarketplaceEbooks(profile: MarketplaceProfile): MarketplaceEbookState[] {
  return MARKETPLACE_EBOOKS.map((ebook) => ({
    ...ebook,
    status: hasPackOrHigher(profile, ebook.unlockPackSlug)
      ? ("active" as const)
      : ("locked" as const),
  }));
}

export function getLevelLabel(level: CareerLevelKey) {
  return CAREER_LEVELS[level]?.label ?? level;
}

export function getLevelSubtitle(level: CareerLevelKey) {
  return CAREER_LEVELS[level]?.subtitle ?? "";
}
