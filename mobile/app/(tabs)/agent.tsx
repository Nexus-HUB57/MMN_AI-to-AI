import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";

export default function AgentScreen() {
  const colors = useColors();
  const [strategy, setStrategy] = useState("balanced");
  const [isUpdatingStrategy, setIsUpdatingStrategy] = useState(false);
  const [agentActiveOverride, setAgentActive] = useState<boolean | null>(null);

  const {
    data: agentData,
    isLoading: isLoadingAgent,
    refetch: refetchAgent,
  } = trpc.mmn.getAgent.useQuery();
  const updateStrategyMutation = trpc.mmn.updateAgentStrategy.useMutation();

  const agentActive = agentActiveOverride ?? agentData?.status === "active";
  const metrics = {
    energy: agentData?.vitals?.energy || 85,
    health: agentData?.vitals?.health || 92,
    creativity: agentData?.vitals?.creativity || 78,
    reputation: agentData?.vitals?.reputation || 88,
  };

  const recentActions = [
    { id: 1, action: "Conteúdo gerado", time: "Há 2 horas" },
    { id: 2, action: "Rede atualizada", time: "Há 4 horas" },
    { id: 3, action: "Comissão processada", time: "Há 1 dia" },
  ];

  const handleStrategyChange = async (newStrategy: string) => {
    setStrategy(newStrategy);
    if (agentData?.id) {
      setIsUpdatingStrategy(true);
      try {
        await updateStrategyMutation.mutateAsync({
          agentId: agentData.id,
          contentStrategy: {
            platforms: ["whatsapp", "instagram", "facebook"],
            postingFrequency:
              newStrategy === "aggressive"
                ? "hourly"
                : newStrategy === "balanced"
                  ? "daily"
                  : "weekly",
            tone: "professional",
          },
        });
        await refetchAgent();
      } catch (error) {
        console.error("Erro ao atualizar estratégia:", error);
      } finally {
        setIsUpdatingStrategy(false);
      }
    }
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6 pb-6">
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">
              Agente IA
            </Text>
            <Text className="text-sm text-muted">
              Gerencie seu assistente inteligente
            </Text>
          </View>

          {/* Status */}
          <View className="bg-surface rounded-2xl p-6 border border-border gap-4">
            <View className="flex-row justify-between items-center">
              <Text className="text-lg font-semibold text-foreground">
                Status
              </Text>
              <View
                className={`rounded-full px-3 py-1 ${
                  agentActive ? "bg-success/20" : "bg-error/20"
                }`}
              >
                <Text
                  className={`font-medium text-xs ${agentActive ? "text-success" : "text-error"}`}
                >
                  {agentActive ? "Ativo" : "Inativo"}
                </Text>
              </View>
            </View>

            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => setAgentActive(true)}
                className={`flex-1 rounded-lg py-2 px-3 active:opacity-70 ${
                  agentActive
                    ? "bg-success/20"
                    : "bg-surface border border-border"
                }`}
              >
                <Text
                  className={`font-semibold text-center text-sm ${
                    agentActive ? "text-success" : "text-foreground"
                  }`}
                >
                  Ativar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setAgentActive(false)}
                className={`flex-1 rounded-lg py-2 px-3 active:opacity-70 ${
                  !agentActive
                    ? "bg-error/20"
                    : "bg-surface border border-border"
                }`}
              >
                <Text
                  className={`font-semibold text-center text-sm ${
                    !agentActive ? "text-error" : "text-foreground"
                  }`}
                >
                  Desativar
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Métricas */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">
              Métricas
            </Text>

            {Object.entries(metrics).map(([key, value]) => (
              <View key={key} className="gap-2">
                <View className="flex-row justify-between">
                  <Text className="text-sm font-medium text-foreground capitalize">
                    {key === "energy" && "Energia"}
                    {key === "health" && "Saúde"}
                    {key === "creativity" && "Criatividade"}
                    {key === "reputation" && "Reputação"}
                  </Text>
                  <Text className="text-sm font-bold text-primary">
                    {value}%
                  </Text>
                </View>
                <View className="h-2 bg-border rounded-full overflow-hidden">
                  <View
                    className="h-full bg-primary"
                    style={{ width: `${value}%` }}
                  />
                </View>
              </View>
            ))}
          </View>

          {/* Estratégia */}
          <View className="bg-surface rounded-2xl p-4 border border-border gap-3">
            <Text className="text-sm font-medium text-muted">
              Estratégia de Conteúdo
            </Text>
            <View className="gap-2">
              {[
                { id: "aggressive", label: "Agressiva" },
                { id: "balanced", label: "Balanceada" },
                { id: "conservative", label: "Conservadora" },
              ].map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  onPress={() => handleStrategyChange(opt.id)}
                  disabled={isUpdatingStrategy}
                  className={`rounded-lg p-3 border ${
                    strategy === opt.id
                      ? "bg-primary/10 border-primary"
                      : "bg-background border-border"
                  } active:opacity-70`}
                >
                  <Text
                    className={`font-medium text-sm ${
                      strategy === opt.id ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Últimas Ações */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">
              Últimas Ações
            </Text>
            {recentActions.map((action) => (
              <View
                key={action.id}
                className="bg-surface rounded-lg p-4 border border-border flex-row justify-between items-center"
              >
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground">
                    {action.action}
                  </Text>
                  <Text className="text-xs text-muted mt-1">{action.time}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Configurar */}
          <TouchableOpacity className="bg-primary rounded-lg py-3 px-4 active:opacity-80">
            <Text className="text-white font-semibold text-center">
              Configurar Agente
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
