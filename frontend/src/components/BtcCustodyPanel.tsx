import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/contexts/AuthContext";
import { Bitcoin, Copy, ShieldCheck, Clock, AlertTriangle, CheckCircle2, Hash } from "lucide-react";
import { toast } from "sonner";

/**
 * BtcCustodyPanel (Onda 19) — Painel completo de custódia BTC/Binance
 * ---------------------------------------------------------------------------
 * Substitui o simulador simples BRL<->BTC do /payments antigo.
 * Novo fluxo completo:
 *   1. Mostra endereço de custódia + termos (90d congelamento, D+5 saque)
 *   2. Afiliado informa valor (BRL) e vê conversão para BTC
 *   3. Gera intent de aporte -> recebe endereço + instrução
 *   4. Envia o BTC de sua wallet própria -> recebe hash
 *   5. Cola o hash no sistema -> transação vira "pending_confirmation"
 *   6. Sistema confirma on-chain (automatizado) -> aparece em Histórico BTC
 */
export default function BtcCustodyPanel() {
  const { user } = useAuth();
  const userIdNum = useMemo(() => {
    const n = Number(user?.id);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  }, [user?.id]);

  const [step, setStep] = useState<"idle" | "intent" | "hash">("idle");
  const [amountBrl, setAmountBrl] = useState<number>(100);
  const [depositId, setDepositId] = useState<number | null>(null);
  const [txHash, setTxHash] = useState<string>("");
  const [address, setAddress] = useState<string>("");

  const custody = (trpc as any).btcCustody?.getCustodyInfo?.useQuery?.(undefined, {
    retry: false,
  });
  const deposits = (trpc as any).btcCustody?.listMyDeposits?.useQuery?.(
    userIdNum ? { userId: userIdNum, limit: 10 } : undefined,
    { retry: false, refetchInterval: 30_000 }
  );
  const createIntent = (trpc as any).btcCustody?.createDepositIntent?.useMutation?.();
  const submitHash = (trpc as any).btcCustody?.submitDepositHash?.useMutation?.();

  // Cotação indicativa (usa Payments existente ou fallback)
  const btcQuote = (trpc as any).payments?.getBtcQuote?.useQuery?.(undefined, {
    retry: false, refetchInterval: 30_000,
  });
  const btcPriceBrl: number = Number(btcQuote?.data?.brlPerBtc ?? 327712);
  const amountBtc = amountBrl / btcPriceBrl;

  const info = custody?.data;
  const custodyAddress = info?.address || "";
  const terms = info?.terms || { freezeDays: 90, withdrawDelayDays: 5, minDepositBrl: 50 };

  const handleCreateIntent = async () => {
    if (!userIdNum) {
      toast.error("Faça login para gerar um aporte.");
      return;
    }
    if (amountBrl < terms.minDepositBrl) {
      toast.error(`Aporte mínimo: R$ ${terms.minDepositBrl}`);
      return;
    }
    try {
      const res = await createIntent?.mutateAsync({
        userId: userIdNum,
        amountBrlCents: Math.round(amountBrl * 100),
        amountBtc,
        btcQuoteBrl: btcPriceBrl,
      });
      if (res?.ok) {
        setDepositId(res.depositId);
        setAddress(res.address);
        setStep("hash");
        toast.success("Solicitação de aporte criada! Envie o valor e cole o hash abaixo.");
      } else {
        toast.error(res?.error || "Falha ao gerar aporte");
      }
    } catch (e: any) {
      toast.error(e?.message || "Erro");
    }
  };

  const handleSubmitHash = async () => {
    if (!depositId || !txHash) return;
    if (txHash.length < 60) {
      toast.error("Hash BTC deve ter 64 caracteres hexadecimais.");
      return;
    }
    try {
      const res = await submitHash?.mutateAsync({
        depositId,
        txHash: txHash.trim(),
        userId: userIdNum,
      });
      if (res?.ok) {
        toast.success("Hash registrado! Aguarde confirmação on-chain.");
        setStep("idle");
        setDepositId(null);
        setTxHash("");
        deposits?.refetch?.();
      } else {
        toast.error(res?.error || "Falha ao registrar hash");
      }
    } catch (e: any) {
      toast.error(e?.message || "Erro");
    }
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(custodyAddress || address);
      toast.success("Endereço copiado!");
    } catch {
      toast.error("Não foi possível copiar");
    }
  };

  const fmt = (c: number) =>
    (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const statusInfo = deposits?.data?.summary || {};

  return (
    <div className="space-y-4">
      {/* Header + endereço + termos */}
      <div className="rounded-lg border border-amber-400/30 bg-gradient-to-br from-amber-500/10 via-obsidian-900/60 to-obsidian-900/40 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-amber-300">
              // CUSTÓDIA_BINANCE · REGULADA
            </p>
            <div className="mt-1 flex items-center gap-2">
              <Bitcoin size={22} className="text-amber-300" />
              <h3 className="text-lg font-bold text-white">
                Carteira de Custódia BTC
              </h3>
            </div>
          </div>
          <ShieldCheck size={22} className="text-emerald-400" />
        </div>

        <div className="mt-4 rounded border border-amber-400/25 bg-obsidian-900/60 p-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
            Endereço de custódia (BTC Mainnet)
          </p>
          <div className="mt-1 flex items-center gap-2">
            <code className="flex-1 truncate rounded bg-obsidian-950 px-2 py-1 font-mono text-[11px] text-amber-200">
              {custodyAddress || "carregando..."}
            </code>
            <button
              type="button"
              onClick={copyAddress}
              disabled={!custodyAddress}
              className="inline-flex items-center gap-1 rounded border border-amber-400/40 bg-amber-400/10 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-amber-300 transition hover:bg-amber-400/20 disabled:opacity-40"
            >
              <Copy size={11} />
              Copiar
            </button>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-3">
          <div className="rounded border border-white/5 bg-obsidian-900/40 p-3">
            <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
              Congelamento
            </p>
            <p className="mt-0.5 text-sm font-semibold text-white">
              {terms.freezeDays} dias
            </p>
          </div>
          <div className="rounded border border-white/5 bg-obsidian-900/40 p-3">
            <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
              Retirada
            </p>
            <p className="mt-0.5 text-sm font-semibold text-white">
              D+{terms.withdrawDelayDays}
            </p>
          </div>
          <div className="rounded border border-white/5 bg-obsidian-900/40 p-3">
            <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
              Mínimo
            </p>
            <p className="mt-0.5 text-sm font-semibold text-white">
              R$ {terms.minDepositBrl}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-start gap-2 rounded border border-amber-400/20 bg-amber-400/5 p-2 text-[10px] text-amber-100/80">
          <AlertTriangle size={12} className="mt-0.5 shrink-0" />
          <span>
            {info?.disclaimer ||
              "Custódia integral pela Binance. Aportes congelados por 90 dias, retiradas D+5."}
          </span>
        </div>
      </div>

      {/* Aporte: 3 passos */}
      <div className="rounded-lg border border-obsidian-700 bg-obsidian-900/30 p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-quantum-cyan">
          // NOVO_APORTE
        </p>
        <h3 className="mt-1 text-lg font-bold text-white">
          Enviar BTC para sua Custódia
        </h3>

        {step !== "hash" && (
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
                Valor em BRL (mínimo R$ {terms.minDepositBrl})
              </label>
              <input
                type="number"
                min={terms.minDepositBrl}
                step={10}
                value={amountBrl}
                onChange={(e) => setAmountBrl(Number(e.target.value) || 0)}
                className="mt-1 w-full rounded border border-obsidian-600 bg-obsidian-950 px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
                Equivalente em BTC (1 BTC = R$ {btcPriceBrl.toLocaleString("pt-BR")})
              </label>
              <div className="mt-1 rounded border border-amber-400/25 bg-obsidian-950 px-3 py-2 font-mono text-amber-200">
                {amountBtc.toFixed(8)} BTC
              </div>
            </div>
            <button
              type="button"
              onClick={handleCreateIntent}
              disabled={createIntent?.isPending}
              className="md:col-span-2 inline-flex items-center justify-center gap-2 rounded bg-amber-400 px-4 py-2 font-mono text-sm font-semibold uppercase tracking-widest text-obsidian transition hover:bg-amber-300 disabled:opacity-50"
            >
              <Bitcoin size={14} />
              {createIntent?.isPending ? "Gerando..." : "Gerar Solicitação de Aporte"}
            </button>
          </div>
        )}

        {step === "hash" && (
          <div className="mt-4 space-y-3">
            <div className="rounded border border-quantum-cyan/30 bg-quantum-cyan/5 p-3 text-[12px] text-slate-200">
              <p className="font-mono text-[10px] uppercase tracking-widest text-quantum-cyan">
                // PASSO 2: envie o BTC da SUA carteira para o endereço acima
              </p>
              <p className="mt-1">
                Valor: <strong>{amountBtc.toFixed(8)} BTC</strong> ({fmt(Math.round(amountBrl * 100))})
              </p>
              <p className="mt-1 text-slate-400">
                Após enviar, cole o hash da transação abaixo. O sistema confirma automaticamente on-chain.
              </p>
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
                <Hash size={11} className="inline mr-1" />
                Hash da transação (txid, 64 caracteres hex)
              </label>
              <input
                type="text"
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                placeholder="ex: 4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b"
                className="mt-1 w-full rounded border border-obsidian-600 bg-obsidian-950 px-3 py-2 font-mono text-[11px] text-white"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSubmitHash}
                disabled={submitHash?.isPending || txHash.length < 60}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded bg-emerald-500 px-4 py-2 font-mono text-sm font-semibold uppercase tracking-widest text-white transition hover:bg-emerald-400 disabled:opacity-50"
              >
                <CheckCircle2 size={14} />
                Registrar Hash
              </button>
              <button
                type="button"
                onClick={() => { setStep("idle"); setDepositId(null); setTxHash(""); }}
                className="rounded border border-obsidian-600 px-3 py-2 font-mono text-[11px] uppercase tracking-widest text-slate-400 transition hover:bg-obsidian-800"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Histórico Bitcoin */}
      <div className="rounded-lg border border-obsidian-700 bg-obsidian-900/30 p-5">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-amber-300">
            // HISTÓRICO_BITCOIN
          </p>
          <div className="flex gap-2 font-mono text-[10px]">
            <span className="text-emerald-300">✓ {statusInfo.confirmedCount || 0}</span>
            <span className="text-amber-300">⏳ {statusInfo.pendingCount || 0}</span>
            <span className="text-slate-400">⧗ {statusInfo.awaitingCount || 0}</span>
          </div>
        </div>

        <p className="mt-2 text-xs text-slate-400">
          Total consolidado: <strong className="text-white">{Number(statusInfo.totalBtc || 0).toFixed(8)} BTC</strong>
          {statusInfo.totalBrlCents ? ` · ${fmt(statusInfo.totalBrlCents)}` : ""}
        </p>

        <div className="mt-3 space-y-2">
          {(deposits?.data?.deposits || []).length === 0 && (
            <p className="py-6 text-center text-xs text-slate-500">
              Nenhum aporte ainda. Faça seu primeiro depósito acima!
            </p>
          )}
          {(deposits?.data?.deposits || []).map((d: any) => (
            <div key={d.id} className="flex items-center justify-between gap-3 rounded border border-obsidian-700 bg-obsidian-900/50 p-3 text-[12px]">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-amber-200 tabular-nums">
                    {Number(d.amount_btc).toFixed(8)} BTC
                  </span>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-400">{fmt(Number(d.amount_brl_cents))}</span>
                </div>
                {d.tx_hash && (
                  <p className="truncate font-mono text-[10px] text-slate-500">
                    txid: {d.tx_hash.slice(0, 20)}...{d.tx_hash.slice(-6)}
                  </p>
                )}
                <p className="mt-0.5 text-[10px] text-slate-500">
                  {new Date(d.created_at).toLocaleString("pt-BR")}
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest ${
                  d.status === "confirmed"
                    ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                    : d.status === "pending_confirmation"
                    ? "border-amber-400/40 bg-amber-400/10 text-amber-300"
                    : "border-slate-500/40 bg-slate-500/10 text-slate-300"
                }`}
              >
                {d.status === "confirmed" ? "Confirmado" :
                 d.status === "pending_confirmation" ? "Aguardando confirmação" :
                 "Aguardando hash"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
