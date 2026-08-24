import React, { useState } from 'react';
import { BarChart3, TrendingUp, Users, Target, Award, AlertCircle } from 'lucide-react';

interface PerformanceMetrics {
  totalSales: number;
  totalCommissions: number;
  activeAffiliates: number;
  conversionRate: number;
  averageOrderValue: number;
  topAffiliates: Array<{ name: string; sales: number; commissions: number }>;
  monthlyGrowth: number;
  roi: number;
}

interface PerformanceReportProps {
  metrics?: PerformanceMetrics;
  timeRange?: 'week' | 'month' | 'quarter' | 'year';
  onTimeRangeChange?: (range: 'week' | 'month' | 'quarter' | 'year') => void;
}

const DEFAULT_METRICS: PerformanceMetrics = {
  totalSales: 45230.50,
  totalCommissions: 9046.10,
  activeAffiliates: 127,
  conversionRate: 8.5,
  averageOrderValue: 285.40,
  monthlyGrowth: 12.5,
  roi: 320,
  topAffiliates: [
    { name: 'João Silva', sales: 12500.00, commissions: 2500.00 },
    { name: 'Maria Santos', sales: 8900.00, commissions: 1780.00 },
    { name: 'Pedro Costa', sales: 7650.00, commissions: 1530.00 },
    { name: 'Ana Oliveira', sales: 6200.00, commissions: 1240.00 },
    { name: 'Carlos Mendes', sales: 5980.00, commissions: 1196.00 },
  ]
};

export const PerformanceReport: React.FC<PerformanceReportProps> = ({
  metrics = DEFAULT_METRICS,
  timeRange = 'month',
  onTimeRangeChange
}) => {
  const [expandedAffiliates, setExpandedAffiliates] = useState(false);

  const getGrowthColor = (value: number): string => {
    if (value > 10) return 'text-green-400';
    if (value > 0) return 'text-blue-400';
    return 'text-red-400';
  };

  const getGrowthIcon = (value: number) => {
    if (value > 0) return '↑';
    if (value < 0) return '↓';
    return '→';
  };

  return (
    <div className="performance-report bg-slate-800 border border-slate-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Relatório de Performance</h3>
        </div>
        <div className="flex gap-2">
          {(['week', 'month', 'quarter', 'year'] as const).map(range => (
            <button
              key={range}
              onClick={() => onTimeRangeChange?.(range)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                timeRange === range
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {range === 'week' ? 'Semana' : range === 'month' ? 'Mês' : range === 'quarter' ? 'Trimestre' : 'Ano'}
            </button>
          ))}
        </div>
      </div>

      {/* Main KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg p-4 border border-blue-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-blue-200">Vendas Totais</p>
            <TrendingUp className="w-4 h-4 text-blue-300" />
          </div>
          <p className="text-2xl font-bold text-white">R$ {metrics.totalSales.toFixed(2)}</p>
          <p className={`text-xs mt-2 font-semibold ${getGrowthColor(metrics.monthlyGrowth)}`}>
            {getGrowthIcon(metrics.monthlyGrowth)} {Math.abs(metrics.monthlyGrowth).toFixed(1)}% este mês
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-lg p-4 border border-green-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-green-200">Comissões Totais</p>
            <Award className="w-4 h-4 text-green-300" />
          </div>
          <p className="text-2xl font-bold text-white">R$ {metrics.totalCommissions.toFixed(2)}</p>
          <p className="text-xs text-green-200 mt-2">
            {((metrics.totalCommissions / metrics.totalSales) * 100).toFixed(1)}% do faturamento
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-lg p-4 border border-purple-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-purple-200">Afiliados Ativos</p>
            <Users className="w-4 h-4 text-purple-300" />
          </div>
          <p className="text-2xl font-bold text-white">{metrics.activeAffiliates}</p>
          <p className="text-xs text-purple-200 mt-2">
            Média: R$ {(metrics.totalSales / metrics.activeAffiliates).toFixed(2)}/afiliado
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-900 to-orange-800 rounded-lg p-4 border border-orange-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-orange-200">ROI</p>
            <Target className="w-4 h-4 text-orange-300" />
          </div>
          <p className="text-2xl font-bold text-white">{metrics.roi}%</p>
          <p className="text-xs text-orange-200 mt-2">Retorno sobre investimento</p>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-700 rounded-lg p-4">
          <p className="text-xs text-slate-400 mb-2">Taxa de Conversão</p>
          <div className="flex items-end gap-2">
            <p className="text-3xl font-bold text-blue-400">{metrics.conversionRate}%</p>
          </div>
          <div className="w-full bg-slate-600 rounded-full h-2 mt-3">
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: `${Math.min(metrics.conversionRate * 10, 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-slate-700 rounded-lg p-4">
          <p className="text-xs text-slate-400 mb-2">Ticket Médio</p>
          <div className="flex items-end gap-2">
            <p className="text-3xl font-bold text-green-400">R$ {metrics.averageOrderValue.toFixed(2)}</p>
          </div>
          <p className="text-xs text-slate-400 mt-3">Por transação</p>
        </div>

        <div className="bg-slate-700 rounded-lg p-4">
          <p className="text-xs text-slate-400 mb-2">Crescimento Mensal</p>
          <div className="flex items-end gap-2">
            <p className={`text-3xl font-bold ${getGrowthColor(metrics.monthlyGrowth)}`}>
              {getGrowthIcon(metrics.monthlyGrowth)} {Math.abs(metrics.monthlyGrowth).toFixed(1)}%
            </p>
          </div>
          <p className="text-xs text-slate-400 mt-3">Comparado ao mês anterior</p>
        </div>
      </div>

      {/* Top Affiliates */}
      <div className="bg-slate-700 rounded-lg p-4">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setExpandedAffiliates(!expandedAffiliates)}
        >
          <h4 className="font-semibold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" />
            Top 5 Afiliados
          </h4>
          <span className="text-slate-400">{expandedAffiliates ? '▼' : '▶'}</span>
        </div>

        {expandedAffiliates && (
          <div className="mt-4 space-y-3">
            {metrics.topAffiliates.map((affiliate, index) => (
              <div key={index} className="bg-slate-800 p-3 rounded">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <p className="font-medium text-white">{affiliate.name}</p>
                  </div>
                  <p className="text-sm font-semibold text-green-400">R$ {affiliate.commissions.toFixed(2)}</p>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Vendas: R$ {affiliate.sales.toFixed(2)}</span>
                  <div className="w-24 bg-slate-700 rounded-full h-1.5">
                    <div
                      className="bg-green-500 h-1.5 rounded-full"
                      style={{ width: `${(affiliate.sales / metrics.totalSales) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Insights */}
      <div className="mt-4 bg-blue-900/30 border border-blue-700 rounded-lg p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-200 mb-1">Insight</p>
          <p className="text-xs text-blue-100">
            Seu ROI de {metrics.roi}% está acima da média. Continue focando nos top afiliados para maximizar resultados.
          </p>
        </div>
      </div>
    </div>
  );
};
