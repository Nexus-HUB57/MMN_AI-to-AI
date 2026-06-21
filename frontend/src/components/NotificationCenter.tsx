// SPRINT10_NOTIFICATION_CENTER_V1
import { useState, useEffect } from "react";

interface Notification {
  id: string;
  type: "success" | "info" | "warning" | "error";
  title: string;
  message: string;
  timestamp: number;
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Demo: simulate startup notification
    const demo: Notification = {
      id: `boot-${Date.now()}`,
      type: "info",
      title: "Sistema Online",
      message: "Nexus Hub operacional. Agentes IA prontos.",
      timestamp: Date.now(),
    };
    setNotifications([demo]);
  }, []);

  const unread = notifications.length;
  const dismiss = (id: string) => setNotifications((n) => n.filter((x) => x.id !== id));

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
