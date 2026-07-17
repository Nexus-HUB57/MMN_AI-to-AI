// V16: Badge "🆕" quando há aula publicada nas últimas N horas
import { useEffect, useState } from "react";

export default function AcademiaNewBadge({ hours = 24 }: { hours?: number }) {
  const [hasRecent, setHasRecent] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    fetch(`/api/academia/whats-new/has-recent?hours=${hours}`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (!mounted || !d) return;
        setHasRecent(Boolean(d.hasRecent));
        setCount(Number(d.recentCount || 0));
      })
      .catch(() => {});
    // re-fetch a cada 5 minutos enquanto a aba estiver aberta
    const id = setInterval(() => {
      fetch(`/api/academia/whats-new/has-recent?hours=${hours}`)
        .then((r) => r.ok ? r.json() : null)
        .then((d) => {
          if (!mounted || !d) return;
          setHasRecent(Boolean(d.hasRecent));
          setCount(Number(d.recentCount || 0));
        }).catch(() => {});
    }, 300_000);
    return () => { mounted = false; clearInterval(id); };
  }, [hours]);

  if (!hasRecent) return null;
  return (
    <a
      href="/academia/ead/curso"
      title={`${count} aula(s) nova(s) nas últimas ${hours}h`}
      className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide
        bg-gradient-to-r from-amber-400 to-rose-500 text-white rounded-full
        shadow-sm hover:shadow-md transition animate-pulse"
    >
      🆕 {count > 1 ? `${count} novas` : "nova"}
    </a>
  );
}
