// SPRINT8_SALES_FUNNEL_V1
import { trpc } from "../lib/trpc";

export default function SalesFunnelDashboard() {
  const orders = trpc.marketplaceNexus.getOrders.useQuery();
  const total = orders.data?.length || 0;
  const paid = orders.data?.filter((o: any) => o.status === "paid").length || 0;
  const pending = orders.data?.filter((o: any) => o.status === "pending").length || 0;
  const conversion = total > 0 ? ((paid / total) * 100).toFixed(1) : "0";

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-800">
      <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
        📊 Funil de Vendas
      </h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-3xl font-bold text-blue-600">{total}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Pedidos</div>
        </div>
        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-3xl font-bold text-green-600">{paid}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Pagos</div>
        </div>
        <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
          <div className="text-3xl font-bold text-amber-600">{pending}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Pendentes</div>
        </div>
      </div>
      <div className="mt-4 text-center">
        <div className="text-sm text-gray-600 dark:text-gray-400">Taxa de Conversão</div>
        <div className="text-2xl font-bold text-purple-600">{conversion}%</div>
      </div>
    </div>
  );
}
