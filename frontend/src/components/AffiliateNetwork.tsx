import React, { useState } from 'react';
import { useAffiliates } from '../hooks/useAffiliates';
import { ChevronDown, ChevronRight, Users, TrendingUp } from 'lucide-react';

interface AffiliateNode {
  id: string;
  name: string;
  level: number;
  sales?: number;
  commissions?: number;
  status?: 'active' | 'inactive';
  children?: AffiliateNode[];
}

interface TreeNodeProps {
  node: AffiliateNode;
  expanded: Record<string, boolean>;
  toggleExpanded: (id: string) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, expanded, toggleExpanded }) => {
  const isExpanded = expanded[node.id];
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="affiliate-tree-node">
      <div className="flex items-center gap-2 p-2 hover:bg-slate-700 rounded transition-colors cursor-pointer">
        {hasChildren ? (
          <button
            onClick={() => toggleExpanded(node.id)}
            className="p-0.5 hover:bg-slate-600 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </button>
        ) : (
          <div className="w-4"></div>
        )}

        <div className="flex-1 flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {node.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">{node.name}</p>
            <p className="text-xs text-gray-400">
              Nível {node.level} • {node.sales || 0} vendas
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-sm font-bold text-green-400">
            R$ {(node.commissions || 0).toFixed(2)}
          </p>
          <span className={`text-xs font-medium px-2 py-0.5 rounded ${
            node.status === 'active'
              ? 'bg-green-900 text-green-200'
              : 'bg-gray-700 text-gray-300'
          }`}>
            {node.status === 'active' ? 'Ativo' : 'Inativo'}
          </span>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="ml-4 border-l border-slate-700 pl-2">
          {node.children!.map(child => (
            <TreeNode
              key={child.id}
              node={child}
              expanded={expanded}
              toggleExpanded={toggleExpanded}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const AffiliateNetwork: React.FC = () => {
  const { network, isLoading, error } = useAffiliates();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<'tree' | 'stats'>('tree');

  const toggleExpanded = (id: string) => {
    setExpanded(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Calcular estatísticas
  const calculateStats = (node: AffiliateNode | undefined): { count: number; totalSales: number; totalCommissions: number } => {
    if (!node) return { count: 0, totalSales: 0, totalCommissions: 0 };

    let count = 1;
    let totalSales = node.sales || 0;
    let totalCommissions = node.commissions || 0;

    if (node.children) {
      node.children.forEach(child => {
        const childStats = calculateStats(child);
        count += childStats.count;
        totalSales += childStats.totalSales;
        totalCommissions += childStats.totalCommissions;
      });
    }

    return { count, totalSales, totalCommissions };
  };

  const stats = calculateStats(network);

  if (isLoading) {
    return (
      <div className="affiliate-network bg-slate-900 rounded-lg p-6 border border-slate-700 animate-pulse">
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
      <div className="affiliate-network bg-slate-900 rounded-lg p-6 border border-red-700">
        <p className="text-red-400">Erro ao carregar rede de afiliados: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="affiliate-network bg-slate-900 rounded-lg p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-400" />
          Rede de Afiliados
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('tree')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              viewMode === 'tree'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            Árvore
          </button>
          <button
            onClick={() => setViewMode('stats')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              viewMode === 'stats'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            Estatísticas
          </button>
        </div>
      </div>

      {network ? (
        <div className="space-y-4">
          {/* Resumo */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
              <p className="text-xs text-gray-400 mb-1">Total de Afiliados</p>
              <p className="text-2xl font-bold text-white">{stats.count}</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
              <p className="text-xs text-gray-400 mb-1">Vendas Totais</p>
              <p className="text-2xl font-bold text-blue-400">{stats.totalSales}</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
              <p className="text-xs text-gray-400 mb-1">Comissões Totais</p>
              <p className="text-2xl font-bold text-green-400">
                R$ {stats.totalCommissions.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Conteúdo */}
          {viewMode === 'tree' ? (
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 max-h-96 overflow-y-auto">
              <TreeNode
                node={network}
                expanded={expanded}
                toggleExpanded={toggleExpanded}
              />
            </div>
          ) : (
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Análise de Performance
              </h4>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-300">Taxa de Ativação</span>
                    <span className="text-sm font-medium text-white">85%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-300">Crescimento Mensal</span>
                    <span className="text-sm font-medium text-white">+12%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-300">Comissão Média</span>
                    <span className="text-sm font-medium text-white">R$ {(stats.totalCommissions / stats.count).toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '70%' }}></div>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-slate-700 rounded-lg border border-slate-600">
                <p className="text-xs text-gray-300">
                  <strong>Insight:</strong> Sua rede está crescendo bem! Continue engajando seus afiliados 
                  para manter o crescimento acelerado.
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-gray-400 text-center py-8">Nenhuma rede encontrada.</p>
      )}
    </div>
  );
};
