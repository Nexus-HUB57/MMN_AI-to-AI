import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useMemo, useState } from "react";
import { ScreenContainer } from "@/components/screen-container";

const STRATEGIES = [
  { id: "aggressive", label: "Agressiva" },
  { id: "balanced", label: "Balanceada" },
  { id: "conservative", label: "Conservadora" },
] as const;

type StrategyId = (typeof STRATEGIES)[number]["id"];

export default function AgentScreen() {
  const [strategy, setStrategy] = useState<StrategyId>("balanced");
  const [agentActive, setAgentActive] = useState(true);
  const [isUpdatingStrategy, setIsUpdatingStrategy] = useState(false);

  const metrics = useMemo(
    () => ({
      energy: 85,
      health: 92,
      creativity: 78,
      reputation: 88,
    }),
    [],
  );

  const recentActions = [
    { id: 1, action: "Conteúdo gerado", time: "Há 2 horas" },
    { id: 2, action: "Rede atualizada", time: "Há 4 horas" },
    { id: 3, action: "Comissão processada", time: "Há 1 dia" },
  ];

  const handleStrategyChange = async (newStrategy: StrategyId) => {
    setIsUpdatingStrategy(true);
    setStrategy(newStrategy);
    setTimeout(() => setIsUpdatingStrategy(false), 300);
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={styles.title}>Agente IA</Text>
          <Text style={styles.subtitle}>
            Gerencie seu assistente inteligente
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.cardTitle}>Status</Text>
            <View
              style={[
                styles.badge,
                agentActive ? styles.badgeSuccess : styles.badgeError,
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  agentActive ? styles.successText : styles.errorText,
                ]}
              >
                {agentActive ? "Ativo" : "Inativo"}
              </Text>
            </View>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              onPress={() => setAgentActive(true)}
              style={[
                styles.secondaryButton,
                agentActive && styles.successSoft,
              ]}
            >
              <Text
                style={[
                  styles.secondaryButtonText,
                  agentActive && styles.successText,
                ]}
              >
                Ativar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setAgentActive(false)}
              style={[styles.secondaryButton, !agentActive && styles.errorSoft]}
            >
              <Text
                style={[
                  styles.secondaryButtonText,
                  !agentActive && styles.errorText,
                ]}
              >
                Desativar
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.cardTitle}>Métricas</Text>
          {Object.entries(metrics).map(([key, value]) => (
            <View key={key} style={styles.metricGroup}>
              <View style={styles.rowBetween}>
                <Text style={styles.metricLabel}>
                  {key === "energy" && "Energia"}
                  {key === "health" && "Saúde"}
                  {key === "creativity" && "Criatividade"}
                  {key === "reputation" && "Reputação"}
                </Text>
                <Text style={styles.metricValue}>{value}%</Text>
              </View>
              <View style={styles.metricTrack}>
                <View style={[styles.metricFill, { width: `${value}%` }]} />
              </View>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.mutedLabel}>Estratégia de Conteúdo</Text>
          <View style={styles.verticalGap}>
            {STRATEGIES.map((opt) => (
              <TouchableOpacity
                key={opt.id}
                onPress={() => handleStrategyChange(opt.id)}
                disabled={isUpdatingStrategy}
                style={[
                  styles.strategyButton,
                  strategy === opt.id && styles.strategyButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.strategyButtonText,
                    strategy === opt.id && styles.strategyButtonTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.cardTitle}>Últimas Ações</Text>
          {recentActions.map((action) => (
            <View key={action.id} style={styles.listCard}>
              <Text style={styles.listTitle}>{action.action}</Text>
              <Text style={styles.listSubtitle}>{action.time}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Configurar Agente</Text>
        </TouchableOpacity>

        {isUpdatingStrategy && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#0a7ea4" />
            <Text style={styles.listSubtitle}>Atualizando preferências...</Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    padding: 16,
    gap: 20,
  },
  sectionHeader: {
    gap: 6,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#11181c",
  },
  subtitle: {
    fontSize: 14,
    color: "#687076",
  },
  section: {
    gap: 12,
  },
  card: {
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 16,
    gap: 12,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#11181c",
  },
  mutedLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#687076",
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeSuccess: {
    backgroundColor: "rgba(34,197,94,0.12)",
  },
  badgeError: {
    backgroundColor: "rgba(239,68,68,0.12)",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  successText: {
    color: "#22c55e",
  },
  errorText: {
    color: "#ef4444",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#11181c",
  },
  successSoft: {
    backgroundColor: "rgba(34,197,94,0.12)",
    borderColor: "rgba(34,197,94,0.4)",
  },
  errorSoft: {
    backgroundColor: "rgba(239,68,68,0.12)",
    borderColor: "rgba(239,68,68,0.4)",
  },
  metricGroup: {
    gap: 8,
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#11181c",
  },
  metricValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0a7ea4",
  },
  metricTrack: {
    height: 8,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "#e5e7eb",
  },
  metricFill: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "#0a7ea4",
  },
  verticalGap: {
    gap: 8,
  },
  strategyButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "#ffffff",
  },
  strategyButtonActive: {
    borderColor: "#0a7ea4",
    backgroundColor: "rgba(10,126,164,0.08)",
  },
  strategyButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#11181c",
  },
  strategyButtonTextActive: {
    color: "#0a7ea4",
  },
  listCard: {
    backgroundColor: "#f5f5f5",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 14,
    gap: 4,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#11181c",
  },
  listSubtitle: {
    fontSize: 13,
    color: "#687076",
  },
  primaryButton: {
    borderRadius: 14,
    backgroundColor: "#0a7ea4",
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
