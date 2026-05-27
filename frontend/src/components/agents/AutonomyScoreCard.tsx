import { useEffect, useState } from "react";

import { Card } from "@/components/ui/card";
import { Loader2, Cpu, ShieldCheck, AlertTriangle } from "lucide-react";

interface AutonomyScoreBreakdown {
  label: string;
  weight: number;
  contribution: number;
  rawValue: number;
  description: string;
}

interface AutonomyScoreResult {
  score: number;
  band: "low" | "developing" | "operational" | "advanced";
  breakdown: AutonomyScoreBreakdown[];
  notes: string[];
  generatedAt: string;
}

interface AutonomyScoreCardProps {
  /** Quando true, busca o score do usuário logado em `agentSkillsRuntime.myAutonomyScore`. */
  scope?: "agent" | "network";
  /** Inputs explícitos para o cálculo (opcional, sobrepõe scope). */
  inputOverride?: Record<string, number>;
  title?: string;
  subtitle?: string;
}

function getTrpcBaseUrl(): string {
  if (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_TRPC_URL) {
    return (import.meta as any).env.VITE_TRPC_URL as string;
  }
  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.host}/api/trpc`;
  }
  return "/api/trpc";
}

async function fetchAutonomyScore(
  scope: AutonomyScoreCardProps["scope"],
  inputOverride: AutonomyScoreCardProps["inputOverride"],
): Promise<AutonomyScoreResult | null> {
  try {
    const base = getTrpcBaseUrl();

    // Caminho protegido (agente do usuário logado)
    if (scope === "agent" && !inputOverride) {
      const res = await fetch(`${base}/agentSkillsRuntime.myAutonomyScore`, {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Falha ao consultar score do agente.");
      const json = await res.json();
      return (json?.result?.data as AutonomyScoreResult) ?? null;
    }

    // Caminho público com inputs explícitos
    const params = new URLSearchParams();
    if (inputOverride) {
      params.set("input", JSON.stringify(inputOverride));
    }
    const qs = params.toString() ? `?${params.toString()}` : "";
    const res = await fetch(`${base}/agentSkillsRuntime.autonomyScore${qs}`, {
      method: "GET",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Falha ao calcular score.");
    const json = await res.json();
    return (json?.result?.data as AutonomyScoreResult) ?? null;
  } catch {
    return null;
  }
}

function bandStyles(band: AutonomyScoreResult["band"]) {
  switch (band) {
    case "advanced":
      return {
        ring: "border-emerald-400/50 bg-emerald-400/10",
        text: "text-emerald-300",
        label: "Operação autônoma plena",
      };
    case "operational":
      return {
        ring: "border-cyan-400/50 bg-cyan-400/10",
        text: "text-cyan-300",
        label: "Operacional supervisionado",
      };
    case "developing":
      return {
        ring: "border-amber-400/50 bg-amber-400/10",
        text: "text-amber-300",
        label: "Em desenvolvimento",
      };
    default:
      return {
        ring: "border-red-400/50 bg-red-400/10",
        text: "text-red-300",
        label: "Baixa autonomia",
      };
  }
}

const FALLBACK_NETWORK_INPUT = {
  autonomousTasksPct: 58,
  judgeAccuracyPct: 71,
  operationalSkills: 1,
  totalSkills: 45,
  avgLatencyMs: 2400,
  manualApprovalPct: 76,
  activeChannels: 3,
};

export default function AutonomyScoreCard({
  scope = "agent",
  inputOverride,
  title = "Autonomy Score",
  subtitle = "Indicador composto 0-100 do roadmap de autonomia.",
}: AutonomyScoreCardProps) {
  const [result, setResult] = useState<AutonomyScoreResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const effectiveInput =
      inputOverride ?? (scope === "network" ? FALLBACK_NETWORK_INPUT : undefined);

    fetchAutonomyScore(scope, effectiveInput).then((data) => {
      if (cancelled) return;
      setResult(data);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [scope, inputOverride]);

  return (
    <Card className="border border-cyan-400/20 bg-slate-900/40 p-6 backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-cyan-300">
            // NEXUS_AUTONOMY_SCORE
          </p>
          <h3 className="mt-2 text-lg font-bold text-white">{title}</h3>
          <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
        </div>
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-cyan-400/30 bg-cyan-400/10 text-cyan-300">
          <Cpu size={18} />
        </div>
      </div>

      {loading ? (
        <div className="mt-6 flex items-center gap-3 text-slate-400">
          <Loader2 className="animate-spin" size={18} /> Calculando score…
        </div>
      ) : result ? (
        <>
          <div
            className={`mt-6 flex items-center gap-4 rounded-xl border px-5 py-4 ${
              bandStyles(result.band).ring
            }`}
          >
            <div className={`text-5xl font-bold ${bandStyles(result.band).text}`}>
              {result.score}
            </div>
            <div className="space-y-1">
              <p className={`text-sm font-semibold ${bandStyles(result.band).text}`}>
                {bandStyles(result.band).label}
              </p>
              <p className="text-xs text-slate-400">
                Atualizado em {new Date(result.generatedAt).toLocaleString("pt-BR")}
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {result.breakdown.map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-slate-700/60 bg-slate-900/40 p-3"
              >
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="font-medium">{item.label}</span>
                  <span className="font-mono text-cyan-300">
                    {item.contribution}/{item.weight}
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                    style={{ width: `${Math.min(100, item.rawValue)}%` }}
                  />
                </div>
                <p className="mt-2 text-[11px] text-slate-500">{item.description}</p>
              </div>
            ))}
          </div>

          {result.notes.length > 0 && (
            <div className="mt-5 rounded-lg border border-amber-400/30 bg-amber-400/5 p-3 text-xs text-amber-200">
              <div className="flex items-center gap-2 text-amber-300">
                <AlertTriangle size={14} />
                <span className="font-semibold">Observações operacionais</span>
              </div>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {result.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <div className="mt-6 flex items-center gap-3 rounded-lg border border-amber-400/30 bg-amber-400/5 p-3 text-sm text-amber-200">
          <ShieldCheck size={18} />
          <span>
            Backend operacional ainda não disponível. O Autonomy Score aparecerá automaticamente
            quando o serviço Render publicar este endpoint.
          </span>
        </div>
      )}
    </Card>
  );
}
