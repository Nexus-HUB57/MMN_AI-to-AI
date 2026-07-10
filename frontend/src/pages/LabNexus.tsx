import { useMemo, useState } from "react";
import { Link } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Layers,
  Sparkles,
  Terminal,
  Loader2,
  MessageSquare,
  Workflow,
  PenTool,
  BarChart3,
  Shield,
  Rocket,
} from "lucide-react";

/**
 * Lab Nexus Hub — Playground de IA e Automação
 * Onda 25 · UX-first
 * ---------------------------------------------------------------------------
 * Categorias reais do repo AcademIA/Lab-Nexus/:
 *   - prompts/copywriting     → prompts prontos para copy
 *   - prompts/estrategia      → planejamento, OKR, benchmark
 *   - prompts/analise         → coorte, funil, churn
 *   - prompts/governanca      → decisões C-Suite
 *   - workflows/n8n           → automações prontas
 *   - templates               → templates de agentes/skills
 *   - tools                   → ferramentas experimentais
 */

type CategoryMeta = {
  slug: string;
  title: string;
  description: string;
  icon: any;
  accent: string;
};

const LAB_CATEGORIES: CategoryMeta[] = [
  {
    slug: "prompts",
    title: "Prompts Prontos",
    description: "Copy, estratégia, análise, governança — prompts otimizados para produção",
    icon: Wand2,
    accent: "from-quantum-cyan/40 to-quantum-purple/10",
  },
  {
    slug: "workflows",
    title: "Workflows n8n",
    description: "Automações prontas: onboarding, follow-up, lead-scoring, alertas",
    icon: Workflow,
    accent: "from-emerald-400/40 to-cyan-400/10",
  },
  {
    slug: "templates",
    title: "Templates",
    description: "Boilerplates de agentes, skills e integrações do ecossistema",
    icon: Layers,
    accent: "from-amber-400/40 to-quantum-cyan/10",
  },
  {
    slug: "tools",
    title: "Tools",
    description: "Ferramentas experimentais: prompt-tester, agent-simulator, cost-calc",
    icon: Terminal,
    accent: "from-quantum-purple/40 to-quantum-cyan/10",
  },
];

// Subcategorias de prompts (curadoria visual)
const PROMPT_SUBCATEGORIES = [
  { slug: "copywriting", title: "Copywriting", icon: PenTool, color: "text-pink-400" },
  { slug: "estrategia", title: "Estratégia", icon: Rocket, color: "text-cyan-400" },
  { slug: "analise", title: "Análise & Data", icon: BarChart3, color: "text-emerald-400" },
  { slug: "governanca", title: "Governança", icon: Shield, color: "text-amber-400" },
];

export default function LabNexus() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const lessonsQuery = (trpc as any).academiaPublic?.listPublished?.useQuery(
    { sectionSlug: "lab", limit: 200 },
    { retry: false }
  );

  const lessons = (lessonsQuery?.data?.items ?? []) as any[];

  const filteredLessons = useMemo(() => {
    let list = lessons;
    if (selectedCategory) {
      list = list.filter((l) => {
        const url = String(l.md_url ?? "").toLowerCase();
        return url.includes(`/${selectedCategory}/`) || url.includes(`/${selectedCategory}`);
      });
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((l) =>
        `${l.title ?? ""} ${l.subtitle ?? ""} ${(l.tags ?? []).join(" ")}`.toLowerCase().includes(q)
      );
    }
    return list;
  }, [lessons, selectedCategory, search]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const cat of LAB_CATEGORIES) {
      counts[cat.slug] = lessons.filter((l) => {
        const url = String(l.md_url ?? "").toLowerCase();
        return url.includes(`/${cat.slug}/`) || url.includes(`/${cat.slug}`);
      }).length;
    }
    return counts;
  }, [lessons]);

  const promptSubCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const sub of PROMPT_SUBCATEGORIES) {
      counts[sub.slug] = lessons.filter((l) => {
        const url = String(l.md_url ?? "").toLowerCase();
        return url.includes(`/prompts/${sub.slug}`);
      }).length;
    }
    return counts;
  }, [lessons]);

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-12">
        {/* HERO */}
        <section className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(0,229,255,0.14),transparent_30%),radial-gradient(circle_at_top_right,rgba(251,191,36,0.14),transparent_30%),rgba(255,255,255,0.03)] p-8 md:p-10 shadow-2xl shadow-black/40">
          <div className="max-w-3xl">
            <Badge className="border border-amber-400/30 bg-amber-400/10 text-amber-300 font-mono text-[11px] uppercase tracking-[0.24em]">
              🧪 Nexus Academ'IA · Lab Nexus
            </Badge>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-white md:text-5xl">
              Playground de <span className="bg-gradient-to-r from-amber-400 to-quantum-cyan bg-clip-text text-transparent">IA & Automação</span>
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-300 md:text-lg">
              Prompts prontos, workflows n8n, templates de agentes e ferramentas experimentais.
              Tudo que você precisa para operar em nível elite — copy que converte, análise que
              revela, automação que escala.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-2">
                <p className="text-[10px] uppercase tracking-widest text-slate-500">Total assets</p>
                <p className="text-lg font-bold text-white">{lessons.length}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-2">
                <p className="text-[10px] uppercase tracking-widest text-slate-500">Categorias</p>
                <p className="text-lg font-bold text-white">{LAB_CATEGORIES.length}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-2">
                <p className="text-[10px] uppercase tracking-widest text-slate-500">Ferramentas</p>
                <p className="text-lg font-bold text-emerald-400">Multi-IA</p>
              </div>
            </div>

            {/* Chatbot CTA */}
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/academia/lab-nexus/chatbot"
                className="inline-flex items-center gap-2 rounded-xl border border-quantum-cyan/40 bg-quantum-cyan/10 px-5 py-3 text-sm font-semibold text-quantum-cyan transition hover:bg-quantum-cyan/20"
              >
                <Bot className="h-4 w-4" />
                Abrir Chat Bot Lab Nexus
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/academia/lib-nexus"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                <BookOpen className="h-4 w-4" />
                Ver Lib Nexus
              </Link>
            </div>
          </div>
        </section>

        {/* BUSCA */}
        <section className="rounded-[24px] border border-white/10 bg-white/[0.02] p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar prompt, workflow, template..."
                className="h-11 border-white/10 bg-black/30 pl-10 text-white placeholder:text-slate-500"
              />
            </div>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-xs font-mono uppercase tracking-widest text-amber-300 transition hover:bg-amber-400/20"
              >
                Limpar: {selectedCategory}
              </button>
            )}
          </div>
        </section>

        {/* CATEGORIAS PRINCIPAIS */}
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {LAB_CATEGORIES.map((cat) => {
            const count = categoryCounts[cat.slug] ?? 0;
            const isSelected = selectedCategory === cat.slug;
            const Icon = cat.icon;
            return (
              <button
                key={cat.slug}
                onClick={() => setSelectedCategory(isSelected ? null : cat.slug)}
                className={`group relative overflow-hidden rounded-3xl border p-6 text-left transition-all ${
                  isSelected
                    ? "border-amber-400/60 bg-amber-400/10 ring-2 ring-amber-400/40"
                    : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                }`}
              >
                <div
                  className={`absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${cat.accent} opacity-40 blur-2xl transition-opacity group-hover:opacity-70`}
                />
                <div className="relative">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-black/40">
                    <Icon className="h-6 w-6 text-amber-300" />
                  </div>
                  <h3 className="text-lg font-bold text-white">{cat.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{cat.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-3xl font-black text-white">{count}</span>
                    <ArrowRight className="h-5 w-5 text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-amber-300" />
                  </div>
                </div>
              </button>
            );
          })}
        </section>

        {/* SUBCATEGORIAS DE PROMPTS (se prompts filtrado ou tudo) */}
        {(selectedCategory === "prompts" || !selectedCategory) && (
          <section className="rounded-[24px] border border-white/10 bg-white/[0.02] p-6">
            <div className="mb-4">
              <h3 className="text-sm font-mono uppercase tracking-[0.24em] text-quantum-cyan">
                // PROMPTS · Por domínio
              </h3>
              <p className="mt-1 text-sm text-slate-400">Refine a busca por área de aplicação</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
              {PROMPT_SUBCATEGORIES.map((sub) => {
                const Icon = sub.icon;
                const count = promptSubCounts[sub.slug] ?? 0;
                return (
                  <button
                    key={sub.slug}
                    onClick={() => {
                      setSelectedCategory("prompts");
                      setSearch(sub.slug);
                    }}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 p-3 transition hover:border-white/20 hover:bg-white/[0.05]"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-black/40">
                      <Icon className={`h-4 w-4 ${sub.color}`} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-semibold text-white">{sub.title}</p>
                      <p className="text-xs text-slate-500">{count} prompts</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* LISTA */}
        <section className="rounded-[32px] border border-white/10 bg-white/[0.02] p-6 md:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {selectedCategory ? `Assets · ${selectedCategory}` : "Todos os assets"}
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                {filteredLessons.length} de {lessons.length} · fonte: DB real
              </p>
            </div>
          </div>

          {lessonsQuery?.isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-amber-300" />
              <span className="ml-3 text-sm text-slate-400">Carregando lab...</span>
            </div>
          ) : filteredLessons.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-black/30 p-8 text-center">
              <FlaskConical className="mx-auto mb-3 h-10 w-10 text-slate-600" />
              <p className="text-sm text-slate-400">Nenhum asset encontrado com esses filtros.</p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filteredLessons.map((lesson) => {
                const url = String(lesson.md_url ?? "");
                const isPrompt = url.includes("/prompts/");
                const isWorkflow = url.includes("/workflows/");
                const isTemplate = url.includes("/templates/");
                const Icon = isPrompt ? Wand2 : isWorkflow ? Workflow : isTemplate ? Layers : Terminal;
                const iconColor = isPrompt ? "text-quantum-cyan" : isWorkflow ? "text-emerald-400" : isTemplate ? "text-amber-300" : "text-purple-400";
                return (
                  <a
                    key={lesson.lesson_id}
                    href={lesson.html_url || lesson.md_url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col rounded-xl border border-white/10 bg-black/30 p-4 transition-all hover:border-amber-300/40 hover:bg-white/[0.04]"
                  >
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-black/40 group-hover:border-amber-300/30">
                        <Icon className={`h-4 w-4 ${iconColor}`} />
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-500 group-hover:text-amber-300" />
                    </div>
                    <p className="line-clamp-2 text-sm font-semibold text-white group-hover:text-amber-300">
                      {lesson.title || lesson.lesson_id}
                    </p>
                    {lesson.subtitle && (
                      <p className="mt-1 line-clamp-2 text-xs text-slate-400">{lesson.subtitle}</p>
                    )}
                    <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
                      {(lesson.tags ?? []).slice(0, 3).map((tag: string) => (
                        <Badge
                          key={tag}
                          className="border-amber-300/20 bg-amber-300/5 px-2 py-0 text-[10px] font-mono uppercase tracking-widest text-amber-300/80"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
