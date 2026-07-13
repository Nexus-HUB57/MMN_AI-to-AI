/**
 * SPRINT 5 — Onboarding & Primeira Vitória
 *
 * Conjunto de componentes integrados para acelerar a jornada do novo usuário:
 *
 * 1. WelcomeTour          — Walkthrough guiado em 5 passos no primeiro login
 * 2. ActivationWizard     — Modal 3 etapas: Pack A² → PIX → Confirmação → Loja
 * 3. ProgressChecklist    — Sidebar lateral com 5 marcos de ativação
 * 4. RealtimeToasts       — Toasts globais para eventos importantes
 * 5. EmptyStateHero       — Componente reutilizável de empty state rico
 */
import { useEffect, useState, type ReactNode } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  ShoppingCart,
  Wallet,
  Cpu,
  TrendingUp,
  CheckCircle2,
  Circle,
  X,
  ArrowRight,
  PartyPopper,
  Zap,
} from "lucide-react";

// ===========================================
// 1. WelcomeTour — onboarding 5 passos
// ===========================================
const TOUR_STEPS = [
  {
    title: "👋 Bem-vindo ao Nexus Affil'IA'te!",
    body: "Vamos te mostrar em 60 segundos como sua jornada de afiliado IA vai começar.",
    icon: <Sparkles className="w-12 h-12 text-quantum-cyan" />,
    cta: "Começar tour",
  },
  {
    title: "🧠 Seu Agente IA pessoal",
    body: "Cada afiliado tem um Agente com 25 skills (prospecção, conteúdo, vendas). Acesse em /agents.",
    icon: <Cpu className="w-12 h-12 text-quantum-purple" />,
    cta: "Próximo",
  },
  {
    title: "🛒 Marketplace com 201 e-books",
    body: "Catálogo curado em 19 coleções premium de IA. Você revende com sua margem.",
    icon: <ShoppingCart className="w-12 h-12 text-quantum-lime" />,
    cta: "Próximo",
  },
  {
    title: "⚡ Ative o Pack A² (R$ 10)",
    body: "Pagamento PIX. Em segundos você recebe 10 e-books sincronizados à sua Loja Virtual.",
    icon: <Zap className="w-12 h-12 text-amber-400" />,
    cta: "Próximo",
  },
  {
    title: "💰 Sua Loja Virtual está pronta",
    body: "Compartilhe sua URL única (NX00XXX) e comece a vender. Comissões caem direto no seu PIX.",
    icon: <Wallet className="w-12 h-12 text-emerald-400" />,
    cta: "Ir para o Marketplace →",
  },
];

const TOUR_KEY = "nexus_welcome_tour_completed_v1";

export function WelcomeTour({ onComplete }: { onComplete?: () => void }) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const done = window.localStorage.getItem(TOUR_KEY);
    if (!done) {
      // pequeno delay para não invadir a tela
      setTimeout(() => setVisible(true), 800);
    }
  }, []);

  const handleClose = () => {
    setVisible(false);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(TOUR_KEY, "1");
    }
    onComplete?.();
  };

  const next = () => {
    if (step < TOUR_STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleClose();
      window.location.href = "/marketplaces";
    }
  };

  if (!visible) return null;
  const current = TOUR_STEPS[step];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative max-w-md w-full rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-2xl shadow-quantum-cyan/20">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 text-slate-500 hover:text-white"
          aria-label="Fechar tour"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center gap-4">
          <div className="rounded-full bg-white/5 p-5">{current.icon}</div>
          <h2 className="text-xl font-bold text-white">{current.title}</h2>
          <p className="text-sm text-slate-300 leading-relaxed">{current.body}</p>

          {/* Stepper */}
          <div className="flex gap-1.5 my-1">
            {TOUR_STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? "w-8 bg-quantum-cyan" : "w-2 bg-white/20"
                }`}
              />
            ))}
          </div>

          <Button onClick={next} className="gradient-btn w-full mt-2">
            {current.cta}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          {step < TOUR_STEPS.length - 1 && (
            <button
              onClick={handleClose}
              className="text-xs text-slate-500 hover:text-slate-300"
            >
              pular tour
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ===========================================
// 2. ProgressChecklist — barra lateral fixa
// ===========================================
const STEPS_DEF = [
  { id: "register", label: "Conta criada", route: "/dashboard" },
  { id: "pack_a2", label: "Pack A² ativado", route: "/pix/checkout?pack=pack-a2" },
  { id: "agent_active", label: "Agente IA liberado", route: "/agents" },
  { id: "library_ready", label: "Biblioteca sincronizada", route: "/marketplaces/ebooks" },
  { id: "first_sale", label: "Primeira comissão", route: "/commissions" },
];

export function ProgressChecklist() {
  const grantsQuery = (trpc as any).packEntitlements?.listMyGrants?.useQuery
    ? (trpc as any).packEntitlements.listMyGrants.useQuery(undefined, { staleTime: 60_000 })
    : { data: null };

  const libraryQuery = (trpc as any).packEntitlements?.listMyLibrary?.useQuery
    ? (trpc as any).packEntitlements.listMyLibrary.useQuery(undefined, { staleTime: 60_000 })
    : { data: null };

  const statusQuery = (trpc as any).dashboardStatus?.getStatus?.useQuery
    ? (trpc as any).dashboardStatus.getStatus.useQuery(undefined, { staleTime: 60_000, retry: false })
    : { data: null };

  const [collapsed, setCollapsed] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setDismissed(window.localStorage.getItem("nexus_checklist_dismissed_v1") === "1");
  }, []);

  // Calcular estado de cada step
  const grants = (grantsQuery.data?.grants ?? []) as any[];
  const libraryTotal = libraryQuery.data?.total ?? 0;

  const hasPackA2 = grants.some((g: any) => g.packSlug === "pack-a2");
  const agentActive = Boolean(statusQuery.data?.agentActive) || hasPackA2;

  const completedMap: Record<string, boolean> = {
    register: true,
    pack_a2: hasPackA2,
    agent_active: agentActive,
    library_ready: libraryTotal > 0,
    first_sale: false,
  };

  const completed = STEPS_DEF.filter((s) => completedMap[s.id]).length;
  const total = STEPS_DEF.length;
  const nextStep = STEPS_DEF.find((s) => !completedMap[s.id]) ?? null;

  if (dismissed) return null;
  if (completed === total) return null; // já completou tudo

  const handleDismiss = () => {
    setDismissed(true);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("nexus_checklist_dismissed_v1", "1");
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-xs">
      {collapsed ? (
        <button
          onClick={() => setCollapsed(false)}
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-quantum-cyan to-emerald-400 px-4 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-quantum-cyan/30"
        >
          <CheckCircle2 className="w-4 h-4" />
          {completed}/{total} concluídos
        </button>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-slate-900/95 p-4 shadow-2xl shadow-black/50 backdrop-blur">
          <div className="flex items-start justify-between mb-3">
            <div>
              <Badge className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan text-[10px]">
                Sua jornada
              </Badge>
              <h3 className="mt-1 text-sm font-bold text-white">
                {completed}/{total} passos concluídos
              </h3>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setCollapsed(true)}
                className="text-slate-500 hover:text-white text-xs px-1"
                aria-label="Minimizar"
              >
                _
              </button>
              <button
                onClick={handleDismiss}
                className="text-slate-500 hover:text-white"
                aria-label="Fechar"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Barra de progresso */}
          <div className="h-1.5 w-full bg-white/10 rounded-full mb-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-quantum-cyan to-emerald-400 transition-all duration-500"
              style={{ width: `${(completed / total) * 100}%` }}
            />
          </div>

          <ul className="space-y-2">
            {STEPS_DEF.map((s) => {
              const done = completedMap[s.id];
              return (
                <li key={s.id}>
                  <Link href={s.route}>
                    <a
                      className={`flex items-center gap-2 text-xs rounded-lg p-2 transition ${
                        done
                          ? "text-emerald-300 line-through opacity-70"
                          : "text-white hover:bg-white/5 cursor-pointer"
                      }`}
                    >
                      {done ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      )}
                      <span>{s.label}</span>
                    </a>
                  </Link>
                </li>
              );
            })}
          </ul>

          {nextStep && (
            <div className="mt-3 rounded-xl border border-quantum-cyan/20 bg-quantum-cyan/10 p-3">
              <p className="text-[10px] uppercase tracking-[0.24em] text-quantum-cyan">Próxima ação recomendada</p>
              <p className="mt-1 text-sm font-semibold text-white">{nextStep.label}</p>
              <Link href={nextStep.route}>
                <a className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-quantum-cyan hover:text-white">
                  Ir agora <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ===========================================
// 3. RealtimeToasts — feedback de eventos
// ===========================================
type ToastEvent = {
  id: string;
  kind: "pack_granted" | "sale" | "commission" | "info";
  title: string;
  message: string;
  emoji: string;
};

const toastListeners: Array<(t: ToastEvent) => void> = [];

export function fireNexusToast(t: Omit<ToastEvent, "id">) {
  const evt = { ...t, id: Math.random().toString(36).slice(2, 10) } as ToastEvent;
  toastListeners.forEach((l) => l(evt));
}

export function RealtimeToasts() {
  const [stack, setStack] = useState<ToastEvent[]>([]);

  useEffect(() => {
    const listener = (t: ToastEvent) => {
      setStack((prev) => [...prev, t]);
      setTimeout(() => {
        setStack((prev) => prev.filter((x) => x.id !== t.id));
      }, 6000);
    };
    toastListeners.push(listener);
    return () => {
      const i = toastListeners.indexOf(listener);
      if (i >= 0) toastListeners.splice(i, 1);
    };
  }, []);

  // Auto-detectar pack granted via polling do listMyGrants
  const grantsQuery = (trpc as any).packEntitlements?.listMyGrants?.useQuery
    ? (trpc as any).packEntitlements.listMyGrants.useQuery(undefined, { refetchInterval: 15_000 })
    : { data: null };

  useEffect(() => {
    const grants = (grantsQuery.data?.grants ?? []) as any[];
    if (typeof window === "undefined") return;
    const seenKey = "nexus_grants_seen_v1";
    const seen: string[] = JSON.parse(window.localStorage.getItem(seenKey) || "[]");
    grants.forEach((g: any) => {
      const key = `${g.id}`;
      if (!seen.includes(key)) {
        fireNexusToast({
          kind: "pack_granted",
          emoji: "🎉",
          title: `${g.packSlug.toUpperCase().replace("PACK-", "Pack ")} ativado!`,
          message: `${g.deliveredCount} e-books sincronizados à sua Loja.`,
        });
        seen.push(key);
      }
    });
    window.localStorage.setItem(seenKey, JSON.stringify(seen.slice(-50)));
  }, [grantsQuery.data]);

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {stack.map((t) => (
        <div
          key={t.id}
          className="rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 to-quantum-cyan/15 backdrop-blur p-3 shadow-2xl shadow-emerald-500/20 animate-in slide-in-from-right duration-300"
        >
          <div className="flex items-start gap-2">
            <div className="text-2xl flex-shrink-0">{t.emoji}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-emerald-200">{t.title}</p>
              <p className="text-xs text-slate-300 mt-0.5">{t.message}</p>
            </div>
            <button
              onClick={() => setStack((p) => p.filter((x) => x.id !== t.id))}
              className="text-slate-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ===========================================
// 4. EmptyStateHero — empty state reutilizável
// ===========================================
export function EmptyStateHero({
  icon = <Sparkles className="w-12 h-12 text-quantum-cyan" />,
  title,
  body,
  ctaLabel,
  ctaHref,
  videoUrl,
}: {
  icon?: ReactNode;
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  videoUrl?: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/60 to-slate-950/80 p-8 text-center">
      <div className="inline-flex rounded-full bg-quantum-cyan/10 p-5 mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-300 max-w-md mx-auto mb-5">{body}</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button asChild className="gradient-btn">
          <Link href={ctaHref}>
            {ctaLabel}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
        {videoUrl && (
          <Button asChild variant="outline">
            <a href={videoUrl} target="_blank" rel="noopener noreferrer">
              ▶ Ver tutorial (30s)
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}

// ===========================================
// 5. OnboardingBundle — mount everything at once
// ===========================================
export default function OnboardingBundle() {
  return (
    <>
      <WelcomeTour />
      <ProgressChecklist />
      <RealtimeToasts />
    </>
  );
}
