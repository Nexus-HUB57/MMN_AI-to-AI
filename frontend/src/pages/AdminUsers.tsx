import { useMemo, useState } from "react";
import { Ban, CheckCircle2, Search, Shield, User } from "lucide-react";
import AdminDashboardLayout from "@/pages/AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const PAGE_SIZE = 20;
type UserRole = "user" | "admin";

export default function AdminUsers() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");

  const usersQuery = trpc.admin.listUsers.useQuery({
    page,
    limit: PAGE_SIZE,
    search: searchTerm || undefined,
    role: roleFilter === "all" ? undefined : roleFilter,
  });

  const utils = trpc.useUtils();
  const setOperationalStatus = trpc.admin.setAffiliateOperationalStatus.useMutation({
    onSuccess: (payload: any) => {
      toast.success(payload.status === "suspended" ? "Usuário bloqueado operacionalmente." : "Usuário reativado.");
      void utils.admin.listUsers.invalidate();
    },
    onError: (error: any) => toast.error(error.message || "Não foi possível atualizar o status operacional."),
  });

  const users = usersQuery.data?.users || [];
  const pagination = usersQuery.data?.pagination;

  const summary = useMemo(() => {
    const admins = users.filter((user) => user.role === "admin").length;
    const regular = users.filter((user) => user.role === "user").length;
    return { admins, regular, total: pagination?.total || 0 };
  }, [pagination?.total, users]);

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <section className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Usuários e perfis administrativos</h1>
            <p className="mt-2 text-slate-600">
              Gestão unificada de usuários do Backoffice com busca, filtro e atualização de papel.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Card className="bg-white px-4 py-3 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-slate-500">Total</p>
              <p className="text-2xl font-semibold text-slate-900">{summary.total}</p>
            </Card>
            <Card className="bg-white px-4 py-3 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-slate-500">Admins na página</p>
              <p className="text-2xl font-semibold text-purple-700">{summary.admins}</p>
            </Card>
            <Card className="bg-white px-4 py-3 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-slate-500">Usuários na página</p>
              <p className="text-2xl font-semibold text-blue-700">{summary.regular}</p>
            </Card>
          </div>
        </section>

        <Card className="bg-white p-4 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <Input
                value={searchTerm}
                onChange={(e) => {
                  setPage(1);
                  setSearchTerm(e.target.value);
                }}
                placeholder="Buscar por nome ou email"
                className="pl-10"
              />
            </div>
            <Select
              value={roleFilter}
              onValueChange={(value: "all" | UserRole) => {
                setPage(1);
                setRoleFilter(value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por papel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os papéis</SelectItem>
                <SelectItem value="user">Usuário</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        <Card className="overflow-x-auto bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Lista operacional</h2>
            {pagination && (
              <p className="text-sm text-slate-500">
                Página {pagination.page} de {Math.max(1, pagination.totalPages)}
              </p>
            )}
          </div>

          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                <th className="px-4 py-3 font-semibold text-slate-900">Usuário</th>
                <th className="px-4 py-3 font-semibold text-slate-900">Email</th>
                <th className="px-4 py-3 font-semibold text-slate-900">Papel / status</th>
                <th className="px-4 py-3 font-semibold text-slate-900">Cadastro</th>
                <th className="px-4 py-3 font-semibold text-slate-900">Último acesso</th>
                <th className="px-4 py-3 font-semibold text-slate-900">Ações</th>
              </tr>
            </thead>
            <tbody>
              {usersQuery.isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="border-b border-slate-100">
                    <td className="px-4 py-4"><Skeleton className="h-4 w-36" /></td>
                    <td className="px-4 py-4"><Skeleton className="h-4 w-48" /></td>
                    <td className="px-4 py-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-4 py-4"><Skeleton className="h-4 w-28" /></td>
                    <td className="px-4 py-4"><Skeleton className="h-4 w-28" /></td>
                    <td className="px-4 py-4"><Skeleton className="h-4 w-24" /></td>
                  </tr>
                ))
              ) : users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-100 transition hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                          <User size={16} />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{user.name || "Sem nome"}</p>
                          <p className="text-xs text-slate-500">ID #{user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">{user.email || "N/A"}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {user.role === "admin" && <Shield size={14} />}
                        {user.role === "admin" ? "Admin" : "Usuário"}
                      </span>
                      {user.affiliateStatus && (
                        <span className={`ml-2 inline-flex rounded-full px-2 py-1 text-xs font-semibold ${user.affiliateStatus === "suspended" ? "bg-red-100 text-red-800" : "bg-emerald-100 text-emerald-800"}`}>
                          {user.affiliateStatus === "suspended" ? "Bloqueado" : "Ativo"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString("pt-BR") : "N/A"}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">
                      {user.lastSignedIn ? new Date(user.lastSignedIn).toLocaleString("pt-BR") : "Sem registro"}
                    </td>
                    <td className="px-4 py-4">
                      {user.affiliateStatus ? (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={setOperationalStatus.isPending}
                          onClick={() => setOperationalStatus.mutate({
                            userId: user.id,
                            status: user.affiliateStatus === "suspended" ? "active" : "suspended",
                          })}
                          title="Controle operacional: não altera papel administrativo"
                        >
                          {user.affiliateStatus === "suspended" ? <CheckCircle2 size={16} /> : <Ban size={16} />}
                          <span className="ml-2">{user.affiliateStatus === "suspended" ? "Reativar" : "Bloquear"}</span>
                        </Button>
                      ) : <span className="text-xs text-slate-500">Sem perfil afiliado</span>}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                    Nenhum usuário encontrado para os filtros atuais.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              {pagination ? `${pagination.total} registro(s) no total` : "Sem paginação disponível"}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1 || usersQuery.isLoading}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((current) => current + 1)}
                disabled={usersQuery.isLoading || !pagination || page >= pagination.totalPages}
              >
                Próxima
              </Button>
            </div>
          </div>
        </Card>

        <Card className="bg-white p-4 shadow-sm border-amber-200 bg-amber-50/50">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-full bg-amber-100 p-2 text-amber-700">
              <Shield size={16} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Papel administrativo protegido</h3>
              <p className="mt-1 text-sm text-slate-600">
                Papéis administrativos são protegidos por governança. Neste painel, administradores podem bloquear ou reativar perfis afiliados sem elevar privilégios.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </AdminDashboardLayout>
  );
}
