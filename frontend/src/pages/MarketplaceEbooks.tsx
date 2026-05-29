import { useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMarketplaceProfile } from "@/hooks/useMarketplaceProfile";
import { formatCurrency, getMarketplaceEbooks, getPackBySlug } from "@/lib/nexus-marketplace";
import {
  BookOpen,
  CheckCircle2,
  Download,
  ExternalLink,
  Lock,
  ShoppingCart,
  Sparkles,
  Star,
  Tag,
  TrendingUp,
  Zap,
} from "lucide-react";

type FilterMode = "all" | "active" | "locked";

const FILTERS: Array<{ id: FilterMode; label: string }> = [
  { id: "all", label: "Todos" },
  { id: "active", label: "Liberados" },
  { id: "locked", label: "Bloqueados" },
];

export default function MarketplaceEbooks() {
  const { profile } = useMarketplaceProfile();
  const ebooks = getMarketplaceEbooks(profile);
  const [filter, setFilter] = useState<FilterMode>("all");
  const [category, setCategory] = useState<string>("all");

  const activeCount = ebooks.filter((ebook) => ebook.status === "active").length;
  const lockedCount = ebooks.length - activeCount;
  const totalMarginCents = useMemo(
    () => ebooks.reduce((sum, ebook) => sum + (ebook.resalePriceCents - ebook.costCents), 0),
    [ebooks],
  );

  const categories = useMemo(() => ["all", ...Array.from(new Set(ebooks.map((ebook) => ebook.category)))], [ebooks]);

  const filtered = useMemo(() => {
    return ebooks.filter((ebook) => {
      const matchesFilter =
        filter === "all" ? true : filter === "active" ? ebook.status === "active" : ebook.status === "locked";
      const matchesCategory = category === "all" ? true : ebook.category === category;
      return matchesFilter && matchesCategory;
    });
  }, [category, ebooks, filter]);

  const featured = filtered[0] ?? ebooks[0];

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-8">
        <section className="overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(124,255,178,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(0,229,255,0.12),transparent_30%),linear-gradient(180deg,rgba(15,23,42,0.94),rgba(2,6,23,0.98))] p-6 shadow-2xl shadow-black/30 md:p-8">
          <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr] xl:items-center">
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2">
                <Badge className="border border-quantum-lime/30 bg-quantum-lime/10 text-quantum-lime">Loja Virtual de e-books</Badge>
                <Badge className="border border-white/10 bg-white/5 text-slate-200">Margem de 100% na revenda</Badge>
                <Badge className="border border-white/10 bg-white/5 text-slate-200">HTML + PDF prontos</Badge>
              </div>
              <div className="space-y-4">
                <h1 className="max-w-4xl text-4xl font-black tracking-tight text-white md:text-5xl xl:text-6xl">
                  Uma vitrine de <span className="text-quantum-lime">e-books digitais</span> com visual de loja moderna.
                </h1>
                <p className="max-w-3xl text-base leading-7 text-slate-300 md:text-lg">
                  Reorganizamos a biblioteca em formato mais comercial: capas em destaque, filtros de catálogo, margem explícita, entrega digital imediata
                  e botões de ação mais claros para transformar o Marketplace em uma experiência de compra mais atraente.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">liberados</p>
                  <p className="mt-3 text-3xl font-bold text-quantum-lime">{activeCount}</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">bloqueados</p>
                  <p className="mt-3 text-3xl font-bold text-amber-300">{lockedCount}</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">margem total</p>
                  <p className="mt-3 text-3xl font-bold text-white">{formatCurrency(totalMarginCents)}</p>
                </div>
              </div>
            </div>

            <Card className="overflow-hidden border-white/10 bg-white/6 backdrop-blur">
              <div className={`relative h-56 bg-gradient-to-br ${featured.coverGradient}`}>
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.12),rgba(2,6,23,0.78))]" />
                <div className="relative flex h-full flex-col justify-between p-6 text-white">
                  <div className="flex items-start justify-between gap-3">
                    <Badge className="border border-white/20 bg-white/10 text-white">
                      <Tag className="mr-1 h-3 w-3" />
                      {featured.category}
                    </Badge>
                    <Badge className="border border-white/20 bg-black/25 text-white">{featured.pages} páginas</Badge>
                  </div>
                  <div>
                    <p className="text-3xl font-black leading-tight">{featured.title}</p>
                    <p className="mt-2 text-sm text-slate-100/90">{featured.subtitle}</p>
                  </div>
                </div>
              </div>
              <CardContent className="space-y-4 p-6">
                <div>
                  <p className="text-lg font-semibold text-white">Produto em destaque</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{featured.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">custo afiliado</p>
                    <p className="mt-2 text-xl font-bold text-white">{formatCurrency(featured.costCents)}</p>
                  </div>
                  <div className="rounded-2xl border border-quantum-lime/25 bg-quantum-lime/10 p-4">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-quantum-lime">preço de revenda</p>
                    <p className="mt-2 text-xl font-bold text-quantum-lime">{formatCurrency(featured.resalePriceCents)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-4">
          {[
            {
              title: "Capa premium",
              description: "Cada card agora funciona como mini-vitrine com impacto visual melhor na primeira leitura.",
              icon: Star,
              accent: "text-amber-300",
            },
            {
              title: "Lucro claro",
              description: "Preço de custo, revenda e margem aparecem com mais destaque para acelerar decisão comercial.",
              icon: TrendingUp,
              accent: "text-quantum-lime",
            },
            {
              title: "Entrega instantânea",
              description: "Arquivos HTML e PDF ficam prontos para visualização e download quando desbloqueados.",
              icon: Zap,
              accent: "text-quantum-cyan",
            },
            {
              title: "Experiência de loja",
              description: "Filtros, badges e CTAs deixam o Marketplace mais próximo de um mini e-commerce moderno.",
              icon: ShoppingCart,
              accent: "text-quantum-purple",
            },
          ].map((item) => (
            <Card key={item.title} className="border-white/10 bg-white/5 backdrop-blur transition hover:-translate-y-1 hover:border-white/20">
              <CardContent className="space-y-3 p-5">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 ${item.accent}`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{item.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="rounded-[32px] border border-white/10 bg-white/5 p-5 backdrop-blur md:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <Badge className="border border-white/10 bg-white/5 text-slate-200">Catálogo filtrável</Badge>
              <h2 className="mt-3 text-2xl font-bold text-white md:text-3xl">Encontre o produto certo para sua vitrine</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Explore por status e categoria para navegar como em uma loja digital profissional.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFilter(item.id)}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                    filter === item.id
                      ? "border-quantum-lime/60 bg-quantum-lime/15 text-quantum-lime"
                      : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                  category === item
                    ? "border-quantum-cyan/60 bg-quantum-cyan/15 text-quantum-cyan"
                    : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-white"
                }`}
              >
                {item === "all" ? "Todas as categorias" : item}
              </button>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {filtered.map((ebook, index) => {
            const isActive = ebook.status === "active";
            const unlockPack = getPackBySlug(ebook.unlockPackSlug);
            const isFeatured = index === 0;

            return (
              <Card
                key={ebook.slug}
                className={`overflow-hidden border backdrop-blur transition hover:-translate-y-1 hover:border-white/20 ${
                  isActive ? "border-quantum-lime/30 bg-quantum-lime/5" : "border-white/10 bg-white/5"
                }`}
              >
                <div className={`relative h-44 bg-gradient-to-br ${ebook.coverGradient}`}>
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.10),rgba(2,6,23,0.76))]" />
                  <div className="relative flex h-full flex-col justify-between p-5 text-white">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-wrap gap-2">
                        <Badge className="border border-white/20 bg-white/10 text-white">
                          <Tag className="mr-1 h-3 w-3" />
                          {ebook.category}
                        </Badge>
                        {isFeatured && (
                          <Badge className="border border-amber-300/30 bg-amber-300/10 text-amber-200">Destaque</Badge>
                        )}
                      </div>
                      <span className="rounded-full bg-black/25 px-2.5 py-1 text-xs">{ebook.pages} págs</span>
                    </div>
                    <div>
                      <p className="text-2xl font-black leading-tight">{ebook.title}</p>
                      <p className="mt-2 text-sm text-slate-100/85">{ebook.subtitle}</p>
                    </div>
                  </div>
                </div>

                <CardContent className="space-y-4 p-5">
                  <p className="text-sm leading-6 text-slate-300">{ebook.description}</p>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Custo</p>
                      <p className="mt-1 text-lg font-bold text-white">{formatCurrency(ebook.costCents)}</p>
                    </div>
                    <div className="rounded-2xl border border-quantum-lime/20 bg-quantum-lime/10 p-3">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-quantum-lime">Revenda</p>
                      <p className="mt-1 text-lg font-bold text-quantum-lime">{formatCurrency(ebook.resalePriceCents)}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-slate-300">
                    <p className="flex items-center gap-1.5">
                      <TrendingUp className="h-3.5 w-3.5 text-quantum-lime" />
                      <span>
                        Margem por unidade: <strong className="text-quantum-lime">{formatCurrency(ebook.resalePriceCents - ebook.costCents)}</strong>
                      </span>
                    </p>
                    <p className="mt-2 flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5 text-quantum-cyan" />
                      <span>Desbloqueio pelo pack {unlockPack?.shortName ?? "A²"}</span>
                    </p>
                  </div>

                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {ebook.highlights.map((highlight) => (
                      <li key={highlight} className="flex items-start gap-2">
                        <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-quantum-cyan" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {isActive ? (
                      <>
                        <a href={ebook.htmlPath} target="_blank" rel="noreferrer" className="flex-1 min-w-[150px]">
                          <Button variant="outline" className="w-full border-white/15 bg-white/5 text-white hover:bg-white/10">
                            <ExternalLink className="mr-1 h-4 w-4" />
                            Visualizar
                          </Button>
                        </a>
                        <a href={ebook.pdfPath} download className="flex-1 min-w-[150px]">
                          <Button className="gradient-btn w-full">
                            <Download className="mr-1 h-4 w-4" />
                            Baixar PDF
                          </Button>
                        </a>
                      </>
                    ) : (
                      <Button variant="outline" disabled className="w-full border-white/10 bg-white/5 text-slate-400">
                        <Lock className="mr-2 h-4 w-4" />
                        Bloqueado até ativar {unlockPack?.shortName ?? "Pack A²"}
                      </Button>
                    )}
                  </div>

                  {isActive && (
                    <div className="flex items-center gap-2 rounded-full border border-quantum-lime/20 bg-quantum-lime/10 px-3 py-1.5 text-[11px] text-quantum-lime">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Produto liberado para sua loja e mini-site
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardContent className="p-5">
              <ShoppingCart className="h-5 w-5 text-quantum-cyan" />
              <p className="mt-3 text-sm font-semibold text-white">Venda direta com posicionamento claro</p>
              <p className="mt-2 text-xs leading-6 text-slate-400">
                A experiência de loja destaca custo, revenda, margem e desbloqueio para facilitar seu uso comercial.
              </p>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardContent className="p-5">
              <BookOpen className="h-5 w-5 text-quantum-lime" />
              <p className="mt-3 text-sm font-semibold text-white">Conteúdo entregue em múltiplos formatos</p>
              <p className="mt-2 text-xs leading-6 text-slate-400">
                Cada item fica pronto em HTML e PDF, permitindo revenda rápida e distribuição organizada.
              </p>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardContent className="p-5">
              <Sparkles className="h-5 w-5 text-quantum-purple" />
              <p className="mt-3 text-sm font-semibold text-white">Pronto para expansão futura</p>
              <p className="mt-2 text-xs leading-6 text-slate-400">
                A nova estrutura aceita novos produtos, coleções, combos e futuros destaques promocionais com muito mais elegância.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </DashboardLayout>
  );
}
