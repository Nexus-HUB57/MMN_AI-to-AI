/**
 * Skill Catalog Service
 * -----------------------------------------------------------------------------
 * Manages the skill marketplace catalog with search and discovery.
 */

import { randomUUID } from "node:crypto";

import type {
  MarketplaceSkill,
  MarketplaceSearchFilters,
  MarketplaceSearchResult,
  SkillReview,
} from "./types";

/**
 * Sample skill catalog data
 */
const SAMPLE_CATALOG: MarketplaceSkill[] = [
  {
    id: "skill-001",
    slug: "copywriter-ultra",
    name: "Copywriter Ultra Pro",
    description: "Gerador de copy persuasivo com otimização para conversão",
    category: "content",
    version: "2.0.0",
    author: {
      id: "author-001",
      name: "Nexus AI",
      verified: true,
    },
    pricing: {
      purchasePrice: 497,
      rentalPrice: 497,
      rentalPeriodDays: 30,
      currency: "BRL",
    },
    capabilities: {
      inputs: ["produto", "publico", "tom"],
      outputs: ["headline", "body", "cta"],
      categories: ["copywriting", "persuasao"],
      integrations: ["openai", "claude"],
    },
    stats: {
      downloads: 1245,
      rentals: 342,
      rating: 4.8,
      reviews: 89,
    },
    tier: "advanced",
    status: "published",
    createdAt: "2026-01-15T00:00:00Z",
    updatedAt: "2026-05-20T00:00:00Z",
  },
  {
    id: "skill-002",
    slug: "analytics-dashboard",
    name: "Analytics Dashboard Generator",
    description: "Cria dashboards visuais com métricas customizadas",
    category: "analytics",
    version: "1.5.0",
    author: {
      id: "author-002",
      name: "DataMaster",
      verified: true,
    },
    pricing: {
      purchasePrice: 997,
      rentalPrice: 997,
      rentalPeriodDays: 30,
      currency: "BRL",
    },
    capabilities: {
      inputs: ["metricas", "periodo"],
      outputs: ["charts", "relatorios"],
      categories: ["visualizacao", " бизнес-анализ"],
      integrations: ["chartjs", "highcharts"],
    },
    stats: {
      downloads: 876,
      rentals: 234,
      rating: 4.6,
      reviews: 56,
    },
    tier: "enterprise",
    status: "published",
    createdAt: "2026-02-20T00:00:00Z",
    updatedAt: "2026-04-10T00:00:00Z",
  },
  {
    id: "skill-003",
    slug: "funnel-builder",
    name: "Funil Vendas Builder",
    description: "Construtor automatizado de funis de vendas",
    category: "strategy",
    version: "1.0.0",
    author: {
      id: "author-001",
      name: "Nexus AI",
      verified: true,
    },
    pricing: {
      purchasePrice: 297,
      rentalPrice: 297,
      rentalPeriodDays: 30,
      currency: "BRL",
    },
    capabilities: {
      inputs: ["objetivo", "publico"],
      outputs: ["funil", "etapas"],
      categories: ["vendas", "estrategia"],
      integrations: ["hotmart"],
    },
    stats: {
      downloads: 543,
      rentals: 156,
      rating: 4.4,
      reviews: 34,
    },
    tier: "intermediate",
    status: "published",
    createdAt: "2026-03-10T00:00:00Z",
    updatedAt: "2026-05-01T00:00:00Z",
  },
];

/**
 * Search skills in the marketplace
 */
export async function searchSkills(
  filters: MarketplaceSearchFilters,
): Promise<MarketplaceSearchResult> {
  let results = [...SAMPLE_CATALOG];

  // Filter by query
  if (filters.query) {
    const query = filters.query.toLowerCase();
    results = results.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query) ||
        s.category.toLowerCase().includes(query),
    );
  }

  // Filter by category
  if (filters.category) {
    results = results.filter((s) => s.category === filters.category);
  }

  // Filter by tier
  if (filters.tier) {
    results = results.filter((s) => s.tier === filters.tier);
  }

  // Filter by price
  if (filters.priceMin !== null) {
    results = results.filter((s) => s.pricing.purchasePrice >= filters.priceMin!);
  }
  if (filters.priceMax !== null) {
    results = results.filter((s) => s.pricing.purchasePrice <= filters.priceMax!);
  }

  // Sort
  switch (filters.sortBy) {
    case "popularity":
      results.sort((a, b) => b.stats.downloads - a.stats.downloads);
      break;
    case "rating":
      results.sort((a, b) => b.stats.rating - a.stats.rating);
      break;
    case "newest":
      results.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      break;
    case "price_asc":
      results.sort((a, b) => a.pricing.purchasePrice - b.pricing.purchasePrice);
      break;
    case "price_desc":
      results.sort((a, b) => b.pricing.purchasePrice - a.pricing.purchasePrice);
      break;
  }

  const total = results.length;
  const totalPages = Math.ceil(total / filters.pageSize);
  const startIdx = (filters.page - 1) * filters.pageSize;
  const paginatedResults = results.slice(startIdx, startIdx + filters.pageSize);

  return {
    skills: paginatedResults,
    total,
    page: filters.page,
    pageSize: filters.pageSize,
    totalPages,
  };
}

/**
 * Get skill by slug
 */
export async function getSkillBySlug(slug: string): Promise<MarketplaceSkill | null> {
  return SAMPLE_CATALOG.find((s) => s.slug === slug) ?? null;
}

/**
 * Get skill reviews
 */
export async function getSkillReviews(
  skillId: string,
  page: number = 1,
  pageSize: number = 10,
): Promise<{ reviews: SkillReview[]; total: number }> {
  const reviews: SkillReview[] = [
    {
      id: "review-001",
      skillId,
      userId: "user-001",
      userName: "João Silva",
      rating: 5,
      comment: "Excelente skill! Funciona perfeitamente e resolve meu problema.",
      pros: ["Fácil de usar", "Resultados rápidos"],
      cons: [],
      createdAt: "2026-04-15T00:00:00Z",
    },
  ];

  return {
    reviews: reviews.slice((page - 1) * pageSize, page * pageSize),
    total: reviews.length,
  };
}

/**
 * Get featured skills
 */
export async function getFeaturedSkills(limit: number = 6): Promise<MarketplaceSkill[]> {
  return SAMPLE_CATALOG.filter((s) => s.stats.rating >= 4.5)
    .sort((a, b) => b.stats.downloads - a.stats.downloads)
    .slice(0, limit);
}

/**
 * Get skills by category
 */
export async function getSkillsByCategory(
  category: string,
  limit: number = 10,
): Promise<MarketplaceSkill[]> {
  return SAMPLE_CATALOG.filter((s) => s.category === category)
    .sort((a, b) => b.stats.downloads - a.stats.downloads)
    .slice(0, limit);
}

/**
 * Get top rated skills
 */
export async function getTopRatedSkills(limit: number = 10): Promise<MarketplaceSkill[]> {
  return SAMPLE_CATALOG.filter((s) => s.stats.reviews >= 5)
    .sort((a, b) => b.stats.rating - a.stats.rating)
    .slice(0, limit);
}

/**
 * Submit skill for review (for creators)
 */
export async function submitSkillForReview(
  skill: Omit<MarketplaceSkill, "id" | "stats" | "status" | "createdAt" | "updatedAt">,
): Promise<{ success: boolean; skillId: string }> {
  return {
    success: true,
    skillId: randomUUID(),
  };
}
