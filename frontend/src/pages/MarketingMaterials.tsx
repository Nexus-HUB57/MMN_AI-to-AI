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
  Copy,
  Download,
  Eye,
  FileText,
  Filter,
  Image as ImageIcon,
  Link2,
  Loader2,
  Presentation,
  RefreshCw,
  Search,
  Video,
} from "lucide-react";
import { toast } from "sonner";

type MaterialType =
  | "banner"
  | "ebook"
  | "video"
  | "presentation"
  | "social_media"
  | "email_template"
  | "other";

type MaterialStatus = "draft" | "active" | "archived";

type Material = {
  id: number;
  title: string;
  type: MaterialType;
  status: MaterialStatus;
  url: string;
  thumbnail?: string | null;
  createdAt: string | Date;
  createdBy?: string;
  downloads: number;
  categories: string[];
};

const typeMeta: Record<
  MaterialType,
  { label: string; icon: JSX.Element; className: string }
> = {
  banner: {
    label: "Banner",
    icon: <ImageIcon className="h-4 w-4" />,
    className:
      "bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30",
  },
  ebook: {
    label: "E-book",
    icon: <FileText className="h-4 w-4" />,
    className:
      "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
  },
  video: {
    label: "Vídeo",
    icon: <Video className="h-4 w-4" />,
    className: "bg-red-500/15 text-red-300 border border-red-500/30",
  },
  presentation: {
    label: "Apresentação",
    icon: <Presentation className="h-4 w-4" />,
    className: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
  },
  social_media: {
    label: "Social media",
    icon: <ImageIcon className="h-4 w-4" />,
    className: "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30",
  },
  email_template: {
    label: "Template de email",
    icon: <Link2 className="h-4 w-4" />,
    className: "bg-violet-500/15 text-violet-300 border border-violet-500/30",
  },
  other: {
    label: "Outro",
    icon: <FileText className="h-4 w-4" />,
    className: "bg-slate-500/15 text-slate-300 border border-slate-500/30",
  },
};

const statusMeta: Record<MaterialStatus, { label: string; className: string }> =
  {
    active: {
      label: "Ativo",
      className:
        "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
    },
    draft: {
      label: "Rascunho",
      className: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
    },
    archived: {
      label: "Arquivado",
      className: "bg-slate-500/15 text-slate-300 border border-slate-500/30",
    },
  };

export default function MarketingMaterials() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | MaterialType>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | MaterialStatus>(
    "active",
  );
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(
    null,
  );

  const materialsQuery = trpc.materials.list.useQuery({
    page,
    limit: 24,
    search: searchTerm || undefined,
    type: typeFilter === "all" ? undefined : typeFilter,
    status: statusFilter === "all" ? undefined : statusFilter,
  });
  const statsQuery = trpc.materials.getStats.useQuery();
  const categoriesQuery = trpc.materials.getCategories.useQuery();

  const categories = categoriesQuery.data?.categories ?? [];
  const rawMaterials = (materialsQuery.data?.materials ?? []) as Material[];

  const materials = useMemo(() => {
    if (categoryFilter === "all") return rawMaterials;
    return rawMaterials.filter((material) =>
      material.categories.includes(categoryFilter),
    );
  }, [categoryFilter, rawMaterials]);

  const featured = useMemo(
    () =>
      [...materials]
        .sort((a, b) => Number(b.downloads ?? 0) - Number(a.downloads ?? 0))
        .slice(0, 3),
    [materials],
  );

  const visibleDownloads = useMemo(
    () =>
      materials.reduce(
        (sum, material) => sum + Number(material.downloads ?? 0),
        0,
      ),
    [materials],
  );

  const handleCopyLink = async (url: string) => {
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
              Materiais de divulgação
            </h1>
            <p className="mt-2 text-text-secondary">
              Catálogo operacional conectado ao backend para banners, e-books,
              peças sociais e ativos de campanha.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                materialsQuery.refetch();
                statsQuery.refetch();
                categoriesQuery.refetch();
              }}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar
            </Button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="border-border/60 bg-card/70 p-5">
            <p className="text-sm text-text-secondary">Materiais no acervo</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">
              {statsQuery.data?.total ?? 0}
            </p>
          </Card>
          <Card className="border-border/60 bg-card/70 p-5">
            <p className="text-sm text-text-secondary">Downloads acumulados</p>
            <p className="mt-2 text-3xl font-semibold text-accent-cyan">
              {statsQuery.data?.totalDownloads ?? 0}
            </p>
          </Card>
          <Card className="border-border/60 bg-card/70 p-5">
            <p className="text-sm text-text-secondary">Itens ativos</p>
            <p className="mt-2 text-3xl font-semibold text-emerald-400">
              {statsQuery.data?.byStatus?.active ?? 0}
            </p>
          </Card>
          <Card className="border-border/60 bg-card/70 p-5">
            <p className="text-sm text-text-secondary">Downloads visíveis</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">
              {visibleDownloads}
            </p>
          </Card>
        </section>

        <Card className="border-border/60 bg-card/70 p-5">
          <div className="grid gap-4 xl:grid-cols-[1.2fr_220px_220px_1fr] xl:items-end">
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
                  placeholder="Buscar por título, categoria ou campanha"
                />
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Tipo</p>
              <Select
                value={typeFilter}
                onValueChange={(value: "all" | MaterialType) => {
                  setPage(1);
                  setTypeFilter(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  {Object.entries(typeMeta).map(([value, meta]) => (
                    <SelectItem key={value} value={value}>
                      {meta.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Status</p>
              <Select
                value={statusFilter}
                onValueChange={(value: "all" | MaterialStatus) => {
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
                  <SelectItem value="draft">Rascunhos</SelectItem>
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
                  {categories.map(
                    (category: { id: string; name: string; count: number }) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
          <Card className="border-border/60 bg-card/70 p-5">
            <div className="mb-4 flex items-center gap-2">
              <Filter className="h-4 w-4 text-accent-cyan" />
              <h2 className="text-lg font-semibold text-foreground">
                Categorias monitoradas
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map(
                (category: { id: string; name: string; count: number }) => (
                  <Badge
                    key={category.id}
                    className={`cursor-pointer border transition-colors ${
                      categoryFilter === category.id
                        ? "border-accent-cyan bg-accent-cyan/20 text-accent-cyan"
                        : "border-border/60 bg-background/40 text-text-secondary"
                    }`}
                    onClick={() => setCategoryFilter(category.id)}
                  >
                    {category.name} · {category.count}
                  </Badge>
                ),
              )}
            </div>
          </Card>

          <Card className="border-border/60 bg-card/70 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                Top downloads
              </h2>
              <Badge className="border-accent-cyan/30 bg-accent-cyan/10 text-accent-cyan">
                {featured.length} destaques
              </Badge>
            </div>
            <div className="space-y-3">
              {featured.map((material) => (
                <button
                  key={material.id}
                  type="button"
                  className="flex w-full items-center justify-between rounded-lg border border-border/60 bg-background/30 p-3 text-left transition hover:border-accent-cyan/40 hover:bg-background/50"
                  onClick={() => setSelectedMaterial(material)}
                >
                  <div>
                    <p className="font-medium text-foreground">
                      {material.title}
                    </p>
                    <p className="mt-1 text-xs text-text-secondary">
                      {typeMeta[material.type].label} · {material.downloads}{" "}
                      downloads
                    </p>
                  </div>
                  <Eye className="h-4 w-4 text-text-muted" />
                </button>
              ))}
            </div>
          </Card>
        </section>

        <Card className="border-border/60 bg-card/70 overflow-hidden">
          <div className="border-b border-border/60 px-5 py-4">
            <h2 className="text-lg font-semibold text-foreground">
              Catálogo disponível
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              {materialsQuery.data?.pagination?.total ?? 0} itens encontrados no
              backend.
            </p>
          </div>

          {materialsQuery.isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-accent-cyan" />
            </div>
          ) : materialsQuery.isError ? (
            <div className="px-5 py-16 text-center text-text-secondary">
              Não foi possível carregar os materiais agora.
            </div>
          ) : materials.length === 0 ? (
            <div className="px-5 py-16 text-center text-text-secondary">
              Nenhum material corresponde aos filtros selecionados.
            </div>
          ) : (
            <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
              {materials.map((material) => (
                <Card
                  key={material.id}
                  className="border-border/60 bg-background/30 transition hover:border-accent-cyan/40"
                >
                  <CardHeader className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-base text-foreground">
                          {material.title}
                        </CardTitle>
                        <p className="mt-2 text-xs text-text-secondary">
                          Publicado em{" "}
                          {new Date(material.createdAt).toLocaleDateString(
                            "pt-BR",
                          )}
                        </p>
                      </div>
                      <Badge className={statusMeta[material.status].className}>
                        {statusMeta[material.status].label}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge className={typeMeta[material.type].className}>
                        <span className="mr-1 inline-flex">
                          {typeMeta[material.type].icon}
                        </span>
                        {typeMeta[material.type].label}
                      </Badge>
                      {material.categories.map((category) => (
                        <Badge
                          key={category}
                          variant="outline"
                          className="border-border/60 bg-background/50 text-text-secondary"
                        >
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="rounded-lg border border-border/60 bg-card/50 p-3 text-sm text-text-secondary">
                      {material.downloads} downloads registrados · origem{" "}
                      {material.createdBy || "admin"}
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedMaterial(material)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Ver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyLink(material.url)}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copiar
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleOpen(material.url)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Abrir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </Card>

        {selectedMaterial ? (
          <Card className="border-border/60 bg-card/70 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-semibold text-foreground">
                    {selectedMaterial.title}
                  </h2>
                  <Badge className={typeMeta[selectedMaterial.type].className}>
                    {typeMeta[selectedMaterial.type].label}
                  </Badge>
                  <Badge
                    className={statusMeta[selectedMaterial.status].className}
                  >
                    {statusMeta[selectedMaterial.status].label}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-text-secondary">
                  Publicado em{" "}
                  {new Date(selectedMaterial.createdAt).toLocaleDateString(
                    "pt-BR",
                  )}{" "}
                  · {selectedMaterial.downloads} downloads
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedMaterial.categories.map((category) => (
                    <Badge
                      key={category}
                      variant="outline"
                      className="border-border/60 bg-background/50 text-text-secondary"
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleCopyLink(selectedMaterial.url)}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copiar link
                </Button>
                <Button onClick={() => handleOpen(selectedMaterial.url)}>
                  <Download className="mr-2 h-4 w-4" />
                  Abrir ativo
                </Button>
              </div>
            </div>
          </Card>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
