import { randomUUID } from "node:crypto";
import { z } from "zod";

import type {
  SkillExecutionContext,
  SkillExecutionResult,
  SkillHandler,
} from "./types";

/**
 * Handler operacional · Detector de Tendências
 * -----------------------------------------------------------------------------
 * Recebe um lote de sinais (produtos, palavras-chave, métricas de canal) e
 * devolve:
 *  - lista de tendências quentes (score 0-100) ordenadas por prioridade;
 *  - clusters de tema; oportunidades de outreach;
 *  - alertas (sinais conflitantes, baixa amostra).
 *
 * Heurísticas:
 *  - Score = 0.45 * crescimento + 0.30 * volume_norm + 0.15 * margem +
 *            0.10 * encaixe_canal
 *  - Detecta padrões: mesma raiz de palavra em ≥ 3 itens → cluster ativo.
 *  - Marca needs_review quando há menos de 3 sinais ou quando score máximo
 *    < 55 (sinal fraco / amostra insuficiente).
 *
 * Esta skill alimenta downstream: copywriter-persuasivo (tema do post),
 * auto-publisher (calendário) e prospeccao-outbound (mensagens segmentadas).
 */

const SignalSchema = z.object({
  id: z.string().min(1).max(80).optional(),
  title: z.string().min(2).max(180),
  category: z.string().min(2).max(80),
  platform: z
    .enum(["hotmart", "shopee", "mercado-livre", "instagram", "tiktok", "google", "outro"])
    .default("outro"),
  growthPct: z.number().min(-100).max(1000).default(0),
  searchVolume: z.number().min(0).default(0),
  marginPct: z.number().min(0).max(100).default(30),
  channelFit: z.number().min(0).max(100).default(50),
  keywords: z.array(z.string().min(2).max(40)).max(20).default([]),
});

const DetectorInputSchema = z.object({
  signals: z.array(SignalSchema).min(1).max(50),
  horizonDays: z.number().int().min(1).max(180).default(30),
  preferredChannels: z
    .array(z.enum(["instagram", "whatsapp", "facebook", "email", "tiktok", "landing"]))
    .max(6)
    .default(["instagram", "whatsapp"]),
});

export type DetectorInput = z.infer<typeof DetectorInputSchema>;
type Signal = z.infer<typeof SignalSchema>;

export interface TrendItem {
  id: string;
  title: string;
  category: string;
  platform: string;
  score: number;
  band: "fria" | "morna" | "quente" | "explosiva";
  reasons: string[];
  keywords: string[];
}

export interface TrendCluster {
  theme: string;
  items: string[];
  averageScore: number;
}

export interface DetectorOutput {
  horizonDays: number;
  trends: TrendItem[];
  topTrend: TrendItem | null;
  clusters: TrendCluster[];
  outreachOpportunities: Array<{
    audienceHint: string;
    suggestedChannel: string;
    relatedTrend: string;
  }>;
  alerts: string[];
}

function normalizeVolume(value: number): number {
  if (value <= 0) return 0;
  // log-scale para suavizar caudas longas
  return Math.min(100, Math.round((Math.log10(value + 1) / Math.log10(100000)) * 100));
}

function bandFor(score: number): TrendItem["band"] {
  if (score >= 85) return "explosiva";
  if (score >= 70) return "quente";
  if (score >= 45) return "morna";
  return "fria";
}

function rootOf(word: string): string {
  return word.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").slice(0, 5);
}

function clusterize(trends: TrendItem[]): TrendCluster[] {
  const byRoot = new Map<string, TrendItem[]>();
  for (const trend of trends) {
    for (const keyword of trend.keywords) {
      const root = rootOf(keyword);
      if (!root) continue;
      if (!byRoot.has(root)) byRoot.set(root, []);
      const list = byRoot.get(root)!;
      if (!list.find((item) => item.id === trend.id)) {
        list.push(trend);
      }
    }
  }

  const clusters: TrendCluster[] = [];
  for (const [root, items] of byRoot.entries()) {
    if (items.length < 3) continue;
    const averageScore = Math.round(
      items.reduce((acc, item) => acc + item.score, 0) / items.length,
    );
    clusters.push({
      theme: root,
      items: items.map((item) => item.title),
      averageScore,
    });
  }
  return clusters.sort((a, b) => b.averageScore - a.averageScore).slice(0, 5);
}

function scoreSignal(signal: Signal): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  const growthScore = Math.min(100, Math.max(0, signal.growthPct));
  const volumeScore = normalizeVolume(signal.searchVolume);
  const marginScore = signal.marginPct;
  const fitScore = signal.channelFit;

  if (growthScore >= 60) reasons.push(`Crescimento alto (${signal.growthPct}%)`);
  if (volumeScore >= 60) reasons.push(`Volume de busca relevante (${signal.searchVolume})`);
  if (marginScore >= 40) reasons.push(`Margem saudável (${signal.marginPct}%)`);
  if (fitScore >= 70) reasons.push(`Boa aderência ao canal (${signal.platform})`);

  const score = Math.round(
    growthScore * 0.45 + volumeScore * 0.3 + marginScore * 0.15 + fitScore * 0.1,
  );
  return { score: Math.max(0, Math.min(100, score)), reasons };
}

function buildOutreach(
  trends: TrendItem[],
  preferredChannels: DetectorInput["preferredChannels"],
): DetectorOutput["outreachOpportunities"] {
  return trends
    .filter((trend) => trend.score >= 60)
    .slice(0, 5)
    .map((trend, index) => ({
      audienceHint: `${trend.category} · perfil interessado em ${trend.keywords.slice(0, 2).join(", ") || trend.title}`,
      suggestedChannel: preferredChannels[index % preferredChannels.length] ?? "instagram",
      relatedTrend: trend.title,
    }));
}

export const detectorTendenciasHandler: SkillHandler<DetectorInput, DetectorOutput> = {
  slug: "detector-tendencias",
  title: "Detector de Tendências",
  category: "intelligence",
  version: "1.0.0",
  supportsAutonomous: true,
  parseInput: (raw: unknown): DetectorInput => DetectorInputSchema.parse(raw),
  execute: async (
    input: DetectorInput,
    context: SkillExecutionContext,
  ): Promise<SkillExecutionResult<DetectorOutput>> => {
    const startedAt = Date.now();

    const trends: TrendItem[] = input.signals
      .map((signal) => {
        const { score, reasons } = scoreSignal(signal);
        const id = signal.id ?? randomUUID();
        return {
          id,
          title: signal.title,
          category: signal.category,
          platform: signal.platform,
          score,
          band: bandFor(score),
          reasons,
          keywords: signal.keywords,
        } satisfies TrendItem;
      })
      .sort((a, b) => b.score - a.score);

    const clusters = clusterize(trends);
    const outreachOpportunities = buildOutreach(trends, input.preferredChannels);

    const alerts: string[] = [];
    if (trends.length < 3) {
      alerts.push("Amostra reduzida (<3 sinais) — confiabilidade limitada.");
    }
    if (trends[0] && trends[0].score < 55) {
      alerts.push("Nenhuma tendência atingiu o limiar de 55 — sinal de mercado fraco.");
    }
    if (clusters.length === 0 && trends.length >= 3) {
      alerts.push("Nenhum cluster temático detectado — keywords pouco recorrentes.");
    }

    const decision: SkillExecutionResult["decision"] =
      !context.autonomyAllowed ||
      alerts.some((alert) => alert.includes("Amostra reduzida") || alert.includes("sinal de mercado fraco"))
        ? "needs_review"
        : "auto";

    const output: DetectorOutput = {
      horizonDays: input.horizonDays,
      trends,
      topTrend: trends[0] ?? null,
      clusters,
      outreachOpportunities,
      alerts,
    };

    return {
      executionId: randomUUID(),
      skill: "detector-tendencias",
      success: true,
      decision,
      latencyMs: Date.now() - startedAt,
      output,
      warnings: alerts,
      message:
        decision === "auto"
          ? `Detector concluído: ${trends.length} sinais analisados, ${clusters.length} clusters.`
          : `Detector executou com alertas — recomendado revisar antes de acionar publicação.`,
    };
  },
};
