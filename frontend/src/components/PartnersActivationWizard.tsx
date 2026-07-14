import { useMemo } from "react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";
import { listLocalSubscriptions } from "@/lib/nexus-partners-fallback";
import { ArrowRight, Bot, CheckCircle2, Circle, Rocket, ShieldCheck, ShoppingCart, Store, Workflow } from "lucide-react";

function hasActivePartnersSubscription(items: Array<{ planId?: string; status?: string }>) {
  return items.some((item) => /nexus-(start|growth|enterprise)/i.test(item.planId ?? "") && item.status !== "cancelled");
}

export default function PartnersActivationWizard() {
  const { isAuthenticated } = useAuth();

  const grantsQuery = (trpc as any).packEntitlements?.listMyGrants?.useQuery
    ? (trpc as any).packEntitlements.listMyGrants.useQuery(undefined, { staleTime: 60_000, enabled: isAuthenticated })
    : { data: null };

  const statusQuery = (trpc as any).dashboardStatus?.getStatus?.useQuery
    ? (trpc as any).dashboardStatus.getStatus.useQuery(undefined, { staleTime: 60_000, retry: false, enabled: isAuthenticated })
    : { data: null };

  const runtimeQuery = (trpc as any).partnersDelivery?.runtimeOverview?.useQuery
    ? (trpc as any).partnersDelivery.runtimeOverview.useQuery(undefined, { staleTime: 60_000 })
    : { data: null };

  const blueprintQuery = (trpc as any).partnersDelivery?.onboardingBlueprint?.useQuery
    ? (trpc as any).partnersDelivery.onboardingBlueprint.useQuery(undefined, { staleTime: 300_000 })
    : { data: null };

  const mineQuery = (trpc as any)?.subscriptions?.mine?.useQuery?.(undefined, {
    enabled: isAuthenticated,
    staleTime: 60_000,
    retry: false,
  }) ?? { data: null };

  const hasPackA2 = useMemo(() => {
    const grants = (grantsQuery.data?.grants ?? []) as Array<{ packSlug?: string }> ;
    return grants.some((item) => item.packSlug === "pack-a2");
  }, [grantsQuery.data?.grants]);

  const hasPartnersPack = useMemo(() => {
    const remote = ((mineQuery.data?.items ?? []) as Array<{ planId?: string; status?: string }>);
    if (hasActivePartnersSubscription(remote)) return true;
    try {
      return hasActivePartnersSubscription(listLocalSubscriptions() as Array<{ planId?: string; status?: string }>);
    } catch {
      return false;
    }
  }, [mineQuery.data?.items]);

  const steps = useMemo(() => {
    const blueprint = blueprintQuery.data?.steps as Array<{ id: string; label: string; description: string; route: string; required: boolean }> | undefined;
    const base = blueprint && blueprint.length ? blueprint : [
      { id: "affiliate_account", label: "Conta e dashboard base", description: "Entrar no ecossistema e validar o ambiente base do afiliado.", route: "/dashboard", required: true },
      { id: "pack_a2", label: "Ativar Pack A²", description: "Porta de entrada oficial para liberar a jornada principal.", route: "/pix/checkout?pack=pack-a2", required: true },
      { id: "agent_runtime", label: "Liberar Agente IA", description: "Ativar o agente operacional e suas skills principais.", route: "/agents", required: true },
      { id: "storefront", label: "Publicar loja e operação", description: "Preparar catálogo, links e vitrine para início comercial.", route: "/minha-loja", required: true },
      { id: "partners_subscription", label: "Avaliar trilha SaaS Partners", description: "Subir para a camada enterprise quando houver fit operacional.", route: "/subscriptions", required: false },
      { id: "partners_console", label: "Operar painel Partners + OpenAPI", description: "Gerir parceiros, integrações e runtime dedicado.", route: "/partners", required: false },
    ];

    const agentActive = Boolean(statusQuery.data?.agentActive) || hasPackA2;
    return base.map((step) => ({
      ...step,
      done:
        step.id === "affiliate_account" ? isAuthenticated :
        step.id === "pack_a2" ? hasPackA2 :
        step.id === "agent_runtime" ? agentActive :
        step.id === "storefront" ? agentActive :
        step.id === "partners_subscription" ? hasPartnersPack :
        step.id === "partners_console" ? hasPartnersPack : false,
    }));
  }, [blueprintQuery.data?.steps, statusQuery.data?.agentActive, hasPackA2, hasPartnersPack, isAuthenticated]);

  const completed = steps.filter((step) => step.done).length;
  const nextStep = steps.find((step) => !step.done) ?? null;
  const runtime = runtimeQuery.data as null | { primaryProvider?: string; model?: string; usingDedicatedKey?: boolean; isolationLevel?: string; apiStandard?: string; safeguards?: string[] };

  return (
    <section className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(0,229,255,0.14),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(167,139,250,0.12),transparent_26%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,1))] p-5 shadow-2xl shadow-black/20 md:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">Wizard de ativação do ecossistema</Badge>
            <Badge className="border border-white/10 bg-white/5 text-slate-200">Pack A² → Agente → Loja → Partners</Badge>
          </div>
          <div>
            <h2 className="text-2xl font-black text-white md:text-3xl">Estrutura pronta para entrada, escala e camada enterprise</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300 md:text-base">
              Este fluxo unifica a jornada obrigatória do afiliado com a trilha opcional do Nexus Partners Pack, reduzindo ambiguidade comercial e preparando o ambiente para integrações OpenAPI e runtime dedicado.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 xl:w-[430px]">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Passos</p>
            <p className="mt-2 text-2xl font-bold text-white">{completed}/{steps.length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Runtime</p>
            <p className="mt-2 text-lg font-bold text-white">{runtime?.primaryProvider ?? "standby"}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Padrão API</p>
            <p className="mt-2 text-lg font-bold text-white">{runtime?.apiStandard ?? "OpenAPI"}</p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {steps.map((step, index) => {
            const Icon =
              step.id === "pack_a2" ? ShoppingCart :
              step.id === "agent_runtime" ? Bot :
              step.id === "storefront" ? Store :
              step.id === "partners_subscription" ? Rocket :
              step.id === "partners_console" ? Workflow : ShieldCheck;

            return (
              <Card key={step.id} className="border-white/10 bg-white/5 backdrop-blur">
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${step.done ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300" : "border-white/10 bg-black/20 text-slate-300"}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge className="border border-white/10 bg-white/5 text-slate-200">Etapa {index + 1}</Badge>
                  </div>
                  <CardTitle className="flex items-center gap-2 text-lg text-white">
                    {step.done ? <CheckCircle2 className="h-4 w-4 text-emerald-300" /> : <Circle className="h-4 w-4 text-slate-500" />}
                    {step.label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm leading-6 text-slate-300">{step.description}</p>
                  <Link href={step.route}>
                    <Button variant={step.done ? "outline" : "default"} className={step.done ? "w-full border-white/10 bg-white/5 text-white" : "gradient-btn w-full"}>
                      {step.done ? "Revisar etapa" : "Executar agora"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="space-y-4">
          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg text-white">Próxima melhor ação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm leading-6 text-slate-300">
                {nextStep
                  ? `A próxima etapa recomendada é ${nextStep.label.toLowerCase()}. Ela mantém a jornada coerente entre aquisição, ativação e expansão enterprise.`
                  : "Toda a trilha principal está estruturada. Agora o foco vira adoção, governança e integrações corporativas."}
              </p>
              {nextStep ? (
                <Link href={nextStep.route}>
                  <Button className="gradient-btn w-full">
                    Ir para {nextStep.label}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Link href="/partners">
                  <Button className="gradient-btn w-full">
                    Abrir console Partners
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg text-white">Runtime enterprise</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-300">
              <p>
                Provedor principal: <span className="font-semibold text-white">{runtime?.primaryProvider ?? "standby"}</span> · modelo <span className="font-semibold text-white">{runtime?.model ?? "não definido"}</span>.
              </p>
              <p>
                Isolamento: <span className="font-semibold text-white">{runtime?.isolationLevel ?? "fallback"}</span> · chave dedicada {runtime?.usingDedicatedKey ? "habilitada" : "pendente de configuração"}.
              </p>
              <div className="space-y-2">
                {(runtime?.safeguards ?? []).slice(0, 3).map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2">{item}</div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
