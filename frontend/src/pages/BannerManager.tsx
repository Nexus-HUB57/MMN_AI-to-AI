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
import { Plus, Download, Edit2, Trash2, Eye, Copy, Image as ImageIcon, Zap } from "lucide-react";
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
  };

  const handleCopyLink = (banner: Banner) => {
    navigator.clipboard.writeText(banner.downloadUrl);
    toast.success("Link copiado para a área de transferência");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400 border border-green-500/30";
      case "inactive":
        return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
      case "archived":
        return "bg-red-500/20 text-red-400 border border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "promotional":
        return "bg-neon-pink/20 text-neon-pink border border-neon-pink/30";
      case "seasonal":
        return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
      case "product":
        return "bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30";
      case "event":
        return "bg-purple-500/20 text-purple-400 border border-purple-500/30";
      case "social_media":
        return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
    }
  };

  const filteredBanners = banners.filter((banner) => {
    const matchesSearch = banner.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      banner.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || banner.status === filterStatus;
    const matchesCategory = filterCategory === "all" || banner.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-orbitron font-bold text-glow-pink">
            Gerenciador de Banners
          </h1>
          <p className="text-neon-cyan font-space-mono mt-2">
            Gerencie seus banners promocionais e materiais visuais
          </p>
        </div>
        <Button
          onClick={() => setIsCreating(!isCreating)}
          className="gap-2 btn-neon-cyan font-orbitron"
        >
          <Plus size={20} />
          Novo Banner
        </Button>
      </div>

      {/* Create Form */}
      {isCreating && (
        <Card className="hud-frame bg-black/40 border-neon-cyan/30 p-6">
          <div className="corner-bracket top-left"></div>
          <div className="corner-bracket top-right"></div>
          <div className="corner-bracket bottom-left"></div>
          <div className="corner-bracket bottom-right"></div>

          <h3 className="text-xl font-orbitron text-neon-pink mb-6">
            Criar Novo Banner
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-space-mono text-neon-cyan mb-2">
                Título *
              </label>
              <Input
                placeholder="Ex: Banner Black Friday 2024"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="bg-black/60 border-neon-cyan/30 text-white placeholder:text-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-space-mono text-neon-cyan mb-2">
                Descrição
              </label>
              <Input
                placeholder="Descrição do banner"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="bg-black/60 border-neon-cyan/30 text-white placeholder:text-gray-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-space-mono text-neon-cyan mb-2">
                  Categoria
                </label>
                <Select value={formData.category} onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }>
                  <SelectTrigger className="bg-black/60 border-neon-cyan/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black/80 border-neon-cyan/30">
                    {bannerCategories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value} className="text-white">
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-space-mono text-neon-cyan mb-2">
                  Tamanho
                </label>
                <Select value={formData.size} onValueChange={(value) =>
                  setFormData({ ...formData, size: value })
                }>
                  <SelectTrigger className="bg-black/60 border-neon-cyan/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black/80 border-neon-cyan/30">
                    {bannerSizes.map((size) => (
                      <SelectItem key={size.value} value={size.value} className="text-white">
                        {size.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-space-mono text-neon-cyan mb-2">
                Imagem *
              </label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setFormData({ ...formData, imageFile: e.target.files?.[0] || null })
                }
                className="bg-black/60 border-neon-cyan/30 text-white"
              />
              {formData.imageFile && (
                <p className="text-sm text-green-400 mt-2 font-space-mono">
                  ✓ {formData.imageFile.name}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleCreateBanner}
                className="flex-1 btn-neon-cyan font-orbitron"
              >
                Criar Banner
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-neon-cyan/30 text-neon-cyan font-orbitron"
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-space-mono text-neon-cyan mb-2">
            Buscar
          </label>
          <Input
            placeholder="Buscar banners..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-black/60 border-neon-cyan/30 text-white placeholder:text-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm font-space-mono text-neon-cyan mb-2">
            Status
          </label>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="bg-black/60 border-neon-cyan/30 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-black/80 border-neon-cyan/30">
              <SelectItem value="all" className="text-white">Todos</SelectItem>
              <SelectItem value="active" className="text-white">Ativo</SelectItem>
              <SelectItem value="inactive" className="text-white">Inativo</SelectItem>
              <SelectItem value="archived" className="text-white">Arquivado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-space-mono text-neon-cyan mb-2">
            Categoria
          </label>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="bg-black/60 border-neon-cyan/30 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-black/80 border-neon-cyan/30">
              <SelectItem value="all" className="text-white">Todas</SelectItem>
              {bannerCategories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value} className="text-white">
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Banners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBanners.length > 0 ? (
          filteredBanners.map((banner) => (
            <Card
              key={banner.id}
              className="hud-frame bg-black/40 border-neon-cyan/30 overflow-hidden hover:border-neon-cyan/60 transition-all cursor-pointer"
              onClick={() => setSelectedBanner(banner)}
            >
              <div className="corner-bracket top-left"></div>
              <div className="corner-bracket top-right"></div>
              <div className="corner-bracket bottom-left"></div>
              <div className="corner-bracket bottom-right"></div>

              {/* Preview */}
              <div className="relative h-40 bg-black/60 border-b border-neon-cyan/20 overflow-hidden">
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="w-full h-full object-cover opacity-70 hover:opacity-100 transition-opacity"
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  <Badge className={getStatusColor(banner.status)}>
                    {banner.status === "active" ? "Ativo" : banner.status === "inactive" ? "Inativo" : "Arquivado"}
                  </Badge>
                </div>
              </div>

              <CardContent className="pt-4 space-y-3">
                <div>
                  <h3 className="font-orbitron text-neon-pink font-bold truncate">
                    {banner.title}
                  </h3>
                  <p className="text-xs text-text-secondary font-space-mono truncate">
                    {banner.description}
                  </p>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Badge className={getCategoryColor(banner.category)}>
                    {bannerCategories.find((c) => c.value === banner.category)?.label}
                  </Badge>
                  <Badge className="bg-black/60 text-neon-cyan border border-neon-cyan/30">
                    {banner.dimensions}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-space-mono text-text-secondary">
                  <div>
                    <p className="text-gray-600">Tamanho</p>
                    <p className="text-neon-cyan">{banner.size}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Downloads</p>
                    <p className="text-neon-pink">{banner.downloads}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-neon-cyan/20">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadBanner(banner);
                    }}
                  >
                    <Download size={14} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyLink(banner);
                    }}
                  >
                    <Copy size={14} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteBanner(banner.id);
                    }}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <ImageIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-text-secondary font-space-mono mb-4">Nenhum banner encontrado</p>
            <Button onClick={() => setIsCreating(true)} className="btn-neon-cyan font-orbitron">
              Criar Primeiro Banner
            </Button>
          </div>
        )}
      </div>

      {/* Banner Details Modal */}
      {selectedBanner && (
        <Card className="fixed inset-0 z-50 m-4 max-w-2xl mx-auto my-auto hud-frame bg-black/95 border-neon-cyan/30">
          <div className="corner-bracket top-left"></div>
          <div className="corner-bracket top-right"></div>
          <div className="corner-bracket bottom-left"></div>
          <div className="corner-bracket bottom-right"></div>

          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-neon-pink font-orbitron">
              {selectedBanner.title}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedBanner(null)}
              className="text-neon-cyan border-neon-cyan/30"
            >
              ✕
            </Button>
          </CardHeader>

          <CardContent className="space-y-4">
            <img
              src={selectedBanner.imageUrl}
              alt={selectedBanner.title}
              className="w-full rounded border border-neon-cyan/20 max-h-96 object-cover"
            />

            <p className="text-text-secondary font-space-mono">
              {selectedBanner.description}
            </p>

            <div className="grid grid-cols-2 gap-4 p-4 bg-black/60 rounded border border-neon-cyan/20">
              <div>
                <p className="text-xs text-text-secondary uppercase font-space-mono mb-1">
                  Categoria
                </p>
                <Badge className={getCategoryColor(selectedBanner.category)}>
                  {bannerCategories.find((c) => c.value === selectedBanner.category)?.label}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-text-secondary uppercase font-space-mono mb-1">
                  Status
                </p>
                <Badge className={getStatusColor(selectedBanner.status)}>
                  {selectedBanner.status === "active" ? "Ativo" : selectedBanner.status === "inactive" ? "Inativo" : "Arquivado"}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-text-secondary uppercase font-space-mono mb-1">
                  Dimensões
                </p>
                <p className="font-bold text-neon-cyan font-orbitron">{selectedBanner.dimensions}</p>
              </div>
              <div>
                <p className="text-xs text-text-secondary uppercase font-space-mono mb-1">
                  Tamanho
                </p>
                <p className="font-bold text-neon-pink font-orbitron">{selectedBanner.size}</p>
              </div>
              <div>
                <p className="text-xs text-text-secondary uppercase font-space-mono mb-1">
                  Downloads
                </p>
                <p className="font-bold text-yellow-500 font-orbitron">{selectedBanner.downloads}</p>
              </div>
              <div>
                <p className="text-xs text-text-secondary uppercase font-space-mono mb-1">
                  Atualizado
                </p>
                <p className="font-bold text-green-500 font-orbitron">
                  {new Date(selectedBanner.updatedAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-neon-cyan/20">
              <Button
                className="flex-1 btn-neon-cyan font-orbitron text-sm"
                onClick={() => handleDownloadBanner(selectedBanner)}
              >
                <Download size={16} className="mr-2" />
                Baixar Banner
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-neon-cyan/30 text-neon-cyan font-orbitron text-sm"
                onClick={() => handleCopyLink(selectedBanner)}
              >
                <Copy size={16} className="mr-2" />
                Copiar Link
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-neon-cyan/30 text-neon-cyan font-orbitron text-sm"
                onClick={() => setSelectedBanner(null)}
              >
                Fechar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
