import { z } from "zod";
import { nanoid } from "nanoid";
import type {
  SkillHandler,
  SkillExecutionContext,
  SkillExecutionResult,
} from "./types";

/**
 * Skill: Upsell Strategist (Estratégia de Upsell)
 * -----------------------------------------------------------------------------
 * Identifica oportunidades de upsell e cross-sell e gera
 * recomendações personalizadas para maximização de LTV.
 */
const slug = "upsell-strategist" as const;

const InputSchema = z.object({
  customer: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    totalSpent: z.number(),
    orderCount: z.number(),
    lastPurchaseDate: z.string().datetime(),
    avgOrderValue: z.number(),
    customerSince: z.string().datetime(),
  }).optional(),
  recentOrders: z.array(
    z.object({
      orderId: z.string(),
      products: z.array(z.string()),
      total: z.number(),
      date: z.string().datetime(),
      category: z.string(),
    })
  ),
  currentProducts: z.array(
    z.object({
      productId: z.string(),
      name: z.string(),
      category: z.string(),
      price: z.number(),
      purchaseDate: z.string().datetime(),
    })
  ),
  availableProducts: z.array(
    z.object({
      productId: z.string(),
      name: z.string(),
      category: z.string(),
      price: z.number(),
      profitMargin: z.number(),
      upsellProbability: z.number(),
    })
  ).optional(),
  revenueGoal: z.number().optional(),
  strategyType: z.enum(["upsell", "crossSell", "bundle", "all"]).default("all"),
  considerSeasonality: z.boolean().default(true),
});

const OutputSchema = z.object({
  strategyId: z.string(),
  generatedAt: z.string(),
  customerId: z.string().optional(),
  customerSummary: z.object({
    totalSpent: z.number(),
    avgOrderValue: z.number(),
    orderCount: z.number(),
    ltvScore: z.number(),
    customerTier: z.enum(["new", "engaged", "loyal", "champion", "atRisk"]),
  }),
  upsellOpportunities: z.array(
    z.object({
      productId: z.string(),
      productName: z.string(),
      currentReward: z.number(),
      suggestedUpsell: z.string(),
      priceIncrease: z.number(),
      expectedConversionRate: z.number(),
      maxAcceptablePrice: z.number(),
      pitchMessage: z.string(),
    })
  ),
  crossSellRecommendations: z.array(
    z.object({
      primaryProduct: z.string(),
      secondaryProduct: z.string(),
      categoryMatch: z.number(),
      recommendationStrength: z.enum(["strong", "moderate", "weak"]),
      combinedOffer: z.string(),
      bundleDiscount: z.number().optional(),
      expectedLift: z.number(),
    })
  ),
  bundleSuggestions: z.array(
    z.object({
      bundleName: z.string(),
      products: z.array(z.string()),
      originalPrice: z.number(),
      bundlePrice: z.number(),
      savings: z.number(),
      margin: z.number(),
      targetCustomer: z.string(),
    })
  ),
  optimalTiming: z.object({
    recommendedDay: z.string(),
    recommendedTime: z.string(),
    reason: z.string(),
    seasonalFactors: z.array(z.string()),
  }),
  personalizedOffers: z.array(
    z.object({
      offerType: z.enum(["discount", "bogo", "freeShipping", "bonus", "loyalty"]),
      triggerPurchase: z.number().optional(),
      conditions: z.array(z.string()),
      message: z.string(),
    })
  ),
  revenueProjections: z.object({
    potentialUpsellRevenue: z.number(),
    potentialCrossSellRevenue: z.number(),
    projectedLtvIncrease: z.number(),
    confidenceScore: z.number(),
  }),
  recommendations: z.array(z.string()),
  nextBestAction: z.string(),
});

export type UpsellStrategistInput = z.infer<typeof InputSchema>;
export type UpsellStrategistOutput = z.infer<typeof OutputSchema>;

function calculateLtvScore(customer: InputSchema["customer"], orders: InputSchema["recentOrders"]): number {
  if (!customer) return 50;

  const recencyDays = customer.lastPurchaseDate
    ? Math.floor((Date.now() - new Date(customer.lastPurchaseDate).getTime()) / (1000 * 60 * 60 * 24))
    : 30;

  const frequencyScore = Math.min(orders.length / 10, 1) * 30;
  const monetaryScore = Math.min(customer.totalSpent / 10000, 1) * 40;
  const recencyScore = recencyDays < 30 ? 30 : Math.max(0, 30 - recencyDays * 0.5);

  return Math.round(frequencyScore + monetaryScore + recencyScore);
}

function getCustomerTier(ltvScore: number): "new" | "engaged" | "loyal" | "champion" | "atRisk" {
  if (ltvScore >= 80) return "champion";
  if (ltvScore >= 60) return "loyal";
  if (ltvScore >= 40) return "engaged";
  if (ltvScore >= 20) return "new";
  return "atRisk";
}

function getOptimalTiming(considerSeasonality: boolean) {
  const now = new Date();
  const month = now.getMonth();
  const dayOfWeek = now.getDay();

  const seasonalFactors: string[] = [];

  if ([10, 11].includes(month)) {
    seasonalFactors.push("Black Friday / Natal - alta propensão a upsell");
  } else if ([0, 1].includes(month)) {
    seasonalFactors.push("Pós-férias - oportunidades de upsell em educação");
  } else if ([5, 6, 7].includes(month)) {
    seasonalFactors.push("Férias - considerar ofertas sazonais");
  }

  const dayMap: Record<number, string> = {
    1: "Segunda-feira",
    2: "Terça-feira",
    3: "Quarta-feira",
    4: "Quinta-feira",
    5: "Sexta-feira",
    6: "Sábado (manhã)",
    0: "Domingo (manhã)",
  };

  const timeMap = [9, 10, 11, 14, 15, 19, 20];
  const recommendedHour = timeMap[Math.floor(Math.random() * timeMap.length)];

  return {
    recommendedDay: dayMap[dayOfWeek] || "Terça-feira",
    recommendedTime: `${recommendedHour}:00`,
    reason: "Horários de pico de engajamento para e-commerce",
    seasonalFactors,
  };
}

function calculateCrossSell(
  currentProducts: InputSchema["currentProducts"],
  availableProducts: NonNullable<InputSchema["availableProducts"]>
): OutputSchema["crossSellRecommendations"] {
  const recommendations: OutputSchema["crossSellRecommendations"] = [];

  for (const current of currentProducts) {
    for (const available of availableProducts) {
      if (current.productId === available.productId) continue;

      const categoryMatch = current.category === available.category ? 0.8 : 0.2;
      const strength: "strong" | "moderate" | "weak" =
        categoryMatch > 0.6 ? "strong" : categoryMatch > 0.3 ? "moderate" : "weak";

      recommendations.push({
        primaryProduct: current.productId,
        secondaryProduct: available.productId,
        categoryMatch: Math.round(categoryMatch * 100) / 100,
        recommendationStrength: strength,
        combinedOffer: `${current.productId} + ${available.productId}`,
        bundleDiscount: strength === "strong" ? 10 : strength === "moderate" ? 5 : 0,
        expectedLift: Math.round((categoryMatch * 25 + (strength === "strong" ? 15 : 0)) * 100) / 100,
      });
    }
  }

  return recommendations.sort((a, b) => b.expectedLift - a.expectedLift).slice(0, 5);
}

const handler: SkillHandler<UpsellStrategistInput, UpsellStrategistOutput> = {
  slug,
  title: "Estrategista de Upsell",
  category: "sales",
  version: "1.0.0",
  supportsAutonomous: true,

  parseInput: (raw: unknown) => {
    return InputSchema.parse(raw);
  },

  execute: async (
    input: UpsellStrategistInput,
    context: SkillExecutionContext
  ): Promise<SkillExecutionResult<UpsellStrategistOutput>> => {
    const startTime = Date.now();
    const executionId = `upsell-${nanoid(12)}`;

    try {
      const {
        customer,
        recentOrders,
        currentProducts,
        availableProducts,
        revenueGoal,
        strategyType,
        considerSeasonality,
      } = input;

      const ltvScore = calculateLtvScore(customer, recentOrders);
      const customerTier = getCustomerTier(ltvScore);

      const totalSpent = customer?.totalSpent ||
        recentOrders.reduce((sum, o) => sum + o.total, 0);
      const avgOrderValue = customer?.avgOrderValue ||
        (recentOrders.length > 0 ? totalSpent / recentOrders.length : 0);

      const upsellOpportunities: OutputSchema["upsellOpportunities"] = [];

      for (const product of currentProducts) {
        upsellOpportunities.push({
          productId: product.productId,
          productName: product.name,
          currentReward: Math.round(product.price * 0.1),
          suggestedUpsell: `${product.name} Pro / Premium`,
          priceIncrease: Math.round(product.price * 0.5),
          expectedConversionRate: Math.round(Math.random() * 30 + 10),
          maxAcceptablePrice: Math.round(product.price * 1.8),
          pitchMessage: `Você sabia que a versão premium de ${product.name} tem funcionalidades extras que podem ajudar você?`,
        });
      }

      let crossSellRecommendations: OutputSchema["crossSellRecommendations"] = [];
      if (availableProducts && (strategyType === "crossSell" || strategyType === "all")) {
        crossSellRecommendations = calculateCrossSell(currentProducts, availableProducts);
      }

      const bundleSuggestions: OutputSchema["bundleSuggestions"] = [];
      if (strategyType === "bundle" || strategyType === "all") {
        if (currentProducts.length >= 2) {
          const bundleProducts = currentProducts.slice(0, 3);
          const originalPrice = bundleProducts.reduce((sum, p) => sum + p.price, 0);
          const bundlePrice = Math.round(originalPrice * 0.85);

          bundleSuggestions.push({
            bundleName: `Pacote Completo - ${bundleProducts[0].category}`,
            products: bundleProducts.map(p => p.productId),
            originalPrice,
            bundlePrice,
            savings: originalPrice - bundlePrice,
            margin: Math.round((1 - bundlePrice / originalPrice) * 100),
            targetCustomer: customerTier,
          });
        }
      }

      const optimalTiming = getOptimalTiming(considerSeasonality);

      const personalizedOffers: OutputSchema["personalizedOffers"] = [];

      if (customerTier === "champion" || customerTier === "loyal") {
        personalizedOffers.push({
          offerType: "bonus",
          triggerPurchase: 100,
          conditions: ["Cliente VIP"],
          message: "Como cliente premium, você recebe 10% de bonus neste upsell!",
        });
      } else if (customerTier === "atRisk") {
        personalizedOffers.push({
          offerType: "discount",
          triggerPurchase: 50,
          conditions: ["Cliente inativo"],
          message: "Sentimos sua falta! Ganhe 15% de desconto na sua próxima compra.",
        });
      } else {
        personalizedOffers.push({
          offerType: "freeShipping",
          triggerPurchase: 200,
          conditions: ["Frete gratis acima de R$200"],
          message: "Garanta frete gratis em qualquer upsell acima de R$200!",
        });
      }

      const potentialUpsellRevenue = upsellOpportunities.reduce(
        (sum, o) => sum + o.priceIncrease * (o.expectedConversionRate / 100) * recentOrders.length,
        0
      );

      const potentialCrossSellRevenue = crossSellRecommendations.reduce(
        (sum, r) => sum + (r.expectedLift / 100) * totalSpent,
        0
      );

      const projectedLtvIncrease = Math.round(
        (potentialUpsellRevenue + potentialCrossSellRevenue) * 0.3
      );

      const recommendations: string[] = [
        `Cliente: ${customer?.name || "Anônimo"} | Tier: ${customerTier}`,
        `LTV Score: ${ltvScore}/100 | Táticas: ${strategyType}`,
        ...(potentialUpsellRevenue > 0
          ? [`Potencial upsell: R$ ${Math.round(potentialUpsellRevenue)}`]
          : []),
        ...(potentialCrossSellRevenue > 0
          ? [`Potencial cross-sell: R$ ${Math.round(potentialCrossSellRevenue)}`]
          : []),
        `Melhor momento: ${optimalTiming.recommendedDay} às ${optimalTiming.recommendedTime}`,
        ...(revenueGoal && totalSpent > revenueGoal
          ? ["META ATINGIDA: Considerar premium tier para este cliente"]
          : revenueGoal
          ? [`Faltam R$ ${Math.round(revenueGoal - totalSpent)} para meta`]
          : []),
      ];

      let nextBestAction = "Revisar lista de produtos para upsell";
      if (customerTier === "atRisk") {
        nextBestAction = "Executar campanha de reativação com desconto especial";
      } else if (upsellOpportunities.length > 0) {
        nextBestAction = `Oferecer upgrade para ${upsellOpportunities[0].productName} Pro`;
      } else if (crossSellRecommendations.length > 0) {
        nextBestAction = `Recomendar ${crossSellRecommendations[0].secondaryProduct}`;
      }

      const output: UpsellStrategistOutput = {
        strategyId: executionId,
        generatedAt: new Date().toISOString(),
        customerId: customer?.id,
        customerSummary: {
          totalSpent: Math.round(totalSpent * 100) / 100,
          avgOrderValue: Math.round(avgOrderValue * 100) / 100,
          orderCount: recentOrders.length,
          ltvScore,
          customerTier,
        },
        upsellOpportunities,
        crossSellRecommendations,
        bundleSuggestions,
        optimalTiming,
        personalizedOffers,
        revenueProjections: {
          potentialUpsellRevenue: Math.round(potentialUpsellRevenue * 100) / 100,
          potentialCrossSellRevenue: Math.round(potentialCrossSellRevenue * 100) / 100,
          projectedLtvIncrease: Math.round(projectedLtvIncrease * 100) / 100,
          confidenceScore: Math.round(Math.random() * 20 + 70),
        },
        recommendations,
        nextBestAction,
      };

      return {
        executionId,
        skill: "upsell-strategist",
        success: true,
        decision: ltvScore > 70 ? "auto" : "needs_review",
        latencyMs: Date.now() - startTime,
        output,
        message: `Estratégia upsell gerada. LTV Score: ${ltvScore}/100 (${customerTier}). Potencial: R$ ${Math.round(potentialUpsellRevenue + potentialCrossSellRevenue)}.`,
      };
    } catch (error) {
      return {
        executionId: `upsell-${nanoid(12)}`,
        skill: "upsell-strategist",
        success: false,
        decision: "needs_review",
        latencyMs: Date.now() - startTime,
        output: {} as UpsellStrategistOutput,
        message: error instanceof Error ? `Erro: ${error.message}` : "Erro desconhecido",
      };
    }
  },
};

export const upsellStrategistHandler = handler;
