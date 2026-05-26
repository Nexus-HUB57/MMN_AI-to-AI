import { useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMarketplaceProfile } from "@/hooks/useMarketplaceProfile";
import { getAgentSkillEntitlement, getLevelLabel } from "@/lib/nexus-marketplace";
import { CheckCircle2, Cpu, Lock, Sparkles } from "lucide-react";

type LevelFilter = "all" | "basico" | "intermediario" | "avancado";

const LEVELS: Array<{ id: LevelFilter; label: string; tone: string; total: number }> = [
  { id: "all",            label: "Todos (45)",          tone: "text-white",            total: 45 },
  { id: "basico",         label: "Prompt Básico (15)",  tone: "text-quantum-cyan",     total: 15 },
  { id: "intermediario",  label: "Intermediário (15)",  tone: "text-quantum-lime",     total: 15 },
  { id: "avancado",       label: "Avançado (15)",       tone: "text-quantum-purple",   total: 15 },
];

const TIER_LABEL: Record<string, string> = {
  basico: "Prompt Básico",
  intermediario: "Prompt Intermediário",
  avancado: "Prompt Avançado",
  pleno: "Acesso Pleno (Básico + Intermediário + Avançado)",
};

export default function SkillsMarketplace() {
  const { profile } = useMarketplaceProfile();
  const entitlement = useMemo(() => getAgentSkillEntitlement(profile), [profile]);
  const [filter, setFilter] = useState<LevelFilter>("all");

  const filteredSkills = filter === "all" ? entitlement.skills : entitlement.skills.filter((s) => s.level === filter);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <section className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(2,6,23,0.96))] p-6 shadow-2xl shadow-black/20">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <Badge className="border border-quantum-purple/30 bg-quantum-purple/10 text-quantum-purple">
                45 Skills oficiais · Sincronização OpenClaw
              </Badge>
              <h1 className="text-3xl font-bold text-white md:text-4xl">Skills Nexus do Agente IA</h1>
              <p className="max-w-3xl text-sm leading-6 text-slate-300 md:text-base">
                O sistema dispõe de <strong className="text-quantum-cyan">15 skills Prompt Básico</strong>, <strong className="text-quantum-lime">15 skills Prompt Intermediário</strong> e <strong className="text-quantum-purple">15 skills Prompt Avançado</strong>. A liberação respeita exatamente a quantidade prevista pelo pack ativo no plano de carreira e a sincronização com o agente é feita via metodologia <strong>OpenClaw</strong>.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
              <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-quantum-cyan">nível atual</p>
              <p className="mt-2 text-lg font-semibold text-white">{getLevelLabel(profile.currentLevel)}</p>
              <p className="mt-1 text-xs text-slate-400">{TIER_LABEL[entitlement.promptTier]}</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {(["basico", "intermediario", "avancado"] as const).map((lvl) => {
              const unlocked = entitlement.unlockedCount[lvl];
              const total = entitlement.totalCount[lvl];
              const percent = Math.round((unlocked / total) * 100);
              return (
                <div key={lvl} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{TIER_LABEL[lvl]}</p>
                  <p className="mt-2 text-2xl font-bold text-white">
                    {unlocked}<span className="text-base text-slate-400"> / {total}</span>
                  </p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full ${
                        lvl === "basico" ? "bg-quantum-cyan" : lvl === "intermediario" ? "bg-quantum-lime" : "bg-quantum-purple"
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="flex flex-wrap gap-2">
          {LEVELS.map((level) => (
            <button
              key={level.id}
              type="button"
              onClick={() => setFilter(level.id)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                filter === level.id
                  ? "border-quantum-cyan/60 bg-quantum-cyan/15 text-quantum-cyan"
                  : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20"
              }`}
            >
              {level.label}
            </button>
          ))}
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredSkills.map((skill) => (
            <Card
              key={skill.slug}
              className={`border backdrop-blur ${
                skill.unlocked
                  ? "border-quantum-lime/30 bg-quantum-lime/5"
                  : "border-white/10 bg-white/5"
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
                      {skill.level === "basico"
                        ? "Nível I · Básico"
                        : skill.level === "intermediario"
                          ? "Nível II · Intermediário"
                          : "Nível III · Avançado"}
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
              <CardContent className="space-y-3">
                <p className="text-sm leading-6 text-slate-300">{skill.description}</p>
                <div
                  className={`rounded-xl border p-3 text-xs ${
                    skill.unlocked
                      ? "border-quantum-lime/20 bg-quantum-lime/10 text-quantum-lime"
                      : "border-amber-500/20 bg-amber-500/10 text-amber-200"
                  }`}
                >
                  <p className="inline-flex items-center gap-2">
                    {skill.unlocked ? (
                      <>
                        <Cpu className="h-3.5 w-3.5" />
                        Sincronizada no agente via OpenClaw
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5" />
                        Liberada quando o pack correspondente for ativado
                      </>
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="rounded-2xl border border-quantum-cyan/30 bg-quantum-cyan/5 p-4 text-sm text-slate-200">
          <p className="font-semibold text-quantum-cyan">🔗 Sincronização OpenClaw</p>
          <p className="mt-1 text-xs text-slate-300 leading-5">
            Cada skill liberada é injetada no agente IA via OpenClaw, atualizando o prompt operacional e o conjunto de tools disponíveis. Não há criação de novos agentes — apenas o agente original (Pack A²) é progressivamente potencializado.
          </p>
        </section>
      </div>
    </DashboardLayout>
  );
}
