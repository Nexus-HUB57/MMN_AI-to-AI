/**
 * Public Access Pack helper — Correção #3 (Marketplace enxuto)
 * -----------------------------------------------------------------------------
 * Em /marketplaces (vitrine pública) expomos APENAS o "Pack Agente Afiliado A²"
 * (Pack de Acesso, slug `pack-a2`). Aquisição de upgrades é exclusiva em
 * /dashboard/packs-upgrade (autenticado).
 */

import { NEXUS_PACKS, type NexusPack } from "@/lib/nexus-marketplace";

export const PUBLIC_ACCESS_PACK_SLUG = "pack-a2";

export function getPublicAccessPack(): NexusPack {
  const pack = NEXUS_PACKS.find((p) => p.slug === PUBLIC_ACCESS_PACK_SLUG);
  if (!pack) {
    throw new Error(
      `[public-access-pack] Pack de Acesso '${PUBLIC_ACCESS_PACK_SLUG}' ausente em NEXUS_PACKS.`,
    );
  }
  return pack;
}

/**
 * Para a vitrine pública, retorna apenas o Pack de Acesso.
 * Para usuários autenticados, retorna todos os packs (comportamento legado).
 */
export function getPacksForMarketplaceView(opts: { isPublicView: boolean }): NexusPack[] {
  return opts.isPublicView ? [getPublicAccessPack()] : NEXUS_PACKS;
}
