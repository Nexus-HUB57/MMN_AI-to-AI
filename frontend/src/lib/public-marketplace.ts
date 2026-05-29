import {
  createDefaultMarketplaceProfile,
  type MarketplaceProfile,
} from "@/lib/nexus-marketplace";

/**
 * Perfil comercial público para vitrine e mini-site quando o visitante ainda
 * não está autenticado e não possui inventário salvo no navegador.
 *
 * Objetivo: evitar estado vazio em /estoque e viabilizar o fluxo
 * /estoque -> sincronização -> /minisite no modo público.
 */
export function createPublicMarketplaceProfile(): MarketplaceProfile {
  const base = createDefaultMarketplaceProfile({
    name: "Visitante Nexus",
    email: "publico@oneverso.com.br",
  });

  return {
    ...base,
    currentLevel: "predictive_i",
    currentXp: 65000,
    directReferrals: 10,
    activePackSlugs: ["pack-a2", "pack-ag"],
  };
}

export function resolveShowcaseMarketplaceProfile(
  profile: MarketplaceProfile,
  isAuthenticated: boolean,
): MarketplaceProfile {
  if (isAuthenticated) return profile;
  if (profile.activePackSlugs.length > 0) return profile;
  return createPublicMarketplaceProfile();
}
