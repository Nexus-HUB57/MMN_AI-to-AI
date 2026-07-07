import React, { useState } from 'react';
import { useCommissions } from '../hooks/useCommissions';
import { TrendingUp, Calendar } from 'lucide-react';

interface Commission {
  id: string;
  date: string;
  amount: number;
  status: 'pending' | 'approved' | 'paid';
  source: string;
}

export const CommissionChart: React.FC = () => {
  const { commissions, isLoading, error } = useCommissions();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  if (isLoading) {
    return (
      <div className="commission-chart bg-slate-900 rounded-lg p-6 border border-slate-700 animate-pulse">
        <div className="h-8 bg-slate-700 rounded w-1/3 mb-4"></div>
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 bg-slate-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="commission-chart bg-slate-900 rounded-lg p-6 border border-red-700">
        <p className="text-red-400">Erro ao carregar comissões: {error.message}</p>
      </div>
    );
  }

  // Calcular totais
  const totalCommissions = commissions.reduce((sum, c) => sum + c.amount, 0);
  const pendingCommissions = commissions
    .filter(c => c.status === 'pending')
    .reduce((sum, c) => sum + c.amount, 0);
  const paidCommissions = commissions
    .filter(c => c.status === 'paid')
    .reduce((sum, c) => sum + c.amount, 0);

  // Agrupar por status
  const statusBreakdown = {
    pending: commissions.filter(c => c.status === 'pending').length,
    approved: commissions.filter(c => c.status === 'approved').length,
    paid: commissions.filter(c => c.status === 'paid').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-900 text-yellow-200 border-yellow-700';
      case 'approved':
        return 'bg-blue-900 text-blue-200 border-blue-700';
      case 'paid':
        return 'bg-green-900 text-green-200 border-green-700';
      default:
        return 'bg-slate-700 text-gray-300 border-slate-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return '⏳ Pendente';
      case 'approved':
        return '✓ Aprovado';
      case 'paid':
        return '💰 Pago';
      default:
        return status;
    }
  };

  return (
    <div className="commission-chart bg-slate-900 rounded-lg p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          Gráfico de Comissões
        </h3>
        <div className="flex gap-2">
          {(['week', 'month', 'year'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                selectedPeriod === period
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              {period === 'week' ? 'Semana' : period === 'month' ? 'Mês' : 'Ano'}
            </button>
          ))}
        </div>
      </div>

      {commissions && commissions.length > 0 ? (
        <div className="space-y-4">
          {/* Resumo de totais */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <p className="text-xs text-gray-400 mb-1">Total de Comissões</p>
              <p className="text-2xl font-bold text-white">
                R$ {totalCommissions.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-2">{commissions.length} transações</p>
            </div>

            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <p className="text-xs text-gray-400 mb-1">Pendentes</p>
              <p className="text-2xl font-bold text-yellow-400">
                R$ {pendingCommissions.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-2">{statusBreakdown.pending} itens</p>
            </div>

            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <p className="text-xs text-gray-400 mb-1">Pagos</p>
              <p className="text-2xl font-bold text-green-400">
                R$ {paidCommissions.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-2">{statusBreakdown.paid} itens</p>
            </div>
          </div>

          {/* Gráfico de barras simples */}
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <h4 className="text-sm font-semibold text-white mb-4">Distribuição por Status</h4>
            <div className="space-y-3">
              {[
                { label: 'Pagos', value: statusBreakdown.paid, color: 'bg-green-500', total: commissions.length },
                { label: 'Aprovados', value: statusBreakdown.approved, color: 'bg-blue-500', total: commissions.length },
                { label: 'Pendentes', value: statusBreakdown.pending, color: 'bg-yellow-500', total: commissions.length },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-300">{item.label}</span>
                    <span className="text-sm font-medium text-white">
                      {item.value} ({((item.value / item.total) * 100).toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className={`${item.color} h-2 rounded-full transition-all`}
                      style={{ width: `${(item.value / item.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lista de comissões */}
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <h4 className="text-sm font-semibold text-white mb-3">Histórico de Comissões</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {commissions.map((commission) => (
                <div
                  key={commission.id}
                  className="flex items-center justify-between p-3 bg-slate-700 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{commission.source}</p>
                    <p className="text-xs text-gray-400">{commission.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-bold text-white">
                      R$ {commission.amount.toFixed(2)}
                    </p>
                    <span className={`text-xs font-medium px-2 py-1 rounded border ${getStatusColor(commission.status)}`}>
                      {getStatusLabel(commission.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ação */}
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
            <Calendar className="w-4 h-4" />
            Ver Relatório Completo
          </button>
        </div>
      ) : (
        <p className="text-gray-400 text-center py-8">Nenhuma comissão encontrada.</p>
      )}
    </div>
  );
};

export default CommissionChart;
