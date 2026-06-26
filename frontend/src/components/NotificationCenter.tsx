// D11 NOTIFICATION_CENTER_DYNAMIC — feed em tempo real do backend
import { useMemo, useState } from "react";
import { trpc } from "../lib/trpc";

export default function NotificationCenter() {
  const q = (trpc as any).dashboardStatus?.getNotifications?.useQuery?.(
    { limit: 20 },
    { refetchInterval: 45_000, refetchOnWindowFocus: true, retry: false }
  );
  const data = q?.data;
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const notifications = useMemo(() => {
    const list = (data?.notifications || []) as Array<any>;
    return list.filter((n) => !dismissed.has(n.id));
  }, [data, dismissed]);

  if (!data && !q?.isLoading) {
    return (
      <div className="text-sm text-slate-400 px-1 py-2">
        Sem novas notificações no momento.
      </div>
    );
  }

  if (q?.isLoading) {
    return (
      <div className="text-sm text-slate-400 px-1 py-2 animate-pulse">
        Sincronizando notificações...
      </div>
    );
  }

  const dismiss = (id: string) => setDismissed((s) => new Set([...s, id]));
  const colorOf = (t: string) =>
    t === "success" ? "border-emerald-400/40 bg-emerald-500/5"
    : t === "warning" ? "border-amber-400/40 bg-amber-500/5"
    : t === "error" ? "border-rose-400/40 bg-rose-500/5"
    : "border-slate-400/30 bg-slate-500/5";
  const dotOf = (t: string) =>
    t === "success" ? "bg-emerald-400"
    : t === "warning" ? "bg-amber-400"
    : t === "error" ? "bg-rose-400"
    : "bg-slate-400";

  if (notifications.length === 0) {
    return (
      <div className="text-sm text-slate-400 px-1 py-2">
        Nenhuma notificação ativa.
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={"rounded-lg border px-3 py-2 text-[12px] " + colorOf(n.type)}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 flex-1 min-w-0">
              <span
                className={"inline-block h-2 w-2 rounded-full mt-1.5 " + dotOf(n.type)}
              />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-100 truncate">{n.title}</div>
                <div className="text-slate-400 text-[11px] mt-0.5 leading-snug">{n.message}</div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500 mt-1">
                  {timeAgo(n.timestamp)}
                  {n.href && (
                    <>
                      {" · "}
                      <a href={n.href} className="text-quantum-cyan hover:underline">abrir</a>
                    </>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => dismiss(n.id)}
              className="text-slate-500 hover:text-slate-300 text-xs px-1"
              aria-label="Dispensar"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function timeAgo(iso: string): string {
  const t = new Date(iso).getTime();
  const dt = Math.max(0, Date.now() - t);
  const m = Math.floor(dt / 60000);
  if (m < 1) return "agora";
  if (m < 60) return `há ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.floor(h / 24);
  return `há ${d} d`;
}
