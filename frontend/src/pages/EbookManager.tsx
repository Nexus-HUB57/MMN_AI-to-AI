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
  ExternalLink,
  Loader2,
  RefreshCw,
  Search,
  Star,
} from "lucide-react";
import { toast } from "sonner";

/**
 * EbookManager — agora consome o catálogo REAL via marketplaceNexus.listEbooks.
 * Cada item devolvido pelo backend tem:
 *  slug, order, title, subtitle, description, costCents, resalePriceCents,
 *  pages, category, coverGradient, htmlPath, pdfPath, coverPath,
 *  highlights, unlockPackSlug, status.
 */

type RealEbook = {
  slug: string;
  order: number;
  title: string;
  subtitle?: string;
  description?: string;
  costCents: number;
  resalePriceCents: number;
  pages: number;
  category: string;
  coverGradient?: string;
  htmlPath?: string;
  pdfPath?: string;
  coverPath?: string;
  highlights?: string[];
  unlockPackSlug?: string;
  status: string;
};

const PACK_LABEL: Record<string, string> = {
  "pack-a2": "Pack A² · Agente Afiliado",
  "pack-a2ii": "Pack A² II",
  "pack-a2iii": "Pack A² III",
  "pack-ag": "Pack AG · Generativo",
  "pack-agii": "Pack AG II",
  "pack-agiii": "Pack AG III",
  "pack-agn": "Pack AGN",
  "pack-agnii": "Pack AGN II",
  "pack-agniii": "Pack AGN III",
  "pack-ao": "Pack AO · Orquestrador",
  "pack-aoii": "Pack AO II",
  "pack-aoiii": "Pack AO III",
  "pack-aa": "Pack AA · Agêntica",
  "pack-aaii": "Pack AA II",
  "pack-aaiii": "Pack AA III",
};

function formatBRL(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format((cents ?? 0) / 100);
}

export default function EbookManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [packFilter, setPackFilter] = useState<string>("all");

  const ebooksQuery = (trpc as any).marketplaceNexus.listEbooks.useQuery(
    {},
    { staleTime: 60_000 },
  );

  const allEbooks: RealEbook[] = useMemo(() => {
    const data = ebooksQuery.data;
    if (Array.isArray(data)) return data as RealEbook[];
    if (data && Array.isArray((data as any).items)) return (data as any).items;
    if (data && Array.isArray((data as any).ebooks)) return (data as any).ebooks;
    return [];
  }, [ebooksQuery.data]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    allEbooks.forEach((e) => e.category && set.add(e.category));
    return Array.from(set).sort();
  }, [allEbooks]);

  const packs = useMemo(() => {
    const set = new Set<string>();
    allEbooks.forEach((e) => e.unlockPackSlug && set.add(e.unlockPackSlug));
    return Array.from(set).sort();
  }, [allEbooks]);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return allEbooks.filter((e) => {
      if (categoryFilter !== "all" && e.category !== categoryFilter)
        return false;
      if (packFilter !== "all" && e.unlockPackSlug !== packFilter) return false;
      if (term) {
        const hay = `${e.title} ${e.subtitle ?? ""} ${e.description ?? ""} ${e.category} ${e.unlockPackSlug ?? ""}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
  }, [allEbooks, searchTerm, categoryFilter, packFilter]);

  const summary = useMemo(() => {
    const totalPages = allEbooks.reduce((acc, e) => acc + (e.pages ?? 0), 0);
    const totalResale = allEbooks.reduce(
      (acc, e) => acc + (e.resalePriceCents ?? 0),
      0,
    );
    const totalCost = allEbooks.reduce((acc, e) => acc + (e.costCents ?? 0), 0);
    const byPack: Record<string, number> = {};
    allEbooks.forEach((e) => {
      const k = e.unlockPackSlug ?? "sem-pack";
      byPack[k] = (byPack[k] ?? 0) + 1;
    });
    return {
      total: allEbooks.length,
      totalPages,
      totalResaleCents: totalResale,
      totalCostCents: totalCost,
      avgPages: allEbooks.length
        ? Math.round(totalPages / allEbooks.length)
        : 0,
      byPack,
    };
  }, [allEbooks]);

  const featured = useMemo(
    () =>
      [...filtered]
        .sort((a, b) => (b.resalePriceCents ?? 0) - (a.resalePriceCents ?? 0))
        .slice(0, 3),
    [filtered],
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
      <div className="space-y-8 px-4 py-6 md:px-6">
        <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-quantum-cyan">
              // marketplaceNexus.listEbooks · dados reais
            </p>
            <h1 className="mt-1 text-3xl font-bold text-white">
              Biblioteca de e-books · catálogo Nexus
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              {summary.total} e-books oficiais carregados do backend, com
              filtros por pack de desbloqueio, categoria e busca textual.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => ebooksQuery.refetch()}
              className="border-white/15 bg-white/5 text-white hover:bg-white/10"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar catálogo
            </Button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-widest text-slate-400">
              Total de e-books
            </p>
            <p className="mt-2 text-3xl font-bold text-white">
              {summary.total}
            </p>
          </Card>
          <Card className="border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-widest text-slate-400">
              Páginas acumuladas
            </p>
            <p className="mt-2 text-3xl font-bold text-quantum-cyan">
              {summary.totalPages.toLocaleString("pt-BR")}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              ≈ {summary.avgPages} páginas/ebook
            </p>
          </Card>
          <Card className="border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-widest text-slate-400">
              Receita potencial (revenda)
            </p>
            <p className="mt-2 text-3xl font-bold text-emerald-300">
              {formatBRL(summary.totalResaleCents)}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              Custo base: {formatBRL(summary.totalCostCents)}
            </p>
          </Card>
          <Card className="border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-widest text-slate-400">
              Packs com desbloqueio
            </p>
            <p className="mt-2 text-3xl font-bold text-amber-300">
              {Object.keys(summary.byPack).length}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              Distribuição cumulativa por pack
            </p>
          </Card>
        </section>

        <Card className="border-white/10 bg-white/5 p-5">
          <div className="grid gap-4 xl:grid-cols-[1.4fr_220px_260px] xl:items-end">
            <div>
              <p className="mb-2 text-sm font-medium text-white">Busca</p>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="pl-10"
                  placeholder="Buscar por título, descrição, categoria ou pack"
                />
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-white">Categoria</p>
              <Select
                value={categoryFilter}
                onValueChange={(value: string) => setCategoryFilter(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-white">
                Pack de desbloqueio
              </p>
              <Select
                value={packFilter}
                onValueChange={(value: string) => setPackFilter(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pack" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os packs</SelectItem>
                  {packs.map((p) => (
                    <SelectItem key={p} value={p}>
                      {PACK_LABEL[p] ?? p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {featured.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-white">Em destaque</h2>
            <p className="mt-1 text-sm text-slate-400">
              Top e-books com maior valor de revenda no filtro atual.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {featured.map((ebook) => (
                <Card
                  key={ebook.slug}
                  className="border-white/10 bg-black/30 transition hover:border-quantum-cyan/40"
                >
                  <div
                    className={`relative h-44 overflow-hidden rounded-t-lg ${
                      ebook.coverGradient
                        ? `bg-gradient-to-br ${ebook.coverGradient}`
                        : "bg-black/40"
                    }`}
                  >
                    {ebook.coverPath ? (
                      <img
                        src={ebook.coverPath}
                        alt={ebook.title}
                        className="h-full w-full object-cover opacity-90"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-300">
                        <BookOpen className="h-10 w-10" />
                      </div>
                    )}
                    <Badge className="absolute right-3 top-3 border border-quantum-cyan/30 bg-black/60 text-quantum-cyan">
                      #{ebook.order}
                    </Badge>
                  </div>
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-base text-white">
                      {ebook.title}
                    </CardTitle>
                    <p className="text-xs text-slate-400">{ebook.category}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1 text-amber-300">
                        <Star className="h-4 w-4 fill-current" />
                        {formatBRL(ebook.resalePriceCents)}
                      </span>
                      <span className="text-slate-400">
                        {ebook.pages} páginas
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {ebook.htmlPath && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-white/15 bg-white/5 text-white hover:bg-white/10"
                          onClick={() => handleOpen(ebook.htmlPath!)}
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          HTML
                        </Button>
                      )}
                      {ebook.pdfPath && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-rose-300/30 bg-rose-300/10 text-rose-200 hover:bg-rose-300/20"
                          onClick={() => handleOpen(ebook.pdfPath!)}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          PDF
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        <Card className="overflow-hidden border-white/10 bg-white/5">
          <div className="border-b border-white/10 px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Catálogo completo
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  {filtered.length} e-book{filtered.length === 1 ? "" : "s"}{" "}
                  visível
                  {filtered.length === 1 ? "" : "s"} · {summary.total} no
                  acervo total
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(summary.byPack)
                  .sort()
                  .slice(0, 6)
                  .map(([slug, count]) => (
                    <Badge
                      key={slug}
                      className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan"
                    >
                      {PACK_LABEL[slug] ?? slug}: {count}
                    </Badge>
                  ))}
              </div>
            </div>
          </div>

          {ebooksQuery.isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-quantum-cyan" />
            </div>
          ) : ebooksQuery.isError ? (
            <div className="px-5 py-16 text-center text-rose-200">
              Não foi possível carregar o catálogo agora. Tente atualizar.
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-5 py-16 text-center text-slate-400">
              Nenhum e-book corresponde aos filtros selecionados.
            </div>
          ) : (
            <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((ebook) => (
                <Card
                  key={ebook.slug}
                  className="border-white/10 bg-black/30 transition hover:border-quantum-cyan/40"
                >
                  <div
                    className={`relative h-44 overflow-hidden rounded-t-lg ${
                      ebook.coverGradient
                        ? `bg-gradient-to-br ${ebook.coverGradient}`
                        : "bg-black/40"
                    }`}
                  >
                    {ebook.coverPath ? (
                      <img
                        src={ebook.coverPath}
                        alt={ebook.title}
                        className="h-full w-full object-cover opacity-90"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-300">
                        <BookOpen className="h-10 w-10" />
                      </div>
                    )}
                    <Badge className="absolute right-3 top-3 border border-quantum-cyan/30 bg-black/60 text-quantum-cyan">
                      #{ebook.order}
                    </Badge>
                    {ebook.unlockPackSlug && (
                      <Badge className="absolute left-3 top-3 border border-amber-300/30 bg-black/60 text-amber-200">
                        {PACK_LABEL[ebook.unlockPackSlug] ?? ebook.unlockPackSlug}
                      </Badge>
                    )}
                  </div>

                  <CardHeader className="space-y-1">
                    <CardTitle className="text-base text-white">
                      {ebook.title}
                    </CardTitle>
                    {ebook.subtitle && (
                      <p className="text-xs text-slate-400">{ebook.subtitle}</p>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {ebook.description && (
                      <p className="text-sm leading-6 text-slate-300 line-clamp-3">
                        {ebook.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 text-xs">
                      <Badge className="border border-white/15 bg-white/5 text-slate-200">
                        {ebook.category}
                      </Badge>
                      <Badge className="border border-white/15 bg-white/5 text-slate-200">
                        {ebook.pages} páginas
                      </Badge>
                      <Badge className="border border-emerald-300/30 bg-emerald-300/10 text-emerald-200">
                        Revenda {formatBRL(ebook.resalePriceCents)}
                      </Badge>
                      <Badge className="border border-rose-300/30 bg-rose-300/10 text-rose-200">
                        Custo {formatBRL(ebook.costCents)}
                      </Badge>
                    </div>

                    {ebook.highlights && ebook.highlights.length > 0 && (
                      <ul className="space-y-1 text-xs text-slate-400">
                        {ebook.highlights.slice(0, 3).map((h, i) => (
                          <li key={i} className="line-clamp-1">
                            • {h}
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="grid grid-cols-3 gap-2">
                      {ebook.htmlPath && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-white/15 bg-white/5 text-white hover:bg-white/10"
                          onClick={() => handleOpen(ebook.htmlPath!)}
                        >
                          <ExternalLink className="mr-1 h-3 w-3" />
                          HTML
                        </Button>
                      )}
                      {ebook.pdfPath && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-rose-300/30 bg-rose-300/10 text-rose-200 hover:bg-rose-300/20"
                          onClick={() => handleOpen(ebook.pdfPath!)}
                        >
                          <Download className="mr-1 h-3 w-3" />
                          PDF
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white/15 bg-white/5 text-white hover:bg-white/10"
                        onClick={() =>
                          handleCopy(
                            ebook.pdfPath
                              ? `https://oneverso.com.br${ebook.pdfPath}`
                              : ebook.htmlPath
                                ? `https://oneverso.com.br${ebook.htmlPath}`
                                : ebook.slug,
                          )
                        }
                      >
                        <Copy className="mr-1 h-3 w-3" />
                        Link
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
