// D12 KPI_CARD — métrica refinada com sparkline e tooltip
import React from "react";

interface KpiCardProps {
  label: string;
  value: React.ReactNode;
  delta?: { value: number; positive?: boolean; suffix?: string };
  icon?: React.ReactNode;
  hint?: string;
  spark?: number[];
  accent?: "cyan" | "emerald" | "purple" | "amber" | "rose";
  loading?: boolean;
  onClick?: () => void;
}

const ACCENTS: Record<string, { from: string; to: string; ring: string; text: string }> = {
  cyan:    { from: "from-cyan-500/15",    to: "to-cyan-500/0",    ring: "ring-cyan-400/30",    text: "text-cyan-300" },
  emerald: { from: "from-emerald-500/15", to: "to-emerald-500/0", ring: "ring-emerald-400/30", text: "text-emerald-300" },
  purple:  { from: "from-purple-500/15",  to: "to-purple-500/0",  ring: "ring-purple-400/30",  text: "text-purple-300" },
  amber:   { from: "from-amber-500/15",   to: "to-amber-500/0",   ring: "ring-amber-400/30",   text: "text-amber-300" },
  rose:    { from: "from-rose-500/15",    to: "to-rose-500/0",    ring: "ring-rose-400/30",    text: "text-rose-300" },
};

export default function KpiCard({
  label, value, delta, icon, hint, spark, accent = "cyan", loading, onClick,
}: KpiCardProps) {
  const a = ACCENTS[accent];
  const interactive = !!onClick;

  return (
    <div
      onClick={onClick}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      className={
        "ux-lift ux-focus relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br " +
        a.from + " " + a.to + " p-4 ring-1 " + a.ring +
        (interactive ? " cursor-pointer" : "")
      }
      {...(hint ? { "data-tooltip": hint, className: "" } : {})}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {icon && <span className={"text-xl " + a.text}>{icon}</span>}
          <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
            {label}
          </p>
        </div>
        {delta && (
          <span
            className={
              "rounded-full px-2 py-0.5 text-[10px] font-bold " +
              (delta.positive
                ? "bg-emerald-500/20 text-emerald-300"
                : "bg-rose-500/20 text-rose-300")
            }
          >
            {delta.positive ? "▲" : "▼"} {Math.abs(delta.value)}{delta.suffix || "%"}
          </span>
        )}
      </div>

      <div className="mt-2 flex items-end justify-between gap-3">
        {loading ? (
          <div className="ux-skeleton h-7 w-24" />
        ) : (
          <p className="font-sans text-2xl font-bold text-white">{value}</p>
        )}
        {spark && spark.length > 1 && (
          <Sparkline data={spark} color={accent} />
        )}
      </div>

      {hint && (
        <p className="mt-2 text-[10px] text-slate-500">{hint}</p>
      )}
    </div>
  );
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const w = 80, h = 28;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const stroke =
    color === "emerald" ? "#34d399" :
    color === "purple"  ? "#a78bfa" :
    color === "amber"   ? "#fbbf24" :
    color === "rose"    ? "#fb7185" :
    "#22d3ee";
  return (
    <svg className="ux-spark" width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <polyline
        points={pts}
        stroke={stroke}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
