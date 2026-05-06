import { ScrollView, Text, View, TouchableOpacity, RefreshControl, ActivityIndicator } from "react-native";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

export default function HomeScreen() {
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);

  const { data: metricsData, isLoading: isLoadingMetrics, refetch: refetchMetrics } = trpc.dashboard.getMetrics.useQuery(undefined, { pollingInterval: 5000 });
  const { data: recentSalesData, isLoading: isLoadingRecentSales, refetch: refetchRecentSales } = trpc.dashboard.getRecentSales.useQuery({ limit: 3 }, { pollingInterval: 5000 });

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refetchMetrics(),
      refetchRecentSales(),
    ]);
    setRefreshing(false);
  };

  const totalCommissions = metricsData?.commissions.total || 0;
  const agentStatus = metricsData?.agent?.status || "Inativo";
  const agentEnergy = metricsData?.agent?.vitals?.energy || 0;
  const agentHealth = metricsData?.agent?.vitals?.health || 0;
  const recentSales = recentSalesData || [];

  const isLoading = isLoadingMetrics || isLoadingRecentSales;

  return (
    <ScreenContainer className="p-4">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View className="gap-6 pb-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Dashboard</Text>
            <Text className="text-sm text-muted">Bem-vindo de volta!</Text>
          </View>

          {/* Saldo Total */}
          <View className="bg-primary rounded-2xl p-6 gap-3">
            <Text className="text-sm font-medium text-white opacity-90">Saldo Total de Comissões</Text>
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-4xl font-bold text-white">R$ {totalCommissions.toFixed(2)}</Text>
            )}
            <View className="flex-row gap-3 pt-2">
              <TouchableOpacity className="flex-1 bg-white/20 rounded-lg py-2 px-3 active:opacity-70">
                <Text className="text-white font-semibold text-center text-sm">Sacar</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 bg-white/20 rounded-lg py-2 px-3 active:opacity-70">
                <Text className="text-white font-semibold text-center text-sm">Compartilhar</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Status do Agente */}
          <View className="bg-surface rounded-2xl p-4 border border-border gap-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-lg font-semibold text-foreground">Agente IA</Text>
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.success} />
              ) : (
                <View className="bg-success/20 rounded-full px-3 py-1">
                  <Text className="text-success font-medium text-xs">{agentStatus}</Text>
                </View>
              )}
            </View>
            <View className="gap-2">
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Energia</Text>
                {isLoading ? (
                  <ActivityIndicator size="small" color={colors.foreground} />
                ) : (
                  <Text className="text-sm font-semibold text-foreground">{agentEnergy}%</Text>
                )}
              </View>
              <View className="h-2 bg-border rounded-full overflow-hidden">
                <View className="h-full" style={{ width: `${agentEnergy}%`, backgroundColor: colors.success }} />
              </View>
            </View>
            <View className="gap-2">
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Saúde</n                {isLoading ? (
                  <ActivityIndicator size="small" color={colors.foreground} />
                ) : (
                  <Text className="text-sm font-semibold text-foreground">{agentHealth}%</Text>
                )}
              </View>
              <View className="h-2 bg-border rounded-full overflow-hidden">
                <View className="h-full" style={{ width: `${agentHealth}%`, backgroundColor: colors.success }} />
              </View>
            </View>
          </View>

          {/* Últimas Vendas */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Últimas Vendas</Text>
            {isLoadingRecentSales ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : recentSales.length > 0 ? (
              recentSales.map((sale) => (
              <TouchableOpacity
                key={sale.id}
                className="bg-surface rounded-lg p-4 border border-border flex-row justify-between items-center active:opacity-70"
              >
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground">{sale.product}</Text>
                  <Text className="text-xs text-muted mt-1">{sale.date}</Text>
                </View>
                <Text className="text-sm font-bold text-primary">R$ {sale.value.toFixed(2)}</Text>
              </TouchableOpacity>
            )) : (
              <View className="py-8 items-center">
                <Text className="text-muted">Nenhuma venda recente.</Text>
              </View>
            )}
          </View>

          {/* Mini Gráfico */}
          <View className="bg-surface rounded-2xl p-4 border border-border gap-3">
            <Text className="text-lg font-semibold text-foreground">Ganhos (Últimos 7 dias)</Text>
            <View className="flex-row items-end justify-between h-24 gap-2">
              {[45, 60, 35, 70, 55, 80, 65].map((value, idx) => (
                <View key={idx} className="flex-1 items-center gap-1">
                  <View
                    className="w-full bg-primary rounded-t"
                    style={{ height: `${(value / 80) * 100}%` }}
                  />
                  <Text className="text-xs text-muted">{idx + 1}</Text>
                </View>
              )) : (
              <View className="py-8 items-center">
                <Text className="text-muted">Nenhuma venda recente.</Text>
              </View>
            )}
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
