import React, { useState } from 'react';
import { useAffiliates } from '../hooks/useAffiliates';
import { Network, ChevronDown, ChevronRight, Users } from 'lucide-react';

interface AffiliateNode {
  id: string;
  name: string;
  email?: string;
  level: number;
  status?: 'active' | 'inactive';
  commissions?: number;
  children?: AffiliateNode[];
}

interface TreeNodeProps {
  node: AffiliateNode;
  expanded: { [key: string]: boolean };
  onToggle: (id: string) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, expanded, onToggle }) => {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expanded[node.id];

  const getStatusColor = (status?: string): string => {
    switch (status) {
      case 'active':
        return 'bg-green-600';
      case 'inactive':
        return 'bg-red-600';
      default:
        return 'bg-slate-600';
    }
  };

  const getStatusLabel = (status?: string): string => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'inactive':
        return 'Inativo';
      default:
        return 'Desconhecido';
    }
  };

  return (
    <div className="tree-node">
      <div className="flex items-center gap-2 py-2 px-3 hover:bg-slate-700 rounded cursor-pointer transition-colors">
        {hasChildren ? (
          <button
            onClick={() => onToggle(node.id)}
            className="flex-shrink-0 w-5 h-5 flex items-center justify-center hover:bg-slate-600 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400" />
            )}
          </button>
        ) : (
          <div className="w-5" />
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
              {node.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{node.name}</p>
              {node.email && <p className="text-xs text-slate-400 truncate">{node.email}</p>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {node.commissions !== undefined && (
            <span className="text-xs text-green-400 font-semibold">
              R$ {node.commissions.toFixed(2)}
            </span>
          )}
          {node.status && (
            <span className={`text-xs px-2 py-1 rounded text-white ${getStatusColor(node.status)}`}>
              {getStatusLabel(node.status)}
            </span>
          )}
          <span className="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded">
            Nível {node.level}
          </span>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="border-l border-slate-600 ml-6 pl-0">
          {node.children!.map(child => (
            <TreeNode key={child.id} node={child} expanded={expanded} onToggle={onToggle} />
          ))}
        </div>
      )}
    </div>
  );
};

export const AffiliateNetwork: React.FC = () => {
  const { network, isLoading, error } = useAffiliates();
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const toggleNode = (id: string) => {
    setExpanded(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const expandAll = () => {
    const allIds: string[] = [];
    const collectIds = (node: AffiliateNode) => {
      allIds.push(node.id);
      if (node.children) {
        node.children.forEach(collectIds);
      }
    };
    if (network) collectIds(network);
    setExpanded(allIds.reduce((acc, id) => ({ ...acc, [id]: true }), {}));
  };

  const collapseAll = () => {
    setExpanded({});
  };

  // Count statistics
  const countNodes = (node: AffiliateNode | undefined): number => {
    if (!node) return 0;
    let count = 1;
    if (node.children) {
      count += node.children.reduce((sum, child) => sum + countNodes(child), 0);
    }
    return count;
  };

  const getTotalCommissions = (node: AffiliateNode | undefined): number => {
    if (!node) return 0;
    let total = node.commissions || 0;
    if (node.children) {
      total += node.children.reduce((sum, child) => sum + getTotalCommissions(child), 0);
    }
    return total;
  };

  if (isLoading) {
    return (
      <div className="affiliate-network bg-slate-800 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-400">Carregando rede de afiliados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="affiliate-network bg-slate-800 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-red-400">Erro ao carregar rede de afiliados: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="affiliate-network bg-slate-800 border border-slate-700 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <Network className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Rede de Afiliados</h3>
      </div>

      {network ? (
        <>
          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-700 rounded-lg p-4">
              <p className="text-xs text-slate-400 mb-1">Total de Afiliados</p>
              <p className="text-2xl font-bold text-white">{countNodes(network)}</p>
            </div>
            <div className="bg-slate-700 rounded-lg p-4">
              <p className="text-xs text-slate-400 mb-1">Comissões Totais</p>
              <p className="text-2xl font-bold text-green-400">R$ {getTotalCommissions(network).toFixed(2)}</p>
            </div>
            <div className="bg-slate-700 rounded-lg p-4">
              <p className="text-xs text-slate-400 mb-1">Profundidade da Rede</p>
              <p className="text-2xl font-bold text-blue-400">{network.level || 1} níveis</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              <button
                onClick={expandAll}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors"
              >
                Expandir Tudo
              </button>
              <button
                onClick={collapseAll}
                className="text-xs bg-slate-600 hover:bg-slate-500 text-white px-3 py-1 rounded transition-colors"
              >
                Recolher Tudo
              </button>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
              className="text-xs bg-slate-700 border border-slate-600 text-white px-3 py-1 rounded"
            >
              <option value="all">Todos os Status</option>
              <option value="active">Apenas Ativos</option>
              <option value="inactive">Apenas Inativos</option>
            </select>
          </div>

          {/* Tree View */}
          <div className="bg-slate-700 rounded-lg p-4 max-h-96 overflow-y-auto">
            <TreeNode node={network} expanded={expanded} onToggle={toggleNode} />
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-600"></div>
              <span className="text-slate-400">Ativo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-600"></div>
              <span className="text-slate-400">Inativo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-600"></div>
              <span className="text-slate-400">Desconhecido</span>
            </div>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-400">Nenhuma rede encontrada.</p>
        </div>
      )}
    </div>
  );
};
