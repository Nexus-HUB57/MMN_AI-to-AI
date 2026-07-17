// D13 WELCOME_TOUR — onboarding de boas-vindas
import { useEffect, useState } from "react";

const STEPS = [
  { title: "Bem-vindo ao OneVerso!", body: "Sua plataforma agêntica de afiliados com IA. Vamos te mostrar o essencial em 4 passos.", emoji: "👋" },
  { title: "🟢 Indicadores no topo", body: "Ao lado de IOAID · SaaS você vê as luzes do seu Agente e da Ativação Mensal. Verde = ativo, vermelho = pendente.", emoji: "🟢" },
  { title: "⌨️ Atalhos de teclado", body: "Pressione Ctrl/⌘+K para abrir a busca, ? para ver todos os atalhos, F para modo Focus.", emoji: "⌨️" },
  { title: "🎯 Comece aqui", body: "Marketplace Nexus para comprar, Estoque para ver seus itens, Sincronizar IA para acompanhar seu Agente.", emoji: "🎯" },
];

export default function WelcomeTour() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = localStorage.getItem("ux-tour-seen");
    if (!seen) {
      setTimeout(() => setOpen(true), 800);
    }
  }, []);

  const close = () => {
    setOpen(false);
    localStorage.setItem("ux-tour-seen", "1");
  };

  if (!open) return null;
  const s = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <>
      <div className="ux-cmd-backdrop" onClick={close} />
      <div className="ux-cmd-panel ux-glass-strong" style={{ maxWidth: 480 }}>
        <div className="px-6 py-8 text-center">
          <div className="text-6xl mb-4 ux-bounce-soft">{s.emoji}</div>
          <h2 className="text-xl font-bold ux-gradient-text mb-3">{s.title}</h2>
          <p className="text-sm text-slate-300 leading-6">{s.body}</p>

          <div className="flex items-center justify-center gap-2 mt-6">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={"h-1.5 rounded-full transition-all " + (i === step ? "w-8 bg-quantum-cyan" : "w-1.5 bg-white/20")}
              />
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <button onClick={close} className="text-xs text-slate-500 hover:text-slate-300 ux-focus">
              Pular tour
            </button>
            <div className="flex gap-2">
              {step > 0 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="ux-focus ux-tap rounded-lg border border-white/15 px-4 py-2 text-sm text-slate-300 hover:bg-white/5"
                >
                  ← Voltar
                </button>
              )}
              <button
                onClick={isLast ? close : () => setStep(step + 1)}
                className="ux-focus ux-tap rounded-lg bg-gradient-to-r from-quantum-cyan to-purple-500 px-5 py-2 text-sm font-bold text-white hover:opacity-90"
              >
                {isLast ? "Começar 🚀" : "Próximo →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
