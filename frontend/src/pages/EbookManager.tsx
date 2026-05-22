import { useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
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
import {
  BookOpen,
  Copy,
  Download,
  Eye,
  Loader2,
  RefreshCw,
  Search,
  Star,
} from "lucide-react";
import { toast } from "sonner";

type EbookStatus = "active" | "inactive" | "archived";
type AccessLevel = "public" | "premium" | "exclusive";

type Ebook = {
  id: number;
  title: string;
  author: string;
  description: string;
  category: string;
  pages: number;
  fileSize: string;
  coverImage: string;
  downloadUrl: string;
  downloads: number;
  accessLevel: AccessLevel;
  status: EbookStatus;
  rating: number;
  createdAt: string;
  updatedAt: string;
};

const statusMeta: Record<EbookStatus, { label: string; className: string }> = {
  active: {
    label: "Ativo",
    className:
      "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
  },
  inactive: {
    label: "Inativo",
    className: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
  },
  archived: {
    label: "Arquivado",
    className: "bg-slate-500/15 text-slate-300 border border-slate-500/30",
  },
};

const accessMeta: Record<
  AccessLevel,
  { label: string; className: string; icon: string }
> = {
  public: {
    label: "Público",
    className:
      "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
    icon: "🌐",
  },
  premium: {
    label: "Premium",
    className: "bg-yellow-500/15 text-yellow-300 border border-yellow-500/30",
    icon: "⭐",
  },
  exclusive: {
    label: "Exclusivo",
    className: "bg-purple-500/15 text-purple-300 border border-purple-500/30",
    icon: "🔒",
  },
};

const categoryLabels: Record<string, string> = {
  marketing: "Marketing Digital",
  vendas: "Vendas",
  negocio: "Negócio",
  lideranca: "Liderança",
  guias: "Guias práticos",
};

export default function EbookManager() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | EbookStatus>(
    "active",
  );
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [accessFilter, setAccessFilter] = useState<"all" | AccessLevel>("all");
  const [selectedEbook, setSelectedEbook] = useState<Ebook | null>(null);

  const ebooksQuery = trpc.materials.listEbooks.useQuery({
    page,
    limit: 24,
    status: statusFilter === "all" ? undefined : statusFilter,
    category: categoryFilter === "all" ? undefined : categoryFilter,
    accessLevel: accessFilter === "all" ? undefined : accessFilter,
    search: searchTerm || undefined,
  });

  const ebooks = (ebooksQuery.data?.ebooks ?? []) as Ebook[];
  const summary = ebooksQuery.data?.summary;

  const categoryOptions = useMemo(() => {
    const cats = new Set<string>();
    ebooks.forEach((ebook) => cats.add(ebook.category));
    return Array.from(cats);
  }, [ebooks]);

  const featured = useMemo(
    () =>
      [...ebooks]
        .sort((a, b) => Number(b.rating ?? 0) - Number(a.rating ?? 0))
        .slice(0, 3),
    [ebooks],
  );

  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado para a área de transferência");
    } catch {
      toast.error("Não foi possível copiar o link");
    }
  };

  const handleOpen = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Biblioteca de e-books
            </h1>
            <p className="mt-2 text-text-secondary">
              Conteúdo educacional consumido via backend, com filtros por nível
              de acesso, categoria e busca textual.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => ebooksQuery.refetch()}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar
            </Button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="border-border/60 bg-card/70 p-5">
            <p className="text-sm text-text-secondary">E-books filtrados</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">
              {summary?.totalEbooks ?? 0}
            </p>
          </Card>
          <Card className="border-border/60 bg-card/70 p-5">
            <p className="text-sm text-text-secondary">Ativos</p>
            <p className="mt-2 text-3xl font-semibold text-emerald-400">
              {summary?.activeEbooks ?? 0}
            </p>
          </Card>
          <Card className="border-border/60 bg-card/70 p-5">
            <p className="text-sm text-text-secondary">Downloads acumulados</p>
            <p className="mt-2 text-3xl font-semibold text-accent-cyan">
              {summary?.totalDownloads ?? 0}
            </p>
          </Card>
          <Card className="border-border/60 bg-card/70 p-5">
            <p className="text-sm text-text-secondary">Avaliação média</p>
            <p className="mt-2 text-3xl font-semibold text-yellow-400">
              {summary?.averageRating?.toFixed(2) ?? "0.00"}
            </p>
          </Card>
        </section>

        <Card className="border-border/60 bg-card/70 p-5">
          <div className="grid gap-4 xl:grid-cols-[1.4fr_220px_220px_220px] xl:items-end">
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Busca</p>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <Input
                  value={searchTerm}
                  onChange={(event) => {
                    setPage(1);
                    setSearchTerm(event.target.value);
                  }}
                  className="pl-10"
                  placeholder="Buscar por título, autor, descrição ou categoria"
                />
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Status</p>
              <Select
                value={statusFilter}
                onValueChange={(value: "all" | EbookStatus) => {
                  setPage(1);
                  setStatusFilter(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                  <SelectItem value="archived">Arquivados</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-foreground">
                Categoria
              </p>
              <Select
                value={categoryFilter}
                onValueChange={(value: string) => {
                  setPage(1);
                  setCategoryFilter(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categoryOptions.map((category) => (
                    <SelectItem key={category} value={category}>
                      {categoryLabels[category] ?? category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Acesso</p>
              <Select
                value={accessFilter}
                onValueChange={(value: "all" | AccessLevel) => {
                  setPage(1);
                  setAccessFilter(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Nível de acesso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os níveis</SelectItem>
                  <SelectItem value="public">Público</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="exclusive">Exclusivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {featured.length > 0 ? (
          <section>
            <h2 className="text-lg font-semibold text-foreground">
              Em destaque
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              Top e-books por avaliação no filtro atual.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {featured.map((ebook) => (
                <Card
                  key={ebook.id}
                  className="border-border/60 bg-background/30 transition hover:border-accent-cyan/40"
                >
                  <div className="relative h-44 overflow-hidden rounded-t-lg bg-black/40">
                    {ebook.coverImage ? (
                      <img
                        src={ebook.coverImage}
                        alt={ebook.title}
                        className="h-full w-full object-cover opacity-90"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-text-muted">
                        <BookOpen className="h-10 w-10" />
                      </div>
                    )}
                    <Badge
                      className={`absolute right-3 top-3 ${accessMeta[ebook.accessLevel].className}`}
                    >
                      <span className="mr-1">
                        {accessMeta[ebook.accessLevel].icon}
                      </span>
                      {accessMeta[ebook.accessLevel].label}
                    </Badge>
                  </div>
                  <CardHeader className="space-y-2">
                    <CardTitle className="text-base text-foreground">
                      {ebook.title}
                    </CardTitle>
                    <p className="text-sm text-text-secondary">
                      por {ebook.author}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1 text-yellow-400">
                        <Star className="h-4 w-4 fill-current" />
                        {ebook.rating.toFixed(1)}
                      </span>
                      <span className="text-text-secondary">
                        {ebook.downloads} downloads
                      </span>
                    </div>
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => setSelectedEbook(ebook)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Ver detalhes
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ) : null}

        <Card className="border-border/60 bg-card/70 overflow-hidden">
          <div className="border-b border-border/60 px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Catálogo completo
                </h2>
                <p className="mt-1 text-sm text-text-secondary">
                  {ebooksQuery.data?.pagination?.total ?? 0} e-books disponíveis
                  · {summary?.totalPages ?? 0} páginas no acervo.
                </p>
              </div>
              <Badge className="border-accent-cyan/30 bg-accent-cyan/10 text-accent-cyan">
                {Object.entries(summary?.accessLevelCount ?? {})
                  .map(([level, count]) => `${level}: ${count}`)
                  .join(" · ")}
              </Badge>
            </div>
          </div>

          {ebooksQuery.isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-accent-cyan" />
            </div>
          ) : ebooksQuery.isError ? (
            <div className="px-5 py-16 text-center text-text-secondary">
              Não foi possível carregar os e-books agora.
            </div>
          ) : ebooks.length === 0 ? (
            <div className="px-5 py-16 text-center text-text-secondary">
              Nenhum e-book corresponde aos filtros selecionados.
            </div>
          ) : (
            <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
              {ebooks.map((ebook) => (
                <Card
                  key={ebook.id}
                  className="border-border/60 bg-background/30 transition hover:border-accent-cyan/40"
                >
                  <div className="relative h-44 overflow-hidden rounded-t-lg bg-black/40">
                    {ebook.coverImage ? (
                      <img
                        src={ebook.coverImage}
                        alt={ebook.title}
                        className="h-full w-full object-cover opacity-90"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-text-muted">
                        <BookOpen className="h-10 w-10" />
                      </div>
                    )}
                    <Badge
                      className={`absolute right-3 top-3 ${statusMeta[ebook.status].className}`}
                    >
                      {statusMeta[ebook.status].label}
                    </Badge>
                  </div>

                  <CardHeader className="space-y-2">
                    <CardTitle className="text-base text-foreground">
                      {ebook.title}
                    </CardTitle>
                    <p className="text-sm text-text-secondary">
                      por {ebook.author}
                    </p>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-text-secondary">
                      {ebook.description}
                    </p>

                    <div className="flex flex-wrap gap-2 text-xs">
                      <Badge
                        variant="outline"
                        className="border-border/60 bg-background/50 text-text-secondary"
                      >
                        {categoryLabels[ebook.category] ?? ebook.category}
                      </Badge>
                      <Badge
                        className={accessMeta[ebook.accessLevel].className}
                      >
                        <span className="mr-1">
                          {accessMeta[ebook.accessLevel].icon}
                        </span>
                        {accessMeta[ebook.accessLevel].label}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="border-border/60 bg-background/50 text-text-secondary"
                      >
                        {ebook.pages} páginas · {ebook.fileSize}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-border/60 bg-card/50 p-3 text-sm text-text-secondary">
                      <span className="flex items-center gap-1 text-yellow-400">
                        <Star className="h-4 w-4 fill-current" />
                        {ebook.rating.toFixed(1)}
                      </span>
                      <span>{ebook.downloads} downloads</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedEbook(ebook)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Detalhes
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(ebook.downloadUrl)}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copiar
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleOpen(ebook.downloadUrl)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Baixar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </Card>

        {selectedEbook ? (
          <Card className="border-border/60 bg-card/70 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-semibold text-foreground">
                    {selectedEbook.title}
                  </h2>
                  <Badge className={statusMeta[selectedEbook.status].className}>
                    {statusMeta[selectedEbook.status].label}
                  </Badge>
                  <Badge
                    className={accessMeta[selectedEbook.accessLevel].className}
                  >
                    <span className="mr-1">
                      {accessMeta[selectedEbook.accessLevel].icon}
                    </span>
                    {accessMeta[selectedEbook.accessLevel].label}
                  </Badge>
                </div>
                <p className="text-sm text-text-secondary">
                  {selectedEbook.description}
                </p>
                <p className="text-sm text-text-secondary">
                  Autor:{" "}
                  <span className="text-foreground">
                    {selectedEbook.author}
                  </span>
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge
                    variant="outline"
                    className="border-border/60 bg-background/50 text-text-secondary"
                  >
                    {categoryLabels[selectedEbook.category] ??
                      selectedEbook.category}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-border/60 bg-background/50 text-text-secondary"
                  >
                    {selectedEbook.pages} páginas · {selectedEbook.fileSize}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-border/60 bg-background/50 text-text-secondary"
                  >
                    Avaliação {selectedEbook.rating.toFixed(1)}
                  </Badge>
                </div>
                <p className="text-xs text-text-muted">
                  Publicado em{" "}
                  {new Date(selectedEbook.createdAt).toLocaleDateString(
                    "pt-BR",
                  )}{" "}
                  · atualizado em{" "}
                  {new Date(selectedEbook.updatedAt).toLocaleDateString(
                    "pt-BR",
                  )}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleCopy(selectedEbook.downloadUrl)}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copiar link
                </Button>
                <Button onClick={() => handleOpen(selectedEbook.downloadUrl)}>
                  <Download className="mr-2 h-4 w-4" />
                  Baixar agora
                </Button>
              </div>
            </div>
          </Card>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
