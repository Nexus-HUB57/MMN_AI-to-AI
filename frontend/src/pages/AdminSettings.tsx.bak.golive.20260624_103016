import AdminDashboardLayout from "@/pages/AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { Settings, Save, ShieldCheck, AlertTriangle, BookOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

// -----------------------------------------------------------------------------
// Nexus SaaS · IOAID — Regramento oficial de comissionamento (default fallback)
// Fonte: docs/planning/Age.txt · Clube de Vantagens · Revenda Multilevel.
// Matriz Forçada com 5 Níveis. Cada nível tem seu próprio percentual oficial.
// -----------------------------------------------------------------------------
const DEFAULT_OFFICIAL_LEVELS = [
  { level: 1, percentage: 20, label: "1º Nível", description: "20% sobre Resultados do N.O 1º Nível (Multilevel)" },
  { level: 2, percentage: 10, label: "2º Nível", description: "10% sobre Resultados do N.O 2º Nível (Multilevel)" },
  { level: 3, percentage: 5, label: "3º Nível", description: "5% sobre Resultados do N.O 3º Nível (Multilevel)" },
  { level: 4, percentage: 2.5, label: "4º Nível", description: "2,5% sobre Resultados do N.O 4º Nível (Multilevel)" },
  { level: 5, percentage: 1, label: "5º Nível", description: "1% sobre Resultados do N.O 5º Nível (Multilevel)" },
];

type CommissionLevel = {
  level: number;
  percentage: number;
  label?: string;
  description?: string;
};

export default function AdminSettings() {
  const { data: settings, isLoading, refetch } = trpc.admin.getSettings.useQuery();
  const updateSettingsMutation = trpc.admin.updateSettings.useMutation({
    onSuccess: () => {
      toast.success("Configurações salvas com sucesso");
      refetch();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Erro ao salvar configurações");
    },
  });

  const [formData, setFormData] = useState({
    platformName: "",
    supportEmail: "",
    maxNetworkDepth: 5,
    compressionEnabled: true,
  });

  const [commissionLevels, setCommissionLevels] = useState<CommissionLevel[]>([]);

  useEffect(() => {
    if (settings) {
      setFormData({
        platformName: settings.platformName || "Nexus SaaS · IOAID",
        supportEmail: settings.supportEmail || "",
        maxNetworkDepth: settings.maxNetworkDepth || 5,
        compressionEnabled: settings.compressionEnabled ?? true,
      });

      const incoming = (settings as any).commissionLevels as CommissionLevel[] | undefined;
      setCommissionLevels(incoming && incoming.length > 0 ? incoming : DEFAULT_OFFICIAL_LEVELS);
    }
  }, [settings]);

  const handleSave = () => {
    updateSettingsMutation.mutate({
      ...formData,
      defaultCommission: null,
      commissionLevels,
    } as any);
  };

  const handleUpdateLevel = (index: number, percentage: number) => {
    const updated = [...commissionLevels];
    updated[index] = { ...updated[index], percentage };
    setCommissionLevels(updated);
  };

  const handleRestoreOfficial = () => {
    setCommissionLevels(DEFAULT_OFFICIAL_LEVELS);
    toast.success("Regramento oficial Nexus SaaS · IOAID restaurado (5 níveis · Matriz Forçada)");
  };

  const apiStatus = (settings as any)?.apiStatus ?? {};

  const apiStatusRows: Array<{ label: string; ok: boolean; help: string }> = [
    {
      label: "Status da API Gemini",
      ok: Boolean(apiStatus.gemini),
      help: "Configurar variável GEMINI_API_KEY no painel do provedor de hospedagem do backend.",
    },
    {
      label: "Status da API OpenAI",
      ok: Boolean(apiStatus.openai),
      help: "Configurar OPENAI_API_KEY no Render → Environment.",
    },
    {
      label: "Banco de Dados (PostgreSQL/MySQL)",
      ok: Boolean(apiStatus.database),
      help: "Provisionar PostgreSQL no Render e copiar Internal Database URL para DATABASE_URL.",
    },
    {
      label: "Redis (filas BullMQ)",
      ok: Boolean(apiStatus.redis),
      help: "Provisionar Redis no Render para liberar workers de comissões, marketplace e ordens.",
    },
    {
      label: "Hotmart API",
      ok: Boolean(apiStatus.hotmart),
      help: "Configurar HOTMART_CLIENT_ID, HOTMART_CLIENT_SECRET e HOTMART_BASIC_AUTH (já documentado em infra/RENDER_DEPLOY.md).",
    },
    {
      label: "Shopee Afiliados",
      ok: Boolean(apiStatus.shopee),
      help: "Configurar SHOPEE_AFFILIATE_ID e SHOPEE_AFFILIATE_USERNAME (Nexus SaaS · @lucasthomaz2 · ID 18325891080).",
    },
  ];

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
            <p className="text-gray-600 mt-2">
              Gestão administrativa do regramento oficial Nexus SaaS · IOAID (Matriz Forçada · 5 Níveis).
            </p>
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
                  placeholder="Nexus SaaS · IOAID"
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
                  placeholder="suporte@nexus-saas.com.br"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Modelo de Rede
                  </label>
                  <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                    <ShieldCheck size={16} className="text-emerald-600" />
                    <span className="font-semibold">Matriz Forçada</span>
                    <span className="text-xs text-slate-500">(regramento oficial · Age.txt)</span>
                  </div>
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
                    onChange={(e) => setFormData({ ...formData, maxNetworkDepth: parseInt(e.target.value) || 5 })}
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Regramento oficial: <strong>5 níveis (Matriz Forçada)</strong>.
                  </p>
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

        {/* Commission Levels (regramento oficial) */}
        <Card className="p-6 bg-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <BookOpen size={18} className="text-blue-600" />
                Níveis de Comissionamento (Multilevel)
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Regramento oficial Nexus SaaS · IOAID conforme <code>docs/planning/Age.txt</code> · Clube de Vantagens · Revenda Multilevel.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleRestoreOfficial}>
              Restaurar regramento oficial
            </Button>
          </div>

          <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
            <p className="font-semibold">Sem percentual padrão</p>
            <p className="mt-1">
              Cada nível tem seu próprio percentual oficial. O sistema NÃO aplica um percentual genérico —
              os valores abaixo são lidos diretamente do regramento da plataforma.
            </p>
          </div>

          <div className="space-y-3">
            {commissionLevels.length > 0 ? (
              commissionLevels.map((level, index) => (
                <div key={level.level} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-[200px]">
                      <p className="font-semibold text-gray-900">{level.label || `Nível ${level.level}`}</p>
                      <p className="text-xs text-gray-600 mt-1">{level.description || "Sem descrição"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={level.percentage}
                        onChange={(e) => handleUpdateLevel(index, parseFloat(e.target.value) || 0)}
                        className="w-28"
                      />
                      <span className="text-gray-600 font-medium">%</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Carregando regramento oficial...</p>
              </div>
            )}
          </div>

          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
            <p className="font-semibold inline-flex items-center gap-2">
              <AlertTriangle size={14} />
              Atenção
            </p>
            <p className="mt-1">
              A alteração dos percentuais abaixo afeta diretamente o cálculo de comissões em toda a rede.
              Recomenda-se manter os valores oficiais e usar a função <strong>Restaurar regramento oficial</strong>
              em caso de dúvida.
            </p>
          </div>
        </Card>

        {/* API Keys */}
        <Card className="p-6 bg-white">
          <h3 className="text-lg font-semibold mb-2 text-gray-900">Configurações de API</h3>
          <p className="text-sm text-gray-600 mb-6">
            Status em tempo real das integrações do backend. Configurar via painel do provedor de hospedagem (Render → Environment).
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {apiStatusRows.map((row) => (
              <div key={row.label} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-700">{row.label}</p>
                  <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${row.ok ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
                    <span className={`h-2 w-2 rounded-full ${row.ok ? "bg-emerald-500" : "bg-red-500"}`}></span>
                    {row.ok ? "Configurada" : "Não configurada"}
                  </span>
                </div>
                <p className="mt-2 text-xs text-gray-500">{row.help}</p>
              </div>
            ))}
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
