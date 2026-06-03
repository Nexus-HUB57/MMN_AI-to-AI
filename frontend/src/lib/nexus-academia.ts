import type { MarketplaceProfile } from "@/lib/nexus-marketplace";
import { getHighestActivePack } from "@/lib/nexus-marketplace";

export type AcademiaTierId = "iniciante" | "operador" | "estrategista" | "elite";

export interface AcademiaTier {
  id: AcademiaTierId;
  label: string;
  statusLabel: string;
  tagline: string;
  summary: string;
  unlockedTracks: string[];
  labAccess: string;
  libAccess: string;
  runtimeAccess: string;
  badgeTone: string;
}

export interface AcademiaTrack {
  slug: "fundamental" | "agente" | "master" | "elite";
  title: string;
  subtitle: string;
  requiredTier: AcademiaTierId;
  skillsGranted: number;
  audience: string;
  description: string;
  quickStartUrl: string;
}

export interface AcademiaResourceGroup {
  slug: string;
  title: string;
  countLabel: string;
  description: string;
  href: string;
}

export interface AcademiaQuickLink {
  title: string;
  description: string;
  href: string;
}

const REPO_BASE = "https://github.com/Nexus-HUB57/MMN_AI-to-AI/blob/main";

const tierOrder: Record<AcademiaTierId, number> = {
  iniciante: 1,
  operador: 2,
  estrategista: 3,
  elite: 4,
};

export const ACADEMIA_TIERS: Record<AcademiaTierId, AcademiaTier> = {
  iniciante: {
    id: "iniciante",
    label: "Iniciante",
    statusLabel: "Cadastrado",
    tagline: "Entrada guiada para conhecer IOAID, SHO e o painel do afiliado.",
    summary:
      "Acesso à trilha Fundamental, leitura da Lib Nexus e visão inicial do ecossistema educacional.",
    unlockedTracks: ["fundamental"],
    labAccess: "Básico",
    libAccess: "Leitura",
    runtimeAccess: "Skills introdutórias e baseline de onboarding",
    badgeTone: "border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan",
  },
  operador: {
    id: "operador",
    label: "Operador",
    statusLabel: "1º ciclo ativo",
    tagline: "Habilita a camada prática de agentes, skills base e operação inicial.",
    summary:
      "Libera trilhas Fundamental + Agente, Lab Nexus essencial e expansão da sincronização com runtime.",
    unlockedTracks: ["fundamental", "agente"],
    labAccess: "Essencial",
    libAccess: "Leitura",
    runtimeAccess: "Entitlement operacional e setup do primeiro agente",
    badgeTone: "border-quantum-lime/30 bg-quantum-lime/10 text-quantum-lime",
  },
  estrategista: {
    id: "estrategista",
    label: "Estrategista",
    statusLabel: "3+ ciclos concluídos",
    tagline: "Escala a jornada com funis, lifecycle, testes e análise de coortes.",
    summary:
      "Libera trilhas Fundamental + Agente + Master, Lab Nexus completo e leitura/comentário orientado na Lib Nexus.",
    unlockedTracks: ["fundamental", "agente", "master"],
    labAccess: "Completo",
    libAccess: "Leitura + comentário",
    runtimeAccess: "Entitlement estratégico com foco em conversão e retenção",
    badgeTone: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  },
  elite: {
    id: "elite",
    label: "Elite",
    statusLabel: "Top 10% / liderança",
    tagline: "Camada premium com blueprints, federação e governança avançada.",
    summary:
      "Desbloqueia todas as trilhas, Lab Nexus completo com submissão e acesso ampliado à Lib Nexus via PR.",
    unlockedTracks: ["fundamental", "agente", "master", "elite"],
    labAccess: "Completo + submissão",
    libAccess: "Leitura + PR",
    runtimeAccess: "Entitlement avançado, blueprints e governança Zero-Trust",
    badgeTone: "border-fuchsia-400/30 bg-fuchsia-400/10 text-fuchsia-300",
  },
};

export const ACADEMIA_TRACKS: AcademiaTrack[] = [
  {
    slug: "fundamental",
    title: "Trilha Fundamental",
    subtitle: "Boas-vindas, IOAID, SHO e painel do afiliado",
    requiredTier: "iniciante",
    skillsGranted: 2,
    audience: "Todo afiliado recém-cadastrado",
    description:
      "Baseia o entendimento do ecossistema, do painel comercial e da lógica operacional inicial antes da ativação avançada.",
    quickStartUrl: `${REPO_BASE}/AcademIA/cursos/fundamental/00-boas-vindas.md`,
  },
  {
    slug: "agente",
    title: "Trilha Agente",
    subtitle: "Primeiro agente, skills essenciais, WhatsApp e Judge Revisor",
    requiredTier: "operador",
    skillsGranted: 4,
    audience: "Afiliado com 1º ciclo ativo",
    description:
      "Conecta formação prática com setup do agente, sincronização de skills e primeiros fluxos operacionais do runtime.",
    quickStartUrl: `${REPO_BASE}/AcademIA/cursos/agente/00-primeiro-agente.md`,
  },
  {
    slug: "master",
    title: "Trilha Master",
    subtitle: "Otimização, lifecycle, A/B testing e coortes",
    requiredTier: "estrategista",
    skillsGranted: 6,
    audience: "Afiliados em fase de escala e otimização",
    description:
      "Eleva a operação com análise de conversão, retenção, pricing e tomada de decisão orientada por dados.",
    quickStartUrl: `${REPO_BASE}/AcademIA/cursos/master/00-otimizacao-conversao.md`,
  },
  {
    slug: "elite",
    title: "Trilha Elite",
    subtitle: "Blueprints, white-label e federação de agentes",
    requiredTier: "elite",
    skillsGranted: 5,
    audience: "Lideranças estratégicas e operação premium",
    description:
      "Camada avançada de governança, multi-tenant, federação Zero-Trust e evolução do runtime para operações complexas.",
    quickStartUrl: `${REPO_BASE}/AcademIA/cursos/elite/00-blueprints-elite.md`,
  },
];

export const ACADEMIA_RESOURCE_GROUPS: AcademiaResourceGroup[] = [
  {
    slug: "cursos",
    title: "Cursos e Trilhas",
    countLabel: "4 níveis oficiais",
    description: "Fundamental, Agente, Master e Elite organizados por progressão de acesso.",
    href: `${REPO_BASE}/AcademIA/README.md`,
  },
  {
    slug: "treinamentos",
    title: "Treinamentos",
    countLabel: "Workshops gravados",
    description: "Oficinas práticas com replay, aplicação em campo e exercícios guiados.",
    href: `${REPO_BASE}/AcademIA/treinamentos/README.md`,
  },
  {
    slug: "webinars",
    title: "Webinars",
    countLabel: "Eventos e lançamentos",
    description: "Lançamentos, open house, roadmap e sessões executivas da operação Nexus.",
    href: `${REPO_BASE}/AcademIA/webinars/README.md`,
  },
  {
    slug: "playbooks",
    title: "Playbooks",
    countLabel: "Operação guiada",
    description: "Manuais de crise, campanhas e rotinas para execução orientada por padrões.",
    href: `${REPO_BASE}/AcademIA/playbooks`,
  },
  {
    slug: "lab",
    title: "Lab Nexus",
    countLabel: "38 ferramentas categorizadas",
    description: "Prompts, templates, blueprints e workflows com aplicação operacional.",
    href: `${REPO_BASE}/AcademIA/Lab-Nexus`,
  },
  {
    slug: "lib",
    title: "Lib Nexus",
    countLabel: "Base canônica",
    description: "Knowledge base, specs de agentes, APIs e melhores práticas do ecossistema.",
    href: `${REPO_BASE}/AcademIA/Lib-Nexus`,
  },
];

export const ACADEMIA_QUICK_LINKS: AcademiaQuickLink[] = [
  {
    title: "Bridge de sincronização",
    description: "Mapa oficial entre trilhas concluídas, entitlements e runtime dos agentes.",
    href: `${REPO_BASE}/AcademIA/sync/agent-bridge.json`,
  },
  {
    title: "Manifesto de skills",
    description: "Catálogo com 45 skills, trilha acadêmica e course_anchor por item.",
    href: `${REPO_BASE}/AcademIA/sync/skill-manifest.json`,
  },
  {
    title: "Quick start da Academ'IA",
    description: "Entrada oficial para onboarding, cursos e governança da área educacional.",
    href: `${REPO_BASE}/AcademIA/README.md`,
  },
];

export function getAcademiaTier(profile: MarketplaceProfile): AcademiaTier {
  const highestPack = getHighestActivePack(profile);

  if (!highestPack) {
    return ACADEMIA_TIERS.iniciante;
  }

  if (highestPack.order >= 13) {
    return ACADEMIA_TIERS.elite;
  }

  if (highestPack.order >= 3) {
    return ACADEMIA_TIERS.estrategista;
  }

  return ACADEMIA_TIERS.operador;
}

export function canAccessAcademiaTrack(profile: MarketplaceProfile, requiredTier: AcademiaTierId) {
  const currentTier = getAcademiaTier(profile);
  return tierOrder[currentTier.id] >= tierOrder[requiredTier];
}

export function getAcademiaAccessibleTracks(profile: MarketplaceProfile) {
  return ACADEMIA_TRACKS.map((track) => ({
    ...track,
    unlocked: canAccessAcademiaTrack(profile, track.requiredTier),
  }));
}

export function getAcademiaRuntimeSummary(profile: MarketplaceProfile) {
  const tier = getAcademiaTier(profile);
  const accessibleTracks = getAcademiaAccessibleTracks(profile);
  const unlockedTrackCount = accessibleTracks.filter((track) => track.unlocked).length;
  const unlockedSkills = accessibleTracks
    .filter((track) => track.unlocked)
    .reduce((total, track) => total + track.skillsGranted, 0);

  return {
    tier,
    unlockedTrackCount,
    unlockedSkills,
    nextTrack: accessibleTracks.find((track) => !track.unlocked) ?? null,
  };
}
