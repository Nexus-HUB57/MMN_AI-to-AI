import { useEffect } from "react";
/**
 * Nexus Academ'IA · Página de Lição
 * Exibe vídeo aula, apostila PDF, resumo e metadados com gating por nível.
 */

import { Link, useLocation, useParams } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMarketplaceProfile } from "@/hooks/useMarketplaceProfile";
import { getAcademiaRuntimeSummary } from "@/lib/nexus-academia";
import { trpc } from "@/lib/trpc";
import AcademiaNextSuggested from "@/components/AcademiaNextSuggested";
import {
  EAD_SECTIONS,
  LEVEL_COLORS,
  LEVEL_LABELS,
  REPO_BLOB,
  REPO_RAW,
  buildLessonOverrideMap,
  canAccessLesson,
  getLessonById,
  type ContentType,
} from "@/lib/academia-ead";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Clock,
  ExternalLink,
  FileText,
  GraduationCap,
  Lock,
  PlayCircle,
  Sparkles,
  Tag,
} from "lucide-react";

function buildRawMdUrl(mdPath?: string, lessonId?: string, sectionSlug?: string) {
  if (!mdPath && !lessonId) return "";
  // Se mdPath já é uma URL absoluta do próprio domínio, usar como está
  if (mdPath && /^https?:\/\//.test(mdPath)) return mdPath;
  // Caso contrário, derivar do padrão público local (sem GitHub)
  if (lessonId && sectionSlug) {
    return `https://oneverso.com.br/academia/md/academia-${sectionSlug}-${lessonId}.md`;
  }
  return "";
}

function buildRepoUrl(_mdPath?: string) {
  // Repositório GitHub removido por política — não direcionamos para repositório externo.
  return "";
}

function isEmbeddableVideo(url: string) {
  return /youtube\.com\/embed|player\.vimeo\.com|\.mp4($|\?)/i.test(url);
}

export default function AcademiaLesson() {
  const { slug, lessonId } = useParams<{ slug: string; lessonId: string }>();

  // V14: tracking automático de visualização (UX + telemetria)
  useEffect(() => {
    if (!lessonId) return;
    const controller = new AbortController();
    fetch("/api/academia/track-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId }),
      signal: controller.signal,
    }).catch(() => { /* silent fail — não bloquear UX */ });
    return () => controller.abort();
  }, [lessonId]);
  const [, navigate] = useLocation();
  const { profile } = useMarketplaceProfile();
  const runtimeSummary = getAcademiaRuntimeSummary(profile);
  const userTier = runtimeSummary.tier.id;

  const section = EAD_SECTIONS.find((s) => s.slug === (slug as ContentType));
  const overrideQuery = trpc.academiaEad.getOverride.useQuery(
    { lessonId: lessonId || "" },
    { enabled: Boolean(lessonId) },
  );
  const overrideMap = buildLessonOverrideMap(overrideQuery.data?.item ? [overrideQuery.data.item] : []);
  const lesson = getLessonById(lessonId, overrideMap);

  if (!section || !lesson || lesson.type !== section.slug || lesson.isPublished === false) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-slate-400">
          <BookOpen className="h-12 w-12 opacity-30" />
          <p>Lição não encontrada.</p>
          <Link href="/academia">
            <Button variant="outline" className="border-white/15 bg-white/5 text-white">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Hub
            </Button>
          </Link>
        </div>
      <AcademiaNextSuggested lessonId={lessonId} />
    </DashboardLayout>
    );
  }

  const accessible = canAccessLesson(userTier, lesson.requiredTier);
  const rawMdUrl = buildRawMdUrl(lesson.mdPath, lesson.id, section.slug);
  const repoUrl = buildRepoUrl(lesson.mdPath);
  const playerEnabled = Boolean(lesson.videoUrl && isEmbeddableVideo(lesson.videoUrl));
  const pdfEnabled = Boolean(lesson.pdfUrl);

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-8">
        {/* Breadcrumb / title */}
        <section className="overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.18),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(0,229,255,0.12),transparent_28%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,1))] p-6 shadow-2xl shadow-black/30 md:p-8">
          <button
            onClick={() => navigate(`/academia/ead/${slug}`)}
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="h-4 w-4" /> {section.title}
          </button>

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge className="border border-quantum-purple/30 bg-quantum-purple/10 text-quantum-purple">
              Nexus Academ'IA
            </Badge>
            <Badge className={`border ${LEVEL_COLORS[lesson.level]}`}>
              {LEVEL_LABELS[lesson.level]}
            </Badge>
            {accessible ? (
              <Badge className="border border-quantum-lime/30 bg-quantum-lime/10 text-quantum-lime">
                Liberado
              </Badge>
            ) : (
              <Badge className="border border-white/10 bg-white/5 text-slate-400 flex items-center gap-1">
                <Lock className="h-3 w-3" /> Requer {lesson.requiredTier}
              </Badge>
            )}
          </div>

          <div className="mt-5 grid gap-6 xl:grid-cols-[1.08fr_0.92fr] xl:items-start">
            <div>
              <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl">
                {lesson.title}
              </h1>
              {lesson.subtitle && (
                <p className="mt-2 text-lg text-slate-300">{lesson.subtitle}</p>
              )}
              <p className="mt-4 max-w-4xl text-base leading-7 text-slate-300 md:text-lg">
                {lesson.description}
              </p>

              <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-400">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1.5">
                  <Clock className="h-4 w-4" /> {lesson.duration}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1.5">
                  <GraduationCap className="h-4 w-4" /> {section.title}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {lesson.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300"
                  >
                    <Tag className="h-3 w-3" /> {tag}
                  </span>
                ))}
              </div>
            </div>

            <Card className="border-white/10 bg-white/6 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white">Recursos desta aula</CardTitle>
                <CardDescription className="text-slate-300">
                  Vídeo, apostila PDF e material-base do repositório.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-300">
                <ResourceStatus label="Vídeo aula" enabled={Boolean(lesson.videoUrl)} pendingLabel="Vídeo pendente" />
                <ResourceStatus label="Apostila PDF" enabled={Boolean(lesson.pdfUrl)} pendingLabel="PDF pendente" />
                <ResourceStatus label="Material base (.md)" enabled={Boolean(lesson.mdPath)} pendingLabel="Sem base markdown" />

                <div className="pt-2 flex flex-wrap gap-2">
                  {/* Botão de repositório GitHub removido por política. */}
                  {false && repoUrl && (
                    <a href={repoUrl} target="_blank" rel="noreferrer">
                      <Button variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10">
                        Ver no repositório <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </a>
                  )}
                  {rawMdUrl && (
                    <a href={rawMdUrl} target="_blank" rel="noreferrer">
                      <Button variant="outline" className="border-quantum-cyan/30 bg-quantum-cyan/10 text-white hover:bg-quantum-cyan/20">
                        Markdown bruto <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {!accessible ? (
          <Card className="border-amber-400/20 bg-amber-400/5">
            <CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-white">Conteúdo bloqueado para o seu nível atual</p>
                <p className="mt-1 text-sm text-slate-300">
                  Seu tier atual é <strong className="text-white">{runtimeSummary.tier.label}</strong>. Esta lição exige <strong className="text-white">{lesson.requiredTier}</strong>.
                </p>
              </div>
              <Link href="/packs">
                <Button className="gradient-btn shrink-0">
                  <Sparkles className="mr-2 h-4 w-4" /> Evoluir acesso
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            {/* Main player/content area */}
            <div className="space-y-6">
              <Card className="border-white/10 bg-white/5 backdrop-blur overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <PlayCircle className="h-5 w-5 text-quantum-cyan" /> Vídeo aula
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Player principal do conteúdo em vídeo.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {playerEnabled && lesson.videoUrl ? (
                    <div className="aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black/50">
                      {lesson.videoUrl.endsWith(".mp4") ? (
                        <video
                          controls
                          className="h-full w-full"
                          src={lesson.videoUrl}
                          onLoadedMetadata={(e) => {
                            const v = e.currentTarget as HTMLVideoElement;
                            (window as any).__nexusVideoDuration = Math.floor(v.duration || 0);
                          }}
                          onTimeUpdate={(e) => {
                            const v = e.currentTarget as HTMLVideoElement;
                            const w = window as any;
                            const now = Date.now();
                            if (!w.__nexusLastSync || now - w.__nexusLastSync > 10_000) {
                              w.__nexusLastSync = now;
                              fetch("/api/academia/lesson-progress", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  lessonId,
                                  watchedSeconds: Math.floor(v.currentTime),
                                  lastPosition: Math.floor(v.currentTime),
                                  durationS: Math.floor(v.duration || 0),
                                  userId: 1,
                                }),
                              }).catch(() => {});
                            }
                          }}
                          onEnded={() => {
                            fetch("/api/academia/lesson-progress", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                lessonId,
                                watchedSeconds: (window as any).__nexusVideoDuration || 0,
                                lastPosition: (window as any).__nexusVideoDuration || 0,
                                durationS: (window as any).__nexusVideoDuration || 0,
                                completed: true,
                                userId: 1,
                              }),
                            }).catch(() => {});
                          }}
                        />
                      ) : (
                        <iframe
                          src={lesson.videoUrl}
                          className="h-full w-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title={lesson.title}
                        />
                      )}
                    </div>
                  ) : (
                    <EmptyResource
                      icon={<PlayCircle className="h-10 w-10 opacity-30" />}
                      title="Vídeo aula ainda não publicada"
                      description="A estrutura do player já está pronta. Basta cadastrar a URL pública do vídeo nesta lição."
                    />
                  )}
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-white/5 backdrop-blur overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <FileText className="h-5 w-5 text-amber-300" /> Apostila PDF
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Viewer incorporado da apostila desta lição.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {pdfEnabled && lesson.pdfUrl ? (
                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white min-h-[720px]">
                      <iframe src={lesson.pdfUrl} className="h-[720px] w-full" title={`PDF ${lesson.title}`} />
                    </div>
                  ) : (
                    <EmptyResource
                      icon={<FileText className="h-10 w-10 opacity-30" />}
                      title="Apostila PDF pendente"
                      description="O viewer já está integrado. Basta vincular a URL pública do PDF desta aula para liberar o material."
                    />
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="border-white/10 bg-white/5 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-white">Resumo operacional</CardTitle>
                  <CardDescription className="text-slate-400">
                    Como usar esta lição no fluxo do afiliado.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-300">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="font-semibold text-white">Objetivo</p>
                    <p className="mt-2 leading-6">{lesson.description}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="font-semibold text-white">Aplicação prática</p>
                    <p className="mt-2 leading-6">
                      Consuma o vídeo, revise a apostila e depois aplique o conteúdo no painel, no runtime ou no Lab Nexus conforme o caso.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="font-semibold text-white">Próximo passo</p>
                    <p className="mt-2 leading-6">
                      Ao concluir, avance para a próxima lição da mesma trilha ou use os recursos do Lab/Lib para reforço operacional.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-white/5 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-white">Navegação</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href={`/academia/ead/${slug}`}>
                    <Button variant="outline" className="w-full justify-between border-white/15 bg-white/5 text-white hover:bg-white/10">
                      Voltar para {section.title}
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/academia">
                    <Button variant="outline" className="w-full justify-between border-white/15 bg-white/5 text-white hover:bg-white/10">
                      Voltar ao Hub EAD
                      <BookOpen className="h-4 w-4" />
                    </Button>
                  </Link>
                  {lesson.type === "lab" && (
                    <Link href="/academia/lab-nexus/chatbot">
                      <Button className="w-full justify-between gradient-btn">
                        Abrir Chat Bot Lab Nexus
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}

function ResourceStatus({
  label,
  enabled,
  pendingLabel,
}: {
  label: string;
  enabled: boolean;
  pendingLabel: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
      <span className="text-slate-300">{label}</span>
      {enabled ? (
        <Badge className="border border-quantum-lime/30 bg-quantum-lime/10 text-quantum-lime">Disponível</Badge>
      ) : (
        <Badge className="border border-white/10 bg-white/5 text-slate-400">{pendingLabel}</Badge>
      )}
    </div>
  );
}

function EmptyResource({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-white/10 bg-black/20 p-8 text-center text-slate-400">
      <div>{icon}</div>
      <div>
        <p className="font-semibold text-white">{title}</p>
        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">{description}</p>
      </div>
    </div>
  );
}
