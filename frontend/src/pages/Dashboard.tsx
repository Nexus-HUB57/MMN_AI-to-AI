import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "./DashboardLayout";
import bgUser from "@/assets/bg-user.webp";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bot,
  Calendar,
  ChevronRight,
  Gift,
  Globe,
  ShoppingCart,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Wallet,
  Zap,
} from "lucide-react";

const QUICK_ACTIONS = [
  {
    href: "/agents",
    label: "Agente IA",
    description: "Configurar e treinar agentes",
    icon: Bot,
    accent: "from-quantum-cyan/40 to-quantum-purple/40",
  },
  {
    href: "/marketplaces",
    label: "Marketplaces",
    description: "Olist, ML, Shopee, Amazon",
    icon: ShoppingCart,
    accent: "from-quantum-cyan/30 to-quantum-cyan/0",
  },
  {
    href: "/commissions",
    label: "Comissões",
    description: "Histórico em cascata 15 níveis",
    icon: TrendingUp,
    accent: "from-quantum-lime/30 to-quantum-cyan/0",
  },
  {
    href: "/content/calendar",
    label: "Calendário Social",
    description: "Posts programados pelo Genkit",
    icon: Calendar,
    accent: "from-quantum-purple/30 to-quantum-cyan/0",
  },
  {
    href: "/marketing/materials",
    label: "Materiais",
    description: "Banners, e-books e copies",
    icon: BarChart3,
    accent: "from-quantum-cyan/30 to-quantum-purple/20",
  },
  {
    href: "/upgrades",
    label: "Upgrades",
    description: "Skills extras para seu agente",
    icon: Sparkles,
    accent: "from-quantum-purple/30 to-quantum-cyan/0",
  },
];

const RECENT_ACTIVITY = [
  {
    title: "Comissão de R$ 150,00",
    detail: "Recebida no nível 2 da malha",
    time: "há 5 min",
    icon: TrendingUp,
    tone: "good" as const,
  },
  {
    title: "Maria S. entrou na sua rede",
    detail: "Indicação direta via mini-site",
    time: "há 28 min",
    icon: Users,
    tone: "info" as const,
  },
  {
    title: "Bônus de carreira liberado",
    detail: "Você atingiu o nível Ouro",
    time: "há 2h",
    icon: Star,
    tone: "warn" as const,
  },
  {
    title: "Venda confirmada no marketplace",
    detail: "Pedido #1284 · R$ 89,90",
    time: "há 6h",
    icon: ShoppingCart,
    tone: "good" as const,
  },
];

const SYSTEM_STATUS = [
  { label: "API tRPC", value: "online", tone: "good" as const },
  { label: "Database", value: "ok", tone: "good" as const },
  { label: "Redis cache", value: "warming", tone: "warn" as const },
  { label: "Modo", value: "produção", tone: "info" as const },
];

function toneClasses(tone: "good" | "warn" | "info") {
  if (tone === "good") return "text-quantum-lime";
  if (tone === "warn") return "text-amber-300";
  return "text-quantum-cyan";
}

function toneDot(tone: "good" | "warn" | "info") {
  if (tone === "good") return "bg-quantum-lime shadow-[0_0_8px_#7CFFB2]";
  if (tone === "warn") return "bg-amber-400 shadow-[0_0_8px_#FBBF24]";
  return "bg-quantum-cyan shadow-[0_0_8px_#00E5FF]";
}

export default function Dashboard() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0.0412);
  const [isCollecting, setIsCollecting] = useState(false);

  const displayName = user?.name || "Usuário MMN";
  const displayEmail = user?.email || "usuario@demo.mmn.ai";
  const displayRole = user?.role === "admin" ? "Administrador" : "Afiliado";

  const handleHarvest = () => {
    setIsCollecting(true);
    setTimeout(() => {
      setBalance((prev) => prev + 0.0035);
      setIsCollecting(false);
    }, 1200);
  };

  return (
    <DashboardLayout>
      <div className="relative space-y-8 font-sans antialiased">
        {/* Background atmosférico fixo do backoffice usuário */}
        <div
          className="pointer-events-none fixed inset-0 -z-10 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${bgUser})` }}
          aria-hidden="true"
        />
        <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-obsidian/85 via-obsidian/70 to-obsidian" aria-hidden="true" />
        {/* Sub-header técnico */}
        <header className="flex flex-col gap-4 border-b border-obsidian-700 pb-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-quantum-cyan">
              // PEER_SESSION_ACTIVE
            </p>
            <h1 className="mt-2 font-sans text-2xl font-bold tracking-tight text-white">
              Bem-vindo de volta,{" "}
              <span className="text-quantum-cyan">{displayName.split(" ")[0]}</span>
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              {displayEmail} · {displayRole} · NEXUS_NODE // CONEXÃO_ESTÁVEL
            </p>
          </div>
          <div className="flex flex-col items-stretch gap-2 sm:flex-row">
            <button
              onClick={handleHarvest}
              disabled={isCollecting}
              className={`inline-flex items-center justify-center gap-2 rounded border px-4 py-2 font-mono text-[11px] uppercase tracking-widest transition-all ${
                isCollecting
                  ? "animate-pulse border-amber-400/60 bg-amber-400/10 text-amber-300"
                  : "border-quantum-cyan/40 bg-quantum-cyan/10 text-quantum-cyan hover:bg-quantum-cyan/20"
              }`}
            >
              <Zap size={14} />
              {isCollecting ? "Sincronizando nós…" : "Colher ganhos dos agentes"}
            </button>
            <Link
              href="/agents"
              className="inline-flex items-center justify-center gap-2 rounded border border-quantum-purple/40 bg-quantum-purple/10 px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-quantum-purple transition hover:bg-quantum-purple/20"
            >
              <Bot size={14} /> Painel do Agente
            </Link>
          </div>
        </header>

        {/* KPIs principais */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-obsidian-700 bg-obsidian-800/40 p-5 backdrop-blur transition hover:border-quantum-cyan/40 hover:shadow-quantum">
            <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
              // Saldo Alocado (IA Core)
            </p>
            <p className="mt-3 font-sans text-3xl font-bold text-white">
              {balance.toFixed(4)} <span className="text-sm text-quantum-cyan">BTC</span>
            </p>
            <p className="mt-2 text-xs text-slate-400">~ R$ 1.250,00 disponíveis</p>
          </div>

          <div className="rounded-lg border border-obsidian-700 bg-obsidian-800/40 p-5 backdrop-blur transition hover:border-quantum-cyan/40 hover:shadow-quantum">
            <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
              // Comissões do Mês
            </p>
            <p className="mt-3 font-sans text-3xl font-bold text-white">R$ 3.450,00</p>
            <p className="mt-2 inline-flex items-center gap-1 text-xs text-quantum-lime">
              <TrendingUp size={12} /> +18% vs. mês passado
            </p>
          </div>

          <div className="rounded-lg border border-obsidian-700 bg-obsidian-800/40 p-5 backdrop-blur transition hover:border-quantum-cyan/40 hover:shadow-quantum">
            <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
              // Sub-IAs na minha colmeia
            </p>
            <p className="mt-3 font-sans text-3xl font-bold text-white">
              147 <span className="text-sm text-quantum-purple">Nodes</span>
            </p>
            <p className="mt-2 text-xs text-slate-400">12 ativos nas últimas 24h</p>
          </div>

          <div className="rounded-lg border border-obsidian-700 bg-obsidian-800/40 p-5 backdrop-blur transition hover:border-quantum-cyan/40 hover:shadow-quantum">
            <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
              // Rendimento médio P2P
            </p>
            <p className="mt-3 font-sans text-3xl font-bold text-quantum-lime">+12.4%</p>
            <p className="mt-2 text-xs text-slate-400">média 24h da malha</p>
          </div>
        </section>

        {/* Grafo + Quick actions */}
        <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          {/* Painel grafo */}
          <div className="relative min-h-[320px] overflow-hidden rounded-lg border border-obsidian-700 bg-obsidian-800/30 p-6 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-quantum-cyan">
                // FILTRO_GRAFO: AFILIADOS_MAGNETIC_FORCE
              </p>
              <span className="inline-flex items-center gap-2 rounded border border-quantum-cyan/30 bg-quantum-cyan/5 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-quantum-cyan">
                <Activity size={10} /> Realtime
              </span>
            </div>

            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="relative flex h-56 w-56 items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-obsidian-700" />
                <div className="absolute inset-6 rounded-full border border-quantum-cyan/30 animate-slow-pulse" />
                <div className="absolute inset-14 rounded-full border border-quantum-purple/20" />
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-quantum-cyan to-quantum-purple shadow-[0_0_20px_rgba(0,229,255,0.6)]" />
                {/* Nós orbitando */}
                <span className="absolute h-2.5 w-2.5 rounded-full bg-quantum-cyan shadow-[0_0_10px_#00E5FF] animate-orbit" />
                <span
                  className="absolute h-2 w-2 rounded-full bg-quantum-purple shadow-[0_0_10px_#8B5CF6] animate-orbit"
                  style={{ animationDelay: "-4s", animationDuration: "10s" }}
                />
                <span
                  className="absolute h-1.5 w-1.5 rounded-full bg-quantum-lime shadow-[0_0_10px_#7CFFB2] animate-orbit"
                  style={{ animationDelay: "-8s", animationDuration: "16s" }}
                />
              </div>
            </div>

            <div className="absolute bottom-4 left-4 right-4 rounded border border-obsidian-700 bg-obsidian-900/80 p-3 text-[11px] text-slate-400 backdrop-blur">
              <span className="font-mono uppercase tracking-widest text-quantum-cyan">
                Algoritmo gravitacional ativo
              </span>
              <p className="mt-1 leading-relaxed">
                Os nós se auto-organizam conforme o volume de transações recebidas na malha MMN. Mais
                tração em uma colmeia atrai novos sub-agentes automaticamente.
              </p>
            </div>
          </div>

          {/* System status */}
          <div className="rounded-lg border border-obsidian-700 bg-obsidian-800/40 p-6 backdrop-blur">
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-quantum-cyan">
              // STATUS_DA_INFRA
            </p>
            <h3 className="mt-2 font-sans text-lg font-semibold text-white">Saúde do sistema</h3>
            <p className="mt-1 text-xs text-slate-400">
              Monitoramento em tempo real do bootstrap MMN AI-to-AI.
            </p>

            <div className="mt-5 space-y-2">
              {SYSTEM_STATUS.map((line) => (
                <div
                  key={line.label}
                  className="flex items-center justify-between rounded border border-obsidian-700 bg-obsidian-900/40 px-3 py-2"
                >
                  <span className="font-mono text-[11px] uppercase tracking-widest text-slate-500">
                    {line.label}
                  </span>
                  <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest">
                    <span className={`h-2 w-2 rounded-full ${toneDot(line.tone)}`} />
                    <span className={toneClasses(line.tone)}>{line.value}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quick actions */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-quantum-cyan">
                // ATALHOS
              </p>
              <h2 className="mt-1 text-lg font-semibold text-white">Ações rápidas</h2>
            </div>
            <Link
              href="/utilities"
              className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-widest text-slate-400 hover:text-quantum-cyan"
            >
              ver todas <ChevronRight size={12} />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {QUICK_ACTIONS.map(({ href, label, description, icon: Icon, accent }) => (
              <Link
                key={href}
                href={href}
                className="group relative overflow-hidden rounded-lg border border-obsidian-700 bg-obsidian-800/40 p-5 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-quantum-cyan/40 hover:shadow-quantum"
              >
                <div
                  className={`pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-gradient-to-br ${accent} opacity-0 blur-2xl transition-opacity group-hover:opacity-100`}
                />
                <div className="flex items-center justify-between">
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">
                    <Icon size={16} />
                  </div>
                  <ArrowRight
                    size={14}
                    className="text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-quantum-cyan"
                  />
                </div>
                <p className="mt-4 font-sans text-sm font-semibold text-white">{label}</p>
                <p className="mt-1 text-xs text-slate-400">{description}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent activity */}
        <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-lg border border-obsidian-700 bg-obsidian-800/40 p-6 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-quantum-cyan">
                  // STREAM_DE_EVENTOS
                </p>
                <h3 className="mt-1 text-lg font-semibold text-white">Atividade recente</h3>
              </div>
              <span className="inline-flex items-center gap-2 rounded border border-quantum-cyan/30 bg-quantum-cyan/10 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-quantum-cyan">
                <Activity size={10} /> live
              </span>
            </div>

            <ul className="mt-5 space-y-3">
              {RECENT_ACTIVITY.map(({ title, detail, time, icon: Icon, tone }) => (
                <li
                  key={title}
                  className="flex items-start gap-3 rounded border border-obsidian-700 bg-obsidian-900/40 p-3"
                >
                  <span
                    className={`mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-md border ${
                      tone === "good"
                        ? "border-quantum-lime/30 bg-quantum-lime/10 text-quantum-lime"
                        : tone === "warn"
                          ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
                          : "border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan"
                    }`}
                  >
                    <Icon size={14} />
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{title}</p>
                    <p className="text-xs text-slate-400">{detail}</p>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                    {time}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col justify-between rounded-lg border border-obsidian-700 bg-gradient-to-br from-quantum-cyan/5 via-obsidian-800 to-quantum-purple/10 p-6 backdrop-blur">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-quantum-purple">
                // RECOMPENSAS
              </p>
              <h3 className="mt-2 font-sans text-xl font-semibold text-white">
                Você está a 1 nível do bônus Diamante.
              </h3>
              <p className="mt-2 text-sm text-slate-400">
                Adicione mais 3 indicados diretos para liberar uma comissão extra de 5% sobre toda a
                sua malha.
              </p>
            </div>
            <Link
              href="/bonus"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded border border-quantum-cyan/40 bg-gradient-to-r from-quantum-cyan to-quantum-purple px-4 py-2.5 text-sm font-bold text-obsidian shadow-quantum transition-all hover:-translate-y-0.5 hover:shadow-quantum-strong"
            >
              <Gift size={14} /> Ver recompensas
            </Link>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
