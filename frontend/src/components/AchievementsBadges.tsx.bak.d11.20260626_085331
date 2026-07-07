// SPRINT9_ACHIEVEMENTS_V1
import { trpc } from "../lib/trpc";

const BADGES = [
  { id: "first_pack", icon: "🎁", title: "Primeiro Pack", desc: "Adquiriu seu primeiro pack", check: (d: any) => d.activePacks?.length > 0 },
  { id: "ten_ebooks", icon: "📚", title: "Bibliotecário", desc: "10+ ebooks na biblioteca", check: (d: any) => d.totalLibrary >= 10 },
  { id: "fifty_ebooks", icon: "🏆", title: "Mestre Coletor", desc: "50+ ebooks na biblioteca", check: (d: any) => d.totalLibrary >= 50 },
  { id: "first_sale", icon: "💰", title: "Primeira Venda", desc: "Realizou sua primeira venda", check: (d: any) => (d.salesCount || 0) > 0 },
  { id: "active_agent", icon: "🤖", title: "Agente Ativo", desc: "Agente IA em operação", check: (d: any) => d.agentActive === true },
  { id: "ten_sales", icon: "🚀", title: "Vendedor", desc: "10+ vendas realizadas", check: (d: any) => (d.salesCount || 0) >= 10 },
];

export default function AchievementsBadges() {
  const inventory = trpc.affiliateStore.myInventory.useQuery();
  const data = {
    totalLibrary: inventory.data?.totalLibraryCount || 0,
    activePacks: inventory.data?.activePacks || [],
    salesCount: 0,
    agentActive: true,
  };

  const earned = BADGES.filter((b) => b.check(data));
  const locked = BADGES.filter((b) => !b.check(data));

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          🏅 Conquistas
        </h3>
        <span className="text-sm text-gray-500">{earned.length}/{BADGES.length}</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {earned.map((b) => (
          <div key={b.id} className="p-3 bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg border border-amber-300 text-center">
            <div className="text-3xl mb-1">{b.icon}</div>
            <div className="text-xs font-semibold text-gray-900 dark:text-white">{b.title}</div>
          </div>
        ))}
        {locked.map((b) => (
          <div key={b.id} className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 text-center opacity-40">
            <div className="text-3xl mb-1 grayscale">{b.icon}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">{b.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
