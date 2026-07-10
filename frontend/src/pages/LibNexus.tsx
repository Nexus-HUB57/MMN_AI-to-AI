import { useMemo, useState } from "react";
import { Link } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import {
  BookOpen,
  Search,
  ExternalLink,
  Cpu,
  Terminal,
  Shield,
  Sparkles,
  ArrowRight,
  FileText,
  Layers,
  Package,
  Zap,
  Star,
  Loader2,
} from "lucide-react";

/**
 * Lib Nexus — Biblioteca de Referência Técnica
 * Onda 25 · UX-first · agrupamento visual por categoria
 * ---------------------------------------------------------------------------
 * Categorias curadas do repo AcademIA/Lib-Nexus/:
 *  - agents-specs      → especificações dos agentes IA (Ravi, Helena, Otto...)
 *  - api-docs          → documentação canônica das APIs (tRPC, REST, Webhooks)
 *  - best-practices    → padrões de segurança, performance, error handling
 *  - knowledge-base    → base de conhecimento consultável pelos agentes RAG
 */

type CategoryMeta = {
  slug: string;
  title: string;
  description: string;
  icon: any;
  accent: string;
  ramp: string;
};

const LIB_CATEGORIES: CategoryMeta[] = [
  {
    slug: "agents-specs",
    title: "Agents Specs",
    description: "Especificações canônicas dos agentes IA (Ravi CTO, Helena CMO, Otto CFO...)",
    icon: Cpu,
    accent: "from-quantum-cyan/40 to-quantum-purple/10",
    ramp: "cyan",
  },
  {
    slug: "api-docs",
    title: "API Docs",
    description: "Documentação canônica tRPC, REST público, Webhooks e eventos",
    icon: Terminal,
    accent: "from-emerald-400/40 to-cyan-400/10",
    ramp: "emerald",
  },
  {
    slug: "best-practices",
    title: "Best Practices",
    description: "Padrões de segurança, performance, error handling e prompt engineering",
    icon: Shield,
    accent: "from-amber-400/40 to-quantum-cyan/10",
    ramp: "amber",
  },
  {
    slug: "knowledge-base",
    title: "Knowledge Base",
    description: "Base de conhecimento consultável pelos agentes via RAG (Ravi retriever)",
    icon: BookOpen,
    accent: "from-quantum-purple/40 to-quantum-cyan/10",
    ramp: "purple",
  },
];

export default function LibNexus() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Query lessons da seção "lib" do backend real
  const lessonsQuery = (trpc as any).academiaPublic?.listPublished?.useQuery(
    { sectionSlug: "lib", limit: 100 },
    { retry: false }
  );

  const lessons = (lessonsQuery?.data?.items ?? []) as any[];

  const filteredLessons = useMemo(() => {
    let list = lessons;
    if (selectedCategory) {
      list = list.filter((l) => {
        const url = String(l.md_url ?? "").toLowerCase();
        return url.includes(selectedCategory);
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
    for (const cat of LIB_CATEGORIES) {
      counts[cat.slug] = lessons.filter((l) =>
        String(l.md_url ?? "").toLowerCase().includes(cat.slug)
      ).length;
    }
    return counts;
  }, [lessons]);

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-12">
        {/* HERO */}
        <section className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(124,255,178,0.14),transparent_30%),radial-gradient(circle_at_top_right,rgba(139,92,246,0.14),transparent_30%),rgba(255,255,255,0.03)] p-8 md:p-10 shadow-2xl shadow-black/40">
          <div className="max-w-3xl">
            <Badge className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan font-mono text-[11px] uppercase tracking-[0.24em]">
              📚 Nexus Academ'IA · Lib Nexus
            </Badge>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-white md:text-5xl">
              Biblioteca de <span className="bg-gradient-to-r from-quantum-cyan to-quantum-purple bg-clip-text text-transparent">Referência Técnica</span>
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-300 md:text-lg">
              Documentação canônica do ecossistema Nexus Affil'IA'te. Especificações dos agentes IA,
              APIs internas, best practices e base de conhecimento — tudo o que Ravi, Helena, Otto e
              Otávio consultam para operar.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-2">
                <p className="text-[10px] uppercase tracking-widest text-slate-500">Total docs</p>
                <p className="text-lg font-bold text-white">{lessons.length}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-2">
                <p className="text-[10px] uppercase tracking-widest text-slate-500">Categorias</p>
                <p className="text-lg font-bold text-white">{LIB_CATEGORIES.length}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-2">
                <p className="text-[10px] uppercase tracking-widest text-slate-500">Fonte</p>
                <p className="text-lg font-bold text-emerald-400">DB real</p>
              </div>
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
                placeholder="Buscar documento, tag, especificação..."
                className="h-11 border-white/10 bg-black/30 pl-10 text-white placeholder:text-slate-500"
              />
            </div>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="rounded-lg border border-quantum-cyan/30 bg-quantum-cyan/10 px-4 py-2 text-xs font-mono uppercase tracking-widest text-quantum-cyan transition hover:bg-quantum-cyan/20"
              >
                Limpar filtro: {selectedCategory}
              </button>
            )}
          </div>
        </section>

        {/* CATEGORIAS - Cards visuais grandes */}
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {LIB_CATEGORIES.map((cat) => {
            const count = categoryCounts[cat.slug] ?? 0;
            const isSelected = selectedCategory === cat.slug;
            const Icon = cat.icon;
            return (
              <button
                key={cat.slug}
                onClick={() => setSelectedCategory(isSelected ? null : cat.slug)}
                className={`group relative overflow-hidden rounded-3xl border p-6 text-left transition-all ${
                  isSelected
                    ? "border-quantum-cyan/60 bg-quantum-cyan/10 ring-2 ring-quantum-cyan/40"
                    : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                }`}
              >
                <div
                  className={`absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${cat.accent} opacity-40 blur-2xl transition-opacity group-hover:opacity-70`}
                />
                <div className="relative">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-black/40">
                    <Icon className="h-6 w-6 text-quantum-cyan" />
                  </div>
                  <h3 className="text-lg font-bold text-white">{cat.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{cat.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-3xl font-black text-white">{count}</span>
                    <ArrowRight className="h-5 w-5 text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-quantum-cyan" />
                  </div>
                </div>
              </button>
            );
          })}
        </section>

        {/* LISTA DE DOCUMENTOS */}
        <section className="rounded-[32px] border border-white/10 bg-white/[0.02] p-6 md:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {selectedCategory ? `Documentos · ${selectedCategory}` : "Todos os documentos"}
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                {filteredLessons.length} de {lessons.length} documentos
                {search && ` · busca: "${search}"`}
              </p>
            </div>
          </div>

          {lessonsQuery?.isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-quantum-cyan" />
              <span className="ml-3 text-sm text-slate-400">Carregando biblioteca...</span>
            </div>
          ) : filteredLessons.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-black/30 p-8 text-center">
              <FileText className="mx-auto mb-3 h-10 w-10 text-slate-600" />
              <p className="text-sm text-slate-400">Nenhum documento encontrado com esses filtros.</p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {filteredLessons.map((lesson) => {
                const url = String(lesson.md_url ?? "");
                const category = LIB_CATEGORIES.find((c) => url.toLowerCase().includes(c.slug));
                const Icon = category?.icon ?? FileText;
                return (
                  <a
                    key={lesson.lesson_id}
                    href={lesson.html_url || lesson.md_url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-4 rounded-xl border border-white/10 bg-black/30 p-4 transition-all hover:border-quantum-cyan/40 hover:bg-white/[0.04]"
                  >
                    <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-black/40 group-hover:border-quantum-cyan/30">
                      <Icon className="h-5 w-5 text-quantum-cyan" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="line-clamp-2 text-sm font-semibold text-white group-hover:text-quantum-cyan">
                          {lesson.title || lesson.lesson_id}
                        </p>
                        <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-500 group-hover:text-quantum-cyan" />
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
                  </a>
                );
              })}
            </div>
          )}
        </section>

        {/* CTA — voltar à Academia */}
        <section className="rounded-[24px] border border-white/10 bg-gradient-to-br from-quantum-purple/10 to-quantum-cyan/5 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Explore também o Lab Nexus</h3>
              <p className="mt-1 text-sm text-slate-400">
                Chatbot multi-IA, prompts prontos, workflows n8n e ferramentas experimentais
              </p>
            </div>
            <Link
              href="/academia/lab-nexus"
              className="inline-flex items-center gap-2 rounded-xl border border-quantum-cyan/40 bg-quantum-cyan/10 px-5 py-3 text-sm font-semibold text-quantum-cyan transition hover:bg-quantum-cyan/20"
            >
              <Sparkles className="h-4 w-4" />
              Ir para Lab Nexus
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
