// D11 ACHIEVEMENTS_V2 — ícones sincronizados, estado visual consistente
import { trpc } from "../lib/trpc";

interface BadgeDef {
  id: string;
  icon: string;
  title: string;
  desc: string;
  check: (d: any) => boolean;
}

const BADGES: BadgeDef[] = [
  { id: "agente_ativo", icon: "🤖", title: "Agente Ativo", desc: "Agente IA em operação",
    check: (d) => d.agentActive === true },
  { id: "first_pack",  icon: "🎁", title: "Primeiro Pack", desc: "Adquiriu seu primeiro pack",
    check: (d) => (d.activePacks?.length || 0) > 0 },
  { id: "bibliotecario", icon: "📚", title: "Bibliotecário", desc: "10+ ebooks na biblioteca",
    check: (d) => (d.totalLibrary || 0) >= 10 },
  { id: "mestre_coletor", icon: "🏆", title: "Mestre Coletor", desc: "50+ ebooks na biblioteca",
    check: (d) => (d.totalLibrary || 0) >= 50 },
  { id: "primeira_venda", icon: "💰", title: "Primeira Venda", desc: "Realizou sua primeira venda",
    check: (d) => (d.salesCount || 0) > 0 },
  { id: "vendedor", icon: "🚀", title: "Vendedor", desc: "10+ vendas realizadas",
    check: (d) => (d.salesCount || 0) >= 10 },
];

export default function AchievementsBadges() {
  const inventory = trpc.affiliateStore.myInventory.useQuery(undefined, { retry: false });
  const status = (trpc as any).dashboardStatus?.getStatus?.useQuery?.(undefined, {
    refetchInterval: 60_000, retry: false,
  });
  const dash = (trpc as any).dashboard?.getMyDashboard?.useQuery?.(undefined, { retry: false });

  const data = {
    totalLibrary: inventory.data?.totalLibraryCount || 0,
    activePacks: inventory.data?.activePacks || [],
    salesCount: (dash?.data?.recentOrders || []).filter((o: any) =>
      ["paid", "delivered", "confirmed", "approved"].includes(String(o.status || "").toLowerCase())
    ).length,
    agentActive: status?.data?.agentActive ?? true,
  };

  const total = BADGES.length;
  const earned = BADGES.filter((b) => b.check(data));
  const earnedCount = earned.length;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] uppercase tracking-widest text-slate-400">
          Progresso de carreira
        </p>
        <span className="text-xs font-mono text-amber-300">
          {earnedCount}/{total}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {BADGES.map((b) => {
          const isEarned = b.check(data);
          return (
            <div
              key={b.id}
              title={b.desc}
              className={
                "p-2.5 rounded-lg text-center transition border " +
                (isEarned
                  ? "border-amber-300/50 bg-gradient-to-br from-amber-500/15 to-orange-500/10 text-amber-100"
                  : "border-slate-700/60 bg-slate-800/40 text-slate-500 opacity-60")
              }
            >
              <div className={"text-2xl mb-1 " + (isEarned ? "" : "grayscale opacity-70")}>
                {b.icon}
              </div>
              <div
                className={
                  "text-[10px] font-semibold leading-tight " +
                  (isEarned ? "text-amber-100" : "text-slate-400")
                }
              >
                {b.title}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
