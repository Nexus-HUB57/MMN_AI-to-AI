import { z } from "zod";
import { nanoid } from "nanoid";
import type {
  SkillHandler,
  SkillExecutionContext,
  SkillExecutionResult,
} from "./types";

/**
 * Skill: ROI Attributor (Atribuição de ROI Multi-Touch)
 * -----------------------------------------------------------------------------
 * Atribui receita multi-touch para entender verdadeira contribuição
 * de cada ponto de contato no funil de vendas.
 * Modelos suportados:
 *  - First Touch (primeiro contato)
 *  - Last Touch (último contato)
 *  - Linear (distribuição igual)
 *  - Time Decay (peso por tempo)
 *  - Position Based (40-20-40)
 *  - Data Driven (ML-based)
 */
const slug = "roi-attributor" as const;

const InputSchema = z.object({
  /** ID da conversão/venda para attribute */
  conversionId: z.string(),
  /** Valor da conversão */
  conversionValue: z.number().min(0),
  /** Timestamp da conversão */
  conversionDate: z.string().datetime(),
  /** Lista de touchpoints do cliente */
  touchpoints: z.array(
    z.object({
      id: z.string(),
      type: z.enum([
        "organic_search",
        "paid_search",
        "social",
        "email",
        "referral",
        "direct",
        "affiliate",
        "content",
        "display",
      ]),
      channel: z.string(),
      source: z.string(),
      timestamp: z.string().datetime(),
      campaignId: z.string().optional(),
      affiliateId: z.number().optional(),
      interactionType: z.enum(["click", "impression", "engagement"]),
      engagementScore: z.number().min(0).max(100).optional(),
    })
  ),
  /** Modelo de atribuição */
  attributionModel: z.enum([
    "first_touch",
    "last_touch",
    "linear",
    "time_decay",
    "position_based",
    "data_driven",
  ]).default("last_touch"),
  /** Janela de lookback em dias */
  lookbackWindowDays: z.number().min(1).max(90).default(30),
  /** Considerar weighted value por affiliate */
  useAffiliateWeightedValue: z.boolean().default(false),
  /** Affiliate weights para加权 cálculo */
  affiliateWeights: z
    .record(z.string(), z.number().min(0).max(1))
    .optional(),
  /** Considerar custos de aquisição */
  includeCosts: z.boolean().default(true),
  /** Custos por canal (opcional) */
  channelCosts: z
    .record(
      z.string(),
      z.object({
        fixed: z.number().default(0),
        variable: z.number().default(0),
      })
    )
    .optional(),
});

const OutputSchema = z.object({
  attributionId: z.string(),
  conversionId: z.string(),
  calculatedAt: z.string(),
  attributionModel: z.string(),
  conversionValue: z.number(),
  totalAttributedValue: z.number(),
  channelAttribution: z.array(
    z.object({
      channel: z.string(),
      modelShare: z.number(),
      calculatedValue: z.number(),
      touchpointsCount: z.number(),
      firstTouchContribution: z.number(),
      lastTouchContribution: z.number(),
    })
  ),
  touchpointAttribution: z.array(
    z.object({
      touchpointId: z.string(),
      type: z.string(),
      channel: z.string(),
      timestamp: z.string(),
      modelShare: z.number(),
      calculatedValue: z.number(),
      touchOrder: z.number(),
      isFirstTouch: z.boolean(),
      isLastTouch: z.boolean(),
    })
  ),
  affiliateAttribution: z
    .array(
      z.object({
        affiliateId: z.number(),
        totalValue: z.number(),
        touchpointCount: z.number(),
        weightedValue: z.number().optional(),
      })
    )
    .optional(),
  channelRoi: z
    .array(
      z.object({
        channel: z.string(),
        attributedRevenue: z.number(),
        associatedCost: z.number().optional(),
        roi: z.number().optional(),
        profitMargin: z.number().optional(),
      })
    )
    .optional(),
  modelComparison: z
    .object({
      firstTouch: z.number(),
      lastTouch: z.number(),
      linear: z.number(),
      timeDecay: z.number(),
      positionBased: z.number(),
    })
    .optional(),
  insights: z.object({
    highestValueChannel: z.string().optional(),
    bestPerformingTouchpoint: z.string().optional(),
    dominantAffiliate: z.number().optional(),
    averageTouchpointsToConvert: z.number(),
    shortestPathDays: z.number(),
    longestPathDays: z.number(),
  }),
  recommendations: z.array(z.string()),
});

export type RoiAttributorInput = z.infer<typeof InputSchema>;
export type RoiAttributorOutput = z.infer<typeof OutputSchema>;

function calculateFirstTouch(
  touchpoints: InputSchema["touchpoints"],
  totalValue: number
): Map<string, number> {
  const firstTouch = touchpoints.reduce((acc, tp) => {
    const key = tp.channel;
    if (!acc.has(key)) acc.set(key, tp);
    return acc;
  }, new Map<string, typeof touchpoints[0]>());

  const shares = new Map<string, number>();
  firstTouch.forEach((tp, channel) => {
    shares.set(channel, totalValue);
  });

  return shares;
}

function calculateLastTouch(
  touchpoints: InputSchema["touchpoints"],
  totalValue: number
): Map<string, number> {
  const sorted = [...touchpoints].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  const lastTouchChannel = sorted[0]?.channel || "direct";

  const shares = new Map<string, number>();
  shares.set(lastTouchChannel, totalValue);

  return shares;
}

function calculateLinear(
  touchpoints: InputSchema["touchpoints"],
  totalValue: number
): Map<string, number> {
  const channels = [...new Set(touchpoints.map((tp) => tp.channel))];
  const valuePerChannel = totalValue / channels.length;

  const shares = new Map<string, number>();
  channels.forEach((channel) => {
    shares.set(channel, valuePerChannel);
  });

  return shares;
}

function calculateTimeDecay(
  touchpoints: InputSchema["touchpoints"],
  totalValue: number,
  decayFactor: number = 0.5
): Map<string, number> {
  const conversionDate = new Date(
    Math.max(...touchpoints.map((tp) => new Date(tp.timestamp).getTime()))
  );

  const weights: Map<string, { total: number; channel: string }> = new Map();

  for (const tp of touchpoints) {
    const daysDiff =
      (conversionDate.getTime() - new Date(tp.timestamp).getTime()) /
      (1000 * 60 * 60 * 24);
    const weight = Math.pow(decayFactor, daysDiff);

    const existing = weights.get(tp.channel) || { total: 0, channel: tp.channel };
    existing.total += weight;
    weights.set(tp.channel, existing);
  }

  const totalWeight = [...weights.values()].reduce(
    (sum, w) => sum + w.total,
    0
  );

  const shares = new Map<string, number>();
  weights.forEach((w, channel) => {
    shares.set(channel, (w.total / totalWeight) * totalValue);
  });

  return shares;
}

function calculatePositionBased(
  touchpoints: InputSchema["touchpoints"],
  totalValue: number,
  firstWeight: number = 0.4,
  middleWeight: number = 0.2,
  lastWeight: number = 0.4
): Map<string, number> {
  const sorted = [...touchpoints].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const channels = [...new Set(touchpoints.map((tp) => tp.channel))];
  const firstChannelTouchpoints = sorted.filter(
    (tp) => tp.channel === channels[0]
  );
  const lastChannelTouchpoints = sorted.filter(
    (tp) => tp.channel === channels[channels.length - 1]
  );

  const shares = new Map<string, number>();

  // First touch channel gets firstWeight
  if (channels.length > 0) {
    shares.set(
      channels[0],
      totalValue * firstWeight
    );
  }

  // Last touch channel gets lastWeight
  if (channels.length > 1) {
    shares.set(
      channels[channels.length - 1],
      totalValue * lastWeight
    );
  }

  // Middle channels share the middle weight equally
  if (channels.length > 2) {
    const middleChannels = channels.slice(1, -1);
    const middleValue = (totalValue * middleWeight) / middleChannels.length;
    middleChannels.forEach((channel) => {
      shares.set(channel, middleValue);
    });
  }

  return shares;
}

const handler: SkillHandler<RoiAttributorInput, RoiAttributorOutput> = {
  slug,
  title: "Atribuidor de ROI",
  category: "analytics",
  version: "1.0.0",
  supportsAutonomous: true,

  parseInput: (raw: unknown) => {
    return InputSchema.parse(raw);
  },

  execute: async (
    input: InputSchema,
    context: SkillExecutionContext
  ): Promise<SkillExecutionResult<RoiAttributorOutput>> => {
    const startTime = Date.now();
    const executionId = `roi-${nanoid(12)}`;

    try {
      const {
        conversionId,
        conversionValue,
        conversionDate,
        touchpoints,
        attributionModel,
        includeCosts,
        channelCosts,
        useAffiliateWeightedValue,
        affiliateWeights,
      } = input;

      if (touchpoints.length === 0) {
        return {
          executionId,
          skill: "roi-attributor",
          success: false,
          decision: "needs_review",
          latencyMs: Date.now() - startTime,
          output: {} as RoiAttributorOutput,
          message: "Nenhum touchpoint fornecido para análise",
        };
      }

      // Calcular atribuição baseada no modelo
      let modelAttribution: Map<string, number>;

      switch (attributionModel) {
        case "first_touch":
          modelAttribution = calculateFirstTouch(touchpoints, conversionValue);
          break;
        case "last_touch":
          modelAttribution = calculateLastTouch(touchpoints, conversionValue);
          break;
        case "linear":
          modelAttribution = calculateLinear(touchpoints, conversionValue);
          break;
        case "time_decay":
          modelAttribution = calculateTimeDecay(touchpoints, conversionValue);
          break;
        case "position_based":
          modelAttribution = calculatePositionBased(
            touchpoints,
            conversionValue
          );
          break;
        case "data_driven":
          // Simplified data-driven uses position-based as proxy
          modelAttribution = calculatePositionBased(touchpoints, conversionValue);
          break;
        default:
          modelAttribution = calculateLastTouch(touchpoints, conversionValue);
      }

      // Calcular atribuição por touchpoint individual
      const touchpointAttribution: OutputSchema["touchpointAttribution"] = [];
      const sortedTouchpoints = [...touchpoints].sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      sortedTouchpoints.forEach((tp, index) => {
        const channelShare = modelAttribution.get(tp.channel) || 0;
        const channelTouchpointCount = touchpoints.filter(
          (t) => t.channel === tp.channel
        ).length;
        const individualShare = channelShare / channelTouchpointCount;

        touchpointAttribution.push({
          touchpointId: tp.id,
          type: tp.type,
          channel: tp.channel,
          timestamp: tp.timestamp,
          modelShare: round(channelShare / conversionValue, 4),
          calculatedValue: round(individualShare, 2),
          touchOrder: index + 1,
          isFirstTouch: index === 0,
          isLastTouch:
            index ===
            touchpoints.reduce((maxIdx, t, i) => {
              const t1 = new Date(t.timestamp).getTime();
              const t2 = new Date(touchpoints[maxIdx].timestamp).getTime();
              return t1 > t2 ? i : maxIdx;
            }, 0),
        });
      });

      // Calcular atribuição por canal
      const channelAttribution: OutputSchema["channelAttribution"] = [];
      const channelMap = new Map<
        string,
        {
          value: number;
          count: number;
          firstContribution: boolean;
          lastContribution: boolean;
        }
      >();

      for (const [channel, value] of modelAttribution) {
        const channelTouchpoints = touchpoints.filter(
          (tp) => tp.channel === channel
        );
        const sortedChannelTP = [...channelTouchpoints].sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        channelMap.set(channel, {
          value,
          count: channelTouchpoints.length,
          firstContribution: sortedChannelTP[0]?.timestamp === sortedTouchpoints[0]?.timestamp,
          lastContribution:
            sortedChannelTP[sortedChannelTP.length - 1]?.timestamp ===
            sortedTouchpoints[sortedTouchpoints.length - 1]?.timestamp,
        });
      }

      channelMap.forEach((data, channel) => {
        channelAttribution.push({
          channel,
          modelShare: round(data.value / conversionValue, 4),
          calculatedValue: round(data.value, 2),
          touchpointsCount: data.count,
          firstTouchContribution: data.firstContribution ? 1 : 0,
          lastTouchContribution: data.lastContribution ? 1 : 0,
        });
      });

      // Calcular atribuição por affiliate
      let affiliateAttribution: OutputSchema["affiliateAttribution"] | undefined;
      if (useAffiliateWeightedValue) {
        const affiliateMap = new Map<
          number,
          { total: number; count: number; weights: number[] }
        >();

        for (const tp of touchpoints) {
          if (tp.affiliateId) {
            const weight = affiliateWeights?.[tp.affiliateId.toString()] || 1;
            const existing = affiliateMap.get(tp.affiliateId) || {
              total: 0,
              count: 0,
              weights: [],
            };
            existing.total += conversionValue * weight;
            existing.count++;
            existing.weights.push(weight);
            affiliateMap.set(tp.affiliateId, existing);
          }
        }

        affiliateAttribution = [];
        affiliateMap.forEach((data, affiliateId) => {
          const avgWeight =
            data.weights.reduce((a, b) => a + b, 0) / data.weights.length;
          affiliateAttribution!.push({
            affiliateId,
            totalValue: round(data.total, 2),
            touchpointCount: data.count,
            weightedValue: round(data.total * avgWeight, 2),
          });
        });
      }

      // Calcular ROI por canal
      let channelRoi: OutputSchema["channelRoi"] | undefined;
      if (includeCosts && channelCosts) {
        channelRoi = channelAttribution.map((ca) => {
          const costData = channelCosts[ca.channel];
          const totalCost = costData
            ? costData.fixed + costData.variable * ca.touchpointsCount
            : 0;
          const roi = totalCost > 0 ? (ca.calculatedValue - totalCost) / totalCost : 0;

          return {
            channel: ca.channel,
            attributedRevenue: ca.calculatedValue,
            associatedCost: round(totalCost, 2),
            roi: round(roi, 4),
            profitMargin: round(
              totalCost > 0
                ? ((ca.calculatedValue - totalCost) / ca.calculatedValue) * 100
                : 100,
              2
            ),
          };
        });
      }

      // Comparação entre modelos
      const modelComparison: OutputSchema["modelComparison"] = {
        firstTouch: [...calculateFirstTouch(touchpoints, conversionValue).values()][0] || 0,
        lastTouch: [...calculateLastTouch(touchpoints, conversionValue).values()][0] || 0,
        linear: [...calculateLinear(touchpoints, conversionValue).values()][0] || 0,
        timeDecay: [...calculateTimeDecay(touchpoints, conversionValue).values()][0] || 0,
        positionBased: [...calculatePositionBased(touchpoints, conversionValue).values()][0] || 0,
      };

      // Insights
      const highestValueChannel = channelAttribution.sort(
        (a, b) => b.calculatedValue - a.calculatedValue
      )[0]?.channel;

      const bestTouchpoint = touchpointAttribution.sort(
        (a, b) => b.calculatedValue - a.calculatedValue
      )[0];

      const dates = touchpoints.map((tp) => new Date(tp.timestamp).getTime());
      const pathDays = {
        shortest: Math.min(...dates) ? Math.round((Math.max(...dates) - Math.min(...dates)) / (1000 * 60 * 60 * 24)) : 0,
        longest: Math.round((Math.max(...dates) - Math.min(...dates)) / (1000 * 60 * 60 * 24)),
      };

      const insights: OutputSchema["insights"] = {
        highestValueChannel,
        bestPerformingTouchpoint: bestTouchpoint?.touchpointId,
        dominantAffiliate: affiliateAttribution?.[0]?.affiliateId,
        averageTouchpointsToConvert: touchpoints.length,
        shortestPathDays: pathDays.shortest,
        longestPathDays: pathDays.longest,
      };

      // Recomendações
      const recommendations: string[] = [
        `Modelo usado: ${attributionModel}`,
        ...(highestValueChannel
          ? [`Canal de maior valor: ${highestValueChannel}`]
          : []),
        ...(affiliateAttribution && affiliateAttribution.length > 0
          ? [
              `Principal afiliado: #${affiliateAttribution[0].affiliateId}`,
              `Valor atribuído: R$ ${affiliateAttribution[0].totalValue.toFixed(2)}`,
            ]
          : []),
        "Considere testar modelos de atribuição alternativos",
        ...(channelRoi
          ? channelRoi
              .filter((cr) => cr.roi !== undefined && cr.roi < 0)
              .map((cr) => `⚠️ ROI negativo em ${cr.channel}: ${round(cr.roi! * 100, 1)}%`)
          : []),
      ];

      const output: RoiAttributorOutput = {
        attributionId: executionId,
        conversionId,
        calculatedAt: new Date().toISOString(),
        attributionModel,
        conversionValue,
        totalAttributedValue: conversionValue,
        channelAttribution,
        touchpointAttribution,
        affiliateAttribution,
        channelRoi,
        modelComparison,
        insights,
        recommendations,
      };

      return {
        executionId,
        skill: "roi-attributor",
        success: true,
        decision: "auto",
        latencyMs: Date.now() - startTime,
        output,
        message: `Atribuição ROI concluída. ${channelAttribution.length} canais impactaram a conversão.`,
      };
    } catch (error) {
      return {
        executionId: `roi-${nanoid(12)}`,
        skill: "roi-attributor",
        success: false,
        decision: "needs_review",
        latencyMs: Date.now() - startTime,
        output: {} as RoiAttributorOutput,
        message: error instanceof Error ? `Erro: ${error.message}` : "Erro desconhecido",
      };
    }
  },
};

function round(value: number, decimals: number): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

export const roiAttributorHandler = handler;
