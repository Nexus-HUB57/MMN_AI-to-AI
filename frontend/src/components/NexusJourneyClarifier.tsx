import { useMemo } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { listLocalSubscriptions } from "@/lib/nexus-partners-fallback";
import { ArrowRight, Bot, CheckCircle2, Crown, Sparkles, Zap } from "lucide-react";

function hasActivePartnersSubscription(items: Array<{ planId?: string; status?: string }>) {
  return items.some((item) => /nexus-(start|growth|enterprise)/i.test(item.planId ?? "") && item.status !== "cancelled");
}

export default function NexusJourneyClarifier({ hasPackA2 }: { hasPackA2: boolean }) {
  const mineQuery = (trpc as any)?.subscriptions?.listMine?.useQuery?.(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const remoteActive = useMemo(() => {
    const items = (mineQuery?.data?.items ?? []) as Array<{ planId?: string; status?: string }>;
    return hasActivePartnersSubscription(items);
  }, [mineQuery?.data?.items]);

  const localActive = useMemo(() => {
    try {
      return hasActivePartnersSubscription(listLocalSubscriptions() as Array<{ planId?: string; status?: string }>);
    } catch {
      return false;
    }
  }, []);

  const hasPartnersPack = remoteActive || localActive;

  const primaryAction = !hasPackA2
    ? { href: "/pix/checkout?pack=pack-a2", label: "Ativar Pack A² agora" }
    : !hasPartnersPack
      ? { href: "/subscriptions", label: "Conhecer Nexus Partners Pack" }
      : { href: "/partners", label: "Abrir Painel Partners" };

  return (
    <section className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(0,229,255,0.10),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(250,204,21,0.10),transparent_26%),linear-gradient(180deg,rgba(15,23,42,0.95),rgba(2,6,23,1))] p-5 shadow-2xl shadow-black/20 md:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">Arquitetura da jornada</Badge>
            <Badge className="border border-white/10 bg-white/5 text-slate-200">A² ≠ Nexus Partners Pack</Badge>
          </div>
          <div>
            <h2 className="text-2xl font-black text-white md:text-3xl">Entenda onde começa a jornada e onde entra a camada SaaS</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300 md:text-base">
              O <strong className="text-white">Pack A²</strong> inicia a jornada principal do afiliado, ativa o primeiro agente IA e libera a progressão oficial.
              O <strong className="text-white">Nexus Partners Pack</strong> é uma camada complementar por assinatura, usada para operação parceira, analytics e escala comercial independente.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href={primaryAction.href}>
            <Button className="gradient-btn h-11 px-5">
              {primaryAction.label}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/marketplaces">
            <Button variant="outline" className="h-11 border-white/15 bg-white/5 text-white hover:bg-white/10">
              Ver Marketplace
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <Card className="border-quantum-cyan/20 bg-quantum-cyan/5 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Zap className="h-5 w-5 text-quantum-cyan" />
              Pack A² · início do afiliado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-300">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={hasPackA2 ? "border border-emerald-400/30 bg-emerald-400/10 text-emerald-200" : "border border-amber-400/30 bg-amber-400/10 text-amber-200"}>
                {hasPackA2 ? "Status atual · ativo" : "Status atual · pendente"}
              </Badge>
              <Badge className="border border-white/10 bg-white/5 text-slate-200">Obrigatório para começar</Badge>
            </div>
            <ul className="space-y-2">
              {[
                "Ativa o primeiro agente IA do afiliado",
                "Libera a jornada oficial de packs e progressão",
                "Conecta marketplace, biblioteca e comissões",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-quantum-cyan" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link href="/pix/checkout?pack=pack-a2">
              <Button variant="outline" className="w-full border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan hover:bg-quantum-cyan/15">
                {hasPackA2 ? "Revisar ativação A²" : "Ativar Pack A²"}
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-amber-300/20 bg-amber-300/5 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Crown className="h-5 w-5 text-amber-300" />
              Nexus Partners Pack · SaaS complementar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-300">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={hasPartnersPack ? "border border-emerald-400/30 bg-emerald-400/10 text-emerald-200" : "border border-white/10 bg-white/5 text-slate-200"}>
                {hasPartnersPack ? "Status atual · assinatura localizada" : "Status atual · opcional"}
              </Badge>
              <Badge className="border border-white/10 bg-white/5 text-slate-200">Start · Growth · Enterprise</Badge>
            </div>
            <ul className="space-y-2">
              {[
                "Opera como produto independente por assinatura",
                "Pode ser usado por afiliados ou terceiros fora da escada principal",
                "Expande analytics, APIs do agente e operação parceira",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link href={hasPartnersPack ? "/partners" : "/subscriptions"}>
              <Button variant="outline" className="w-full border-amber-300/30 bg-amber-300/10 text-amber-200 hover:bg-amber-300/15">
                {hasPartnersPack ? "Abrir Painel Partners" : "Ver planos por assinatura"}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
        <span className="font-semibold text-white">Recomendação operacional:</span>{" "}
        {!hasPackA2
          ? "comece pelo Pack A² para ativar a jornada principal e só depois avalie a camada Partners conforme necessidade comercial."
          : !hasPartnersPack
            ? "se sua jornada principal já está ativa, você pode avaliar o Nexus Partners Pack como camada opcional de operação SaaS e parcerias."
            : "você já possui as duas camadas disponíveis: jornada principal do afiliado e operação complementar do Nexus Partners Pack."}
      </div>
    </section>
  );
}
