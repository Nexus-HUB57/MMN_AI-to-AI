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
  ImageIcon,
  Layers,
  Loader2,
  RefreshCw,
  Ruler,
  Search,
} from "lucide-react";
import { toast } from "sonner";

type BannerStatus = "active" | "inactive" | "archived";

type Banner = {
  id: number;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  downloadUrl: string;
  dimensions: string;
  size: string;
  downloads: number;
  status: BannerStatus;
  createdAt: string;
  updatedAt: string;
};

const statusMeta: Record<BannerStatus, { label: string; className: string }> = {
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

const categoryLabels: Record<string, string> = {
  promocao: "Promocional",
  sazonal: "Sazonal",
  produto: "Produto",
  evento: "Evento",
  "redes-sociais": "Redes sociais",
};

export default function BannerManager() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | BannerStatus>(
    "active",
  );
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dimensionsFilter, setDimensionsFilter] = useState<string>("all");
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);

  const bannersQuery = trpc.materials.listBanners.useQuery({
    page,
    limit: 24,
    status: statusFilter === "all" ? undefined : statusFilter,
    category: categoryFilter === "all" ? undefined : categoryFilter,
    dimensions: dimensionsFilter === "all" ? undefined : dimensionsFilter,
    search: searchTerm || undefined,
  });

  const banners = (bannersQuery.data?.banners ?? []) as Banner[];
  const summary = bannersQuery.data?.summary;

  const dimensionOptions = useMemo(() => {
    const dims = new Set<string>();
    banners.forEach((banner) => dims.add(banner.dimensions));
    return Array.from(dims);
  }, [banners]);

  const categoryOptions = useMemo(() => {
    const cats = new Set<string>();
    banners.forEach((banner) => cats.add(banner.category));
    return Array.from(cats);
  }, [banners]);

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
              Gerenciador de banners
            </h1>
            <p className="mt-2 text-text-secondary">
              Catálogo de banners promocionais conectado ao backend, com filtros
              operacionais e métricas em tempo real.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => bannersQuery.refetch()}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar
            </Button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="border-border/60 bg-card/70 p-5">
            <p className="text-sm text-text-secondary">Banners filtrados</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">
              {summary?.totalBanners ?? 0}
            </p>
          </Card>
          <Card className="border-border/60 bg-card/70 p-5">
            <p className="text-sm text-text-secondary">Ativos</p>
            <p className="mt-2 text-3xl font-semibold text-emerald-400">
              {summary?.activeBanners ?? 0}
            </p>
          </Card>
          <Card className="border-border/60 bg-card/70 p-5">
            <p className="text-sm text-text-secondary">Downloads acumulados</p>
            <p className="mt-2 text-3xl font-semibold text-accent-cyan">
              {summary?.totalDownloads ?? 0}
            </p>
          </Card>
          <Card className="border-border/60 bg-card/70 p-5">
            <p className="text-sm text-text-secondary">Formatos distintos</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">
              {Object.keys(summary?.dimensionsCount ?? {}).length}
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
                  placeholder="Buscar por título, categoria ou descrição"
                />
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Status</p>
              <Select
                value={statusFilter}
                onValueChange={(value: "all" | BannerStatus) => {
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
              <p className="mb-2 text-sm font-medium text-foreground">
                Formato
              </p>
              <Select
                value={dimensionsFilter}
                onValueChange={(value: string) => {
                  setPage(1);
                  setDimensionsFilter(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Dimensões" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as dimensões</SelectItem>
                  {dimensionOptions.map((dimension) => (
                    <SelectItem key={dimension} value={dimension}>
                      {dimension}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        <Card className="border-border/60 bg-card/70 overflow-hidden">
          <div className="border-b border-border/60 px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Catálogo de banners
                </h2>
                <p className="mt-1 text-sm text-text-secondary">
                  {bannersQuery.data?.pagination?.total ?? 0} banners
                  disponíveis para a campanha atual.
                </p>
              </div>
              <Badge className="border-accent-cyan/30 bg-accent-cyan/10 text-accent-cyan">
                <Layers className="mr-1 h-3 w-3" />
                {summary?.totalBanners ?? 0} itens visíveis
              </Badge>
            </div>
          </div>

          {bannersQuery.isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-accent-cyan" />
            </div>
          ) : bannersQuery.isError ? (
            <div className="px-5 py-16 text-center text-text-secondary">
              Não foi possível carregar os banners agora.
            </div>
          ) : banners.length === 0 ? (
            <div className="px-5 py-16 text-center text-text-secondary">
              Nenhum banner corresponde aos filtros selecionados.
            </div>
          ) : (
            <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
              {banners.map((banner) => (
                <Card
                  key={banner.id}
                  className="border-border/60 bg-background/30 transition hover:border-accent-cyan/40"
                >
                  <div className="relative h-40 overflow-hidden rounded-t-lg bg-black/40">
                    {banner.imageUrl ? (
                      <img
                        src={banner.imageUrl}
                        alt={banner.title}
                        className="h-full w-full object-cover opacity-90"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-text-muted">
                        <ImageIcon className="h-10 w-10" />
                      </div>
                    )}
                    <Badge
                      className={`absolute right-3 top-3 ${statusMeta[banner.status].className}`}
                    >
                      {statusMeta[banner.status].label}
                    </Badge>
                  </div>

                  <CardHeader className="space-y-2">
                    <CardTitle className="text-base text-foreground">
                      {banner.title}
                    </CardTitle>
                    <p className="text-sm text-text-secondary">
                      {banner.description}
                    </p>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2 text-xs">
                      <Badge
                        variant="outline"
                        className="border-border/60 bg-background/50 text-text-secondary"
                      >
                        {categoryLabels[banner.category] ?? banner.category}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="border-border/60 bg-background/50 text-text-secondary"
                      >
                        <Ruler className="mr-1 h-3 w-3" />
                        {banner.dimensions}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="border-border/60 bg-background/50 text-text-secondary"
                      >
                        {banner.size}
                      </Badge>
                    </div>

                    <div className="rounded-lg border border-border/60 bg-card/50 p-3 text-sm text-text-secondary">
                      {banner.downloads} downloads · atualizado em{" "}
                      {new Date(banner.updatedAt).toLocaleDateString("pt-BR")}
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedBanner(banner)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Detalhes
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(banner.downloadUrl)}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copiar
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleOpen(banner.downloadUrl)}
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

        {selectedBanner ? (
          <Card className="border-border/60 bg-card/70 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-semibold text-foreground">
                    {selectedBanner.title}
                  </h2>
                  <Badge
                    className={statusMeta[selectedBanner.status].className}
                  >
                    {statusMeta[selectedBanner.status].label}
                  </Badge>
                </div>
                <p className="text-sm text-text-secondary">
                  {selectedBanner.description}
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge
                    variant="outline"
                    className="border-border/60 bg-background/50 text-text-secondary"
                  >
                    {categoryLabels[selectedBanner.category] ??
                      selectedBanner.category}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-border/60 bg-background/50 text-text-secondary"
                  >
                    {selectedBanner.dimensions}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-border/60 bg-background/50 text-text-secondary"
                  >
                    {selectedBanner.size}
                  </Badge>
                </div>
                <p className="text-xs text-text-muted">
                  Publicado em{" "}
                  {new Date(selectedBanner.createdAt).toLocaleDateString(
                    "pt-BR",
                  )}{" "}
                  · {selectedBanner.downloads} downloads
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleCopy(selectedBanner.downloadUrl)}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copiar link
                </Button>
                <Button onClick={() => handleOpen(selectedBanner.downloadUrl)}>
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
