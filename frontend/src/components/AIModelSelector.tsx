import React, { useState } from 'react';
import { Zap, Brain, Settings } from 'lucide-react';

interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  capabilities: string[];
  costPerRequest: number;
  responseTime: string;
  isActive: boolean;
}

export const AIModelSelector: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<string>('gpt-4');
  const [showSettings, setShowSettings] = useState(false);

  const aiModels: AIModel[] = [
    {
      id: 'gpt-4',
      name: 'GPT-4',
      provider: 'OpenAI',
      description: 'Modelo mais avançado com melhor compreensão contextual',
      capabilities: ['Análise profunda', 'Criação de conteúdo', 'Código'],
      costPerRequest: 0.03,
      responseTime: '2-5s',
      isActive: true,
    },
    {
      id: 'gpt-3.5',
      name: 'GPT-3.5 Turbo',
      provider: 'OpenAI',
      description: 'Modelo rápido e eficiente para tarefas gerais',
      capabilities: ['Conteúdo geral', 'Resumos', 'Assistência'],
      costPerRequest: 0.001,
      responseTime: '1-2s',
      isActive: true,
    },
    {
      id: 'claude-3',
      name: 'Claude 3 Opus',
      provider: 'Anthropic',
      description: 'Modelo com excelente raciocínio e análise',
      capabilities: ['Análise complexa', 'Pesquisa', 'Redação'],
      costPerRequest: 0.015,
      responseTime: '3-6s',
      isActive: true,
    },
    {
      id: 'gemini-pro',
      name: 'Gemini Pro',
      provider: 'Google',
      description: 'Modelo multimodal com suporte a imagens',
      capabilities: ['Análise de imagens', 'Conteúdo visual', 'Código'],
      costPerRequest: 0.005,
      responseTime: '2-4s',
      isActive: true,
    },
    {
      id: 'llama-2',
      name: 'Llama 2',
      provider: 'Meta',
      description: 'Modelo open-source para uso local',
      capabilities: ['Processamento local', 'Privacidade', 'Customização'],
      costPerRequest: 0.0,
      responseTime: '1-3s',
      isActive: false,
    },
  ];

  const currentModel = aiModels.find(m => m.id === selectedModel);

  return (
    <div className="ai-model-selector bg-slate-900 rounded-lg p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          Seletor de Modelos IA
        </h3>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
        >
          <Settings className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Modelo atualmente selecionado */}
        {currentModel && (
          <div className="bg-gradient-to-r from-purple-900 to-blue-900 rounded-lg p-4 border border-purple-700">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="text-lg font-semibold text-white">{currentModel.name}</h4>
                <p className="text-sm text-purple-200">{currentModel.provider}</p>
              </div>
              <Zap className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-sm text-gray-300 mb-3">{currentModel.description}</p>
            
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="bg-slate-800 rounded p-2">
                <p className="text-gray-400">Tempo Resposta</p>
                <p className="text-white font-medium">{currentModel.responseTime}</p>
              </div>
              <div className="bg-slate-800 rounded p-2">
                <p className="text-gray-400">Custo/Requisição</p>
                <p className="text-white font-medium">
                  {currentModel.costPerRequest === 0 ? 'Grátis' : `$${currentModel.costPerRequest.toFixed(4)}`}
                </p>
              </div>
              <div className="bg-slate-800 rounded p-2">
                <p className="text-gray-400">Status</p>
                <p className={`font-medium ${currentModel.isActive ? 'text-green-400' : 'text-gray-400'}`}>
                  {currentModel.isActive ? 'Ativo' : 'Inativo'}
                </p>
              </div>
            </div>

            <div className="mt-3">
              <p className="text-xs text-gray-400 mb-2">Capacidades:</p>
              <div className="flex flex-wrap gap-2">
                {currentModel.capabilities.map((cap) => (
                  <span
                    key={cap}
                    className="bg-purple-800 text-purple-200 text-xs px-2 py-1 rounded"
                  >
                    {cap}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Lista de modelos disponíveis */}
        <div className="bg-slate-800 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Modelos Disponíveis
          </label>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {aiModels.map((model) => (
              <button
                key={model.id}
                onClick={() => setSelectedModel(model.id)}
                disabled={!model.isActive}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedModel === model.id
                    ? 'bg-purple-600 border border-purple-500'
                    : model.isActive
                    ? 'bg-slate-700 border border-slate-600 hover:bg-slate-600'
                    : 'bg-slate-900 border border-slate-700 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">{model.name}</p>
                    <p className="text-xs text-gray-400">{model.provider}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-300">${model.costPerRequest.toFixed(4)}</p>
                    {!model.isActive && (
                      <p className="text-xs text-gray-500">Indisponível</p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Configurações avançadas */}
        {showSettings && (
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <h4 className="text-sm font-semibold text-white mb-3">Configurações Avançadas</h4>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Temperatura (0 - 1)
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  defaultValue="0.7"
                  className="w-full"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Controla a criatividade das respostas
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Max Tokens
                </label>
                <input
                  type="number"
                  defaultValue="2000"
                  className="w-full bg-slate-700 text-white rounded px-2 py-1 text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Comprimento máximo da resposta
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm text-gray-300">
                  <input type="checkbox" defaultChecked className="rounded" />
                  Usar cache de respostas
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Botão de ação */}
        <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 rounded-lg transition-colors">
          Usar Modelo Selecionado
        </button>
      </div>
    </div>
  );
};
