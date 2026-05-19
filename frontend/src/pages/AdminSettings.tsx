import AdminDashboardLayout from "@/pages/AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { Settings, Save, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function AdminSettings() {
  const { data: settings, isLoading, refetch } = trpc.admin.getSettings.useQuery();
  const updateSettingsMutation = trpc.admin.updateSettings.useMutation({
    onSuccess: () => {
      toast.success("Configurações salvas com sucesso");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao salvar configurações");
    },
  });

  const [formData, setFormData] = useState({
    platformName: "",
    supportEmail: "",
    defaultCommission: 10,
    maxNetworkDepth: 15,
    compressionEnabled: true,
  });

  const [commissionLevels, setCommissionLevels] = useState<{ level: number; percentage: number }[]>([]);

  useEffect(() => {
    if (settings) {
      setFormData({
        platformName: settings.platformName || "",
        supportEmail: settings.supportEmail || "",
        defaultCommission: settings.defaultCommission || 10,
        maxNetworkDepth: settings.maxNetworkDepth || 15,
        compressionEnabled: settings.compressionEnabled ?? true,
      });
      setCommissionLevels(settings.commissionLevels || []);
    }
  }, [settings]);

  const handleSave = () => {
    updateSettingsMutation.mutate(formData);
  };

  const handleAddLevel = () => {
    const nextLevel = (commissionLevels.length || 0) + 1;
    setCommissionLevels([...commissionLevels, { level: nextLevel, percentage: Math.max(0, 10 - nextLevel) }]);
  };

  const handleUpdateLevel = (index: number, percentage: number) => {
    const updated = [...commissionLevels];
    updated[index].percentage = percentage;
    setCommissionLevels(updated);
  };

  const handleRemoveLevel = (index: number) => {
    const updated = commissionLevels.filter((_, i) => i !== index);
    // Renumber levels
    setCommissionLevels(updated.map((level, i) => ({ ...level, level: i + 1 })));
  };

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Settings size={32} className="text-blue-600" />
              Configurações da Plataforma
            </h1>
            <p className="text-gray-600 mt-2">Gerencie as configurações gerais do sistema</p>
          </div>
          <Button onClick={handleSave} disabled={updateSettingsMutation.isPending}>
            <Save size={20} className="mr-2" />
            {updateSettingsMutation.isPending ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>

        {/* General Settings */}
        <Card className="p-6 bg-white">
          <h3 className="text-lg font-semibold mb-6 text-gray-900">Configurações Gerais</h3>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Plataforma
                </label>
                <Input
                  value={formData.platformName}
                  onChange={(e) => setFormData({ ...formData, platformName: e.target.value })}
                  placeholder="Nome da sua plataforma"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email de Suporte
                </label>
                <Input
                  type="email"
                  value={formData.supportEmail}
                  onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
                  placeholder="suporte@exemplo.com"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comissão Padrão (%)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.defaultCommission}
                    onChange={(e) => setFormData({ ...formData, defaultCommission: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profundidade Máxima da Rede
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    value={formData.maxNetworkDepth}
                    onChange={(e) => setFormData({ ...formData, maxNetworkDepth: parseInt(e.target.value) || 15 })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="compressionEnabled"
                  checked={formData.compressionEnabled}
                  onChange={(e) => setFormData({ ...formData, compressionEnabled: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300"
                />
                <label htmlFor="compressionEnabled" className="text-sm font-medium text-gray-700">
                  Ativar compressão de rede (auto-downgrade de uplines inativos)
                </label>
              </div>
            </div>
          )}
        </Card>

        {/* Commission Levels */}
        <Card className="p-6 bg-white">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Níveis de Comissionamento</h3>
            <Button variant="outline" size="sm" onClick={handleAddLevel}>
              <RefreshCw size={16} className="mr-2" />
              Adicionar Nível
            </Button>
          </div>

          <p className="text-sm text-gray-600 mb-6">
            Configure o percentual de comissão para cada nível de profundidade na rede.
            Quanto maior o nível, menor a comissão (estratégia recomendada).
          </p>

          <div className="space-y-4">
            {commissionLevels.length > 0 ? (
              commissionLevels.map((level, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <span className="font-medium text-gray-900">Nível {level.level}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={level.percentage}
                      onChange={(e) => handleUpdateLevel(index, parseInt(e.target.value) || 0)}
                      className="w-24"
                    />
                    <span className="text-gray-600">%</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveLevel(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Remover
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Nenhum nível de comissão configurado</p>
                <Button variant="outline" onClick={handleAddLevel} className="mt-4">
                  Adicionar Primeiro Nível
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* API Keys (Read-only display) */}
        <Card className="p-6 bg-white">
          <h3 className="text-lg font-semibold mb-6 text-gray-900">Configurações de API</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status da API Gemini
              </label>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${process.env.GEMINI_API_KEY ? "bg-green-500" : "bg-red-500"}`}></span>
                <span className="text-sm text-gray-600">
                  {process.env.GEMINI_API_KEY ? "Configurada" : "Não configurada"}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status da API OpenAI
              </label>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${process.env.OPENAI_API_KEY ? "bg-green-500" : "bg-red-500"}`}></span>
                <span className="text-sm text-gray-600">
                  {process.env.OPENAI_API_KEY ? "Configurada" : "Não configurada"}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Banco de Dados
              </label>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${process.env.DATABASE_URL ? "bg-green-500" : "bg-red-500"}`}></span>
                <span className="text-sm text-gray-600">
                  {process.env.DATABASE_URL ? "Configurado" : "Não configurado"}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Redis
              </label>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${process.env.REDIS_URL ? "bg-green-500" : "bg-red-500"}`}></span>
                <span className="text-sm text-gray-600">
                  {process.env.REDIS_URL ? "Configurado" : "Não configurado"}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="p-6 bg-red-50 border-red-200">
          <h3 className="text-lg font-semibold mb-4 text-red-900">Zona de Perigo</h3>
          <p className="text-sm text-red-700 mb-4">
            Estas ações são irreversíveis. Tenha certeza antes de prosseguir.
          </p>
          <div className="flex gap-3">
            <Button variant="destructive" size="sm">
              Limpar Cache
            </Button>
            <Button variant="destructive" size="sm">
              Resetar Configurações
            </Button>
          </div>
        </Card>
      </div>
    </AdminDashboardLayout>
  );
}