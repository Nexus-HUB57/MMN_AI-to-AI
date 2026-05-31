import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Coins, Gift, Network, ShoppingCart } from "lucide-react";

const MULTIPLIERS = [
  {
    label: "Vendas",
    value: "10x",
    description: "Pontuação acelerada para movimentação comercial validada.",
    icon: ShoppingCart,
    accent: "text-quantum-lime",
    border: "border-quantum-lime/30",
    bg: "bg-quantum-lime/10",
  },
  {
    label: "Comissões",
    value: "5x",
    description: "Multiplicador aplicado sobre comissões reconhecidas no ciclo.",
    icon: Coins,
    accent: "text-quantum-cyan",
    border: "border-quantum-cyan/30",
    bg: "bg-quantum-cyan/10",
  },
  {
    label: "Bônus",
    value: "15x",
    description: "Maior peso para bônus elegíveis dentro da jornada ativa.",
    icon: Gift,
    accent: "text-quantum-purple",
    border: "border-quantum-purple/30",
    bg: "bg-quantum-purple/10",
  },
  {
    label: "Network",
    value: "3x",
    description: "Pontuação de rede aplicada às movimentações qualificadas.",
    icon: Network,
    accent: "text-amber-300",
    border: "border-amber-400/30",
    bg: "bg-amber-400/10",
  },
] as const;

export default function CareerProgress() {
  return (
    <DashboardLayout>
      <div className="space-y-8 pb-8">
        <section className="overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(0,229,255,0.15),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.14),transparent_30%),linear-gradient(180deg,rgba(15,23,42,0.94),rgba(2,6,23,0.98))] p-6 shadow-2xl shadow-black/30 md:p-8">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">
                Carreira Nexus
              </Badge>
              <Badge className="border border-white/10 bg-white/5 text-slate-200">
                Regras atuais de pontuação
              </Badge>
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl">
                Multiplicadores de XP
              </h1>
              <p className="max-w-3xl text-base leading-7 text-slate-300 md:text-lg">
                Esta página exibe somente os multiplicadores válidos da jornada comercial, conforme a diretriz solicitada.
              </p>
            </div>
          </div>
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
                    <CardDescription className="text-[11px] uppercase tracking-[0.3em] text-slate-500">
                      Multiplicador
                    </CardDescription>
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
            <CardTitle className="flex items-center gap-2 text-white">
              <BarChart3 className="h-5 w-5 text-quantum-cyan" />
              Resumo oficial da página
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-7 text-slate-300">
            <p>10x em Vendas</p>
            <p>5x em Comissões</p>
            <p>15x em Bônus</p>
            <p>3x em Network</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
