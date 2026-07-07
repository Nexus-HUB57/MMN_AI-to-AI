// D13 TOAST_SERVICE — feedback de ações com som opcional
import { useEffect } from "react";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastEvent {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  href?: string;
  duration?: number;
  sound?: boolean;
}

let listeners: Array<(t: ToastEvent) => void> = [];
let queue: ToastEvent[] = [];

export const toast = {
  show: (e: Omit<ToastEvent, "id">) => {
    const evt: ToastEvent = { id: Math.random().toString(36).slice(2), ...e };
    queue.push(evt);
    listeners.forEach((l) => l(evt));
  },
  success: (title: string, message?: string, opts?: Partial<ToastEvent>) =>
    toast.show({ type: "success", title, message, sound: true, ...opts }),
  error: (title: string, message?: string, opts?: Partial<ToastEvent>) =>
    toast.show({ type: "error", title, message, sound: true, ...opts }),
  info: (title: string, message?: string, opts?: Partial<ToastEvent>) =>
    toast.show({ type: "info", title, message, ...opts }),
  warning: (title: string, message?: string, opts?: Partial<ToastEvent>) =>
    toast.show({ type: "warning", title, message, ...opts }),
};

function playSound(type: ToastType) {
  if (typeof window === "undefined") return;
  if (localStorage.getItem("ux-sound-off") === "1") return;
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    const freq = type === "success" ? [600, 900] : type === "error" ? [400, 250] : [500, 500];
    osc.frequency.value = freq[0];
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
    osc.frequency.linearRampToValueAtTime(freq[1], ctx.currentTime + 0.15);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch {}
}

export function Toaster() {
  const [toasts, setToasts] = useStateImpl();

  useEffect(() => {
    const handler = (t: ToastEvent) => {
      if (t.sound) playSound(t.type);
      setToasts((s) => [...s, t]);
      setTimeout(() => setToasts((s) => s.filter((x) => x.id !== t.id)), t.duration || 4500);
    };
    listeners.push(handler);
    // flush queue
    queue.forEach(handler);
    queue = [];
    return () => { listeners = listeners.filter((l) => l !== handler); };
  }, []);

  const colorOf = (t: ToastType) => ({
    success: "border-emerald-400/50 bg-emerald-500/10 text-emerald-100",
    error:   "border-rose-400/50 bg-rose-500/10 text-rose-100",
    warning: "border-amber-400/50 bg-amber-500/10 text-amber-100",
    info:    "border-cyan-400/50 bg-cyan-500/10 text-cyan-100",
  }[t]);
  const iconOf = (t: ToastType) => ({ success: "✓", error: "✕", warning: "⚠", info: "ℹ" }[t]);

  return (
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={"ux-fade-in pointer-events-auto ux-glass-strong rounded-lg border px-4 py-3 shadow-lg " + colorOf(t.type)}
        >
          <div className="flex items-start gap-3">
            <span className="text-xl">{iconOf(t.type)}</span>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm">{t.title}</div>
              {t.message && <div className="text-[12px] mt-1 opacity-90">{t.message}</div>}
              {t.href && (
                <a href={t.href} className="inline-block mt-1 text-[11px] underline opacity-80 hover:opacity-100">
                  abrir →
                </a>
              )}
            </div>
            <button
              onClick={() => setToasts((s) => s.filter((x) => x.id !== t.id))}
              className="text-current opacity-60 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

import { useState as useStateImplActual } from "react";
function useStateImpl() {
  return useStateImplActual<ToastEvent[]>([]);
}
