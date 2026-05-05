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
import { Plus, Download, Eye, Trash2, BookOpen, FileText, Lock, Users } from "lucide-react";
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
      title: "Empreendedorismo Digital: Do Zero ao Sucesso",
      author: "João Santos",
      description: "Tudo que você precisa saber para começar seu negócio digital",
      category: "business",
      pages: 289,
      fileSize: "7.1 MB",
      downloadUrl: "https://example.com/ebooks/empreendedorismo.pdf",
      downloads: 2103,
      accessLevel: "public",
      status: "active",
      createdAt: "2024-03-05",
      updatedAt: "2024-04-21",
      coverImage: "https://via.placeholder.com/200x300?text=Empreendedorismo",
    },
    {
      id: 4,
      title: "Treinamento Exclusivo: Sistema MMN Avançado",
      author: "Admin",
      description: "Acesso exclusivo ao treinamento completo do sistema MMN",
      category: "training",
      pages: 412,
      fileSize: "12.5 MB",
      downloadUrl: "https://example.com/ebooks/mmn-avancado.pdf",
      downloads: 234,
      accessLevel: "exclusive",
      status: "active",
      createdAt: "2024-01-20",
      updatedAt: "2024-04-19",
      coverImage: "https://via.placeholder.com/200x300?text=MMN+Avancado",
    },
    {
      id: 5,
      title: "Guia Prático: Otimizando Suas Comissões",
      author: "Fernanda Lima",
      description: "Estratégias práticas para maximizar seus ganhos no programa de afiliados",
      category: "guides",
      pages: 87,
      fileSize: "2.3 MB",
      downloadUrl: "https://example.com/ebooks/comissoes.pdf",
      downloads: 567,
      accessLevel: "premium",
      status: "active",
      createdAt: "2024-02-28",
      updatedAt: "2024-04-15",
      coverImage: "https://via.placeholder.com/200x300?text=Comissoes",
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
    // In production, this would trigger actual download
  };

  const filteredEbooks = ebooks.filter((ebook) => {
    const matchesSearch = ebook.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ebook.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ebook.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || ebook.status === filterStatus;
    const matchesCategory = filterCategory === "all" || ebook.category === filterCategory;
    const matchesAccess = filterAccess === "all" || ebook.accessLevel === filterAccess;
    return matchesSearch && matchesStatus && matchesCategory && matchesAccess;
  });

  const getAccessIcon = (level: string) => {
    const access = accessLevels.find((a) => a.value === level);
    return access?.icon || "📄";
  };

  const getAccessColor = (level: string) => {
    switch (level) {
      case "public":
        return "bg-blue-100 text-blue-800";
      case "premium":
        return "bg-purple-100 text-purple-800";
      case "exclusive":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Gerenciador de E-books</h2>
          <p className="text-gray-600 mt-2">Gerencie sua biblioteca de e-books e materiais educacionais</p>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)} className="gap-2">
          <Plus size={20} />
          Novo E-book
        </Button>
      </div>

      {/* Create Form */}
      {isCreating && (
        <Card className="p-6 bg-purple-50 border-2 border-purple-200">
          <h3 className="text-lg font-semibold mb-6 text-gray-900">Criar Novo E-book</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título *
                </label>
                <Input
                  placeholder="Ex: Guia de Marketing Digital"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Autor *
                </label>
                <Input
                  placeholder="Ex: João Silva"
                  value={formData.author}
                  onChange={(e) =>
                    setFormData({ ...formData, author: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <Input
                placeholder="Descrição do e-book"
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
                    {ebookCategories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nível de Acesso
                </label>
                <Select value={formData.accessLevel} onValueChange={(value: any) =>
                  setFormData({ ...formData, accessLevel: value })
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {accessLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.icon} {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Arquivo PDF *
              </label>
              <Input
                type="file"
                accept=".pdf"
                onChange={(e) =>
                  setFormData({ ...formData, file: e.target.files?.[0] || null })
                }
              />
              {formData.file && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ {formData.file.name}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleCreateEbook}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                Criar E-book
              </Button>
              <Button
                variant="outline"
                className="flex-1"
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
      <div className="flex gap-4 flex-wrap">
        <Input
          placeholder="Pesquisar e-books..."
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
            {ebookCategories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterAccess} onValueChange={setFilterAccess}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Acessos</SelectItem>
            {accessLevels.map((level) => (
              <SelectItem key={level.value} value={level.value}>
                {level.icon} {level.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* E-books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEbooks.length > 0 ? (
          filteredEbooks.map((ebook) => (
            <Card key={ebook.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
              <div className="relative bg-gradient-to-br from-purple-100 to-purple-200 p-4 h-40 flex items-center justify-center">
                <img
                  src={ebook.coverImage}
                  alt={ebook.title}
                  className="h-full object-cover rounded"
                />
              </div>

              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">{ebook.title}</CardTitle>
                    <p className="text-sm text-gray-600">por {ebook.author}</p>
                  </div>
                  <Badge className={getAccessColor(ebook.accessLevel)}>
                    {getAccessIcon(ebook.accessLevel)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 flex-1 flex flex-col">
                <p className="text-sm text-gray-600 line-clamp-2 flex-1">{ebook.description}</p>

                <div className="space-y-2 text-sm border-t pt-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Categoria:</span>
                    <span className="font-medium">
                      {ebookCategories.find((c) => c.value === ebook.category)?.label}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Páginas:</span>
                    <span className="font-medium">{ebook.pages}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tamanho:</span>
                    <span className="font-medium">{ebook.fileSize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Downloads:</span>
                    <span className="font-medium text-blue-600">{ebook.downloads}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setSelectedEbook(ebook)}
                  >
                    <Eye size={16} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDownloadEbook(ebook)}
                  >
                    <Download size={16} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteEbook(ebook.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-3 text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Nenhum e-book encontrado</p>
            <Button onClick={() => setIsCreating(true)}>Criar Primeiro E-book</Button>
          </div>
        )}
      </div>

      {/* E-book Details */}
      {selectedEbook && (
        <Card className="border-2 border-purple-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Detalhes do E-book</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedEbook(null)}
              >
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <img
                  src={selectedEbook.coverImage}
                  alt={selectedEbook.title}
                  className="w-full rounded-lg border"
                />
              </div>
              <div className="col-span-2 space-y-3">
                <div>
                  <h3 className="font-bold text-lg">{selectedEbook.title}</h3>
                  <p className="text-sm text-gray-600">por {selectedEbook.author}</p>
                </div>
                <p className="text-gray-600">{selectedEbook.description}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Páginas</p>
                    <p className="font-bold">{selectedEbook.pages}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tamanho</p>
                    <p className="font-bold">{selectedEbook.fileSize}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Downloads</p>
                    <p className="font-bold text-blue-600">{selectedEbook.downloads}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Acesso</p>
                    <p className="font-bold">{getAccessIcon(selectedEbook.accessLevel)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button
                className="flex-1"
                onClick={() => handleDownloadEbook(selectedEbook)}
              >
                <Download size={16} className="mr-2" />
                Baixar E-book
              </Button>
              <Button variant="outline" className="flex-1">
                <Users size={16} className="mr-2" />
                Compartilhar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
