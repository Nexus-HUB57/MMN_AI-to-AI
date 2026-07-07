/**
 * MarketplaceEbooks — Vitrine do Marketplace Nexus (v2 — UX Premium)
 *
 * Features:
 *  1. Cabeçalho sticky por coleção (scroll spy + âncoras + scroll suave)
 *  2. Busca com debounce + highlight
 *  3. Skeleton loading enquanto API responde
 *  4. Toggle: grade densa ↔ carrossel horizontal por coleção (Netflix-style)
 *  5. Quick-view modal ao clicar na capa
 *  6. Toggle de visualização (compact / large / carousel)
 *
 * Usa /api/trpc/marketplaceNexus.*
 */
import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { sortByCollectionRank } from "@/lib/collectionRanking";
import { Link } from "wouter";
import { trpc } from "../lib/trpc";

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

type ViewMode = "compact" | "large" | "carousel";

// ────────────────────────────────────────────────────────────────────────────
// Hook: debounce
// ────────────────────────────────────────────────────────────────────────────
function useDebounce<T>(value: T, delay = 250): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

// ────────────────────────────────────────────────────────────────────────────
// Highlight do termo buscado
// ────────────────────────────────────────────────────────────────────────────
function highlight(text: string, q: string) {
  if (!q.trim()) return text;
  const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig");
  const parts = text.split(re);
  return parts.map((p, i) =>
    re.test(p) ? (
      <mark key={i} className="bg-cyan-400/30 text-cyan-100 rounded px-0.5">
        {p}
      </mark>
    ) : (
      <span key={i}>{p}</span>
    )
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Skeleton placeholder
// ────────────────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden animate-pulse">
      <div className="h-44 bg-slate-800/60" />
      <div className="p-4 space-y-2">
        <div className="h-3 w-1/2 bg-slate-800 rounded" />
        <div className="h-4 w-full bg-slate-800 rounded" />
        <div className="h-3 w-2/3 bg-slate-800 rounded" />
        <div className="flex gap-2 mt-3">
          <div className="h-8 flex-1 bg-slate-800 rounded-lg" />
          <div className="h-8 flex-1 bg-slate-800 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Quick-view modal
// ────────────────────────────────────────────────────────────────────────────
function QuickViewModal({
  ebook,
  onClose,
  onAdd,
  isAuth,
  isPending,
  searchTerm,
}: {
  ebook: Ebook;
  onClose: () => void;
  onAdd: () => void;
  isAuth: boolean;
  isPending: boolean;
  searchTerm: string;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="qv-title"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 to-slate-950 border border-cyan-500/30 rounded-3xl shadow-2xl shadow-cyan-500/20"
      >
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-xl"
        >
          ×
        </button>
        <div className="grid md:grid-cols-2 gap-0">
          <div
            className="h-72 md:h-full relative"
            style={{ background: ebook.coverGradient ?? "linear-gradient(135deg,#1e293b,#0f172a)" }}
          >
            {ebook.coverPath && (
              <img
                src={ebook.coverPath}
                alt={ebook.title}
                className="absolute inset-0 w-full h-full object-cover"
                loading="eager"
                decoding="async"
              />
            )}
          </div>
          <div className="p-6 flex flex-col">
            <p className="text-[11px] uppercase tracking-wider text-cyan-300 font-semibold mb-2">
              {ebook.category}
            </p>
            <h2 id="qv-title" className="text-2xl font-bold mb-2 leading-tight">
              {highlight(ebook.title, searchTerm)}
            </h2>
            {ebook.subtitle && ebook.subtitle !== ebook.title && (
              <p className="text-slate-300 mb-3">{highlight(ebook.subtitle, searchTerm)}</p>
            )}
            {ebook.description && (
              <p className="text-sm text-slate-400 mb-4 line-clamp-6">
                {highlight(ebook.description, searchTerm)}
              </p>
            )}
            <div className="grid grid-cols-2 gap-3 text-xs text-slate-300 my-3">
              <div className="bg-slate-800/50 rounded-lg p-3">
                <p className="text-slate-500">Páginas</p>
                <p className="font-bold text-lg">{ebook.pages}</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <p className="text-slate-500">Pack</p>
                <p className="font-bold text-sm">{ebook.unlockPackSlug}</p>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
                <p className="text-slate-400">Custo</p>
                <p className="font-bold text-lg text-emerald-300">{BRL(ebook.costCents)}</p>
              </div>
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3">
                <p className="text-slate-400">Revenda sugerida</p>
                <p className="font-bold text-lg text-cyan-300">{BRL(ebook.resalePriceCents)}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-auto">
              <a
                href={ebook.htmlPath}
                target="_blank"
                rel="noreferrer"
                className="flex-1 text-center bg-slate-800 hover:bg-slate-700 rounded-xl py-3 text-sm font-semibold transition"
              >
                Ver Prévia
              </a>
              <button
                disabled={!isAuth || isPending}
                onClick={onAdd}
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 rounded-xl py-3 text-sm font-bold transition"
              >
                {isAuth ? "+ Adicionar ao Carrinho" : "Faça Login"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Card de ebook
// ────────────────────────────────────────────────────────────────────────────
function EbookCard({
  eb,
  searchTerm,
  isAuth,
  isPending,
  onAdd,
  onQuickView,
  compact,
}: {
  eb: Ebook;
  searchTerm: string;
  isAuth: boolean;
  isPending: boolean;
  onAdd: () => void;
  onQuickView: () => void;
  compact?: boolean;
}) {
  return (
    <article
      className={[
        "group bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden",
        "hover:border-cyan-500/40 transition-all duration-300",
        "hover:scale-[1.02] hover:shadow-2xl hover:shadow-cyan-500/20",
        "flex flex-col",
        compact ? "" : "",
      ].join(" ")}
    >
      <button
        onClick={onQuickView}
        aria-label={`Quick view: ${eb.title}`}
        className={`${compact ? "h-36" : "h-52"} relative cursor-pointer block w-full overflow-hidden`}
        style={{
          background: eb.coverGradient ?? "linear-gradient(135deg,#1e293b,#0f172a)",
        }}
      >
        {eb.coverPath && (
          <img
            loading="lazy"
            decoding="async"
            src={eb.coverPath}
            alt={eb.title}
            className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />
        <span className="absolute top-2 right-2 bg-emerald-500 text-slate-950 text-xs font-bold px-2 py-0.5 rounded-full shadow-lg">
          {BRL(eb.costCents)}
        </span>
        <span className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition bg-cyan-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full">
          👁 Ver detalhes
        </span>
      </button>
      <div className="p-4 flex-1 flex flex-col">
        <p className="text-[10px] uppercase tracking-wider text-cyan-400/80 mb-1">
          {eb.category}
        </p>
        <h3 className={`font-bold ${compact ? "text-xs" : "text-sm"} leading-snug mb-1 line-clamp-2`}>
          {highlight(eb.title, searchTerm)}
        </h3>
        {!compact && eb.subtitle && eb.subtitle !== eb.title && (
          <p className="text-xs text-slate-400 mb-2 line-clamp-2">
            {highlight(eb.subtitle, searchTerm)}
          </p>
        )}
        <p className="text-xs text-slate-500 mt-auto">
          {eb.pages} págs · {eb.unlockPackSlug}
        </p>
        <div className="mt-3 flex gap-2">
          <a
            href={eb.htmlPath}
            target="_blank"
            rel="noreferrer"
            className="flex-1 text-center bg-slate-800 hover:bg-slate-700 rounded-lg py-2 text-xs font-semibold transition"
          >
            Prévia
          </a>
          <button
            disabled={!isAuth || isPending}
            onClick={onAdd}
            className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 rounded-lg py-2 text-xs font-bold transition"
          >
            {isAuth ? "+ Carrinho" : "Login"}
          </button>
        </div>
      </div>
    </article>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Carrossel horizontal por coleção
// ────────────────────────────────────────────────────────────────────────────
function CarouselRow({
  ebooks,
  cardProps,
}: {
  ebooks: Ebook[];
  cardProps: Omit<Parameters<typeof EbookCard>[0], "eb">;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => {
    if (!ref.current) return;
    ref.current.scrollBy({ left: dir * 600, behavior: "smooth" });
  };
  return (
    <div className="relative group/row">
      <button
        onClick={() => scroll(-1)}
        aria-label="Anterior"
        className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-slate-950/80 hover:bg-cyan-500 hover:text-slate-950 items-center justify-center opacity-0 group-hover/row:opacity-100 transition shadow-xl"
      >
        ‹
      </button>
      <button
        onClick={() => scroll(1)}
        aria-label="Próximo"
        className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-slate-950/80 hover:bg-cyan-500 hover:text-slate-950 items-center justify-center opacity-0 group-hover/row:opacity-100 transition shadow-xl"
      >
        ›
      </button>
      <div
        ref={ref}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 px-2 scroll-smooth scrollbar-thin scrollbar-thumb-slate-700"
        style={{ scrollbarWidth: "thin" }}
      >
        {ebooks.map((eb) => (
          <div key={eb.slug} className="snap-start flex-shrink-0 w-56 md:w-64">
            <EbookCard
              eb={eb}
              {...cardProps}
              onAdd={() => cardProps.onAdd()}
              onQuickView={() => cardProps.onQuickView()}
              compact
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Página principal
// ────────────────────────────────────────────────────────────────────────────
export default function MarketplaceEbooksPage() {
  const ebooksQuery = trpc.marketplaceNexus.listEbooks.useQuery();
  const packsQuery = trpc.marketplaceNexus.listPacks.useQuery();
  const cartQuery = trpc.marketplaceNexus.getCart.useQuery(undefined, {
    retry: false,
    refetchOnMount: false,
  });
  const utils = trpc.useUtils();

  const addItem = trpc.marketplaceNexus.addToCart.useMutation({
    onSuccess: () => utils.marketplaceNexus.getCart.invalidate(),
  });

  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterPack, setFilterPack] = useState<string>("");
  const [searchRaw, setSearchRaw] = useState<string>("");
  const search = useDebounce(searchRaw, 220);

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window === "undefined") return "compact";
    return (localStorage.getItem("nexus_viewmode") as ViewMode) || "compact";
  });
  useEffect(() => {
    localStorage.setItem("nexus_viewmode", viewMode);
  }, [viewMode]);

  const [quickView, setQuickView] = useState<Ebook | null>(null);

  const ebooks = (ebooksQuery.data ?? []) as Ebook[];

  const categories = useMemo(() => {
    const set = new Set<string>();
    ebooks.forEach((e) => set.add(e.category));
    return Array.from(set);
  }, [ebooks]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sortByCollectionRank(
      ebooks.filter((e) => {
        if (filterCategory && e.category !== filterCategory) return false;
        if (filterPack && e.unlockPackSlug !== filterPack) return false;
        if (q && !`${e.title} ${e.subtitle ?? ""} ${e.description ?? ""}`.toLowerCase().includes(q))
          return false;
        return true;
      })
    );
  }, [ebooks, filterCategory, filterPack, search]);

  // Agrupar por coleção mantendo ordem do sortByCollectionRank
  const groups = useMemo(() => {
    const map = new Map<string, Ebook[]>();
    filtered.forEach((e) => {
      const k = e.category || "Outras";
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(e);
    });
    return Array.from(map.entries()); // já ordenado pelo sort
  }, [filtered]);

  // Slug helpers
  const slugify = useCallback(
    (s: string) => "col-" + s.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    []
  );

  // Scroll-spy: detecta coleção visível
  const [activeAnchor, setActiveAnchor] = useState<string>("");
  useEffect(() => {
    if (groups.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveAnchor(visible[0].target.id);
      },
      { rootMargin: "-30% 0% -55% 0%", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    groups.forEach(([cat]) => {
      const el = document.getElementById(slugify(cat));
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [groups, slugify]);

  const scrollToAnchor = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const cartCount = cartQuery.data?.lines.length ?? 0;
  const cartTotal = cartQuery.data?.totalCents ?? 0;
  const isAuth = !cartQuery.error;

  const cardCommonProps = (eb: Ebook) => ({
    searchTerm: search,
    isAuth,
    isPending: addItem.isPending,
    onAdd: () => addItem.mutate({ itemType: "ebook" as const, itemSlug: eb.slug }),
    onQuickView: () => setQuickView(eb),
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header principal */}
      <header className="sticky top-0 z-30 backdrop-blur bg-slate-950/85 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-bold truncate">Marketplace Nexus</h1>
            <p className="text-[11px] text-slate-400 truncate">
              {ebooks.length} ebooks · {packsQuery.data?.length ?? 0} packs · custo R$ 0,50 · venda R$ 0,99
            </p>
          </div>
          <Link href="/marketplaces?openCart=1">
            <a className="relative px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold transition shrink-0">
              🛒 {BRL(cartTotal)}
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </a>
          </Link>
        </div>

        {/* Sub-header: filtros + view toggle */}
        <div className="max-w-7xl mx-auto px-4 pb-3 grid md:grid-cols-[1fr_auto_auto_auto] gap-2">
          <div className="relative">
            <input
              value={searchRaw}
              onChange={(e) => setSearchRaw(e.target.value)}
              placeholder="🔍 Buscar título, subtítulo, descrição…"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
              aria-label="Buscar ebook"
            />
            {searchRaw && (
              <button
                onClick={() => setSearchRaw("")}
                aria-label="Limpar busca"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-700 hover:bg-slate-600 text-xs"
              >
                ×
              </button>
            )}
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500"
            aria-label="Filtrar por coleção"
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
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500"
            aria-label="Filtrar por pack"
          >
            <option value="">Todos os Packs</option>
            {(packsQuery.data ?? [])
              .filter((p) => ["affiliate", "predictive"].includes(p.type))
              .map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
          </select>
          {/* View mode toggle */}
          <div role="radiogroup" aria-label="Modo de visualização" className="flex bg-slate-900 border border-slate-700 rounded-xl overflow-hidden text-xs">
            {(
              [
                { v: "compact", label: "▦", title: "Grade densa" },
                { v: "large", label: "▢", title: "Cards grandes" },
                { v: "carousel", label: "↔", title: "Carrossel horizontal" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.v}
                role="radio"
                aria-checked={viewMode === opt.v}
                title={opt.title}
                onClick={() => setViewMode(opt.v)}
                className={`px-3 py-2 transition ${
                  viewMode === opt.v
                    ? "bg-cyan-500 text-slate-950 font-bold"
                    : "hover:bg-slate-800"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs de coleções (scroll-spy) */}
        {!ebooksQuery.isLoading && groups.length > 1 && (
          <nav
            aria-label="Coleções"
            className="max-w-7xl mx-auto px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-thin"
          >
            {groups.map(([cat, items]) => {
              const id = slugify(cat);
              const active = activeAnchor === id;
              return (
                <button
                  key={cat}
                  onClick={() => scrollToAnchor(id)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition border ${
                    active
                      ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/30"
                      : "bg-slate-900/60 border-slate-700 text-slate-300 hover:border-cyan-500/40 hover:text-cyan-200"
                  }`}
                >
                  {cat} <span className="opacity-60">· {items.length}</span>
                </button>
              );
            })}
          </nav>
        )}
      </header>

      <section className="max-w-7xl mx-auto px-4 py-6">
        {/* Skeleton */}
        {ebooksQuery.isLoading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}
        {ebooksQuery.error && (
          <p className="text-center py-12 text-red-400">
            Erro ao carregar catálogo: {ebooksQuery.error.message}
          </p>
        )}

        {/* Vitrine agrupada */}
        {!ebooksQuery.isLoading && (
          <div className="space-y-12">
            {groups.map(([cat, items]) => {
              const id = slugify(cat);
              return (
                <section key={cat} id={id} className="scroll-mt-44">
                  <div className="flex items-baseline justify-between mb-4 border-b border-slate-800 pb-2">
                    <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent">
                      {cat}
                    </h2>
                    <span className="text-xs text-slate-400">{items.length} ebooks</span>
                  </div>

                  {viewMode === "carousel" ? (
                    <div className="relative group/row">
                      <CarouselScroll items={items} cardPropsFn={cardCommonProps} />
                    </div>
                  ) : (
                    <div
                      className={
                        viewMode === "compact"
                          ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3"
                          : "grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                      }
                    >
                      {items.map((eb) => (
                        <EbookCard
                          key={eb.slug}
                          eb={eb}
                          {...cardCommonProps(eb)}
                          compact={viewMode === "compact"}
                        />
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}

        {filtered.length === 0 && !ebooksQuery.isLoading && (
          <div className="text-center py-16">
            <p className="text-5xl mb-3">🔍</p>
            <p className="text-slate-400 mb-2">Nenhum ebook encontrado com esses filtros.</p>
            <button
              onClick={() => {
                setSearchRaw("");
                setFilterCategory("");
                setFilterPack("");
              }}
              className="text-cyan-400 hover:text-cyan-300 text-sm underline"
            >
              Limpar filtros
            </button>
          </div>
        )}
      </section>

      {/* Banner Packs */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        <h2 className="text-2xl font-bold mb-2">
          Compre um Pack e desbloqueie ebooks aleatoriamente
        </h2>
        <p className="text-slate-400 text-sm mb-6">
          Cada pack libera uma quantidade fixa de ebooks sorteados do pool. Sorteio determinístico
          e auditável (seed SHA-256 registrado).
        </p>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {(packsQuery.data ?? []).slice(0, 5).map((p) => (
            <button
              key={p.code}
              onClick={() => addItem.mutate({ itemType: "pack", itemSlug: p.code })}
              disabled={!isAuth || addItem.isPending}
              className="text-left bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-4 transition disabled:opacity-40 hover:scale-[1.02] hover:shadow-xl hover:shadow-cyan-500/10 duration-300"
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

      {/* Quick-view modal */}
      {quickView && (
        <QuickViewModal
          ebook={quickView}
          onClose={() => setQuickView(null)}
          onAdd={() => {
            addItem.mutate({ itemType: "ebook", itemSlug: quickView.slug });
            setQuickView(null);
          }}
          isAuth={isAuth}
          isPending={addItem.isPending}
          searchTerm={search}
        />
      )}

      {/* FAB voltar ao topo */}
      <BackToTop />
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Carousel scroller (componente interno)
// ────────────────────────────────────────────────────────────────────────────
function CarouselScroll({
  items,
  cardPropsFn,
}: {
  items: Ebook[];
  cardPropsFn: (eb: Ebook) => Omit<Parameters<typeof EbookCard>[0], "eb">;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => {
    if (!ref.current) return;
    ref.current.scrollBy({ left: dir * 600, behavior: "smooth" });
  };
  return (
    <div className="relative group/row -mx-4 md:mx-0">
      <button
        onClick={() => scroll(-1)}
        aria-label="Anterior"
        className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-slate-950/90 hover:bg-cyan-500 hover:text-slate-950 items-center justify-center opacity-0 group-hover/row:opacity-100 transition shadow-xl text-xl font-bold"
      >
        ‹
      </button>
      <button
        onClick={() => scroll(1)}
        aria-label="Próximo"
        className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-slate-950/90 hover:bg-cyan-500 hover:text-slate-950 items-center justify-center opacity-0 group-hover/row:opacity-100 transition shadow-xl text-xl font-bold"
      >
        ›
      </button>
      <div
        ref={ref}
        className="flex gap-4 overflow-x-auto snap-x pb-3 px-4 md:px-2 scroll-smooth"
        style={{ scrollbarWidth: "thin" }}
      >
        {items.map((eb) => (
          <div key={eb.slug} className="snap-start flex-shrink-0 w-48 md:w-56">
            <EbookCard eb={eb} {...cardPropsFn(eb)} compact />
          </div>
        ))}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// FAB voltar ao topo
// ────────────────────────────────────────────────────────────────────────────
function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!show) return null;
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Voltar ao topo"
      className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xl shadow-xl shadow-cyan-500/40 transition hover:scale-110"
    >
      ↑
    </button>
  );
}
