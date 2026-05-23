import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useMemo, useState } from "react";

import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";

const STRATEGIES = [
  { id: "aggressive", label: "Agressiva" },
  { id: "balanced", label: "Balanceada" },
  { id: "conservative", label: "Conservadora" },
] as const;

type StrategyId = (typeof STRATEGIES)[number]["id"];

type Platform = "instagram" | "whatsapp" | "facebook";

const PLATFORMS: { id: Platform; label: string }[] = [
  { id: "instagram", label: "Instagram" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "facebook", label: "Facebook" },
];

const STRATEGY_TO_FREQUENCY: Record<StrategyId, string> = {
  aggressive: "hourly",
  balanced: "daily",
  conservative: "weekly",
};

export default function AgentScreen() {
  const [strategy, setStrategy] = useState<StrategyId>("balanced");
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [generated, setGenerated] = useState<string | null>(null);

  const profileQuery = trpc.agentRuntime.getProfile.useQuery(undefined, {
    retry: 0,
  });
  const configureMutation = trpc.agents.configure.useMutation({
    onSuccess: () => profileQuery.refetch(),
  });
  const generateMutation = trpc.agentRuntime.generate.useMutation();

  const isAgentReady = !!profileQuery.data?.agent;
  const status = profileQuery.data?.agent?.status ?? "learning";
  const performanceScore = profileQuery.data?.agent?.performanceScore ?? 0;
  const skillsCount = profileQuery.data?.skillsCount ?? 0;
  const agentActive = status === "active";

  const metrics = useMemo(
    () => ({
      performance: performanceScore,
      skills: Math.min(100, skillsCount * 20),
      energy: agentActive ? 90 : 30,
      health: agentActive ? 95 : 60,
    }),
    [agentActive, performanceScore, skillsCount],
  );

  const handleStrategyChange = async (next: StrategyId) => {
    setStrategy(next);
    try {
      await configureMutation.mutateAsync({
        contentStrategy: {
          platforms: ["instagram", "facebook", "whatsapp"],
          postingFrequency: STRATEGY_TO_FREQUENCY[next],
          tone: next === "aggressive" ? "persuasive" : "professional",
          targetAudience: "general",
        },
      });
    } catch (err: any) {
      Alert.alert("Erro", err?.message ?? "Falha ao salvar estratégia.");
    }
  };

  const handleSetStatus = async (nextActive: boolean) => {
    try {
      await configureMutation.mutateAsync({
        status: nextActive ? "active" : "paused",
      });
    } catch (err: any) {
      Alert.alert("Erro", err?.message ?? "Falha ao atualizar status.");
    }
  };

  const handleGenerate = async () => {
    if (topic.trim().length < 3) {
      Alert.alert(
        "Tópico curto",
        "Descreva o assunto do post (mínimo 3 letras).",
      );
      return;
    }
    try {
      const res = await generateMutation.mutateAsync({
        topic: topic.trim(),
        platform,
        includeHashtags: platform === "instagram",
      });
      setGenerated(res.content);
    } catch (err: any) {
      Alert.alert("Erro", err?.message ?? "Falha ao gerar conteúdo.");
    }
  };

  if (profileQuery.isLoading) {
    return (
      <ScreenContainer>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#0a7ea4" />
          <Text style={styles.subtitle}>Carregando seu agente IA...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (profileQuery.isError || !isAgentReady) {
    return (
      <ScreenContainer>
        <View style={styles.centered}>
          <Text style={styles.title}>Agente IA</Text>
          <Text style={styles.subtitle}>
            Ainda não inicializamos seu agente. Faça login e tente novamente.
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={styles.title}>Agente IA</Text>
          <Text style={styles.subtitle}>
            Gerencie seu assistente inteligente conectado ao backend
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
                {agentActive
                  ? "Ativo"
                  : status === "learning"
                    ? "Aprendendo"
                    : "Inativo"}
              </Text>
            </View>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              onPress={() => handleSetStatus(true)}
              disabled={configureMutation.isPending}
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
              onPress={() => handleSetStatus(false)}
              disabled={configureMutation.isPending}
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
                  {key === "performance" && "Performance"}
                  {key === "skills" && `Skills (${skillsCount} ativas)`}
                  {key === "energy" && "Energia"}
                  {key === "health" && "Saúde"}
                </Text>
                <Text style={styles.metricValue}>{Math.round(value)}%</Text>
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
                disabled={configureMutation.isPending}
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

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Gerar conteúdo agora</Text>
          <Text style={styles.mutedLabel}>Plataforma</Text>
          <View style={styles.buttonRow}>
            {PLATFORMS.map((opt) => (
              <TouchableOpacity
                key={opt.id}
                onPress={() => setPlatform(opt.id)}
                style={[
                  styles.secondaryButton,
                  platform === opt.id && styles.successSoft,
                ]}
              >
                <Text
                  style={[
                    styles.secondaryButtonText,
                    platform === opt.id && styles.successText,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            placeholder="Ex.: lançamento do nosso curso de afiliados"
            placeholderTextColor="#94a3b8"
            value={topic}
            onChangeText={setTopic}
            style={styles.input}
          />

          <TouchableOpacity
            style={[
              styles.primaryButton,
              generateMutation.isPending && styles.disabledButton,
            ]}
            onPress={handleGenerate}
            disabled={generateMutation.isPending}
          >
            {generateMutation.isPending ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.primaryButtonText}>Gerar com IA</Text>
            )}
          </TouchableOpacity>

          {generated && (
            <View style={styles.resultBox}>
              <Text style={styles.listSubtitle}>Resultado:</Text>
              <Text style={styles.resultText}>{generated}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
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
    textAlign: "center",
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
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    color: "#11181c",
    fontSize: 15,
  },
  primaryButton: {
    borderRadius: 14,
    backgroundColor: "#0a7ea4",
    paddingVertical: 14,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
  },
  resultBox: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 12,
    gap: 6,
  },
  resultText: {
    color: "#11181c",
    fontSize: 14,
    lineHeight: 20,
  },
  listSubtitle: {
    fontSize: 12,
    color: "#687076",
    fontWeight: "600",
  },
});
