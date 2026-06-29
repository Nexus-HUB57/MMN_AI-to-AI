// frontend/src/lib/collectionRanking.ts
// Ordenação customizada de coleções do Marketplace Nexus
// Gerado em 2026-06-19 pela solicitação do usuário (sequência oficial)

export const COLLECTION_RANK: Record<string, number> = {
  "Nexus Affil'IA'te Store":            1,
  "Coleção MAESTRIA IA APLICADA":       2,
  "Coleção GNOXS":                      3,
  "Coleção AXIOMA PRIME":               4,
  "Coleção AgenticAI Revolução":        5,
  "Curso Futuro IA":                    6,
  "Coleção Criadores da IA":            7,
  "Coleção HUMAN_IA":                   8,
  "Coleção Se Eu IA Fosse Humano":      9,
  "Coleção NEXUS PROTOCOL":            10,
  "Coletânea Orquestração IA":         11,
  "Coleção IAs para Todos e Tudo":     12,
  "Coleção As Novas Profissões da IA": 13,
  "Coleção A IA Perfeita":             14,
  "Coleção IA se Descreve":            15,
  "Coleção Ninguém Contatado":         16,
  "Coleção FORJA AGÊNTICA":            17,
  "Coleção MMN_IA":                    18,
  "Curso Universo IA":                 19,
};

export function rankOf(category: string | undefined | null): number {
  if (!category) return 999;
  return COLLECTION_RANK[category] ?? 999;
}

/**
 * Ordena ebooks por:
 * 1. rank customizado da coleção (NEXUS STORE primeiro, MMN_IA por último, etc.)
 * 2. order dentro da coleção (sequência dos livros)
 * 3. id (estável)
 */
export function sortByCollectionRank<T extends { category?: string; order?: number; id?: string|number }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const ra = rankOf(a.category);
    const rb = rankOf(b.category);
    if (ra !== rb) return ra - rb;
    const oa = a.order ?? 9999;
    const ob = b.order ?? 9999;
    if (oa !== ob) return oa - ob;
    return String(a.id ?? '').localeCompare(String(b.id ?? ''));
  });
}
