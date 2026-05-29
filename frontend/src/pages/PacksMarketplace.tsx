import { useMemo, useState } from "react";
import { Link } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMarketplaceProfile } from "@/hooks/useMarketplaceProfile";
import {
  CareerStage,
  formatCurrency,
  NEXUS_PACKS,
  getPackAccess,
  getLevelLabel,
  formatSkillSummary,
} from "@/lib/nexus-marketplace";
import {
  ArrowRight,
  CheckCircle2,
  Crown,
  Lock,
  Package,
  Sparkles,
  Star,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { buildMarketplaceCheckoutUrl } from "@/lib/marketplace-payments";

const STAGE_LABELS: Record<CareerStage, { title: string; subtitle: string; accent: string; surface: string; glow: string }> = {
  affiliate: {
    title: "Agente Afiliado",
    subtitle: "Entrada e primeiros upgrades",
    accent: "border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan",
    surface: "from-cyan-500/25 via-sky-500/10 to-transparent",
    glow: "shadow-cyan-500/10",
  },
  predictive: {
    title: "SCC Preditivo",
    subtitle: "Escala e previsibilidade comercial",
    accent: "border-quantum-lime/30 bg-quantum-lime/10 text-quantum-lime",
    surface: "from-lime-500/20 via-emerald-500/10 to-transparent",
    glow: "shadow-lime-500/10",
  },
  generative: {
    title: "SCC Generativo",
    subtitle: "Nível profissional de criação",
    accent: "border-quantum-purple/30 bg-quantum-purple/10 text-quantum-purple",
    surface: "from-fuchsia-500/20 via-violet-500/10 to-transparent",
    glow: "shadow-fuchsia-500/10",
  },
  orchestrator: {
    title: "SCC Orquestrador",
    subtitle: "Operação corporativa e sandbox",
    accent: "border-amber-400/30 bg-amber-400/10 text-amber-300",
    surface: "from-amber-500/20 via-orange-500/10 to-transparent",
    glow: "shadow-amber-500/10",
  },
  agentic: {
    title: "IA Agêntica SCC+",
    subtitle: "Camada executiva e estratégica",
    accent: "border-rose-400/30 bg-rose-400/10 text-rose-300",
    surface: "from-rose-500/20 via-pink-500/10 to-transparent",
    glow: "shadow-rose-500/10",
  },
};

type StageFilter = "all" | CareerStage;

const PROGRESSION_GUIDES: Record<string, string> = {
  "pack-a2": '0 diretos na Rede "N.O".',
  "pack-a2ii": 'Rede "N.O" com 2 Agentes Afiliados A²: 1.000 XP x 2 = 2.000 XP + 3.000 XP do Pack A²II = 5.000 XP.',
  "pack-a2iii": 'Rede "N.O" com 5 Agentes Afiliados A²: 1.000 XP x 5 = 5.000 XP + 5.000 XP do Pack A²III = 10.000 XP.',
  "pack-ag": 'Rede "N.O" com 10 Agentes Afiliados A²II: 30.000 XP + 10.000 XP de 2º nível + 25.000 XP do Pack AG = 65.000 XP.',
  "pack-agii": 'Rede "N.O" com 20 Agentes Afiliados A²III = 100.000 XP + 60.000 XP de 2º nível + 50.000 XP do Pack AGII = 210.000 XP.',
  "pack-agiii": 'Rede "N.O" com 30 Agentes Afiliados A²III = 150.000 XP + 90.000 XP de 2º nível + 75.000 XP do Pack AGIII = 315.000 XP.',
  "pack-agn": 'Rede "N.O" com 10 Agentes Preditivos AGII = 500.000 XP + 250.000 XP de 2º nível + 100.000 XP do Pack AGN = 850.000 XP.',
  "pack-agnii": 'Rede "N.O" com 20 Agentes Preditivos AGIII = 1.500.000 XP + 1.000.000 XP de 2º nível + 200.000 XP do Pack AGNII = 2.700.000 XP.',
  "pack-agniii": 'Rede "N.O" com 30 Agentes Preditivos AGIII = 2.250.000 XP + 1.500.000 XP de 2º nível + 300.000 XP do Pack AGNIII = 4.050.000 XP.',
  "pack-ao": 'Rede "N.O" com 10 Agentes Generativos AGNIII = 3.000.000 XP + 2.000.000 XP de 2º nível + 500.000 XP do Pack AO = 5.500.000 XP.',
  "pack-aoii": 'Rede "N.O" com 20 Agentes Generativos AGNIII = 6.000.000 XP + 4.000.000 XP de 2º nível + 1.000.000 XP do Pack AOII = 11.000.000 XP.',
  "pack-aoiii": 'Rede "N.O" com 30 Agentes Generativos AGNIII = 9.000.000 XP + 6.000.000 XP de 2º nível + 2.000.000 XP do Pack AOIII = 17.000.000 XP.',
  "pack-aa": 'Rede "N.O" com 10 Agentes Orquestradores AOIII = 20.000.000 XP + 10.000.000 XP de 2º nível + 5.000.000 XP do Pack AA = 35.000.000 XP.',
  "pack-aaii": 'Rede "N.O" com 20 Agentes Orquestradores AOIII = 40.000.000 XP + 20.000.000 XP de 2º nível + 10.000.000 XP do Pack AAII = 70.000.000 XP.',
  "pack-aaiii": 'Rede "N.O" com 30 Agentes Orquestradores AOIII = 60.000.000 XP + 30.000.000 XP de 2º nível + 20.000.000 XP do Pack AAIII = 110.000.000 XP.',
};

export default function PacksMarketplace() {
  const { profile } = useMarketplaceProfile();
  const [stage, setStage] = useState<StageFilter>("all");

  const packStates = useMemo(
    () =>
      NEXUS_PACKS.map((pack) => ({
        ...pack,
        access: getPackAccess(profile, pack),
      })),
    [profile],
  );

  const stages: Array<{ id: StageFilter; label: string }> = [
    { id: "all", label: "Todos" },
    { id: "affiliate", label: "Afiliado" },
    { id: "predictive", label: "Preditivo" },
    { id: "generative", label: "Generativo" },
    { id: "orchestrator", label: "Orquestrador" },
    { id: "agentic", label: "Agentic" },
  ];

  const filtered = stage === "all" ? packStates : packStates.filter((pack) => pack.stage === stage);
  const activeCount = packStates.filter((pack) => pack.access.status === "active").length;
  const availableCount = packStates.filter((pack) => pack.access.status === "available").length;
  const lockedCount = packStates.filter((pack) => pack.access.status === "locked").length;
  const firstAvailable = packStates.find((pack) => pack.access.status === "available") ?? packStates[0];

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-8">
        <section className="overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(0,229,255,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(124,255,178,0.14),transparent_30%),linear-gradient(180deg,rgba(15,23,42,0.94),rgba(2,6,23,0.98))] p-6 shadow-2xl shadow-black/30 md:p-8">
          <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr] xl:items-center">
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2">
                <Badge className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">Catálogo profissional de packs</Badge>
                <Badge className="border border-white/10 bg-white/5 text-slate-200">15 planos oficiais do PD/SCC</Badge>
              </div>
              <div className="space-y-4">
                <h1 className="max-w-4xl text-4xl font-black tracking-tight text-white md:text-5xl xl:text-6xl">
                  Packs Nexus com visual de <span className="text-quantum-lime">loja virtual</span> e decisão de compra mais clara.
                </h1>
                <p className="max-w-3xl text-base leading-7 text-slate-300 md:text-lg">
                  A vitrine foi reorganizada para parecer um catálogo premium: preço em destaque, benefícios visuais, critérios de liberação,
                  estágio de carreira e CTA de compra apresentados como uma experiência de e-commerce mais sofisticada.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">packs ativos</p>
                  <p className="mt-3 text-3xl font-bold text-white">{activeCount}</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">disponíveis</p>
                  <p className="mt-3 text-3xl font-bold text-quantum-lime">{availableCount}</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">bloqueados</p>
                  <p className="mt-3 text-3xl font-bold text-amber-300">{lockedCount}</p>
                </div>
              </div>
            </div>

            <Card className="border-white/10 bg-white/6 backdrop-blur">
              <CardHeader className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-xl text-white">Seu próximo plano em destaque</CardTitle>
                    <CardDescription className="mt-2 text-slate-300">
                      Um destaque principal para facilitar a tomada de decisão dentro da loja.
                    </CardDescription>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-amber-300">
                    <Crown className="h-5 w-5" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-[28px] border border-white/10 bg-black/25 p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={`border ${STAGE_LABELS[firstAvailable.stage].accent}`}>{STAGE_LABELS[firstAvailable.stage].title}</Badge>
                    <Badge className="border border-white/10 bg-white/5 text-slate-200">{firstAvailable.shortName}</Badge>
                    {firstAvailable.bringsAgent && (
                      <Badge className="border border-quantum-purple/30 bg-quantum-purple/10 text-quantum-purple">Entrega agente IA</Badge>
                    )}
                  </div>
                  <p className="mt-4 text-2xl font-bold text-white">{firstAvailable.name}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{firstAvailable.description}</p>
                  <div className="mt-5 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">investimento</p>
                      <p className="mt-2 text-4xl font-black text-white">{formatCurrency(firstAvailable.priceCents)}</p>
                    </div>
                    <Link
                      href={buildMarketplaceCheckoutUrl({
                        source: "packs",
                        type: "pack",
                        slug: firstAvailable.slug,
                        name: firstAvailable.name,
                        amountCents: firstAvailable.priceCents,
                        description: firstAvailable.description,
                      })}
                    >
                      <Button className="gradient-btn">
                        Comprar agora
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                  <p className="font-semibold text-white">Nível atual</p>
                  <p className="mt-2">{getLevelLabel(profile.currentLevel)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <div className="flex flex-wrap gap-2">
          {stages.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setStage(option.id)}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                stage === option.id
                  ? "border-quantum-cyan/60 bg-quantum-cyan/15 text-quantum-cyan"
                  : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-white"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <section className="grid gap-6 xl:grid-cols-2">
          {filtered.map((pack, index) => {
            const isActive = pack.access.status === "active";
            const isAvailable = pack.access.status === "available";
            const stageInfo = STAGE_LABELS[pack.stage];
            const missingCriteria = pack.access.missingCriteria;

            return (
              <Card
                key={pack.slug}
                className={`overflow-hidden border bg-white/5 backdrop-blur transition hover:-translate-y-1 hover:border-white/20 ${stageInfo.glow} shadow-2xl ${
                  isActive
                    ? "border-green-500/30 bg-green-500/10"
                    : isAvailable
                      ? "border-quantum-cyan/30"
                      : "border-white/10"
                }`}
              >
                <div className={`relative h-48 bg-gradient-to-br ${stageInfo.surface}`}>
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.05),rgba(2,6,23,0.72))]" />
                  <div className="relative flex h-full flex-col justify-between p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={`border ${stageInfo.accent}`}>{stageInfo.title}</Badge>
                      <Badge className="border border-white/10 bg-white/5 text-white">{pack.shortName}</Badge>
                      {index === 0 && stage === "all" && (
                        <Badge className="border border-amber-300/30 bg-amber-300/10 text-amber-200">Em destaque</Badge>
                      )}
                      {pack.bringsAgent && (
                        <Badge className="border border-quantum-purple/30 bg-quantum-purple/10 text-quantum-purple">Agente IA</Badge>
                      )}
                    </div>
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="text-3xl font-black text-white">{pack.name}</p>
                        <p className="mt-2 max-w-xl text-sm text-slate-200">{stageInfo.subtitle}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-right">
                        <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Preço</p>
                        <p className="mt-2 text-2xl font-black text-white">{formatCurrency(pack.priceCents)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <CardContent className="space-y-6 p-6">
                  <p className="text-sm leading-7 text-slate-300">{pack.description}</p>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                      <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">XP exigido</p>
                      <p className="mt-2 text-xl font-bold text-white">{pack.requirements.minXp.toLocaleString("pt-BR")}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                      <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Diretos</p>
                      <p className="mt-2 text-xl font-bold text-white">{pack.requirements.minDirectReferrals}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                      <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Skills</p>
                      <p className="mt-2 text-sm font-semibold leading-6 text-white">{formatSkillSummary(pack.skills, pack.promptTier)}</p>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    {pack.highlights.map((highlight) => (
                      <div key={highlight} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                        {highlight}
                      </div>
                    ))}
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-black/25 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-white">
                      <Star className="h-4 w-4 text-amber-300" />
                      Guia oficial de progressão
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-300">{PROGRESSION_GUIDES[pack.slug]}</p>
                  </div>

                  {missingCriteria.length > 0 && (
                    <div className="rounded-3xl border border-amber-400/20 bg-amber-400/5 p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-amber-200">
                        <Users className="h-4 w-4" />
                        Critérios pendentes
                      </div>
                      <ul className="mt-3 space-y-2 text-sm text-amber-100/90">
                        {missingCriteria.map((criteria) => (
                          <li key={criteria} className="flex items-start gap-2">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-300" />
                            <span>{criteria}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-white">Status do pack</p>
                      <div className="flex flex-wrap gap-2">
                        {isActive ? (
                          <Badge className="border border-green-500/30 bg-green-500/10 text-green-400">Ativo</Badge>
                        ) : isAvailable ? (
                          <Badge className="border border-quantum-lime/30 bg-quantum-lime/10 text-quantum-lime">Disponível para compra</Badge>
                        ) : (
                          <Badge className="border border-amber-500/30 bg-amber-500/10 text-amber-300">Aguardando critérios</Badge>
                        )}
                        <Badge className="border border-white/10 bg-white/5 text-slate-300">Prompt {pack.promptTier}</Badge>
                      </div>
                    </div>

                    {isActive ? (
                      <Button variant="outline" disabled className="border-green-500/30 bg-green-500/10 text-green-400">
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Pack ativo
                      </Button>
                    ) : isAvailable ? (
                      <Link
                        href={buildMarketplaceCheckoutUrl({
                          source: "packs",
                          type: "pack",
                          slug: pack.slug,
                          name: pack.name,
                          amountCents: pack.priceCents,
                          description: pack.description,
                        })}
                      >
                        <Button className="gradient-btn">
                          <Zap className="mr-2 h-4 w-4" />
                          Comprar pack
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    ) : (
                      <Button variant="outline" disabled className="border-white/10 bg-white/5 text-slate-400">
                        <Lock className="mr-2 h-4 w-4" />
                        Bloqueado no momento
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section className="rounded-[32px] border border-white/10 bg-white/5 p-6 backdrop-blur md:p-8">
          <div className="grid gap-4 xl:grid-cols-5">
            {(Object.entries(STAGE_LABELS) as Array<[CareerStage, (typeof STAGE_LABELS)[CareerStage]]>).map(([key, stageInfo]) => {
              const total = NEXUS_PACKS.filter((pack) => pack.stage === key).length;
              return (
                <div key={key} className="rounded-3xl border border-white/10 bg-black/25 p-5">
                  <Badge className={`border ${stageInfo.accent}`}>{stageInfo.title}</Badge>
                  <p className="mt-4 text-lg font-semibold text-white">{total} packs</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{stageInfo.subtitle}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-6 rounded-3xl border border-white/10 bg-black/25 p-5 text-sm leading-7 text-slate-300">
            <strong className="text-white">Regra central do agente:</strong> somente o <strong className="text-quantum-cyan">Pack A²</strong> cria o agente IA.
            Os outros 14 packs atuam como upgrades progressivos do mesmo agente, preservando continuidade operacional e evolução por nível.
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
