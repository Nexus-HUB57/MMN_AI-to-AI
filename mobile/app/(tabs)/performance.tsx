/**
 * Performance Metrics Component for Mobile App
 *
 * Displays agent performance metrics, skill analytics,
 * and system health status in the mobile interface.
 */

import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useMemo } from "react";

import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
}

function MetricCard({ title, value, subtitle, color = "#0a7ea4" }: MetricCardProps) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricTitle}>{title}</Text>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.metricSubtitle}>{subtitle}</Text>}
    </View>
  );
}

interface SkillGradeProps {
  grade: string;
  effectiveness: number;
}

function SkillGrade({ grade, effectiveness }: SkillGradeProps) {
  const gradeColor = grade === "A" ? "#22c55e" : grade === "B" ? "#0a7ea4" : grade === "C" ? "#f59e0b" : "#ef4444";

  return (
    <View style={styles.gradeContainer}>
      <Text style={[styles.gradeText, { color: gradeColor }]}>{grade}</Text>
      <Text style={styles.effectivenessText}>{Math.round(effectiveness * 100)}%</Text>
    </View>
  );
}

export default function PerformanceScreen() {
  // Queries
  const metricsQuery = trpc.performance.getMyAgentMetrics.useQuery(undefined, {
    retry: 1,
  });
  const systemHealthQuery = trpc.performance.getSystemHealth.useQuery(undefined, {
    retry: 1,
    staleTime: 30000,
  });
  const skillAnalyticsQuery = trpc.performance.getSkillAnalytics.useQuery(undefined, {
    retry: 1,
  });
  const networkComparisonQuery = trpc.performance.getNetworkComparison.useQuery(undefined, {
    retry: 1,
  });

  // Loading state
  if (metricsQuery.isLoading || systemHealthQuery.isLoading) {
    return (
      <ScreenContainer>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#0a7ea4" />
          <Text style={styles.loadingText}>Carregando métricas...</Text>
        </View>
      </ScreenContainer>
    );
  }

  // Error state
  if (metricsQuery.isError || !metricsQuery.data) {
    return (
      <ScreenContainer>
        <View style={styles.centered}>
          <Text style={styles.errorTitle}>Erro ao carregar métricas</Text>
          <Text style={styles.errorText}>
            Não foi possível obter os dados de performance do seu agente.
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => metricsQuery.refetch()}
          >
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  const metrics = metricsQuery.data;
  const systemHealth = systemHealthQuery.data;
  const skillAnalytics = skillAnalyticsQuery.data;
  const networkComparison = networkComparison.data;

  // Calculate success rate
  const successRate = metrics.totalActions > 0
    ? Math.round((metrics.successfulActions / metrics.totalActions) * 100)
    : 0;

  // Calculate performance score
  const performanceScore = metrics.averageResponseTime > 0
    ? Math.min(100, Math.max(0, Math.round(100 - (metrics.averageResponseTime / 50))))
    : 50;

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Performance</Text>
          <Text style={styles.subtitle}>Métricas do seu Agente IA</Text>
        </View>

        {/* System Health Summary */}
        {systemHealth && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Saúde do Sistema</Text>
            <View style={styles.healthGrid}>
              <MetricCard
                title="Agentes Ativos"
                value={`${systemHealth.activeAgents}/${systemHealth.totalAgents}`}
                subtitle="Total de agentes"
              />
              <MetricCard
                title="Skills Ativas"
                value={systemHealth.activeSkills}
                subtitle="Skills em uso"
                color="#22c55e"
              />
              <MetricCard
                title="Performance Média"
                value={`${Math.round(systemHealth.averagePerformance)}%`}
                subtitle="Média da rede"
                color="#8b5cf6"
              />
            </View>
          </View>
        )}

        {/* Agent Performance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance do Agente</Text>
          <View style={styles.performanceCard}>
            <View style={styles.mainMetric}>
              <Text style={styles.mainMetricValue}>{performanceScore}%</Text>
              <Text style={styles.mainMetricLabel}>Score de Performance</Text>
            </View>
            <View style={styles.metricsRow}>
              <View style={styles.miniMetric}>
                <Text style={styles.miniMetricValue}>{metrics.totalActions}</Text>
                <Text style={styles.miniMetricLabel}>Ações</Text>
              </View>
              <View style={styles.miniMetric}>
                <Text style={[styles.miniMetricValue, { color: "#22c55e" }]}>{successRate}%</Text>
                <Text style={styles.miniMetricLabel}>Taxa de Sucesso</Text>
              </View>
              <View style={styles.miniMetric}>
                <Text style={styles.miniMetricValue}>{Math.round(metrics.averageResponseTime)}ms</Text>
                <Text style={styles.miniMetricLabel}>Tempo Médio</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Network Comparison */}
        {networkComparison && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Comparação com a Rede</Text>
            <View style={styles.comparisonCard}>
              <View style={styles.comparisonRow}>
                <Text style={styles.comparisonLabel}>Seu Percentil</Text>
                <Text style={[styles.comparisonValue, { color: "#22c55e" }]}>
                  {networkComparison.myMetrics.performancePercentile}%
                </Text>
              </View>
              <View style={styles.percentileBar}>
                <View
                  style={[
                    styles.percentileFill,
                    { width: `${networkComparison.myMetrics.performancePercentile}%` },
                  ]}
                />
              </View>
              <View style={styles.comparisonRow}>
                <Text style={styles.comparisonLabel}>Média da Rede</Text>
                <Text style={styles.comparisonValue}>
                  {networkComparison.networkAverages.averageResponseTime}ms
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Skill Analytics */}
        {skillAnalytics && skillAnalytics.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Análise de Skills</Text>
            <View style={styles.skillSummary}>
              <Text style={styles.skillSummaryText}>
                {skillAnalytics.summary.totalSkillsUsed} skills ativas
              </Text>
              <Text style={styles.skillSummaryText}>
                Eficiência média: {skillAnalytics.summary.averageEffectiveness}%
              </Text>
            </View>
            {skillAnalytics.skills.slice(0, 5).map((skill, index) => (
              <View key={index} style={styles.skillRow}>
                <View style={styles.skillInfo}>
                  <Text style={styles.skillName}>{skill.skillName}</Text>
                  <Text style={styles.skillStats}>
                    {skill.usageCount} usos • {Math.round(skill.averageDuration)}ms
                  </Text>
                </View>
                <SkillGrade grade={skill.grade} effectiveness={skill.effectiveness} />
              </View>
            ))}
          </View>
        )}

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Últimas Ações</Text>
          <View style={styles.actionsList}>
            <Text style={styles.actionsPlaceholder}>
              Total de {metrics.totalActions} ações registradas
            </Text>
            {metrics.lastActivity && (
              <Text style={styles.lastActivity}>
                Última atividade: {new Date(metrics.lastActivity).toLocaleString("pt-BR")}
              </Text>
            )}
          </View>
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
  container: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#11181c",
  },
  subtitle: {
    fontSize: 14,
    color: "#687076",
    marginTop: 4,
  },
  loadingText: {
    fontSize: 14,
    color: "#687076",
    marginTop: 8,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ef4444",
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: "#687076",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: "#0a7ea4",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#11181c",
    marginBottom: 12,
  },
  healthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: "30%",
    backgroundColor: "#f5f5f5",
    borderRadius: 16,
    padding: 16,
  },
  metricTitle: {
    fontSize: 12,
    color: "#687076",
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0a7ea4",
  },
  metricSubtitle: {
    fontSize: 10,
    color: "#94a3b8",
    marginTop: 4,
  },
  performanceCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 20,
  },
  mainMetric: {
    alignItems: "center",
    marginBottom: 16,
  },
  mainMetricValue: {
    fontSize: 48,
    fontWeight: "700",
    color: "#0a7ea4",
  },
  mainMetricLabel: {
    fontSize: 14,
    color: "#687076",
    marginTop: 4,
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 16,
  },
  miniMetric: {
    alignItems: "center",
  },
  miniMetricValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#11181c",
  },
  miniMetricLabel: {
    fontSize: 11,
    color: "#687076",
    marginTop: 2,
  },
  comparisonCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 16,
  },
  comparisonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  comparisonLabel: {
    fontSize: 14,
    color: "#687076",
  },
  comparisonValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#11181c",
  },
  percentileBar: {
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 999,
    marginVertical: 8,
    overflow: "hidden",
  },
  percentileFill: {
    height: "100%",
    backgroundColor: "#22c55e",
    borderRadius: 999,
  },
  skillSummary: {
    marginBottom: 12,
  },
  skillSummaryText: {
    fontSize: 14,
    color: "#687076",
  },
  skillRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  skillInfo: {
    flex: 1,
  },
  skillName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#11181c",
  },
  skillStats: {
    fontSize: 12,
    color: "#687076",
    marginTop: 2,
  },
  gradeContainer: {
    alignItems: "center",
    marginLeft: 12,
  },
  gradeText: {
    fontSize: 20,
    fontWeight: "700",
  },
  effectivenessText: {
    fontSize: 10,
    color: "#687076",
  },
  actionsList: {
    backgroundColor: "#f5f5f5",
    borderRadius: 16,
    padding: 16,
  },
  actionsPlaceholder: {
    fontSize: 14,
    color: "#687076",
  },
  lastActivity: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 8,
  },
});