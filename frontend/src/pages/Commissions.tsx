import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  DollarSign,
  Loader2,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useState } from "react";

type CommissionStatus = "pending" | "confirmed" | "paid" | "cancelled";

const STATUS_LABELS: Record<CommissionStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: {
    label: "Pendente",
    color: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    icon: <Clock className="w-3 h-3" />,
  },
  confirmed: {
    label: "Confirmada",
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  paid: {
    label: "Paga",
    color: "bg-green-500/20 text-green-400 border-green-500/30",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  cancelled: {
    label: "Cancelada",
    color: "bg-red-500/20 text-red-400 border-red-500/30",
    icon: <XCircle className="w-3 h-3" />,
  },
};

function formatCurrency(value: number | string | null | undefined) {
  const num = Number(value ?? 0);
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(num);
}

function formatPercentage(value: number) {
  return `${(value * 100).toFixed(0).replace(".", ",")}%`;
}

export default function Commissions() {
  const [statusFilter, setStatusFilter] = useState<CommissionStatus | "all">("all");
  const [page, setPage] = useState(1);

  const commissionsQuery = trpc.commissions.list.useQuery({
    page,
    limit: 20,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const statsQuery = trpc.commissions.getStats.useQuery();
  const catalogQuery = trpc.subscriptions.catalog.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
  });

  const commissions = commissionsQuery.data?.commissions ?? [];
  const pagination = commissionsQuery.data?.pagination;
  const stats = statsQuery.data;

  const statCards = [
    {
      label: "Total Gerado",
      value: formatCurrency(stats?.total),
      icon: <DollarSign className="w-5 h-5" />,
      color: "from-accent-cyan to-blue-600",
      sub: `${stats?.count?.total ?? 0} comissões`,
    },
    {
      label: "Pendentes",
      value: formatCurrency(stats?.pending),
      icon: <Clock className="w-5 h-5" />,
      color: "from-amber-500 to-orange-500",
      sub: `${stats?.count?.pending ?? 0} aguardando`,
    },
    {
      label: "Confirmadas",
      value: formatCurrency(stats?.confirmed),
      icon: <CheckCircle2 className="w-5 h-5" />,
      color: "from-blue-500 to-indigo-600",
      sub: `${stats?.count?.confirmed ?? 0} confirmadas`,
    },
    {
      label: "Pagas",
      value: formatCurrency(stats?.paid),
      icon: <TrendingUp className="w-5 h-5" />,
      color: "from-accent-green to-emerald-600",
      sub: `${stats?.count?.paid ?? 0} liquidadas`,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">
            Comissões
          </h1>
          <p className="text-text-secondary">
            Acompanhe suas comissões por nível, status e performance
          </p>
        </div>

        {catalogQuery.data?.plans?.length ? (
          <div className="grid gap-4 lg:grid-cols-3">
            {(catalogQuery.data.plans as Array<any>).map((plan) => (
              <Card key={plan.id} className="p-5 border-border/60 bg-card/70">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-text-muted">Nexus Partners Pack</p>
                    <h2 className="mt-2 text-lg font-semibold text-foreground">{plan.fullName}</h2>
                  </div>
                  <Badge variant="outline">Comissão mensal</Badge>
                </div>
                <p className="mt-3 text-sm text-text-secondary">
                  {plan.commissionModel?.eligibility ?? "Afiliados elegíveis do Nexus Partners Pack"}
                </p>
                <div className="mt-4 grid gap-2">
                  {Object.entries(plan.commissionModel?.byTerm ?? {})
                    .sort((a, b) => Number(a[0]) - Number(b[0]))
                    .map(([term, rate]) => (
                      <div key={`${plan.id}-${term}`} className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/40 px-3 py-2 text-sm">
                        <span className="text-text-secondary">{term} meses</span>
                        <span className="font-semibold text-emerald-400">{formatPercentage(Number(rate))}</span>
                      </div>
                    ))}
                </div>
              </Card>
            ))}
          </div>
        ) : null}

        {/* Stats Cards */}
        {statsQuery.isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="p-5 animate-pulse bg-card/50">
                <div className="h-4 bg-muted rounded w-2/3 mb-3" />
                <div className="h-7 bg-muted rounded w-1/2 mb-2" />
                <div className="h-3 bg-muted rounded w-1/3" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((card) => (
              <Card
                key={card.label}
                className="p-5 border-border/60 bg-card/70 hover:bg-card transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-text-secondary">{card.label}</span>
                  <div
                    className={`w-9 h-9 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center text-white`}
                  >
                    {card.icon}
                  </div>
                </div>
                <p className="text-xl font-bold text-foreground">{card.value}</p>
                <p className="text-xs text-text-muted mt-1">{card.sub}</p>
              </Card>
            ))}
          </div>
        )}

        {/* Commission by Level */}
        {stats?.byLevel && (
          <Card className="p-6 border-border/60 bg-card/70">
            <h2 className="text-base font-semibold text-foreground mb-4">
              Distribuição por Nível MMN
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {Object.entries(stats.byLevel).map(([level, amount]) => (
                <div
                  key={level}
                  className="bg-muted/50 rounded-lg p-3 text-center border border-border/40"
                >
                  <p className="text-xs text-text-muted mb-1 capitalize">{level}</p>
                  <p className="text-sm font-bold text-accent-cyan">
                    {formatCurrency(amount as number)}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Filters */}
        <div className="flex items-center gap-3">
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v as CommissionStatus | "all");
              setPage(1);
            }}
          >
            <SelectTrigger className="w-44 bg-card border-border">
              <SelectValue placeholder="Filtrar status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="confirmed">Confirmada</SelectItem>
              <SelectItem value="paid">Paga</SelectItem>
              <SelectItem value="cancelled">Cancelada</SelectItem>
            </SelectContent>
          </Select>

          {pagination && (
            <span className="text-sm text-text-secondary ml-auto">
              {pagination.total} comissões encontradas
            </span>
          )}
        </div>

        {/* Table */}
        <Card className="border-border/60 bg-card/70 overflow-hidden">
          {commissionsQuery.isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-accent-cyan" />
            </div>
          ) : commissionsQuery.isError ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-text-secondary">
              <AlertCircle className="w-10 h-10 text-red-400" />
              <p>Erro ao carregar comissões. Tente novamente.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => commissionsQuery.refetch()}
              >
                Tentar novamente
              </Button>
            </div>
          ) : commissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-text-secondary">
              <TrendingUp className="w-10 h-10 opacity-40" />
              <p>Nenhuma comissão encontrada para os filtros atuais.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                      Descrição
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                      Nível
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                      Data
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {commissions.map((commission) => {
                    const status = (commission.status as CommissionStatus) ?? "pending";
                    const statusInfo = STATUS_LABELS[status] ?? STATUS_LABELS.pending;
                    return (
                      <tr
                        key={commission.id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-5 py-3.5 text-sm text-text-secondary font-mono">
                          #{commission.id}
                        </td>
                        <td className="px-5 py-3.5 text-sm text-foreground max-w-xs truncate">
                          {(commission as any).description ?? "Comissão MMN"}
                        </td>
                        <td className="px-5 py-3.5 text-sm text-text-secondary">
                          Nível {(commission as any).level ?? "—"}
                        </td>
                        <td className="px-5 py-3.5 text-sm font-semibold text-accent-cyan">
                          {formatCurrency(commission.amount)}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}
                          >
                            {statusInfo.icon}
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-text-secondary">
                          {commission.createdAt
                            ? new Date(commission.createdAt).toLocaleDateString("pt-BR")
                            : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="border-border"
            >
              Anterior
            </Button>
            <span className="text-sm text-text-secondary">
              Página {page} de {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages}
              className="border-border"
            >
              Próxima
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
