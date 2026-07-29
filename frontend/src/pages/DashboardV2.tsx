import { useMemo } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Bell,
  BookOpen,
  Clock,
  Copy,
  ExternalLink,
  Info,
  Layers,
  Play,
  Package,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  Trophy,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import DashboardShell from "@/components/dashboard-v2/DashboardShell";
import StatCard from "@/components/dashboard-v2/StatCard";
import QuickAction from "@/components/dashboard-v2/QuickAction";
import TrailProgress, {
  TrailModule,
} from "@/components/dashboard-v2/TrailProgress";
import { cn } from "@/lib/utils";

const ACADEMIA_MODULES: TrailModule[] = [
  {
    code: "00",
    title: "Boas-vindas à AcademIA Nexus",
    serie: "Fundamentos",
    duration: "4:22",
    videoId: "vpz_rwGzE6E",
    status: "concluido",
  },
  {
    code: "01",
    title: "Entendendo o IOAID",
    serie: "Fundamentos",
    duration: "1:59",
    videoId: "x4zJBYBCC10",
    status: "em-andamento",
  },
  {
    code: "02",
    title: "O Sistema SHO — Self-Healing Orchestrator",
    serie: "Fundamentos",
    duration: "2:04",
    videoId: "sn3WZ46omPE",
    status: "novo",
  },
  {
    code: "03",
    title: "Painel do Afiliado — Visão Geral da Operação",
    serie: "Fundamentos",
    duration: "2:11",
    videoId: "Ziknd9M7S9w",
    status: "novo",
  },
  {
    code: "04",
    title: "Construindo Seu Primeiro Agente em 4 Minutos",
    serie: "Agentes",
    duration: "2:16",
    videoId: "CUzPgdPnNY0",
    status: "novo",
  },
  {
    code: "05",
    title: "Skills Essenciais — Copywriter + Audience-Segmenter",
    serie: "Agentes",
    duration: "2:11",
    videoId: "hgJ__VRgtb8",
    status: "novo",
  },
  {
    code: "06",
    title: "Disparando no WhatsApp em Escala",
    serie: "Agentes",
    duration: "2:05",
    videoId: "raXrkOUGRrU",
    status: "novo",
  },
  {
    code: "07",
    title: "Judge Revisor — A IA que Decide por Você",
    serie: "Agentes",
    duration: "2:47",
    videoId: "8wxm0_YMp7M",
    status: "novo",
  },
  {
    code: "08",
    title: "Otimização de Conversão — A Matemática da Receita",
    serie: "Master",
    duration: "2:06",
    videoId: "3I7XobuuhgQ",
    status: "novo",
  },
  {
    code: "09",
    title: "Funis e Lifecycle — O Sistema Completo",
    serie: "Master",
    duration: "1:58",
    videoId: "kGvcB8rnoBQ",
    status: "novo",
  },
  {
    code: "10",
    title: "A/B Testing com Judge — Ciência da Experimentação",
    serie: "Master",
    duration: "2:02",
    videoId: "7nQszzJa8Hg",
    status: "novo",
  },
  {
    code: "11",
    title: "Análise de Coortes e Churn — A Arte de Reter",
    serie: "Master",
    duration: "1:58",
    videoId: "Kvizdxejd1U",
    status: "novo",
  },
  {
    code: "12",
    title: "Blueprints Elite — O Jogo do Top 10%",
    serie: "Elite",
    duration: "2:00",
    videoId: "mft4VP-bWVw",
    status: "novo",
  },
  {
    code: "13",
    title: "Multi-Tenant e White-Label na Prática",
    serie: "Elite",
    duration: "1:59",
    videoId: "yC11nj3UHC4",
    status: "novo",
  },
  {
    code: "14",
    title: "Federação de Agentes Zero-Trust",
    serie: "Elite",
    duration: "1:59",
    videoId: "gTrcWs5QreY",
    status: "novo",
  },
];

type LiveEvent = {
  when: string;
  label: string;
  meta: string;
  tone: "cyan" | "emerald" | "amber" | "rose";
};

const LIVE_EVENTS: LiveEvent[] = [
  {
    when: "agora",
    label: "Judge Revisor aprovou disparo em escala",
    meta: "800 mensagens em 14 s",
    tone: "emerald",
  },
  {
    when: "há 12 min",
    label: "Nova venda registrada · Pack A²",
    meta: "R$ 1.470 · comissão 30%",
    tone: "cyan",
  },
  {
    when: "há 34 min",
    label: "Agente Copywriter escalou 3× volume",
    meta: "SLA 1,8 s · 0 falhas",
    tone: "cyan",
  },
  {
    when: "há 1 h",
    label: "Alerta SHO · alta latência transitória",
    meta: "Auto-cura em 42 s",
    tone: "amber",
  },
];

function formatCurrency(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function DashboardV2() {
  const { user } = useAuth();
  const displayName = user?.name?.split(" ")[0] || "Afiliado";
  const affiliateCode = (user?.id ? `NX-${user.id}`.toUpperCase() : "NX-DEMO").slice(0, 16);

  const trailProgress = useMemo(() => {
    const done = ACADEMIA_MODULES.filter((m) => m.status === "concluido").length;
    const total = ACADEMIA_MODULES.length;
    return { done, total, pct: Math.round((done / total) * 100) };
  }, []);

  const copyReferral = async () => {
    try {
      const url = `${window.location.origin}/afiliado/${affiliateCode}`;
      await navigator.clipboard.writeText(url);
      toast.success("Link de afiliado copiado", { description: url });
    } catch {
      toast.error("Não foi possível copiar o link");
    }
  };

  return (
    <DashboardShell
      title={`Olá, ${displayName}`}
      subtitle="Sua operação Nexus em uma única visão · comissões, agentes ativos e sua trilha AcademIA."
      breadcrumbs={[{ label: "Nexus" }, { label: "Dashboard" }]}
      actions={
        <button
          type="button"
          onClick={copyReferral}
          className="hidden items-center gap-2 rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-3 py-1.5 text-sm font-medium text-cyan-100 transition hover:border-cyan-400/60 hover:bg-cyan-500/20 md:inline-flex"
        >
          <Copy className="h-4 w-4" />
          Copiar link de afiliado
        </button>
      }
    >
      {/* Hero / banner com resumo executivo */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-6 md:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cyan-300">
              // NEXUS AFFIL'IA'TE · OPERAÇÃO AO VIVO
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white md:text-3xl">
              Sua operação está{" "}
              <span className="bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent">
                saudável
              </span>{" "}
              e pronta para escalar.
            </h2>
            <p className="mt-2 text-sm text-slate-300 md:text-base">
              Judge ativo, SHO monitorando, {ACADEMIA_MODULES.length} módulos da AcademIA disponíveis
              e {trailProgress.done} concluído. Continue de onde parou.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/dashboard-v2#trilha"
                className="inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                <Play className="h-4 w-4" />
                Continuar trilha AcademIA
              </Link>
              <Link
                href="/agents"
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-cyan-400/40 hover:bg-white/10"
              >
                <Bot className="h-4 w-4" />
                Ver meus agentes
              </Link>
            </div>
          </div>
          <div className="grid w-full max-w-xs shrink-0 gap-3">
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-300">
                Progresso AcademIA
              </p>
              <div className="mt-2 flex items-end justify-between gap-2">
                <p className="text-3xl font-semibold text-white">{trailProgress.pct}%</p>
                <p className="pb-1 text-xs text-slate-400">
                  {trailProgress.done}/{trailProgress.total} módulos
                </p>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all"
                  style={{ width: `${trailProgress.pct}%` }}
                />
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-400">
                Código de afiliado
              </p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <p className="truncate font-mono text-sm text-white">{affiliateCode}</p>
                <button
                  type="button"
                  onClick={copyReferral}
                  className="rounded-md p-1.5 text-slate-300 transition hover:bg-white/10 hover:text-white"
                  aria-label="Copiar código"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stat cards principais */}
      <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Comissões · mês"
          value={formatCurrency(184730)}
          hint="Consolidado em D+1"
          icon={Wallet}
          delta={{ value: "+18,4%", direction: "up", label: "vs mês anterior" }}
          accent="emerald"
        />
        <StatCard
          label="Vendas · mês"
          value="47"
          hint="Ticket médio R$ 892"
          icon={ShoppingCart}
          delta={{ value: "+9", direction: "up", label: "vs meta" }}
          accent="cyan"
        />
        <StatCard
          label="Rede ativa"
          value="312"
          hint="Nível 1–5 · 42 novos"
          icon={Users}
          delta={{ value: "+14%", direction: "up", label: "30 dias" }}
          accent="violet"
        />
        <StatCard
          label="Agentes rodando"
          value="6/8"
          hint="SLA 99,7% · 0 falhas"
          icon={Bot}
          delta={{ value: "estável", direction: "neutral" }}
          accent="amber"
        />
      </section>

      {/* Ações rápidas */}
      <section className="mt-6">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-400">
              Ações rápidas
            </p>
            <h3 className="text-lg font-semibold text-white">O que você quer fazer agora?</h3>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickAction
            label="Novo disparo"
            description="WhatsApp em escala"
            href="/agents"
            icon={Zap}
            accent="cyan"
          />
          <QuickAction
            label="Criar agente"
            description="Copywriter ou Segmenter"
            href="/agents"
            icon={Bot}
            accent="violet"
          />
          <QuickAction
            label="Marketplace"
            description="Skills e e-books"
            href="/marketplaces"
            icon={ShoppingCart}
            accent="amber"
          />
          <QuickAction
            label="Convidar rede"
            description="Copiar link e enviar"
            href="/network"
            icon={Users}
            accent="emerald"
          />
        </div>
      </section>

      {/* Duas colunas — trilha AcademIA + operação ao vivo */}
      <section id="trilha" className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TrailProgress modules={ACADEMIA_MODULES} />
        </div>
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-400">
                  Operação ao vivo
                </p>
                <h3 className="mt-1 text-lg font-semibold text-white">Últimos eventos</h3>
              </div>
              <Bell className="h-4 w-4 text-slate-400" />
            </div>
            <ul className="mt-4 space-y-3">
              {LIVE_EVENTS.map((event, idx) => (
                <li
                  key={idx}
                  className="flex gap-3 rounded-xl border border-white/5 bg-slate-950/40 p-3"
                >
                  <span
                    className={cn(
                      "mt-1 inline-block h-2 w-2 shrink-0 rounded-full",
                      event.tone === "emerald" && "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]",
                      event.tone === "cyan" && "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.7)]",
                      event.tone === "amber" && "bg-amber-400 shadow-[0_0_8px_rgba(250,204,21,0.7)]",
                      event.tone === "rose" && "bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.7)]"
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white">{event.label}</p>
                    <p className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-400">
                      <Clock className="h-3 w-3" />
                      {event.when}
                      <span className="text-slate-600">·</span>
                      <span>{event.meta}</span>
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <Link
              href="/orchestrator"
              className="mt-4 inline-flex items-center gap-2 text-sm text-cyan-300 transition hover:text-cyan-200"
            >
              Ver orquestrador completo <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-cyan-300" />
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-300">
                Sugestão da IA
              </p>
            </div>
            <p className="mt-2 text-sm text-slate-200">
              Você concluiu o módulo 00. O ganho médio de afiliados que finalizam
              os módulos <span className="font-semibold text-white">01 → 03</span> é <span className="font-semibold text-emerald-300">+32%</span> em
              comissões nos primeiros 30 dias.
            </p>
            <Link
              href={`https://www.youtube.com/watch?v=${ACADEMIA_MODULES[1].videoId}`}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-3 py-1.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              <Play className="h-4 w-4" />
              Continuar do módulo 01
            </Link>
          </div>
        </div>
      </section>

      {/* Rodapé com atalhos */}
      <section className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/commissions"
          className="group flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition hover:border-cyan-400/30"
        >
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-400">
              Financeiro
            </p>
            <p className="mt-1 text-sm font-semibold text-white">Comissões e extratos</p>
          </div>
          <BarChart3 className="h-5 w-5 text-cyan-300 transition group-hover:translate-x-1" />
        </Link>
        <Link
          href="/career"
          className="group flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition hover:border-violet-400/30"
        >
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-400">
              Carreira
            </p>
            <p className="mt-1 text-sm font-semibold text-white">Progressão e níveis</p>
          </div>
          <Trophy className="h-5 w-5 text-violet-300 transition group-hover:translate-x-1" />
        </Link>
        <Link
          href="/packs"
          className="group flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition hover:border-amber-400/30"
        >
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-400">
              Packs
            </p>
            <p className="mt-1 text-sm font-semibold text-white">Ativação e upgrades</p>
          </div>
          <Package className="h-5 w-5 text-amber-300 transition group-hover:translate-x-1" />
        </Link>
        <a
          href="https://www.youtube.com/@NexusAffilIAte-w9p"
          target="_blank"
          rel="noreferrer"
          className="group flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition hover:border-emerald-400/30"
        >
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-400">
              Canal oficial
            </p>
            <p className="mt-1 text-sm font-semibold text-white">Nexus Affil'IA'te no YouTube</p>
          </div>
          <ExternalLink className="h-5 w-5 text-emerald-300 transition group-hover:translate-x-1" />
        </a>
      </section>
    </DashboardShell>
  );
}
