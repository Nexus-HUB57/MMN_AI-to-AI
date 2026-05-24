import { useState, useEffect } from 'react';
import { trpc } from '../lib/trpc';

interface Invoice {
  id: number;
  amount: string;
  description: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  dueDate: Date;
  paidAt: Date | null;
  createdAt: Date;
}

interface BillingHistoryProps {
  userId?: number;
  showStats?: boolean;
}

export function BillingHistory({ userId, showStats = false }: BillingHistoryProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const { data: invoiceData, isLoading } = trpc.billing.listInvoices.useQuery({
    page: 1,
    limit: 50,
  });

  const { data: stats } = trpc.billing.getStats.useQuery(undefined, {
    enabled: showStats,
  });

  useEffect(() => {
    if (invoiceData?.invoices) {
      setInvoices(invoiceData.invoices as Invoice[]);
      setLoading(false);
    }
  }, [invoiceData]);

  const filteredInvoices = filter === 'all'
    ? invoices
    : invoices.filter(inv => inv.status === filter);

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'Pendente',
      paid: 'Pago',
      overdue: 'Vencido',
      cancelled: 'Cancelado',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(parseFloat(value));
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(date));
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {showStats && stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h4 className="text-sm text-gray-500">Total de Faturas</h4>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h4 className="text-sm text-gray-500">Valor Total</h4>
            <p className="text-2xl font-bold">{formatCurrency(String(stats.totalAmount))}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h4 className="text-sm text-gray-500">Recebido</h4>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(String(stats.paidAmount))}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h4 className="text-sm text-gray-500">Pendente</h4>
            <p className="text-2xl font-bold text-yellow-600">{formatCurrency(String(stats.pendingAmount))}</p>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Faturas e Cobranças</h2>
        <div className="flex gap-2">
          {['all', 'pending', 'paid', 'overdue', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === status
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'Todas' : getStatusLabel(status)}
            </button>
          ))}
        </div>
      </div>

      {filteredInvoices.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">Nenhuma fatura encontrada</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descrição</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vencimento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">#{invoice.id}</td>
                  <td className="px-6 py-4 text-sm">{invoice.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                    {formatCurrency(invoice.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(invoice.dueDate)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(invoice.status)}`}>
                      {getStatusLabel(invoice.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {invoice.status === 'pending' && (
                      <button className="text-purple-600 hover:underline">
                        Pagar Agora
                      </button>
                    )}
                    {invoice.status === 'paid' && (
                      <span className="text-gray-500 text-sm">Pago em {formatDate(invoice.paidAt!)}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function BillingAdmin() {
  const { data: stats } = trpc.billing.getStats.useQuery();
  const [page, setPage] = useState(1);

  const { data: invoiceData, isLoading } = trpc.billing.listInvoices.useQuery({
    page,
    limit: 20,
  });

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(parseFloat(value));
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Administração de Cobranças</h2>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-600">Total</p>
            <p className="text-xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <p className="text-sm text-yellow-600">Pendentes</p>
            <p className="text-xl font-bold">{stats.pending}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-green-600">Pagas</p>
            <p className="text-xl font-bold">{stats.paid}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <p className="text-sm text-red-600">Vencidas</p>
            <p className="text-xl font-bold">{stats.overdue}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Canceladas</p>
            <p className="text-xl font-bold">{stats.cancelled}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Usuário</th>
              <th className="px-4 py-3 text-left">Descrição</th>
              <th className="px-4 py-3 text-left">Valor</th>
              <th className="px-4 py-3 text-left">Vencimento</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {invoiceData?.invoices?.map((invoice) => (
              <tr key={invoice.id} className="border-t">
                <td className="px-4 py-3">#{invoice.id}</td>
                <td className="px-4 py-3">User #{invoice.userId}</td>
                <td className="px-4 py-3">{invoice.description}</td>
                <td className="px-4 py-3 font-semibold">{formatCurrency(String(invoice.amount))}</td>
                <td className="px-4 py-3">{new Date(invoice.dueDate).toLocaleDateString('pt-BR')}</td>
                <td className="px-4 py-3">
                  <select
                    defaultValue={invoice.status}
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value="pending">Pendente</option>
                    <option value="paid">Pago</option>
                    <option value="overdue">Vencido</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <button className="text-blue-600 hover:underline text-sm">Salvar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center gap-2 mt-4">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-100 rounded-lg disabled:opacity-50"
        >
          Anterior
        </button>
        <span className="px-4 py-2">Página {page}</span>
        <button
          onClick={() => setPage(p => p + 1)}
          className="px-4 py-2 bg-gray-100 rounded-lg"
        >
          Próxima
        </button>
      </div>
    </div>
  );
}