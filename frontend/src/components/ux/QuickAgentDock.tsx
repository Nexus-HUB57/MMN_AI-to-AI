import { useState } from "react";
import { Link } from "wouter";

export default function QuickAgentDock() {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-5 right-5 z-50 print:hidden">
      {open && (
        <div className="mb-2 w-64 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 shadow-2xl backdrop-blur">
          <div className="border-b border-white/10 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Agente IA</p>
            <p className="text-sm font-semibold text-white">Atalhos rápidos</p>
          </div>
          <div className="px-2 py-2 text-sm">
            <Link href="/academia/lab-nexus" className="block rounded-lg px-3 py-2 text-slate-200 hover:bg-white/5">
              💬 Lab Nexus · Chatbot
            </Link>
            <Link href="/agents" className="block rounded-lg px-3 py-2 text-slate-200 hover:bg-white/5">
              🧠 Painel do Agente
            </Link>
            <Link href="/skills" className="block rounded-lg px-3 py-2 text-slate-200 hover:bg-white/5">
              ✨ Skills disponíveis
            </Link>
            <Link href="/marketplaces" className="block rounded-lg px-3 py-2 text-slate-200 hover:bg-white/5">
              🛒 Marketplace Nexus
            </Link>
            <Link href="/minha-loja" className="block rounded-lg px-3 py-2 text-slate-200 hover:bg-white/5">
              🏪 Minha Loja
            </Link>
          </div>
          <div className="border-t border-white/10 px-4 py-2 text-[11px] text-slate-500">
            Dica: <kbd className="rounded border border-white/15 bg-white/5 px-1 py-0.5">⌘ K</kbd> abre busca rápida.
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Atalhos do Agente IA"
        className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-quantum-cyan/30 bg-quantum-cyan text-slate-900 shadow-[0_0_24px_rgba(0,229,255,.35)] transition hover:scale-105"
      >
        <span className="text-xl">⚡</span>
      </button>
    </div>
  );
}
