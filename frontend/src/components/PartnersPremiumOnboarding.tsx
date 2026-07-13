import { useMemo } from "react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { FALLBACK_SUBSCRIPTION_PLANS, listLocalSubscriptions } from "@/lib/nexus-partners-fallback";
import { ArrowRight, Bot, CheckCircle2, Crown, Gauge, Network, ShieldCheck, Sparkles } from "lucide-react";

function findActivePlanId(items: Array<{ planId?: string; status?: string }>) {
  const active = items.find((item) => /nexus-(start|growth|enterprise)/i.test(item.planId ?? "") && item.status !== "cancelled");
  return active?.planId ?? null;
}

export default function PartnersPremiumOnboarding() {
  const mineQuery = (trpc as any)?.subscriptions?.listMine?.useQuery?.(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const activePlanId = useMemo(() => {
    const remote = findActivePlanId(((mineQuery?.data?.items ?? []) as Array<{ planId?: string; status?: string }>));
    if (remote) return remote;
    try {
      return findActivePlanId(listLocalSubscriptions() as Array<{ planId?: string; status?: string }>);
    } catch {
      return null;
    }
  }, [mineQuery?.data?.items]);

  const activePlan = useMemo(
    () => FALLBACK_SUBSCRIPTION_PLANS.find((plan) => plan.id === activePlanId) ?? null,
    [activePlanId],
  );

  if (!activePlan) return null;

  const steps = [
    {
      title: "Validar modalidade contratada",
      description: `Confirme ${activePlan.fullName}, prazo ativo e escopo de governança antes de avançar com operação e entrega.`,
      icon: ShieldCheck,
      tone: "text-quantum-cyan",
    },
    {
      title: "Liberar operação do agente",
      description: `Este plano suporta ${activePlan.capacity.aiAgents} agente(s) e ${activePlan.capacity.skills} skills. Priorize prompts, workflows e monitoramento inicial.`,
      icon: Bot,
      tone: "text-quantum-lime",
    },
    {
      title: "Ativar trilha premium do assinante",
      description: "Use materiais, painéis de performance, entregáveis e governança do plano para acelerar onboarding e adoção real.",
      icon: Sparkles,
      tone: "text-amber-300",
    },
    {
      title: "Escalar integrações e parceiros",
      description: `Planeje analytics, API do agente e expansão até ${activePlan.capacity.referralLevels} níveis de relacionamento comercial.`,
      icon: Network,
      tone: "text-quantum-purple",
    },
  ];

  return (
    <section className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.10),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(0,229,255,0.10),transparent_26%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,1))] p-5 shadow-2xl shadow-black/20 md:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge className="border border-amber-300/30 bg-amber-300/10 text-amber-200">Onboarding premium do assinante</Badge>
            <Badge className="border border-white/10 bg-white/5 text-slate-200">{activePlan.shortName}</Badge>
          </div>
          <div>
            <h2 className="text-2xl font-black text-white md:text-3xl">Primeiros passos para extrair valor do Nexus Partners Pack</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300 md:text-base">
              Seu acesso premium já foi identificado. Agora o foco é transformar a assinatura em operação ativa, governança visível e maturidade comercial.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 xl:w-[420px]">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Agentes</p>
            <p className="mt-2 text-2xl font-bold text-white">{activePlan.capacity.aiAgents}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Skills</p>
            <p className="mt-2 text-2xl font-bold text-white">{activePlan.capacity.skills}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Níveis</p>
            <p className="mt-2 text-2xl font-bold text-white">{activePlan.capacity.referralLevels}</p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <Card key={step.title} className="border-white/10 bg-white/5 backdrop-blur">
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/20 ${step.tone}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <Badge className="border border-white/10 bg-white/5 text-slate-200">Etapa {index + 1}</Badge>
                </div>
                <CardTitle className="text-lg text-white">{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-slate-300">{step.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4 text-sm text-slate-300">
          <p className="flex items-center gap-2 font-semibold text-white"><CheckCircle2 className="h-4 w-4 text-emerald-300" /> Leitura operacional sugerida</p>
          <p className="mt-2 leading-6">
            Use o plano atual como base para construir rotina, materiais, governança e integração do agente. O objetivo do onboarding premium é reduzir tempo até o primeiro valor percebido pelo assinante.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/subscriptions">
            <Button className="gradient-btn h-11 px-5">
              Revisar assinatura
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" className="h-11 border-white/15 bg-white/5 text-white hover:bg-white/10">
              <Gauge className="mr-2 h-4 w-4" />
              Voltar ao dashboard
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
