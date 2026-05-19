import AdminDashboardLayout from "@/pages/AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Plus, Download, Edit2, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const materialTypes = [
  { value: "banner", label: "Banner" },
  { value: "text", label: "Texto" },
  { value: "link", label: "Link" },
  { value: "video", label: "Vídeo" },
  { value: "image", label: "Imagem" },
  { value: "document", label: "Documento" },
];

const categories = [
  { value: "promotional", label: "Promocional" },
  { value: "educational", label: "Educacional" },
  { value: "social_media", label: "Redes Sociais" },
  { value: "email", label: "Email" },
  { value: "landing_page", label: "Landing Page" },
];

export default function AdminMaterials() {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("active");
  const [selectedMaterialId, setSelectedMaterialId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "promotional",
    type: "banner" as any,
    url: "",
  });

  const { data: materials, isLoading, refetch } = trpc.materials.list.useQuery({
    limit: 50,
    offset: 0,
  });

  const createMutation = trpc.materials.create.useMutation({
    onSuccess: () => {
      toast.success("Material criado com sucesso");
      refetch();
      setIsCreating(false);
      setFormData({ title: "", description: "", category: "promotional", type: "banner", url: "" });
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar material");
    },
  });

  const updateStatusMutation = trpc.materials.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status do material atualizado com sucesso");
      refetch();
      setSelectedMaterialId(null);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar status");
    },
  });

  const handleCreateMaterial = () => {
    if (!formData.title.trim()) {
      toast.error("Título é obrigatório");
      return;
    }
    createMutation.mutate({
      title: formData.title,
      description: formData.description,
      category: formData.category,
      type: formData.type,
      url: formData.url || undefined,
    });
  };

  const handleUpdateStatus = () => {
    if (selectedMaterialId) {
      updateStatusMutation.mutate({
        materialId: selectedMaterialId,
        status: selectedStatus as any,
      });
    }
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      banner: "🖼️",
      text: "📝",
      link: "🔗",
      video: "🎥",
      image: "🖼️",
      document: "📄",
    };
    return icons[type] || "📦";
  };

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gerenciador de Materiais</h1>
            <p className="text-gray-600 mt-2">Gerencie banners, textos, links e outros materiais de divulgação</p>
          </div>
          <Button onClick={() => setIsCreating(!isCreating)}>
            <Plus size={20} />
            Novo Material
          </Button>
        </div>

        {/* Create Form */}
        {isCreating && (
          <Card className="p-6 bg-white border-2 border-blue-200">
            <h3 className="text-lg font-semibold mb-6 text-gray-900">Criar Novo Material</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título *
                </label>
                <Input
                  placeholder="Ex: Banner Black Friday 2024"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <Input
                  placeholder="Descrição do material"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria
                  </label>
                  <Select value={formData.category} onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo
                  </label>
                  <Select value={formData.type} onValueChange={(value: any) =>
                    setFormData({ ...formData, type: value })
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {materialTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL (opcional)
                </label>
                <Input
                  placeholder="https://exemplo.com/material"
                  value={formData.url}
                  onChange={(e) =>
                    setFormData({ ...formData, url: e.target.value })
                  }
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleCreateMaterial}
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? "Criando..." : "Criar Material"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false);
                    setFormData({ title: "", description: "", category: "promotional", type: "banner", url: "" });
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Materials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            [1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))
          ) : materials && materials.length > 0 ? (
            materials.map((material) => (
              <Card key={material.id} className="p-6 bg-white hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-3xl">{getTypeIcon(material.type)}</div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    material.status === "active"
                      ? "bg-green-100 text-green-800"
                      : material.status === "inactive"
                      ? "bg-gray-100 text-gray-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {material.status === "active"
                      ? "Ativo"
                      : material.status === "inactive"
                      ? "Inativo"
                      : "Arquivado"}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{material.title}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{material.description}</p>
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Categoria:</span>
                    <span className="font-medium text-gray-900">{material.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Downloads:</span>
                    <span className="font-medium text-gray-900">{material.downloadCount}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setSelectedMaterialId(material.id);
                      setSelectedStatus(material.status);
                    }}
                  >
                    <Edit2 size={16} />
                  </Button>
                  {material.url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => material.url && window.open(material.url, "_blank")}
                    >
                      <Download size={16} />
                    </Button>
                  )}
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-3 text-center py-12">
              <p className="text-gray-500 mb-4">Nenhum material encontrado</p>
              <Button onClick={() => setIsCreating(true)}>Criar Primeiro Material</Button>
            </div>
          )}
        </div>

        {/* Edit Status Modal */}
        {selectedMaterialId && (
          <Card className="p-6 bg-white border-2 border-blue-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Atualizar Status do Material</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Novo Status
                </label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                    <SelectItem value="archived">Arquivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleUpdateStatus}
                  disabled={updateStatusMutation.isPending}
                >
                  {updateStatusMutation.isPending ? "Atualizando..." : "Atualizar"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedMaterialId(null)}
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
