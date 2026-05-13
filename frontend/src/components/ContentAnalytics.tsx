import React, { useState } from 'react';
import { TrendingUp, Eye, Heart, Share2, MessageCircle, BarChart3 } from 'lucide-react';

interface ContentMetric {
  id: string;
  title: string;
  platform: string;
  views: number;
  likes: number;
  shares: number;
  comments: number;
  engagement: number;
  publishedAt: string;
  status: 'viral' | 'trending' | 'normal' | 'low';
}

export const ContentAnalytics: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('7d');
  const [selectedPlatform, setSelectedPlatform] = useState<'all' | 'instagram' | 'twitter' | 'facebook'>('all');

  const contentMetrics: ContentMetric[] = [
    {
      id: '1',
      title: 'Como aumentar suas comissões em 2026',
      platform: 'Instagram',
      views: 5420,
      likes: 342,
      shares: 89,
      comments: 156,
      engagement: 8.2,
      publishedAt: '2026-05-13',
      status: 'viral',
    },
    {
      id: '2',
      title: 'Dicas de marketing para afiliados',
      platform: 'Twitter',
      views: 3210,
      likes: 189,
      shares: 234,
      comments: 78,
      engagement: 12.5,
      publishedAt: '2026-05-12',
      status: 'trending',
    },
    {
      id: '3',
      title: 'Webinar: Estratégias de Vendas',
      platform: 'Facebook',
      views: 2890,
      likes: 145,
      shares: 56,
      comments: 89,
      engagement: 8.9,
      publishedAt: '2026-05-11',
      status: 'trending',
    },
    {
      id: '4',
      title: 'Novidades da plataforma MMN',
      platform: 'Instagram',
      views: 1230,
      likes: 67,
      shares: 23,
      comments: 34,
      engagement: 8.1,
      publishedAt: '2026-05-10',
      status: 'normal',
    },
    {
      id: '5',
      title: 'Perguntas frequentes respondidas',
      platform: 'Twitter',
      views: 456,
      likes: 23,
      shares: 12,
      comments: 15,
      engagement: 9.2,
      publishedAt: '2026-05-09',
      status: 'low',
    },
  ];

  const totalMetrics = {
    totalViews: contentMetrics.reduce((sum, m) => sum + m.views, 0),
    totalLikes: contentMetrics.reduce((sum, m) => sum + m.likes, 0),
    totalShares: contentMetrics.reduce((sum, m) => sum + m.shares, 0),
    totalComments: contentMetrics.reduce((sum, m) => sum + m.comments, 0),
    avgEngagement: (contentMetrics.reduce((sum, m) => sum + m.engagement, 0) / contentMetrics.length).toFixed(1),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'viral':
        return 'bg-red-900 text-red-200';
      case 'trending':
        return 'bg-orange-900 text-orange-200';
      case 'normal':
        return 'bg-blue-900 text-blue-200';
      case 'low':
        return 'bg-gray-700 text-gray-300';
      default:
        return 'bg-slate-700 text-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'viral':
        return '🔥 Viral';
      case 'trending':
        return '📈 Trending';
      case 'normal':
        return '→ Normal';
      case 'low':
        return '↓ Baixo';
      default:
        return status;
    }
  };

  return (
    <div className="content-analytics bg-slate-900 rounded-lg p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-green-400" />
          Analytics de Conteúdo
        </h3>
      </div>

      <div className="space-y-4">
        {/* Filtros */}
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Período
              </label>
              <div className="flex gap-2">
                {(['7d', '30d', '90d'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      selectedPeriod === period
                        ? 'bg-green-600 text-white'
                        : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    }`}
                  >
                    {period === '7d' ? 'Últimos 7 dias' : period === '30d' ? 'Últimos 30 dias' : 'Últimos 90 dias'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Plataforma
              </label>
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value as any)}
                className="w-full bg-slate-700 text-white rounded px-3 py-1 text-sm"
              >
                <option value="all">Todas as plataformas</option>
                <option value="instagram">Instagram</option>
                <option value="twitter">Twitter</option>
                <option value="facebook">Facebook</option>
              </select>
            </div>
          </div>
        </div>

        {/* Resumo de métricas */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4 text-blue-400" />
              <p className="text-xs text-gray-400">Visualizações</p>
            </div>
            <p className="text-lg font-bold text-white">{totalMetrics.totalViews.toLocaleString()}</p>
          </div>

          <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-4 h-4 text-red-400" />
              <p className="text-xs text-gray-400">Curtidas</p>
            </div>
            <p className="text-lg font-bold text-white">{totalMetrics.totalLikes.toLocaleString()}</p>
          </div>

          <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Share2 className="w-4 h-4 text-green-400" />
              <p className="text-xs text-gray-400">Compartilhamentos</p>
            </div>
            <p className="text-lg font-bold text-white">{totalMetrics.totalShares.toLocaleString()}</p>
          </div>

          <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="w-4 h-4 text-purple-400" />
              <p className="text-xs text-gray-400">Comentários</p>
            </div>
            <p className="text-lg font-bold text-white">{totalMetrics.totalComments.toLocaleString()}</p>
          </div>

          <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-yellow-400" />
              <p className="text-xs text-gray-400">Engajamento Médio</p>
            </div>
            <p className="text-lg font-bold text-white">{totalMetrics.avgEngagement}%</p>
          </div>
        </div>

        {/* Lista de conteúdos */}
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h4 className="text-sm font-semibold text-white mb-3">Conteúdos Recentes</h4>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {contentMetrics.map((metric) => (
              <div
                key={metric.id}
                className="bg-slate-700 rounded-lg p-3 border border-slate-600 hover:border-slate-500 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h5 className="text-sm font-medium text-white">{metric.title}</h5>
                    <p className="text-xs text-gray-400">
                      {metric.platform} • {metric.publishedAt}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded whitespace-nowrap ml-2 ${getStatusColor(metric.status)}`}>
                    {getStatusLabel(metric.status)}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div className="flex items-center gap-1 text-gray-300">
                    <Eye className="w-3 h-3" />
                    {metric.views.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1 text-gray-300">
                    <Heart className="w-3 h-3" />
                    {metric.likes}
                  </div>
                  <div className="flex items-center gap-1 text-gray-300">
                    <Share2 className="w-3 h-3" />
                    {metric.shares}
                  </div>
                  <div className="flex items-center gap-1 text-gray-300">
                    <MessageCircle className="w-3 h-3" />
                    {metric.comments}
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <div className="w-full bg-slate-600 rounded-full h-1.5">
                    <div
                      className="bg-green-500 h-1.5 rounded-full"
                      style={{ width: `${Math.min(metric.engagement * 10, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-400 ml-2">{metric.engagement}% eng.</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insights */}
        <div className="bg-gradient-to-r from-green-900 to-blue-900 rounded-lg p-4 border border-green-700">
          <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Insights
          </h4>
          <ul className="text-sm text-gray-200 space-y-1">
            <li>✓ Seu conteúdo mais viral teve 5.420 visualizações</li>
            <li>✓ Taxa de engajamento média: {totalMetrics.avgEngagement}%</li>
            <li>✓ Instagram é sua plataforma com melhor desempenho</li>
            <li>✓ Conteúdo educativo gera mais compartilhamentos</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
