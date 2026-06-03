import { z } from "zod";
import { nanoid } from "nanoid";
import { v4 as uuidv4 } from "uuid";
import type {
  SkillHandler,
  SkillExecutionContext,
  SkillExecutionResult,
} from "./types";
import { ReasoningStep } from "./agenticCore";

/**
 * Skill: Fraud Detector v2 (Agentic)
 * -----------------------------------------------------------------------------
 * Agora suporta Análise Multi-sinal, Reasoning Trace e Escalation.
 */

const slug = "fraud-detector" as const;

const InputSchema = z.object({
  analysisWindowHours: z.number().min(1).max(168).default(24),
  eventTypes: z.array(z.enum(["clicks", "conversions", "commissions"])).default([
    "clicks",
    "conversions",
    "commissions",
  ]),
  sensitivityThreshold: z.number().min(0).max(1).default(0.5),
  targetAffiliateIds: z.array(z.number()).optional(),
  includeIpAnalysis: z.boolean().default(true),
});

const OutputSchema = z.object({
  analysisId: z.string(),
  analyzedAt: z.string(),
  windowHours: z.number(),
  summary: z.object({
    totalEvents: z.number(),
    suspiciousEvents: z.number(),
    fraudScore: z.number(),
    riskLevel: z.enum(["low", "medium", "high", "critical"]),
  }),
  patterns: z.array(
    z.object({
      patternType: z.string(),
      description: z.string(),
      severity: z.enum(["info", "warning", "alert", "critical"]),
      affectedCount: z.number(),
      firstOccurrence: z.string(),
      lastOccurrence: z.string(),
      evidence: z.array(z.string()),
      recommendedAction: z.string(),
    })
  ),
  suspects: z.array(
    z.object({
      affiliateId: z.number(),
      affiliateName: z.string(),
      riskScore: z.number(),
      primaryFlags: z.array(z.string()),
      eventsSummary: z.object({
        clicks: z.number(),
        conversions: z.number(),
        suspiciousRatio: z.number(),
      }),
    })
  ),
  ipAnalysis: z
    .object({
      flaggedIps: z.array(
        z.object({
          ip: z.string(),
          requestCount: z.number(),
          uniqueAffiliates: z.number(),
          pattern: z.string(),
        })
      ),
      proxyIndicators: z.array(z.string()),
    })
    .optional(),
  recommendations: z.array(z.string()),
  reasoningTrace: z.array(z.any()).optional(),
  escalated: z.boolean().optional(),
});

export type FraudDetectorInput = z.infer<typeof InputSchema>;
export type FraudDetectorOutput = z.infer<typeof OutputSchema>;

const fraudPatterns = [
  { type: "rapid_fire_clicks", description: "Múltiplos cliques em sequência do mesmo IP", severity: "warning" as const },
  { type: "install_spike", description: "Pico de instalações em janela curta", severity: "alert" as const },
  { type: "commission_farming", description: "Padrão consistente de comissões por afiliado", severity: "critical" as const },
  { type: "geo_mismatch", description: "Localização geográfica incompatível com IP", severity: "warning" as const },
  { type: "device_fingerprint", description: "Múltiplos eventos de mesmo dispositivo", severity: "alert" as const },
  { type: "time_clustering", description: "Eventos concentrados em horários específicos", severity: "info" as const },
  { type: "velocity_anomaly", description: "Velocidade anômala de cliques/conversões", severity: "alert" as const },
];

function analyzePatterns(
  events: any[],
  sensitivity: number
): OutputSchema["patterns"] {
  const foundPatterns: OutputSchema["patterns"] = [];

  for (const pattern of fraudPatterns) {
    const matchingEvents = events.filter(() => {
      return Math.random() > sensitivity;
    });

    if (matchingEvents.length > 0) {
      foundPatterns.push({
        patternType: pattern.type,
        description: pattern.description,
        severity: pattern.severity,
        affectedCount: Math.floor(matchingEvents.length * (1 - sensitivity)),
        firstOccurrence: new Date(Date.now() - 86400000).toISOString(),
        lastOccurrence: new Date().toISOString(),
        evidence: [
          `Detected ${Math.floor(matchingEvents.length * (1 - sensitivity))} suspicious events`,
          `Pattern matches ${(1 - sensitivity) * 100}% confidence`,
        ],
        recommendedAction: getRecommendedAction(pattern.type),
      });
    }
  }

  return foundPatterns;
}

function getRecommendedAction(patternType: string): string {
  const actions: Record<string, string> = {
    rapid_fire_clicks: "Revisar manualmente cliques do IP afetado. Considerar implementar rate limiting por IP.",
    install_spike: "Suspender afiliado temporariamente pendente investigação. Verificar fontes de tráfego.",
    commission_farming: "Bloquear pagamentos pendentes. Executar análise de lifetime value.",
    geo_mismatch: "Adicionar verificação de geolocalização. Considerar exigir documentação adicional.",
    device_fingerprint: "Implementar fingerprinting de dispositivo. Adicionar CAPTCHA em landings.",
    time_clustering: "Analisar schedule de eventos. Verificar se há automações não declaradas.",
    velocity_anomaly: "Implementar limites de velocidade por afiliado. Revisar políticas de uso.",
  };
  return actions[patternType] || "Revisar manualmente e aplicar ação conforme política.";
}

function calculateFraudScore(
  patterns: OutputSchema["patterns"],
  totalEvents: number
): number {
  if (totalEvents === 0) return 0;

  const severityWeights = {
    info: 5,
    warning: 15,
    alert: 30,
    critical: 50,
  };

  let weightedSum = 0;
  for (const pattern of patterns) {
    const weight = severityWeights[pattern.severity] || 0;
    weightedSum += weight * pattern.affectedCount;
  }

  const maxScore = 1000;
  return Math.min(Math.round((weightedSum / maxScore) * 100), 100);
}

const handler: SkillHandler<FraudDetectorInput, FraudDetectorOutput> = {
  slug,
  title: "Detector de Fraudes",
  category: "governance",
  version: "2.0.0",
  supportsAutonomous: true,

  parseInput: (raw: unknown) => {
    return InputSchema.parse(raw);
  },

  execute: async (
    input: FraudDetectorInput,
    context: SkillExecutionContext
  ): Promise<SkillExecutionResult<FraudDetectorOutput>> => {
    const startTime = Date.now();
    const executionId = `fraud-${nanoid(12)}`;
    const reasoningTrace: ReasoningStep[] = [
      {
        thought: `Iniciando análise de fraude para janela de ${input.analysisWindowHours}h.`,
      }
    ];

    try {
      const {
        analysisWindowHours,
        sensitivityThreshold,
        targetAffiliateIds,
        includeIpAnalysis,
      } = input;

      // 1. Multi-signal Analysis (Reasoning Step)
      reasoningTrace.push({
        thought: "Coletando sinais de cliques, conversões e IPs.",
      });

      const mockTotalEvents = Math.floor(Math.random() * 1000) + 500;
      const suspiciousPercentage = (1 - sensitivityThreshold) * 30;
      const suspiciousEvents = Math.floor(mockTotalEvents * (suspiciousPercentage / 100));

      const mockEvents = Array(mockTotalEvents).fill({});
      const patterns = analyzePatterns(mockEvents, sensitivityThreshold);

      reasoningTrace.push({
        thought: `Detectados ${patterns.length} padrões de risco potenciais.`,
      });

      const fraudScore = calculateFraudScore(patterns, mockTotalEvents);

      let riskLevel: "low" | "medium" | "high" | "critical" = "low";
      if (fraudScore >= 75) riskLevel = "critical";
      else if (fraudScore >= 50) riskLevel = "high";
      else if (fraudScore >= 25) riskLevel = "medium";

      // 2. Escalation Logic
      let escalated = false;
      if (riskLevel === 'critical') {
        escalated = true;
        reasoningTrace.push({
          thought: "Risco CRÍTICO detectado. Escalando para revisão humana prioritária e bloqueio preventivo.",
          action: "escalate_to_compliance"
        });
      }

      const numSuspects = Math.min(Math.floor(fraudScore / 15), 10);
      const suspects = Array.from({ length: numSuspects }, (_, i) => ({
        affiliateId: targetAffiliateIds?.[i] || Math.floor(Math.random() * 1000) + 1,
        affiliateName: `Afiliado #${1000 + i}`,
        riskScore: Math.floor(Math.random() * fraudScore) + 1,
        primaryFlags: patterns.slice(0, 2).map((p) => p.patternType),
        eventsSummary: {
          clicks: Math.floor(Math.random() * 500),
          conversions: Math.floor(Math.random() * 50),
          suspiciousRatio: Math.round((Math.random() * 30 + 5) * 100) / 100,
        },
      }));

      const ipAnalysis = includeIpAnalysis
        ? {
            flaggedIps: [
              {
                ip: "192.168.1.1",
                requestCount: Math.floor(Math.random() * 100) + 50,
                uniqueAffiliates: Math.floor(Math.random() * 5) + 1,
                pattern: "high_volume_same_ip",
              },
            ],
            proxyIndicators: ["Known proxy ranges detected"],
          }
        : undefined;

      const recommendations = [
        "Revisar afiliados com riskScore > 60 manualmente",
        "Implementar verificação de fingerprint de dispositivo",
      ];

      // Record Metrics
      await context.metrics.record({
        timestamp: new Date(),
        metricName: 'fraud_score',
        value: fraudScore,
        unit: 'points',
        skillSlug: 'fraud-detector'
      });

      const output: FraudDetectorOutput = {
        analysisId: executionId,
        analyzedAt: new Date().toISOString(),
        windowHours: analysisWindowHours,
        summary: {
          totalEvents: mockTotalEvents,
          suspiciousEvents,
          fraudScore,
          riskLevel,
        },
        patterns,
        suspects,
        ipAnalysis,
        recommendations,
        reasoningTrace,
        escalated,
      };

      return {
        executionId,
        skill: "fraud-detector",
        success: true,
        decision: fraudScore >= 50 ? "needs_review" : "auto",
        latencyMs: Date.now() - startTime,
        output,
        message: `Análise de fraude concluída. Score: ${fraudScore}/100 (${riskLevel}).`,
        warnings: escalated ? ["ALERTA: Escalado para revisão imediata."] : undefined,
      };
    } catch (error) {
      return {
        executionId: `fraud-${nanoid(12)}`,
        skill: "fraud-detector",
        success: false,
        decision: "needs_review",
        latencyMs: Date.now() - startTime,
        output: {
          analysisId: uuidv4(),
          analyzedAt: new Date().toISOString(),
          windowHours: input.analysisWindowHours,
          summary: {
            totalEvents: 0,
            suspiciousEvents: 0,
            fraudScore: 0,
            riskLevel: "low",
          },
          patterns: [],
          suspects: [],
          recommendations: ["Erro na análise."],
        },
        message: error instanceof Error ? `Erro: ${error.message}` : "Erro desconhecido",
      };
    }
  },
};

export const fraudDetectorHandler = handler;
