import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/contexts/AuthContext";
import { buildMarketplaceCheckoutUrl } from "@/lib/marketplace-payments";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle2,
  Crown,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

type CatalogPlan = {
  id: string;
  shortName: string;
  fullName: string;
  tagline: string;
  priceCents: number | null;
  billingCycle: "monthly" | "yearly" | "on_request";
  commissionRate: number;
  features: string[];
  capacity: {
    aiAgents: number;
    ebooks: number;
    skills: number;
    referralLevels: number;
  };
  storefront: {
    subscriptionOnly: true;
    defaultTermMonths: number;
    availableTermsMonths: number[];
    licenseLabel: string;
    ctaLabel: string;
  };
  governance: {
    requiresAdminContact: boolean;
    highValue: boolean;
  };
};

function formatBRL(amountCents: number | null) {
  if (amountCents == null) return "Sob consulta";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amountCents / 100);
}

function priceCaption(plan: CatalogPlan) {
  if (plan.billingCycle === "monthly" && plan.priceCents != null) return `${formatBRL(plan.priceCents)}/mês`;
  if (plan.billingCycle === "yearly" && plan.priceCents != null) return `${formatBRL(plan.priceCents)}/ano`;
  return formatBRL(plan.priceCents);
}

const planIcons = {
  "pack-a2": Bot,
  "pack-ag": Activity,
  "pack-aa": Crown,
} as const;

export default function Subscriptions() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [selectedTerms, setSelectedTerms] = useState<Record<string, number>>({});

  const catalogQuery = trpc.subscriptions.catalog.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
  });

  const mineQuery = trpc.subscriptions.mine.useQuery(undefined, {
    enabled: isAuthenticated,
    staleTime: 1000 * 30,
  });

  const startMutation = trpc.subscriptions.start.useMutation();

  const plans = (catalogQuery.data?.plans ?? []) as CatalogPlan[];
  const mySubscriptions = useMemo(() => {
    const items = (mineQuery.data?.items ?? []) as Array<{ planId: string; status: string; id: string }>;
    return new Map(items.map((item) => [item.planId, item]));
  }, [mineQuery.data?.items]);

  const autonomyFacts = [
    "8 skill handlers em produção",
    "Autonomy Score 0-100 em 6 dimensões ponderadas",
    "RBAC granular com runtime:read, execute, approve, reject e rerun",
  ];

  async function handleSubscribe(plan: CatalogPlan) {
    const termMonths = selectedTerms[plan.id] ?? plan.storefront.defaultTermMonths;

    if (!isAuthenticated) {
      setLocation(`/login?from=${encodeURIComponent("/subscriptions")}`);
      return;
    }

    try {
      const result = await startMutation.mutateAsync({
        userId: 1,
        planId: plan.id as any,
        termMonths,
        metadata: {
          storefront: "nexus-marketplace",
          productName: "Nexus Partners",
          exclusiveModel: "subscription-only",
        },
      });

      if (result.requiresAdminApproval || plan.governance.requiresAdminContact || plan.priceCents == null) {
        setFeedback(`Solicitação registrada para ${plan.fullName}. O time comercial irá tratar a proposta ${termMonths} meses.`);
        mineQuery.refetch();
        return;
      }

      const checkoutUrl = buildMarketplaceCheckoutUrl({
        source: "subscriptions",
        type: "subscription",
        slug: plan.id,
        name: plan.fullName,
        amountCents: plan.priceCents,
        description: `${plan.tagline} · licença ${termMonths} meses`,
        subscriptionId: result.subscription.id,
        termMonths,
      });

      setLocation(checkoutUrl);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Não foi possível iniciar a assinatura agora.");
    }
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 md:px-6">
        <section className="overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(0,229,255,0.18),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(124,255,178,0.14),transparent_28%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,1))] p-6 shadow-2xl shadow-black/30 md:p-8">
          <div className="grid gap-8 xl:grid-cols-[1.08fr_0.92fr] xl:items-center">
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2">
                <Badge className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">Nexus Store · assinatura exclusiva</Badge>
                <Badge className="border border-white/10 bg-white/5 text-slate-200">oneverso.com.br</Badge>
                <Badge className="border border-white/10 bg-white/5 text-slate-200">api.oneverso.com.br</Badge>
              </div>

              <div className="space-y-4">
                <h1 className="max-w-5xl text-4xl font-black tracking-tight text-white md:text-5xl xl:text-6xl">
                  Nexus Partners · infraestrutura SaaS proprietária para operar creators, afiliados e parcerias com <span className="text-quantum-lime">licença exclusivamente por assinatura</span>
                </h1>
                <p className="max-w-4xl text-base leading-7 text-slate-300 md:text-lg">
                  O Nexus Partners Pack concentra rastreamento ponta a ponta, automação inteligente, governança comercial,
                  telemetria operacional e visão analítica em tempo real em um único produto SaaS.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">skills em produção</p>
                  <p className="mt-3 text-3xl font-bold text-white">8</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">autonomy score</p>
                  <p className="mt-3 text-3xl font-bold text-quantum-lime">0-100</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">prazo contratual</p>
                  <p className="mt-3 text-3xl font-bold text-white">6-48m</p>
                </div>
              </div>
            </div>

            <Card className="border-white/10 bg-white/6 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-xl text-white">3 diferenciais centrais</CardTitle>
                <CardDescription className="text-slate-300">
                  Runtime operacional, autonomia mensurável e governança comercial em um só núcleo de produto.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-3xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300">
                  <div className="mb-2 flex items-center gap-2 text-white"><Zap className="h-4 w-4 text-quantum-cyan" /> Runtime IA operacional</div>
                  <p>8 handlers ativos cobrindo conteúdo, prospecção, distribuição, analytics e replay operacional.</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300">
                  <div className="mb-2 flex items-center gap-2 text-white"><BarChart3 className="h-4 w-4 text-quantum-lime" /> Autonomy Score contínuo</div>
                  <p>6 dimensões ponderadas: tarefas autônomas, LLM-as-Judge, cobertura, latência, aprovação manual e canais.</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300">
                  <div className="mb-2 flex items-center gap-2 text-white"><ShieldCheck className="h-4 w-4 text-amber-300" /> Governança granular</div>
                  <p>RBAC, trilha auditável, aprovações needs_review e stack Node 22 + tRPC + Drizzle + Postgres + BullMQ/Redis.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {feedback && (
          <div className="rounded-2xl border border-quantum-cyan/20 bg-quantum-cyan/10 px-4 py-3 text-sm text-quantum-cyan">
            {feedback}
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-3">
          {autonomyFacts.map((fact) => (
            <div key={fact} className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-quantum-lime" />
                <span>{fact}</span>
              </div>
            </div>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          {catalogQuery.isLoading
            ? Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="h-[420px] animate-pulse rounded-[28px] border border-white/10 bg-white/5" />
              ))
            : plans.map((plan) => {
                const Icon = planIcons[plan.id as keyof typeof planIcons] ?? Sparkles;
                const myPlan = mySubscriptions.get(plan.id);
                const selectedTerm = selectedTerms[plan.id] ?? plan.storefront.defaultTermMonths;

                return (
                  <Card key={plan.id} className="overflow-hidden border border-white/10 bg-white/5 backdrop-blur transition hover:-translate-y-1 hover:border-white/20">
                    <div className="border-b border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.72),rgba(15,23,42,0.08))] p-6">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-quantum-cyan">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex flex-wrap justify-end gap-2">
                          <Badge className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">Assinatura</Badge>
                          {myPlan?.status && (
                            <Badge className="border border-quantum-lime/30 bg-quantum-lime/10 text-quantum-lime">{myPlan.status}</Badge>
                          )}
                        </div>
                      </div>
                      <p className="mt-5 text-sm uppercase tracking-[0.28em] text-slate-500">{plan.shortName}</p>
                      <h2 className="mt-2 text-3xl font-black text-white">{plan.fullName}</h2>
                      <p className="mt-3 text-sm leading-6 text-slate-300">{plan.tagline}</p>
                    </div>

                    <CardContent className="space-y-5 p-6">
                      <div className="flex items-end justify-between gap-3">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Licença</p>
                          <p className="mt-2 text-4xl font-black text-white">{priceCaption(plan)}</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-right text-xs text-slate-300">
                          {plan.storefront.licenseLabel}
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                          <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">IA / skills</p>
                          <p className="mt-2 text-lg font-bold text-white">{plan.capacity.aiAgents} agente · {plan.capacity.skills} skills</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                          <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">E-books / rede</p>
                          <p className="mt-2 text-lg font-bold text-white">{plan.capacity.ebooks} · {plan.capacity.referralLevels} níveis</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {plan.features.map((feature) => (
                          <div key={feature} className="flex items-start gap-2 text-sm text-slate-300">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-quantum-lime" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Prazo contratual</label>
                        <select
                          value={selectedTerm}
                          onChange={(event) =>
                            setSelectedTerms((current) => ({
                              ...current,
                              [plan.id]: Number(event.target.value),
                            }))
                          }
                          className="h-11 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none ring-0"
                        >
                          {plan.storefront.availableTermsMonths.map((term) => (
                            <option key={term} value={term} className="bg-slate-950 text-white">
                              {term} meses
                            </option>
                          ))}
                        </select>
                      </div>

                      <Button
                        className="gradient-btn h-12 w-full"
                        disabled={startMutation.isPending && startMutation.variables?.planId === plan.id}
                        onClick={() => handleSubscribe(plan)}
                      >
                        {plan.storefront.ctaLabel}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
        </section>

        <section className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white">Listagem oficial no Nexus Marketplace</h3>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                O Nexus Partners passa a ser a oferta principal do ecossistema, com apresentação comercial orientada a assinatura,
                contratos de 6 a 48 meses e checkout conectado ao backend tRPC.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/marketplaces">
                <Button variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10">Abrir Marketplace</Button>
              </Link>
              <Link href="/pix/history">
                <Button variant="outline" className="border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan hover:bg-quantum-cyan/15">Histórico PIX</Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
