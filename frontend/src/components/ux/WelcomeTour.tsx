import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";

const KEY = "nx_tour_v1_done";
const STEPS = [
  { title: "Bem-vindo ao Nexus Affil'IA'te", body: "Você controla agente, vitrine, loja e comissões em um só painel. Vamos te orientar sem atrapalhar o fluxo principal." },
  { title: "Marketplace Nexus", body: "Toda a vitrine oficial está em um único lugar — packs, upgrades e e-books com navegação rápida e foco em conversão." },
  { title: "Minha Loja", body: "Sua vitrine pessoal reúne estoque e produtos parceiros sincronizados para compartilhamento imediato." },
  { title: "Academ'IA", body: "Cursos, webinars, playbooks, lab e biblioteca em trilhas com vídeo, PDF, HTML e retomada automática." },
  { title: "Atalhos rápidos", body: "Use ⌘K ou Ctrl+K para abrir a busca global e navegar com menos cliques." },
];

const TOUR_PATHS = [
  "/dashboard",
  "/afiliado",
  "/marketplaces",
  "/estoque",
  "/minisite",
  "/minha-loja",
  "/packs",
  "/skills",
  "/upgrades",
  "/network",
  "/payments",
  "/commissions",
  "/career",
  "/bonus",
  "/agents",
  "/orchestrator",
  "/partners",
  "/subscriptions",
  "/academia",
  "/admin",
];

function isEligiblePath(pathname: string) {
  return TOUR_PATHS.some((base) => pathname === base || pathname.startsWith(`${base}/`));
}

export default function WelcomeTour() {
  const [location] = useLocation();
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(false);
  const eligible = useMemo(() => isEligiblePath(location), [location]);

  useEffect(() => {
    if (!eligible) {
      setOpen(false);
      return;
    }
    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (cancelled) return;
      try {
        if (!localStorage.getItem(KEY)) setOpen(true);
      } catch {}
    }, 650);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [eligible, location]);

  if (!open || !eligible) return null;

  const current = STEPS[step];
  const last = step >= STEPS.length - 1;
  const close = () => {
    try { localStorage.setItem(KEY, "1"); } catch {}
    setOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[95] flex items-end justify-center px-4 pb-8 sm:items-center sm:pb-0" role="dialog" aria-modal="true" aria-label="Tour de boas-vindas do painel">
      <div className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm transition-opacity" onClick={close} />
      <div className="relative w-full max-w-md rounded-3xl border border-quantum-cyan/25 bg-slate-950/96 p-6 shadow-2xl shadow-black/50">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-quantum-cyan">Tour do painel · {step + 1}/{STEPS.length}</p>
            <h3 className="mt-2 text-xl font-bold text-white">{current.title}</h3>
          </div>
          <button onClick={close} className="rounded-full border border-white/10 px-3 py-1 text-[11px] font-semibold text-slate-300 transition hover:border-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-quantum-cyan/70">
            Pular
          </button>
        </div>

        <p className="mt-3 text-sm leading-6 text-slate-300">{current.body}</p>
        <p className="mt-2 text-xs text-slate-500">O tour aparece apenas nas áreas autenticadas para não interferir no login.</p>

        <div className="mt-5 flex items-center gap-2" aria-hidden="true">
          {STEPS.map((_, index) => (
            <span
              key={index}
              className={`h-1.5 rounded-full transition-all ${index === step ? "w-8 bg-quantum-cyan" : "w-2 bg-white/15"}`}
            />
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between gap-2">
          <button
            onClick={() => setStep((value) => Math.max(0, value - 1))}
            disabled={step === 0}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-quantum-cyan/70"
          >
            Voltar
          </button>
          <button
            onClick={() => {
              if (last) close();
              else setStep((value) => value + 1);
            }}
            className="rounded-full bg-quantum-cyan px-4 py-2 text-xs font-bold text-slate-900 transition hover:bg-quantum-cyan/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-quantum-cyan/70"
          >
            {last ? "Concluir tour" : "Próximo"}
          </button>
        </div>
      </div>
    </div>
  );
}
