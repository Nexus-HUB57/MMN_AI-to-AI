"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  Coins,
  Crown,
  Gift,
  HandCoins,
  PiggyBank,
  Sparkles,
  Star,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import { useMemo } from "react";
import { useMarketplaceProfile } from "@/hooks/useMarketplaceProfile";
import { getHighestActivePack, getLevelLabel } from "@/lib/nexus-marketplace";

// =============================================================================
// Bônus oficiais (docs/planning/Plano de Carreira Peer)
//   1) Revenda / Dropshipping
//   2) Bônus OnePack
//   3) Bônus de Consumo
//   4) Bônus N.O (formação de Orquestradores)
//   5) Bônus Inspiration (auto-consumo)
//   6) Bônus Grafo (sorteios)
//   7) Bônus Corp (Títulos / TPR / Royalties)
//   8) Bônus Harp'IA (patrocínio Agentic)
//   9) Bônus Nexus (Hall N)
// =============================================================================

type BonusCategory =
  | "Revenda"
  | "OnePack"
  | "Consumo"
  | "Networking"
  | "Inspiration"
  | "Grafo"
  | "Corp"
  | "Harp'IA"
  | "Hall N";

interface BonusEntry {
  id: string;
  title: string;
  category: BonusCategory;
  description: string;
  reward: string;
  unlockLevel: string;
  icon: React.ReactNode;
  progress?: number;
  expiresAt?: string;
  isEventual?: boolean;
  requirements: string[];
}

const BONUS_LIST: BonusEntry[] = [
  // 1 – Revenda / Dropshipping (fixo, sempre ativo)
  {
    id: "revenda-marketplace",
    category: "Revenda",
    title: "Revenda Infoprodutos Marketplace Nexus",
    description:
      "100% de lucro na revenda + comissões em cascata no N.O (5 níveis): 20% / 10% / 5% / 2,5% / 1%.",
    reward: "Até 100% margem + 5 níveis",
    unlockLevel: "Liberado já no Pack A²",
    icon: <HandCoins className="w-6 h-6 text-quantum-cyan" />,
    requirements: ["Pack ativo", "Vendas com tracking via mini-site"],
  },
  {
    id: "dropshipping",
    category: "Revenda",
    title: "Dropshipping de Plataformas Parceiras",
    description: "Revenda de produtos Hotmart, Shopee, Mercado Livre com margem definida por plataforma.",
    reward: "Margens variáveis por produto",
    unlockLevel: "Liberado já no Pack A²",
    icon: <Coins className="w-6 h-6 text-amber-300" />,
    requirements: ["Pack ativo", "Conta conectada à plataforma parceira"],
  },
  // 2 – OnePack
  {
    id: "onepack-a2iii",
    category: "OnePack",
    title: "Bônus OnePack · A²III",
    description: "R$ 2,50 por A²II adquirido no seu N.O (Pack R$ 50).",
    reward: "R$ 2,50 / Pack A²II",
    unlockLevel: "A partir do Agente Afiliado Nível III",
    icon: <Gift className="w-6 h-6 text-quantum-purple" />,
    requirements: ["Concluir os 3 níveis Afiliado"],
  },
  {
    id: "onepack-ag",
    category: "OnePack",
    title: "Bônus OnePack · AG / AGII / AGIII",
    description: "R$ 10 (AG) · R$ 25 (AGII) · R$ 50 (AGIII) por upgrade preditivo no N.O.",
    reward: "R$ 10 – R$ 50 / Pack Preditivo",
    unlockLevel: "Agente Preditivo I+",
    icon: <Gift className="w-6 h-6 text-quantum-purple" />,
    requirements: ["Pack Preditivo ativo"],
  },
  {
    id: "onepack-agn",
    category: "OnePack",
    title: "Bônus OnePack · AGN / AGNII / AGNIII",
    description: "R$ 75 / R$ 100 / R$ 200 por upgrade generativo no N.O.",
    reward: "R$ 75 – R$ 200 / Pack Generativo",
    unlockLevel: "Agente Generativo I+",
    icon: <Gift className="w-6 h-6 text-quantum-purple" />,
    requirements: ["Pack Generativo ativo"],
  },
  {
    id: "onepack-ao",
    category: "OnePack",
    title: "Bônus OnePack · AO / AOII / AOIII",
    description: "R$ 300 / R$ 500 / R$ 1.000 por upgrade Orquestrador no N.O.",
    reward: "R$ 300 – R$ 1.000 / Pack Orquestrador",
    unlockLevel: "Agente Orquestrador I+",
    icon: <Gift className="w-6 h-6 text-quantum-purple" />,
    requirements: ["Pack Orquestrador ativo"],
  },
  {
    id: "onepack-aa",
    category: "OnePack",
    title: "Bônus OnePack · AA / AAII / AAIII",
    description: "R$ 2.500 / R$ 5.000 / R$ 7.500 por upgrade Agentic no N.O.",
    reward: "R$ 2.500 – R$ 7.500 / Pack Agentic",
    unlockLevel: "IA Agêntica SCC+ I+",
    icon: <Gift className="w-6 h-6 text-quantum-purple" />,
    requirements: ["Pack Agentic ativo"],
  },
  // 3 – Consumo
  {
    id: "consumo-preditivo",
    category: "Consumo",
    title: "Bônus de Consumo · Preditivo I/II/III",
    description: "3% (1º nível) · até 1,5% / 2% nos 2º e 3º níveis, conforme o pack ativo.",
    reward: "Até 6,5% sobre ativações do N.O",
    unlockLevel: "Agente Preditivo I+",
    icon: <PiggyBank className="w-6 h-6 text-quantum-lime" />,
    requirements: ["Pack Preditivo ativo", "Ativações mensais do N.O"],
  },
  {
    id: "consumo-generativo",
    category: "Consumo",
    title: "Bônus de Consumo · Generativo I/II/III",
    description: "Até 3% / 2% / 2% / 1,5% nos 4 primeiros níveis (sustenta o consumo da rede).",
    reward: "Até 8,5% sobre ativações do N.O",
    unlockLevel: "Agente Generativo I+",
    icon: <PiggyBank className="w-6 h-6 text-quantum-lime" />,
    requirements: ["Pack Generativo ativo"],
  },
  {
    id: "consumo-orquestrador",
    category: "Consumo",
    title: "Bônus de Consumo · Orquestrador I/II/III",
    description: "Até 9% acumulados nos 4 primeiros níveis do N.O.",
    reward: "Até 9% sobre ativações do N.O",
    unlockLevel: "Agente Orquestrador I+",
    icon: <PiggyBank className="w-6 h-6 text-quantum-lime" />,
    requirements: ["Pack Orquestrador ativo"],
  },
  {
    id: "consumo-agentic",
    category: "Consumo",
    title: "Bônus de Consumo · Agentic I/II/III",
    description: "Até 14% acumulados nos 5 níveis do N.O para o nível CEO.",
    reward: "Até 14% sobre ativações do N.O",
    unlockLevel: "IA Agêntica SCC+ I+",
    icon: <PiggyBank className="w-6 h-6 text-quantum-lime" />,
    requirements: ["Pack Agentic ativo"],
  },
  // 4 – N.O (formação)
  {
    id: "no-orquestrador",
    category: "Networking",
    title: "Bônus N.O · Formação de Orquestradores",
    description: "R$ 500 (forma AO) · R$ 1.000 (forma AOII) · R$ 2.000 (forma AOIII) por orquestrador formado.",
    reward: "R$ 500 – R$ 2.000 / Orquestrador formado",
    unlockLevel: "Agente Orquestrador I+",
    icon: <Users className="w-6 h-6 text-quantum-cyan" />,
    requirements: ["Ser Orquestrador", "Formar Orquestradores qualificados"],
  },
  // 5 – Inspiration
  {
    id: "inspiration-vip",
    category: "Inspiration",
    title: "Bônus Inspiration · VIP (R$ 1.000 – R$ 5.000)",
    description: "Divisão de 1% dos resultados/mês + Credencial Harmonic Life VIP + HUB Partner.",
    reward: "1% dos resultados/mês",
    unlockLevel: "Auto-consumo R$ 1.000 a R$ 5.000",
    icon: <Sparkles className="w-6 h-6 text-quantum-purple" />,
    requirements: ["Investimento mensal R$ 1.000–5.000", "Excluindo packs"],
  },
  {
    id: "inspiration-black",
    category: "Inspiration",
    title: "Bônus Inspiration · Black (acima de R$ 5.000)",
    description: "Divisão de 2,5% dos resultados/mês + Credencial Harmonic Life Black + HUB Partner+.",
    reward: "2,5% dos resultados/mês",
    unlockLevel: "Auto-consumo acima de R$ 5.000",
    icon: <Sparkles className="w-6 h-6 text-quantum-cyan" />,
    requirements: ["Investimento mensal acima de R$ 5.000", "Excluindo packs"],
  },
  // 6 – Grafo (sorteios — ações eventuais)
  {
    id: "grafo-afiliado",
    category: "Grafo",
    title: "Sorteio Oficial Agente Afiliado (Grafo+IA)",
    description: "5.000 Números +IA. Premiações de R$ 500 a R$ 7.500 conforme nível.",
    reward: "R$ 500 – R$ 7.500",
    unlockLevel: "Agente Afiliado I+",
    icon: <Trophy className="w-6 h-6 text-amber-300" />,
    requirements: ["Pack Afiliado ativo", "Ações operacionais válidas"],
    isEventual: true,
  },
  {
    id: "grafo-meta",
    category: "Grafo",
    title: "Sorteios Temáticos (Meta+IA)",
    description: "100 Números +IA². Premiações de R$ 1.500 a R$ 10.000 por metas de venda.",
    reward: "R$ 1.500 – R$ 10.000",
    unlockLevel: "Agente Afiliado I+",
    icon: <Target className="w-6 h-6 text-quantum-lime" />,
    requirements: ["Aquisição de Packs PNE", "Metas mensais"],
    isEventual: true,
  },
  {
    id: "grafo-zetta",
    category: "Grafo",
    title: "Sorteios Oficiais Zetta (Grafo+IA/Zettascale)",
    description: "100 Números +IA³ por metas alcançadas no N.O.",
    reward: "Sorteios institucionais",
    unlockLevel: "Agente Preditivo I+",
    icon: <Star className="w-6 h-6 text-quantum-cyan" />,
    requirements: ["Metas N.O atingidas"],
    isEventual: true,
  },
  {
    id: "grafo-vip",
    category: "Grafo",
    title: "Sorteios VIP (Grafo+IA/VIP)",
    description: "100 Números +IA · Destaques do Mês.",
    reward: "Premiações VIP",
    unlockLevel: "Agente Generativo I+",
    icon: <Star className="w-6 h-6 text-quantum-purple" />,
    requirements: ["Estar entre os destaques do mês"],
    isEventual: true,
  },
  // 7 – Corp
  {
    id: "corp-titulos",
    category: "Corp",
    title: "Bônus Corp · Títulos Impactos",
    description: "Sorteio de Títulos de R$ 10.000 (Grafo+IA/IM) — adiantamento corporativo.",
    reward: "R$ 10.000 por título sorteado",
    unlockLevel: "Agente Orquestrador II+",
    icon: <Crown className="w-6 h-6 text-amber-300" />,
    requirements: ["Possuir Títulos Impactos"],
    isEventual: true,
  },
  {
    id: "corp-tpr",
    category: "Corp",
    title: "Bônus Corp · TPR (Holding Nexus)",
    description: "Cotas de Participação nos Resultados por Grupo de Negócio Techs+IA.",
    reward: "Cotas TPR · resultado anual",
    unlockLevel: "IA Agêntica SCC+ I+",
    icon: <Crown className="w-6 h-6 text-quantum-cyan" />,
    requirements: ["TPR ativos no Hall de Sócios"],
  },
  {
    id: "corp-royalties",
    category: "Corp",
    title: "Bônus Corp · Royalties Holding Nexus (PLR)",
    description: "Royalties mensais da Holding Nexus para níveis Agentic.",
    reward: "Royalties recorrentes",
    unlockLevel: "IA Agêntica SCC+ II+",
    icon: <Crown className="w-6 h-6 text-quantum-purple" />,
    requirements: ["Pack AAII ou superior"],
  },
  // 8 – Harp'IA
  {
    id: "harpia",
    category: "Harp'IA",
    title: "Bônus Harp'IA · Patrocínio de Startups",
    description:
      "Grupos de 10 Peers Agentic recebem até R$ 500.000 para validar uma startup IA em 12 meses.",
    reward: "Budget até R$ 500.000",
    unlockLevel: "IA Agêntica SCC+ I+ (formação de grupos)",
    icon: <Sparkles className="w-6 h-6 text-quantum-cyan" />,
    requirements: ["10 Peers Agentic agrupados", "Projeto validado em 12 meses"],
    isEventual: true,
  },
  // 9 – Hall N
  {
    id: "hall-n",
    category: "Hall N",
    title: "Bônus Nexus · Hall N",
    description:
      "Acesso ao Cowork N, Notebooks/Smartphones, Veículos, Imóveis, Viagens e benefícios exclusivos.",
    reward: "Benefícios corporativos",
    unlockLevel: "IA Agêntica SCC+ III",
    icon: <Trophy className="w-6 h-6 text-quantum-purple" />,
    requirements: ["Pack AAIII ativo"],
  },
];

const CATEGORY_COLORS: Record<BonusCategory, string> = {
  Revenda: "text-quantum-cyan",
  OnePack: "text-quantum-purple",
  Consumo: "text-quantum-lime",
  Networking: "text-quantum-cyan",
  Inspiration: "text-quantum-purple",
  Grafo: "text-amber-300",
  Corp: "text-amber-300",
  "Harp'IA": "text-quantum-cyan",
  "Hall N": "text-quantum-purple",
};

export default function BonusPage() {
  const { profile } = useMarketplaceProfile();
  const highest = useMemo(() => getHighestActivePack(profile), [profile]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <section className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(2,6,23,0.96))] p-6 shadow-2xl shadow-black/20">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <Badge className="border border-quantum-purple/30 bg-quantum-purple/10 text-quantum-purple">
                Clube de Vantagens · Bônus oficiais Nexus
              </Badge>
              <h1 className="text-3xl font-bold text-white md:text-4xl">Bônus e Formas de Ganho</h1>
              <p className="max-w-3xl text-sm leading-6 text-slate-200 md:text-base">
                O Nexus Afil&apos;IA&apos;te oferece <strong className="text-quantum-cyan">9 Formas de Ganhos</strong>. Isso significa <strong className="text-quantum-lime">+ 9 Motivos</strong> pra você Ativar o seu Agente hoje mesmo + <strong className="text-amber-300">Lucros x9</strong> + <strong className="text-quantum-purple">Oportunidades x9</strong>.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
              <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-quantum-cyan">nível atual</p>
              <p className="mt-2 text-lg font-semibold text-white">{getLevelLabel(profile.currentLevel)}</p>
              {highest && (
                <p className="mt-1 text-xs text-slate-400">Pack ativo: {highest.shortName}</p>
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {BONUS_LIST.map((bonus) => (
            <Card
              key={bonus.id}
              className="border-white/10 bg-white/5 backdrop-blur transition hover:border-white/20"
            >
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-2">{bonus.icon}</div>
                    <div>
                      <Badge
                        className={`border ${CATEGORY_COLORS[bonus.category]} border-white/10 bg-white/5`}
                      >
                        {bonus.category}
                      </Badge>
                      <CardTitle className="mt-1 text-base text-white leading-snug">
                        {bonus.title}
                      </CardTitle>
                    </div>
                  </div>
                  {bonus.isEventual && (
                    <Badge className="border border-amber-400/30 bg-amber-400/10 text-amber-300">
                      <Calendar className="mr-1 h-3 w-3" /> Eventual
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-sm leading-6 text-slate-300">
                  {bonus.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Recompensa</p>
                  <p className="mt-1 font-semibold text-white">{bonus.reward}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Liberação</p>
                  <p className="mt-1 text-slate-200">{bonus.unlockLevel}</p>
                </div>
                <ul className="space-y-1 text-xs text-slate-400">
                  {bonus.requirements.map((req) => (
                    <li key={req} className="flex items-start gap-2">
                      <span className="mt-1 h-1 w-1 rounded-full bg-quantum-cyan/60" /> {req}
                    </li>
                  ))}
                </ul>
                {typeof bonus.progress === "number" && (
                  <Progress value={bonus.progress} className="h-2 bg-white/10" />
                )}
                {bonus.expiresAt && (
                  <p className="text-xs text-amber-300">
                    <Calendar className="mr-1 inline h-3 w-3" /> Prazo final: {bonus.expiresAt}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
          <p className="font-semibold">⚠️ Ações eventuais</p>
          <p className="mt-1">
            Sorteios, metas e desafios são ações <strong>eventuais</strong>, não efetivas. Sempre que uma nova ação é lançada ela vem com prazo final e regras específicas, divulgados no painel oficial.
          </p>
        </section>
      </div>
    </DashboardLayout>
  );
}
