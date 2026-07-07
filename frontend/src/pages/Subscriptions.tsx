import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PartnersContactForm from "@/components/PartnersContactForm";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/contexts/AuthContext";
import { buildMarketplaceCheckoutUrl } from "@/lib/marketplace-payments";
import {
  createLocalSubscription,
  getFallbackSubscriptionCatalog,
  listLocalSubscriptions,
  type CatalogPlan,
} from "@/lib/nexus-partners-fallback";
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

function formatPercentage(rate: number) {
  return `${(rate * 100).toFixed(Number.isInteger(rate * 100) ? 0 : 2).replace(".", ",")}%`;
}

function getCommissionPreview(plan: CatalogPlan, termMonths: number) {
  const rate = plan.commissionModel.byTerm[termMonths] ?? plan.commissionRate;
  const amountCents = plan.priceCents == null ? null : Math.round(plan.priceCents * rate);
  return { rate, amountCents };
}

const planIcons = {
  "nexus-start": Bot,
  "nexus-growth": Activity,
  "nexus-enterprise": Crown,
} as const;

export default function Subscriptions() {
  const [partnersFormOpen, setPartnersFormOpen] = useState(false);
  const [partnersFormPlan, setPartnersFormPlan] = useState<{ planId: string; planName: string; termMonths: number } | null>(null);
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [selectedTerms, setSelectedTerms] = useState<Record<string, number>>({});
  const [localRevision, setLocalRevision] = useState(0);

  const catalogQuery = trpc.subscriptions.catalog.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
  });

  const mineQuery = trpc.subscriptions.mine.useQuery(undefined, {
    enabled: isAuthenticated,
    staleTime: 1000 * 30,
  });

  const startMutation = trpc.subscriptions.start.useMutation();
  const fallbackCatalog = useMemo(() => getFallbackSubscriptionCatalog(), []);

  const catalogOffline = catalogQuery.isError || !(catalogQuery.data?.plans?.length);
  const runtimeOffline = catalogOffline || mineQuery.isError;

  const plans = useMemo(() => {
    if (catalogQuery.data?.plans?.length) {
      return catalogQuery.data.plans as CatalogPlan[];
    }
    return fallbackCatalog.plans;
  }, [catalogQuery.data?.plans, fallbackCatalog.plans]);

  const mySubscriptions = useMemo(() => {
    const remoteItems = (mineQuery.data?.items ?? []) as Array<{ planId: string; status: string; id: string }>;
    if (remoteItems.length) {
      return new Map(remoteItems.map((item) => [item.planId, item]));
    }

    const localItems = listLocalSubscriptions();
    return new Map(localItems.map((item) => [item.planId, item]));
  }, [mineQuery.data?.items, localRevision]);

  const autonomyFacts = [
    "Produto SaaS autônomo, sem vínculo com a jornada de packs do Nexus Affil'IA'te",
    "Contratação por assinatura mensal com janela contratual de 6, 12, 18, 24, 30, 36 e 48 meses",
    "Comissão mensal recorrente para afiliados entre 5% e 15%, conforme plano contratado e prazo efetivado",
  ];

  function startLocalFlow(plan: CatalogPlan, termMonths: number, fromError = false) {
    const subscription = createLocalSubscription(plan, termMonths);
    setLocalRevision((current) => current + 1);

    if (plan.priceCents == null || plan.governance.requiresAdminContact) {
      setFeedback(
        `${fromError ? "API indisponível. " : ""}Solicitação registrada para ${plan.fullName}. O time comercial irá tratar a proposta ${termMonths} meses.`,
      );
      return;
    }

    const checkoutUrl = buildMarketplaceCheckoutUrl({
      source: "subscriptions",
      type: "subscription",
      slug: plan.id,
      name: plan.fullName,
      amountCents: plan.priceCents,
      description: `${plan.tagline} · licença ${termMonths} meses`,
      subscriptionId: subscription.id,
      termMonths,
    });

    if (fromError) {
      setFeedback("API de assinatura indisponível. Continuando em modo local seguro para o checkout.");
    }

    setLocation(checkoutUrl);
  }

  async function handleSubscribe(plan: CatalogPlan) {
    const termMonths = selectedTerms[plan.id] ?? plan.storefront.defaultTermMonths;

    if (!isAuthenticated) {
      setLocation(`/login?from=${encodeURIComponent("/subscriptions")}`);
      return;
    }

    if (runtimeOffline) {
      startLocalFlow(plan, termMonths);
      return;
    }

    try {
      const result = await startMutation.mutateAsync({
        userId: 1,
        planId: plan.id as never,
        termMonths,
        metadata: {
          storefront: "nexus-marketplace",
          productName: "Nexus Partners Pack",
          exclusiveModel: "subscription-only",
        },
      });

      if (result.requiresAdminApproval || plan.governance.requiresAdminContact || plan.priceCents == null) {
        setFeedback(`Solicitação registrada para ${plan.fullName}. O time comercial irá tratar a proposta ${termMonths} meses.`);
        void mineQuery.refetch();
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
      console.warn("Subscriptions runtime offline, usando fallback local.", error);
      startLocalFlow(plan, termMonths, true);
    }
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 md:px-6">
        <section className="overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(0,229,255,0.18),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(124,255,178,0.14),transparent_28%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,1))] p-6 shadow-2xl shadow-black/30 md:p-8">
          <div className="grid gap-8 xl:grid-cols-[1.08fr_0.92fr] xl:items-center">
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2">
                <Badge className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">Nexus Partners Pack · produto SaaS independente</Badge>
                <Badge className="border border-quantum-lime/30 bg-quantum-lime/10 text-quantum-lime">Contratação exclusivamente por assinatura</Badge>
                <Badge className="border border-white/10 bg-white/5 text-slate-200">Modalidades de 6, 12, 18, 24, 30, 36 e 48 meses</Badge>
              </div>

              <div className="space-y-4">
                <h1 className="max-w-5xl text-4xl font-black tracking-tight text-white md:text-5xl xl:text-6xl">
                  Nexus Partners Pack · software SaaS contratado <span className="text-quantum-lime">exclusivamente por assinatura</span>
                </h1>
                <p className="max-w-4xl text-base leading-7 text-slate-300 md:text-lg">
                  O Nexus Partners Pack é um produto independente, comercializado apenas por assinatura. Pode ser contratado por terceiros ou por afiliados do Nexus Affil'IA'te, sempre como solução autônoma — sem representar nível, pack ou etapa da jornada principal do ecossistema.
                </p>
                <p className="max-w-4xl text-sm leading-7 text-slate-400 md:text-base">
                  Os planos Start, Growth e Enterprise são apenas modalidades contratuais do mesmo produto, variando por capacidade operacional, skills agregadas, governança e suporte. Toda contratação acontece em janela de 6, 12, 18, 24, 30, 36 ou 48 meses, com política de comissão mensal recorrente para afiliados que indicarem, comercializarem e efetivarem o contrato.
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
                <CardTitle className="text-xl text-white">Como o Nexus Partners Pack se posiciona</CardTitle>
                <CardDescription className="text-slate-300">
                  Três pilares que definem o produto como solução SaaS autônoma — não como pack ou nível do Nexus Affil'IA'te.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-3xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300">
                  <div className="mb-2 flex items-center gap-2 text-white"><Zap className="h-4 w-4 text-quantum-cyan" /> Produto independente</div>
                  <p>SaaS contratável por terceiros ou afiliados, sem qualquer relação com packs, escadas ou níveis do Nexus Affil'IA'te.</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300">
                  <div className="mb-2 flex items-center gap-2 text-white"><BarChart3 className="h-4 w-4 text-quantum-lime" /> Apenas por assinatura</div>
                  <p>Comercialização exclusivamente por assinatura, com contrato de 6, 12, 18, 24, 30, 36 ou 48 meses e renovação contínua.</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300">
                  <div className="mb-2 flex items-center gap-2 text-white"><ShieldCheck className="h-4 w-4 text-amber-300" /> Modalidades contratuais</div>
                  <p>Start, Growth e Enterprise representam apenas escalas do mesmo produto-base, com skills agregadas e governança.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {runtimeOffline && (
          <div className="rounded-2xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
            Runtime de assinatura indisponível no domínio atual. Exibindo catálogo espelhado do repositório e mantendo a contratação em modo local seguro até a API responder novamente.
          </div>
        )}

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
          {catalogQuery.isLoading && !catalogOffline
            ? Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="h-[420px] animate-pulse rounded-[28px] border border-white/10 bg-white/5" />
              ))
            : plans.map((plan) => {
                const Icon = planIcons[plan.id as keyof typeof planIcons] ?? Sparkles;
                const myPlan = mySubscriptions.get(plan.id);
                const selectedTerm = selectedTerms[plan.id] ?? plan.storefront.defaultTermMonths;
                const commissionPreview = getCommissionPreview(plan, selectedTerm);

                return (
                  <Card key={plan.id} className="overflow-hidden border border-white/10 bg-white/5 backdrop-blur transition hover:-translate-y-1 hover:border-white/20">
                    <div className="border-b border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.72),rgba(15,23,42,0.08))] p-6">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-quantum-cyan">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex flex-wrap justify-end gap-2">
                          <Badge className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">Modalidade de assinatura</Badge>
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
                          <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Biblioteca / operação</p>
                          <p className="mt-2 text-lg font-bold text-white">{plan.capacity.ebooks} ativos · {plan.governance.highValue ? "escopo enterprise" : "operação padronizada"}</p>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4">
                        <p className="text-[10px] uppercase tracking-[0.22em] text-emerald-200/70">Comissão mensal elegível</p>
                        <p className="mt-2 text-lg font-bold text-white">
                          {formatPercentage(commissionPreview.rate)}
                          {commissionPreview.amountCents != null ? ` · ${formatBRL(commissionPreview.amountCents)}/mês` : " · sob proposta"}
                        </p>
                        <p className="mt-2 text-xs leading-5 text-slate-300">
                          {plan.commissionModel.eligibility}. Para contratos de {selectedTerm} meses nesta modalidade.
                        </p>
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
                        onClick={() => {
                          const term = selectedTerms[plan.id] ?? plan.storefront.defaultTermMonths;
                          if (plan.governance.requiresAdminContact || plan.priceCents == null) {
                            setPartnersFormPlan({ planId: plan.id, planName: plan.fullName, termMonths: term });
                            setPartnersFormOpen(true);
                          } else {
                            handleSubscribe(plan);
                          }
                        }}
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
              <h3 className="text-2xl font-bold text-white">Produto exclusivo do Nexus Marketplace</h3>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                O Nexus Partners Pack é listado no Nexus Marketplace como produto SaaS independente, comercializado apenas por assinatura. As modalidades Start, Growth e Enterprise são contratos do mesmo produto-base e não devem ser confundidas com packs, níveis ou etapas da jornada principal do Nexus Affil'IA'te. Afiliados elegíveis recebem comissão mensal recorrente conforme o prazo efetivado do contrato.
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
      {partnersFormPlan && (
        <PartnersContactForm
          open={partnersFormOpen}
          onOpenChange={setPartnersFormOpen}
          planId={partnersFormPlan.planId}
          planName={partnersFormPlan.planName}
          termMonths={partnersFormPlan.termMonths}
        />
      )}
    </DashboardLayout>
  );
}
