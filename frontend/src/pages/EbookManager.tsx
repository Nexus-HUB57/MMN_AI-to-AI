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
import { Plus, Download, Eye, Trash2, BookOpen, FileText, Lock, Users, Zap, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Ebook {
  id: number;
  title: string;
  author: string;
  description: string;
  category: string;
  pages: number;
  fileSize: string;
  downloadUrl: string;
  downloads: number;
  accessLevel: "public" | "premium" | "exclusive";
  status: "active" | "inactive" | "archived";
  createdAt: string;
  updatedAt: string;
  coverImage: string;
}

interface EbookManagerProps {
  affiliateId?: number;
}

const ebookCategories = [
  { value: "marketing", label: "Marketing Digital" },
  { value: "sales", label: "Técnicas de Vendas" },
  { value: "business", label: "Negócios" },
  { value: "training", label: "Treinamento" },
  { value: "guides", label: "Guias Práticos" },
];

const accessLevels = [
  { value: "public", label: "Público", icon: "🌐" },
  { value: "premium", label: "Premium", icon: "⭐" },
  { value: "exclusive", label: "Exclusivo", icon: "🔒" },
];

export default function EbookManager({ affiliateId }: EbookManagerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedEbook, setSelectedEbook] = useState<Ebook | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterAccess, setFilterAccess] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    description: "",
    category: "marketing",
    accessLevel: "public" as const,
    file: null as File | null,
  });

  // Mock data
  const [ebooks, setEbooks] = useState<Ebook[]>([
    {
      id: 1,
      title: "Guia Completo de Marketing Digital 2024",
      author: "Carlos Silva",
      description: "Aprenda as melhores estratégias de marketing digital para impulsionar suas vendas",
      category: "marketing",
      pages: 156,
      fileSize: "4.2 MB",
      downloadUrl: "https://example.com/ebooks/marketing-digital.pdf",
      downloads: 1245,
      accessLevel: "public",
      status: "active",
      createdAt: "2024-01-15",
      updatedAt: "2024-04-20",
      coverImage: "https://via.placeholder.com/200x300?text=Marketing+Digital",
    },
    {
      id: 2,
      title: "Técnicas Avançadas de Vendas",
      author: "Marina Costa",
      description: "Domine as técnicas de vendas mais eficazes para fechar mais negócios",
      category: "sales",
      pages: 203,
      fileSize: "5.8 MB",
      downloadUrl: "https://example.com/ebooks/vendas-avancadas.pdf",
      downloads: 856,
      accessLevel: "premium",
      status: "active",
      createdAt: "2024-02-10",
      updatedAt: "2024-04-18",
      coverImage: "https://via.placeholder.com/200x300?text=Vendas",
    },
    {
      id: 3,
      title: "Segredos do Empreendedorismo",
      author: "João Santos",
      description: "Descubra os segredos dos empreendedores de sucesso",
      category: "business",
      pages: 287,
      fileSize: "6.5 MB",
      downloadUrl: "https://example.com/ebooks/empreendedorismo.pdf",
      downloads: 634,
      accessLevel: "exclusive",
      status: "active",
      createdAt: "2024-03-05",
      updatedAt: "2024-04-19",
      coverImage: "https://via.placeholder.com/200x300?text=Empreendedorismo",
    },
    {
      id: 4,
      title: "Treinamento em Liderança",
      author: "Fernanda Lima",
      description: "Desenvolva suas habilidades de liderança e gestão de equipes",
      category: "training",
      pages: 198,
      fileSize: "4.9 MB",
      downloadUrl: "https://example.com/ebooks/lideranca.pdf",
      downloads: 521,
      accessLevel: "premium",
      status: "active",
      createdAt: "2024-03-20",
      updatedAt: "2024-04-17",
      coverImage: "https://via.placeholder.com/200x300?text=Lideranca",
    },
    {
      id: 5,
      title: "Guia Prático de Produtividade",
      author: "Ricardo Oliveira",
      description: "Técnicas práticas para aumentar sua produtividade em 300%",
      category: "guides",
      pages: 142,
      fileSize: "3.7 MB",
      downloadUrl: "https://example.com/ebooks/produtividade.pdf",
      downloads: 1089,
      accessLevel: "public",
      status: "active",
      createdAt: "2024-04-01",
      updatedAt: "2024-04-21",
      coverImage: "https://via.placeholder.com/200x300?text=Produtividade",
    },
  ]);

  const handleCreateEbook = () => {
    if (!formData.title.trim()) {
      toast.error("Título é obrigatório");
      return;
    }
    if (!formData.author.trim()) {
      toast.error("Autor é obrigatório");
      return;
    }
    if (!formData.file) {
      toast.error("Selecione um arquivo PDF");
      return;
    }

    toast.success("E-book criado com sucesso!");
    setIsCreating(false);
    setFormData({
      title: "",
      author: "",
      description: "",
      category: "marketing",
      accessLevel: "public",
      file: null,
    });
  };

  const handleDeleteEbook = (id: number) => {
    setEbooks(ebooks.filter((e) => e.id !== id));
    toast.success("E-book deletado com sucesso");
  };

  const handleDownloadEbook = (ebook: Ebook) => {
    toast.success(`Iniciando download de ${ebook.title}`);
  };

  const getAccessIcon = (level: string) => {
    const access = accessLevels.find((a) => a.value === level);
    return access?.icon || "🌐";
  };

  const getAccessColor = (level: string) => {
    switch (level) {
      case "public":
        return "bg-green-500/20 text-green-400 border border-green-500/30";
      case "premium":
        return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
      case "exclusive":
        return "bg-purple-500/20 text-purple-400 border border-purple-500/30";
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "marketing":
        return "bg-neon-pink/20 text-neon-pink border border-neon-pink/30";
      case "sales":
        return "bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30";
      case "business":
        return "bg-purple-500/20 text-purple-400 border border-purple-500/30";
      case "training":
        return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
      case "guides":
        return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
    }
  };

  const filteredEbooks = ebooks.filter((ebook) => {
    const matchesSearch = ebook.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ebook.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || ebook.status === filterStatus;
    const matchesCategory = filterCategory === "all" || ebook.category === filterCategory;
    const matchesAccess = filterAccess === "all" || ebook.accessLevel === filterAccess;
    return matchesSearch && matchesStatus && matchesCategory && matchesAccess;
  });

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-orbitron font-bold text-glow-pink">
            Gerenciador de E-books
          </h1>
          <p className="text-neon-cyan font-space-mono mt-2">
            Gerencie sua biblioteca de conteúdo educacional
          </p>
        </div>
        <Button
          onClick={() => setIsCreating(!isCreating)}
          className="gap-2 btn-neon-cyan font-orbitron"
        >
          <Plus size={20} />
          Novo E-book
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
            Criar Novo E-book
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-space-mono text-neon-cyan mb-2">
                  Título *
                </label>
                <Input
                  placeholder="Título do e-book"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="bg-black/60 border-neon-cyan/30 text-white placeholder:text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-space-mono text-neon-cyan mb-2">
                  Autor *
                </label>
                <Input
                  placeholder="Nome do autor"
                  value={formData.author}
                  onChange={(e) =>
                    setFormData({ ...formData, author: e.target.value })
                  }
                  className="bg-black/60 border-neon-cyan/30 text-white placeholder:text-gray-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-space-mono text-neon-cyan mb-2">
                Descrição
              </label>
              <Input
                placeholder="Descrição do e-book"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="bg-black/60 border-neon-cyan/30 text-white placeholder:text-gray-600"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
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
                    {ebookCategories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value} className="text-white">
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-space-mono text-neon-cyan mb-2">
                  Nível de Acesso
                </label>
                <Select value={formData.accessLevel} onValueChange={(value: any) =>
                  setFormData({ ...formData, accessLevel: value })
                }>
                  <SelectTrigger className="bg-black/60 border-neon-cyan/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black/80 border-neon-cyan/30">
                    {accessLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value} className="text-white">
                        {level.icon} {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-space-mono text-neon-cyan mb-2">
                  Arquivo PDF *
                </label>
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={(e) =>
                    setFormData({ ...formData, file: e.target.files?.[0] || null })
                  }
                  className="bg-black/60 border-neon-cyan/30 text-white"
                />
              </div>
            </div>

            {formData.file && (
              <p className="text-sm text-green-400 font-space-mono">
                ✓ {formData.file.name}
              </p>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleCreateEbook}
                className="flex-1 btn-neon-cyan font-orbitron"
              >
                Criar E-book
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-neon-cyan/30 text-neon-cyan font-orbitron"
                onClick={() => {
                  setIsCreating(false);
                  setFormData({
                    title: "",
                    author: "",
                    description: "",
                    category: "marketing",
                    accessLevel: "public",
                    file: null,
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-space-mono text-neon-cyan mb-2">
            Buscar
          </label>
          <Input
            placeholder="Buscar e-books..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-black/60 border-neon-cyan/30 text-white placeholder:text-gray-600"
          />
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
              {ebookCategories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value} className="text-white">
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-space-mono text-neon-cyan mb-2">
            Acesso
          </label>
          <Select value={filterAccess} onValueChange={setFilterAccess}>
            <SelectTrigger className="bg-black/60 border-neon-cyan/30 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-black/80 border-neon-cyan/30">
              <SelectItem value="all" className="text-white">Todos</SelectItem>
              {accessLevels.map((level) => (
                <SelectItem key={level.value} value={level.value} className="text-white">
                  {level.icon} {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
      </div>

      {/* E-books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEbooks.length > 0 ? (
          filteredEbooks.map((ebook) => (
            <Card
              key={ebook.id}
              className="hud-frame bg-black/40 border-neon-cyan/30 overflow-hidden hover:border-neon-cyan/60 transition-all cursor-pointer"
              onClick={() => setSelectedEbook(ebook)}
            >
              <div className="corner-bracket top-left"></div>
              <div className="corner-bracket top-right"></div>
              <div className="corner-bracket bottom-left"></div>
              <div className="corner-bracket bottom-right"></div>

              {/* Cover */}
              <div className="relative h-48 bg-black/60 border-b border-neon-cyan/20 overflow-hidden">
                <img
                  src={ebook.coverImage}
                  alt={ebook.title}
                  className="w-full h-full object-cover opacity-70 hover:opacity-100 transition-opacity"
                />
                <div className="absolute top-2 right-2 flex gap-2 flex-wrap justify-end">
                  <Badge className={getStatusColor(ebook.status)}>
                    {ebook.status === "active" ? "Ativo" : ebook.status === "inactive" ? "Inativo" : "Arquivado"}
                  </Badge>
                  <Badge className={getAccessColor(ebook.accessLevel)}>
                    {getAccessIcon(ebook.accessLevel)} {accessLevels.find((a) => a.value === ebook.accessLevel)?.label}
                  </Badge>
                </div>
              </div>

              <CardContent className="pt-4 space-y-3">
                <div>
                  <h3 className="font-orbitron text-neon-pink font-bold truncate">
                    {ebook.title}
                  </h3>
                  <p className="text-xs text-text-secondary font-space-mono">
                    por {ebook.author}
                  </p>
                </div>

                <p className="text-xs text-text-secondary font-space-mono line-clamp-2">
                  {ebook.description}
                </p>

                <Badge className={getCategoryColor(ebook.category)}>
                  {ebookCategories.find((c) => c.value === ebook.category)?.label}
                </Badge>

                <div className="grid grid-cols-3 gap-2 text-xs font-space-mono text-text-secondary">
                  <div>
                    <p className="text-gray-600">Páginas</p>
                    <p className="text-neon-cyan font-bold">{ebook.pages}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Tamanho</p>
                    <p className="text-neon-pink font-bold">{ebook.fileSize}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Downloads</p>
                    <p className="text-yellow-500 font-bold">{ebook.downloads}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-neon-cyan/20">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEbook(ebook);
                    }}
                  >
                    <Eye size={14} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadEbook(ebook);
                    }}
                  >
                    <Download size={14} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteEbook(ebook.id);
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
            <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-text-secondary font-space-mono mb-4">Nenhum e-book encontrado</p>
            <Button onClick={() => setIsCreating(true)} className="btn-neon-cyan font-orbitron">
              Criar Primeiro E-book
            </Button>
          </div>
        )}
      </div>

      {/* E-book Details Modal */}
      {selectedEbook && (
        <Card className="fixed inset-0 z-50 m-4 max-w-2xl mx-auto my-auto hud-frame bg-black/95 border-neon-cyan/30">
          <div className="corner-bracket top-left"></div>
          <div className="corner-bracket top-right"></div>
          <div className="corner-bracket bottom-left"></div>
          <div className="corner-bracket bottom-right"></div>

          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-neon-pink font-orbitron">
                {selectedEbook.title}
              </CardTitle>
              <p className="text-sm text-text-secondary font-space-mono mt-1">
                por {selectedEbook.author}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedEbook(null)}
              className="text-neon-cyan border-neon-cyan/30"
            >
              ✕
            </Button>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1">
                <img
                  src={selectedEbook.coverImage}
                  alt={selectedEbook.title}
                  className="w-full rounded border border-neon-cyan/20"
                />
              </div>
              <div className="col-span-2 space-y-3">
                <p className="text-text-secondary font-space-mono">
                  {selectedEbook.description}
                </p>

                <div className="grid grid-cols-2 gap-4 p-4 bg-black/60 rounded border border-neon-cyan/20">
                  <div>
                    <p className="text-xs text-text-secondary uppercase font-space-mono mb-1">
                      Categoria
                    </p>
                    <Badge className={getCategoryColor(selectedEbook.category)}>
                      {ebookCategories.find((c) => c.value === selectedEbook.category)?.label}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary uppercase font-space-mono mb-1">
                      Acesso
                    </p>
                    <Badge className={getAccessColor(selectedEbook.accessLevel)}>
                      {getAccessIcon(selectedEbook.accessLevel)} {accessLevels.find((a) => a.value === selectedEbook.accessLevel)?.label}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary uppercase font-space-mono mb-1">
                      Páginas
                    </p>
                    <p className="font-bold text-neon-cyan font-orbitron">{selectedEbook.pages}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary uppercase font-space-mono mb-1">
                      Tamanho
                    </p>
                    <p className="font-bold text-neon-pink font-orbitron">{selectedEbook.fileSize}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary uppercase font-space-mono mb-1">
                      Downloads
                    </p>
                    <p className="font-bold text-yellow-500 font-orbitron">{selectedEbook.downloads}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary uppercase font-space-mono mb-1">
                      Status
                    </p>
                    <Badge className={getStatusColor(selectedEbook.status)}>
                      {selectedEbook.status === "active" ? "Ativo" : selectedEbook.status === "inactive" ? "Inativo" : "Arquivado"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-neon-cyan/20">
              <Button
                className="flex-1 btn-neon-cyan font-orbitron text-sm"
                onClick={() => handleDownloadEbook(selectedEbook)}
              >
                <Download size={16} className="mr-2" />
                Baixar E-book
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-neon-cyan/30 text-neon-cyan font-orbitron text-sm"
                onClick={() => setSelectedEbook(null)}
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
