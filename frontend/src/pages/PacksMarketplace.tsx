import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMarketplaceProfile } from "@/hooks/useMarketplaceProfile";
// PACK_ENTITLEMENT_CARD_V2
import PackEntitlementsCard from "@/components/PackEntitlementsCard";
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
import {
  buildMarketplaceCheckoutUrl,
  clearMarketplaceCheckoutIntent,
  readMarketplaceCheckoutIntent,
} from "@/lib/marketplace-payments";

const STAGE_LABELS: Record<CareerStage, { title: string; subtitle: string; accent: string; surface: string; glow: string }> = {
  affiliate: {
    title: "Agente Afiliado",
    subtitle: "Entrada e primeiros upgrades",
    accent: "border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan",
    surface: "from-cyan-500/25 via-sky-500/10 to-transparent",
    glow: "shadow-cyan-500/10",
  },
  predictive: {
    title: "Escala Comercial",
    subtitle: "Mais alcance, consistência e ritmo de vendas",
    accent: "border-quantum-lime/30 bg-quantum-lime/10 text-quantum-lime",
    surface: "from-lime-500/20 via-emerald-500/10 to-transparent",
    glow: "shadow-lime-500/10",
  },
  generative: {
    title: "Criação Estratégica",
    subtitle: "Mais conteúdo, mais distribuição, mais valor percebido",
    accent: "border-quantum-purple/30 bg-quantum-purple/10 text-quantum-purple",
    surface: "from-fuchsia-500/20 via-violet-500/10 to-transparent",
    glow: "shadow-fuchsia-500/10",
  },
  orchestrator: {
    title: "Orquestração",
    subtitle: "Coordenação ampla da operação e do crescimento",
    accent: "border-amber-400/30 bg-amber-400/10 text-amber-300",
    surface: "from-amber-500/20 via-orange-500/10 to-transparent",
    glow: "shadow-amber-500/10",
  },
  agentic: {
    title: "Liderança Estratégica",
    subtitle: "Benefícios de alto nível para expansão e liderança",
    accent: "border-rose-400/30 bg-rose-400/10 text-rose-300",
    surface: "from-rose-500/20 via-pink-500/10 to-transparent",
    glow: "shadow-rose-500/10",
  },
};

type StageFilter = "all" | CareerStage;

const PROGRESSION_GUIDES: Record<string, string> = {
  "pack-a2": "Comece com o Pack A² e ative sua primeira etapa na jornada.",
  "pack-a2ii": "Avance com 2 diretos ativos e alcance 5.000 XP para liberar o próximo passo.",
  "pack-a2iii": "Com 5 diretos ativos e 10.000 XP, sua estrutura ganha mais força comercial.",
  "pack-ag": "Chegue a 65.000 XP e 10 diretos para entrar em um novo patamar de escala.",
  "pack-agii": "Com 20 diretos e 210.000 XP, a operação ganha mais catálogo e maior alcance.",
  "pack-agiii": "Ao chegar a 315.000 XP e 30 diretos, você consolida a fase de expansão comercial.",
  "pack-agn": "A marca de 850.000 XP leva sua operação para uma fase mais criativa e estratégica.",
  "pack-agnii": "Com 2.700.000 XP e 20 diretos, você amplia produção, presença e resultados.",
  "pack-agniii": "O nível de 4.050.000 XP posiciona sua operação em liderança criativa e comercial.",
  "pack-ao": "Ao alcançar 5.500.000 XP, você entra em uma fase de coordenação mais ampla da operação.",
  "pack-aoii": "Com 11.000.000 XP e 20 diretos, a operação ganha estrutura de expansão de grande porte.",
  "pack-aoiii": "A partir de 17.000.000 XP, sua coordenação comercial entra em estágio pleno.",
  "pack-aa": "Com 35.000.000 XP, você acessa a primeira camada de liderança estratégica do ecossistema.",
  "pack-aaii": "Com 70.000.000 XP, sua operação entra em uma fase de receitas especiais ampliadas.",
  "pack-aaiii": "Ao chegar a 110.000.000 XP, você alcança o nível máximo de benefícios e acesso do ecossistema.",
};

export default function PacksMarketplace() {
  const { profile, activate } = useMarketplaceProfile();
  const [stage, setStage] = useState<StageFilter>("all");
  const [checkoutFeedback, setCheckoutFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const status = (params.get("status") || params.get("collection_status") || "").toLowerCase();

    if (!["approved", "authorized", "accredited"].includes(status)) {
      return;
    }

    const intent = readMarketplaceCheckoutIntent();
    if (!intent?.slug || intent.type !== "pack") {
      return;
    }

    if (!profile.activePackSlugs.includes(intent.slug)) {
      activate(intent.slug);
      setCheckoutFeedback(`Pagamento confirmado. O pack ${intent.name ?? intent.slug} agora está ativo no seu painel.`);
    } else {
      setCheckoutFeedback(`O pack ${intent.name ?? intent.slug} já está ativo no seu painel.`);
    }

    clearMarketplaceCheckoutIntent();
    window.history.replaceState({}, document.title, window.location.pathname);
  }, [activate, profile.activePackSlugs]);

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
    { id: "agentic", label: "Estratégico" },
  ];

  const filtered = stage === "all" ? packStates : packStates.filter((pack) => pack.stage === stage);
  const activeCount = packStates.filter((pack) => pack.access.status === "active").length;
  const availableCount = packStates.filter((pack) => pack.access.status === "available").length;
  const lockedCount = packStates.filter((pack) => pack.access.status === "locked").length;
  const firstAvailable = packStates.find((pack) => pack.access.status === "available") ?? packStates[0];

  return (
    <DashboardLayout>
            <PackEntitlementsCard variant="full" />
      <div className="space-y-8 pb-8">
        {checkoutFeedback && (
          <div className="rounded-2xl border border-quantum-lime/20 bg-quantum-lime/10 px-4 py-3 text-sm text-quantum-lime">
            {checkoutFeedback}
          </div>
        )}

        <section className="overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(0,229,255,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(124,255,178,0.14),transparent_30%),linear-gradient(180deg,rgba(15,23,42,0.94),rgba(2,6,23,0.98))] p-6 shadow-2xl shadow-black/30 md:p-8">
          <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr] xl:items-center">
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2">
                <Badge className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">Vitrine oficial de packs</Badge>
                <Badge className="border border-white/10 bg-white/5 text-slate-200">15 planos oficiais de evolução</Badge>
              </div>
              <div className="space-y-4">
                <h1 className="max-w-4xl text-4xl font-black tracking-tight text-white md:text-5xl xl:text-6xl">
                  Packs Nexus com visual de <span className="text-quantum-lime">loja virtual</span> e decisão de compra mais clara.
                </h1>
                <p className="max-w-3xl text-base leading-7 text-slate-300 md:text-lg">
                  Organizamos a vitrine para facilitar a escolha: preço em destaque, benefícios claros, requisitos de avanço e um fluxo de compra mais objetivo.
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
                      <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Faixa de carreira</p>
                      <p className="mt-2 text-xl font-semibold text-white">{STAGE_LABELS[firstAvailable.stage].title}</p>
                    </div>
                    <Badge className="border border-white/10 bg-white/5 text-slate-200">{firstAvailable.shortName}</Badge>
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
                        <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Faixa</p>
                        <p className="mt-2 text-sm font-semibold text-white">{stageInfo.title}</p>
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
                      <p className="text-sm font-semibold text-white">Status do plano</p>
                      <div className="flex flex-wrap gap-2">
                        {isActive ? (
                          <Badge className="border border-green-500/30 bg-green-500/10 text-green-400">Ativo</Badge>
                        ) : isAvailable ? (
                          <Badge className="border border-quantum-lime/30 bg-quantum-lime/10 text-quantum-lime">Disponível para compra</Badge>
                        ) : (
                          <Badge className="border border-amber-500/30 bg-amber-500/10 text-amber-300">Aguardando critérios</Badge>
                        )}
                        <Badge className="border border-white/10 bg-white/5 text-slate-300">Nível do agente: {pack.promptTier}</Badge>
                      </div>
                    </div>

                    {isActive ? (
                      <Button variant="outline" disabled className="border-green-500/30 bg-green-500/10 text-green-400">
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Pack ativo
                      </Button>
                    ) : isAvailable ? (
                      <Button variant="outline" disabled className="border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">
                        <Zap className="mr-2 h-4 w-4" />
                        Disponível na sua jornada
                      </Button>
                    ) : (
                      <Button variant="outline" disabled className="border-white/10 bg-white/5 text-slate-400">
                        <Lock className="mr-2 h-4 w-4" />
                        Aguardando critérios
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
            <strong className="text-white">Regra central do agente:</strong> somente o <strong className="text-quantum-cyan">Pack A²</strong> ativa o seu primeiro agente IA.
            Os outros 14 packs funcionam como evoluções desse mesmo agente, mantendo a sua jornada contínua e o avanço de benefícios em cada etapa.
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
