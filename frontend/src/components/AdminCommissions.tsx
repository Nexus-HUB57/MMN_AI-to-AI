import React, { useState } from 'react';
import { Percent, Plus, Edit2, Trash2, Save, X } from 'lucide-react';

interface CommissionRule {
  id: string;
  productCategory: string;
  basePercentage: number;
  bonusPercentage: number;
  minSales: number;
  maxSales?: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export const AdminCommissions: React.FC = () => {
  const [rules, setRules] = useState<CommissionRule[]>([
    {
      id: '1',
      productCategory: 'Produtos Premium',
      basePercentage: 10,
      bonusPercentage: 2,
      minSales: 0,
      maxSales: undefined,
      status: 'active',
      createdAt: '2026-05-01',
    },
    {
      id: '2',
      productCategory: 'Produtos Básicos',
      basePercentage: 5,
      bonusPercentage: 1,
      minSales: 0,
      maxSales: undefined,
      status: 'active',
      createdAt: '2026-05-01',
    },
    {
      id: '3',
      productCategory: 'Serviços',
      basePercentage: 15,
      bonusPercentage: 3,
      minSales: 5000,
      maxSales: undefined,
      status: 'active',
      createdAt: '2026-04-15',
    },
  ]);

  const [showNewRule, setShowNewRule] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newRule, setNewRule] = useState({
    productCategory: '',
    basePercentage: 0,
    bonusPercentage: 0,
    minSales: 0,
    maxSales: '',
  });

  const handleAddRule = () => {
    if (newRule.productCategory && newRule.basePercentage > 0) {
      const rule: CommissionRule = {
        id: String(rules.length + 1),
        productCategory: newRule.productCategory,
        basePercentage: newRule.basePercentage,
        bonusPercentage: newRule.bonusPercentage,
        minSales: newRule.minSales,
        maxSales: newRule.maxSales ? parseInt(newRule.maxSales) : undefined,
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setRules([...rules, rule]);
      setNewRule({
        productCategory: '',
        basePercentage: 0,
        bonusPercentage: 0,
        minSales: 0,
        maxSales: '',
      });
      setShowNewRule(false);
    }
  };

  const deleteRule = (id: string) => {
    setRules(rules.filter(r => r.id !== id));
  };

  const toggleStatus = (id: string) => {
    setRules(rules.map(r =>
      r.id === id
        ? { ...r, status: r.status === 'active' ? 'inactive' : 'active' }
        : r
    ));
  };

  // Calcular comissão estimada
  const calculateCommission = (sales: number, rule: CommissionRule) => {
    let commission = (sales * rule.basePercentage) / 100;
    if (sales >= rule.minSales) {
      commission += (sales * rule.bonusPercentage) / 100;
    }
    return commission;
  };

  return (
    <div className="admin-commissions bg-slate-900 rounded-lg p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Percent className="w-5 h-5 text-purple-400" />
          Configuração de Comissões
        </h3>
        <button
          onClick={() => setShowNewRule(!showNewRule)}
          className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Nova Regra
        </button>
      </div>

      <div className="space-y-4">
        {/* Nova regra */}
        {showNewRule && (
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 space-y-3">
            <h4 className="text-sm font-semibold text-white">Criar Nova Regra de Comissão</h4>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Categoria de Produto"
                value={newRule.productCategory}
                onChange={(e) => setNewRule({ ...newRule, productCategory: e.target.value })}
                className="bg-slate-700 text-white rounded px-3 py-2 text-sm placeholder-gray-500"
              />
              <div>
                <label className="text-xs text-gray-400">Comissão Base (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={newRule.basePercentage}
                  onChange={(e) => setNewRule({ ...newRule, basePercentage: parseFloat(e.target.value) })}
                  className="w-full bg-slate-700 text-white rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400">Bônus (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={newRule.bonusPercentage}
                  onChange={(e) => setNewRule({ ...newRule, bonusPercentage: parseFloat(e.target.value) })}
                  className="w-full bg-slate-700 text-white rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400">Vendas Mínimas (R$)</label>
                <input
                  type="number"
                  min="0"
                  value={newRule.minSales}
                  onChange={(e) => setNewRule({ ...newRule, minSales: parseFloat(e.target.value) })}
                  className="w-full bg-slate-700 text-white rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400">Vendas Máximas (R$) - Opcional</label>
                <input
                  type="number"
                  min="0"
                  value={newRule.maxSales}
                  onChange={(e) => setNewRule({ ...newRule, maxSales: e.target.value })}
                  className="w-full bg-slate-700 text-white rounded px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAddRule}
                className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                Criar Regra
              </button>
              <button
                onClick={() => setShowNewRule(false)}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Resumo */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
            <p className="text-xs text-gray-400 mb-1">Total de Regras</p>
            <p className="text-2xl font-bold text-white">{rules.length}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
            <p className="text-xs text-gray-400 mb-1">Ativas</p>
            <p className="text-2xl font-bold text-green-400">{rules.filter(r => r.status === 'active').length}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
            <p className="text-xs text-gray-400 mb-1">Inativas</p>
            <p className="text-2xl font-bold text-gray-400">{rules.filter(r => r.status === 'inactive').length}</p>
          </div>
        </div>

        {/* Lista de regras */}
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 space-y-3">
          <h4 className="text-sm font-semibold text-white">Regras de Comissão</h4>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="bg-slate-700 rounded-lg p-3 border border-slate-600 hover:border-slate-500 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h5 className="text-sm font-medium text-white">{rule.productCategory}</h5>
                    <p className="text-xs text-gray-400">{rule.createdAt}</p>
                  </div>
                  <button
                    onClick={() => toggleStatus(rule.id)}
                    className={`text-xs font-medium px-2 py-1 rounded ${
                      rule.status === 'active'
                        ? 'bg-green-900 text-green-200'
                        : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    {rule.status === 'active' ? '✓ Ativo' : '→ Inativo'}
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-2 mb-3 text-xs">
                  <div>
                    <p className="text-gray-400">Comissão Base</p>
                    <p className="text-white font-bold">{rule.basePercentage}%</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Bônus</p>
                    <p className="text-white font-bold">{rule.bonusPercentage}%</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Vendas Mín.</p>
                    <p className="text-white font-bold">R$ {rule.minSales.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Exemplo (R$ 1.000)</p>
                    <p className="text-green-400 font-bold">
                      R$ {calculateCommission(1000, rule).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-1 bg-slate-600 hover:bg-slate-500 text-white text-xs py-1 rounded transition-colors">
                    <Edit2 className="w-3 h-3" />
                    Editar
                  </button>
                  <button
                    onClick={() => deleteRule(rule.id)}
                    className="flex-1 flex items-center justify-center gap-1 bg-red-900 hover:bg-red-800 text-red-200 text-xs py-1 rounded transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Deletar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Calculadora de comissão */}
        <div className="bg-gradient-to-r from-purple-900 to-blue-900 rounded-lg p-4 border border-purple-700">
          <h4 className="text-sm font-semibold text-white mb-3">Calculadora de Comissão</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-purple-200 mb-1">
                Valor de Vendas
              </label>
              <input
                type="number"
                placeholder="0.00"
                className="w-full bg-slate-700 text-white rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-purple-200 mb-1">
                Categoria
              </label>
              <select className="w-full bg-slate-700 text-white rounded px-3 py-2 text-sm">
                {rules.map(rule => (
                  <option key={rule.id}>{rule.productCategory}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
