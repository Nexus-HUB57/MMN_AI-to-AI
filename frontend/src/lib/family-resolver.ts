/**
 * Family Resolver — Correção #2 (Packs/Upgrade unificado com lógica de famílias)
 * -----------------------------------------------------------------------------
 * Define a regra: o usuário só vê os Upgrades da família do nível atual.
 * A próxima família só é liberada quando o último pack da família atual
 * é concluído.
 *
 * Mapeamento PD/SCC (Plano de Desenvolvimento / Sistema de Carreira Comercial):
 *   - Família 1 (affiliate)    → pack-a2, pack-a2ii, pack-a2iii         (níveis 1-3)
 *   - Família 2 (predictive)   → pack-ag, pack-agii, pack-agiii         (níveis 4-6)
 *   - Família 3 (generative)   → pack-agn, pack-agnii, pack-agniii      (níveis 7-9)
 *   - Família 4 (orchestrator) → pack-ao, pack-aoii, pack-aoiii         (níveis 10-12)
 *   - Família 5 (agentic)      → pack-aa, pack-aaii, pack-aaiii         (níveis 13-15+)
 *
 * Regra: ao concluir o último pack (pack-a2iii) libera a próxima família (predictive).
 */

import { NEXUS_PACKS, type NexusPack } from "@/lib/nexus-marketplace";

export type CareerFamily =
  | "affiliate"
  | "predictive"
  | "generative"
  | "orchestrator"
  | "agentic";

export const FAMILY_ORDER: CareerFamily[] = [
  "affiliate",
  "predictive",
  "generative",
  "orchestrator",
  "agentic",
];

export const FAMILY_LABEL: Record<CareerFamily, string> = {
  affiliate: "Agente Afiliado (A²)",
  predictive: "Agente Preditivo (AG)",
  generative: "Agente Generativo (AGN)",
  orchestrator: "Agente Orquestrador (AO)",
  agentic: "IA Agêntica (AA)",
};

export interface FamilyResolverInput {
  activePackSlugs: string[];
}

/**
 * Retorna a família corrente do usuário a partir dos packs ativos.
 * Família corrente = a maior família cuja primeira posição já foi ativada.
 * Usuário sem packs → família 'affiliate' (entrada).
 */
export function getCurrentFamily(input: FamilyResolverInput): CareerFamily {
  const stages = NEXUS_PACKS.filter((p) => input.activePackSlugs.includes(p.slug)).map(
    (p) => p.stage as CareerFamily,
  );
  if (stages.length === 0) return "affiliate";
  // Maior índice em FAMILY_ORDER entre as famílias ativas.
  return stages.reduce<CareerFamily>((acc, current) => {
    const accIdx = FAMILY_ORDER.indexOf(acc);
    const curIdx = FAMILY_ORDER.indexOf(current);
    return curIdx > accIdx ? current : acc;
  }, "affiliate");
}

/**
 * Retorna true se TODOS os packs da família estão ativos.
 */
export function isFamilyCompleted(
  family: CareerFamily,
  activePackSlugs: string[],
): boolean {
  const packsOfFamily = NEXUS_PACKS.filter((p) => p.stage === family).map((p) => p.slug);
  if (packsOfFamily.length === 0) return false;
  return packsOfFamily.every((slug) => activePackSlugs.includes(slug));
}

/**
 * Retorna a próxima família caso a corrente esteja concluída; caso contrário null.
 */
export function getNextUnlockedFamily(input: FamilyResolverInput): CareerFamily | null {
  const current = getCurrentFamily(input);
  if (!isFamilyCompleted(current, input.activePackSlugs)) return null;
  const idx = FAMILY_ORDER.indexOf(current);
  return idx >= 0 && idx < FAMILY_ORDER.length - 1 ? FAMILY_ORDER[idx + 1] : null;
}

/**
 * Retorna apenas os packs que o usuário pode VER em /upgrades.
 *
 * Regra:
 *  - Mostra todos os packs da família atual.
 *  - Mostra a primeira posição da próxima família SE a atual estiver concluída.
 *  - NÃO mostra famílias futuras além disso.
 *  - NÃO mostra o pack-a2 em /upgrades (esse é o Pack de Acesso, vendido em /marketplaces).
 */
export function getAvailableUpgrades(input: FamilyResolverInput): NexusPack[] {
  const currentFamily = getCurrentFamily(input);
  const nextFamily = getNextUnlockedFamily(input);

  return NEXUS_PACKS.filter((pack) => {
    // Pack de Acesso fica fora de /upgrades (Marketplace cuida dele).
    if (pack.slug === "pack-a2") return false;

    if (pack.stage === currentFamily) return true;
    if (nextFamily && pack.stage === nextFamily) {
      // Mostra só a primeira posição (gateway) da próxima família.
      const firstOfNext = NEXUS_PACKS.filter((p) => p.stage === nextFamily).sort(
        (a, b) => a.order - b.order,
      )[0];
      return firstOfNext?.slug === pack.slug;
    }
    return false;
  }).sort((a, b) => a.order - b.order);
}

/**
 * Status visual auxiliar para o painel Packs/Upgrade.
 */
export function getFamilyProgress(input: FamilyResolverInput) {
  const current = getCurrentFamily(input);
  const next = getNextUnlockedFamily(input);
  const packsOfCurrent = NEXUS_PACKS.filter((p) => p.stage === current);
  const completedInCurrent = packsOfCurrent.filter((p) =>
    input.activePackSlugs.includes(p.slug),
  ).length;

  return {
    currentFamily: current,
    currentFamilyLabel: FAMILY_LABEL[current],
    nextFamily: next,
    nextFamilyLabel: next ? FAMILY_LABEL[next] : null,
    completedInCurrent,
    totalInCurrent: packsOfCurrent.length,
    isCurrentCompleted: completedInCurrent === packsOfCurrent.length,
  };
}
