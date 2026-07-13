import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import {
  FlaskConical,
  Search,
  ExternalLink,
  Bot,
  Wand2,
  Zap,
  BookOpen,
  ArrowRight,
  FileText,
  Cpu,
  Sparkles,
  Loader2,
  MessageSquare,
  Workflow,
  PenTool,
  BarChart3,
  Shield,
  Rocket,
  Copy,
  Download,
  Eye,
  X,
  Star,
  Bookmark,
  BookmarkPlus,
  History,
} from "lucide-react";

/**
 * Lab Nexus Hub — Playground de IA e Automação · v2 · Onda 39
 * ---------------------------------------------------------------------------
 * - Query real academiaPublic.listPublished(sectionSlug=lab)
 * - Categorização por prompts/copywriting|analise|estrategia|governanca|integracao
 * - Filtros multi-select + busca + destaques
 * - Ações rápidas: HTML/PDF/MD
 * - Favoritos + recent (localStorage)
 * - Integração destacada com Lab Chatbot
 * - Link direto para lição via /academia/ead/lab/:lessonId
 */

const LAB_STORAGE_KEY = "nexus-lab-nexus-state-v2";

type CategoryMeta = {
  slug: string;
  title: string;
  description: string;
  icon: any;
  accent: string;
  keywords: string[];
};

const LAB_CATEGORIES: CategoryMeta[] = [
  {
    slug: "copywriting",
    title: "Copywriting",
    description: "Headlines persuasivas, subject lines, scripts VSL, copy de anúncio, templates de e-mail",
    icon: PenTool,
    accent: "from-quantum-cyan/40 to-quantum-purple/10",
    keywords: ["headline", "copy", "subject", "email", "e-mail", "vsl", "anuncio", "anúncio", "carrossel", "script"],
  },
  {
    slug: "analise",
    title: "Análise & Dados",
    description: "Análise de coorte, churn, funil de conversão, benchmark competitivo, RFM",
    icon: BarChart3,
    accent: "from-emerald-400/40 to-cyan-400/10",
    keywords: ["análise", "analise", "coorte", "churn", "funil", "benchmark", "rfm", "diagnóstico", "diagnostico", "comparador", "taxas"],
  },
  {
    slug: "estrategia",
    title: "Estratégia",
    description: "Planejamento de lançamento, OKR trimestral, plano de conteúdo, posicionamento",
    icon: Rocket,
    accent: "from-amber-400/40 to-quantum-cyan/10",
    keywords: ["planejamento", "lançamento", "lancamento", "okr", "estratég", "posicionamento", "plano", "editorial"],
  },
  {
    slug: "governanca",
    title: "Governança",
    description: "Decisões C-Suite, ratificação, judge revisor, compliance operacional",
    icon: Shield,
    accent: "from-rose-400/40 to-quantum-cyan/10",
    keywords: ["decisão", "decisao", "c-suite", "csuite", "ratifica", "governança", "governanca", "judge", "compliance"],
  },
  {
    slug: "integracao",
    title: "Integração & Automação",
    description: "Webhooks payloads, workflows n8n/Make, automações e conectores",
    icon: Workflow,
    accent: "from-quantum-purple/40 to-quantum-cyan/10",
    keywords: ["webhook", "payload", "workflow", "n8n", "make", "integração", "integracao", "automação", "automacao"],
  },
  {
    slug: "prompt",
    title: "Prompts Prontos",
    description: "Prompts otimizados por caso de uso, prontos para produção",
    icon: Wand2,
    accent: "from-cyan-400/40 to-quantum-purple/10",
    keywords: ["prompt", "briefing", "criativo", "segmentação", "segmentacao"],
  },
];

function classifyLesson(lesson: any): string {
  const idLower = String(lesson.lesson_id || "").toLowerCase();
  const title = String(lesson.title || "").toLowerCase();
  const tags = Array.isArray(lesson.tags) ? lesson.tags.join(" ").toLowerCase() : "";
  const haystack = `${idLower} ${title} ${tags}`;
  for (const cat of LAB_CATEGORIES) {
    if (cat.keywords.some((kw) => haystack.includes(kw))) return cat.slug;
  }
  return "prompt";
}

type PersistedState = {
  favorites: string[];
  recent: string[];
};

function loadState(): PersistedState {
  if (typeof window === "undefined") return { favorites: [], recent: [] };
  try {
    return JSON.parse(window.localStorage.getItem(LAB_STORAGE_KEY) || "{}") as PersistedState;
  } catch {
    return { favorites: [], recent: [] };
  }
}
function saveState(s: PersistedState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LAB_STORAGE_KEY, JSON.stringify(s));
}

export default function LabNexus() {
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [onlyFeatured, setOnlyFeatured] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const s = loadState();
    setFavorites(s.favorites || []);
    setRecent(s.recent || []);
  }, []);

  const lessonsQuery = (trpc as any).academiaPublic?.listPublished?.useQuery(
    { sectionSlug: "lab", limit: 200 },
    { retry: false }
  );

  const lessons = (lessonsQuery?.data?.items ?? []) as any[];
  const loading = lessonsQuery?.isLoading;

  const withCategory = useMemo(
    () => lessons.map((l) => ({ ...l, _cat: classifyLesson(l) })),
    [lessons]
  );

  const filteredLessons = useMemo(() => {
    let list = withCategory;
    if (selectedCategories.size > 0) {
      list = list.filter((l) => selectedCategories.has(l._cat));
    }
    if (onlyFeatured) list = list.filter((l) => l.featured === true);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((l) =>
        `${l.title ?? ""} ${l.subtitle ?? ""} ${l.lesson_id ?? ""} ${(l.tags ?? []).join(" ")}`
          .toLowerCase()
          .includes(q)
      );
    }
    return list;
  }, [withCategory, selectedCategories, search, onlyFeatured]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const cat of LAB_CATEGORIES) counts[cat.slug] = 0;
    for (const l of withCategory) counts[l._cat] = (counts[l._cat] ?? 0) + 1;
    return counts;
  }, [withCategory]);

  const featuredCount = withCategory.filter((l) => l.featured).length;
  const recentLessons = useMemo(
    () =>
      recent
        .map((id) => withCategory.find((l) => l.lesson_id === id))
        .filter(Boolean)
        .slice(0, 4),
    [recent, withCategory]
  );
  const favoriteLessons = useMemo(
    () => withCategory.filter((l) => favorites.includes(l.lesson_id)),
    [favorites, withCategory]
  );

  const toggleCategory = (slug: string) => {
    const next = new Set(selectedCategories);
    if (next.has(slug)) next.delete(slug);
    else next.add(slug);
    setSelectedCategories(next);
  };

  const toggleFavorite = (lessonId: string) => {
    const next = favorites.includes(lessonId)
      ? favorites.filter((f) => f !== lessonId)
      : [...favorites, lessonId];
    setFavorites(next);
    saveState({ favorites: next, recent });
  };

  const registerRecent = (lessonId: string) => {
    const next = [lessonId, ...recent.filter((r) => r !== lessonId)].slice(0, 8);
    setRecent(next);
    saveState({ favorites, recent: next });
  };

  const copyMarkdown = async (lesson: any) => {
    if (!lesson.md_url) return;
    try {
      const res = await fetch(lesson.md_url);
      const text = await res.text();
      await navigator.clipboard.writeText(text);
      setCopied(lesson.lesson_id);
      setTimeout(() => setCopied((v) => (v === lesson.lesson_id ? null : v)), 1800);
    } catch (err) {
      console.error("Copy MD failed", err);
    }
  };

  const clearFilters = () => {
    setSelectedCategories(new Set());
    setOnlyFeatured(false);
    setSearch("");
  };
  const anyFilterActive = selectedCategories.size > 0 || onlyFeatured || search.trim().length > 0;

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-12">
        {/* HERO */}
        <section className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(0,229,255,0.14),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(139,92,246,0.14),transparent_30%),rgba(255,255,255,0.03)] p-8 md:p-10 shadow-2xl shadow-black/40">
          <div className="max-w-3xl">
            <Badge className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan font-mono text-[11px] uppercase tracking-[0.24em]">
              🧪 Nexus Academ'IA · Lab Nexus
            </Badge>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-white md:text-5xl">
              Playground de{" "}
              <span className="bg-gradient-to-r from-quantum-cyan to-quantum-purple bg-clip-text text-transparent">
                IA e Automação
              </span>
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-300 md:text-lg">
              Experimentos, prompts prontos, workflows n8n/Make, templates de mensagem e conversações
              multi-IA com Alencar, Ravi, Helena, Otto e Otávio. Tudo que sua operação precisa para escalar
              com inteligência artificial.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                <p className="text-[10px] uppercase tracking-widest text-slate-500">Total labs</p>
                <p className="text-xl font-bold text-white">{lessons.length}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                <p className="text-[10px] uppercase tracking-widest text-slate-500">Categorias</p>
                <p className="text-xl font-bold text-white">{LAB_CATEGORIES.length}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                <p className="text-[10px] uppercase tracking-widest text-slate-500">Destaques</p>
                <p className="text-xl font-bold text-amber-400">{featuredCount}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                <p className="text-[10px] uppercase tracking-widest text-slate-500">Favoritos</p>
                <p className="text-xl font-bold text-emerald-400">{favorites.length}</p>
              </div>
            </div>
          </div>
        </section>

        {/* CHATBOT CTA */}
        <section className="rounded-[24px] border border-quantum-cyan/40 bg-gradient-to-r from-quantum-cyan/10 to-quantum-purple/10 p-6 shadow-xl shadow-quantum-cyan/10">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-quantum-cyan/20">
                <Bot className="h-7 w-7 text-quantum-cyan" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Chatbot Multi-IA · Alencar & Ive</h3>
                <p className="mt-1 text-sm text-slate-300">
                  Converse com nossos personas técnicos (Alencar) e de negócios (Ive) em tempo real. Use prompts prontos
                  para acelerar cada tarefa da sua operação.
                </p>
              </div>
            </div>
            <Link
              href="/academia/lab-nexus/chatbot"
              className="inline-flex items-center gap-2 rounded-xl border border-quantum-cyan bg-quantum-cyan px-6 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-quantum-cyan/30 transition hover:bg-quantum-cyan/90"
            >
              <MessageSquare className="h-4 w-4" />
              Abrir Chatbot
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* RECENT + FAVORITES */}
        {(recentLessons.length > 0 || favoriteLessons.length > 0) && (
          <section className="grid gap-6 md:grid-cols-2">
            {recentLessons.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                <div className="mb-3 flex items-center gap-2">
                  <History className="h-4 w-4 text-quantum-cyan" />
                  <h3 className="text-sm font-semibold text-white">Vistos recentemente</h3>
                </div>
                <div className="space-y-2">
                  {recentLessons.map((l: any) => (
                    <Link
                      key={l.lesson_id}
                      href={`/academia/ead/lab/${l.lesson_id}`}
                      onClick={() => registerRecent(l.lesson_id)}
                      className="flex items-center justify-between rounded-lg border border-white/5 bg-black/30 px-3 py-2 text-xs hover:border-quantum-cyan/30"
                    >
                      <span className="truncate text-slate-200">{l.title || l.lesson_id}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {favoriteLessons.length > 0 && (
              <div className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.03] p-5">
                <div className="mb-3 flex items-center gap-2">
                  <Bookmark className="h-4 w-4 text-amber-400" />
                  <h3 className="text-sm font-semibold text-white">Favoritos</h3>
                </div>
                <div className="space-y-2">
                  {favoriteLessons.slice(0, 6).map((l: any) => (
                    <Link
                      key={l.lesson_id}
                      href={`/academia/ead/lab/${l.lesson_id}`}
                      onClick={() => registerRecent(l.lesson_id)}
                      className="flex items-center justify-between rounded-lg border border-white/5 bg-black/30 px-3 py-2 text-xs hover:border-amber-400/30"
                    >
                      <span className="truncate text-slate-200">{l.title || l.lesson_id}</span>
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* FILTROS */}
        <section className="rounded-[24px] border border-white/10 bg-white/[0.02] p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por título, subtítulo, tag ou lesson_id..."
                className="h-11 rounded-xl border-white/10 bg-black/30 pl-9 text-sm text-white placeholder:text-slate-500"
              />
            </div>
            <button
              onClick={() => setOnlyFeatured((v) => !v)}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold transition ${
                onlyFeatured
                  ? "border-amber-400/40 bg-amber-400/10 text-amber-300"
                  : "border-white/10 bg-black/30 text-slate-400 hover:border-amber-400/30"
              }`}
            >
              <Star className={`h-3.5 w-3.5 ${onlyFeatured ? "fill-amber-400" : ""}`} />
              Só destaques
            </button>
            {anyFilterActive && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-xs font-semibold text-slate-400 hover:border-red-400/30 hover:text-red-300"
              >
                <X className="h-3.5 w-3.5" />
                Limpar filtros
              </button>
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {LAB_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const count = categoryCounts[cat.slug] ?? 0;
              const active = selectedCategories.has(cat.slug);
              return (
                <button
                  key={cat.slug}
                  onClick={() => toggleCategory(cat.slug)}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    active
                      ? "border-quantum-cyan bg-quantum-cyan text-slate-950 shadow-lg shadow-quantum-cyan/30"
                      : "border-white/10 bg-black/30 text-slate-300 hover:border-quantum-cyan/40 hover:text-quantum-cyan"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {cat.title}
                  <span className="rounded-full bg-black/40 px-1.5 py-0.5 text-[10px]">{count}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* GRID CATEGORIA */}
        {selectedCategories.size === 0 && !search.trim() && !onlyFeatured && (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {LAB_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const count = categoryCounts[cat.slug] ?? 0;
              return (
                <button
                  key={cat.slug}
                  onClick={() => toggleCategory(cat.slug)}
                  className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${cat.accent} p-5 text-left transition hover:border-quantum-cyan/40 hover:shadow-2xl hover:shadow-quantum-cyan/10`}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-black/40">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <Badge className="border-white/10 bg-black/40 text-white">{count} labs</Badge>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-quantum-cyan">{cat.title}</h3>
                  <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-slate-300">{cat.description}</p>
                  <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-quantum-cyan opacity-0 transition group-hover:opacity-100">
                    Filtrar categoria
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </button>
              );
            })}
          </section>
        )}

        {/* LOADING */}
        {loading && (
          <div className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02] p-10">
            <Loader2 className="h-6 w-6 animate-spin text-quantum-cyan" />
            <span className="ml-3 text-sm text-slate-400">Carregando labs...</span>
          </div>
        )}

        {/* LESSONS LIST */}
        {!loading && (
          <section className="rounded-[24px] border border-white/10 bg-white/[0.02] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                {anyFilterActive ? "Resultados filtrados" : "Todos os labs"}
                <span className="ml-2 text-sm font-normal text-slate-400">
                  {filteredLessons.length} de {lessons.length}
                </span>
              </h2>
              {filteredLessons.length === 0 && (
                <Badge className="border-red-400/30 bg-red-400/10 text-red-300">Nada encontrado</Badge>
              )}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {filteredLessons.map((lesson: any) => {
                const category = LAB_CATEGORIES.find((c) => c.slug === lesson._cat);
                const Icon = category?.icon ?? FlaskConical;
                const isFav = favorites.includes(lesson.lesson_id);
                const isCopied = copied === lesson.lesson_id;
                return (
                  <div
                    key={lesson.lesson_id}
                    className="group relative flex flex-col gap-3 rounded-xl border border-white/10 bg-black/30 p-4 transition hover:border-quantum-cyan/40"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-black/40 group-hover:border-quantum-cyan/30">
                        <Icon className="h-5 w-5 text-quantum-cyan" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/academia/ead/lab/${lesson.lesson_id}`}
                            onClick={() => registerRecent(lesson.lesson_id)}
                            className="line-clamp-2 text-sm font-semibold text-white group-hover:text-quantum-cyan"
                          >
                            {lesson.title || lesson.lesson_id}
                          </Link>
                          <button
                            onClick={() => toggleFavorite(lesson.lesson_id)}
                            title={isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                            className="shrink-0"
                          >
                            {isFav ? (
                              <Bookmark className="h-4 w-4 fill-amber-400 text-amber-400" />
                            ) : (
                              <BookmarkPlus className="h-4 w-4 text-slate-500 hover:text-amber-300" />
                            )}
                          </button>
                        </div>
                        {lesson.subtitle && (
                          <p className="mt-1 line-clamp-2 text-xs text-slate-400">{lesson.subtitle}</p>
                        )}
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {category && (
                            <Badge className="border-white/10 bg-white/5 px-2 py-0 text-[10px] font-mono uppercase tracking-widest text-slate-300">
                              {category.title}
                            </Badge>
                          )}
                          {lesson.featured && (
                            <Badge className="border-amber-400/30 bg-amber-400/10 px-2 py-0 text-[10px] font-mono uppercase tracking-widest text-amber-300">
                              ⭐ destaque
                            </Badge>
                          )}
                          {(lesson.tags ?? []).slice(0, 3).map((tag: string) => (
                            <Badge
                              key={tag}
                              className="border-quantum-cyan/20 bg-quantum-cyan/5 px-2 py-0 text-[10px] font-mono uppercase tracking-widest text-quantum-cyan/80"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 border-t border-white/5 pt-2">
                      <Link
                        href={`/academia/ead/lab/${lesson.lesson_id}`}
                        onClick={() => registerRecent(lesson.lesson_id)}
                        className="flex items-center gap-1 rounded-md border border-quantum-cyan/30 bg-quantum-cyan/10 px-2 py-1 text-[11px] font-semibold text-quantum-cyan hover:bg-quantum-cyan/20"
                      >
                        <Eye className="h-3 w-3" />
                        Abrir
                      </Link>
                      {lesson.html_url && (
                        <a
                          href={lesson.html_url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-slate-300 hover:border-emerald-400/40 hover:text-emerald-300"
                        >
                          <ExternalLink className="h-3 w-3" />
                          HTML
                        </a>
                      )}
                      {lesson.pdf_url && (
                        <a
                          href={lesson.pdf_url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-slate-300 hover:border-amber-400/40 hover:text-amber-300"
                        >
                          <Download className="h-3 w-3" />
                          PDF
                        </a>
                      )}
                      {lesson.md_url && (
                        <button
                          onClick={() => copyMarkdown(lesson)}
                          className={`flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] transition ${
                            isCopied
                              ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                              : "border-white/10 bg-white/5 text-slate-300 hover:border-quantum-purple/40 hover:text-quantum-purple"
                          }`}
                          title={isCopied ? "Copiado!" : "Copiar Markdown"}
                        >
                          <Copy className="h-3 w-3" />
                          {isCopied ? "Copiado" : "MD"}
                        </button>
                      )}
                      <Link
                        href={`/academia/lab-nexus/chatbot?prompt=${encodeURIComponent(lesson.title || lesson.lesson_id)}`}
                        className="ml-auto flex items-center gap-1 rounded-md border border-quantum-purple/30 bg-quantum-purple/10 px-2 py-1 text-[11px] font-semibold text-quantum-purple hover:bg-quantum-purple/20"
                        title="Testar com o Chatbot"
                      >
                        <Bot className="h-3 w-3" />
                        Testar no chat
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="rounded-[24px] border border-white/10 bg-gradient-to-br from-quantum-purple/10 to-quantum-cyan/5 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Consulte também a Lib Nexus</h3>
              <p className="mt-1 text-sm text-slate-400">
                Documentação canônica dos agentes, APIs internas e best practices
              </p>
            </div>
            <Link
              href="/academia/lib-nexus"
              className="inline-flex items-center gap-2 rounded-xl border border-quantum-cyan/40 bg-quantum-cyan/10 px-5 py-3 text-sm font-semibold text-quantum-cyan transition hover:bg-quantum-cyan/20"
            >
              <BookOpen className="h-4 w-4" />
              Ir para Lib Nexus
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
