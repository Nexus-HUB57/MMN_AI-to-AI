import { useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";

/**
 * AgentsSync — Painel Sincronização IA · D13
 * Gráficos futurísticos (radar/orbital), Obsidian (AGN+) e Nexus Live (AO+)
 */
export default function AgentsSync() {
  const status = (trpc as any).dashboardStatus?.getStatus?.useQuery?.(undefined, {
    refetchInterval: 30_000, retry: false,
  });
  const inventory = (trpc as any).affiliateStore?.myInventory?.useQuery?.(undefined, { retry: false });
  const level = (status?.data?.affiliateLevel || "Afiliado I") as string;
  const norm = level.toUpperCase();
  const isAGN = /AGN|GENERATIVO/.test(norm);
  const isAO  = /AO|ORQUESTRAD/.test(norm);
  const packsCount = inventory?.data?.activePacks?.length || 0;
  const skillsCount = inventory?.data?.totalLibraryCount || 0;

  // métricas simuladas baseadas em dados reais
  const reactions = useMemo(() => {
    return [
      { label: "Ações", value: Math.max(8, skillsCount * 2), color: "#22d3ee" },
      { label: "Reações", value: Math.max(5, packsCount * 3), color: "#a78bfa" },
      { label: "Eventos", value: Math.max(3, packsCount + skillsCount), color: "#f59e0b" },
      { label: "Skills Ativas", value: skillsCount, color: "#10b981" },
    ];
  }, [packsCount, skillsCount]);

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-8 ux-page-mount">
        {/* HERO */}
        <section className="ux-glass-strong rounded-[32px] border border-quantum-cyan/30 p-6 md:p-8">
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">
              Sincronização do Agente · Live
            </Badge>
            <Badge className="border border-white/10 bg-white/5 text-slate-200">
              {level}
            </Badge>
            {isAGN && (
              <Badge className="border border-purple-400/40 bg-purple-400/15 text-purple-200">
                ⬢ Obsidian habilitado
              </Badge>
            )}
            {isAO && (
              <Badge className="border border-emerald-400/40 bg-emerald-400/15 text-emerald-200">
                🎙 Nexus Live (J.A.R.V.I.S) ativo
              </Badge>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight ux-gradient-text">
            Central de Sincronização Agêntica
          </h1>
          <p className="mt-3 max-w-3xl text-slate-300 leading-7">
            Telemetria futurística do seu Agente IA. Visualize sincronizações ativas,
            ações executadas e reações em tempo real do ecossistema OneVerso.
          </p>
        </section>

        {/* RADAR + REACTIONS */}
        <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <div className="ux-glass ux-lift rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-cyan-300 text-sm font-semibold tracking-wide">
                🛰 Radar de Sincronização
              </h3>
              <span className="text-[10px] uppercase tracking-widest text-slate-500 ux-pulse-soft">
                tempo real
              </span>
            </div>
            <RadarChart packs={packsCount} skills={skillsCount} />
          </div>
          <div className="ux-glass ux-lift rounded-2xl p-5">
            <h3 className="text-purple-300 text-sm font-semibold tracking-wide mb-4">
              📈 Ações & Reações
            </h3>
            <div className="space-y-2">
              {reactions.map((r) => (
                <ReactionBar key={r.label} {...r} max={Math.max(...reactions.map((x) => x.value), 20)} />
              ))}
            </div>
          </div>
        </section>

        {/* ORBITAL */}
        <section className="ux-glass ux-lift rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-amber-300 text-sm font-semibold tracking-wide">
              🌌 Órbita Agêntica
            </h3>
            <span className="text-[10px] uppercase tracking-widest text-slate-500">
              Skills · Packs · Modelos
            </span>
          </div>
          <OrbitalView packs={packsCount} skills={skillsCount} />
        </section>

        {/* OBSIDIAN — só AGN+ */}
        {isAGN ? (
          <section className="ux-glass-strong rounded-2xl border border-purple-400/30 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl ux-bounce-soft">⬢</span>
                <div>
                  <h3 className="text-purple-300 font-semibold text-lg">
                    Obsidian · Orquestração Avançada
                  </h3>
                  <p className="text-xs text-slate-400">
                    Sistema multi-agente para Agentes Generativos
                  </p>
                </div>
              </div>
              <a
                href="https://github.com/obsidianmd/obsidian-releases"
                target="_blank"
                rel="noopener noreferrer"
                className="ux-focus text-[11px] uppercase tracking-widest text-purple-300 hover:text-purple-200"
              >
                Releases ↗
              </a>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <FeatureCard accent="purple" icon="🔗" title="Grafo de Conhecimento" hint="Mapeamento neural de skills" />
              <FeatureCard accent="purple" icon="🧩" title="Plugins Modulares" hint="Skills plugáveis em runtime" />
              <FeatureCard accent="purple" icon="⚙️" title="Vault Sincronizado" hint="Memória persistente cross-agent" />
            </div>
          </section>
        ) : (
          <LockedFeature
            icon="⬢"
            title="Obsidian · Orquestração"
            unlock="Disponível a partir do nível AGN (Agente Generativo)"
            accent="purple"
          />
        )}

        {/* NEXUS LIVE — só AO+ */}
        {isAO ? (
          <section className="ux-glass-strong rounded-2xl border border-emerald-400/30 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl ux-pulse-soft">🎙</span>
                <div>
                  <h3 className="text-emerald-300 font-semibold text-lg">
                    Nexus Live · J.A.R.V.I.S
                  </h3>
                  <p className="text-xs text-slate-400">
                    Chat por voz inteligente · Speech-to-Speech
                  </p>
                </div>
              </div>
              <a
                href="https://github.com/GauravSingh9356/J.A.R.V.I.S"
                target="_blank"
                rel="noopener noreferrer"
                className="ux-focus text-[11px] uppercase tracking-widest text-emerald-300 hover:text-emerald-200"
              >
                Repositório ↗
              </a>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <FeatureCard accent="emerald" icon="🎤" title="Voz → Comando" hint="Reconhecimento natural pt-BR" />
              <FeatureCard accent="emerald" icon="🔊" title="TTS Premium" hint="Síntese vocal humanizada" />
              <FeatureCard accent="emerald" icon="🤖" title="Skill Routing" hint="Roteia para skills ativas" />
            </div>
            <div className="mt-4 rounded-lg border border-emerald-400/20 bg-black/30 p-3 text-[11px] text-slate-400">
              Pressione <kbd className="rounded border border-white/15 bg-black/40 px-1.5 py-0.5 text-[10px]">Ctrl + J</kbd> em qualquer página para invocar o Nexus Live.
            </div>
          </section>
        ) : (
          <LockedFeature
            icon="🎙"
            title="Nexus Live · J.A.R.V.I.S"
            unlock="Disponível a partir do nível AO (Agente Orquestrador)"
            accent="emerald"
          />
        )}
      </div>
    </DashboardLayout>
  );
}

// ============ RADAR ============
function RadarChart({ packs, skills }: { packs: number; skills: number }) {
  const dims = [
    { label: "Skills", value: Math.min(100, skills * 4) },
    { label: "Packs", value: Math.min(100, packs * 20) },
    { label: "Bônus", value: 60 },
    { label: "Comissões", value: 40 },
    { label: "Atividade", value: 75 },
    { label: "Rede", value: 30 },
  ];
  const cx = 160, cy = 160, r = 110;
  const angleStep = (2 * Math.PI) / dims.length;
  const points = dims.map((d, i) => {
    const angle = -Math.PI / 2 + i * angleStep;
    const dist = (d.value / 100) * r;
    return [cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist];
  });
  const polyPts = points.map(p => p.join(",")).join(" ");
  return (
    <div className="flex flex-col md:flex-row items-center gap-4">
      <svg width={320} height={320} viewBox="0 0 320 320" className="ux-spark">
        <defs>
          <radialGradient id="radarGlow" cx="50%" cy="50%">
            <stop offset="0%" stopColor="rgba(34,211,238,0.5)" />
            <stop offset="100%" stopColor="rgba(34,211,238,0)" />
          </radialGradient>
        </defs>
        {[0.25, 0.5, 0.75, 1.0].map((p, i) => (
          <circle key={i} cx={cx} cy={cy} r={r * p} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        ))}
        {dims.map((d, i) => {
          const angle = -Math.PI / 2 + i * angleStep;
          return (
            <line
              key={i}
              x1={cx} y1={cy}
              x2={cx + Math.cos(angle) * r}
              y2={cy + Math.sin(angle) * r}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
            />
          );
        })}
        <polygon points={polyPts} fill="url(#radarGlow)" stroke="#22d3ee" strokeWidth="2" />
        {dims.map((d, i) => {
          const angle = -Math.PI / 2 + i * angleStep;
          const lx = cx + Math.cos(angle) * (r + 18);
          const ly = cy + Math.sin(angle) * (r + 18);
          return (
            <text key={i} x={lx} y={ly} fill="#94a3b8" fontSize="10" textAnchor="middle" dominantBaseline="middle">
              {d.label}
            </text>
          );
        })}
        {points.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r="3" fill="#22d3ee">
            <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
          </circle>
        ))}
      </svg>
      <div className="text-[11px] text-slate-400 space-y-1 min-w-[120px]">
        {dims.map(d => (
          <div key={d.label} className="flex items-center justify-between gap-3">
            <span>{d.label}</span>
            <span className="font-mono text-cyan-300">{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReactionBar({ label, value, max, color }: any) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div>
      <div className="flex items-center justify-between text-[11px] mb-1">
        <span className="text-slate-300">{label}</span>
        <span className="font-mono text-slate-400">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}88)`, boxShadow: `0 0 12px ${color}66` }}
        />
      </div>
    </div>
  );
}

function OrbitalView({ packs, skills }: { packs: number; skills: number }) {
  const total = Math.min(12, packs + skills + 3);
  const items = Array.from({ length: total }, (_, i) => i);
  return (
    <div className="relative h-[280px] flex items-center justify-center overflow-hidden">
      <div className="absolute h-32 w-32 rounded-full bg-gradient-to-br from-cyan-500/30 to-purple-500/30 ux-pulse-soft" />
      <div className="absolute h-20 w-20 rounded-full bg-gradient-to-br from-cyan-400 to-purple-400 flex items-center justify-center text-2xl">
        🤖
      </div>
      <div className="absolute h-[220px] w-[220px] rounded-full border border-cyan-400/30" style={{animation:"ux-spin-slow 20s linear infinite"}}>
        {items.slice(0, 6).map((i) => {
          const a = (i / 6) * 2 * Math.PI;
          return (
            <div
              key={i}
              className="absolute h-3 w-3 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.8)]"
              style={{ left: `${50 + Math.cos(a) * 50}%`, top: `${50 + Math.sin(a) * 50}%`, transform: "translate(-50%, -50%)" }}
            />
          );
        })}
      </div>
      <div className="absolute h-[260px] w-[260px] rounded-full border border-purple-400/20" style={{animation:"ux-spin-slow 28s linear infinite reverse"}}>
        {items.slice(0, 8).map((i) => {
          const a = (i / 8) * 2 * Math.PI;
          return (
            <div
              key={i}
              className="absolute h-2 w-2 rounded-full bg-purple-300 shadow-[0_0_6px_rgba(167,139,250,0.8)]"
              style={{ left: `${50 + Math.cos(a) * 50}%`, top: `${50 + Math.sin(a) * 50}%`, transform: "translate(-50%, -50%)" }}
            />
          );
        })}
      </div>
      <div className="absolute bottom-2 right-2 text-[10px] text-slate-500 uppercase tracking-widest">
        {packs} packs · {skills} skills
      </div>
    </div>
  );
}

function FeatureCard({ accent, icon, title, hint }: any) {
  const color = accent === "purple" ? "purple" : "emerald";
  return (
    <div className={`ux-lift rounded-xl border border-${color}-400/25 bg-${color}-400/5 p-4`}>
      <div className="text-2xl mb-2">{icon}</div>
      <p className={`text-sm font-semibold text-${color}-200`}>{title}</p>
      <p className="text-[11px] text-slate-400 mt-1">{hint}</p>
    </div>
  );
}

function LockedFeature({ icon, title, unlock, accent }: any) {
  const color = accent === "purple" ? "purple" : "emerald";
  return (
    <section className={`ux-glass rounded-2xl border border-${color}-400/15 bg-${color}-400/5 p-6 opacity-70`}>
      <div className="flex items-center gap-3">
        <span className="text-3xl grayscale opacity-50">{icon}</span>
        <div>
          <h3 className="text-slate-300 font-semibold">{title}</h3>
          <p className="text-xs text-slate-500 mt-1">🔒 {unlock}</p>
        </div>
      </div>
    </section>
  );
}
