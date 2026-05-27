import { useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMarketplaceProfile } from "@/hooks/useMarketplaceProfile";
import {
  formatCurrency,
  getHighestActivePack,
  getLevelLabel,
  NEXUS_PACKS,
} from "@/lib/nexus-marketplace";
import { Activity, Cpu, IdCard, Layers, ShieldCheck, TrendingUp, Users } from "lucide-react";

// =============================================================================
// SiSu — Sistema Sustentável de Sub-Contas
// Sub-contas A² vinculadas ao mesmo CPF do titular. NÃO exigem novo cadastro:
// são geradas conforme o avanço de níveis (campo `sisuPacksA2` de cada pack).
// =============================================================================

export default function SisuPanel() {
  const { profile } = useMarketplaceProfile();
  const highest = useMemo(() => getHighestActivePack(profile), [profile]);

  const cumulativeSisuEntitlement = useMemo(() => highest?.sisuPacksA2 ?? 0, [highest?.sisuPacksA2]);

  const sisuReleaseMatrix = useMemo(
    () =>
      NEXUS_PACKS.filter((pack) => pack.order > 1).map((pack) => ({
        slug: pack.slug,
        shortName: pack.shortName,
        total: pack.sisuPacksA2,
      })),
    [],
  );

  const subAccounts = profile.sisuSubAccounts;
  const totalMonthly = subAccounts.reduce((acc, sub) => acc + sub.monthlyResultCents, 0);
  const totalDirects = subAccounts.reduce((acc, sub) => acc + sub.directs, 0);
  const activeCount = subAccounts.filter((s) => s.status === "ativa").length;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <section className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(2,6,23,0.96))] p-6 shadow-2xl shadow-black/20">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <Badge className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">
                SiSu · Sistema Sustentável de Sub-Contas
              </Badge>
              <h1 className="text-3xl font-bold text-white md:text-4xl">Painel Sub-Redes (SiSu)</h1>
              <p className="max-w-3xl text-sm leading-6 text-slate-300 md:text-base">
                As sub-contas SiSu são geradas automaticamente conforme você avança nos packs (Age.txt), sem a necessidade de novos cadastros — ficam <strong className="text-quantum-cyan">vinculadas ao mesmo CPF/titular</strong>. Cada novo pack libera uma quantidade específica de Packs A² SiSu, que você pode optar por ativar.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
              <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-quantum-cyan">titular</p>
              <p className="mt-2 text-lg font-semibold text-white">{profile.userName ?? "Sem nome cadastrado"}</p>
              <p className="text-xs text-slate-400 inline-flex items-center gap-1">
                <IdCard className="h-3 w-3" /> CPF: {profile.cpf || "não informado"}
              </p>
              <p className="mt-2 text-xs text-slate-400">Nível atual: {getLevelLabel(profile.currentLevel)}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Sub-contas geradas"  value={subAccounts.length}             tone="text-white"             icon={Layers}     />
          <KpiCard label="Ativas"               value={activeCount}                     tone="text-quantum-lime"     icon={ShieldCheck}/>
          <KpiCard label="Total diretos somados" value={totalDirects}                   tone="text-quantum-cyan"     icon={Users}      />
          <KpiCard label="Resultado mensal (R$)" value={(totalMonthly / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} tone="text-quantum-purple" icon={TrendingUp} />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Cpu className="h-5 w-5 text-quantum-cyan" />
                Minhas Sub-Contas
              </CardTitle>
              <CardDescription className="text-slate-400">
                Todas as sub-contas pertencem ao mesmo CPF e dispensam novo cadastro.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {subAccounts.length === 0 && (
                <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
                  Nenhuma sub-conta gerada ainda. Avance no plano de carreira para liberar novos Packs A² SiSu.
                </div>
              )}
              {subAccounts.map((sub) => (
                <div key={sub.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{sub.label}</p>
                      <p className="text-xs text-slate-400">
                        Criada em {new Date(sub.createdAt).toLocaleDateString("pt-BR")} · Nível {getLevelLabel(sub.level)}
                      </p>
                    </div>
                    <Badge
                      className={`border ${
                        sub.status === "ativa"
                          ? "border-quantum-lime/30 bg-quantum-lime/10 text-quantum-lime"
                          : sub.status === "pausada"
                            ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
                            : "border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan"
                      }`}
                    >
                      {sub.status === "ativa" ? "Ativa" : sub.status === "pausada" ? "Pausada" : "Em setup"}
                    </Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-lg border border-white/10 bg-white/5 p-2">
                      <p className="uppercase tracking-[0.2em] text-slate-500">Diretos</p>
                      <p className="mt-1 text-lg font-semibold text-white">{sub.directs}</p>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/5 p-2">
                      <p className="uppercase tracking-[0.2em] text-slate-500">Resultado/mês</p>
                      <p className="mt-1 text-lg font-semibold text-quantum-lime">
                        {formatCurrency(sub.monthlyResultCents)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-quantum-cyan/30 bg-quantum-cyan/5 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Activity className="h-5 w-5 text-quantum-cyan" />
                Direito liberado (SiSu)
              </CardTitle>
              <CardDescription className="text-slate-300">
                Liberação oficial do seu pack mais alto ativo, conforme a tabela SiSu do plano de carreira.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Total liberado</p>
                <p className="mt-2 text-4xl font-bold text-quantum-cyan">{cumulativeSisuEntitlement}</p>
                <p className="mt-1 text-xs text-slate-400">Total SiSu liberado no pack atual</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-xs text-slate-300">
                <p className="font-semibold text-quantum-cyan">Tabela oficial de liberação</p>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {sisuReleaseMatrix.map((entry) => (
                    <div key={entry.slug} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                      <p className="text-[11px] font-semibold text-white">Pack {entry.shortName}</p>
                      <p className="mt-1 text-[11px] text-slate-400">{entry.total.toLocaleString("pt-BR")} SiSu</p>
                    </div>
                  ))}
                </div>
              </div>
              <Button variant="outline" className="w-full border-white/15 bg-white/5 text-white hover:bg-white/10" disabled>
                Ativar nova sub-conta (em breve via API)
              </Button>
            </CardContent>
          </Card>
        </section>

        <section className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-xs text-amber-100">
          <p className="font-semibold">Importante</p>
          <p className="mt-1">
            As sub-contas SiSu são opcionais. Você pode optar por ativá-las quando o avanço no plano de carreira liberar novos Packs A² SiSu. Todas permanecem vinculadas ao mesmo titular/CPF, sem duplicar cadastro nem comprometer a integridade do KYC.
          </p>
        </section>
      </div>
    </DashboardLayout>
  );
}

function KpiCard({
  label,
  value,
  tone,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  tone: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur">
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">{label}</p>
          <p className={`mt-2 text-2xl font-bold ${tone}`}>{value}</p>
        </div>
        <Icon className={`h-5 w-5 ${tone}`} />
      </CardContent>
    </Card>
  );
}
