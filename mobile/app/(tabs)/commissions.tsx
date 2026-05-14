import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";

interface Commission {
  id: number;
  product: string;
  level: number;
  value: number;
  status: "completed" | "pending" | "cancelled";
  date: string;
}

export default function CommissionsScreen() {
  const [period, setPeriod] = useState("month");

  const commissions: Commission[] = [
    { id: 1, product: "Produto A", level: 1, value: 150.00, status: "completed", date: "2024-05-06" },
    { id: 2, product: "Produto B", level: 2, value: 200.00, status: "completed", date: "2024-05-05" },
    { id: 3, product: "Produto C", level: 1, value: 100.00, status: "pending", date: "2024-05-04" },
    { id: 4, product: "Produto D", level: 3, value: 300.00, status: "completed", date: "2024-05-03" },
    { id: 5, product: "Produto E", level: 2, value: 50.00, status: "cancelled", date: "2024-05-02" },
  ];

  const totalAccumulated = commissions
    .filter((c) => c.status === "completed")
    .reduce((sum, c) => sum + c.value, 0);

  const getStatusColor = (status: string) => {
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

  const getStatusLabel = (status: string) => {
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
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6 pb-6">
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Comissões</Text>
            <Text className="text-sm text-muted">Acompanhe suas comissões</Text>
          </View>

          {/* Total Acumulado */}
          <View className="bg-primary rounded-2xl p-6 gap-2">
            <Text className="text-sm font-medium text-white opacity-90">Total Acumulado</Text>
            <Text className="text-4xl font-bold text-white">R$ {totalAccumulated.toFixed(2)}</Text>
          </View>

          {/* Filtro por Período */}
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
                  onPress={() => setPeriod(opt.id)}
                  className={`flex-1 rounded-lg py-2 px-3 active:opacity-70 ${
                    period === opt.id
                      ? "bg-primary"
                      : "bg-surface border border-border"
                  }`}
                >
                  <Text
                    className={`font-semibold text-center text-sm ${
                      period === opt.id ? "text-white" : "text-foreground"
                    }`}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Lista de Comissões */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Detalhes</Text>
            {commissions.map((commission) => (
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
                      <View className={`rounded px-2 py-1 ${getStatusColor(commission.status)}`}>
                        <Text className="text-xs font-medium text-foreground">
                          {getStatusLabel(commission.status)}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-xs text-muted mt-2">{commission.date}</Text>
                  </View>
                  <Text className="text-lg font-bold text-primary">
                    R$ {commission.value.toFixed(2)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Botão Solicitar Saque */}
          <TouchableOpacity className="bg-primary rounded-lg py-3 px-4 active:opacity-80">
            <Text className="text-white font-semibold text-center">Solicitar Saque</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
