import React, { useState } from 'react';
import { Brain, Zap, Settings } from 'lucide-react';

interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  capabilities: string[];
  costPerRequest: number;
  responseTime: string;
  accuracy: number;
}

interface AIModelSelectorProps {
  models?: AIModel[];
  onSelect?: (modelId: string) => void;
  selectedModelId?: string;
}

const DEFAULT_MODELS: AIModel[] = [
  {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'OpenAI',
    description: 'Modelo mais avançado com melhor compreensão e geração de texto',
    capabilities: ['Análise de Texto', 'Geração de Conteúdo', 'Classificação', 'Sumarização'],
    costPerRequest: 0.03,
    responseTime: '2-5s',
    accuracy: 95
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'OpenAI',
    description: 'Modelo rápido e eficiente para tarefas gerais',
    capabilities: ['Análise de Texto', 'Geração de Conteúdo', 'Classificação'],
    costPerRequest: 0.001,
    responseTime: '1-2s',
    accuracy: 88
  },
  {
    id: 'claude-3',
    name: 'Claude 3',
    provider: 'Anthropic',
    description: 'Modelo com excelente compreensão contextual',
    capabilities: ['Análise de Texto', 'Raciocínio', 'Geração de Conteúdo'],
    costPerRequest: 0.015,
    responseTime: '2-4s',
    accuracy: 92
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'Google',
    description: 'Modelo versátil com suporte a múltiplas modalidades',
    capabilities: ['Análise de Texto', 'Visão Computacional', 'Geração de Conteúdo'],
    costPerRequest: 0.005,
    responseTime: '1-3s',
    accuracy: 90
  }
];

export const AIModelSelector: React.FC<AIModelSelectorProps> = ({
  models = DEFAULT_MODELS,
  onSelect,
  selectedModelId
}) => {
  const [selected, setSelected] = useState<string>(selectedModelId || models[0]?.id || '');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const selectedModel = models.find(m => m.id === selected);

  const handleSelect = (modelId: string) => {
    setSelected(modelId);
    onSelect?.(modelId);
  };

  return (
    <div className="ai-model-selector bg-slate-800 border border-slate-700 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">Seletor de Modelo de IA</h3>
      </div>

      {/* Model Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {models.map(model => (
          <div
            key={model.id}
            onClick={() => handleSelect(model.id)}
            className={`p-4 rounded-lg cursor-pointer transition-all border-2 ${
              selected === model.id
                ? 'border-purple-500 bg-purple-900/20'
                : 'border-slate-600 bg-slate-700 hover:border-slate-500'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-semibold text-white">{model.name}</h4>
                <p className="text-xs text-slate-400">{model.provider}</p>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-xs text-yellow-400">${model.costPerRequest}/req</span>
              </div>
            </div>

            <p className="text-sm text-slate-300 mb-3">{model.description}</p>

            {/* Capabilities */}
            <div className="flex flex-wrap gap-1 mb-3">
              {model.capabilities.slice(0, 2).map(cap => (
                <span key={cap} className="text-xs bg-slate-600 text-slate-200 px-2 py-1 rounded">
                  {cap}
                </span>
              ))}
              {model.capabilities.length > 2 && (
                <span className="text-xs bg-slate-600 text-slate-200 px-2 py-1 rounded">
                  +{model.capabilities.length - 2}
                </span>
              )}
            </div>

            {/* Stats */}
            <div className="flex justify-between text-xs text-slate-400">
              <span>⏱️ {model.responseTime}</span>
              <span>✓ {model.accuracy}% acurácia</span>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Model Details */}
      {selectedModel && (
        <div className="bg-slate-700 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-white mb-3">Detalhes do Modelo Selecionado</h4>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm text-slate-400">Modelo</p>
              <p className="text-white font-medium">{selectedModel.name} ({selectedModel.provider})</p>
            </div>

            <div>
              <p className="text-sm text-slate-400">Capacidades</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {selectedModel.capabilities.map(cap => (
                  <span key={cap} className="text-xs bg-purple-600 text-purple-100 px-3 py-1 rounded-full">
                    {cap}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-slate-400">Custo por Requisição</p>
                <p className="text-white font-medium">${selectedModel.costPerRequest}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Tempo de Resposta</p>
                <p className="text-white font-medium">{selectedModel.responseTime}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Acurácia</p>
                <p className="text-white font-medium">{selectedModel.accuracy}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Settings */}
      <div className="border-t border-slate-600 pt-4">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
        >
          <Settings className="w-4 h-4" />
          <span className="text-sm">{showAdvanced ? 'Ocultar' : 'Mostrar'} Configurações Avançadas</span>
        </button>

        {showAdvanced && (
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Temperatura (Criatividade)
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                defaultValue="0.7"
                className="w-full"
              />
              <p className="text-xs text-slate-400 mt-1">0 = Determinístico, 2 = Criativo</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Max Tokens
              </label>
              <input
                type="number"
                defaultValue="2000"
                className="w-full bg-slate-700 border border-slate-600 text-white px-3 py-2 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Top P (Diversidade)
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                defaultValue="0.9"
                className="w-full"
              />
              <p className="text-xs text-slate-400 mt-1">Controla a diversidade de respostas</p>
            </div>
          </div>
        )}
      </div>

      {/* Action Button */}
      <button className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded transition-colors">
        Confirmar Seleção
      </button>
    </div>
  );
};
