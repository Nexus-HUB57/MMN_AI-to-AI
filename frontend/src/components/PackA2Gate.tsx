import { useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/contexts/AuthContext";
import { CheckCircle2, ShoppingBag, Package } from "lucide-react";
import { Link } from "wouter";

/**
 * PackA2Gate (Onda 19) — Bloqueia recompra do Pack A²
 * ---------------------------------------------------------------------------
 * Regra de negócio: cada afiliado tem direito a UM único Pack A² por CPF
 * (exceto SiSu onde ganha packs adicionais).
 *
 * Este componente é usado no PixCheckout.tsx. Se o usuário já possui o
 * Pack A² ativo, exibe uma mensagem de bloqueio ao invés do formulário.
 *
 * Uso:
 *   const { blocked, reason, packInfo } = usePackA2Gate();
 *   if (blocked) return <PackA2AlreadyOwnedCard packInfo={packInfo} />;
 */

export function usePackA2Gate() {
  const { user } = useAuth();
  const userIdNum = useMemo(() => {
    const n = Number(user?.id);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  }, [user?.id]);

  const q = (trpc as any).packEntitlements?.checkPackA2Ownership?.useQuery?.(
    userIdNum ? { userId: userIdNum } : undefined,
    { retry: false, staleTime: 60_000 }
  );

  const data = q?.data;
  const hasPackA2 = !!data?.hasPackA2;
  return {
    isLoading: !!q?.isLoading,
    blocked: hasPackA2,
    reason: hasPackA2 ? "already_owned" : "eligible",
    packInfo: hasPackA2
      ? {
          packName: data?.packName || "Pack Agente Afiliado A²",
          packCode: data?.packCode || "A²",
          activatedAt: data?.activatedAt,
          expiresAt: data?.expiresAt,
        }
      : null,
    refetch: q?.refetch,
  };
}

export function PackA2AlreadyOwnedCard({ packInfo }: { packInfo: any }) {
  const activatedDate = packInfo?.activatedAt
    ? new Date(packInfo.activatedAt).toLocaleDateString("pt-BR")
    : null;

  return (
    <div className="mx-auto max-w-2xl rounded-lg border border-emerald-400/40 bg-gradient-to-br from-emerald-500/10 via-obsidian-900/60 to-obsidian-900/40 p-6">
      <div className="flex items-start gap-3">
        <div className="rounded-full border border-emerald-400/50 bg-emerald-400/15 p-3 text-emerald-300">
          <CheckCircle2 size={22} />
        </div>
        <div className="flex-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-emerald-300">
            // PACK_A2 · JÁ_ATIVADO
          </p>
          <h2 className="mt-1 text-xl font-bold text-white">
            Você já possui o {packInfo?.packName || "Pack Agente Afiliado A²"}
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            Cada afiliado tem direito a <strong className="text-emerald-200">um único Pack A²</strong> por CPF.
            {activatedDate && (
              <>
                {" "}Sua ativação foi em <strong>{activatedDate}</strong>.
              </>
            )}
          </p>
          <p className="mt-2 text-xs text-slate-400">
            Para novos packs, aguarde a próxima liberação SiSu ou consulte o
            catálogo de expansão no Marketplace Nexus.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/estoque"
              className="inline-flex items-center gap-2 rounded border border-emerald-400/40 bg-emerald-400/10 px-3 py-2 font-mono text-[11px] uppercase tracking-widest text-emerald-200 transition hover:bg-emerald-400/20"
            >
              <Package size={12} />
              Ver Meu Estoque
            </Link>
            <Link
              href="/marketplaces/ebooks"
              className="inline-flex items-center gap-2 rounded border border-quantum-cyan/40 bg-quantum-cyan/10 px-3 py-2 font-mono text-[11px] uppercase tracking-widest text-quantum-cyan transition hover:bg-quantum-cyan/20"
            >
              <ShoppingBag size={12} />
              Explorar Marketplace
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded border border-obsidian-600 bg-obsidian-800/60 px-3 py-2 font-mono text-[11px] uppercase tracking-widest text-slate-300 transition hover:bg-obsidian-800"
            >
              Voltar ao Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PackA2Gate;
