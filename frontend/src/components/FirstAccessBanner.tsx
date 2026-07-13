import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Sparkles, ShoppingCart, X } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * FirstAccessBanner (Onda 17)
 * ---------------------------------------------------------------------------
 * Banner exibido quando o afiliado é direcionado ao Marketplace Nexus
 * pelo gate de primeiro acesso (querystring ?firstAccess=1).
 *
 * - Detecta a query param sem depender de router externo.
 * - É dispensável (X), mas a decisão de compra segue no fluxo normal.
 */
export default function FirstAccessBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    setShow(params.get("firstAccess") === "1");
  }, []);

  if (!show) return null;

  return (
    <div className="relative mb-6 overflow-hidden rounded-lg border border-quantum-cyan/40 bg-gradient-to-r from-quantum-cyan/15 via-obsidian-900/60 to-obsidian-900/60 p-5">
      <button
        type="button"
        onClick={() => setShow(false)}
        className="absolute right-3 top-3 rounded p-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
        aria-label="Fechar aviso"
      >
        <X size={16} />
      </button>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-full border border-quantum-cyan/50 bg-quantum-cyan/15 p-2 text-quantum-cyan">
            <Sparkles size={20} />
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-quantum-cyan">
              // BEM-VINDO À REDE NEXUS
            </p>
            <h2 className="mt-1 text-lg font-semibold text-white">
              Comece pelo Pack A² e ative sua jornada no Nexus Affil'IA'te
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-300">
              Seu primeiro agente IA é ativado com o <strong>Pack A²</strong>, que marca a entrada oficial no programa de afiliados.
              O <strong>Nexus Partners Pack</strong> é uma solução SaaS independente e opcional, contratada por assinatura para operações parceiras em separado.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 md:items-end">
          <div className="flex shrink-0 items-center gap-2 rounded border border-quantum-cyan/40 bg-obsidian-900/40 px-3 py-2 font-mono text-[11px] uppercase tracking-widest text-quantum-cyan">
            <ShoppingCart size={14} />
            Comece pelo Pack A²
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold text-emerald-200">Obrigatório agora · Pack A²</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-200">Opcional depois · Nexus Partners Pack</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/pix/checkout?pack=pack-a2">
              <Button size="sm" className="gradient-btn h-9 px-4 text-xs font-semibold">Ativar Pack A²</Button>
            </Link>
            <Link href="/subscriptions">
              <Button size="sm" variant="outline" className="h-9 border-white/15 bg-white/5 px-4 text-xs text-white hover:bg-white/10">Ver SaaS Partners</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
