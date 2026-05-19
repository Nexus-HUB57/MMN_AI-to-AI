import AdminDashboardLayout from "@/pages/AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Search, Users, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminNetwork() {
  const [selectedAffiliate, setSelectedAffiliate] = useState<number | null>(null);

  const { data: affiliates, isLoading: affiliatesLoading } = trpc.mmns.list.useQuery({
    limit: 100,
    offset: 0,
  });

  const { data: network } = trpc.network.getByAffiliate.useQuery(
    { userId: selectedAffiliate || 0 },
    { enabled: selectedAffiliate !== null }
  );

  const { data: directReferrals } = trpc.network.getDirectReferrals.useQuery(
    { sponsorId: selectedAffiliate || 0 },
    { enabled: selectedAffiliate !== null }
  );

  const buildNetworkTree = (nodes: any[], parentId: number = 0, level = 0): any[] => {
    return nodes
      .filter((node) => node.sponsorId === parentId)
      .map((node) => ({
        ...node,
        level,
        children: buildNetworkTree(nodes, node.userId, level + 1),
      }));
  };

  const networkTree = network ? buildNetworkTree(network) : [];

  const NetworkNode = ({ node, level }: any) => (
    <div className="ml-4 border-l-2 border-gray-300">
      <div className="p-3 bg-gray-50 rounded my-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-900">Nível {node.level + 1}</p>
            <p className="text-sm text-gray-600">User ID: {node.userId}</p>
          </div>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
            {node.children?.length || 0} indicados
          </span>
        </div>
      </div>
      {node.children && node.children.length > 0 && (
        <div>
          {node.children.map((child: any) => (
            <NetworkNode key={child.userId} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatório de Rede</h1>
          <p className="text-gray-600 mt-2">Visualize a estrutura hierárquica da rede de afiliados</p>
        </div>

        {/* Affiliate Selector */}
        <Card className="p-4 bg-white">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selecione um Afiliado
          </label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <Input
                placeholder="Buscar afiliado..."
                className="pl-10"
              />
            </div>
          </div>
          {affiliatesLoading ? (
            <Skeleton className="h-10 mt-4" />
          ) : (
            <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
              {affiliates?.map((affiliate) => (
                <button
                  key={affiliate.id}
                  onClick={() => setSelectedAffiliate(affiliate.userId)}
                  className={`w-full text-left p-3 rounded transition-colors ${
                    selectedAffiliate === affiliate.userId
                      ? "bg-blue-100 border-2 border-blue-500"
                      : "bg-gray-50 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  <p className="font-medium text-gray-900">{affiliate.affiliateCode}</p>
                  <p className="text-sm text-gray-600">Status: {affiliate.status}</p>
                </button>
              ))}
            </div>
          )}
        </Card>

        {selectedAffiliate && (
          <>
            {/* Network Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Indicados Diretos</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {directReferrals?.length || 0}
                    </p>
                  </div>
                  <Users size={32} className="text-blue-500" />
                </div>
              </Card>

              <Card className="p-6 bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Total na Rede</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {network?.length || 0}
                    </p>
                  </div>
                  <TrendingUp size={32} className="text-green-500" />
                </div>
              </Card>

              <Card className="p-6 bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Profundidade Máxima</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {Math.max(...(network?.map((n) => n.level) || [0])) + 1}
                    </p>
                  </div>
                  <TrendingUp size={32} className="text-purple-500" />
                </div>
              </Card>
            </div>

            {/* Network Tree */}
            <Card className="p-6 bg-white">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Estrutura da Rede</h3>
              {networkTree.length > 0 ? (
                <div className="space-y-2">
                  {networkTree.map((node) => (
                    <NetworkNode key={node.userId} node={node} level={0} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Nenhuma rede encontrada para este afiliado</p>
              )}
            </Card>
          </>
        )}
      </div>
    </AdminDashboardLayout>
  );
}
