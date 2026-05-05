import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Download, Edit2, Trash2, Eye, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Banner {
  id: number;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  downloadUrl: string;
  size: string;
  dimensions: string;
  downloads: number;
  status: "active" | "inactive" | "archived";
  createdAt: string;
  updatedAt: string;
}

interface BannerManagerProps {
  affiliateId?: number;
}

const bannerCategories = [
  { value: "promotional", label: "Promocional" },
  { value: "seasonal", label: "Sazonal" },
  { value: "product", label: "Produto" },
  { value: "event", label: "Evento" },
  { value: "social_media", label: "Redes Sociais" },
];

const bannerSizes = [
  { value: "728x90", label: "Leaderboard (728x90)" },
  { value: "300x250", label: "Medium Rectangle (300x250)" },
  { value: "160x600", label: "Wide Skyscraper (160x600)" },
  { value: "1200x628", label: "Social Media (1200x628)" },
  { value: "1920x1080", label: "Full HD (1920x1080)" },
];

export default function BannerManager({ affiliateId }: BannerManagerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "promotional",
    size: "1200x628",
    imageFile: null as File | null,
  });

  // Mock data
  const [banners, setBanners] = useState<Banner[]>([
    {
      id: 1,
      title: "Banner Black Friday 2024",
      description: "Promoção especial de Black Friday com descontos de até 70%",
      category: "promotional",
      imageUrl: "https://via.placeholder.com/1200x628?text=Black+Friday",
      downloadUrl: "https://example.com/banners/black-friday.zip",
      size: "2.4 MB",
      dimensions: "1200x628",
      downloads: 245,
      status: "active",
      createdAt: "2024-04-15",
      updatedAt: "2024-04-20",
    },
    {
      id: 2,
      title: "Banner Cyber Monday",
      description: "Ofertas exclusivas para Cyber Monday",
      category: "seasonal",
      imageUrl: "https://via.placeholder.com/1200x628?text=Cyber+Monday",
      downloadUrl: "https://example.com/banners/cyber-monday.zip",
      size: "1.8 MB",
      dimensions: "1200x628",
      downloads: 156,
      status: "active",
      createdAt: "2024-04-10",
      updatedAt: "2024-04-18",
    },
    {
      id: 3,
      title: "Banner Produto Novo",
      description: "Apresentação do novo produto da linha premium",
      category: "product",
      imageUrl: "https://via.placeholder.com/1200x628?text=Novo+Produto",
      downloadUrl: "https://example.com/banners/novo-produto.zip",
      size: "3.1 MB",
      dimensions: "1200x628",
      downloads: 89,
      status: "active",
      createdAt: "2024-04-08",
      updatedAt: "2024-04-19",
    },
    {
      id: 4,
      title: "Banner Evento Especial",
      description: "Convite para evento de lançamento exclusivo",
      category: "event",
      imageUrl: "https://via.placeholder.com/1200x628?text=Evento",
      downloadUrl: "https://example.com/banners/evento.zip",
      size: "2.7 MB",
      dimensions: "1200x628",
      downloads: 67,
      status: "inactive",
      createdAt: "2024-03-20",
      updatedAt: "2024-04-05",
    },
    {
      id: 5,
      title: "Banner Instagram Stories",
      description: "Banner otimizado para Stories do Instagram",
      category: "social_media",
      imageUrl: "https://via.placeholder.com/1080x1920?text=Instagram",
      downloadUrl: "https://example.com/banners/instagram.zip",
      size: "1.5 MB",
      dimensions: "1080x1920",
      downloads: 312,
      status: "active",
      createdAt: "2024-04-01",
      updatedAt: "2024-04-21",
    },
  ]);

  const handleCreateBanner = () => {
    if (!formData.title.trim()) {
      toast.error("Título é obrigatório");
      return;
    }
    if (!formData.imageFile) {
      toast.error("Selecione uma imagem");
      return;
    }

    toast.success("Banner criado com sucesso!");
    setIsCreating(false);
    setFormData({
      title: "",
      description: "",
      category: "promotional",
      size: "1200x628",
      imageFile: null,
    });
  };

  const handleDeleteBanner = (id: number) => {
    setBanners(banners.filter((b) => b.id !== id));
    toast.success("Banner deletado com sucesso");
  };

  const handleDownloadBanner = (banner: Banner) => {
    toast.success(`Iniciando download de ${banner.title}`);
    // In production, this would trigger actual download
  };

  const handleCopyLink = (banner: Banner) => {
    navigator.clipboard.writeText(banner.downloadUrl);
    toast.success("Link copiado para a área de transferência");
  };

  const filteredBanners = banners.filter((banner) => {
    const matchesSearch = banner.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      banner.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || banner.status === filterStatus;
    const matchesCategory = filterCategory === "all" || banner.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Gerenciador de Banners</h2>
          <p className="text-gray-600 mt-2">Gerencie seus banners promocionais e materiais visuais</p>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)} className="gap-2">
          <Plus size={20} />
          Novo Banner
        </Button>
      </div>

      {/* Create Form */}
      {isCreating && (
        <Card className="p-6 bg-blue-50 border-2 border-blue-200">
          <h3 className="text-lg font-semibold mb-6 text-gray-900">Criar Novo Banner</h3>
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
                placeholder="Descrição do banner"
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
                    {bannerCategories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tamanho
                </label>
                <Select value={formData.size} onValueChange={(value) =>
                  setFormData({ ...formData, size: value })
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {bannerSizes.map((size) => (
                      <SelectItem key={size.value} value={size.value}>
                        {size.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imagem *
              </label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setFormData({ ...formData, imageFile: e.target.files?.[0] || null })
                }
              />
              {formData.imageFile && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ {formData.imageFile.name}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleCreateBanner}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Criar Banner
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsCreating(false);
                  setFormData({
                    title: "",
                    description: "",
                    category: "promotional",
                    size: "1200x628",
                    imageFile: null,
                  });
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <Input
          placeholder="Pesquisar banners..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 min-w-[200px]"
        />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="inactive">Inativo</SelectItem>
            <SelectItem value="archived">Arquivado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Categorias</SelectItem>
            {bannerCategories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Banners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBanners.length > 0 ? (
          filteredBanners.map((banner) => (
            <Card key={banner.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="w-full h-40 object-cover"
                />
                <Badge
                  className={`absolute top-2 right-2 ${
                    banner.status === "active"
                      ? "bg-green-500"
                      : banner.status === "inactive"
                      ? "bg-gray-500"
                      : "bg-yellow-500"
                  }`}
                >
                  {banner.status === "active"
                    ? "Ativo"
                    : banner.status === "inactive"
                    ? "Inativo"
                    : "Arquivado"}
                </Badge>
              </div>

              <CardHeader className="pb-3">
                <CardTitle className="text-lg line-clamp-2">{banner.title}</CardTitle>
                <p className="text-sm text-gray-600 line-clamp-2">{banner.description}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Categoria:</span>
                    <span className="font-medium">
                      {bannerCategories.find((c) => c.value === banner.category)?.label}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dimensões:</span>
                    <span className="font-medium">{banner.dimensions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tamanho:</span>
                    <span className="font-medium">{banner.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Downloads:</span>
                    <span className="font-medium text-blue-600">{banner.downloads}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setSelectedBanner(banner)}
                  >
                    <Eye size={16} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDownloadBanner(banner)}
                  >
                    <Download size={16} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleCopyLink(banner)}
                  >
                    <Copy size={16} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteBanner(banner.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-3 text-center py-12">
            <p className="text-gray-500 mb-4">Nenhum banner encontrado</p>
            <Button onClick={() => setIsCreating(true)}>Criar Primeiro Banner</Button>
          </div>
        )}
      </div>

      {/* Banner Preview */}
      {selectedBanner && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Visualizar Banner</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedBanner(null)}
              >
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <img
              src={selectedBanner.imageUrl}
              alt={selectedBanner.title}
              className="w-full rounded-lg border"
            />
            <div className="space-y-2">
              <h3 className="font-bold text-lg">{selectedBanner.title}</h3>
              <p className="text-gray-600">{selectedBanner.description}</p>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <p className="text-sm text-gray-600">Criado em</p>
                  <p className="font-medium">
                    {new Date(selectedBanner.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Atualizado em</p>
                  <p className="font-medium">
                    {new Date(selectedBanner.updatedAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={() => handleDownloadBanner(selectedBanner)}
              >
                <Download size={16} className="mr-2" />
                Baixar Banner
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleCopyLink(selectedBanner)}
              >
                <Copy size={16} className="mr-2" />
                Copiar Link
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
