/**
 * Nexus Academ'IA · Página de Seção EAD
 * Lista de lições de uma seção com filtros, gating por nível e acesso a cada lição.
 */

import { useParams, Link, useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMarketplaceProfile } from "@/hooks/useMarketplaceProfile";
import { getAcademiaRuntimeSummary } from "@/lib/nexus-academia";
import { trpc } from "@/lib/trpc";
import {
  EAD_SECTIONS,
  buildLessonOverrideMap,
  getSectionLessons,
  LEVEL_COLORS,
  LEVEL_LABELS,
  type ContentType,
  type LevelSlug,
} from "@/lib/academia-ead";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Clock,
  FileText,
  FlaskConical,
  GraduationCap,
  Layers,
  Lock,
  Play,
  Radio,
  Sparkles,
  Tag,
} from "lucide-react";

export default function AcademiaSection() {
  const { slug } = useParams<{ slug: string }>();
  const [, navigate] = useLocation();
  const { profile } = useMarketplaceProfile();
  const runtimeSummary = getAcademiaRuntimeSummary(profile);
  const userTier = runtimeSummary.tier.id;

  const section = EAD_SECTIONS.find((s) => s.slug === (slug as ContentType));
  const overridesQuery = trpc.academiaEad.listOverrides.useQuery(
    { sectionSlug: slug as ContentType },
    { enabled: Boolean(slug) },
  );

  if (!section) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-slate-400">
          <BookOpen className="h-12 w-12 opacity-30" />
          <p>Seção não encontrada.</p>
          <Link href="/academia">
            <Button variant="outline" className="border-white/15 bg-white/5 text-white">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Hub
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const overrideMap = buildLessonOverrideMap(overridesQuery.data?.items);
  const lessons = getSectionLessons(slug as ContentType, userTier, overrideMap);
  const levels = [...new Set(lessons.map((l) => l.level))] as LevelSlug[];

  // detect level filter from query string
  const levelFilter = new URLSearchParams(window.location.search).get("level") as LevelSlug | null;
  const filtered = levelFilter ? lessons.filter((l) => l.level === levelFilter) : lessons;

  const unlockedCount = lessons.filter((l) => l.accessible).length;

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-8">
        {/* Hero */}
        <section className="overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.18),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(0,229,255,0.12),transparent_28%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,1))] p-6 shadow-2xl shadow-black/30 md:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4">
              <button
                onClick={() => navigate("/academia")}
                className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"
              >
                <ArrowLeft className="h-4 w-4" /> Hub EAD
              </button>
              <div className="flex flex-wrap gap-2">
                <Badge className="border border-quantum-purple/30 bg-quantum-purple/10 text-quantum-purple">
                  Nexus Academ'IA
                </Badge>
                <Badge className={`border ${section.badgeTone}`}>{section.subtitle}</Badge>
              </div>
              <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl">
                {section.icon} {section.title}
              </h1>
              <p className="max-w-3xl text-base leading-7 text-slate-300 md:text-lg">
                {section.description}
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-slate-300">
                  <span className="text-quantum-cyan font-semibold">{unlockedCount}</span> / {lessons.length} liberados
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-slate-300">
                  Tier: <span className="font-semibold text-white">{runtimeSummary.tier.label}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Level filter tabs */}
          {levels.length > 1 && (
            <div className="mt-6 flex flex-wrap gap-2">
              <Link href={`/academia/ead/${slug}`}>
                <Button
                  size="sm"
                  variant={!levelFilter ? "default" : "outline"}
                  className={!levelFilter ? "gradient-btn" : "border-white/15 bg-white/5 text-white hover:bg-white/10"}
                >
                  Todos
                </Button>
              </Link>
              {levels.map((lvl) => (
                <Link key={lvl} href={`/academia/ead/${slug}?level=${lvl}`}>
                  <Button
                    size="sm"
                    variant={levelFilter === lvl ? "default" : "outline"}
                    className={
                      levelFilter === lvl
                        ? "gradient-btn"
                        : "border-white/15 bg-white/5 text-white hover:bg-white/10"
                    }
                  >
                    {LEVEL_LABELS[lvl]}
                  </Button>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Lesson grid */}
        <section>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((lesson) => (
              <div
                key={lesson.id}
                className={`group relative rounded-3xl border p-5 transition ${
                  lesson.accessible
                    ? "border-white/10 bg-white/5 backdrop-blur hover:-translate-y-1 hover:border-white/20 cursor-pointer"
                    : "border-white/5 bg-black/15 cursor-not-allowed"
                }`}
                onClick={() =>
                  lesson.accessible
                    ? navigate(`/academia/ead/${slug}/${lesson.id}`)
                    : undefined
                }
              >
                {/* Top row */}
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="flex flex-wrap gap-2">
                    <Badge className={`border text-xs ${LEVEL_COLORS[lesson.level]}`}>
                      {LEVEL_LABELS[lesson.level]}
                    </Badge>
                    {lesson.new && (
                      <Badge className="border border-quantum-lime/30 bg-quantum-lime/10 text-quantum-lime flex items-center gap-1 text-xs">
                        <Sparkles className="h-3 w-3" /> Novo
                      </Badge>
                    )}
                  </div>
                  {lesson.accessible ? (
                    <div className="flex items-center gap-2">
                      {lesson.videoUrl && (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full border border-quantum-cyan/30 bg-quantum-cyan/10">
                          <Play className="h-3 w-3 text-quantum-cyan" />
                        </div>
                      )}
                      {lesson.pdfUrl && (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full border border-amber-400/30 bg-amber-400/10">
                          <FileText className="h-3 w-3 text-amber-300" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <Lock className="h-4 w-4 shrink-0 text-slate-500" />
                  )}
                </div>

                {/* Content */}
                <div className={lesson.accessible ? "" : "opacity-50"}>
                  <p className="text-base font-bold text-white leading-tight">{lesson.title}</p>
                  {lesson.subtitle && (
                    <p className="mt-1 text-xs text-slate-400">{lesson.subtitle}</p>
                  )}
                  <p className="mt-3 text-sm leading-6 text-slate-300 line-clamp-3">
                    {lesson.description}
                  </p>

                  {/* Tags */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {lesson.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-slate-400"
                      >
                        <Tag className="h-2.5 w-2.5" /> {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="h-3 w-3" /> {lesson.duration}
                  </div>
                  {lesson.accessible && (
                    <ArrowRight className="h-4 w-4 text-quantum-cyan opacity-0 transition-opacity group-hover:opacity-100" />
                  )}
                  {!lesson.accessible && (
                    <span className="text-xs text-slate-500">Requer: {lesson.requiredTier}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-white/10 py-16 text-center text-slate-400">
              <BookOpen className="h-12 w-12 opacity-30" />
              <p className="text-base">Nenhuma lição encontrada neste filtro.</p>
            </div>
          )}
        </section>

        {/* CTA evolução */}
        {unlockedCount < lessons.length && (
          <Card className="border-amber-400/20 bg-amber-400/5">
            <CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-white">
                  {lessons.length - unlockedCount} lição{lessons.length - unlockedCount > 1 ? "ões" : ""} bloqueada{lessons.length - unlockedCount > 1 ? "s" : ""}
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  Evolua seu nível de afiliado para desbloquear todo o conteúdo desta seção.
                </p>
              </div>
              <Link href="/packs">
                <Button className="gradient-btn shrink-0">
                  <Sparkles className="mr-2 h-4 w-4" /> Ver packs de acesso
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
