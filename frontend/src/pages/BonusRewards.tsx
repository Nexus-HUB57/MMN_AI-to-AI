import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Gift, HandCoins, PiggyBank, Sparkles, Star, Trophy, Users } from "lucide-react";

// =============================================================================
// Painel "RECOMPENSAS" do Dashboard — alinhado APENAS aos bônus oficiais
// (docs/planning/Plano de Carreira Peer). Não existem prêmios "Diamante" ou
// "Esmeralda". Ações eventuais (sorteios/metas) recebem prazo final.
// =============================================================================

interface BonusRewardsProps {
  userName?: string;
}

const REWARDS = [
  {
    id: "revenda",
    title: "Revenda Marketplace + N.O",
    description:
      "100% lucro na revenda + comissões em cascata (20% / 10% / 5% / 2,5% / 1%) nos 5 níveis.",
    reward: "Até 100% margem",
    icon: HandCoins,
    tone: "text-quantum-cyan",
    border: "border-quantum-cyan/30",
    bg: "bg-quantum-cyan/5",
    isEventual: false,
  },
  {
    id: "onepack",
    title: "Bônus OnePack",
    description:
      "Ganho por cada Pack adquirido pela sua rede: A²II R$ 2,50 · AG R$ 10 · AO R$ 300 · AA R$ 2.500.",
    reward: "R$ 2,50 → R$ 7.500",
    icon: Gift,
    tone: "text-quantum-purple",
    border: "border-quantum-purple/30",
    bg: "bg-quantum-purple/5",
    isEventual: false,
  },
  {
    id: "consumo",
    title: "Bônus de Consumo",
    description: "3% / 2% / 1,5% sobre ativações mensais do N.O — Preditivo a Agentic.",
    reward: "Até 14% / mês",
    icon: PiggyBank,
    tone: "text-quantum-lime",
    border: "border-quantum-lime/30",
    bg: "bg-quantum-lime/5",
    isEventual: false,
  },
  {
    id: "no",
    title: "Bônus N.O · Forma Orquestradores",
    description: "R$ 500 / R$ 1.000 / R$ 2.000 por Orquestrador formado em sua rede.",
    reward: "R$ 500 → R$ 2.000",
    icon: Users,
    tone: "text-quantum-cyan",
    border: "border-quantum-cyan/30",
    bg: "bg-quantum-cyan/5",
    isEventual: false,
  },
  {
    id: "inspiration",
    title: "Bônus Inspiration · Auto-consumo",
    description: "1% (VIP) ou 2,5% (Black) dos resultados/mês para quem investe acima de R$ 1.000.",
    reward: "Até 2,5% / mês",
    icon: Sparkles,
    tone: "text-quantum-purple",
    border: "border-quantum-purple/30",
    bg: "bg-quantum-purple/5",
    isEventual: false,
  },
  {
    id: "grafo",
    title: "Sorteios (Grafo+IA)",
    description:
      "Sorteios Oficiais, Temáticos (Meta+IA), Zetta e VIP. Cada ação eventual tem prazo final divulgado.",
    reward: "R$ 500 a R$ 10.000",
    icon: Trophy,
    tone: "text-amber-300",
    border: "border-amber-400/30",
    bg: "bg-amber-400/5",
    isEventual: true,
  },
  {
    id: "corp",
    title: "Bônus Corp",
    description: "Títulos Impactos (R$ 10.000) · TPR e Royalties para níveis Agentic.",
    reward: "Títulos + Royalties",
    icon: Star,
    tone: "text-amber-300",
    border: "border-amber-400/30",
    bg: "bg-amber-400/5",
    isEventual: true,
  },
];

export default function BonusRewards({ userName = "Afiliado" }: BonusRewardsProps) {
  return (
    <div className="space-y-6">
      <Card className="border-white/10 bg-white/5 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white">Recompensas oficiais</CardTitle>
          <CardDescription className="text-slate-400">
            Olá, {userName}. Estas são as únicas <strong>recompensas oficiais</strong> do ecossistema Nexus, conforme o Plano de Carreira Peer. Ações eventuais (sorteios, metas) sempre vêm com prazo final.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {REWARDS.map((reward) => {
          const Icon = reward.icon;
          return (
            <Card
              key={reward.id}
              className={`border ${reward.border} ${reward.bg} backdrop-blur transition hover:border-white/30`}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-2">
                      <Icon className={`h-5 w-5 ${reward.tone}`} />
                    </div>
                    <CardTitle className="text-base text-white leading-snug">
                      {reward.title}
                    </CardTitle>
                  </div>
                  {reward.isEventual && (
                    <Badge className="border border-amber-400/30 bg-amber-400/10 text-amber-300">
                      <Calendar className="mr-1 h-3 w-3" /> Eventual
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-sm leading-6 text-slate-300">
                  {reward.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Potencial</p>
                  <p className={`mt-1 text-lg font-semibold ${reward.tone}`}>{reward.reward}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
        ⚠️ Sorteios e metas são ações <strong>eventuais</strong>: cada nova ação recebe regras próprias e um <strong>prazo final</strong>, divulgados no painel oficial.
      </div>
    </div>
  );
}
