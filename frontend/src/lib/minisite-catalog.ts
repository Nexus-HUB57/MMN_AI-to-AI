import type { OperationalStockItem } from "@/lib/nexus-marketplace";

export interface MiniSiteCatalogItem {
  id: string;
  sourceItemId: string;
  type: "ebooks" | "preu";
  title: string;
  subtitle: string;
  description: string;
  quantity: number;
  badge: string;
  priceCents: number;
  priceLabel: string;
  coverGradient: string;
  syncedAt: string;
}

export const MINISITE_CATALOG_STORAGE_KEY = "mmn-ai-minisite-catalog";
const MINISITE_CATALOG_EVENT = "mmn:minisite-catalog-updated";

function isBrowser() {
  return typeof window !== "undefined";
}

function emitCatalogUpdate() {
  if (!isBrowser()) return;
  window.dispatchEvent(new CustomEvent(MINISITE_CATALOG_EVENT));
}

export function getMiniSiteCatalogEventName() {
  return MINISITE_CATALOG_EVENT;
}

export function getMiniSiteCatalogConfig(item: OperationalStockItem) {
  if (item.type === "ebooks") {
    return {
      type: "ebooks" as const,
      title: "E-book",
      priceCents: 99,
      priceLabel: "R$ 0,99 / unidade",
      coverGradient: "from-sky-500 via-cyan-500 to-blue-700",
    };
  }

  return {
    type: "preu" as const,
    title: "PREU",
    priceCents: 2475,
    priceLabel: "R$ 24,75 / pack",
    coverGradient: "from-fuchsia-500 via-violet-500 to-purple-700",
  };
}

export function buildMiniSiteCatalogItem(item: OperationalStockItem): MiniSiteCatalogItem | null {
  if (item.type !== "ebooks" && item.type !== "preu") return null;
  const config = getMiniSiteCatalogConfig(item);

  return {
    id: `catalog-${item.id}`,
    sourceItemId: item.id,
    type: config.type,
    title: config.title,
    subtitle: item.title,
    description: item.description,
    quantity: item.quantity,
    badge: item.badge,
    priceCents: config.priceCents,
    priceLabel: config.priceLabel,
    coverGradient: config.coverGradient,
    syncedAt: new Date().toISOString(),
  };
}

export function loadMiniSiteCatalog(): MiniSiteCatalogItem[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(MINISITE_CATALOG_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveMiniSiteCatalog(items: MiniSiteCatalogItem[]) {
  if (!isBrowser()) return items;
  window.localStorage.setItem(MINISITE_CATALOG_STORAGE_KEY, JSON.stringify(items));
  emitCatalogUpdate();
  return items;
}

export function isOperationalItemSynced(sourceItemId: string) {
  return loadMiniSiteCatalog().some((item) => item.sourceItemId === sourceItemId);
}

export function toggleOperationalItemSync(item: OperationalStockItem) {
  const nextItem = buildMiniSiteCatalogItem(item);
  if (!nextItem) return loadMiniSiteCatalog();

  const current = loadMiniSiteCatalog();
  const alreadySynced = current.some((catalogItem) => catalogItem.sourceItemId === item.id);

  if (alreadySynced) {
    return saveMiniSiteCatalog(current.filter((catalogItem) => catalogItem.sourceItemId !== item.id));
  }

  const withoutDuplicatedTypeTitle = current.filter((catalogItem) => catalogItem.sourceItemId !== item.id);
  return saveMiniSiteCatalog([...withoutDuplicatedTypeTitle, nextItem]);
}
