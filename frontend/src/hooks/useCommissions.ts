/**
 * useCommissions — hook real conectado a trpc.dashboard.getMyDashboard
 * Mapeia `recentOrders` + `pendingCommissions` em uma lista compatível com CommissionChart.
 * Fallback automático para [] quando sem sessão ou backend indisponível.
 */
import { trpc } from "../lib/trpc";

type HookCommissionStatus = "pending" | "approved" | "paid";

type HookCommission = {
  id: string;
  amount: number;
  date: string;
  status: HookCommissionStatus;
  source: string;
};

const STATUS_MAP: Record<string, HookCommissionStatus> = {
  paid: "paid",
  confirmed: "approved",
  approved: "approved",
  completed: "paid",
  pending: "pending",
};

export const useCommissions = () => {
  const q = trpc.dashboard.getMyDashboard.useQuery(undefined, {
    retry: false,
    staleTime: 60_000,
  });

  if (q.isLoading) {
    return { commissions: [] as HookCommission[], isLoading: true, error: null };
  }
  // Erros (sem sessão, sem afiliado, etc.) → estado vazio silencioso (UX preferido)
  if (q.error || !q.data) {
    return { commissions: [] as HookCommission[], isLoading: false, error: null };
  }

  const d: any = q.data;
  const orders: any[] = Array.isArray(d.recentOrders) ? d.recentOrders : [];

  const commissions: HookCommission[] = orders.map((o, idx) => ({
    id: String(o.id ?? `order-${idx}`),
    amount: Number(o.commissionAmount ?? o.amount ?? 0) / 100 || 0,
    date: o.createdAt ? String(o.createdAt).slice(0, 10) : "",
    status: STATUS_MAP[String(o.status || "pending").toLowerCase()] ?? "pending",
    source: o.productName ? `Pedido · ${o.productName}` : "Pedido marketplace",
  }));

  // Inclui linha agregadora se backend reportou comissão consolidada
  const totalPending = Number(d.pendingCommissions ?? 0);
  if (commissions.length === 0 && totalPending > 0) {
    commissions.push({
      id: "agg-pending",
      amount: totalPending / 100,
      date: new Date().toISOString().slice(0, 10),
      status: "pending",
      source: "Comissões pendentes consolidadas",
    });
  }

  return { commissions, isLoading: false, error: null };
};
