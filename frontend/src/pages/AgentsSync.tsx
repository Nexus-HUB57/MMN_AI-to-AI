import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCcw, ShieldCheck, Sparkles, Workflow } from "lucide-react";
import { Link } from "wouter";

export default function AgentsSync() {
  return (
    <DashboardLayout>
      <div className="space-y-8 pb-8">
        <section className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(0,229,255,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(124,255,178,0.12),transparent_30%),linear-gradient(180deg,rgba(15,23,42,0.94),rgba(2,6,23,0.98))] p-6 shadow-2xl shadow-black/30 md:p-8">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">
                Sincronização do Agente
              </Badge>
              <Badge className="border border-white/10 bg-white/5 text-slate-200">
                Painel operacional
              </Badge>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl">
              Central de sincronização do agente
            </h1>
            <p className="max-w-3xl text-base leading-7 text-slate-300 md:text-lg">
              Use esta área para acompanhar o sincronismo do agente, revisar a fila operacional e seguir para os painéis principais do ecossistema.
            </p>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <RefreshCcw className="h-5 w-5 text-quantum-cyan" />
                Status da sincronização
              </CardTitle>
              <CardDescription className="text-slate-400">
                O agente pode ser reprocessado sem sair do ambiente principal.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm leading-6 text-slate-300">
              Fila pronta para novas execuções e reconciliações de dados do usuário.
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Workflow className="h-5 w-5 text-quantum-lime" />
                Fluxo operacional
              </CardTitle>
              <CardDescription className="text-slate-400">
                Acompanhe a orquestração e os recursos já liberados no seu plano.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm leading-6 text-slate-300">
              O sincronismo respeita o nível atual e mantém a experiência integrada com packs, skills e jornada comercial.
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <ShieldCheck className="h-5 w-5 text-amber-300" />
                Segurança operacional
              </CardTitle>
              <CardDescription className="text-slate-400">
                Rotas liberadas sem expor configurações sensíveis no cliente.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm leading-6 text-slate-300">
              O painel mantém a navegação disponível enquanto a camada completa de automação é consolidada.
            </CardContent>
          </Card>
        </section>

        <Card className="border-quantum-cyan/20 bg-quantum-cyan/5 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Sparkles className="h-5 w-5 text-quantum-purple" />
              Próximos painéis
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Link href="/agents">
              <Button className="gradient-btn">Abrir painel do agente</Button>
            </Link>
            <Link href="/orchestrator">
              <Button variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10">
                Abrir orquestrador
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
