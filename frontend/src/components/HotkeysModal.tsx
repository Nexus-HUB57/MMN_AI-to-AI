// D13 HOTKEYS_MODAL — pressione ? para abrir
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

const HOTKEYS = [
  { keys: "Ctrl/⌘ + K", desc: "Abrir busca global (Command Palette)" },
  { keys: "?",          desc: "Mostrar este modal" },
  { keys: "F",          desc: "Modo Focus (esconde sidebar)" },
  { keys: "G + D",      desc: "Ir para Dashboard" },
  { keys: "G + M",      desc: "Ir para Marketplaces" },
  { keys: "G + E",      desc: "Ir para Estoque" },
  { keys: "G + L",      desc: "Ir para Minha Loja" },
  { keys: "G + A",      desc: "Ir para AcademIA" },
  { keys: "G + P",      desc: "Ir para Pagamentos (BeYour Banker)" },
  { keys: "G + S",      desc: "Ir para Sincronizar IA" },
  { keys: "Ctrl/⌘ + J", desc: "Invocar Nexus Live (J.A.R.V.I.S) — AO+" },
  { keys: "ESC",        desc: "Fechar modais / overlays" },
];

export default function HotkeysModal() {
  const [open, setOpen] = useState(false);
  const [, setLocation] = useLocation();
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    let pendingTimer: any = null;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      const typing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if (typing) return;

      if (e.key === "?" || (e.key === "/" && e.shiftKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      } else if (e.key === "g" || e.key === "G") {
        setPending("g");
        if (pendingTimer) clearTimeout(pendingTimer);
        pendingTimer = setTimeout(() => setPending(null), 1500);
      } else if (pending === "g") {
        const map: Record<string, string> = {
          d: "/dashboard", m: "/marketplaces", e: "/estoque",
          l: "/minha-loja", a: "/academia/ead/curso",
          p: "/payments", s: "/agents/sync",
        };
        const route = map[e.key.toLowerCase()];
        if (route) {
          e.preventDefault();
          setLocation(route);
        }
        setPending(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, pending, setLocation]);

  if (!open) {
    return pending === "g" ? (
      <div className="fixed bottom-6 left-6 z-40 rounded-lg ux-glass-strong border border-quantum-cyan/40 px-3 py-2 text-[12px] text-slate-200 ux-fade-in">
        <kbd className="rounded border border-white/15 bg-black/40 px-1.5 py-0.5 text-[10px]">G</kbd> +
        <span className="ml-1 text-slate-400">próxima tecla…</span>
      </div>
    ) : null;
  }

  return (
    <>
      <div className="ux-cmd-backdrop" onClick={() => setOpen(false)} />
      <div className="ux-cmd-panel">
        <div className="border-b border-white/10 px-5 py-4 flex items-center justify-between">
          <h3 className="text-base font-semibold ux-gradient-text">⌨️ Atalhos de Teclado</h3>
          <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white text-sm">✕</button>
        </div>
        <div className="px-5 py-4 max-h-[60vh] overflow-y-auto ux-scroll">
          <div className="grid gap-2">
            {HOTKEYS.map((h, i) => (
              <div key={i} className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg hover:bg-white/5">
                <span className="text-sm text-slate-200">{h.desc}</span>
                <kbd className="font-mono text-[11px] rounded border border-white/15 bg-black/40 px-2 py-1 text-quantum-cyan whitespace-nowrap">
                  {h.keys}
                </kbd>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-white/10 px-5 py-3 text-[10px] text-slate-500 text-center">
          Pressione <kbd className="rounded border border-white/15 bg-black/40 px-1 py-0.5">?</kbd> a qualquer momento · OneVerso Hub
        </div>
      </div>
    </>
  );
}
