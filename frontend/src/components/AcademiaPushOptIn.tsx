// V16: opt-in de notificações de navegador (sem servidor push backend ainda)
// Usa Notification API (locale apenas) + localStorage para persistir preferência
import { useEffect, useState } from "react";

const STORAGE_KEY = "nexus_academia_push_optin";

export default function AcademiaPushOptIn() {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [optedIn, setOptedIn] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    setSupported(true);
    setPermission(Notification.permission);
    setOptedIn(localStorage.getItem(STORAGE_KEY) === "yes");
    setDismissed(localStorage.getItem(STORAGE_KEY + "_dismissed") === "yes");
  }, []);

  const enable = async () => {
    if (!("Notification" in window)) return;
    const perm = await Notification.requestPermission();
    setPermission(perm);
    if (perm === "granted") {
      localStorage.setItem(STORAGE_KEY, "yes");
      setOptedIn(true);
      // Notificação de boas-vindas
      try {
        new Notification("Academ'IA · Notificações ativadas", {
          body: "Você receberá alertas quando novas aulas forem publicadas.",
          icon: "/favicon.ico",
        });
      } catch { /* silent */ }
    }
  };

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY + "_dismissed", "yes");
    setDismissed(true);
  };

  if (!supported || optedIn || permission === "denied" || dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 dark:from-purple-900/20 dark:to-cyan-900/20 rounded-lg p-4 mb-4 border border-purple-500/20 flex items-center gap-3">
      <span className="text-2xl flex-shrink-0">🔔</span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-gray-900 dark:text-white">
          Receba alerta de novas aulas
        </div>
        <div className="text-xs text-gray-500">
          Ative notificações do navegador para saber quando uma nova aula da Academ&apos;IA for publicada.
        </div>
      </div>
      <button
        onClick={enable}
        className="px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-md hover:shadow-md transition flex-shrink-0"
      >
        Ativar
      </button>
      <button
        onClick={dismiss}
        className="text-gray-400 hover:text-gray-600 text-sm flex-shrink-0 px-2"
        title="Dispensar"
      >
        ✕
      </button>
    </div>
  );
}
