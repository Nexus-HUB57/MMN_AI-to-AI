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
  Tag,
  TrendingUp,
} from "lucide-react";

export default function MarketplaceEbooks() {
  const { profile } = useMarketplaceProfile();
  const ebooks = getMarketplaceEbooks(profile);
  const activeCount = ebooks.filter((ebook) => ebook.status === "active").length;
  const lockedCount = ebooks.length - activeCount;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <section className="rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(124,255,178,0.10),transparent_35%),linear-gradient(180deg,rgba(15,23,42,0.88),rgba(2,6,23,0.96))] p-6 shadow-2xl shadow-black/20">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3 max-w-3xl">
              <Badge className="border border-quantum-lime/30 bg-quantum-lime/10 text-quantum-lime">
                Catálogo inicial de e-books · Marketplace Nexus
              </Badge>
              <h1 className="text-3xl font-bold text-white md:text-4xl">
                5 e-books oficiais · custo R$ 0,50 · revenda R$ 1,00
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
                Esta é a biblioteca inicial liberada com o Pack Agente Afiliado A². Cada e-book entra no Marketplace com custo de aquisição de R$ 0,50 para o afiliado e preço de revenda de R$ 1,00, gerando margem de 100%. Os arquivos HTML e PDF são gerados localmente e prontos para distribuição.
              </p>
            </div>
            <Card className="w-full max-w-md border-white/10 bg-white/5 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <BookOpen className="h-5 w-5 text-quantum-lime" />
                  Status da biblioteca
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Acesso liberado pelo Pack A² após ativação.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-400">Liberados</p>
                  <p className="mt-2 text-2xl font-bold text-quantum-lime">{activeCount}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-400">Bloqueados</p>
                  <p className="mt-2 text-2xl font-bold text-amber-300">{lockedCount}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {ebooks.map((ebook) => {
            const isActive = ebook.status === "active";
            const unlockPack = getPackBySlug(ebook.unlockPackSlug);

            return (
              <Card
                key={ebook.slug}
                className={`overflow-hidden border backdrop-blur ${
                  isActive
                    ? "border-quantum-lime/30 bg-quantum-lime/5"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <div className={`relative h-36 bg-gradient-to-br ${ebook.coverGradient}`}>
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="relative flex h-full flex-col justify-between p-5 text-white">
                    <div className="flex items-start justify-between">
                      <Badge className="border border-white/30 bg-white/10 text-white">
                        <Tag className="mr-1 h-3 w-3" />
                        {ebook.category}
                      </Badge>
                      <span className="rounded-full bg-black/30 px-2 py-0.5 text-xs">
                        {ebook.pages} páginas
                      </span>
                    </div>
                    <div>
                      <p className="text-lg font-bold leading-snug">{ebook.title}</p>
                      <p className="mt-1 text-xs opacity-80">{ebook.subtitle}</p>
                    </div>
                  </div>
                </div>

                <CardContent className="space-y-4 p-5">
                  <p className="text-sm leading-6 text-slate-300">{ebook.description}</p>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                        Custo afiliado
                      </p>
                      <p className="mt-1 text-lg font-bold text-white">
                        {formatCurrency(ebook.costCents)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-quantum-lime/20 bg-quantum-lime/10 p-3">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-quantum-lime">
                        Revenda
                      </p>
                      <p className="mt-1 text-lg font-bold text-quantum-lime">
                        {formatCurrency(ebook.resalePriceCents)}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-slate-300">
                    <p className="flex items-center gap-1.5">
                      <TrendingUp className="h-3.5 w-3.5 text-quantum-lime" />
                      <span>
                        Margem de revenda <strong className="text-quantum-lime">100%</strong> · liberado pelo {unlockPack?.shortName ?? "Pack A²"}
                      </span>
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
                        <a href={ebook.htmlPath} target="_blank" rel="noreferrer" className="flex-1">
                          <Button variant="outline" className="w-full border-white/15 bg-white/5 text-white hover:bg-white/10">
                            <ExternalLink className="mr-1 h-4 w-4" />
                            Pré-visualizar
                          </Button>
                        </a>
                        <a href={ebook.pdfPath} download className="flex-1">
                          <Button className="gradient-btn w-full">
                            <Download className="mr-1 h-4 w-4" />
                            PDF
                          </Button>
                        </a>
                      </>
                    ) : (
                      <Button variant="outline" disabled className="w-full border-white/10 bg-white/5 text-slate-400">
                        <Lock className="mr-2 h-4 w-4" />
                        Liberado após ativar {unlockPack?.shortName ?? "Pack A²"}
                      </Button>
                    )}
                  </div>

                  {isActive && (
                    <div className="flex items-center gap-2 rounded-full border border-quantum-lime/20 bg-quantum-lime/10 px-3 py-1.5 text-[11px] text-quantum-lime">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Pronto para revenda no seu mini-site
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <ShoppingCart className="h-5 w-5 text-quantum-cyan" />
              <p className="mt-3 text-sm font-semibold text-white">Vendas diretas</p>
              <p className="mt-1 text-xs text-slate-400">
                100% do lucro fica com o afiliado. Margem garantida de R$ 0,50 por e-book vendido.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <BookOpen className="h-5 w-5 text-quantum-lime" />
              <p className="mt-3 text-sm font-semibold text-white">PDF + HTML</p>
              <p className="mt-1 text-xs text-slate-400">
                Cada e-book está disponível em HTML responsivo e PDF pronto para Hotmart, Kiwify, Eduzz e Amazon KDP.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <Sparkles className="h-5 w-5 text-quantum-purple" />
              <p className="mt-3 text-sm font-semibold text-white">Geração via IA</p>
              <p className="mt-1 text-xs text-slate-400">
                Templates já estruturados para gerar o conteúdo completo em ChatGPT, Claude ou Gemini quando necessário.
              </p>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
