import { Link } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMarketplaceProfile } from "@/hooks/useMarketplaceProfile";
import {
  ACADEMIA_QUICK_LINKS,
  ACADEMIA_RESOURCE_GROUPS,
  getAcademiaAccessibleTracks,
  getAcademiaRuntimeSummary,
} from "@/lib/nexus-academia";
import {
  getAgentSkillEntitlement,
  getLevelLabel,
} from "@/lib/nexus-marketplace";
import {
  ArrowRight,
  BookOpen,
  Brain,
  ExternalLink,
  FlaskConical,
  GraduationCap,
  Layers,
  Lock,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function AcademiaDashboard() {
  const { profile } = useMarketplaceProfile();
  const runtimeSummary = getAcademiaRuntimeSummary(profile);
  const tracks = getAcademiaAccessibleTracks(profile);
  const skillEntitlement = getAgentSkillEntitlement(profile);

  const statCards = [
    {
      label: "tier educacional",
      value: runtimeSummary.tier.label,
      helper: runtimeSummary.tier.statusLabel,
    },
    {
      label: "trilhas liberadas",
      value: `${runtimeSummary.unlockedTrackCount} / ${tracks.length}`,
      helper: "Progressão por PD/SCC",
    },
    {
      label: "skills mapeadas",
      value: `${runtimeSummary.unlockedSkills}`,
      helper: "Entitlements por trilha",
    },
    {
      label: "nível atual",
      value: getLevelLabel(profile.currentLevel),
      helper: `${profile.activePackSlugs.length} pack(s) ativos`,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-8">
        <section className="overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.20),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(0,229,255,0.14),transparent_28%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,1))] p-6 shadow-2xl shadow-black/30 md:p-8">
          <div className="grid gap-8 xl:grid-cols-[1.08fr_0.92fr] xl:items-center">
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2">
                <Badge className="border border-quantum-purple/30 bg-quantum-purple/10 text-quantum-purple">Nexus Academ'IA</Badge>
                <Badge className={`border ${runtimeSummary.tier.badgeTone}`}>{runtimeSummary.tier.label}</Badge>
                <Badge className="border border-white/10 bg-white/5 text-slate-200">Bridge ativa com runtime</Badge>
              </div>

              <div className="space-y-4">
                <h1 className="max-w-5xl text-4xl font-black tracking-tight text-white md:text-5xl xl:text-6xl">
                  Painel <span className="text-quantum-cyan">Nexus Academ'IA</span> com progressão, trilhas, Lab e Lib em uma única visão.
                </h1>
                <p className="max-w-4xl text-base leading-7 text-slate-300 md:text-lg">
                  A Academ'IA estrutura onboarding, operação com agentes, otimização e governança avançada. O acesso é liberado conforme a evolução do afiliado no PD/SCC e refletido na camada de entitlement do runtime.
                </p>
                <p className="max-w-4xl text-sm leading-7 text-slate-400 md:text-base">
                  Seu status atual é <strong className="text-white">{runtimeSummary.tier.statusLabel}</strong>. Isso libera {runtimeSummary.unlockedTrackCount} trilha(s), acesso <strong className="text-white">{runtimeSummary.tier.labAccess}</strong> ao Lab Nexus e uso <strong className="text-white">{runtimeSummary.tier.libAccess}</strong> da Lib Nexus.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {statCards.map((card) => (
                  <div key={card.label} className="rounded-3xl border border-white/10 bg-black/25 p-5">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">{card.label}</p>
                    <p className="mt-3 text-xl font-bold text-white">{card.value}</p>
                    <p className="mt-2 text-xs text-slate-400">{card.helper}</p>
                  </div>
                ))}
              </div>
            </div>

            <Card className="border-white/10 bg-white/6 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-xl text-white">Resumo operacional da Academ'IA</CardTitle>
                <CardDescription className="text-slate-300">
                  Acesso definido por carreira, packs ativos e sincronização de skills com o agente principal.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-3xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300">
                  <div className="mb-2 flex items-center gap-2 text-white"><GraduationCap className="h-4 w-4 text-quantum-cyan" /> Trilhas desbloqueadas</div>
                  <p>{runtimeSummary.tier.summary}</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300">
                  <div className="mb-2 flex items-center gap-2 text-white"><FlaskConical className="h-4 w-4 text-quantum-lime" /> Lab Nexus</div>
                  <p>Acesso atual: <strong className="text-white">{runtimeSummary.tier.labAccess}</strong> · recursos prontos para prompts, templates, tools e workflows.</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300">
                  <div className="mb-2 flex items-center gap-2 text-white"><ShieldCheck className="h-4 w-4 text-amber-300" /> Runtime / entitlement</div>
                  <p>{runtimeSummary.tier.runtimeAccess}. Skills atuais do agente: <strong className="text-white">{skillEntitlement.unlockedCount.basico}/{skillEntitlement.totalCount.basico}</strong> básicas, <strong className="text-white">{skillEntitlement.unlockedCount.intermediario}/{skillEntitlement.totalCount.intermediario}</strong> intermediárias e <strong className="text-white">{skillEntitlement.unlockedCount.avancado}/{skillEntitlement.totalCount.avancado}</strong> avançadas.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link href="/skills"><Button className="gradient-btn"><Sparkles className="mr-2 h-4 w-4" /> Ver skills liberadas</Button></Link>
                  <Link href="/agents/sync"><Button variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10"><Brain className="mr-2 h-4 w-4 text-quantum-cyan" /> Sincronizar runtime</Button></Link>
                  <Link href="/academia/lab-nexus/chatbot"><Button variant="outline" className="border-quantum-cyan/30 bg-quantum-cyan/10 text-white hover:bg-quantum-cyan/20"><FlaskConical className="mr-2 h-4 w-4 text-quantum-cyan" /> Abrir Lab Nexus</Button></Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white">Matriz de trilhas e desbloqueio</CardTitle>
              <CardDescription className="text-slate-400">
                Cada trilha acompanha status, público-alvo e skills liberadas pelo bridge da Academ'IA.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {tracks.map((track) => (
                <div
                  key={track.slug}
                  className={`rounded-3xl border p-5 ${track.unlocked ? "border-quantum-lime/25 bg-quantum-lime/5" : "border-white/10 bg-black/20"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{track.title}</p>
                      <p className="mt-1 text-xs text-slate-400">{track.subtitle}</p>
                    </div>
                    {track.unlocked ? (
                      <Badge className="border border-quantum-lime/30 bg-quantum-lime/10 text-quantum-lime">Liberada</Badge>
                    ) : (
                      <Badge className="border border-amber-400/30 bg-amber-400/10 text-amber-200">Bloqueada</Badge>
                    )}
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-300">{track.description}</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-slate-300">
                      <p className="uppercase tracking-[0.22em] text-slate-500">Público</p>
                      <p className="mt-2 text-sm font-semibold text-white">{track.audience}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-slate-300">
                      <p className="uppercase tracking-[0.22em] text-slate-500">Skills mapeadas</p>
                      <p className="mt-2 text-sm font-semibold text-white">{track.skillsGranted}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="text-xs text-slate-500">Acesso mínimo: {track.requiredTier}</p>
                    <a href={track.quickStartUrl} target="_blank" rel="noreferrer">
                      <Button variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10">
                        Abrir trilha
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </a>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white">Próximo desbloqueio</CardTitle>
              <CardDescription className="text-slate-400">
                Recomendações de ativação e evolução conforme sua posição atual no plano.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {runtimeSummary.nextTrack ? (
                <div className="rounded-3xl border border-amber-400/20 bg-amber-400/5 p-5 text-sm text-slate-200">
                  <div className="flex items-center gap-2 text-amber-200">
                    <Lock className="h-4 w-4" />
                    Próxima trilha sugerida
                  </div>
                  <p className="mt-3 text-lg font-semibold text-white">{runtimeSummary.nextTrack.title}</p>
                  <p className="mt-2 leading-6 text-slate-300">{runtimeSummary.nextTrack.description}</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">Requer tier {runtimeSummary.nextTrack.requiredTier}</p>
                </div>
              ) : (
                <div className="rounded-3xl border border-quantum-lime/20 bg-quantum-lime/5 p-5 text-sm text-slate-200">
                  <div className="flex items-center gap-2 text-quantum-lime">
                    <ShieldCheck className="h-4 w-4" />
                    Acesso máximo ativo
                  </div>
                  <p className="mt-3 text-lg font-semibold text-white">Você já atingiu a camada Elite da Academ'IA.</p>
                  <p className="mt-2 leading-6 text-slate-300">O próximo foco é aprofundar governança, contribuições em Lib Nexus e sincronização avançada do runtime.</p>
                </div>
              )}

              <div className="rounded-3xl border border-white/10 bg-black/20 p-5 text-sm text-slate-300">
                <p className="font-semibold text-white">Regras de acesso refletidas neste painel</p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
                  <li>• Iniciante: trilha Fundamental, Lab básico e Lib em leitura.</li>
                  <li>• Operador: Fundamental + Agente, Lab essencial e entitlement operacional.</li>
                  <li>• Estrategista: Master liberada, Lab completo e comentário orientado na Lib.</li>
                  <li>• Elite: todas as trilhas, blueprints e governança avançada.</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {ACADEMIA_RESOURCE_GROUPS.map((group) => (
            <Card key={group.slug} className="border-white/10 bg-white/5 backdrop-blur transition hover:-translate-y-1 hover:border-white/20">
              <CardContent className="space-y-3 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-quantum-cyan">
                  {group.slug === "lab" ? <FlaskConical className="h-5 w-5" /> : group.slug === "lib" ? <Layers className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
                </div>
                <div>
                  <p className="text-lg font-semibold text-white">{group.title}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-500">{group.countLabel}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{group.description}</p>
                </div>
                <a href={group.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-quantum-cyan hover:text-white">
                  Abrir referência
                  <ExternalLink className="h-4 w-4" />
                </a>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white">Atalhos críticos da operação</CardTitle>
              <CardDescription className="text-slate-400">
                Links diretos para o acervo vivo da Academ'IA no repositório principal.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {ACADEMIA_QUICK_LINKS.map((item) => (
                <a
                  key={item.title}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3 transition hover:border-white/20 hover:bg-white/5"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className="mt-1 text-xs text-slate-400">{item.description}</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-quantum-cyan" />
                </a>
              ))}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white">Jornada recomendada</CardTitle>
              <CardDescription className="text-slate-400">
                Fluxo sugerido para ativar aprendizado, runtime e produção comercial no mesmo ciclo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="font-semibold text-white">1. Start acadêmico</p>
                <p className="mt-2 leading-6">Conclua a trilha mais alta liberada no seu tier e valide os pré-requisitos de evolução no painel de packs.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="font-semibold text-white">2. Sincronização operacional</p>
                <p className="mt-2 leading-6">Atualize o runtime em <strong className="text-white">Sincronizar IA</strong> e confira as skills efetivamente disponíveis no agente.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="font-semibold text-white">3. Aplicação em campo</p>
                <p className="mt-2 leading-6">Use o <strong className="text-white">Lab Nexus</strong>, calendário social, materiais e vitrine de produtos para transformar conhecimento em rotina comercial.</p>
                <div className="mt-3">
                  <Link href="/academia/lab-nexus/chatbot"><Button variant="outline" className="border-quantum-cyan/30 bg-quantum-cyan/10 text-white hover:bg-quantum-cyan/20">Entrar no Chat Bot do Lab Nexus</Button></Link>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/packs"><Button variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10">Ver packs</Button></Link>
                <Link href="/content-hub"><Button variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10">Hub de conteúdo</Button></Link>
                <Link href="/dashboard"><Button className="gradient-btn">Voltar ao dashboard <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </DashboardLayout>
  );
}
