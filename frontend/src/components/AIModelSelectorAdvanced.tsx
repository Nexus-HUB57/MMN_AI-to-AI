/**
 * AIModelSelectorAdvanced - Componente avançado para seleção de modelos de IA
 * Sprint 4: IA Content Hub Avançado
 * 
 * Features:
 * - Seleção de múltiplos modelos (Google Gemini, OpenAI GPT, Modelos Proprietários)
 * - Comparação de custos e performance
 * - Configurações avançadas (temperatura, max tokens, etc)
 * - Status em tempo real dos modelos
 * - Histórico de uso
 */

import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Zap,
  TrendingUp,
  Clock,
  DollarSign,
  Settings,
  RefreshCw,
  Check,
  AlertCircle,
  Sparkles,
  Database,
} from "lucide-react";
import { toast } from "sonner";

interface AIModel {
  id: string;
  name: string;
  provider: "google" | "openai" | "proprietary";
  description: string;
  capabilities: string[];
  costPerRequest: number;
  responseTime: string;
  isActive: boolean;
  maxTokens: number;
  temperature: number;
  lastUsed?: Date;
  usageCount?: number;
}

interface ModelStats {
  totalModels: number;
  activeModels: number;
  providers: {
    google: number;
    openai: number;
    proprietary: number;
  };
  models: Array<{
    id: string;
    name: string;
    provider: string;
    isActive: boolean;
  }>;
}

export default function AIModelSelectorAdvanced() {
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [activeTab, setActiveTab] = useState("overview");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2000);

  const modelsQuery = trpc.aiContentHub.listModels.useQuery(undefined, {
    staleTime: 60_000,
    retry: 1,
  });
  const statsQuery = trpc.aiContentHub.getModelStats.useQuery(undefined, {
    staleTime: 60_000,
    retry: 1,
  });

  const aiModels: AIModel[] = modelsQuery.data?.models ?? [];
  const modelStats: ModelStats = statsQuery.data?.stats ?? {
    totalModels: aiModels.length,
    activeModels: aiModels.filter((model) => model.isActive).length,
    providers: {
      google: aiModels.filter((model) => model.provider === "google").length,
      openai: aiModels.filter((model) => model.provider === "openai").length,
      proprietary: aiModels.filter((model) => model.provider === "proprietary").length,
    },
    models: aiModels.map((model) => ({
      id: model.id,
      name: model.name,
      provider: model.provider,
      isActive: model.isActive,
    })),
  };
  const isLoading = modelsQuery.isLoading || statsQuery.isLoading;

  useEffect(() => {
    if (!selectedModel && aiModels.length > 0) {
      setSelectedModel(aiModels[0].id);
      setTemperature(aiModels[0].temperature ?? 0.7);
      setMaxTokens(aiModels[0].maxTokens ?? 2000);
    }
  }, [aiModels, selectedModel]);

  useEffect(() => {
    if (modelsQuery.error || statsQuery.error) {
      console.error("Erro ao carregar modelos de IA:", modelsQuery.error ?? statsQuery.error);
      toast.error("Erro ao carregar modelos de IA");
    }
  }, [modelsQuery.error, statsQuery.error]);

  const currentModel = aiModels.find((m) => m.id === selectedModel);

  useEffect(() => {
    if (currentModel) {
      setTemperature(currentModel.temperature ?? 0.7);
      setMaxTokens(currentModel.maxTokens ?? 2000);
    }
  }, [currentModel?.id]);

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case "google":
        return "bg-blue-900 text-blue-200 border-blue-700";
      case "openai":
        return "bg-green-900 text-green-200 border-green-700";
      case "proprietary":
        return "bg-purple-900 text-purple-200 border-purple-700";
      default:
        return "bg-slate-700 text-slate-200";
    }
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? (
      <Check className="w-4 h-4 text-green-400" />
    ) : (
      <AlertCircle className="w-4 h-4 text-yellow-400" />
    );
  };

  if (isLoading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-cyan-500 mx-auto mb-4 animate-spin" />
          <p className="text-slate-400">Carregando modelos de IA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header com estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total de Modelos</p>
                <p className="text-2xl font-bold text-white">{modelStats.totalModels}</p>
              </div>
              <Database className="w-8 h-8 text-cyan-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Modelos Ativos</p>
                <p className="text-2xl font-bold text-white">{modelStats.activeModels}</p>
              </div>
              <Check className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Provedores</p>
                <p className="text-2xl font-bold text-white">
                  {modelStats.providers.google || 0}G + {modelStats.providers.openai || 0}O + {modelStats.providers.proprietary || 0}P
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Custo Médio</p>
                <p className="text-2xl font-bold text-white">
                  ${aiModels.length > 0
                    ? (
                        aiModels.reduce((sum, m) => sum + m.costPerRequest, 0) / aiModels.length
                      ).toFixed(4)
                    : "0.0000"}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-900 border border-slate-700 rounded-lg p-1">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-500 data-[state=active]:text-slate-950 rounded-md transition-all"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger
            value="comparison"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-500 data-[state=active]:text-slate-950 rounded-md transition-all"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Comparação
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-500 data-[state=active]:text-slate-950 rounded-md transition-all"
          >
            <Settings className="w-4 h-4 mr-2" />
            Configurações
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Seletor de Modelo */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Selecionar Modelo</CardTitle>
              <CardDescription className="text-slate-400">
                Escolha o modelo de IA para gerar conteúdo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {aiModels.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex items-center gap-2">
                        {model.name}
                        {model.isActive ? (
                          <Check className="w-3 h-3 text-green-400" />
                        ) : (
                          <AlertCircle className="w-3 h-3 text-yellow-400" />
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Detalhes do Modelo Selecionado */}
          {currentModel && (
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-white">{currentModel.name}</CardTitle>
                    <CardDescription className="text-slate-400">
                      {currentModel.description}
                    </CardDescription>
                  </div>
                  <Badge className={getProviderColor(currentModel.provider)}>
                    {currentModel.provider.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Métricas */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-700 rounded-lg p-3">
                    <p className="text-slate-400 text-xs mb-1">Tempo de Resposta</p>
                    <p className="text-white font-semibold flex items-center gap-1">
                      <Clock className="w-4 h-4 text-cyan-400" />
                      {currentModel.responseTime}
                    </p>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-3">
                    <p className="text-slate-400 text-xs mb-1">Custo/Requisição</p>
                    <p className="text-white font-semibold flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-yellow-400" />
                      ${currentModel.costPerRequest.toFixed(4)}
                    </p>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-3">
                    <p className="text-slate-400 text-xs mb-1">Max Tokens</p>
                    <p className="text-white font-semibold">{currentModel.maxTokens.toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-3">
                    <p className="text-slate-400 text-xs mb-1">Status</p>
                    <p className="text-white font-semibold flex items-center gap-1">
                      {getStatusIcon(currentModel.isActive)}
                      {currentModel.isActive ? "Ativo" : "Inativo"}
                    </p>
                  </div>
                </div>

                {/* Capacidades */}
                <div>
                  <p className="text-sm font-semibold text-white mb-3">Capacidades</p>
                  <div className="flex flex-wrap gap-2">
                    {currentModel.capabilities.map((cap) => (
                      <Badge
                        key={cap}
                        className="bg-purple-900 text-purple-200 border-purple-700"
                      >
                        {cap}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Uso */}
                {currentModel.usageCount !== undefined && (
                  <div className="bg-slate-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-white">Histórico de Uso</p>
                      <Zap className="w-4 h-4 text-yellow-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">{currentModel.usageCount}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Última utilização:{" "}
                      {currentModel.lastUsed
                        ? new Date(currentModel.lastUsed).toLocaleString()
                        : "Nunca utilizado"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="comparison" className="space-y-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Comparação de Modelos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">Modelo</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">Provedor</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">Resposta</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">Custo</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">Tokens</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {aiModels.map((model) => (
                      <tr
                        key={model.id}
                        className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors"
                      >
                        <td className="py-3 px-4 text-white font-medium">{model.name}</td>
                        <td className="py-3 px-4">
                          <Badge className={getProviderColor(model.provider)}>
                            {model.provider}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-slate-300">{model.responseTime}</td>
                        <td className="py-3 px-4 text-yellow-400 font-semibold">
                          ${model.costPerRequest.toFixed(4)}
                        </td>
                        <td className="py-3 px-4 text-slate-300">{model.maxTokens.toLocaleString()}</td>
                        <td className="py-3 px-4">
                          {model.isActive ? (
                            <span className="text-green-400 flex items-center gap-1">
                              <Check className="w-4 h-4" />
                              Ativo
                            </span>
                          ) : (
                            <span className="text-yellow-400 flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" />
                              Inativo
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Configurações Avançadas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-3">
                  Temperatura: {temperature.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-xs text-slate-400 mt-2">
                  Controla a criatividade das respostas (0 = determinístico, 1 = criativo)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-3">
                  Max Tokens: {maxTokens.toLocaleString()}
                </label>
                <input
                  type="range"
                  min="256"
                  max="8192"
                  step="256"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-xs text-slate-400 mt-2">
                  Comprimento máximo da resposta em tokens
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-slate-950 font-semibold"
                  onClick={() => toast.success(`Configurações aplicadas ao modelo ${currentModel?.name ?? "selecionado"}`)}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Aplicar Configurações
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                  onClick={() => {
                    setTemperature(currentModel?.temperature ?? 0.7);
                    setMaxTokens(currentModel?.maxTokens ?? 2000);
                    toast.success("Configurações padrão restauradas");
                  }}
                >
                  Restaurar Padrões
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Botão de ação principal */}
      <Button
        className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-slate-950 font-semibold py-6 text-lg"
        onClick={() => toast.success(`Modelo ${currentModel?.name ?? "selecionado"} pronto para uso`)}
        disabled={!currentModel}
      >
        <Sparkles className="w-5 h-5 mr-2" />
        Usar Modelo Selecionado
      </Button>
    </div>
  );
}
