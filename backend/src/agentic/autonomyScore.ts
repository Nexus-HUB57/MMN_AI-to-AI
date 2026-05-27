import { listRegisteredSkillHandlers } from "./skills/dispatcher";

/**
 * Autonomy Score 0-100
 * -----------------------------------------------------------------------------
 * Composição (pesos conforme docs/planning/SKILL_RENTAL_AND_AGENT_AUTONOMY.md):
 *   30% · % de tarefas sem intervenção humana
 *   20% · acurácia média do LLM-as-Judge
 *   15% · cobertura de skills com handler real (operacionais / total catálogo)
 *   15% · latência média de resposta (≤2s = 100, ≥10s = 0)
 *   10% · taxa de aprovação manual das saídas
 *   10% · diversidade de canais ativos (até 5)
 *
 * Esta primeira versão expõe a fórmula determinística para o painel admin e
 * para o painel do agente. Os números reais virão dos audit_logs em fases
 * seguintes; aqui aceitamos inputs explícitos para permitir cálculo imediato
 * com dados parciais e degradação graciosa.
 */

export interface AutonomyScoreInput {
  /** % tarefas sem intervenção humana (0-100) */
  autonomousTasksPct?: number;
  /** acurácia média do LLM-as-Judge (0-100) */
  judgeAccuracyPct?: number;
  /** quantidade total de skills no catálogo do agente */
  totalSkills?: number;
  /** quantidade de skills com handler operacional registrado no backend */
  operationalSkills?: number;
  /** latência média em milissegundos */
  avgLatencyMs?: number;
  /** % de saídas aprovadas manualmente (0-100) */
  manualApprovalPct?: number;
  /** número de canais distintos ativos (instagram, whatsapp, etc.) */
  activeChannels?: number;
}

export interface AutonomyScoreBreakdown {
  label: string;
  weight: number;
  contribution: number;
  rawValue: number;
  description: string;
}

export interface AutonomyScoreResult {
  score: number;
  band: "low" | "developing" | "operational" | "advanced";
  breakdown: AutonomyScoreBreakdown[];
  notes: string[];
  generatedAt: string;
}

function clamp(value: number, min = 0, max = 100): number {
  if (Number.isNaN(value)) return min;
  return Math.max(min, Math.min(max, value));
}

function latencyToScore(latencyMs: number | undefined): number {
  if (latencyMs === undefined) return 60; // valor neutro
  if (latencyMs <= 2000) return 100;
  if (latencyMs >= 10000) return 0;
  // interpolação linear entre 2000ms (100) e 10000ms (0)
  const slope = -100 / 8000;
  return clamp(100 + slope * (latencyMs - 2000));
}

function channelsToScore(channels: number | undefined): number {
  if (!channels || channels <= 0) return 0;
  return clamp((channels / 5) * 100);
}

function coverageScore(operational: number | undefined, total: number | undefined): number {
  if (!total || total <= 0) {
    // fallback: comparar contra o catálogo registrado no dispatcher
    const fallbackTotal = Math.max(listRegisteredSkillHandlers().length, 1);
    const fallbackOperational = Math.max(operational ?? 0, 0);
    return clamp((fallbackOperational / fallbackTotal) * 100);
  }
  return clamp(((operational ?? 0) / total) * 100);
}

function bandFor(score: number): AutonomyScoreResult["band"] {
  if (score >= 80) return "advanced";
  if (score >= 60) return "operational";
  if (score >= 35) return "developing";
  return "low";
}

export function computeAutonomyScore(input: AutonomyScoreInput = {}): AutonomyScoreResult {
  const components: AutonomyScoreBreakdown[] = [
    {
      label: "Tarefas autônomas",
      weight: 30,
      rawValue: clamp(input.autonomousTasksPct ?? 0),
      contribution: 0,
      description: "% de execuções concluídas sem intervenção humana.",
    },
    {
      label: "Acurácia do Judge",
      weight: 20,
      rawValue: clamp(input.judgeAccuracyPct ?? 0),
      contribution: 0,
      description: "Média do LLM-as-Judge nas saídas avaliadas.",
    },
    {
      label: "Cobertura operacional",
      weight: 15,
      rawValue: coverageScore(input.operationalSkills, input.totalSkills),
      contribution: 0,
      description: "% de skills do catálogo com handler real registrado no backend.",
    },
    {
      label: "Latência média",
      weight: 15,
      rawValue: latencyToScore(input.avgLatencyMs),
      contribution: 0,
      description: "≤2s = 100, ≥10s = 0; interpolação linear no intervalo.",
    },
    {
      label: "Aprovação manual",
      weight: 10,
      rawValue: clamp(input.manualApprovalPct ?? 0),
      contribution: 0,
      description: "% de saídas aprovadas em revisão manual humana.",
    },
    {
      label: "Diversidade de canais",
      weight: 10,
      rawValue: channelsToScore(input.activeChannels),
      contribution: 0,
      description: "Canais ativos distintos (alvo: 5).",
    },
  ];

  for (const component of components) {
    component.contribution = Math.round((component.rawValue * component.weight) / 100);
  }

  const score = clamp(
    components.reduce((acc, component) => acc + component.contribution, 0),
  );

  const notes: string[] = [];
  if (!input.totalSkills) {
    notes.push("Cobertura calculada via dispatcher local (catálogo real ainda não conectado ao DB).");
  }
  if (input.avgLatencyMs === undefined) {
    notes.push("Latência média ausente — valor neutro aplicado.");
  }
  if (!input.activeChannels) {
    notes.push("Nenhum canal ativo informado — score de diversidade zerado.");
  }

  return {
    score,
    band: bandFor(score),
    breakdown: components,
    notes,
    generatedAt: new Date().toISOString(),
  };
}
