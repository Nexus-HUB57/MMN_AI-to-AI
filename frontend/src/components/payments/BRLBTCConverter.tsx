/**
 * BRL ⇄ BTC Converter — Correção #4 (/payments BeYour Banker)
 * -----------------------------------------------------------------------------
 * Widget visível em /payments. Exibe cotação atualizada (cache 30s) e permite
 * pré-cálculo BRL→BTC e BTC→BRL. Selo "Custódia Binance" reforça que a
 * custódia efetiva fica com a exchange parceira.
 */

import { useEffect, useMemo, useState } from "react";
import { trpc } from "../../lib/trpc";
import { ArrowDownUp, Bitcoin, ShieldCheck, RefreshCw, AlertCircle } from "lucide-react";

type Direction = "brl_to_btc" | "btc_to_brl";

function formatBrl(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatBtc(value: number): string {
  return `${value.toFixed(8)} BTC`;
}

export default function BRLBTCConverter() {
  const [direction, setDirection] = useState<Direction>("brl_to_btc");
  const [amount, setAmount] = useState<string>("100");
  const [debounced, setDebounced] = useState<string>("100");

  // Debounce 300ms para evitar excesso de requisições
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(amount), 300);
    return () => window.clearTimeout(t);
  }, [amount]);

  const parsedAmount = useMemo(() => {
    const n = Number(debounced.replace(",", "."));
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [debounced]);

  const quoteQuery = trpc.banking?.getBtcBrlQuote?.useQuery
    ? trpc.banking.getBtcBrlQuote.useQuery(undefined, {
        retry: false,
        refetchInterval: 30_000,
      })
    : { data: undefined, isLoading: false, isError: true, refetch: () => Promise.resolve() } as const;

  const handleSwap = () => {
    setDirection((d) => (d === "brl_to_btc" ? "btc_to_brl" : "brl_to_btc"));
    setAmount("");
    setDebounced("");
  };

  const quote = quoteQuery.data;
  const output = useMemo(() => {
    if (!quote || parsedAmount <= 0) return 0;
    return direction === "brl_to_btc"
      ? parsedAmount / quote.brlPerBtc
      : parsedAmount * quote.brlPerBtc;
  }, [direction, parsedAmount, quote]);

  return (
    <div className="rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-500/5 via-slate-900/40 to-cyan-500/5 p-5">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-amber-500/15 ring-1 ring-amber-400/40">
            <Bitcoin className="h-5 w-5 text-amber-300" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Conversão BRL ⇄ BTC</h3>
            <p className="mt-0.5 text-xs text-slate-400">
              Cotação indicativa · atualização a cada 30s
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-300">
          <ShieldCheck className="h-3.5 w-3.5" /> Custódia Binance
        </span>
      </header>

      <div className="mt-5 grid gap-3">
        <div className="rounded-xl border border-white/10 bg-black/30 p-3">
          <label className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
            {direction === "brl_to_btc" ? "De · BRL (R$)" : "De · BTC"}
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.,]/g, ""))}
            placeholder={direction === "brl_to_btc" ? "100,00" : "0,00100000"}
            className="mt-1 w-full bg-transparent text-xl font-semibold text-white outline-none placeholder:text-slate-600"
          />
        </div>

        <button
          type="button"
          onClick={handleSwap}
          className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-white/10"
        >
          <ArrowDownUp className="h-3.5 w-3.5" /> Inverter
        </button>

        <div className="rounded-xl border border-white/10 bg-black/30 p-3">
          <label className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
            {direction === "brl_to_btc" ? "Para · BTC" : "Para · BRL (R$)"}
          </label>
          <div className="mt-1 text-xl font-semibold text-cyan-300">
            {quoteQuery.isLoading ? (
              <span className="text-slate-500">carregando…</span>
            ) : quoteQuery.isError || !quote ? (
              <span className="inline-flex items-center gap-1 text-amber-300">
                <AlertCircle className="h-4 w-4" /> indisponível
              </span>
            ) : direction === "brl_to_btc" ? (
              formatBtc(output)
            ) : (
              formatBrl(output)
            )}
          </div>
        </div>
      </div>

      <footer className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500">
        <span>
          {quote
            ? `1 BTC = ${formatBrl(quote.brlPerBtc)} · fonte: ${quote.source}`
            : "Aguardando cotação"}
        </span>
        <button
          type="button"
          onClick={() => quoteQuery.refetch?.()}
          className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 hover:text-white"
        >
          <RefreshCw className="h-3 w-3" /> Atualizar
        </button>
      </footer>

      <p className="mt-3 text-[10px] leading-4 text-slate-500">
        Conversão indicativa para fins de planejamento. A custódia e liquidação
        efetivas ocorrem na Binance, parceira regulada. Esta tela não constitui
        oferta de produto financeiro nos termos da CVM. Nenhum dado pessoal é
        enviado a serviços externos.
      </p>
    </div>
  );
}
