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
import { Download, Eye, Share2, Copy, FileText, Image, Video, Link as LinkIcon, TrendingUp } from "lucide-react";
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
      url: "https://example.com/materials/instagram-carousel.psd",
      fileSize: "12.4 MB",
      downloadCount: 223,
      status: "active",
      createdAt: "2024-04-12",
      thumbnail: "https://via.placeholder.com/400x300?text=Instagram",
    },
  ]);

  const handleDownloadMaterial = (material: Material) => {
    toast.success(`Iniciando download de ${material.title}`);
    // In production, this would trigger actual download
  };

  const handleCopyLink = (material: Material) => {
    navigator.clipboard.writeText(material.url);
    toast.success("Link copiado para a área de transferência");
  };

  const handleShareMaterial = (material: Material) => {
    toast.success(`Compartilhando ${material.title}`);
    // In production, this would open share options
  };

  const getTypeIcon = (type: string) => {
    const typeObj = materialTypes.find((t) => t.value === type);
    return typeObj?.icon || <FileText className="w-4 h-4" />;
  };

  const getTypeLabel = (type: string) => {
    const typeObj = materialTypes.find((t) => t.value === type);
    return typeObj?.label || "Arquivo";
  };

  const getCategoryLabel = (category: string) => {
    const cat = categories.find((c) => c.value === category);
    return cat?.label || category;
  };

  const filteredMaterials = materials.filter((material) => {
    const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || material.type === filterType;
    const matchesCategory = filterCategory === "all" || material.category === filterCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  const topDownloads = [...materials].sort((a, b) => b.downloadCount - a.downloadCount).slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Materiais de Divulgação</h2>
        <p className="text-gray-600 mt-2">Acesse e baixe todos os materiais disponíveis para sua estratégia de marketing</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Total de Materiais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{materials.length}</div>
            <p className="text-xs text-blue-700 mt-1">Disponíveis para download</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Downloads Totais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {materials.reduce((sum, m) => sum + m.downloadCount, 0).toLocaleString()}
            </div>
            <p className="text-xs text-green-700 mt-1">De todos os materiais</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">Tipos de Materiais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {new Set(materials.map((m) => m.type)).size}
            </div>
            <p className="text-xs text-purple-700 mt-1">Diferentes formatos</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-900">Mais Baixado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {topDownloads[0]?.downloadCount || 0}
            </div>
            <p className="text-xs text-orange-700 mt-1">Downloads do top material</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="space-y-4">
        <div className="flex gap-4 flex-wrap items-center">
          <Input
            placeholder="Pesquisar materiais..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-[200px]"
          />
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Tipos</SelectItem>
              {materialTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Categorias</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2 border rounded-lg p-1">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              Grid
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              Lista
            </Button>
          </div>
        </div>
      </div>

      {/* Materials Display */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.length > 0 ? (
            filteredMaterials.map((material) => (
              <Card
                key={material.id}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedMaterial(material)}
              >
                {material.thumbnail && (
                  <div className="relative h-40 bg-gray-200">
                    <img
                      src={material.thumbnail}
                      alt={material.title}
                      className="w-full h-full object-cover"
                    />
                    <Badge className="absolute top-2 right-2 bg-blue-500">
                      {getTypeLabel(material.type)}
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-2">
                  <div className="flex items-start gap-2">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {getTypeIcon(material.type)}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base line-clamp-2">{material.title}</CardTitle>
                      <Badge variant="outline" className="mt-1">
                        {getCategoryLabel(material.category)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600 line-clamp-2">{material.description}</p>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      {material.downloadCount} downloads
                    </span>
                    {material.fileSize && <span>{material.fileSize}</span>}
                  </div>

                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadMaterial(material);
                      }}
                    >
                      <Download size={16} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyLink(material);
                      }}
                    >
                      <Copy size={16} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShareMaterial(material);
                      }}
                    >
                      <Share2 size={16} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-3 text-center py-12">
              <p className="text-gray-500 mb-4">Nenhum material encontrado</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMaterials.length > 0 ? (
            filteredMaterials.map((material) => (
              <Card
                key={material.id}
                className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedMaterial(material)}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    {getTypeIcon(material.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">{material.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-1">{material.description}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {getTypeLabel(material.type)}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {getCategoryLabel(material.category)}
                      </Badge>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-medium text-gray-900">
                      {material.downloadCount}
                    </div>
                    <div className="text-xs text-gray-600">downloads</div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadMaterial(material);
                      }}
                    >
                      <Download size={16} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyLink(material);
                      }}
                    >
                      <Copy size={16} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhum material encontrado</p>
            </div>
          )}
        </div>
      )}

      {/* Material Details Modal */}
      {selectedMaterial && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  {getTypeIcon(selectedMaterial.type)}
                </div>
                <div>
                  <CardTitle>{selectedMaterial.title}</CardTitle>
                  <p className="text-sm text-gray-600">{getCategoryLabel(selectedMaterial.category)}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedMaterial(null)}
              >
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedMaterial.thumbnail && (
              <img
                src={selectedMaterial.thumbnail}
                alt={selectedMaterial.title}
                className="w-full rounded-lg border max-h-96 object-cover"
              />
            )}

            <p className="text-gray-600">{selectedMaterial.description}</p>

            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Tipo</p>
                <p className="font-bold">{getTypeLabel(selectedMaterial.type)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Downloads</p>
                <p className="font-bold text-blue-600">{selectedMaterial.downloadCount}</p>
              </div>
              {selectedMaterial.fileSize && (
                <div>
                  <p className="text-sm text-gray-600">Tamanho</p>
                  <p className="font-bold">{selectedMaterial.fileSize}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Criado em</p>
                <p className="font-bold">{new Date(selectedMaterial.createdAt).toLocaleDateString("pt-BR")}</p>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button
                className="flex-1"
                onClick={() => handleDownloadMaterial(selectedMaterial)}
              >
                <Download size={16} className="mr-2" />
                Baixar Material
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleCopyLink(selectedMaterial)}
              >
                <Copy size={16} className="mr-2" />
                Copiar Link
              </Button>
              <Button
                variant="outline"
                className="flex-1"
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            Materiais Mais Baixados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topDownloads.map((material, index) => (
              <div key={material.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50">
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center font-bold">
                  {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{material.title}</p>
                  <p className="text-xs text-gray-600">{getTypeLabel(material.type)}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-sm">{material.downloadCount}</p>
                  <p className="text-xs text-gray-600">downloads</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
