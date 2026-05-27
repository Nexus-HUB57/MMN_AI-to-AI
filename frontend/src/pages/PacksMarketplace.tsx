import { useMemo, useState } from "react";
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
import { ArrowRight, CheckCircle2, Lock, Package, Sparkles, Trophy, Zap } from "lucide-react";

const STAGE_LABELS: Record<CareerStage, { title: string; subtitle: string; accent: string }> = {
  affiliate:    { title: "Agente Afiliado",       subtitle: "Níveis de Acesso · I, II e III",      accent: "border-quantum-cyan/30 bg-quantum-cyan/5 text-quantum-cyan" },
  predictive:   { title: "SCC Preditivo",         subtitle: "Nível Intermediário · I, II e III",   accent: "border-quantum-lime/30 bg-quantum-lime/5 text-quantum-lime" },
  generative:   { title: "SCC Generativo",        subtitle: "Nível Profissional · I, II e III",    accent: "border-quantum-purple/30 bg-quantum-purple/5 text-quantum-purple" },
  orchestrator: { title: "SCC Orquestrador",      subtitle: "C-level · I, II e III",                accent: "border-amber-400/30 bg-amber-400/5 text-amber-300" },
  agentic:      { title: "IA Agêntica SCC+",      subtitle: "Nível CEO · I, II e III",              accent: "border-rose-400/30 bg-rose-400/5 text-rose-300" },
};

type StageFilter = "all" | CareerStage;

const PROGRESSION_GUIDES: Record<string, string> = {
  "pack-a2": '0 diretos na Rede "N.O"',
  "pack-a2ii": 'Rede "N.O" com 2 Agentes Afiliados A²: 1.000 XP x 2 = 2.000 XP + 3.000 XP do Pack A²II = 5.000 XP.',
  "pack-a2iii": 'Rede "N.O" com 5 Agentes Afiliados A²: 1.000 XP x 5 = 5.000 XP + 5.000 XP do Pack A²III = 10.000 XP.',
  "pack-ag": 'Rede "N.O" com 10 Agentes Afiliados A²II: 3.000 XP x 10 = 30.000 XP + 10.000 XP de 2º nível + 25.000 XP do Pack AG = 65.000 XP.',
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
  const { profile, activate } = useMarketplaceProfile();
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
    { id: "all", label: "Todos (15)" },
    { id: "affiliate", label: "Afiliado" },
    { id: "predictive", label: "Preditivo" },
    { id: "generative", label: "Generativo" },
    { id: "orchestrator", label: "Orquestrador" },
    { id: "agentic", label: "Agentic" },
  ];

  const filtered = stage === "all" ? packStates : packStates.filter((p) => p.stage === stage);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <section className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(2,6,23,0.96))] p-6 shadow-2xl shadow-black/20">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <Badge className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">
                15 Packs oficiais · Plano de Desenvolvimento SCC
              </Badge>
              <h1 className="text-3xl font-bold text-white md:text-4xl">Packs Nexus por nível de carreira</h1>
              <p className="max-w-3xl text-sm leading-6 text-slate-300 md:text-base">
                Os 15 packs seguem a hierarquia oficial (Age.txt): Afiliado I/II/III · Preditivo I/II/III · Generativo I/II/III · Orquestrador I/II/III · IA Agêntica SCC+ I/II/III. Apenas o <strong className="text-quantum-cyan">Pack A²</strong> entrega o Agente IA; os demais apenas evoluem o mesmo agente conforme o avanço.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
              <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-quantum-cyan">nível atual</p>
              <p className="mt-2 text-lg font-semibold text-white">{getLevelLabel(profile.currentLevel)}</p>
            </div>
          </div>
        </section>

        <div className="flex flex-wrap gap-2">
          {stages.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setStage(option.id)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                stage === option.id
                  ? "border-quantum-cyan/60 bg-quantum-cyan/15 text-quantum-cyan"
                  : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <section className="grid gap-6 xl:grid-cols-2">
          {filtered.map((pack) => {
            const isActive = pack.access.status === "active";
            const isAvailable = pack.access.status === "available";
            const stageInfo = STAGE_LABELS[pack.stage];

            return (
              <Card
                key={pack.slug}
                className={`border backdrop-blur ${
                  isActive
                    ? "border-green-500/30 bg-green-500/10"
                    : isAvailable
                      ? "border-quantum-cyan/30 bg-quantum-cyan/5"
                      : "border-white/10 bg-white/5"
                }`}
              >
                <CardHeader className="space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className={`border ${stageInfo.accent}`}>{stageInfo.title}</Badge>
                        <Badge className="border border-white/10 bg-white/5 text-slate-300">
                          {pack.shortName}
                        </Badge>
                        {pack.bringsAgent && (
                          <Badge className="border border-quantum-lime/30 bg-quantum-lime/10 text-quantum-lime">
                            ATIVA Agente IA
                          </Badge>
                        )}
                      </div>
                      <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                        <Package className="h-5 w-5 text-quantum-cyan" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl text-white">{pack.name}</CardTitle>
                        <CardDescription className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                          {pack.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge
                        className={`border ${
                          isActive
                            ? "border-green-500/30 bg-green-500/10 text-green-400"
                            : isAvailable
                              ? "border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan"
                              : "border-amber-500/30 bg-amber-500/10 text-amber-300"
                        }`}
                      >
                        {isActive ? "Ativo" : isAvailable ? pack.badge ?? "Disponível" : "Bloqueado"}
                      </Badge>
                      <p className="text-2xl font-bold text-white">{formatCurrency(pack.priceCents)}</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="grid gap-3 md:grid-cols-2">
                    {pack.highlights.map((highlight) => (
                      <div key={highlight} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-300">
                        {highlight}
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">XP exigido</p>
                      <p className="mt-2 text-xl font-semibold text-white">{pack.requirements.minXp.toLocaleString("pt-BR")}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Rede N.O mínima</p>
                      <p className="mt-2 text-xl font-semibold text-white">{pack.requirements.minDirectReferrals}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Skills do agente</p>
                      <p className="mt-2 text-sm font-semibold text-white leading-5">
                        {formatSkillSummary(pack.skills, pack.promptTier)}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Diretriz oficial de progressão</p>
                    <p className="mt-2 leading-6 text-slate-200">{PROGRESSION_GUIDES[pack.slug]}</p>
                  </div>

                  {pack.access.missingCriteria.length > 0 && (
                    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
                      <p className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-amber-200">
                        <Lock className="h-4 w-4" />
                        Critérios pendentes para liberação
                      </p>
                      <ul className="space-y-2 text-sm text-amber-100/90">
                        {pack.access.missingCriteria.map((criteria) => (
                          <li key={criteria} className="flex items-start gap-2">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-300" />
                            <span>{criteria}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
                      <Trophy className="h-3.5 w-3.5 text-quantum-cyan" />
                      <Sparkles className="h-3.5 w-3.5 text-quantum-purple" />
                      {stageInfo.subtitle}
                    </div>

                    {isActive ? (
                      <Button variant="outline" disabled className="border-green-500/30 bg-green-500/10 text-green-400">
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Pack ativo
                      </Button>
                    ) : isAvailable ? (
                      <Button className="gradient-btn" onClick={() => activate(pack.slug)}>
                        <Zap className="mr-2 h-4 w-4" />
                        Ativar pack
                        <ArrowRight className="ml-2 h-4 w-4" />
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

        <section className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-slate-300">
          <strong className="text-quantum-cyan">Regra do Agente IA:</strong> apenas o <strong>Pack A²</strong> entrega 1 Agente IA via OpenClaw. Todos os 14 packs seguintes apenas <strong>fazem upgrade automático</strong> do mesmo agente conforme o usuário sobe de nível, sem criar um novo agente.
        </section>

        <section className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.86),rgba(2,6,23,0.96))] p-6 shadow-2xl shadow-black/20">
          <div className="space-y-2">
            <Badge className="border border-quantum-purple/30 bg-quantum-purple/10 text-quantum-purple">
              Progressão oficial · 1 XP = R$ 1
            </Badge>
            <h2 className="text-2xl font-bold text-white">Cálculo detalhado de avanço por pack</h2>
            <p className="max-w-3xl text-sm leading-6 text-slate-300">
              As diretrizes abaixo consolidam a regra operacional informada para o avanço entre níveis do plano Nexus. O total de XP exibido em cada card já reflete esse cálculo final.
            </p>
          </div>
          <div className="mt-5 grid gap-3 xl:grid-cols-2">
            {NEXUS_PACKS.map((pack) => (
              <div key={`guide-${pack.slug}`} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-white">{pack.name}</p>
                  <Badge className="border border-white/10 bg-white/5 text-slate-300">{pack.shortName}</Badge>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-300">{PROGRESSION_GUIDES[pack.slug]}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.25em] text-quantum-cyan">Total exigido: {pack.requirements.minXp.toLocaleString("pt-BR")} XP</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
