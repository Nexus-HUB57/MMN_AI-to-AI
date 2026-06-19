/**
 * MarketplaceEbooks — Vitrine do Marketplace Nexus
 *
 * Listagem dos 132 ebooks com filtro por coleção/pack, carrinho persistente
 * e checkout integrado. Usa /api/trpc/marketplaceNexus.*
 */
import { useMemo, useState } from "react";
import { Link } from "wouter";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";

const BRL = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

type Ebook = {
  slug: string;
  order: number;
  title: string;
  subtitle: string | null;
  description: string | null;
  costCents: number;
  resalePriceCents: number;
  pages: number;
  category: string;
  coverGradient: string | null;
  htmlPath: string;
  pdfPath: string;
  coverPath: string | null;
  highlights: string[];
  unlockPackSlug: string;
};

// IOAID · SaaS UX: ordenação estável por (category, order) para agrupar coleções
function sortByCategoryOrder<T extends {category?: string; order?: number; title?: string}>(arr: T[]): T[] {
  return [...arr].sort((a, b) => {
    const c = (a.category || '').localeCompare(b.category || '', 'pt-BR');
    if (c !== 0) return c;
    const o = (a.order ?? 999) - (b.order ?? 999);
    if (o !== 0) return o;
    return (a.title || '').localeCompare(b.title || '', 'pt-BR');
  });
}

export default function MarketplaceEbooksPage() {
  const ebooksQuery = trpc.marketplaceNexus.listEbooks.useQuery();
  const packsQuery = trpc.marketplaceNexus.listPacks.useQuery();
  const cartQuery = trpc.marketplaceNexus.getCart.useQuery(undefined, {
    retry: false,
    refetchOnMount: false,
  });
  const utils = trpc.useUtils();

  const addItem = trpc.marketplaceNexus.addToCart.useMutation({
    onSuccess: () => {
      utils.marketplaceNexus.getCart.invalidate();
    },
  });

  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterPack, setFilterPack] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  const ebooks = (ebooksQuery.data ?? []) as Ebook[];

  const categories = useMemo(() => {
    const set = new Set<string>();
    ebooks.forEach((e) => set.add(e.category));
    return Array.from(set).sort();
  }, [ebooks]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sortByCategoryOrder(ebooks.filter((e) => {
      if (filterCategory && e.category !== filterCategory) return false;
      if (filterPack && e.unlockPackSlug !== filterPack) return false;
      if (q && !`${e.title} ${e.subtitle ?? ""} ${e.description ?? ""}`.toLowerCase().includes(q))
        return false;
      return true;
    }));
  }, [ebooks, filterCategory, filterPack, search]);

  const cartCount = cartQuery.data?.lines.length ?? 0;
  const cartTotal = cartQuery.data?.totalCents ?? 0;
  const isAuth = !cartQuery.error;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <header className="sticky top-0 z-30 backdrop-blur bg-slate-950/70 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Marketplace Nexus</h1>
            <p className="text-xs text-slate-400">
              {ebooks.length} e-books · {packsQuery.data?.length ?? 0} packs · custo R$ 0,50 · venda R$ 0,99
            </p>
          </div>
          <Link href="/marketplaces/cart">
            <a className="relative px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold transition">
              🛒 {BRL(cartTotal)}
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </a>
          </Link>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 py-6">
        {/* Filtros */}
        <div className="grid md:grid-cols-3 gap-3 mb-6">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Buscar título, descrição..."
            className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm"
          >
            <option value="">Todas as coleções</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={filterPack}
            onChange={(e) => setFilterPack(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm"
          >
            <option value="">Todos os Packs</option>
            {(packsQuery.data ?? [])
              .filter((p) => ["affiliate", "predictive"].includes(p.type))
              .map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name} ({p.ebookPoolSize} ebooks)
                </option>
              ))}
          </select>
        </div>

        {/* Status */}
        {ebooksQuery.isLoading && <p className="text-center py-12">Carregando catálogo...</p>}
        {ebooksQuery.error && (
          <p className="text-center py-12 text-red-400">
            Erro ao carregar catálogo: {ebooksQuery.error.message}
          </p>
        )}

        {/* Vitrine */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((eb) => (
            <article
              key={eb.slug}
              className="group bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden hover:border-emerald-500/40 transition flex flex-col"
            >
              <div
                className="h-44 relative"
                style={{
                  background:
                    eb.coverGradient ??
                    "linear-gradient(135deg,#1e293b 0%,#0f172a 100%)",
                }}
              >
                {eb.coverPath && (
                  <img
                    src={eb.coverPath}
                    alt={eb.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition"
                    loading="lazy"
                  />
                )}
                <span className="absolute top-2 right-2 bg-emerald-500 text-slate-950 text-xs font-bold px-2 py-0.5 rounded-full">
                  {BRL(eb.costCents)}
                </span>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <p className="text-[10px] uppercase tracking-wider text-emerald-400/80 mb-1">
                  {eb.category}
                </p>
                <h3 className="font-bold text-sm leading-snug mb-1 line-clamp-2">{eb.title}</h3>
                {eb.subtitle && eb.subtitle !== eb.title && (
                  <p className="text-xs text-slate-400 mb-2 line-clamp-2">{eb.subtitle}</p>
                )}
                <p className="text-xs text-slate-500 mt-auto">
                  {eb.pages} páginas · pack {eb.unlockPackSlug}
                </p>
                <div className="mt-3 flex gap-2">
                  <a
                    href={eb.htmlPath}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 text-center bg-slate-800 hover:bg-slate-700 rounded-lg py-2 text-xs font-semibold"
                  >
                    Prévia
                  </a>
                  <button
                    disabled={!isAuth || addItem.isPending}
                    onClick={() =>
                      addItem.mutate({ itemType: "ebook", itemSlug: eb.slug })
                    }
                    className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 rounded-lg py-2 text-xs font-bold"
                  >
                    {isAuth ? "+ Carrinho" : "Login"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filtered.length === 0 && !ebooksQuery.isLoading && (
          <p className="text-center text-slate-500 py-12">Nenhum e-book encontrado com esses filtros.</p>
        )}
      </section>

      {/* Banner Packs */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        <h2 className="text-2xl font-bold mb-4">Compre um Pack e desbloqueie ebooks aleatoriamente</h2>
        <p className="text-slate-400 text-sm mb-6">
          Cada pack libera uma quantidade fixa de ebooks sorteados do pool. Sorteio determinístico e auditável (seed
          SHA-256 registrado).
        </p>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {(packsQuery.data ?? []).slice(0, 5).map((p) => (
            <button
              key={p.code}
              onClick={() => addItem.mutate({ itemType: "pack", itemSlug: p.code })}
              disabled={!isAuth || addItem.isPending}
              className="text-left bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-4 transition disabled:opacity-40"
              style={{ borderTopColor: p.color ?? undefined, borderTopWidth: 3 }}
            >
              <p className="text-xs uppercase text-slate-400 mb-1">{p.type}</p>
              <h3 className="font-bold text-sm leading-tight mb-2">{p.name}</h3>
              <p className="text-emerald-400 font-bold text-lg">{BRL(p.priceCents)}</p>
              <p className="text-xs text-slate-500 mt-1">
                {p.ebookQuotaIfPurchased} ebooks aleatórios de {p.ebookPoolSize}
              </p>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
