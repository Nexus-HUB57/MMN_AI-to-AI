import React, { useState } from 'react';
import { ShoppingCart, Filter, Download, TrendingUp } from 'lucide-react';

interface Sale {
  id: string;
  product: string;
  amount: number;
  date: string;
  customer: string;
  status: 'completed' | 'pending' | 'refunded';
  commission: number;
  affiliate?: string;
}

export const SalesHistory: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending' | 'refunded'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');

  // Mock de dados de histórico de vendas com mais detalhes
  const allSales: Sale[] = [
    {
      id: 's1',
      product: 'Produto Premium A',
      amount: 250.00,
      date: '2026-05-13',
      customer: 'João Silva',
      status: 'completed',
      commission: 25.00,
      affiliate: 'João Silva',
    },
    {
      id: 's2',
      product: 'Produto Básico B',
      amount: 120.00,
      date: '2026-05-12',
      customer: 'Maria Santos',
      status: 'completed',
      commission: 12.00,
      affiliate: 'Maria Santos',
    },
    {
      id: 's3',
      product: 'Produto Premium C',
      amount: 300.00,
      date: '2026-05-11',
      customer: 'Pedro Costa',
      status: 'completed',
      commission: 45.00,
      affiliate: 'Pedro Costa',
    },
    {
      id: 's4',
      product: 'Produto Básico A',
      amount: 89.90,
      date: '2026-05-10',
      customer: 'Ana Oliveira',
      status: 'pending',
      commission: 8.99,
      affiliate: 'Ana Oliveira',
    },
    {
      id: 's5',
      product: 'Produto Premium B',
      amount: 199.99,
      date: '2026-05-09',
      customer: 'Carlos Mendes',
      status: 'completed',
      commission: 20.00,
      affiliate: 'Carlos Mendes',
    },
    {
      id: 's6',
      product: 'Produto Básico C',
      amount: 75.00,
      date: '2026-05-08',
      customer: 'Lucia Ferreira',
      status: 'refunded',
      commission: 0.00,
      affiliate: 'Lucia Ferreira',
    },
    {
      id: 's7',
      product: 'Produto Premium A',
      amount: 250.00,
      date: '2026-05-07',
      customer: 'Roberto Alves',
      status: 'completed',
      commission: 25.00,
      affiliate: 'Roberto Alves',
    },
    {
      id: 's8',
      product: 'Produto Básico B',
      amount: 120.00,
      date: '2026-05-06',
      customer: 'Fernanda Lima',
      status: 'completed',
      commission: 12.00,
      affiliate: 'Fernanda Lima',
    },
  ];

  // Filtrar vendas
  let filteredSales = allSales;
  if (filterStatus !== 'all') {
    filteredSales = filteredSales.filter(sale => sale.status === filterStatus);
  }

  // Ordenar vendas
  if (sortBy === 'date') {
    filteredSales = [...filteredSales].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } else {
    filteredSales = [...filteredSales].sort((a, b) => b.amount - a.amount);
  }

  // Calcular totais
  const totalSales = filteredSales.reduce((sum, s) => sum + s.amount, 0);
  const totalCommissions = filteredSales.reduce((sum, s) => sum + s.commission, 0);
  const completedCount = filteredSales.filter(s => s.status === 'completed').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-900 text-green-200 border-green-700';
      case 'pending':
        return 'bg-yellow-900 text-yellow-200 border-yellow-700';
      case 'refunded':
        return 'bg-red-900 text-red-200 border-red-700';
      default:
        return 'bg-slate-700 text-gray-300 border-slate-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return '✓ Concluída';
      case 'pending':
        return '⏳ Pendente';
      case 'refunded':
        return '↩️ Reembolsada';
      default:
        return status;
    }
  };

  return (
    <div className="sales-history bg-slate-900 rounded-lg p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-green-400" />
          Histórico de Vendas
        </h3>
        <button className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 rounded-lg transition-colors text-sm">
          <Download className="w-4 h-4" />
          Exportar
        </button>
      </div>

      <div className="space-y-4">
        {/* Resumo */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="text-xs text-gray-400 mb-1">Total de Vendas</p>
            <p className="text-2xl font-bold text-white">R$ {totalSales.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-2">{filteredSales.length} transações</p>
          </div>

          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="text-xs text-gray-400 mb-1">Comissões Geradas</p>
            <p className="text-2xl font-bold text-green-400">R$ {totalCommissions.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-2">{completedCount} concluídas</p>
          </div>

          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="text-xs text-gray-400 mb-1">Ticket Médio</p>
            <p className="text-2xl font-bold text-blue-400">
              R$ {(totalSales / filteredSales.length).toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-2">por transação</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-300">Filtrar por:</span>
            </div>

            <div className="flex gap-2">
              {(['all', 'completed', 'pending', 'refunded'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    filterStatus === status
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  {status === 'all' ? 'Todas' : status === 'completed' ? 'Concluídas' : status === 'pending' ? 'Pendentes' : 'Reembolsadas'}
                </button>
              ))}
            </div>

            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm text-gray-400">Ordenar por:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-700 text-white rounded px-2 py-1 text-sm"
              >
                <option value="date">Data (Recente)</option>
                <option value="amount">Valor (Maior)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabela de vendas */}
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-700">
              <tr>
                <th className="text-left px-3 py-3 font-semibold text-gray-300">Data</th>
                <th className="text-left px-3 py-3 font-semibold text-gray-300">Produto</th>
                <th className="text-left px-3 py-3 font-semibold text-gray-300">Cliente</th>
                <th className="text-right px-3 py-3 font-semibold text-gray-300">Valor</th>
                <th className="text-right px-3 py-3 font-semibold text-gray-300">Comissão</th>
                <th className="text-center px-3 py-3 font-semibold text-gray-300">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredSales.length > 0 ? (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-700 transition-colors">
                    <td className="px-3 py-3 text-gray-300">{sale.date}</td>
                    <td className="px-3 py-3 text-white font-medium">{sale.product}</td>
                    <td className="px-3 py-3 text-gray-300">{sale.customer}</td>
                    <td className="px-3 py-3 text-right text-white font-medium">
                      R$ {sale.amount.toFixed(2)}
                    </td>
                    <td className="px-3 py-3 text-right text-green-400 font-medium">
                      R$ {sale.commission.toFixed(2)}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className={`text-xs font-medium px-2 py-1 rounded border ${getStatusColor(sale.status)}`}>
                        {getStatusLabel(sale.status)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-gray-400">
                    Nenhuma venda encontrada com os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Insights */}
        <div className="bg-gradient-to-r from-green-900 to-blue-900 rounded-lg p-4 border border-green-700">
          <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Insights
          </h4>
          <ul className="text-sm text-gray-200 space-y-1">
            <li>✓ Você gerou R$ {totalCommissions.toFixed(2)} em comissões neste período</li>
            <li>✓ Taxa de conclusão: {((completedCount / filteredSales.length) * 100).toFixed(0)}%</li>
            <li>✓ Produto mais vendido: Produto Premium A</li>
            <li>✓ Crescimento de 15% em relação ao período anterior</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
