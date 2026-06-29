import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart3, Coins, Gift, Lightbulb, Network, Rocket, ShoppingCart, Sparkles, Target } from "lucide-react";
import { getLevelLabel, getLevelSubtitle, getProgressSnapshot, loadMarketplaceProfile } from "@/lib/nexus-marketplace";

const MULTIPLIERS = [
  { label: "Vendas", value: "10x", description: "Pontuação acelerada para movimentação comercial validada.", icon: ShoppingCart, accent: "text-quantum-lime", border: "border-quantum-lime/30", bg: "bg-quantum-lime/10" },
  { label: "Comissões", value: "5x", description: "Multiplicador aplicado sobre comissões reconhecidas no ciclo.", icon: Coins, accent: "text-quantum-cyan", border: "border-quantum-cyan/30", bg: "bg-quantum-cyan/10" },
  { label: "Bônus", value: "15x", description: "Maior peso para bônus elegíveis dentro da jornada ativa.", icon: Gift, accent: "text-quantum-purple", border: "border-quantum-purple/30", bg: "bg-quantum-purple/10" },
  { label: "Network", value: "3x", description: "Pontuação de rede aplicada às movimentações qualificadas.", icon: Network, accent: "text-amber-300", border: "border-amber-400/30", bg: "bg-amber-400/10" },
] as const;

export default function CareerProgress() {
  const profile = loadMarketplaceProfile();
  const progress = getProgressSnapshot(profile);
  const xpPercent = Math.max(0, Math.min(100, progress.xpProgressPct));
  const directsPercent = Math.max(0, Math.min(100, progress.directProgressPct));
  const currentLevel = getLevelLabel(profile.currentLevel);
  const currentSubtitle = getLevelSubtitle(profile.currentLevel);

  const tips = [
    `Foque em fechar vendas diretas para acelerar o XP com multiplicador 10x.`,
    `Converta comissões pendentes em confirmadas para empurrar o ciclo de progressão.`,
    `Ative a rede direta qualificada para encurtar o caminho do próximo nível.`,
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-8">
        <section className="overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(0,229,255,0.15),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.14),transparent_30%),linear-gradient(180deg,rgba(15,23,42,0.94),rgba(2,6,23,0.98))] p-6 shadow-2xl shadow-black/30 md:p-8">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">Carreira Nexus</Badge>
              <Badge className="border border-white/10 bg-white/5 text-slate-200">Seu painel de progressão</Badge>
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl">Nível atual, XP e próximo avanço</h1>
              <p className="max-w-3xl text-base leading-7 text-slate-300 md:text-lg">
                Veja em que nível você está, quanto falta para o próximo salto e quais ações têm mais impacto no crescimento da sua jornada.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white"><Rocket className="h-5 w-5 text-quantum-cyan" /> Status atual</CardTitle>
              <CardDescription className="text-slate-400">Leitura operacional da sua posição no plano.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Nível</p>
                  <p className="mt-2 text-xl font-bold text-white">{currentLevel}</p>
                  <p className="mt-1 text-sm text-slate-400">{currentSubtitle}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">XP atual</p>
                  <p className="mt-2 text-xl font-bold text-quantum-lime">{profile.currentXp.toLocaleString('pt-BR')}</p>
                  <p className="mt-1 text-sm text-slate-400">Meta seguinte: {progress.nextLevel?.requiredXp?.toLocaleString('pt-BR') ?? 'máximo atingido'}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Diretos qualificados</p>
                  <p className="mt-2 text-xl font-bold text-quantum-purple">{profile.directReferrals.toLocaleString('pt-BR')}</p>
                  <p className="mt-1 text-sm text-slate-400">Próximo alvo: {progress.nextLevel?.requiredDirects?.toLocaleString('pt-BR') ?? 'máximo atingido'}</p>
                </div>
              </div>

              <div className="space-y-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                    <span>Progresso de XP</span>
                    <span>{xpPercent.toFixed(0)}%</span>
                  </div>
                  <Progress value={xpPercent} className="h-3" />
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                    <span>Progresso de diretos</span>
                    <span>{directsPercent.toFixed(0)}%</span>
                  </div>
                  <Progress value={directsPercent} className="h-3" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-quantum-cyan/30 bg-quantum-cyan/5 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white"><Target className="h-5 w-5 text-quantum-cyan" /> Próximo nível</CardTitle>
              <CardDescription className="text-slate-300">Orientação prática para subir de faixa.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Próximo patamar</p>
                <p className="mt-2 text-lg font-semibold text-white">{progress.nextLevel?.label ?? 'Elite consolidada'}</p>
                <p className="mt-1 text-sm text-slate-400">{progress.nextLevel?.subtitle ?? 'Você já está no topo da trilha atual.'}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p>Faltam <strong className="text-white">{Math.max(0, progress.xpRemaining ?? 0).toLocaleString('pt-BR')} XP</strong> e <strong className="text-white">{Math.max(0, progress.directRemaining ?? 0)}</strong> diretos qualificados.</p>
              </div>
              <div className="space-y-2 rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="flex items-center gap-2 font-medium text-white"><Lightbulb className="h-4 w-4 text-amber-300" /> Dicas práticas</p>
                {tips.map((tip) => (
                  <p key={tip} className="text-slate-300">• {tip}</p>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {MULTIPLIERS.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.label} className={`border ${item.border} ${item.bg} backdrop-blur`}>
                <CardHeader className="space-y-4">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-black/20 ${item.accent}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardDescription className="text-[11px] uppercase tracking-[0.3em] text-slate-500">Multiplicador</CardDescription>
                    <CardTitle className={`mt-2 text-5xl font-black ${item.accent}`}>{item.value}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold text-white">{item.label}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{item.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <Card className="border-white/10 bg-white/5 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white"><BarChart3 className="h-5 w-5 text-quantum-cyan" /> Resumo da jornada</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm leading-7 text-slate-300 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-white/10 bg-black/20 p-4"><p className="font-semibold text-white">10x em Vendas</p><p className="mt-1 text-slate-400">Acelera aquisição de XP comercial.</p></div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-4"><p className="font-semibold text-white">5x em Comissões</p><p className="mt-1 text-slate-400">Reflete liquidação financeira do ciclo.</p></div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-4"><p className="font-semibold text-white">15x em Bônus</p><p className="mt-1 text-slate-400">Premia ações e campanhas elegíveis.</p></div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-4"><p className="flex items-center gap-2 font-semibold text-white"><Sparkles className="h-4 w-4 text-quantum-cyan" /> Próximo foco</p><p className="mt-1 text-slate-400">Concluir XP e diretos do próximo nível.</p></div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
