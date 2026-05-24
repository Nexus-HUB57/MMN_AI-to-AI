import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, RefreshCw, CheckCircle2, AlertCircle, Zap, Brain, TrendingUp, Sparkles, Clock, Star } from "lucide-react";
import { toast } from "sonner";

/**
 * AI Sync Dashboard
 *
 * Dashboard completo para gerenciamento de sincronização entre Agentes IA,
 * Skills e Modelos de IA. Permite visualizar status, sincronizar skills,
 * e monitorar performance.
 *
 * Features:
 * - Visualização do perfil de sincronização do agente
 * - Sincronização manual de skills
 * - Recomendações de modelos por categoria
 * - Monitoramento de capabilities por nível
 * - Histórico de sincronizações
 */
export default function AISyncDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncHistory, setSyncHistory] = useState<Array<{date: Date, status: string, skills: number}>>([]);

  // Get sync profile for current agent
  const { data: syncProfile, isLoading: profileLoading, refetch: refetchProfile } = trpc.aiSync.getMySyncProfile.useQuery(undefined, {
    enabled: !!user,
    retry: false,
  });

  // Get recommended models
  const { data: recommendedModels } = trpc.aiSync.getRecommendedModels.useQuery(undefined, {
    enabled: !!user,
  });

  // Get level capabilities
  const { data: levelCapabilities } = trpc.aiSync.getLevelCapabilities.useQuery(
    { level: "advanced" },
    { enabled: !!user }
  );

  // Sync mutation
  const syncMutation = trpc.aiSync.syncMyAgent.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toast.success(`Sincronização concluída! ${result.skillsSynced} skills sincronizadas.`);
        setSyncHistory(prev => [
          { date: new Date(), status: "success", skills: result.skillsSynced },
          ...prev.slice(0, 9) // Keep last 10
        ]);
      } else {
        toast.error(`Falha na sincronização: ${result.errors.join(", ")}`);
        setSyncHistory(prev => [
          { date: new Date(), status: "error", skills: 0 },
          ...prev.slice(0, 9)
        ]);
      }
      setIsSyncing(false);
      refetchProfile();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao sincronizar");
      setIsSyncing(false);
      setSyncHistory(prev => [
        { date: new Date(), status: "error", skills: 0 },
        ...prev.slice(0, 9)
      ]);
    },
  });

  const handleSync = () => {
    setIsSyncing(true);
    syncMutation.mutate();
  };

  // Loading state
  if (authLoading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Carregando perfil de sincronização...</p>
        </div>
      </div>
    );
  }

  // Auth required
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Autenticação Necessária</CardTitle>
            <CardDescription>Faça login para acessar o dashboard de sincronização</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const statusColors = {
    learning: "bg-blue-100 text-blue-800 border-blue-200",
    active: "bg-green-100 text-green-800 border-green-200",
    paused: "bg-yellow-100 text-yellow-800 border-yellow-200",
    inactive: "bg-gray-100 text-gray-800 border-gray-200",
  };

  const levelColors = {
    basic: "bg-blue-500",
    intermediate: "bg-purple-500",
    advanced: "bg-amber-500",
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            AI Sync Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie a sincronização entre seu agente, skills e modelos de IA
          </p>
        </div>
        <Button
          onClick={handleSync}
          disabled={isSyncing || !syncProfile}
          className="gap-2"
        >
          {isSyncing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sincronizando...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Sincronizar Agente
            </>
          )}
        </Button>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="skills" className="gap-2">
            <Star className="h-4 w-4" />
            Skills
          </TabsTrigger>
          <TabsTrigger value="models" className="gap-2">
            <Zap className="h-4 w-4" />
            Modelos
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <Clock className="h-4 w-4" />
            Histórico
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Skills Count Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Skills Ativas</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{syncProfile?.currentSkills.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {syncProfile?.currentSkills.length === 0 ? "Nenhuma skill ativa" : "Skills configuradas"}
                </p>
              </CardContent>
            </Card>

            {/* Models Count Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Modelos Disponíveis</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{syncProfile?.availableModels.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {syncProfile?.availableModels.length === 0 ? "Nenhum modelo" : "Modelos configurados"}
                </p>
              </CardContent>
            </Card>

            {/* Sync Status Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Última Sincronização</CardTitle>
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">
                  {syncHistory.length > 0 ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Sucesso
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-sm">Nunca sincronizado</span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Performance Score Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ações Recomendadas</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{syncProfile?.recommendedActions.length || 0}</div>
                <p className="text-xs text-muted-foreground">Sugestões para seu agente</p>
              </CardContent>
            </Card>
          </div>

          {/* Recommended Actions */}
          {syncProfile?.recommendedActions && syncProfile.recommendedActions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Ações Recomendadas
                </CardTitle>
                <CardDescription>
                  based nas suas skills atuais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {syncProfile.recommendedActions.map((action, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Capabilities by Level */}
          {levelCapabilities && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Capabilities por Nível
                </CardTitle>
                <CardDescription>
                  Funcionalidades disponíveis em cada nível de skill
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${levelColors.basic}`} />
                      <span className="font-medium">Básico</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["text_generation", "basic_analytics", "scheduling"].map((cap) => (
                      <Badge key={cap} variant="secondary">{cap}</Badge>
                    ))}
                  </div>
                </div>

                {/* Intermediate */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${levelColors.intermediate}`} />
                      <span className="font-medium">Intermediário</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["text_generation", "image_generation", "analytics", "automation", "scheduling"].map((cap) => (
                      <Badge key={cap} variant="secondary">{cap}</Badge>
                    ))}
                  </div>
                </div>

                {/* Advanced */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${levelColors.advanced}`} />
                      <span className="font-medium">Avançado</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["text_generation", "image_generation", "video_generation", "analytics", "automation", "scheduling", "advanced_seo", "multi_channel"].map((cap) => (
                      <Badge key={cap} variant="secondary">{cap}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills" className="space-y-6">
          {syncProfile?.currentSkills && syncProfile.currentSkills.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {syncProfile.currentSkills.map((skill) => (
                <Card key={skill.skillId} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-base">{skill.skillName}</CardTitle>
                        <Badge
                          className={
                            skill.level === "advanced" ? "bg-amber-500" :
                            skill.level === "intermediate" ? "bg-purple-500" : "bg-blue-500"
                          }
                        >
                          {skill.level}
                        </Badge>
                      </div>
                      <div className={`w-3 h-3 rounded-full mt-2 ${
                        skill.level === "advanced" ? "bg-amber-500" :
                        skill.level === "intermediate" ? "bg-purple-500" : "bg-blue-500"
                      }`} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Categoria</p>
                      <Badge variant="outline">{skill.category}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Modelos Recomendados</p>
                      <div className="flex flex-wrap gap-1">
                        {skill.recommendedModels.map((model) => (
                          <Badge key={model} variant="secondary" className="text-xs">
                            {model}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Capabilities</p>
                      <div className="flex flex-wrap gap-1">
                        {skill.capabilities.slice(0, 3).map((cap) => (
                          <Badge key={cap} variant="outline" className="text-xs">
                            {cap}
                          </Badge>
                        ))}
                        {skill.capabilities.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{skill.capabilities.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center space-y-4">
                  <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="font-medium text-lg">Nenhuma Skill Ativa</h3>
                    <p className="text-muted-foreground">
                      Adquira skills no marketplace para começar a usar seu agente IA
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => window.location.href = "/packs"}>
                    Ver Marketplace de Skills
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Models Tab */}
        <TabsContent value="models" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Modelos Recomendados por Categoria
              </CardTitle>
              <CardDescription>
                Modelos de IA recomendados para cada categoria de skill
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recommendedModels && recommendedModels.length > 0 ? (
                <div className="space-y-4">
                  {recommendedModels.map(({ category, models }) => (
                    <div key={category} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          category === "mmn" ? "bg-yellow-100 text-yellow-700" :
                          category === "analytics" ? "bg-blue-100 text-blue-700" :
                          category === "automation" ? "bg-green-100 text-green-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>
                          <Brain className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium capitalize">{category.replace("_", " ")}</p>
                          <p className="text-sm text-muted-foreground">
                            {models.length} modelo(s) disponível(is)
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {models.map((model) => (
                          <Badge key={model} variant="outline" className="capitalize">
                            {model.replace("-", " ")}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Carregando modelos recomendados...</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Available Models in Profile */}
          {syncProfile?.availableModels && syncProfile.availableModels.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Modelos Disponíveis para Seu Agente</CardTitle>
                <CardDescription>
                  Modelos configurados com base nas suas skills
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {syncProfile.availableModels.map((model) => (
                    <div key={model} className="flex items-center gap-2 p-3 border rounded-lg">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="font-medium capitalize text-sm">{model.replace("-", " ")}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Histórico de Sincronizações
              </CardTitle>
              <CardDescription>
                Últimas sincronizações do seu agente
              </CardDescription>
            </CardHeader>
            <CardContent>
              {syncHistory.length > 0 ? (
                <div className="space-y-3">
                  {syncHistory.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {item.status === "success" ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        )}
                        <div>
                          <p className="font-medium">
                            {item.status === "success" ? "Sincronização bem-sucedida" : "Falha na sincronização"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {item.date.toLocaleString("pt-BR")}
                          </p>
                        </div>
                      </div>
                      {item.status === "success" && (
                        <Badge variant="secondary">
                          {item.skills} skill(s)
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhuma sincronização registrada</p>
                  <p className="text-sm text-muted-foreground">
                    Clique em "Sincronizar Agente" para começar
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}