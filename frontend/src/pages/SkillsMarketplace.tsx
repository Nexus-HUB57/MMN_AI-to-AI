import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMarketplaceProfile } from "@/hooks/useMarketplaceProfile";
import { getUnlockedSkillBundles } from "@/lib/nexus-marketplace";
import { CheckCircle2, Lock, Sparkles, Zap } from "lucide-react";

export default function SkillsMarketplace() {
  const { profile } = useMarketplaceProfile();
  const skillBundles = getUnlockedSkillBundles(profile);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <section className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(2,6,23,0.96))] p-6 shadow-2xl shadow-black/20">
          <div className="space-y-3">
            <Badge className="border border-quantum-purple/30 bg-quantum-purple/10 text-quantum-purple">Skills sincronizadas por plano</Badge>
            <h1 className="text-3xl font-bold text-white md:text-4xl">Skills do Marketplace Nexus</h1>
            <p className="max-w-3xl text-sm leading-6 text-slate-300 md:text-base">
              As skills do agente agora seguem a mesma hierarquia dos packs. Isso mantém o Marketplace em conformidade: o usuário só recebe as habilidades correspondentes ao plano efetivamente liberado pelo nível e XP.
            </p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {skillBundles.map((bundle) => {
            const isActive = bundle.status === "active";

            return (
              <Card
                key={bundle.slug}
                className={`border backdrop-blur ${
                  isActive ? "border-purple-500/30 bg-purple-500/10" : "border-white/10 bg-white/5"
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-3">
                      <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                        <Sparkles className="h-5 w-5 text-quantum-purple" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-white">{bundle.name}</CardTitle>
                        <CardDescription className="mt-2 text-sm leading-6 text-slate-300">
                          {bundle.description}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={`border ${isActive ? "border-green-500/30 bg-green-500/10 text-green-400" : "border-amber-500/30 bg-amber-500/10 text-amber-300"}`}>
                      {isActive ? "Liberada" : "Bloqueada"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Pacote técnico</p>
                    <p className="mt-2 text-lg font-semibold text-white">{bundle.skillSummary}</p>
                    <p className="mt-1 text-sm text-slate-400">Liberação vinculada ao {bundle.unlockPack?.name}</p>
                  </div>

                  <div className="space-y-3">
                    {bundle.highlights.map((highlight) => (
                      <div key={highlight} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                        <Zap className="h-4 w-4 text-quantum-cyan" />
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>

                  <div className={`rounded-2xl border p-4 text-sm ${isActive ? "border-green-500/20 bg-green-500/10 text-green-100" : "border-amber-500/20 bg-amber-500/10 text-amber-100"}`}>
                    <p className="flex items-start gap-2">
                      {isActive ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <Lock className="mt-0.5 h-4 w-4 shrink-0" />}
                      <span>
                        {isActive
                          ? "Essas skills já estão alinhadas ao seu plano atual e podem ser exibidas no backoffice do agente."
                          : `Essa skill bundle permanece bloqueada até a ativação do ${bundle.unlockPack?.shortName}.`}
                      </span>
                    </p>
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
