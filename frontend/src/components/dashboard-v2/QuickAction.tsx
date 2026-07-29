import { LucideIcon } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

export type QuickActionProps = {
  label: string;
  description?: string;
  href: string;
  icon: LucideIcon;
  accent?: "cyan" | "emerald" | "amber" | "violet" | "rose";
};

const ACCENT: Record<NonNullable<QuickActionProps["accent"]>, string> = {
  cyan: "hover:border-cyan-400/40 hover:shadow-[0_0_0_1px_rgba(34,211,238,0.2)]",
  emerald: "hover:border-emerald-400/40 hover:shadow-[0_0_0_1px_rgba(52,211,153,0.2)]",
  amber: "hover:border-amber-400/40 hover:shadow-[0_0_0_1px_rgba(250,204,21,0.2)]",
  violet: "hover:border-violet-400/40 hover:shadow-[0_0_0_1px_rgba(167,139,250,0.2)]",
  rose: "hover:border-rose-400/40 hover:shadow-[0_0_0_1px_rgba(244,63,94,0.2)]",
};

const ICON_ACCENT: Record<NonNullable<QuickActionProps["accent"]>, string> = {
  cyan: "text-cyan-300 bg-cyan-500/10",
  emerald: "text-emerald-300 bg-emerald-500/10",
  amber: "text-amber-300 bg-amber-500/10",
  violet: "text-violet-300 bg-violet-500/10",
  rose: "text-rose-300 bg-rose-500/10",
};

export default function QuickAction({
  label,
  description,
  href,
  icon: Icon,
  accent = "cyan",
}: QuickActionProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-all",
        ACCENT[accent]
      )}
    >
      <div className={cn("grid h-10 w-10 place-items-center rounded-lg ring-1 ring-white/10", ICON_ACCENT[accent])}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">{label}</p>
        {description && (
          <p className="truncate text-xs text-slate-400 group-hover:text-slate-300">{description}</p>
        )}
      </div>
    </Link>
  );
}
