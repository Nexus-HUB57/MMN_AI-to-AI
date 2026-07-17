import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/contexts/AuthContext";
import { listLocalSubscriptions } from "@/lib/nexus-partners-fallback";
import { Lock, ArrowRight, ShieldCheck, Crown } from "lucide-react";

/**
 * PartnersAccessGuard
 *
 * Restringe o acesso ao /partners somente para usuários com assinatura
 * vigente do Nexus Partners Pack. Verifica via tRPC (subscriptions.listMine
 * + partnersDelivery.eligibility) com fallback local seguro.
 *
 * Quando não-autorizado, exibe tela de bloqueio com CTA para /subscriptions.
 */

type AccessState =
  | { state: "loading" }
  | { state: "authorized"; reason: string }
  | { state: "denied"; reason: string };

export default function PartnersAccessGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [status, setStatus] = useState<AccessState>({ state: "loading" });

  const mineQuery = (trpc as any)?.subscriptions?.listMine?.useQuery?.(
    { userId: typeof user?.id === "number" ? user.id : 1 },
    { retry: false },
  );

  const eligibilityQuery = (trpc as any)?.partnersDelivery?.eligibility?.useQuery?.(
    { userId: String(user?.id ?? "anon") },
    { retry: false },
  );

  const remoteItems = useMemo(() => {
    const items = (mineQuery?.data?.items ?? []) as Array<{ planId: string; status: string }>;
    return items;
  }, [mineQuery?.data?.items]);

  const localItems = useMemo(() => {
    try {
      return listLocalSubscriptions() as Array<{ planId: string; status?: string }>;
    } catch {
      return [];
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setStatus({ state: "denied", reason: "Usuário não autenticado" });
      return;
    }

    const remoteActive = remoteItems.some((it) => /nexus-(start|growth|enterprise)/i.test(it.planId) && it.status !== "cancelled");
    const localActive = localItems.some((it) => /nexus-(start|growth|enterprise)/i.test(it.planId));
    const eligibilitySubscription = Boolean(eligibilityQuery?.data?.subscriptionActive);

    if (remoteActive || localActive || eligibilitySubscription) {
      setStatus({ state: "authorized", reason: remoteActive ? "subscription:remote" : localActive ? "subscription:local" : "eligibility:backend" });
      return;
    }

    // Se ainda está carregando alguma query, aguarda
    if (mineQuery?.isLoading || eligibilityQuery?.isLoading) {
      setStatus({ state: "loading" });
      return;
    }

    setStatus({ state: "denied", reason: "Assinatura Nexus Partners Pack não localizada" });
  }, [isAuthenticated, remoteItems, localItems, eligibilityQuery?.data?.subscriptionActive, mineQuery?.isLoading, eligibilityQuery?.isLoading]);

  if (status.state === "loading") {
    return (
      <DashboardLayout>
        <div className="mx-auto flex max-w-3xl items-center justify-center px-4 py-24 text-center">
          <div>
            <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">
              <ShieldCheck className="h-5 w-5 animate-pulse" />
            </div>
            <p className="mt-4 font-mono text-xs uppercase tracking-[0.4em] text-slate-400">// validando assinatura</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Verificando seu acesso ao Nexus Partners Pack</h2>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (status.state === "denied") {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-3xl px-4 py-16">
          <div className="overflow-hidden rounded-[32px] border border-rose-300/30 bg-[radial-gradient(circle_at_top_left,rgba(244,63,94,0.16),transparent_25%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,1))] p-8 text-center shadow-2xl shadow-black/30">
            <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full border border-rose-300/40 bg-rose-300/10 text-rose-200">
              <Lock className="h-6 w-6" />
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Badge className="border border-rose-300/30 bg-rose-300/10 text-rose-200">Acesso restrito</Badge>
              <Badge className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">Nexus Partners Pack</Badge>
            </div>
            <h1 className="mt-4 text-3xl font-black text-white">Painel Partners é exclusivo de assinantes</h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-300">
              O Painel Partners está disponível somente para usuários com <strong>assinatura ativa do Nexus Partners Pack</strong>. Contrate Start, Growth ou Enterprise para liberar materiais exclusivos, painel de performance, sincronização de APIs do agente e o Chatbot Partners (100 tokens/dia).
            </p>
            <p className="mt-2 text-[11px] uppercase tracking-widest text-slate-500">{status.reason}</p>

            <div className="mt-6 grid gap-3 text-left sm:grid-cols-3">
              {[
                { t: "Materiais exclusivos", d: "Skills, workflows, prompts e guias oficiais." },
                { t: "Performance e limites", d: "Uptime, p95, custo por execução e SLA do plano." },
                { t: "Chatbot Partners", d: "100 tokens/dia para direcionar o agente em produção." },
              ].map((item) => (
                <div key={item.t} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <p className="text-sm font-semibold text-white">{item.t}</p>
                  <p className="mt-1 text-xs text-slate-400">{item.d}</p>
                </div>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link href="/subscriptions">
                <Button className="gradient-btn h-11 px-5">
                  <Crown className="mr-2 h-4 w-4" />
                  Ver planos Nexus Partners Pack
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" className="h-11 border-white/15 bg-white/5 text-white hover:bg-white/10">
                  Voltar ao Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return <>{children}</>;
}
