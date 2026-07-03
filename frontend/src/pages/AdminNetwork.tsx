import { useMemo, useState } from "react";
import { Search, Users, Network as NetworkIcon, TrendingUp, RefreshCw } from "lucide-react";
import AdminDashboardLayout from "@/pages/AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";

type NetworkTreeNode = {
  userId: number;
  name?: string | null;
  email?: string | null;
  level: number;
  affiliateCode?: string | null;
  status?: string | null;
  children?: NetworkTreeNode[];
};

function countNodes(nodes: NetworkTreeNode[]): number {
  if (!Array.isArray(nodes)) return 0;
  return nodes.reduce((sum, node) => sum + 1 + countNodes(Array.isArray(node?.children) ? node.children : []), 0);
}

function getTreeDepth(nodes: NetworkTreeNode[]): number {
  if (!nodes.length) return 0;
  return Math.max(...nodes.map((node) => 1 + getTreeDepth(node.children || [])));
}

function NetworkNodeCard({ node }: { node: NetworkTreeNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="font-semibold text-slate-900">{node.name || "Usuário sem nome"}</p>
          <p className="text-sm text-slate-500">ID #{node.userId}</p>
          <p className="text-sm text-slate-500">{node.email || "Sem email cadastrado"}</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-blue-100 px-3 py-1 font-medium text-blue-800">
            Nível {node.level}
          </span>
          <span className="rounded-full bg-slate-200 px-3 py-1 font-medium text-slate-700">
            {node.affiliateCode || "Sem código"}
          </span>
          <span
            className={`rounded-full px-3 py-1 font-medium ${
              node.status === "active"
                ? "bg-green-100 text-green-800"
                : node.status
                ? "bg-amber-100 text-amber-800"
                : "bg-slate-200 text-slate-700"
            }`}
          >
            {node.status || "Sem status"}
          </span>
        </div>
      </div>

      {node.children?.length ? (
        <div className="mt-4 space-y-3 border-l-2 border-slate-200 pl-4">
          {node.children.map((child) => (
            <NetworkNodeCard key={child.userId} node={child} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function AdminNetwork() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [maxDepth, setMaxDepth] = useState("3");

  const usersQuery = trpc.admin.listUsers.useQuery({
    page: 1,
    limit: 30,
    search: searchTerm || undefined,
  });

  const networkStatsQuery = trpc.admin.getNetworkStats.useQuery();

  const networkTreeQuery = trpc.admin.getNetworkTree.useQuery(
    {
      userId: selectedUserId || undefined,
      maxDepth: Number(maxDepth),
    },
    {
      enabled: selectedUserId !== null,
    }
  );

  const users = usersQuery.data?.users || [];
  const tree = (networkTreeQuery.data || []) as NetworkTreeNode[];
  const selectedUser = users.find((user) => user.id === selectedUserId) || null;

  const treeSummary = useMemo(
    () => ({
      direct: tree.length,
      total: countNodes(tree),
      depth: getTreeDepth(tree),
    }),
    [tree]
  );

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <section className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Rede e árvore de patrocinadores</h1>
            <p className="mt-2 text-slate-600">
              Visualização administrativa conectada ao domínio oficial do Backoffice para análise da estrutura de rede.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                usersQuery.refetch();
                if (selectedUserId) {
                  networkTreeQuery.refetch();
                }
                networkStatsQuery.refetch();
              }}
            >
              <RefreshCw size={16} className="mr-2" />
              Atualizar dados
            </Button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Usuários totais</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {networkStatsQuery.data?.totalUsers ?? 0}
            </p>
          </Card>
          <Card className="bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Afiliados totais</p>
            <p className="mt-2 text-3xl font-semibold text-blue-700">
              {networkStatsQuery.data?.totalAffiliates ?? 0}
            </p>
          </Card>
          <Card className="bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Afiliados ativos</p>
            <p className="mt-2 text-3xl font-semibold text-green-700">
              {networkStatsQuery.data?.activeAffiliates ?? 0}
            </p>
          </Card>
          <Card className="bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Conexões registradas</p>
            <p className="mt-2 text-3xl font-semibold text-purple-700">
              {networkStatsQuery.data?.totalConnections ?? 0}
            </p>
          </Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-[360px_1fr]">
          <Card className="bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Users className="text-slate-700" size={18} />
              <h2 className="text-lg font-semibold text-slate-900">Selecionar usuário raiz</h2>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nome ou email"
                  className="pl-10"
                />
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">Profundidade máxima</p>
                <Select value={maxDepth} onValueChange={setMaxDepth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Profundidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">Até 2 níveis</SelectItem>
                    <SelectItem value="3">Até 3 níveis</SelectItem>
                    <SelectItem value="4">Até 4 níveis</SelectItem>
                    <SelectItem value="5">Até 5 níveis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4 max-h-[440px] space-y-2 overflow-y-auto pr-1">
              {usersQuery.isLoading ? (
                Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-16 w-full" />)
              ) : users.length > 0 ? (
                users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUserId(user.id)}
                    className={`w-full rounded-xl border p-3 text-left transition ${
                      selectedUserId === user.id
                        ? "border-blue-300 bg-blue-50"
                        : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    <p className="font-medium text-slate-900">{user.name || "Usuário sem nome"}</p>
                    <p className="text-sm text-slate-500">{user.email || "Sem email"}</p>
                    <p className="mt-2 text-xs text-slate-500">ID #{user.id} • papel {user.role}</p>
                  </button>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                  Nenhum usuário encontrado para o filtro atual.
                </div>
              )}
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Resumo da árvore selecionada</h2>
                  <p className="text-sm text-slate-500">
                    {selectedUser
                      ? `Raiz atual: ${selectedUser.name || selectedUser.email || `ID #${selectedUser.id}`}`
                      : "Selecione um usuário para carregar a árvore de rede."}
                  </p>
                </div>
                {selectedUserId ? (
                  <Button variant="outline" size="sm" onClick={() => networkTreeQuery.refetch()}>
                    <RefreshCw size={16} className="mr-2" />
                    Recarregar árvore
                  </Button>
                ) : null}
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-slate-700">
                    <Users size={18} />
                    <span className="text-sm font-medium">Diretos</span>
                  </div>
                  <p className="text-2xl font-semibold text-slate-900">{treeSummary.direct}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-slate-700">
                    <NetworkIcon size={18} />
                    <span className="text-sm font-medium">Total na árvore</span>
                  </div>
                  <p className="text-2xl font-semibold text-slate-900">{treeSummary.total}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-slate-700">
                    <TrendingUp size={18} />
                    <span className="text-sm font-medium">Profundidade</span>
                  </div>
                  <p className="text-2xl font-semibold text-slate-900">{treeSummary.depth}</p>
                </div>
              </div>
            </Card>

            <Card className="bg-white p-5 shadow-sm">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Estrutura da rede</h2>
                <p className="text-sm text-slate-500">
                  Árvore carregada via <code>trpc.admin.getNetworkTree</code> com profundidade configurável.
                </p>
              </div>

              {!selectedUserId ? (
                <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
                  Selecione um usuário para visualizar sua rede.
                </div>
              ) : networkTreeQuery.isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-24 w-full" />
                  ))}
                </div>
              ) : tree.length > 0 ? (
                <div className="space-y-4">
                  {tree.map((node) => (
                    <NetworkNodeCard key={node.userId} node={node} />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
                  Nenhum nó foi encontrado para o usuário selecionado.
                </div>
              )}
            </Card>
          </div>
        </section>
      </div>
    </AdminDashboardLayout>
  );
}
