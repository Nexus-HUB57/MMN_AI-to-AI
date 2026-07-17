// SPRINT10_NOTIFICATION_CENTER_V2 — eventos reais (academia + dashboard)
import { useEffect, useMemo, useState } from "react";
import { trpc } from "../lib/trpc";

interface Notification {
  id: string;
  type: "success" | "info" | "warning" | "error";
  title: string;
  message: string;
  timestamp: number;
  href?: string;
}

export default function NotificationCenter() {
  const yt = trpc.academiaEad.youtubeSyncStatus.useQuery(undefined, {
    retry: false,
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });
  const dash = trpc.dashboard.getMyDashboard.useQuery(undefined, {
    retry: false,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);

  const notifications = useMemo<Notification[]>(() => {
    const out: Notification[] = [];

    // Notificação de sistema (boot)
    out.push({
      id: "system-boot",
      type: "info",
      title: "Sistema Online",
      message: "Nexus Hub operacional. Agentes IA prontos.",
      timestamp: Date.now(),
    });

    // Notificação Academ'IA — vídeos unlisted
    const ytData: any = yt.data;
    if (ytData?.configured && ytData?.connected) {
      const count = (ytData.latestVideos || []).length;
      if (count > 0) {
        out.push({
          id: "yt-videos-ready",
          type: "success",
          title: "Academ'IA · Vídeos publicados",
          message: `${count} vídeo(s) disponíveis no canal oficial @NexusAffilIAte-w9p.`,
          timestamp: Date.now(),
          href: "/academia/ead/curso",
        });
      }
    }

    // Notificações Dashboard — comissões pendentes
    const dd: any = dash.data;
    if (dd?.pendingCommissions && Number(dd.pendingCommissions) > 0) {
      out.push({
        id: "commissions-pending",
        type: "warning",
        title: "Comissões pendentes",
        message: `Você possui R$ ${(Number(dd.pendingCommissions) / 100).toFixed(2)} em comissões aguardando confirmação.`,
        timestamp: Date.now(),
        href: "/dashboard",
      });
    }

    return out.filter((n) => !dismissed.has(n.id));
  }, [yt.data, dash.data, dismissed]);

  const dismiss = (id: string) => setDismissed((s) => new Set([...s, id]));
  const unread = notifications.length;

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-3 bg-white dark:bg-gray-900 rounded-full shadow-lg border border-gray-200 dark:border-gray-800 hover:scale-105 transition"
        aria-label="Notificações"
      >
        🔔
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-800 max-h-96 overflow-y-auto">
          <div className="p-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <h4 className="font-bold text-gray-900 dark:text-white">Notificações</h4>
            <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
          </div>
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-gray-500">Nenhuma notificação</div>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className="p-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-gray-900 dark:text-white">{n.title}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{n.message}</div>
                    {n.href && (
                      <a href={n.href} className="text-[11px] text-blue-500 hover:underline mt-1 inline-block">Abrir</a>
                    )}
                  </div>
                  <button onClick={() => dismiss(n.id)} className="text-gray-400 hover:text-red-500 text-xs">✕</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
