/**
 * Nexus Academ'IA · Hub Principal EAD
 * Portal de acesso a todos os recursos educacionais com gating por nível.
 */

import { Link, useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useMarketplaceProfile } from "@/hooks/useMarketplaceProfile";
import { getAcademiaRuntimeSummary, getAcademiaAccessibleTracks } from "@/lib/nexus-academia";
import { trpc } from "@/lib/trpc";
import {
  EAD_SECTIONS,
  canAccessLesson,
  type ContentType,
} from "@/lib/academia-ead";
import type { AcademiaTierId } from "@/lib/nexus-academia";
import {
  ArrowRight,
  BookOpen,
  FlaskConical,
  GraduationCap,
  Layers,
  Lock,
  Play,
  Sparkles,
  Zap,
  FileText,
  Radio,
  Star,
  ExternalLink,
} from "lucide-react";

const SECTION_ICONS: Record<ContentType, React.ElementType> = {
  curso: GraduationCap,
  treinamento: Play,
  webinar: Radio,
  playbook: FileText,
  lab: FlaskConical,
  lib: Layers,
};

const tierOrder: Record<AcademiaTierId, number> = {
  iniciante: 1,
  operador: 2,
  estrategista: 3,
  elite: 4,
};

export default function AcademiaHub() {
  const { profile } = useMarketplaceProfile();
  const [, navigate] = useLocation();
  const runtimeSummary = getAcademiaRuntimeSummary(profile);
  const tracks = getAcademiaAccessibleTracks(profile);
  const userTier = runtimeSummary.tier.id;

  const unlockedTotal = EAD_SECTIONS.flatMap((s) => s.lessons).filter(
    (l) => canAccessLesson(userTier, l.requiredTier)
  ).length;
  const totalLessons = EAD_SECTIONS.flatMap((s) => s.lessons).length;
  const progressPct = Math.round((unlockedTotal / totalLessons) * 100);

  const totalNew = EAD_SECTIONS.flatMap((s) =>
    s.lessons.filter((l) => l.new && canAccessLesson(userTier, l.requiredTier))
  ).length;

  const youtubeSyncQuery = trpc.academiaEad.youtubeSyncStatus.useQuery(undefined, {
    staleTime: 1000 * 60 * 15,
  });
  const youtubeSync = youtubeSyncQuery.data;

  return (
    <DashboardLayout>
      {/* academia-hubs-link-injected */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:'16px',margin:'24px 0'}}>
        <a href="/academia/hubs/lab.html" style={{background:'#0d0d22',border:'1px solid #20203a',borderRadius:'16px',padding:'18px',textDecoration:'none',color:'#e6e6f5'}}>
          <div style={{fontSize:'28px'}}>🧪</div>
          <div style={{fontSize:'18px',fontWeight:600,marginTop:'6px'}}>Lab Nexus</div>
          <div style={{opacity:.7,fontSize:'13px'}}>Prompts, templates, tools e workflows</div>
        </a>
        <a href="/academia/hubs/lib.html" style={{background:'#0d0d22',border:'1px solid #20203a',borderRadius:'16px',padding:'18px',textDecoration:'none',color:'#e6e6f5'}}>
          <div style={{fontSize:'28px'}}>📚</div>
          <div style={{fontSize:'18px',fontWeight:600,marginTop:'6px'}}>Lib Nexus</div>
          <div style={{opacity:.7,fontSize:'13px'}}>Knowledge base canônica e specs</div>
        </a>
        <a href="https://www.youtube.com/@NexusAffilIAte-w9p" target="_blank" rel="noopener" style={{background:'#0d0d22',border:'1px solid #20203a',borderRadius:'16px',padding:'18px',textDecoration:'none',color:'#e6e6f5'}}>
          <div style={{fontSize:'28px'}}>📺</div>
          <div style={{fontSize:'18px',fontWeight:600,marginTop:'6px'}}>Canal YouTube</div>
          <div style={{opacity:.7,fontSize:'13px'}}>@NexusAffilIAte-w9p</div>
        </a>
      </div>

      <div className="space-y-8 pb-8">
        {/* Hero */}
        <section className="overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.22),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(0,229,255,0.16),transparent_28%),linear-gradient(180deg,rgba(15,23,42,0.97),rgba(2,6,23,1))] p-6 shadow-2xl shadow-black/30 md:p-8">
          <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr] xl:items-center">
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2">
                <Badge className="border border-quantum-purple/30 bg-quantum-purple/10 text-quantum-purple">
                  Nexus Academ'IA
                </Badge>
                <Badge className={`border ${runtimeSummary.tier.badgeTone}`}>
                  {runtimeSummary.tier.label}
                </Badge>
                {totalNew > 0 && (
                  <Badge className="border border-quantum-lime/30 bg-quantum-lime/10 text-quantum-lime">
                    {totalNew} novo{totalNew > 1 ? "s" : ""}
                  </Badge>
                )}
              </div>

              <div className="space-y-3">
                <h1 className="max-w-5xl text-4xl font-black tracking-tight text-white md:text-5xl xl:text-6xl">
                  Plataforma{" "}
                  <span className="text-quantum-cyan">EAD</span>{" "}
                  Nexus Academ'IA
                </h1>
                <p className="max-w-4xl text-base leading-7 text-slate-300 md:text-lg">
                  Cursos, treinamentos, webinars, playbooks, Lab Nexus e Lib Nexus — tudo em um único
                  hub com acesso progressivo por nível e entitlement refletido no seu agente.
                </p>
              </div>

              {/* Stats */}
              <div className="grid gap-3 sm:grid-cols-4">
                {[
                  { label: "Tier atual", value: runtimeSummary.tier.label },
                  { label: "Lições liberadas", value: `${unlockedTotal} / ${totalLessons}` },
                  { label: "Trilhas ativas", value: `${runtimeSummary.unlockedTrackCount} / ${tracks.length}` },
                  { label: "Skills mapeadas", value: `${runtimeSummary.unlockedSkills}` },
                ].map((s) => (
                  <div key={s.label} className="rounded-3xl border border-white/10 bg-black/25 p-4">
                    <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500">{s.label}</p>
                    <p className="mt-2 text-xl font-bold text-white">{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              <div>
                <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                  <span>Progresso de acesso</span>
                  <span className="font-semibold text-white">{progressPct}%</span>
                </div>
                <Progress value={progressPct} className="h-2 bg-white/10 [&>div]:bg-quantum-cyan" />
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href="/academia/ead/curso">
                  <Button className="gradient-btn">
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Começar Cursos
                  </Button>
                </Link>
                <Link href="/academia/lab-nexus/chatbot">
                  <Button variant="outline" className="border-quantum-cyan/30 bg-quantum-cyan/10 text-white hover:bg-quantum-cyan/20">
                    <FlaskConical className="mr-2 h-4 w-4 text-quantum-cyan" />
                    Chat Bot IA
                  </Button>
                </Link>
              </div>
            </div>

            {/* Quick nav card */}
            <Card className="border-white/10 bg-white/6 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-xl text-white">Acesso rápido ao EAD</CardTitle>
                <CardDescription className="text-slate-300">
                  Navegue diretamente para a seção desejada.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {EAD_SECTIONS.map((section) => {
                  const Icon = SECTION_ICONS[section.slug];
                  const sectionAccessible =
                    tierOrder[userTier] >= tierOrder[section.requiredTier];
                  const unlockedInSection = section.lessons.filter((l) =>
                    canAccessLesson(userTier, l.requiredTier)
                  ).length;
                  return (
                    <button
                      key={section.slug}
                      onClick={() =>
                        sectionAccessible
                          ? navigate(`/academia/ead/${section.slug}`)
                          : undefined
                      }
                      disabled={!sectionAccessible}
                      className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                        sectionAccessible
                          ? "border-white/10 bg-black/20 hover:border-white/20 hover:bg-white/5 cursor-pointer"
                          : "border-white/5 bg-black/10 cursor-not-allowed opacity-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                          <Icon className="h-4 w-4 text-quantum-cyan" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{section.icon} {section.title}</p>
                          <p className="text-xs text-slate-400">{section.subtitle}</p>
                        </div>
                      </div>
                      {sectionAccessible ? (
                        <Badge className="border border-white/10 bg-white/5 text-slate-300">
                          {unlockedInSection}/{section.lessons.length}
                        </Badge>
                      ) : (
                        <Lock className="h-4 w-4 text-slate-500" />
                      )}
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-red-400/20 bg-[radial-gradient(circle_at_top_left,rgba(239,68,68,0.12),transparent_28%),rgba(15,23,42,0.92)] backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white">Canal YouTube sincronizado com a Academ'IA</CardTitle>
              <CardDescription className="text-slate-300">
                O canal oficial abastece a plataforma com vídeo aulas, materiais informativos e conteúdos relacionados ao ecossistema Nexus Affil'IA'te.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-300">
              <div className="flex flex-wrap gap-2">
                <Badge className="border border-red-400/30 bg-red-500/10 text-red-100">{youtubeSync?.connected ? "Sincronização ativa" : "Sincronização em verificação"}</Badge>
                <Badge className="border border-white/10 bg-white/5 text-slate-300">{youtubeSync?.channelHandle || "@NexusAffilIAte-w9p"}</Badge>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {(youtubeSync?.contentPillars || [
                  { slug: "video-aulas", title: "Vídeo Aulas", description: "Publicação das trilhas formativas da Academ'IA." },
                  { slug: "materiais-informativos", title: "Materiais Informativos", description: "Conteúdos editoriais e explicativos de apoio." },
                  { slug: "materiais-nexus", title: "Materiais Nexus", description: "Vídeos e materiais ligados ao runtime da plataforma." },
                ]).map((pillar) => (
                  <div key={pillar.slug} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{pillar.title}</p>
                    <p className="mt-2 leading-6 text-slate-300">{pillar.description}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href={youtubeSync?.channelUrl || "https://www.youtube.com/@NexusAffilIAte-w9p"}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 font-semibold text-red-100 transition hover:bg-red-500/20"
                >
                  <Play className="h-4 w-4" /> Abrir canal oficial <ExternalLink className="h-4 w-4" />
                </a>
                <Link href="/academia/ead/curso">
                  <Button variant="outline" className="border-quantum-cyan/30 bg-quantum-cyan/10 text-white hover:bg-quantum-cyan/20">
                    Ver trilha de vídeo aulas <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white">Últimos vídeos sincronizados</CardTitle>
              <CardDescription className="text-slate-300">
                A leitura vem da integração server-side com o canal configurado no ambiente da plataforma.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(youtubeSync?.latestVideos || []).slice(0, 3).map((video) => (
                <a
                  key={video.videoId}
                  href={video.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-white/20 hover:bg-white/5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{video.title}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {video.publishedAt ? new Date(video.publishedAt).toLocaleDateString("pt-BR") : "Publicação sem data"}
                      </p>
                    </div>
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-quantum-cyan" />
                  </div>
                </a>
              ))}
              {youtubeSync && !youtubeSync.latestVideos?.length && (
                <div className="rounded-2xl border border-dashed border-white/10 bg-black/15 p-4 text-sm text-slate-400">
                  Nenhum vídeo retornado pela API no momento. A sincronização do canal permanece configurada para abastecer a Academ'IA.
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Section cards grid */}
        <section>
          <h2 className="mb-4 text-2xl font-bold text-white">Seções do EAD</h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {EAD_SECTIONS.map((section) => {
              const Icon = SECTION_ICONS[section.slug];
              const sectionAccessible =
                tierOrder[userTier] >= tierOrder[section.requiredTier];
              const unlockedInSection = section.lessons.filter((l) =>
                canAccessLesson(userTier, l.requiredTier)
              ).length;
              const newCount = section.lessons.filter(
                (l) => l.new && canAccessLesson(userTier, l.requiredTier)
              ).length;

              return (
                <Link key={section.slug} href={sectionAccessible ? `/academia/ead/${section.slug}` : "#"}>
                  <Card
                    className={`group h-full border-white/10 bg-white/5 backdrop-blur transition hover:-translate-y-1 ${
                      sectionAccessible ? "hover:border-white/20 cursor-pointer" : "cursor-not-allowed opacity-60"
                    }`}
                  >
                    <CardContent className="space-y-4 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br ${section.color} text-2xl`}>
                          {section.icon}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {sectionAccessible ? (
                            <Badge className={`border ${section.badgeTone}`}>Liberado</Badge>
                          ) : (
                            <Badge className="border border-white/10 bg-white/5 text-slate-400 flex items-center gap-1">
                              <Lock className="h-3 w-3" /> Bloqueado
                            </Badge>
                          )}
                          {newCount > 0 && (
                            <Badge className="border border-quantum-lime/30 bg-quantum-lime/10 text-quantum-lime flex items-center gap-1">
                              <Sparkles className="h-3 w-3" /> {newCount} novo{newCount > 1 ? "s" : ""}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500">{section.subtitle}</p>
                        <p className="mt-1 text-lg font-bold text-white">{section.title}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-400">{section.description}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">
                          {sectionAccessible
                            ? `${unlockedInSection} de ${section.lessons.length} liberados`
                            : `Requer: ${section.requiredTier}`}
                        </span>
                        {sectionAccessible && (
                          <ArrowRight className="h-4 w-4 text-quantum-cyan opacity-0 transition-opacity group-hover:opacity-100" />
                        )}
                      </div>

                      {sectionAccessible && (
                        <Progress
                          value={Math.round((unlockedInSection / section.lessons.length) * 100)}
                          className="h-1 bg-white/10 [&>div]:bg-quantum-cyan"
                        />
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Jornada recomendada */}
        <section className="grid gap-6 xl:grid-cols-2">
          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="h-5 w-5 text-quantum-lime" /> Jornada Recomendada
              </CardTitle>
              <CardDescription className="text-slate-400">
                Caminho sugerido para maximizar aprendizado e ativação operacional.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                {
                  step: "1",
                  title: "Trilha Fundamental",
                  description: "Boas-vindas, IOAID, SHO e painel do afiliado — base para tudo.",
                  href: "/academia/ead/curso?level=fundamental",
                  color: "text-quantum-cyan",
                  available: true,
                },
                {
                  step: "2",
                  title: "Trilha Agente",
                  description: "Configure seu agente e ative as skills essenciais.",
                  href: "/academia/ead/curso?level=agente",
                  color: "text-quantum-lime",
                  available: tierOrder[userTier] >= 2,
                },
                {
                  step: "3",
                  title: "Lab Nexus · Prompts & Templates",
                  description: "Use ferramentas prontas para acelerar sua operação.",
                  href: "/academia/ead/lab",
                  color: "text-amber-300",
                  available: tierOrder[userTier] >= 2,
                },
                {
                  step: "4",
                  title: "Trilha Master",
                  description: "Escale com funis, A/B testing e análise de coortes.",
                  href: "/academia/ead/curso?level=master",
                  color: "text-fuchsia-300",
                  available: tierOrder[userTier] >= 3,
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className={`flex items-start gap-3 rounded-2xl border border-white/10 p-4 transition ${
                    item.available
                      ? "bg-black/20 hover:bg-white/5"
                      : "bg-black/10 opacity-50"
                  }`}
                >
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/20 text-xs font-bold ${item.color}`}>
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className="mt-1 text-xs text-slate-400">{item.description}</p>
                  </div>
                  {item.available ? (
                    <Link href={item.href}>
                      <Button size="sm" variant="ghost" className="text-quantum-cyan hover:text-white">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  ) : (
                    <Lock className="h-4 w-4 text-slate-600" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-300" /> Destaques & Novidades
              </CardTitle>
              <CardDescription className="text-slate-400">
                Conteúdos recentes e recursos em destaque no EAD.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {EAD_SECTIONS.flatMap((s) =>
                s.lessons
                  .filter((l) => l.new && canAccessLesson(userTier, l.requiredTier))
                  .map((l) => ({ ...l, sectionSlug: s.slug, sectionTitle: s.title }))
              )
                .slice(0, 6)
                .map((lesson) => (
                  <Link
                    key={lesson.id}
                    href={`/academia/ead/${lesson.sectionSlug}/${lesson.id}`}
                  >
                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 transition hover:bg-white/5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-quantum-lime/20 bg-quantum-lime/10 text-xs font-bold text-quantum-lime">
                        Novo
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-semibold text-white">{lesson.title}</p>
                        <p className="text-xs text-slate-400">{lesson.sectionTitle} · {lesson.duration}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-quantum-cyan" />
                    </div>
                  </Link>
                ))}

              {EAD_SECTIONS.flatMap((s) =>
                s.lessons.filter((l) => l.new && canAccessLesson(userTier, l.requiredTier))
              ).length === 0 && (
                <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 py-10 text-center text-slate-400">
                  <BookOpen className="h-10 w-10 opacity-30" />
                  <p className="text-sm">Nenhuma novidade no seu tier atual.</p>
                  <p className="text-xs text-slate-500">Evolua seu nível para desbloquear mais conteúdos.</p>
                </div>
              )}

              <div className="pt-2">
                <Link href="/packs">
                  <Button variant="outline" className="w-full border-quantum-purple/30 bg-quantum-purple/10 text-white hover:bg-quantum-purple/20">
                    <Sparkles className="mr-2 h-4 w-4 text-quantum-purple" />
                    Evoluir nível de acesso
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </DashboardLayout>
  );
}
