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
import { Download, Eye, Share2, Copy, FileText, Image, Video, Link as LinkIcon, TrendingUp, Grid3x3, List, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Material {
  id: number;
  title: string;
  description: string;
  category: string;
  type: "banner" | "text" | "link" | "video" | "image" | "document";
  url: string;
  fileSize?: string;
  downloadCount: number;
  status: "active" | "inactive" | "archived";
  createdAt: string;
  thumbnail?: string;
}

interface MarketingMaterialsProps {
  affiliateId?: number;
}

const materialTypes = [
  { value: "banner", label: "Banner", icon: <Image className="w-4 h-4" /> },
  { value: "text", label: "Texto", icon: <FileText className="w-4 h-4" /> },
  { value: "link", label: "Link", icon: <LinkIcon className="w-4 h-4" /> },
  { value: "video", label: "Vídeo", icon: <Video className="w-4 h-4" /> },
  { value: "image", label: "Imagem", icon: <Image className="w-4 h-4" /> },
  { value: "document", label: "Documento", icon: <FileText className="w-4 h-4" /> },
];

const categories = [
  { value: "promotional", label: "Promocional" },
  { value: "educational", label: "Educacional" },
  { value: "social_media", label: "Redes Sociais" },
  { value: "email", label: "Email" },
  { value: "landing_page", label: "Landing Page" },
];

export default function MarketingMaterials({ affiliateId }: MarketingMaterialsProps) {
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Mock data
  const [materials, setMaterials] = useState<Material[]>([
    {
      id: 1,
      title: "Banner Black Friday - 1200x628",
      description: "Banner promocional para Black Friday com design moderno e chamativo",
      category: "promotional",
      type: "banner",
      url: "https://example.com/materials/banner-black-friday.zip",
      fileSize: "2.4 MB",
      downloadCount: 245,
      status: "active",
      createdAt: "2024-04-15",
      thumbnail: "https://via.placeholder.com/400x300?text=Black+Friday",
    },
    {
      id: 2,
      title: "Texto de Vendas - Produto Premium",
      description: "Copywriting otimizado para venda de produtos premium com técnicas de persuasão",
      category: "promotional",
      type: "text",
      url: "https://example.com/materials/texto-vendas.docx",
      fileSize: "0.8 MB",
      downloadCount: 156,
      status: "active",
      createdAt: "2024-04-10",
    },
    {
      id: 3,
      title: "Link de Afiliado - Rastreável",
      description: "Link de afiliado único com rastreamento automático de conversões",
      category: "promotional",
      type: "link",
      url: "https://example.com/aff/seu-codigo-aqui",
      downloadCount: 89,
      status: "active",
      createdAt: "2024-04-08",
    },
    {
      id: 4,
      title: "Vídeo de Apresentação - 60 segundos",
      description: "Vídeo curto para apresentação do produto em redes sociais",
      category: "social_media",
      type: "video",
      url: "https://example.com/materials/video-apresentacao.mp4",
      fileSize: "45.2 MB",
      downloadCount: 67,
      status: "active",
      createdAt: "2024-03-20",
      thumbnail: "https://via.placeholder.com/400x300?text=Video",
    },
    {
      id: 5,
      title: "Imagem de Produto - Alta Resolução",
      description: "Imagem do produto em alta resolução para uso em anúncios e redes sociais",
      category: "promotional",
      type: "image",
      url: "https://example.com/materials/produto-hd.png",
      fileSize: "8.7 MB",
      downloadCount: 312,
      status: "active",
      createdAt: "2024-04-01",
      thumbnail: "https://via.placeholder.com/400x300?text=Produto",
    },
    {
      id: 6,
      title: "Guia de Email Marketing",
      description: "Documento completo com estratégias de email marketing para afiliados",
      category: "educational",
      type: "document",
      url: "https://example.com/materials/email-marketing.pdf",
      fileSize: "3.2 MB",
      downloadCount: 198,
      status: "active",
      createdAt: "2024-03-25",
      thumbnail: "https://via.placeholder.com/400x300?text=Email",
    },
    {
      id: 7,
      title: "Template Landing Page",
      description: "Template HTML/CSS pronto para usar em landing pages",
      category: "landing_page",
      type: "document",
      url: "https://example.com/materials/landing-template.zip",
      fileSize: "5.1 MB",
      downloadCount: 134,
      status: "active",
      createdAt: "2024-04-05",
    },
    {
      id: 8,
      title: "Post Instagram - Carrossel",
      description: "Template de carrossel para Instagram com 5 slides otimizados",
      category: "social_media",
      type: "image",
      url: "https://example.com/materials/instagram-carousel.zip",
      fileSize: "12.5 MB",
      downloadCount: 203,
      status: "active",
      createdAt: "2024-04-12",
      thumbnail: "https://via.placeholder.com/400x300?text=Instagram",
    },
  ]);

  const getTypeLabel = (type: string) => {
    return materialTypes.find((t) => t.value === type)?.label || type;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "banner":
        return <Image className="w-4 h-4" />;
      case "text":
        return <FileText className="w-4 h-4" />;
      case "link":
        return <LinkIcon className="w-4 h-4" />;
      case "video":
        return <Video className="w-4 h-4" />;
      case "image":
        return <Image className="w-4 h-4" />;
      case "document":
        return <FileText className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    return categories.find((c) => c.value === category)?.label || category;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "banner":
        return "bg-neon-pink/20 text-neon-pink border border-neon-pink/30";
      case "text":
        return "bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30";
      case "link":
        return "bg-purple-500/20 text-purple-400 border border-purple-500/30";
      case "video":
        return "bg-red-500/20 text-red-400 border border-red-500/30";
      case "image":
        return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
      case "document":
        return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "promotional":
        return "bg-neon-pink/20 text-neon-pink border border-neon-pink/30";
      case "educational":
        return "bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30";
      case "social_media":
        return "bg-purple-500/20 text-purple-400 border border-purple-500/30";
      case "email":
        return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
      case "landing_page":
        return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
    }
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

  const handleDownloadMaterial = (material: Material) => {
    toast.success(`Iniciando download de ${material.title}`);
  };

  const handleCopyLink = (material: Material) => {
    navigator.clipboard.writeText(material.url);
    toast.success("Link copiado para a área de transferência");
  };

  const handleShareMaterial = (material: Material) => {
    toast.success(`Compartilhando ${material.title}`);
  };

  const filteredMaterials = materials.filter((material) => {
    const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || material.type === filterType;
    const matchesCategory = filterCategory === "all" || material.category === filterCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  const topDownloads = [...materials]
    .sort((a, b) => b.downloadCount - a.downloadCount)
    .slice(0, 5);

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-orbitron font-bold text-glow-pink">
            Materiais de Divulgação
          </h1>
          <p className="text-neon-cyan font-space-mono mt-2">
            Acesse banners, textos, vídeos e outros materiais para promover seus produtos
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className={viewMode === "grid" ? "btn-neon-cyan" : "border-neon-cyan/30 text-neon-cyan"}
          >
            <Grid3x3 size={16} />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
            className={viewMode === "list" ? "btn-neon-cyan" : "border-neon-cyan/30 text-neon-cyan"}
          >
            <List size={16} />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-space-mono text-neon-cyan mb-2">
            Buscar
          </label>
          <Input
            placeholder="Buscar materiais..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-black/60 border-neon-cyan/30 text-white placeholder:text-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm font-space-mono text-neon-cyan mb-2">
            Tipo
          </label>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="bg-black/60 border-neon-cyan/30 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-black/80 border-neon-cyan/30">
              <SelectItem value="all" className="text-white">Todos</SelectItem>
              {materialTypes.map((type) => (
                <SelectItem key={type.value} value={type.value} className="text-white">
                  {type.label}
                </SelectItem>
              ))}
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
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value} className="text-white">
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Button
            onClick={() => {
              setFilterType("all");
              setFilterCategory("all");
              setSearchTerm("");
            }}
            variant="outline"
            className="w-full border-neon-cyan/30 text-neon-cyan font-orbitron"
          >
            Limpar Filtros
          </Button>
        </div>
      </div>

      {/* Materials Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.length > 0 ? (
            filteredMaterials.map((material) => (
              <Card
                key={material.id}
                className="hud-frame bg-black/40 border-neon-cyan/30 overflow-hidden hover:border-neon-cyan/60 transition-all cursor-pointer"
                onClick={() => setSelectedMaterial(material)}
              >
                <div className="corner-bracket top-left"></div>
                <div className="corner-bracket top-right"></div>
                <div className="corner-bracket bottom-left"></div>
                <div className="corner-bracket bottom-right"></div>

                {/* Thumbnail */}
                {material.thumbnail && (
                  <div className="relative h-40 bg-black/60 border-b border-neon-cyan/20 overflow-hidden">
                    <img
                      src={material.thumbnail}
                      alt={material.title}
                      className="w-full h-full object-cover opacity-70 hover:opacity-100 transition-opacity"
                    />
                  </div>
                )}

                <CardContent className={`${material.thumbnail ? "pt-4" : "pt-6"} space-y-3`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="font-orbitron text-neon-pink font-bold truncate">
                        {material.title}
                      </h3>
                      <p className="text-xs text-text-secondary font-space-mono truncate">
                        {material.description}
                      </p>
                    </div>
                    <div className="p-2 bg-black/60 rounded border border-neon-cyan/20">
                      {getTypeIcon(material.type)}
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Badge className={getTypeColor(material.type)}>
                      {getTypeLabel(material.type)}
                    </Badge>
                    <Badge className={getCategoryColor(material.category)}>
                      {getCategoryLabel(material.category)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-space-mono text-text-secondary">
                    {material.fileSize && (
                      <div>
                        <p className="text-gray-600">Tamanho</p>
                        <p className="text-neon-cyan">{material.fileSize}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-gray-600">Downloads</p>
                      <p className="text-neon-pink">{material.downloadCount}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-neon-cyan/20">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadMaterial(material);
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
                        handleCopyLink(material);
                      }}
                    >
                      <Copy size={14} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShareMaterial(material);
                      }}
                    >
                      <Share2 size={14} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-text-secondary font-space-mono">Nenhum material encontrado</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMaterials.length > 0 ? (
            filteredMaterials.map((material) => (
              <Card
                key={material.id}
                className="hud-frame bg-black/40 border-neon-cyan/30 hover:border-neon-cyan/60 transition-all cursor-pointer"
                onClick={() => setSelectedMaterial(material)}
              >
                <CardContent className="pt-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-black/60 rounded border border-neon-cyan/20">
                      {getTypeIcon(material.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-orbitron text-neon-pink font-bold truncate">
                        {material.title}
                      </h3>
                      <p className="text-xs text-text-secondary font-space-mono truncate">
                        {material.description}
                      </p>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <Badge className={getTypeColor(material.type)}>
                          {getTypeLabel(material.type)}
                        </Badge>
                        <Badge className={getCategoryColor(material.category)}>
                          {getCategoryLabel(material.category)}
                        </Badge>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-neon-pink font-orbitron">
                        {material.downloadCount} downloads
                      </p>
                      {material.fileSize && (
                        <p className="text-xs text-text-secondary font-space-mono">
                          {material.fileSize}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadMaterial(material);
                        }}
                      >
                        <Download size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyLink(material);
                        }}
                      >
                        <Copy size={14} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-text-secondary font-space-mono">Nenhum material encontrado</p>
            </div>
          )}
        </div>
      )}

      {/* Material Details Modal */}
      {selectedMaterial && (
        <Card className="fixed inset-0 z-50 m-4 max-w-2xl mx-auto my-auto hud-frame bg-black/95 border-neon-cyan/30">
          <div className="corner-bracket top-left"></div>
          <div className="corner-bracket top-right"></div>
          <div className="corner-bracket bottom-left"></div>
          <div className="corner-bracket bottom-right"></div>

          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-black/60 rounded-lg border border-neon-cyan/20">
                {getTypeIcon(selectedMaterial.type)}
              </div>
              <div>
                <CardTitle className="text-neon-pink font-orbitron">
                  {selectedMaterial.title}
                </CardTitle>
                <p className="text-sm text-text-secondary font-space-mono">
                  {getCategoryLabel(selectedMaterial.category)}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedMaterial(null)}
              className="text-neon-cyan border-neon-cyan/30"
            >
              ✕
            </Button>
          </CardHeader>

          <CardContent className="space-y-4">
            {selectedMaterial.thumbnail && (
              <img
                src={selectedMaterial.thumbnail}
                alt={selectedMaterial.title}
                className="w-full rounded border border-neon-cyan/20 max-h-96 object-cover"
              />
            )}

            <p className="text-text-secondary font-space-mono">
              {selectedMaterial.description}
            </p>

            <div className="grid grid-cols-2 gap-4 p-4 bg-black/60 rounded border border-neon-cyan/20">
              <div>
                <p className="text-xs text-text-secondary uppercase font-space-mono mb-1">
                  Tipo
                </p>
                <Badge className={getTypeColor(selectedMaterial.type)}>
                  {getTypeLabel(selectedMaterial.type)}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-text-secondary uppercase font-space-mono mb-1">
                  Categoria
                </p>
                <Badge className={getCategoryColor(selectedMaterial.category)}>
                  {getCategoryLabel(selectedMaterial.category)}
                </Badge>
              </div>
              {selectedMaterial.fileSize && (
                <div>
                  <p className="text-xs text-text-secondary uppercase font-space-mono mb-1">
                    Tamanho
                  </p>
                  <p className="font-bold text-neon-cyan font-orbitron">{selectedMaterial.fileSize}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-text-secondary uppercase font-space-mono mb-1">
                  Downloads
                </p>
                <p className="font-bold text-neon-pink font-orbitron">{selectedMaterial.downloadCount}</p>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-neon-cyan/20">
              <Button
                className="flex-1 btn-neon-cyan font-orbitron text-sm"
                onClick={() => handleDownloadMaterial(selectedMaterial)}
              >
                <Download size={16} className="mr-2" />
                Baixar Material
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-neon-cyan/30 text-neon-cyan font-orbitron text-sm"
                onClick={() => handleCopyLink(selectedMaterial)}
              >
                <Copy size={16} className="mr-2" />
                Copiar Link
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-neon-cyan/30 text-neon-cyan font-orbitron text-sm"
                onClick={() => handleShareMaterial(selectedMaterial)}
              >
                <Share2 size={16} className="mr-2" />
                Compartilhar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Downloads Section */}
      <Card className="hud-frame bg-black/40 border-neon-cyan/30">
        <div className="corner-bracket top-left"></div>
        <div className="corner-bracket top-right"></div>
        <div className="corner-bracket bottom-left"></div>
        <div className="corner-bracket bottom-right"></div>

        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-neon-cyan font-orbitron">
            <TrendingUp className="w-5 h-5 text-yellow-500" />
            Materiais Mais Baixados
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {topDownloads.map((material, index) => (
              <div
                key={material.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-neon-cyan/20 hover:border-neon-cyan/60 hover:bg-black/50 transition-all"
              >
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center font-bold">
                  {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-orbitron text-neon-pink text-sm truncate">{material.title}</p>
                  <p className="text-xs text-text-secondary font-space-mono">{getTypeLabel(material.type)}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-neon-cyan font-orbitron text-sm">{material.downloadCount}</p>
                  <p className="text-xs text-text-secondary font-space-mono">downloads</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
