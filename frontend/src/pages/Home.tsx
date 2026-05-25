import { Link } from "wouter";
import { Activity, ArrowRight, Cpu, Network, ShieldCheck, Sparkles, Zap } from "lucide-react";
import bgHome from "@/assets/bg-home.webp";

const NAV_LINKS = [
  { href: "#malha", label: "// MALHA_IA" },
  { href: "#protocolo", label: "// PROTOCOLO" },
  { href: "#mercado", label: "// MERCADO" },
];

const HERO_STATS = [
  { label: "Afiliados na malha", value: "15K+" },
  { label: "Comissões pagas", value: "R$ 2.5M" },
  { label: "Uptime núcleo IA", value: "98.5%" },
  { label: "Latência NanoBanana", value: "0.8ms" },
];

const FEATURES = [
  {
    icon: Cpu,
    title: "Núcleo Sentient IA",
    text: "Agente central calcula rotas MMN, otimiza comissões e cuida do compliance em tempo real.",
  },
  {
    icon: Network,
    title: "Cascata em 15 níveis",
    text: "Rede gravitacional auto-organizada que recompensa colmeias com maior volume P2P.",
  },
  {
    icon: ShieldCheck,
    title: "Trilha auditável",
    text: "Logs imutáveis, criptografia AES-256 e fluxo OAuth seguro para cada nó da rede.",
  },
  {
    icon: Sparkles,
    title: "Marketplace integrado",
    text: "Olist, Mercado Livre, Shopee e Amazon orquestrados por agentes especializados.",
  },
];

const STATUS_LINES = [
  { label: "Runtime", value: "ok", tone: "good" as const },
  { label: "Database", value: "ok", tone: "good" as const },
  { label: "Redis", value: "warming", tone: "warn" as const },
  { label: "Genkit Agentic", value: "online", tone: "good" as const },
];

export default function Home() {
  return (
    <div className="relative min-h-screen bg-obsidian text-foreground overflow-hidden font-sans antialiased selection:bg-quantum-cyan/30">
      {/* Hero image background com overlay para legibilidade */}
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-60"
        style={{ backgroundImage: `url(${bgHome})` }}
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-obsidian/70 via-obsidian/40 to-obsidian" aria-hidden="true" />

      {/* Malha isométrica */}
      <div className="pointer-events-none absolute inset-0 bg-grid-obsidian bg-grid-50 opacity-[0.12]" />

      {/* Aura quântica central */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-quantum-cyan via-quantum-purple to-quantum-violet opacity-[0.10] blur-[160px] animate-slow-pulse" />

      {/* Top nav */}
      <nav className="relative z-40 flex h-16 items-center justify-between border-b border-obsidian-700 bg-obsidian/80 px-6 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-quantum-cyan shadow-[0_0_12px_#00E5FF]">
            <span className="absolute inset-0 animate-ping rounded-full bg-quantum-cyan/60" />
          </span>
          <span className="font-bold tracking-wider text-sm text-white">
            NEXUS <span className="text-quantum-cyan">AFFIL'IA'TE</span>
          </span>
        </div>
        <div className="hidden gap-6 text-xs font-mono text-slate-400 md:flex">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="transition-colors hover:text-white">
              {link.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded border border-obsidian-700 bg-obsidian-700/30 px-3 py-1.5 text-[11px] font-mono uppercase tracking-widest text-slate-300 transition hover:border-quantum-cyan/40 hover:text-quantum-cyan sm:inline-flex"
          >
            Login
          </Link>
          <Link
            href="/cadastro"
            className="inline-flex items-center gap-2 rounded border border-quantum-cyan/40 bg-quantum-cyan/10 px-3 py-1.5 text-[11px] font-mono uppercase tracking-widest text-quantum-cyan transition hover:bg-quantum-cyan/20"
          >
            Cadastrar <ArrowRight size={12} />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-6 pb-24 pt-20 text-center">
        <div className="mb-8 inline-flex animate-fade-in items-center gap-2 rounded border border-obsidian-700 bg-obsidian-700/40 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-slate-400 backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-quantum-cyan shadow-[0_0_8px_#00E5FF]" />
          SISTEMA CORE: 100% OPERACIONAL
        </div>

        <h1 className="font-sans text-5xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl md:text-7xl">
          Nexus{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-quantum-cyan to-quantum-purple">
            Affil'IA'te
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
          A Inteligência Central que ramifica o futuro. Marketing multinível reinventado por agentes
          autônomos, comissões em cascata e marketplaces integrados.
        </p>
        <p className="mt-3 font-mono text-xs uppercase tracking-[0.35em] text-white/60">
          Conecte · Automatize · Lucre
        </p>

        {/* CTAs */}
        <div className="mt-10 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center">
          <Link
            href="/cadastro"
            className="inline-flex items-center justify-center gap-2 rounded border border-quantum-cyan/40 bg-gradient-to-r from-quantum-cyan to-quantum-cyan2 px-7 py-3 text-sm font-bold text-obsidian shadow-quantum transition-all hover:-translate-y-0.5 hover:shadow-quantum-strong"
          >
            <Zap size={16} /> Ativar Meu Agente
          </Link>
          <Link
            href="/login?mode=affiliate"
            className="inline-flex items-center justify-center gap-2 rounded border border-obsidian-700 bg-obsidian-700/40 px-7 py-3 text-xs font-mono uppercase tracking-widest text-slate-300 backdrop-blur-md transition hover:border-quantum-cyan/40 hover:bg-obsidian-700/60 hover:text-white"
          >
            Backoffice Usuário
          </Link>
          <Link
            href="/login?mode=admin"
            className="inline-flex items-center justify-center gap-2 rounded border border-quantum-purple/40 bg-quantum-purple/10 px-7 py-3 text-xs font-mono uppercase tracking-widest text-quantum-purple backdrop-blur-md transition hover:border-quantum-purple/70 hover:bg-quantum-purple/20"
          >
            Backoffice Admin
          </Link>
        </div>

        {/* Hero stats */}
        <div className="mt-16 grid w-full max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4">
          {HERO_STATS.map((stat) => (
            <div
              key={stat.label}
              className="rounded border border-obsidian-700 bg-obsidian-800/40 px-4 py-3 text-left backdrop-blur"
            >
              <p className="font-sans text-2xl font-bold text-white">{stat.value}</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-slate-500">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section
        id="malha"
        className="relative z-10 border-t border-obsidian-700 bg-obsidian/60 px-6 py-20 backdrop-blur"
      >
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.45em] text-quantum-cyan">
            // CAMADAS_DO_PROTOCOLO
          </p>
          <h2 className="mt-3 max-w-3xl font-sans text-3xl font-bold text-white sm:text-4xl">
            Quatro motores autônomos compõem a malha
            <span className="text-quantum-cyan"> Affil'IA'te</span>.
          </h2>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="group relative overflow-hidden rounded-lg border border-obsidian-700 bg-obsidian-800/40 p-5 backdrop-blur transition-all hover:-translate-y-1 hover:border-quantum-cyan/40 hover:shadow-quantum"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-md border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">
                  <Icon size={18} />
                </div>
                <h3 className="font-sans text-base font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{text}</p>
                <div className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-quantum-cyan/10 opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Status widget + footer */}
      <section
        id="protocolo"
        className="relative z-10 border-t border-obsidian-700 px-6 py-16"
      >
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-lg border border-obsidian-700 bg-obsidian-800/40 p-6 backdrop-blur">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-quantum-cyan">
                // LIVE_NETWORK_STREAM
              </p>
              <span className="inline-flex items-center gap-2 rounded border border-quantum-cyan/30 bg-quantum-cyan/10 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-quantum-cyan">
                <Activity size={10} /> Realtime
              </span>
            </div>
            <p className="mt-3 text-base text-white">
              Sentient AI Core Sphere calculando rotas MMN entre 15K+ nós.
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Latência da camada NanoBanana:{" "}
              <span className="text-quantum-lime">0.8ms</span> · Throughput médio{" "}
              <span className="text-white">4.2k req/min</span>.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {STATUS_LINES.map((line) => (
                <div
                  key={line.label}
                  className="flex items-center justify-between rounded border border-obsidian-700 bg-obsidian-900/60 px-3 py-2"
                >
                  <span className="font-mono text-[11px] uppercase tracking-widest text-slate-500">
                    {line.label}
                  </span>
                  <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        line.tone === "good"
                          ? "bg-quantum-lime shadow-[0_0_8px_#7CFFB2]"
                          : "bg-amber-400 shadow-[0_0_8px_#FBBF24]"
                      }`}
                    />
                    <span
                      className={line.tone === "good" ? "text-quantum-lime" : "text-amber-300"}
                    >
                      {line.value}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-lg border border-obsidian-700 bg-gradient-to-br from-quantum-cyan/5 via-obsidian-800 to-quantum-purple/10 p-6 backdrop-blur">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-quantum-purple">
                // PRONTO PARA ESCALAR
              </p>
              <h3 className="mt-3 font-sans text-xl font-semibold text-white">
                Configure sua colmeia em menos de 3 minutos.
              </h3>
              <p className="mt-2 text-sm text-slate-400">
                Cadastro guiado, agente IA inicial gratuito e marketplaces conectados em 1 clique.
              </p>
            </div>
            <Link
              href="/cadastro"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded border border-quantum-cyan/40 bg-gradient-to-r from-quantum-cyan to-quantum-purple px-5 py-3 text-sm font-bold text-obsidian shadow-quantum transition-all hover:-translate-y-0.5 hover:shadow-quantum-strong"
            >
              Começar agora <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-12 flex max-w-6xl flex-col items-center justify-between gap-3 border-t border-obsidian-700 pt-6 text-xs text-slate-500 sm:flex-row">
          <span className="font-mono uppercase tracking-widest">
            © {new Date().getFullYear()} Nexus Affil'IA'te · Obsidian Build
          </span>
          <span className="font-mono uppercase tracking-widest">v1.2.5 · oneverso.com.br</span>
        </div>
      </section>
    </div>
  );
}
