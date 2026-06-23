/**
 * AgentLivePanel — Painel ao vivo do Agente IA do usuário.
 *
 * Componentes integrados:
 *   1. StatusCard       — status + última skill + próxima ação sugerida
 *   2. SkillRunner      — botão "Executar skill agora" com 5 skills + dry-run/real
 *   3. ExecutionHistory — timeline das últimas execuções (replay)
 *   4. AutoPilotToggle  — switch on/off de modo autônomo (persiste localStorage)
 *
 * Plug-and-play: <AgentLivePanel variant="full" /> em /agents, /dashboard, etc.
 */
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Cpu, Play, Pause, Clock, Zap, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";

type Variant = "full" | "compact";

const AUTOPILOT_KEY = "nexus_agent_autopilot_v1";

// Payloads prontos por skill (dry-run válido)
const SKILL_PAYLOADS: Record<string, { label: string; input: any; emoji: string }> = {
  "detector-tendencias": {
    label: "🔍 Detectar Tendências",
    emoji: "🔍",
    input: {
      signals: [
        {
          title: "Boom Agentes IA Brasil",
          category: "infoprodutos-ia",
          platform: "hotmart",
          growthPct: 85,
          searchVolume: 12500,
          marginPct: 45,
          channelFit: 80,
          keywords: ["ia", "afiliado", "agente"],
        },
      ],
      horizonDays: 30,
      preferredChannels: ["instagram", "whatsapp"],
    },
  },
  "prospeccao-outbound": {
    label: "🎯 Prospectar Leads",
    emoji: "🎯",
    input: {
      prospects: [
        {
          name: "Lead Demo",
          audienceFit: 75,
          recentEngagement: 60,
          buyingPower: 70,
          preferredChannel: "email",
          optIn: true,
        },
      ],
      productName: "Pack Agente Afiliado A²",
      productBenefit: "10 e-books de IA + Agente IA básico",
      allowedChannels: ["email", "whatsapp"],
    },
  },
  "lead-enricher": {
    label: "✨ Enriquecer Lead",
    emoji: "✨",
    input: {
      leadEmail: "lead@example.com",
      leadName: "Lead Demo",
      source: "organic",
      targetUse: "scoring",
    },
  },
  "auto-publisher": {
    label: "📤 Publicar Conteúdo",
    emoji: "📤",
    input: {
      drafts: [
        {
          id: "d1",
          title: "Pack A² ativo",
          body: "Lance sua operação de afiliado IA hoje",
          cta: { label: "Conhecer", link: "https://oneverso.com.br/marketplaces" },
        },
      ],
      channels: ["instagram", "email"],
      horizonDays: 3,
      maxPerChannelPerDay: 2,
    },
  },
};

export default function AgentLivePanel({ variant = "full" }: { variant?: Variant }) {
  const handlersQuery = (trpc as any).agentSkillsRuntime?.listHandlers?.useQuery
    ? (trpc as any).agentSkillsRuntime.listHandlers.useQuery(undefined, { staleTime: 60_000 })
    : { data: null };

  const executeMutation = (trpc as any).agentSkillsRuntime?.execute?.useMutation
    ? (trpc as any).agentSkillsRuntime.execute.useMutation()
    : null;

  const historyQuery = (trpc as any).agentSkillsRuntime?.executionHistory?.useQuery
    ? (trpc as any).agentSkillsRuntime.executionHistory.useQuery(
        { limit: 8 } as any,
        { refetchInterval: 20_000 },
      )
    : { data: null, refetch: () => {} };

  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<any>(null);
  const [autoPilot, setAutoPilot] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setAutoPilot(window.localStorage.getItem(AUTOPILOT_KEY) === "1");
  }, []);

  const toggleAutoPilot = () => {
    const next = !autoPilot;
    setAutoPilot(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(AUTOPILOT_KEY, next ? "1" : "0");
    }
  };

  const totalHandlers = handlersQuery.data?.total ?? 0;

  const runSkill = async (slug: string) => {
    if (!executeMutation) return;
    const cfg = SKILL_PAYLOADS[slug];
    if (!cfg) return;
    setBusySlug(slug);
    setLastResult(null);
    try {
      const res: any = await executeMutation.mutateAsync({
        slug,
        input: cfg.input,
        autonomyAllowed: autoPilot,
        channelHint: autoPilot ? "auto" : "dry-run",
      });
      setLastResult({
        ok: true,
        skill: slug,
        emoji: cfg.emoji,
        executionId: res?.executionId,
        decision: res?.decision,
        latencyMs: res?.latencyMs,
        success: res?.success,
        message:
          res?.output?.topTrend?.title ||
          res?.output?.headline ||
          res?.output?.publishedCount !== undefined
            ? `${res?.output?.publishedCount ?? 0} agendados`
            : res?.message || "Skill executada",
        output: res?.output,
      });
      await historyQuery.refetch?.();
    } catch (e: any) {
      setLastResult({ ok: false, skill: slug, message: e?.message ?? "Falha" });
    } finally {
      setBusySlug(null);
    }
  };

  const skillKeys = Object.keys(SKILL_PAYLOADS);
  const historyItems = (historyQuery.data?.items ?? historyQuery.data?.executions ?? []) as any[];

  return (
    <section className="space-y-4">
      {/* Header com status do Agente */}
      <Card className="border-quantum-purple/30 bg-gradient-to-br from-quantum-purple/10 to-slate-950/60">
        <CardContent className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="relative">
                <div className="rounded-full bg-quantum-purple/20 p-3">
                  <Cpu className="w-7 h-7 text-quantum-purple" />
                </div>
                {autoPilot && (
                  <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-slate-950 animate-pulse" />
                )}
              </div>
              <div>
                <Badge className="border border-quantum-purple/40 bg-quantum-purple/15 text-quantum-purple text-[10px] mb-1">
                  {autoPilot ? "🚀 MODO AUTÔNOMO ATIVO" : "⏸ MODO MANUAL"}
                </Badge>
                <h2 className="text-lg font-bold text-white">Seu Agente IA</h2>
                <p className="text-xs text-slate-400">
                  {totalHandlers} skills operacionais · runtime online
                </p>
              </div>
            </div>

            {/* Auto-pilot toggle */}
            <button
              onClick={toggleAutoPilot}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition ${
                autoPilot
                  ? "bg-gradient-to-r from-emerald-500 to-quantum-cyan text-slate-950"
                  : "bg-white/10 text-slate-300 hover:bg-white/20"
              }`}
            >
              {autoPilot ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {autoPilot ? "Desligar Auto-pilot" : "Ativar Auto-pilot"}
            </button>
          </div>

          {lastResult && (
            <div
              className={`mt-4 rounded-xl border p-3 text-sm ${
                lastResult.ok
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-100"
                  : "border-rose-500/40 bg-rose-500/10 text-rose-200"
              }`}
            >
              <div className="flex items-start gap-2">
                <div className="text-xl flex-shrink-0">
                  {lastResult.ok ? lastResult.emoji ?? "✅" : "❌"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold">
                    {lastResult.skill} · {lastResult.ok ? "OK" : "Falhou"}
                  </p>
                  <p className="text-xs opacity-90 break-words">{lastResult.message}</p>
                  {lastResult.executionId && (
                    <p className="text-[10px] font-mono opacity-60 mt-1">
                      id: {lastResult.executionId} · decision: {lastResult.decision} · {lastResult.latencyMs}ms
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Skills runners */}
      {variant === "full" && (
        <Card className="border-white/10 bg-slate-900/60">
          <CardContent className="p-5">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-quantum-cyan" />
              Execute uma skill agora
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {skillKeys.map((slug) => {
                const cfg = SKILL_PAYLOADS[slug];
                const busy = busySlug === slug;
                return (
                  <button
                    key={slug}
                    onClick={() => runSkill(slug)}
                    disabled={!!busySlug}
                    className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-left hover:border-quantum-cyan/40 disabled:opacity-50 disabled:cursor-not-allowed transition group"
                  >
                    <div className="text-2xl mb-2">{cfg.emoji}</div>
                    <div className="text-xs font-bold text-white group-hover:text-quantum-cyan transition">
                      {cfg.label.replace(cfg.emoji + " ", "")}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 mt-1">
                      {busy ? "⏳ executando…" : autoPilot ? "executar real" : "dry-run"}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Histórico de execuções */}
      {variant === "full" && historyItems.length > 0 && (
        <Card className="border-white/10 bg-slate-900/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-quantum-cyan" />
                Últimas execuções
              </h3>
              <button
                onClick={() => historyQuery.refetch?.()}
                className="text-slate-400 hover:text-white text-xs flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                atualizar
              </button>
            </div>
            <div className="space-y-2">
              {historyItems.slice(0, 8).map((h: any, i: number) => (
                <div
                  key={h.executionId ?? i}
                  className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/5 p-2"
                >
                  <div className="flex-shrink-0">
                    {h.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{h.skill}</p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      {h.decision} · {h.latencyMs}ms · {h.executionId?.slice(0, 8)}
                    </p>
                  </div>
                  <Badge
                    className={`text-[10px] ${
                      h.decision === "auto"
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                        : "border-amber-500/40 bg-amber-500/10 text-amber-300"
                    }`}
                  >
                    {h.decision}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
