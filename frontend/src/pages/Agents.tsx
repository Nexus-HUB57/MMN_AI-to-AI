import { useMemo, useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity,
  ArrowRight,
  Bot,
  CheckCircle2,
  Cpu,
  Lock,
  RefreshCcw,
  Sparkles,
  Zap,
} from "lucide-react";
import { useMarketplaceProfile } from "@/hooks/useMarketplaceProfile";
import {
  formatSkillSummary,
  getAgentSkillEntitlement,
  getHighestActivePack,
  getLevelLabel,
  NEXUS_PACKS,
} from "@/lib/nexus-marketplace";

const TIER_LABEL: Record<string, string> = {
  basico: "Prompt Básico",
  intermediario: "Prompt Intermediário",
  avancado: "Prompt Avançado",
  pleno: "Acesso Pleno (Básico + Intermediário + Avançado)",
};

export default function Agents() {
  const { user } = useAuth();
  const { profile } = useMarketplaceProfile();
  const [filter, setFilter] = useState<"all" | "basico" | "intermediario" | "avancado">("all");

  const highest = useMemo(() => getHighestActivePack(profile), [profile]);
  const entitlement = useMemo(() => getAgentSkillEntitlement(profile), [profile]);
  const nextPack = useMemo(() => {
    const order = highest?.order ?? 0;
    return NEXUS_PACKS.find((pack) => pack.order === order + 1) ?? null;
  }, [highest?.order]);

  const filtered = filter === "all" ? entitlement.skills : entitlement.skills.filter((s) => s.level === filter);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <section className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(2,6,23,0.96))] p-6 shadow-2xl shadow-black/20">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <Badge className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">
                Painel do Agente IA · OpenClaw
              </Badge>
              <h1 className="text-3xl font-bold text-white md:text-4xl">Seu Agente Nexus</h1>
              <p className="max-w-3xl text-sm leading-6 text-slate-300 md:text-base">
                Apenas o <strong className="text-quantum-cyan">Pack A²</strong> instala um Agente IA. Todos os 14 packs seguintes evoluem o <strong>mesmo</strong> agente, aplicando upgrades de prompt e novas skills via OpenClaw conforme o avanço do plano de carreira.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
              <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-quantum-cyan">titular</p>
              <p className="mt-2 text-lg font-semibold text-white">{user?.name ?? "Usuário Nexus"}</p>
              <p className="mt-1 text-xs text-slate-400">Nível atual: {getLevelLabel(profile.currentLevel)}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Pack ativo</p>
                <p className="mt-2 text-lg font-semibold text-white">{highest?.shortName ?? "Sem pack ativo"}</p>
                <p className="text-xs text-slate-400">{highest ? highest.name : "Ative o Pack A² para criar o agente."}</p>
              </div>
              <Bot className="h-6 w-6 text-quantum-cyan" />
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Tier do prompt</p>
                <p className="mt-2 text-lg font-semibold text-white">{TIER_LABEL[entitlement.promptTier]}</p>
                <p className="text-xs text-slate-400">Sincronizado via OpenClaw</p>
              </div>
              <Cpu className="h-6 w-6 text-quantum-purple" />
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Skills liberadas</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {entitlement.unlockedCount.basico + entitlement.unlockedCount.intermediario + entitlement.unlockedCount.avancado}
                  <span className="ml-1 text-sm text-slate-400">/ 45</span>
                </p>
                <p className="text-xs text-slate-400">
                  {entitlement.unlockedCount.basico} I · {entitlement.unlockedCount.intermediario} II · {entitlement.unlockedCount.avancado} III
                </p>
              </div>
              <Sparkles className="h-6 w-6 text-quantum-lime" />
            </CardContent>
          </Card>
          <Card className="border-quantum-cyan/30 bg-quantum-cyan/5 backdrop-blur">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Próximo upgrade</p>
                <p className="mt-2 text-lg font-semibold text-white">{nextPack?.shortName ?? "Topo do plano"}</p>
                {nextPack && (
                  <p className="text-xs text-slate-400">{formatSkillSummary(nextPack.skills, nextPack.promptTier)}</p>
                )}
              </div>
              <Zap className="h-6 w-6 text-quantum-cyan" />
            </CardContent>
          </Card>
        </section>

        {!highest && (
          <Card className="border-amber-400/30 bg-amber-400/5 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white">Ative o Pack A² para criar seu Agente IA</CardTitle>
              <CardDescription className="text-amber-100">
                Nenhum Pack ainda foi ativado. Vá ao Marketplace para liberar o Agente IA inicial via OpenClaw.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/packs">
                <Button className="gradient-btn">
                  Ativar Pack A² <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">Skills do agente</h2>
              <p className="text-xs text-slate-400">
                Skills cumulativas liberadas pelo pack atual. Para liberar novas, faça upgrade do plano.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { id: "all", label: "Todos" },
                  { id: "basico", label: "Básico" },
                  { id: "intermediario", label: "Intermediário" },
                  { id: "avancado", label: "Avançado" },
                ] as const
              ).map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setFilter(option.id)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                    filter === option.id
                      ? "border-quantum-cyan/60 bg-quantum-cyan/15 text-quantum-cyan"
                      : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((skill) => (
              <Card
                key={skill.slug}
                className={`border backdrop-blur ${
                  skill.unlocked ? "border-quantum-lime/30 bg-quantum-lime/5" : "border-white/10 bg-white/5"
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <Badge
                        className={`border ${
                          skill.level === "basico"
                            ? "border-quantum-cyan/40 bg-quantum-cyan/10 text-quantum-cyan"
                            : skill.level === "intermediario"
                              ? "border-quantum-lime/40 bg-quantum-lime/10 text-quantum-lime"
                              : "border-quantum-purple/40 bg-quantum-purple/10 text-quantum-purple"
                        }`}
                      >
                        {skill.level === "basico" ? "Nível I" : skill.level === "intermediario" ? "Nível II" : "Nível III"}
                      </Badge>
                      <CardTitle className="text-base text-white">
                        #{skill.order.toString().padStart(2, "0")} · {skill.name}
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-400">{skill.category}</CardDescription>
                    </div>
                    {skill.unlocked ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-quantum-lime" />
                    ) : (
                      <Lock className="h-5 w-5 shrink-0 text-slate-500" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-6 text-slate-300">{skill.description}</p>
                  <div
                    className={`mt-3 rounded-xl border p-3 text-xs ${
                      skill.unlocked
                        ? "border-quantum-lime/20 bg-quantum-lime/10 text-quantum-lime"
                        : "border-amber-500/20 bg-amber-500/10 text-amber-200"
                    }`}
                  >
                    <p className="inline-flex items-center gap-2">
                      {skill.unlocked ? (
                        <>
                          <Activity className="h-3.5 w-3.5" /> Já injetada no agente via OpenClaw
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5" /> Libera no próximo pack que contemplar esta posição
                        </>
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
          <div className="inline-flex items-center gap-2">
            <RefreshCcw className="h-4 w-4 text-quantum-cyan" />
            Sincronização do agente: <strong className="text-white">OpenClaw</strong>
          </div>
          <Link href="/packs">
            <Button variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10">
              Ver packs e upgrades <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </section>
      </div>
    </DashboardLayout>
  );
}
