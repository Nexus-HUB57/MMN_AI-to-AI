import AdminDashboardLayout from "@/components/AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Plus, Edit2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function AdminCommissions() {
  const [editingLevel, setEditingLevel] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    level: 1,
    percentage: 0,
    minAmount: 0,
    description: "",
  });

  const { data: configs, isLoading, refetch } = trpc.commissionConfigs.list.useQuery();

  const updateMutation = trpc.commissionConfigs.update.useMutation({
    onSuccess: () => {
      toast.success("Configuração de comissão atualizada com sucesso");
      refetch();
      setEditingLevel(null);
      setFormData({ level: 1, percentage: 0, minAmount: 0, description: "" });
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar configuração");
    },
  });

  const handleEdit = (config: any) => {
    setEditingLevel(config.level);
    setFormData({
      level: config.level,
      percentage: parseFloat(config.percentage),
      minAmount: parseFloat(config.minAmount || 0),
      description: config.description || "",
    });
  };

  const handleSubmit = () => {
    if (formData.percentage < 0 || formData.percentage > 100) {
      toast.error("Percentual deve estar entre 0 e 100");
      return;
    }
    updateMutation.mutate(formData);
  };

  const handleAddNew = () => {
    const nextLevel = (configs?.length || 0) + 1;
    setFormData({
      level: nextLevel,
      percentage: 0,
      minAmount: 0,
      description: "",
    });
    setEditingLevel(nextLevel);
  };

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Configuração de Comissões</h1>
          <Button onClick={handleAddNew}>
            <Plus size={20} />
            Novo Nível
          </Button>
        </div>

        {/* Info Card */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="text-blue-900">
            Configure os percentuais de comissão para cada nível de profundidade na rede de afiliados.
            Quanto maior o nível, menor a comissão (geralmente).
          </p>
        </Card>

        {/* Commission Levels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {isLoading ? (
            [1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-40" />
            ))
          ) : configs && configs.length > 0 ? (
            configs.map((config) => (
              <Card key={config.id} className="p-6 bg-white">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Nível {config.level}
                    </h3>
                    <p className="text-sm text-gray-600">{config.description || "Sem descrição"}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(config)}
                  >
                    <Edit2 size={16} />
                  </Button>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Percentual:</span>
                    <span className="font-semibold text-gray-900">{config.percentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Valor Mínimo:</span>
                    <span className="font-semibold text-gray-900">
                      R$ {parseFloat(config.minAmount || "0").toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-2 text-center py-12">
              <p className="text-gray-500 mb-4">Nenhuma configuração de comissão cadastrada</p>
              <Button onClick={handleAddNew}>Criar Primeira Configuração</Button>
            </div>
          )}
        </div>

        {/* Edit Form */}
        {editingLevel !== null && (
          <Card className="p-6 bg-white border-2 border-blue-200">
            <h3 className="text-lg font-semibold mb-6 text-gray-900">
              {editingLevel > (configs?.length || 0) ? "Novo Nível" : "Editar Nível"} {formData.level}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Percentual de Comissão (%)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.percentage}
                  onChange={(e) =>
                    setFormData({ ...formData, percentage: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor Mínimo (R$)
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.minAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, minAmount: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <Input
                  placeholder="Ex: Comissão para indicados diretos"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleSubmit}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? "Salvando..." : "Salvar"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingLevel(null);
                    setFormData({ level: 1, percentage: 0, minAmount: 0, description: "" });
                  }}
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
