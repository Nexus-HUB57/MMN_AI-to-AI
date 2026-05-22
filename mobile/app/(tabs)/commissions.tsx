import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useMemo, useState } from "react";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";

type Period = "week" | "month" | "year";

type CommissionItem = {
  id: number | string;
  product: string;
  level: number;
  value: number;
  status: "completed" | "pending" | "cancelled";
  date: string;
};

const daysByPeriod: Record<Period, number> = {
  week: 7,
  month: 30,
  year: 365,
};

function normalizeStatus(status?: string): CommissionItem["status"] {
  if (status === "cancelled" || status === "refunded") return "cancelled";
  if (status === "confirmed" || status === "shipped" || status === "delivered")
    return "completed";
  return "pending";
}

export default function CommissionsScreen() {
  const colors = useColors();
  const [period, setPeriod] = useState<Period>("month");
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: statsData,
    isLoading: isLoadingStats,
    refetch: refetchStats,
  } = trpc.mmn.getStats.useQuery();
  const {
    data: recentOrders = [],
    isLoading: isLoadingOrders,
    refetch: refetchOrders,
  } = trpc.mmn.getRecentOrders.useQuery();

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchStats(), refetchOrders()]);
    setRefreshing(false);
  };

  const commissions = useMemo<CommissionItem[]>(() => {
    const cutoff = Date.now() - daysByPeriod[period] * 24 * 60 * 60 * 1000;

    return recentOrders
      .map((order: any) => {
        const createdAt = order?.createdAt
          ? new Date(order.createdAt)
          : new Date();
        return {
          id: order?.id ?? String(createdAt.getTime()),
          product:
            order?.productName ??
            order?.externalOrderId ??
            `Pedido ${order?.id ?? "recente"}`,
          level: Number(order?.level ?? 1),
          value: Number(order?.commissionAmount ?? 0),
          status: normalizeStatus(String(order?.status ?? "pending")),
          date: createdAt.toISOString(),
        };
      })
      .filter((item) => new Date(item.date).getTime() >= cutoff);
  }, [period, recentOrders]);

  const totalAccumulated = Number(statsData?.total ?? 0);
  const totalPending = Number(statsData?.pending ?? 0);
  const totalAvailable = Math.max(totalAccumulated - totalPending, 0);

  const getStatusColor = (status: CommissionItem["status"]) => {
    switch (status) {
      case "completed":
        return "bg-success/10";
      case "pending":
        return "bg-warning/10";
      case "cancelled":
        return "bg-error/10";
      default:
        return "bg-muted/10";
    }
  };

  const getStatusLabel = (status: CommissionItem["status"]) => {
    switch (status) {
      case "completed":
        return "Concluída";
      case "pending":
        return "Pendente";
      case "cancelled":
        return "Cancelada";
      default:
        return status;
    }
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="gap-6 pb-6">
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">
              Comissões
            </Text>
            <Text className="text-sm text-muted">
              Acompanhe sua carteira operacional em tempo real
            </Text>
          </View>

          <View className="bg-primary rounded-2xl p-6 gap-2">
            <Text className="text-sm font-medium text-white opacity-90">
              Total Acumulado
            </Text>
            {isLoadingStats ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-4xl font-bold text-white">
                R$ {totalAccumulated.toFixed(2)}
              </Text>
            )}
            <View className="flex-row gap-3 pt-2">
              <View className="flex-1 bg-white/15 rounded-lg px-3 py-2">
                <Text className="text-[11px] uppercase text-white/75">
                  Pendentes
                </Text>
                <Text className="text-lg font-bold text-white">
                  R$ {totalPending.toFixed(2)}
                </Text>
              </View>
              <View className="flex-1 bg-white/15 rounded-lg px-3 py-2">
                <Text className="text-[11px] uppercase text-white/75">
                  Disponível
                </Text>
                <Text className="text-lg font-bold text-white">
                  R$ {totalAvailable.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>

          <View className="gap-3">
            <Text className="text-sm font-medium text-muted">Período</Text>
            <View className="flex-row gap-2">
              {[
                { id: "week", label: "Semana" },
                { id: "month", label: "Mês" },
                { id: "year", label: "Ano" },
              ].map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  onPress={() => setPeriod(opt.id as Period)}
                  className={`flex-1 rounded-lg py-2 px-3 active:opacity-70 ${
                    period === opt.id
                      ? "bg-primary"
                      : "bg-surface border border-border"
                  }`}
                >
                  <Text
                    className={`font-semibold text-center text-sm ${period === opt.id ? "text-white" : "text-foreground"}`}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">
              Detalhes
            </Text>
            {isLoadingOrders ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : commissions.length > 0 ? (
              commissions.map((commission) => (
                <TouchableOpacity
                  key={commission.id}
                  className="bg-surface rounded-lg p-4 border border-border active:opacity-70"
                >
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-foreground">
                        {commission.product}
                      </Text>
                      <View className="flex-row gap-2 mt-2">
                        <View className="bg-muted/20 rounded px-2 py-1">
                          <Text className="text-xs text-muted font-medium">
                            Nível {commission.level}
                          </Text>
                        </View>
                        <View
                          className={`rounded px-2 py-1 ${getStatusColor(commission.status)}`}
                        >
                          <Text className="text-xs font-medium text-foreground">
                            {getStatusLabel(commission.status)}
                          </Text>
                        </View>
                      </View>
                      <Text className="text-xs text-muted mt-2">
                        {new Date(commission.date).toLocaleDateString("pt-BR")}
                      </Text>
                    </View>
                    <Text className="text-lg font-bold text-primary">
                      R$ {commission.value.toFixed(2)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View className="py-8 items-center bg-surface rounded-xl border border-border">
                <Text className="text-muted">
                  Nenhuma comissão encontrada para o período selecionado.
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity className="bg-primary rounded-lg py-3 px-4 active:opacity-80">
            <Text className="text-white font-semibold text-center">
              Solicitar Saque
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
