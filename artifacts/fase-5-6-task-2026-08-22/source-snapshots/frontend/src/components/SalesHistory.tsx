import React, { useState } from 'react';
import { ShoppingCart, TrendingUp, Filter, Download } from 'lucide-react';

interface Sale {
  id: string;
  product: string;
  amount: number;
  date: string;
  affiliate?: string;
  status?: 'completed' | 'pending' | 'cancelled';
  commission?: number;
}

interface SalesHistoryProps {
  sales?: Sale[];
  onExport?: () => void;
}

const DEFAULT_SALES: Sale[] = [
  {
    id: 's1',
    product: 'Produto A - Premium',
    amount: 250.00,
    date: '2026-05-08',
    affiliate: 'João Silva',
    status: 'completed',
    commission: 50.00
  },
  {
    id: 's2',
    product: 'Produto B - Standard',
    amount: 120.00,
    date: '2026-05-07',
    affiliate: 'Maria Santos',
    status: 'completed',
    commission: 24.00
  },
  {
    id: 's3',
    product: 'Produto C - Deluxe',
    amount: 300.00,
    date: '2026-05-06',
    affiliate: 'Pedro Costa',
    status: 'completed',
    commission: 60.00
  },
  {
    id: 's4',
    product: 'Produto A - Premium',
    amount: 250.00,
    date: '2026-05-05',
    affiliate: 'Ana Oliveira',
    status: 'completed',
    commission: 50.00
  },
  {
    id: 's5',
    product: 'Produto B - Standard',
    amount: 120.00,
    date: '2026-05-04',
    affiliate: 'João Silva',
    status: 'pending',
    commission: 24.00
  },
  {
    id: 's6',
    product: 'Produto D - Basic',
    amount: 89.90,
    date: '2026-05-03',
    affiliate: 'Carlos Mendes',
    status: 'completed',
    commission: 17.98
  },
  {
    id: 's7',
    product: 'Produto C - Deluxe',
    amount: 300.00,
    date: '2026-05-02',
    affiliate: 'Maria Santos',
    status: 'cancelled',
    commission: 0
  },
  {
    id: 's8',
    product: 'Produto A - Premium',
    amount: 250.00,
    date: '2026-05-01',
    affiliate: 'Pedro Costa',
    status: 'completed',
    commission: 50.00
  },
];

export const SalesHistory: React.FC<SalesHistoryProps> = ({
  sales = DEFAULT_SALES,
  onExport
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending' | 'cancelled'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'commission'>('date');

  const itemsPerPage = 10;

  // Filter sales
  const filteredSales = filterStatus === 'all'
    ? sales
    : sales.filter(s => s.status === filterStatus);

  // Sort sales
  const sortedSales = [...filteredSales].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else if (sortBy === 'amount') {
      return b.amount - a.amount;
    } else {
      return (b.commission || 0) - (a.commission || 0);
    }
  });

  // Paginate
  const totalPages = Math.ceil(sortedSales.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSales = sortedSales.slice(startIndex, startIndex + itemsPerPage);

  // Calculate totals
  const totals = {
    sales: filteredSales.reduce((sum, s) => sum + s.amount, 0),
    commissions: filteredSales.reduce((sum, s) => sum + (s.commission || 0), 0),
    count: filteredSales.length,
    completed: filteredSales.filter(s => s.status === 'completed').length,
  };

  const getStatusColor = (status?: string): string => {
    switch (status) {
      case 'completed':
        return 'bg-green-600 text-green-100';
      case 'pending':
        return 'bg-yellow-600 text-yellow-100';
      case 'cancelled':
        return 'bg-red-600 text-red-100';
      default:
        return 'bg-slate-600 text-slate-100';
    }
  };

  const getStatusLabel = (status?: string): string => {
    switch (status) {
      case 'completed':
        return 'Concluída';
      case 'pending':
        return 'Pendente';
      case 'cancelled':
        return 'Cancelada';
      default:
        return 'Desconhecido';
    }
  };

  return (
    <div className="sales-history bg-slate-800 border border-slate-700 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <ShoppingCart className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Histórico de Vendas</h3>
        {onExport && (
          <button
            onClick={onExport}
            className="ml-auto flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar
          </button>
        )}
      </div>

      {sales && sales.length > 0 ? (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-700 rounded-lg p-4">
              <p className="text-xs text-slate-400 mb-1">Total de Vendas</p>
              <p className="text-2xl font-bold text-white">R$ {totals.sales.toFixed(2)}</p>
            </div>
            <div className="bg-slate-700 rounded-lg p-4">
              <p className="text-xs text-slate-400 mb-1">Total de Comissões</p>
              <p className="text-2xl font-bold text-green-400">R$ {totals.commissions.toFixed(2)}</p>
            </div>
            <div className="bg-slate-700 rounded-lg p-4">
              <p className="text-xs text-slate-400 mb-1">Quantidade</p>
              <p className="text-2xl font-bold text-blue-400">{totals.count}</p>
            </div>
            <div className="bg-slate-700 rounded-lg p-4">
              <p className="text-xs text-slate-400 mb-1">Concluídas</p>
              <p className="text-2xl font-bold text-yellow-400">{totals.completed}</p>
            </div>
          </div>

          {/* Filters and Sort */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Filter className="w-4 h-4 inline mr-2" />
                Filtrar por Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-700 border border-slate-600 text-white px-3 py-2 rounded"
              >
                <option value="all">Todos os Status</option>
                <option value="completed">Concluídas</option>
                <option value="pending">Pendentes</option>
                <option value="cancelled">Canceladas</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <TrendingUp className="w-4 h-4 inline mr-2" />
                Ordenar por
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-slate-700 border border-slate-600 text-white px-3 py-2 rounded"
              >
                <option value="date">Data (Mais Recentes)</option>
                <option value="amount">Valor (Maior para Menor)</option>
                <option value="commission">Comissão (Maior para Menor)</option>
              </select>
            </div>
          </div>

          {/* Sales Table */}
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-600">
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Data</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Produto</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Afiliado</th>
                  <th className="text-right py-3 px-4 text-slate-300 font-semibold">Valor</th>
                  <th className="text-right py-3 px-4 text-slate-300 font-semibold">Comissão</th>
                  <th className="text-center py-3 px-4 text-slate-300 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSales.map(sale => (
                  <tr key={sale.id} className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors">
                    <td className="py-3 px-4 text-slate-300">{sale.date}</td>
                    <td className="py-3 px-4 text-white font-medium">{sale.product}</td>
                    <td className="py-3 px-4 text-slate-300">{sale.affiliate || '-'}</td>
                    <td className="py-3 px-4 text-right text-white font-semibold">R$ {sale.amount.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right text-green-400 font-semibold">
                      R$ {(sale.commission || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-xs px-2 py-1 rounded font-medium ${getStatusColor(sale.status)}`}>
                        {getStatusLabel(sale.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">
                Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, sortedSales.length)} de {sortedSales.length} vendas
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white rounded text-sm transition-colors"
                >
                  Anterior
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded text-sm transition-colors ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white rounded text-sm transition-colors"
                >
                  Próxima
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-400">Nenhum histórico de vendas encontrado.</p>
        </div>
      )}
    </div>
  );
};
