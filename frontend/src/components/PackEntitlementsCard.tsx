/**
 * PackEntitlementsCard — visualização das entregas reais de Pack/Upgrade ao usuário.
 *
 * Lê `packEntitlements.listMyGrants` + `packEntitlements.listMyLibrary` e
 * mostra:
 *   - Cards de cada Pack adquirido (com quota / pool / status)
 *   - Lista resumida dos últimos 10 e-books sincronizados
 *   - Botão "Re-entregar" se faltou ebook (sorteia mais do pool)
 *   - Toast/alerta visual quando há grants novos
 *
 * Plug-and-play: importar e adicionar `<PackEntitlementsCard variant="full" />`
 * na página `/packs`, `/estoque` ou `/minha-loja`.
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Variant = "full" | "compact";

export default function PackEntitlementsCard({ variant = "full" }: { variant?: Variant }) {
  const grantsQuery = (trpc as any).packEntitlements?.listMyGrants?.useQuery
    ? (trpc as any).packEntitlements.listMyGrants.useQuery(undefined, { staleTime: 30_000 })
    : { data: null, isLoading: false, refetch: () => {} };
  const libraryQuery = (trpc as any).packEntitlements?.listMyLibrary?.useQuery
    ? (trpc as any).packEntitlements.listMyLibrary.useQuery(undefined, { staleTime: 30_000 })
    : { data: null, isLoading: false, refetch: () => {} };
  const redeliverMutation = (trpc as any).packEntitlements?.redeliver?.useMutation
    ? (trpc as any).packEntitlements.redeliver.useMutation()
    : null;

  const [busy, setBusy] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  const grants = (grantsQuery.data?.grants ?? []) as any[];
  const libraryItems = (libraryQuery.data?.items ?? []) as any[];
  const totalEbooks = libraryQuery.data?.total ?? 0;

  const handleRedeliver = async (packSlug: string) => {
    if (!redeliverMutation) return;
    setBusy(packSlug);
    setFeedback(null);
    try {
      const res: any = await redeliverMutation.mutateAsync({ packSlug });
      setFeedback({
        ok: !!res?.ok,
        msg: res?.alreadyGranted
          ? "Nada novo: você já tem todos os ebooks deste pack."
          : `+${res?.delivered ?? 0} ebooks adicionados ao seu estoque.`,
      });
      await grantsQuery.refetch?.();
      await libraryQuery.refetch?.();
    } catch (e: any) {
      setFeedback({ ok: false, msg: e?.message ?? "Falha ao reentregar" });
    } finally {
      setBusy(null);
    }
  };

  // Loading
  if (grantsQuery.isLoading || libraryQuery.isLoading) {
    return (
      <Card className="border-white/10 bg-slate-900/60">
        <CardContent className="p-5">
          <p className="text-sm text-slate-400">⏳ Carregando suas entregas…</p>
        </CardContent>
      </Card>
    );
  }

  // Sem entregas
  if (grants.length === 0 && totalEbooks === 0) {
    return variant === "compact" ? null : (
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-5">
          <Badge className="border border-amber-500/40 bg-amber-500/15 text-amber-300 mb-2">
            ⏳ Aguardando primeiro Pack
          </Badge>
          <h3 className="text-lg font-bold text-white mb-1">
            Seu estoque ainda está vazio
          </h3>
          <p className="text-sm text-slate-300">
            Adquira o Pack Agente Afiliado A² no Marketplace para receber automaticamente
            10 e-books sincronizados após a confirmação do pagamento PIX.
          </p>
          <Button asChild className="mt-3 gradient-btn">
            <a href="/marketplaces">Ver Marketplace Nexus</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="space-y-4">
      {/* Banner principal */}
      <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-quantum-cyan/10">
        <CardContent className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <Badge className="border border-emerald-500/40 bg-emerald-500/15 text-emerald-300 mb-2">
                ✅ {grants.length} Pack(s) ativos · {totalEbooks} e-books sincronizados
              </Badge>
              <h3 className="text-lg font-bold text-white">
                Seu Estoque e sua Loja estão atualizados
              </h3>
              <p className="text-sm text-slate-300 mt-1">
                Os e-books abaixo foram sorteados automaticamente do pool do seu Pack
                e adicionados à sua Loja Virtual (NX{libraryQuery.data?.code ?? ""}).
              </p>
            </div>
          </div>

          {feedback && (
            <div className={`mt-3 rounded-lg border p-2 text-sm ${feedback.ok ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200" : "border-rose-500/40 bg-rose-500/10 text-rose-200"}`}>
              {feedback.ok ? "✅" : "❌"} {feedback.msg}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cards por Pack */}
      {variant === "full" && (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {grants.map((g) => {
            const missing = g.expectedQuota - g.deliveredCount;
            return (
              <Card key={g.id} className="border-white/10 bg-slate-900/60">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-sm font-bold text-white">
                      {g.packSlug.toUpperCase().replace("PACK-", "Pack ")}
                    </h4>
                    <Badge className={`text-[10px] ${g.status === "granted" ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300" : "border-slate-500 bg-slate-500/15 text-slate-300"}`}>
                      {g.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center mb-3">
                    <div className="rounded bg-white/5 p-2">
                      <div className="text-lg font-bold text-quantum-cyan">{g.deliveredCount}</div>
                      <div className="text-[10px] text-slate-400">entregues</div>
                    </div>
                    <div className="rounded bg-white/5 p-2">
                      <div className="text-lg font-bold text-white">{g.expectedQuota}</div>
                      <div className="text-[10px] text-slate-400">esperados</div>
                    </div>
                    <div className="rounded bg-white/5 p-2">
                      <div className="text-lg font-bold text-amber-300">{g.poolSize}</div>
                      <div className="text-[10px] text-slate-400">pool</div>
                    </div>
                  </div>
                  <p className="text-[10px] font-mono text-slate-500 mb-2 truncate">
                    Ref: {g.paymentRef ?? "—"}
                  </p>
                  {missing > 0 && (
                    <Button
                      onClick={() => handleRedeliver(g.packSlug)}
                      disabled={busy === g.packSlug}
                      size="sm"
                      className="w-full text-xs"
                    >
                      {busy === g.packSlug ? "⏳…" : `Reentregar (faltam ${missing})`}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Lista resumida de ebooks */}
      {variant === "full" && libraryItems.length > 0 && (
        <Card className="border-white/10 bg-slate-900/60">
          <CardContent className="p-4">
            <h4 className="text-sm font-bold text-white mb-3">
              📚 E-books sincronizados (mais recentes)
            </h4>
            <div className="grid gap-2 md:grid-cols-2">
              {libraryItems.slice(0, 10).map((it: any, i: number) => (
                <div key={it.slug} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-2 hover:border-quantum-cyan/30 transition">
                  <div className="flex-shrink-0 w-10 h-12 rounded overflow-hidden bg-slate-800">
                    {it.coverPath ? (
                      <img src={it.coverPath} alt="" className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-500">N/A</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{it.title}</p>
                    <p className="text-[10px] text-slate-400 truncate">{it.category}</p>
                  </div>
                  <Badge className="border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan text-[9px]">
                    {it.sourcePackSlug?.replace("pack-", "")}
                  </Badge>
                </div>
              ))}
            </div>
            {libraryItems.length > 10 && (
              <p className="text-xs text-slate-400 mt-3 text-center">
                + {libraryItems.length - 10} outros e-books na sua biblioteca
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </section>
  );
}
