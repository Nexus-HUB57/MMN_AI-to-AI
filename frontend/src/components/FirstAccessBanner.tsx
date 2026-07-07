import { useEffect, useState } from "react";
import { Sparkles, ShoppingCart, X } from "lucide-react";

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
              Ative seu Agente Nexus adquirindo o Pack
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-300">
              Seu Agente IA só é ativado depois da compra do{" "}
              <strong>Nexus Partners Pack</strong>. Escolha um pack abaixo
              para começar a operar, ganhar comissões e desbloquear os bônus da
              rede binária.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 rounded border border-quantum-cyan/40 bg-obsidian-900/40 px-3 py-2 font-mono text-[11px] uppercase tracking-widest text-quantum-cyan">
          <ShoppingCart size={14} />
          Selecione um Pack abaixo
        </div>
      </div>
    </div>
  );
}
