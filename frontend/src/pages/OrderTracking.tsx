import DashboardLayout from "@/components/DashboardLayout";
import { useLocation, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, Clock, Home, Loader2, Package, Truck, XCircle } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  pending: { label: "Pendente", className: "border-amber-400/30 bg-amber-400/10 text-amber-200", icon: Clock },
  confirmed: { label: "Confirmado", className: "border-sky-400/30 bg-sky-400/10 text-sky-200", icon: CheckCircle2 },
  shipped: { label: "Enviado", className: "border-violet-400/30 bg-violet-400/10 text-violet-200", icon: Truck },
  delivered: { label: "Entregue", className: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200", icon: Home },
  cancelled: { label: "Cancelado", className: "border-rose-400/30 bg-rose-400/10 text-rose-200", icon: XCircle },
  refunded: { label: "Reembolsado", className: "border-orange-400/30 bg-orange-400/10 text-orange-200", icon: XCircle },
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value || 0));
}

export default function OrderTracking() {
  const { orderId } = useParams<{ orderId: string }>();
  const [, navigate] = useLocation();

  const { data: order, isLoading, error } = trpc.dropshipping.getOrderDetails.useQuery(
    { orderId: Number(orderId) },
    { enabled: Boolean(orderId) && !Number.isNaN(Number(orderId)) },
  );

  const status = STATUS_CONFIG[order?.status || "pending"] || STATUS_CONFIG.pending;
  const StatusIcon = status.icon;

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-8">
        <section className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(0,229,255,0.15),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(124,255,178,0.12),transparent_30%),linear-gradient(180deg,rgba(15,23,42,0.94),rgba(2,6,23,0.98))] p-6 shadow-2xl shadow-black/30 md:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <Badge className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">Rastreamento de pedido</Badge>
              <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl">Acompanhe o status do pedido</h1>
              <p className="max-w-3xl text-base leading-7 text-slate-300 md:text-lg">
                Consulte o estágio atual do pedido, dados do cliente e detalhes do produto vinculado à operação de dropshipping.
              </p>
            </div>
            <Button variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={() => navigate("/dropshipping/orders")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para pedidos
            </Button>
          </div>
        </section>

        {isLoading ? (
          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardContent className="flex items-center justify-center py-14 text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin" />
            </CardContent>
          </Card>
        ) : error || !order ? (
          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardContent className="flex flex-col items-center justify-center gap-3 py-14 text-center text-slate-400">
              <Package className="h-12 w-12 opacity-30" />
              <p>Pedido não encontrado ou indisponível para o afiliado logado.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <Card className="border-white/10 bg-white/5 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <StatusIcon className="h-5 w-5 text-quantum-cyan" />
                    Status atual do pedido #{order.id}
                  </CardTitle>
                  <CardDescription className="text-slate-400">Código externo {order.externalOrderId}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge className={`border ${status.className}`}>{status.label}</Badge>
                    <Badge className="border border-white/10 bg-white/5 text-slate-200">Marketplace {order.marketplace}</Badge>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Metric label="Valor do pedido" value={formatCurrency(order.amount)} />
                    <Metric label="Comissão" value={formatCurrency(order.commissionAmount)} />
                    <Metric label="Criado em" value={new Date(order.createdAt).toLocaleDateString("pt-BR")} />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-white/5 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-white">Produto vinculado</CardTitle>
                  <CardDescription className="text-slate-400">Informações do catálogo associado ao pedido.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {order.product ? (
                    <>
                      <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                        <p className="text-lg font-semibold text-white">{order.product.title}</p>
                        <p className="mt-2 text-sm text-slate-400">Marketplace {order.product.marketplace}</p>
                      </div>
                      <Metric label="Preço do produto" value={formatCurrency(order.product.price)} />
                    </>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-black/25 p-5 text-sm text-slate-400">
                      Produto original não localizado na base atual.
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
              <Card className="border-white/10 bg-white/5 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-white">Cliente</CardTitle>
                  <CardDescription className="text-slate-400">Dados de contato usados no registro do pedido.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Metric label="Nome" value={order.customerName || "—"} />
                  <Metric label="Email" value={order.customerEmail || "—"} />
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-white/5 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-white">Entrega</CardTitle>
                  <CardDescription className="text-slate-400">Endereço informado no momento da criação.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm leading-6 text-slate-300 whitespace-pre-wrap">
                    {order.shippingAddress || "Endereço não informado."}
                  </div>
                </CardContent>
              </Card>
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
      <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">{label}</p>
      <p className="mt-2 text-base font-semibold text-white break-all">{value}</p>
    </div>
  );
}
