import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMarketplaceProfile } from "@/hooks/useMarketplaceProfile";
import { formatCurrency, NEXUS_PACKS, getPackAccess, getProgressSnapshot } from "@/lib/nexus-marketplace";
import { ArrowRight, CheckCircle2, Lock, Sparkles, Trophy, Zap } from "lucide-react";

export default function Upgrades() {
  const { profile, activate } = useMarketplaceProfile();
  const upgrades = NEXUS_PACKS.filter((pack) => pack.slug !== "pack-a2").map((pack) => ({
    ...pack,
    access: getPackAccess(profile, pack),
  }));
  const progress = getProgressSnapshot(profile);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <section className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(2,6,23,0.96))] p-6 shadow-2xl shadow-black/20">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <Badge className="border border-quantum-purple/30 bg-quantum-purple/10 text-quantum-purple">Upgrades oficiais do plano</Badge>
              <h1 className="text-3xl font-bold text-white md:text-4xl">Trilha de upgrades do Marketplace Nexus</h1>
              <p className="max-w-3xl text-sm leading-6 text-slate-300 md:text-base">
                Os upgrades deixaram de ser plugins genéricos e passaram a refletir a evolução real do plano. Cada etapa só é destravada quando o afiliado conclui integralmente os critérios definidos no Age.txt.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
              <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-quantum-cyan">próxima meta</p>
              <p className="mt-2 text-lg font-semibold text-white">{progress.nextPack?.shortName ?? "Todos concluídos"}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          {upgrades.map((upgrade) => {
            const isActive = upgrade.access.status === "active";
            const isAvailable = upgrade.access.status === "available";

            return (
              <Card key={upgrade.slug} className="border-white/10 bg-white/5 backdrop-blur">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-3">
                      <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                        <Sparkles className="h-5 w-5 text-quantum-purple" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl text-white">Upgrade para {upgrade.shortName}</CardTitle>
                        <CardDescription className="mt-2 text-sm leading-6 text-slate-300">
                          {upgrade.description}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={`border ${isActive ? "border-green-500/30 bg-green-500/10 text-green-400" : isAvailable ? "border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan" : "border-amber-500/30 bg-amber-500/10 text-amber-300"}`}>
                      {isActive ? "Concluído" : isAvailable ? "Disponível" : "Bloqueado"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Investimento</p>
                      <p className="mt-2 text-xl font-semibold text-white">{formatCurrency(upgrade.priceCents)}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">XP mínimo</p>
                      <p className="mt-2 text-xl font-semibold text-white">{upgrade.requirements.minXp.toLocaleString("pt-BR")}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Diretos qualificados</p>
                      <p className="mt-2 text-xl font-semibold text-white">{upgrade.requirements.minDirectReferrals}</p>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    {upgrade.highlights.map((highlight) => (
                      <div key={highlight} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                        <Zap className="h-4 w-4 text-quantum-cyan" />
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>

                  {upgrade.access.missingCriteria.length > 0 && (
                    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
                      <p className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-amber-200">
                        <Trophy className="h-4 w-4" />
                        Critérios pendentes
                      </p>
                      <ul className="space-y-2 text-sm text-amber-100/90">
                        {upgrade.access.missingCriteria.map((criteria) => (
                          <li key={criteria} className="flex items-start gap-2">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-300" />
                            <span>{criteria}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center justify-end">
                    {isActive ? (
                      <Button variant="outline" disabled className="border-green-500/30 bg-green-500/10 text-green-400">
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Upgrade concluído
                      </Button>
                    ) : isAvailable ? (
                      <Button className="gradient-btn" onClick={() => activate(upgrade.slug)}>
                        Ativar upgrade
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
      </div>
    </DashboardLayout>
  );
}
