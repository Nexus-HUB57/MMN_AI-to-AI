import { Play, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export type TrailModule = {
  code: string;
  title: string;
  serie: "Fundamentos" | "Agentes" | "Master" | "Elite";
  duration: string;
  videoId: string;
  status: "concluido" | "em-andamento" | "novo" | "bloqueado";
};

const SERIE_ACCENT: Record<TrailModule["serie"], string> = {
  Fundamentos: "text-cyan-300 border-cyan-400/30 bg-cyan-500/10",
  Agentes: "text-violet-300 border-violet-400/30 bg-violet-500/10",
  Master: "text-amber-300 border-amber-400/30 bg-amber-500/10",
  Elite: "text-rose-300 border-rose-400/30 bg-rose-500/10",
};

const STATUS_ICON = {
  concluido: <CheckCircle2 className="h-4 w-4 text-emerald-300" />,
  "em-andamento": <Play className="h-4 w-4 text-cyan-300" />,
  novo: <Play className="h-4 w-4 text-slate-300" />,
  bloqueado: <Clock className="h-4 w-4 text-slate-500" />,
};

const STATUS_LABEL = {
  concluido: "Concluído",
  "em-andamento": "Em andamento",
  novo: "Novo",
  bloqueado: "Em breve",
};

export type TrailProgressProps = {
  modules: TrailModule[];
};

export default function TrailProgress({ modules }: TrailProgressProps) {
  const done = modules.filter((m) => m.status === "concluido").length;
  const pct = modules.length > 0 ? Math.round((done / modules.length) * 100) : 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02]">
      <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-400">
            AcademIA · Trilhas oficiais
          </p>
          <h3 className="mt-1 text-lg font-semibold text-white">Sua jornada Nexus</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-white">
              {done}/{modules.length}
            </p>
            <p className="text-[11px] text-slate-400">módulos</p>
          </div>
          <div className="grid h-14 w-14 place-items-center rounded-full border-2 border-cyan-400/40 text-sm font-bold text-cyan-200">
            {pct}%
          </div>
        </div>
      </div>
      <div className="divide-y divide-white/5">
        {modules.map((mod) => (
          <a
            key={mod.videoId}
            href={`https://www.youtube.com/watch?v=${mod.videoId}`}
            target="_blank"
            rel="noreferrer"
            className={cn(
              "group flex items-center gap-4 px-5 py-3 transition hover:bg-white/[0.03]",
              mod.status === "bloqueado" && "opacity-60"
            )}
          >
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-slate-900/60 text-sm font-bold text-slate-200 ring-1 ring-white/10">
              {mod.code}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest",
                    SERIE_ACCENT[mod.serie]
                  )}
                >
                  {mod.serie}
                </span>
                <p className="truncate text-sm font-medium text-white">{mod.title}</p>
              </div>
              <p className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-400">
                <Clock className="h-3 w-3" />
                {mod.duration}
                <span className="text-slate-600">·</span>
                <span>{STATUS_LABEL[mod.status]}</span>
              </p>
            </div>
            <div className="shrink-0">{STATUS_ICON[mod.status]}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
