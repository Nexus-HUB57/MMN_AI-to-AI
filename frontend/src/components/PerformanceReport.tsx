import React, { useState } from 'react';
import { BarChart3, TrendingUp, Award, Target } from 'lucide-react';

interface PerformanceMetric {
  label: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  percentChange: number;
}

export const PerformanceReport: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month');

  // Mock de dados de relatório de performance
  const reportData = {
    totalSales: 15000.00,
    totalCommissions: 3000.00,
    activeAffiliates: 50,
    conversionRate: 5.2,
  };

  const metrics: PerformanceMetric[] = [
    {
      label: 'Vendas Totais',
      value: 15000,
      target: 12000,
      unit: 'R$',
      trend: 'up',
      percentChange: 25,
    },
    {
      label: 'Comissões Geradas',
      value: 3000,
      target: 2500,
      unit: 'R$',
      trend: 'up',
      percentChange: 20,
    },
    {
      label: 'Afiliados Ativos',
      value: 50,
      target: 45,
      unit: '',
      trend: 'up',
      percentChange: 11,
    },
    {
      label: 'Taxa de Conversão',
      value: 5.2,
      target: 4.5,
      unit: '%',
      trend: 'up',
      percentChange: 15,
    },
    {
      label: 'Ticket Médio',
      value: 300,
      target: 280,
      unit: 'R$',
      trend: 'up',
      percentChange: 7,
    },
    {
      label: 'Taxa de Retenção',
      value: 92,
      target: 85,
      unit: '%',
      trend: 'stable',
      percentChange: 0,
    },
  ];

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-400';
      case 'down':
        return 'text-red-400';
      case 'stable':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return '↑';
      case 'down':
        return '↓';
      case 'stable':
        return '→';
      default:
        return '•';
    }
  };

  const getProgressColor = (value: number, target: number) => {
    const percentage = (value / target) * 100;
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 80) return 'bg-blue-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="performance-report bg-slate-900 rounded-lg p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-orange-400" />
          Relatório de Performance
        </h3>
        <div className="flex gap-2">
          {(['week', 'month', 'quarter'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                selectedPeriod === period
                  ? 'bg-orange-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              {period === 'week' ? 'Semana' : period === 'month' ? 'Mês' : 'Trimestre'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {/* Resumo principal */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg p-4 border border-blue-700">
            <p className="text-xs text-blue-200 mb-1">Vendas Totais</p>
            <p className="text-2xl font-bold text-white">R$ {reportData.totalSales.toFixed(0)}</p>
            <p className="text-xs text-blue-300 mt-2">+25% vs período anterior</p>
          </div>

          <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-lg p-4 border border-green-700">
            <p className="text-xs text-green-200 mb-1">Comissões Totais</p>
            <p className="text-2xl font-bold text-white">R$ {reportData.totalCommissions.toFixed(0)}</p>
            <p className="text-xs text-green-300 mt-2">+20% vs período anterior</p>
          </div>

          <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-lg p-4 border border-purple-700">
            <p className="text-xs text-purple-200 mb-1">Afiliados Ativos</p>
            <p className="text-2xl font-bold text-white">{reportData.activeAffiliates}</p>
            <p className="text-xs text-purple-300 mt-2">+11% vs período anterior</p>
          </div>

          <div className="bg-gradient-to-br from-orange-900 to-orange-800 rounded-lg p-4 border border-orange-700">
            <p className="text-xs text-orange-200 mb-1">Taxa de Conversão</p>
            <p className="text-2xl font-bold text-white">{reportData.conversionRate}%</p>
            <p className="text-xs text-orange-300 mt-2">+15% vs período anterior</p>
          </div>
        </div>

        {/* Métricas detalhadas */}
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Progresso em Relação às Metas
          </h4>
          <div className="space-y-4">
            {metrics.map((metric, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{metric.label}</p>
                    <p className="text-xs text-gray-400">
                      Meta: {metric.target}{metric.unit}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">
                      {metric.value}{metric.unit}
                    </p>
                    <p className={`text-xs font-medium ${getTrendColor(metric.trend)}`}>
                      {getTrendIcon(metric.trend)} {Math.abs(metric.percentChange)}%
                    </p>
                  </div>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className={`${getProgressColor(metric.value, metric.target)} h-2 rounded-full transition-all`}
                    style={{ width: `${Math.min((metric.value / metric.target) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Análise comparativa */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Destaques Positivos
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2 text-gray-300">
                <span className="text-green-400 font-bold">✓</span>
                <span>Todas as metas foram superadas neste período</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300">
                <span className="text-green-400 font-bold">✓</span>
                <span>Crescimento consistente em todas as métricas</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300">
                <span className="text-green-400 font-bold">✓</span>
                <span>Taxa de retenção de afiliados acima de 90%</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300">
                <span className="text-green-400 font-bold">✓</span>
                <span>Ticket médio aumentou em 7% vs período anterior</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Award className="w-4 h-4" />
              Recomendações
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2 text-gray-300">
                <span className="text-blue-400 font-bold">→</span>
                <span>Manter estratégia atual - está funcionando bem</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300">
                <span className="text-blue-400 font-bold">→</span>
                <span>Investir em recrutamento de novos afiliados</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300">
                <span className="text-blue-400 font-bold">→</span>
                <span>Criar programa de incentivos para top performers</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300">
                <span className="text-blue-400 font-bold">→</span>
                <span>Expandir para novas categorias de produtos</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Score geral */}
        <div className="bg-gradient-to-r from-orange-900 to-yellow-900 rounded-lg p-4 border border-orange-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-200 mb-1">Score de Performance Geral</p>
              <p className="text-3xl font-bold text-white">8.7/10</p>
              <p className="text-xs text-orange-300 mt-1">Excelente desempenho</p>
            </div>
            <div className="text-right">
              <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center border-4 border-orange-500">
                <span className="text-2xl font-bold text-orange-400">87%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
