import React from 'react';
import { useCommissions } from '../hooks/useCommissions';
import { BarChart3, TrendingUp } from 'lucide-react';

interface Commission {
  id: string;
  date: string;
  amount: number;
  status: 'pending' | 'approved' | 'paid';
  source?: string;
}

export const CommissionChart: React.FC = () => {
  const { commissions, isLoading, error } = useCommissions();

  if (isLoading) {
    return (
      <div className="commission-chart bg-slate-800 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-400">Carregando comissões...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="commission-chart bg-slate-800 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-red-400">Erro ao carregar comissões: {error.message}</p>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const stats = {
    total: commissions?.reduce((sum, c) => sum + c.amount, 0) || 0,
    pending: commissions?.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.amount, 0) || 0,
    approved: commissions?.filter(c => c.status === 'approved').reduce((sum, c) => sum + c.amount, 0) || 0,
    paid: commissions?.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.amount, 0) || 0,
  };

  // Group by date for chart
  const chartData = (commissions || []).reduce((acc: any[], commission) => {
    const existing = acc.find(item => item.date === commission.date);
    if (existing) {
      existing.amount += commission.amount;
      existing.count += 1;
    } else {
      acc.push({
        date: commission.date,
        amount: commission.amount,
        count: 1
      });
    }
    return acc;
  }, []);

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'paid':
        return 'bg-green-600';
      case 'approved':
        return 'bg-blue-600';
      case 'pending':
        return 'bg-yellow-600';
      default:
        return 'bg-slate-600';
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'paid':
        return 'Pago';
      case 'approved':
        return 'Aprovado';
      case 'pending':
        return 'Pendente';
      default:
        return status;
    }
  };

  return (
    <div className="commission-chart bg-slate-800 border border-slate-700 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-5 h-5 text-green-400" />
        <h3 className="text-lg font-semibold text-white">Gráfico de Comissões</h3>
      </div>

      {commissions && commissions.length > 0 ? (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-700 rounded-lg p-4">
              <p className="text-xs text-slate-400 mb-1">Total</p>
              <p className="text-2xl font-bold text-white">R$ {stats.total.toFixed(2)}</p>
            </div>
            <div className="bg-slate-700 rounded-lg p-4">
              <p className="text-xs text-slate-400 mb-1">Pago</p>
              <p className="text-2xl font-bold text-green-400">R$ {stats.paid.toFixed(2)}</p>
            </div>
            <div className="bg-slate-700 rounded-lg p-4">
              <p className="text-xs text-slate-400 mb-1">Aprovado</p>
              <p className="text-2xl font-bold text-blue-400">R$ {stats.approved.toFixed(2)}</p>
            </div>
            <div className="bg-slate-700 rounded-lg p-4">
              <p className="text-xs text-slate-400 mb-1">Pendente</p>
              <p className="text-2xl font-bold text-yellow-400">R$ {stats.pending.toFixed(2)}</p>
            </div>
          </div>

          {/* Chart Visualization */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-white mb-3">Comissões por Data</h4>
            <div className="space-y-2">
              {chartData.slice(-7).map((item, index) => {
                const maxAmount = Math.max(...chartData.map(d => d.amount));
                const percentage = (item.amount / maxAmount) * 100;
                return (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 w-16">{item.date}</span>
                    <div className="flex-1 bg-slate-700 rounded-full h-6 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-600 h-full flex items-center justify-end pr-2 transition-all"
                        style={{ width: `${percentage}%` }}
                      >
                        {percentage > 20 && (
                          <span className="text-xs font-semibold text-white">R$ {item.amount.toFixed(0)}</span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 w-12 text-right">{item.count} trans.</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Commissions List */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Últimas Comissões</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {commissions.slice(-10).reverse().map(commission => (
                <div key={commission.id} className="flex items-center justify-between bg-slate-700 p-3 rounded">
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium">{commission.date}</p>
                    {commission.source && <p className="text-xs text-slate-400">{commission.source}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-semibold text-white">R$ {commission.amount.toFixed(2)}</p>
                    <span className={`text-xs px-2 py-1 rounded text-white ${getStatusColor(commission.status)}`}>
                      {getStatusLabel(commission.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-400">Nenhuma comissão encontrada.</p>
        </div>
      )}
    </div>
  );
};
