import AdminDashboardLayout from "@/pages/AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Search, Shield, User, Edit2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<"user" | "admin">("user");

  const { data: users, isLoading, refetch } = trpc.users.list.useQuery({
    limit: 50,
    offset: 0,
  });

  const updateRoleMutation = trpc.users.updateRole.useMutation({
    onSuccess: () => {
      toast.success("Papel do usuário atualizado com sucesso");
      refetch();
      setSelectedUserId(null);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar papel do usuário");
    },
  });

  const filteredUsers = users?.filter((user) =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdateRole = () => {
    if (selectedUserId) {
      updateRoleMutation.mutate({
        userId: selectedUserId,
        role: selectedRole,
      });
    }
  };

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Gerenciador de Usuários</h1>
          <Button>Novo Usuário</Button>
        </div>

        {/* Search and Filters */}
        <Card className="p-4 bg-white">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </Card>

        {/* Users Table */}
        <Card className="p-6 bg-white overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Nome</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Papel</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Data de Cadastro</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [1, 2, 3].map((i) => (
                  <tr key={i} className="border-b border-gray-200">
                    <td className="py-3 px-4"><Skeleton className="h-4 w-32" /></td>
                    <td className="py-3 px-4"><Skeleton className="h-4 w-40" /></td>
                    <td className="py-3 px-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="py-3 px-4"><Skeleton className="h-4 w-32" /></td>
                    <td className="py-3 px-4"><Skeleton className="h-4 w-24" /></td>
                  </tr>
                ))
              ) : filteredUsers && filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User size={16} className="text-blue-600" />
                        </div>
                        <span className="font-medium text-gray-900">{user.name || "N/A"}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{user.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      }`}>
                        {user.role === "admin" ? (
                          <div className="flex items-center gap-1">
                            <Shield size={14} />
                            Admin
                          </div>
                        ) : (
                          "Usuário"
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUserId(user.id);
                          setSelectedRole(user.role);
                        }}
                      >
                        <Edit2 size={16} />
                        Editar
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    Nenhum usuário encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>

        {/* Edit Role Modal */}
        {selectedUserId && (
          <Card className="p-6 bg-white border-2 border-blue-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Atualizar Papel do Usuário</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Novo Papel
                </label>
                <Select value={selectedRole} onValueChange={(value: any) => setSelectedRole(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuário</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleUpdateRole}
                  disabled={updateRoleMutation.isPending}
                >
                  {updateRoleMutation.isPending ? "Atualizando..." : "Atualizar"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedUserId(null)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </AdminDashboardLayout>
  );
}
