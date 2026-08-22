import React, { useState } from 'react';
import { BarChart3, TrendingUp, Eye, Heart, MessageCircle, Share2 } from 'lucide-react';

interface ContentMetric {
  id: string;
  title: string;
  platform: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number;
  publishedAt: string;
  status: 'active' | 'archived' | 'scheduled';
}

interface ContentAnalyticsProps {
  metrics?: ContentMetric[];
  timeRange?: 'week' | 'month' | 'year';
  onTimeRangeChange?: (range: 'week' | 'month' | 'year') => void;
}

const DEFAULT_METRICS: ContentMetric[] = [
  {
    id: 'content-1',
    title: 'Novo Produto X - Lançamento',
    platform: 'Instagram',
    views: 5420,
    likes: 342,
    comments: 87,
    shares: 45,
    engagementRate: 8.2,
    publishedAt: '2026-05-10',
    status: 'active'
  },
  {
    id: 'content-2',
    title: 'Dica de Produtividade',
    platform: 'LinkedIn',
    views: 3210,
    likes: 156,
    comments: 42,
    shares: 28,
    engagementRate: 6.5,
    publishedAt: '2026-05-09',
    status: 'active'
  },
  {
    id: 'content-3',
    title: 'Tutorial: Como Usar',
    platform: 'YouTube',
    views: 12540,
    likes: 892,
    comments: 234,
    shares: 156,
    engagementRate: 9.1,
    publishedAt: '2026-05-08',
    status: 'active'
  },
  {
    id: 'content-4',
    title: 'Promoção Relâmpago',
    platform: 'Instagram',
    views: 2890,
    likes: 245,
    comments: 56,
    shares: 34,
    engagementRate: 9.8,
    publishedAt: '2026-05-07',
    status: 'archived'
  },
  {
    id: 'content-5',
    title: 'Webinar Gratuito',
    platform: 'Facebook',
    views: 4120,
    likes: 198,
    comments: 89,
    shares: 67,
    engagementRate: 7.3,
    publishedAt: '2026-05-06',
    status: 'scheduled'
  }
];

export const ContentAnalytics: React.FC<ContentAnalyticsProps> = ({
  metrics = DEFAULT_METRICS,
  timeRange = 'month',
  onTimeRangeChange
}) => {
  const [selectedContent, setSelectedContent] = useState<ContentMetric | null>(null);
  const [sortBy, setSortBy] = useState<'views' | 'engagement' | 'date'>('views');

  // Calculate totals
  const totals = {
    views: metrics.reduce((sum, m) => sum + m.views, 0),
    likes: metrics.reduce((sum, m) => sum + m.likes, 0),
    comments: metrics.reduce((sum, m) => sum + m.comments, 0),
    shares: metrics.reduce((sum, m) => sum + m.shares, 0),
    avgEngagement: (metrics.reduce((sum, m) => sum + m.engagementRate, 0) / metrics.length).toFixed(1)
  };

  // Sort metrics
  const sortedMetrics = [...metrics].sort((a, b) => {
    if (sortBy === 'views') return b.views - a.views;
    if (sortBy === 'engagement') return b.engagementRate - a.engagementRate;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  // Get platform colors
  const getPlatformColor = (platform: string): string => {
    const colors: { [key: string]: string } = {
      'Instagram': 'bg-pink-600',
      'LinkedIn': 'bg-blue-600',
      'YouTube': 'bg-red-600',
      'Facebook': 'bg-blue-700',
      'Twitter': 'bg-sky-500'
    };
    return colors[platform] || 'bg-slate-600';
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statuses: { [key: string]: string } = {
      'active': 'bg-green-600 text-green-100',
      'archived': 'bg-slate-600 text-slate-200',
      'scheduled': 'bg-yellow-600 text-yellow-100'
    };
    return statuses[status] || 'bg-slate-600';
  };

  return (
    <div className="content-analytics bg-slate-800 border border-slate-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-green-400" />
          <h3 className="text-lg font-semibold text-white">Analytics de Conteúdo</h3>
        </div>
        <div className="flex gap-2">
          {(['week', 'month', 'year'] as const).map(range => (
            <button
              key={range}
              onClick={() => onTimeRangeChange?.(range)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                timeRange === range
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {range === 'week' ? 'Semana' : range === 'month' ? 'Mês' : 'Ano'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-blue-400" />
            <p className="text-xs text-slate-400">Visualizações</p>
          </div>
          <p className="text-2xl font-bold text-white">{totals.views.toLocaleString()}</p>
        </div>

        <div className="bg-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-4 h-4 text-red-400" />
            <p className="text-xs text-slate-400">Curtidas</p>
          </div>
          <p className="text-2xl font-bold text-white">{totals.likes.toLocaleString()}</p>
        </div>

        <div className="bg-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="w-4 h-4 text-yellow-400" />
            <p className="text-xs text-slate-400">Comentários</p>
          </div>
          <p className="text-2xl font-bold text-white">{totals.comments.toLocaleString()}</p>
        </div>

        <div className="bg-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Share2 className="w-4 h-4 text-green-400" />
            <p className="text-xs text-slate-400">Compartilhamentos</p>
          </div>
          <p className="text-2xl font-bold text-white">{totals.shares.toLocaleString()}</p>
        </div>

        <div className="bg-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <p className="text-xs text-slate-400">Engajamento Médio</p>
          </div>
          <p className="text-2xl font-bold text-white">{totals.avgEngagement}%</p>
        </div>
      </div>

      {/* Content List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Metrics Table */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-white">Conteúdo Publicado</h4>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'views' | 'engagement' | 'date')}
              className="bg-slate-700 border border-slate-600 text-white px-2 py-1 rounded text-sm"
            >
              <option value="views">Ordenar por Visualizações</option>
              <option value="engagement">Ordenar por Engajamento</option>
              <option value="date">Ordenar por Data</option>
            </select>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {sortedMetrics.map(content => (
              <div
                key={content.id}
                onClick={() => setSelectedContent(content)}
                className={`p-3 rounded-lg cursor-pointer transition-all border-2 ${
                  selectedContent?.id === content.id
                    ? 'border-green-500 bg-green-900/20'
                    : 'border-slate-600 bg-slate-700 hover:border-slate-500'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h5 className="font-semibold text-white text-sm line-clamp-1">{content.title}</h5>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded text-white ${getPlatformColor(content.platform)}`}>
                        {content.platform}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${getStatusBadge(content.status)}`}>
                        {content.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">{content.engagementRate}%</p>
                    <p className="text-xs text-slate-400">engajamento</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detail View */}
        <div className="lg:col-span-1">
          {selectedContent ? (
            <div className="bg-slate-700 rounded-lg p-4 space-y-4">
              <div>
                <h5 className="font-semibold text-white mb-2">{selectedContent.title}</h5>
                <p className="text-sm text-slate-300">{selectedContent.platform}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800 p-3 rounded">
                  <p className="text-xs text-slate-400">Visualizações</p>
                  <p className="text-lg font-bold text-blue-400">{selectedContent.views.toLocaleString()}</p>
                </div>
                <div className="bg-slate-800 p-3 rounded">
                  <p className="text-xs text-slate-400">Curtidas</p>
                  <p className="text-lg font-bold text-red-400">{selectedContent.likes.toLocaleString()}</p>
                </div>
                <div className="bg-slate-800 p-3 rounded">
                  <p className="text-xs text-slate-400">Comentários</p>
                  <p className="text-lg font-bold text-yellow-400">{selectedContent.comments.toLocaleString()}</p>
                </div>
                <div className="bg-slate-800 p-3 rounded">
                  <p className="text-xs text-slate-400">Compartilhamentos</p>
                  <p className="text-lg font-bold text-green-400">{selectedContent.shares.toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-slate-800 p-3 rounded">
                <p className="text-xs text-slate-400">Taxa de Engajamento</p>
                <div className="mt-2">
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${Math.min(selectedContent.engagementRate * 10, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-sm font-bold text-green-400 mt-2">{selectedContent.engagementRate}%</p>
                </div>
              </div>

              <div className="border-t border-slate-600 pt-4">
                <p className="text-xs text-slate-400">Publicado em</p>
                <p className="text-sm text-white">{selectedContent.publishedAt}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400">
              <p className="text-center">Selecione um conteúdo para ver detalhes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
