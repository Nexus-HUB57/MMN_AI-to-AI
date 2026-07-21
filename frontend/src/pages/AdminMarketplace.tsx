import { useMemo, useState } from "react";
import { ShoppingCart, TrendingUp, Users, Wallet, RefreshCw, CreditCard, Clock } from "lucide-react";
import AdminDashboardLayout from "./AdminDashboardLayout";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const PERIODS = [7, 14, 30, 60, 90];

function brl(cents: number) {
  const value = Number(cents || 0) / 100;
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function fmtDate(v?: string | null) {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleString("pt-BR");
}

export default function AdminMarketplace() {
  const [period, setPeriod] = useState<number>(30);
  const q = trpc.admin.marketplaceStats.useQuery({ periodDays: period }, { refetchInterval: 30000 });
  const data = q.data;

  const conversion = useMemo(() => {
    if (!data?.totals) return 0;
    const total = data.totals.totalOrders || 0;
    if (!total) return 0;
    return Math.round((data.totals.paidOrders / total) * 100);
  }, [data]);

  const maxDayGross = useMemo(() => {
    const arr = data?.byDay || [];
    return Math.max(1, ...arr.map((d: any) => Number(d.grossCents || 0)));
  }, [data]);

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Admin Marketplace</h1>
            <p className="text-sm text-slate-600">
              Observabilidade comercial: receita, pedidos, ticket médio, compradores e métodos de pagamento.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {PERIODS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`rounded-full border px-3 py-1 text-sm transition ${period === p ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"}`}
              >
                {p}d
              </button>
            ))}
            <Button variant="outline" onClick={() => q.refetch()} disabled={q.isFetching}>
              <RefreshCw className="mr-2 h-4 w-4" /> Atualizar
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="p-5">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-sm">Receita ({period}d)</span>
              <Wallet className="h-4 w-4" />
            </div>
            <div className="mt-3 text-3xl font-semibold text-slate-900">{brl(data?.totals?.grossPeriodCents || 0)}</div>
            <p className="mt-2 text-xs text-slate-500">{data?.totals?.paidPeriodOrders || 0} pedidos pagos no período</p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-sm">Receita total (histórica)</span>
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="mt-3 text-3xl font-semibold text-slate-900">{brl(data?.totals?.grossPaidCents || 0)}</div>
            <p className="mt-2 text-xs text-slate-500">Ticket médio {brl(data?.totals?.avgTicketCents || 0)}</p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-sm">Compradores únicos</span>
              <Users className="h-4 w-4" />
            </div>
            <div className="mt-3 text-3xl font-semibold text-slate-900">{data?.totals?.uniqueBuyers || 0}</div>
            <p className="mt-2 text-xs text-slate-500">Conversão global {conversion}%</p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-sm">Hoje</span>
              <ShoppingCart className="h-4 w-4" />
            </div>
            <div className="mt-3 text-3xl font-semibold text-slate-900">{data?.totals?.paidToday || 0}</div>
            <p className="mt-2 text-xs text-slate-500">Receita hoje {brl(data?.totals?.grossTodayCents || 0)}</p>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Receita diária ({period} dias)</h2>
                <p className="text-sm text-slate-500">Baseado em pedidos pagos, aprovados ou entregues (excluindo testes)</p>
              </div>
              <Badge variant="secondary">{data?.byDay?.length || 0} dias com vendas</Badge>
            </div>
            <div className="mt-4 space-y-2">
              {(data?.byDay || []).length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 p-6 text-sm text-slate-500">
                  Ainda não há vendas confirmadas no período selecionado.
                </div>
              ) : (
                (data?.byDay || []).map((d: any) => {
                  const pct = Math.max(3, Math.round((Number(d.grossCents || 0) / maxDayGross) * 100));
                  return (
                    <div key={d.day} className="flex items-center gap-3">
                      <span className="w-24 text-xs text-slate-500">{d.day}</span>
                      <div className="relative h-6 flex-1 rounded bg-slate-100 overflow-hidden">
                        <div className="h-full rounded bg-slate-900/80" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-28 text-right text-xs text-slate-700">{brl(d.grossCents)}</span>
                      <span className="w-16 text-right text-xs text-slate-500">{d.orders} ped.</span>
                    </div>
                  );
                })
              )}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Por método de pagamento</h2>
                <p className="text-sm text-slate-500">Distribuição histórica de pedidos confirmados</p>
              </div>
              <CreditCard className="h-4 w-4 text-slate-500" />
            </div>
            <div className="mt-4 space-y-3">
              {(data?.byMethod || []).length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 p-6 text-sm text-slate-500">
                  Sem métodos de pagamento registrados ainda.
                </div>
              ) : (
                (data?.byMethod || []).map((m: any) => (
                  <div key={m.method} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{m.method}</p>
                      <p className="text-xs text-slate-500">{m.total} pedidos</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900">{brl(m.grossCents)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Top compradores</h2>
                <p className="text-sm text-slate-500">Ranqueamento por volume total pago</p>
              </div>
              <Users className="h-4 w-4 text-slate-500" />
            </div>
            <div className="mt-4 space-y-2">
              {(data?.topBuyers || []).length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 p-6 text-sm text-slate-500">
                  Sem compradores registrados ainda.
                </div>
              ) : (
                (data?.topBuyers || []).map((b: any, idx: number) => (
                  <div key={`${b.userId}-${idx}`} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 border border-slate-100">
                    <div>
                      <p className="text-sm font-medium text-slate-900">#{idx + 1} · {b.name}</p>
                      <p className="text-xs text-slate-500">{b.email || `user#${b.userId}`} · {b.orders} pedidos</p>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{brl(b.grossCents)}</p>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Pedidos recentes</h2>
                <p className="text-sm text-slate-500">Últimos 15 pedidos reais do marketplace</p>
              </div>
              <Clock className="h-4 w-4 text-slate-500" />
            </div>
            <div className="mt-4 space-y-2">
              {(data?.recent || []).length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 p-6 text-sm text-slate-500">
                  Sem pedidos recentes disponíveis.
                </div>
              ) : (
                (data?.recent || []).map((o: any) => {
                  const tone = (o.paymentStatus === "paid" || o.paymentStatus === "approved" || o.status === "delivered")
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : (o.paymentStatus === "pending")
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-slate-100 text-slate-700 border-slate-200";
                  return (
                    <div key={o.id} className="rounded-lg border border-slate-100 bg-white p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{o.name || `user#${o.userId}`}</p>
                          <p className="text-xs text-slate-500">{o.email || ""} · {fmtDate(o.at)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={tone}>{o.paymentStatus || o.status || "n/a"}</Badge>
                          <Badge variant="outline">{o.method || "—"}</Badge>
                          <span className="text-sm font-semibold text-slate-900">{brl(o.totalCents)}</span>
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-slate-400 truncate">#{o.id}</p>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
