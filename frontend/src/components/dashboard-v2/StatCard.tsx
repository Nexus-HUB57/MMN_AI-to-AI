import { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  delta?: {
    value: string;
    direction: "up" | "down" | "neutral";
    label?: string;
  };
  accent?: "cyan" | "emerald" | "amber" | "rose" | "violet";
  footer?: ReactNode;
};

const ACCENT: Record<NonNullable<StatCardProps["accent"]>, string> = {
  cyan: "from-cyan-400/20 via-cyan-400/5 to-transparent ring-cyan-400/30",
  emerald: "from-emerald-400/20 via-emerald-400/5 to-transparent ring-emerald-400/30",
  amber: "from-amber-400/20 via-amber-400/5 to-transparent ring-amber-400/30",
  rose: "from-rose-400/20 via-rose-400/5 to-transparent ring-rose-400/30",
  violet: "from-violet-400/20 via-violet-400/5 to-transparent ring-violet-400/30",
};

const ICON_ACCENT: Record<NonNullable<StatCardProps["accent"]>, string> = {
  cyan: "text-cyan-300",
  emerald: "text-emerald-300",
  amber: "text-amber-300",
  rose: "text-rose-300",
  violet: "text-violet-300",
};

export default function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  delta,
  accent = "cyan",
  footer,
}: StatCardProps) {
  const isUp = delta?.direction === "up";
  const isDown = delta?.direction === "down";
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-5 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset] transition-all hover:border-white/10 hover:bg-white/[0.03]"
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-70 transition-opacity group-hover:opacity-100",
          ACCENT[accent]
        )}
      />
      <div className="relative flex items-start justify-between">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-400">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold text-white md:text-3xl">{value}</p>
          {hint && <p className="mt-1 truncate text-xs text-slate-400">{hint}</p>}
        </div>
        <div className={cn("grid h-10 w-10 place-items-center rounded-xl bg-white/5 ring-1 ring-inset ring-white/10")}>
          <Icon className={cn("h-5 w-5", ICON_ACCENT[accent])} />
        </div>
      </div>
      {(delta || footer) && (
        <div className="relative mt-4 flex items-center justify-between gap-2">
          {delta && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
                isUp && "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
                isDown && "border-rose-400/30 bg-rose-400/10 text-rose-300",
                !isUp && !isDown && "border-slate-500/30 bg-slate-500/10 text-slate-300"
              )}
            >
              {isUp && <ArrowUpRight className="h-3 w-3" />}
              {isDown && <ArrowDownRight className="h-3 w-3" />}
              <span>{delta.value}</span>
              {delta.label && <span className="text-slate-400/80">· {delta.label}</span>}
            </span>
          )}
          {footer}
        </div>
      )}
    </div>
  );
}
