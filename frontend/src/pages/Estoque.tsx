import { useMemo, useState, type ReactNode } from "react";
import { Link } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useMarketplaceProfile } from "@/hooks/useMarketplaceProfile";
import {
  EXTERNAL_MARKETPLACES,
  MARKETPLACE_EBOOKS,
  getOperationalInventory,
  type OperationalStockItem,
} from "@/lib/nexus-marketplace";
import { resolveShowcaseMarketplaceProfile } from "@/lib/public-marketplace";
import { NEXUS_PARTNERS, getPartnerBySlug, type PartnerConfig } from "@/lib/nexus-partners";
import { buildMarketplaceCheckoutUrl, parseCurrencyTextToCents } from "@/lib/marketplace-payments";
import {
  buildMiniSiteCatalogItem,
  loadMiniSiteCatalog,
  toggleOperationalItemSync,
} from "@/lib/minisite-catalog";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Flame,
  Layers,
  Package,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Store,
  Tag,
  TrendingUp,
  Zap,
} from "lucide-react";

type PartnerFeed = PartnerConfig;

type TrendingProduct = {
  id: string;
  title: string;
  platform: "Hotmart" | "Shopee" | "Mercado Livre";
  platformSlug: "hotmart" | "shopee" | "mercado-livre";
  category: string;
  commission: string;
  avgPrice: string;
  fulfillment: "Dropshipping" | "Pronta Entrega";
  productUrl?: string;
  thumbnail?: string;
  source?: "live" | "curated";
};

type TrendingCardProduct = TrendingProduct & { color: string };

type Tab = "produtos" | "tendencias";

const TRENDING_FALLBACK: TrendingProduct[] = [
  {
    id: "trend-hotmart-1",
    title: "Curso Marketing IA · Lançamento Premium",
    platform: "Hotmart",
    platformSlug: "hotmart",
    category: "Infoproduto",
    commission: "60%",
    avgPrice: "R$ 997,00",
    fulfillment: "Dropshipping",
    productUrl: "https://app-vlc.hotmart.com",
    source: "curated",
  },
  {
    id: "trend-shopee-1",
    title: "Kit Smart Home · Iluminação RGB Wi-Fi",
    platform: "Shopee",
    platformSlug: "shopee",
    category: "Eletrônico",
    commission: "12%",
    avgPrice: "R$ 189,90",
    fulfillment: "Dropshipping",
    productUrl: "https://affiliate.shopee.com.br",
    source: "curated",
  },
  {
    id: "trend-ml-1",
    title: "Cadeira Gamer Ergonômica Pro",
    platform: "Mercado Livre",
    platformSlug: "mercado-livre",
    category: "Móvel",
    commission: "8%",
    avgPrice: "R$ 1.299,00",
    fulfillment: "Dropshipping",
    productUrl: "https://www.mercadolivre.com.br",
    source: "curated",
  },
  {
    id: "trend-hotmart-2",
    title: "Mentoria Tráfego Pago para Afiliados",
    platform: "Hotmart",
    platformSlug: "hotmart",
    category: "Infoproduto",
    commission: "50%",
    avgPrice: "R$ 497,00",
    fulfillment: "Dropshipping",
    productUrl: "https://app-vlc.hotmart.com",
    source: "curated",
  },
  {
    id: "trend-shopee-2",
    title: "Suplemento Beauty Collagen · Linha Premium",
    platform: "Shopee",
    platformSlug: "shopee",
    category: "Saúde & Bem-estar",
    commission: "15%",
    avgPrice: "R$ 89,90",
    fulfillment: "Dropshipping",
    productUrl: "https://affiliate.shopee.com.br",
    source: "curated",
  },
  {
    id: "trend-ml-2",
    title: "Câmera Action 4K com Estabilizador",
    platform: "Mercado Livre",
    platformSlug: "mercado-livre",
    category: "Eletrônico",
    commission: "9%",
    avgPrice: "R$ 689,00",
    fulfillment: "Dropshipping",
    productUrl: "https://www.mercadolivre.com.br",
    source: "curated",
  },
];

const PLATFORM_COLORS: Record<TrendingProduct["platformSlug"], string> = {
  hotmart: "#EF4E23",
  shopee: "#EE4D2D",
  "mercado-livre": "#FFE600",
};

const PLATFORM_ICONS: Record<string, typeof ShoppingBag> = {
  ShoppingBag,
  Flame,
  ShoppingCart,
  Tag,
};

function isSyncableItem(item: OperationalStockItem) {
  return item.type === "ebooks" || item.type === "preu";
}

export default function Estoque() {
  const { profile } = useMarketplaceProfile();
  const { isAuthenticated } = useAuth();
  const [tab, setTab] = useState<Tab>("produtos");
  const [catalogVersion, setCatalogVersion] = useState(0);

  const showcaseProfile = useMemo(
    () => resolveShowcaseMarketplaceProfile(profile, isAuthenticated),
    [isAuthenticated, profile],
  );

  const partnersQuery = trpc.partners.list.useQuery(undefined, {
    retry: 0,
    staleTime: 1000 * 60 * 10,
  });
  const trendingQuery = trpc.partners.trending.useQuery(
    { limit: 12 },
    {
      retry: 0,
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  );

  const stockItems = useMemo(() => getOperationalInventory(showcaseProfile), [showcaseProfile]);
  const myProducts = stockItems.filter((item) => isSyncableItem(item));
  const packsActivated = stockItems.filter((item) => item.type === "pack");

  const syncedIds = useMemo(() => {
    const ids = loadMiniSiteCatalog().map((item) => item.sourceItemId);
    return new Set(ids);
  }, [catalogVersion]);

  const productsForVitrine = useMemo(
    () => myProducts.map((item) => ({ item, catalogItem: buildMiniSiteCatalogItem(item) })).filter((entry) => entry.catalogItem),
    [myProducts],
  ) as Array<{ item: OperationalStockItem; catalogItem: NonNullable<ReturnType<typeof buildMiniSiteCatalogItem>> }>;

  const totalUnits = myProducts.reduce((acc, item) => acc + item.quantity, 0);
  const syncedCount = syncedIds.size;

  const partners: PartnerFeed[] = useMemo(() => {
    const livePartners = partnersQuery.data?.partners;
    return Array.isArray(livePartners) && livePartners.length > 0 ? livePartners : NEXUS_PARTNERS;
  }, [partnersQuery.data?.partners]);

  const trendingProducts: TrendingCardProduct[] = useMemo(() => {
    const liveProducts = trendingQuery.data?.products;
    const base = Array.isArray(liveProducts) && liveProducts.length > 0 ? liveProducts : TRENDING_FALLBACK;
    return base.map((product) => ({
      ...product,
      color: PLATFORM_COLORS[product.platformSlug] ?? "#38BDF8",
    }));
  }, [trendingQuery.data?.products]);

  const feedMeta = useMemo(() => {
    const updatedAt = trendingQuery.data?.updatedAt
      ? new Date(trendingQuery.data.updatedAt).toLocaleString("pt-BR")
      : null;
    const liveCount = trendingQuery.data?.sources?.live ?? 0;
    const curatedCount = trendingQuery.data?.sources?.curated ?? trendingProducts.length;
    const isLive = Boolean(trendingQuery.data?.products?.length);
    return { updatedAt, liveCount, curatedCount, isLive };
  }, [trendingProducts.length, trendingQuery.data]);

  const handleSync = (item: OperationalStockItem) => {
    toggleOperationalItemSync(item);
    setCatalogVersion((current) => current + 1);
  };

  const content = (
    <div className="space-y-8">
        <section className="rounded-2xl border border-quantum-cyan/30 bg-quantum-cyan/5 p-4 text-sm text-quantum-cyan/90">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <p>
                <strong className="text-white">Nexus SaaS</strong> está vinculada às plataformas parceiras. O Agente IA usa o perfil oficial para revenda, tracking de comissões e sincronização do catálogo operacional.
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                <Badge className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">
                  {feedMeta.isLive ? "Feed ao vivo conectado" : "Fallback inteligente ativo"}
                </Badge>
                {feedMeta.updatedAt && <span>Atualizado em {feedMeta.updatedAt}</span>}
                {!feedMeta.isLive && !trendingQuery.isLoading && (
                  <span className="text-slate-400">
                    Enquanto o backend não estiver acessível, a página mantém a curadoria oficial Nexus SaaS em modo offline.
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              {partners.map((partner) => (
                <span key={partner.slug} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-200">
                  {partner.name}
                  {partner.affiliateId ? ` · ID ${partner.affiliateId}` : ""}
                  {partner.username ? ` · @${partner.username}` : ""}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(0,229,255,0.12),transparent_30%),linear-gradient(180deg,rgba(15,23,42,0.88),rgba(2,6,23,0.96))] p-6 shadow-2xl shadow-black/20">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="space-y-3 max-w-3xl">
              <Badge className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">
                Loja virtual do estoque · produtos prontos para automação
              </Badge>
              <h1 className="text-3xl font-bold text-white md:text-4xl">Meu Estoque</h1>
              <p className="max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
                Aqui ficam as unidades disponíveis para revenda. Cada produto pode ser exibido em formato de <strong className="text-white">vitrine</strong>, sincronizado com o Agente IA e publicado no <strong className="text-white">mini-site</strong> para vendas automatizadas.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <KpiBlock label="Packs ativos" value={packsActivated.length.toString()} tone="text-quantum-cyan" />
              <KpiBlock label="Produtos" value={myProducts.length.toString()} tone="text-quantum-lime" />
              <KpiBlock label="Unidades" value={totalUnits.toLocaleString("pt-BR")} tone="text-white" />
              <KpiBlock label="Sincronizados" value={syncedCount.toString()} tone="text-quantum-purple" />
            </div>
          </div>
        </section>

        <div className="flex flex-wrap gap-2">
          <TabButton active={tab === "produtos"} onClick={() => setTab("produtos")}>
            <Package className="mr-2 h-4 w-4" /> Minha vitrine
          </TabButton>
          <TabButton active={tab === "tendencias"} onClick={() => setTab("tendencias")}>
            <TrendingUp className="mr-2 h-4 w-4" /> Produtos em Alta
          </TabButton>
        </div>

        {tab === "produtos" && (
          <>
            <Card className="border-quantum-cyan/30 bg-quantum-cyan/5 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Store className="h-5 w-5 text-quantum-cyan" />
                  Vitrine sincronizável com o mini-site
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Use o botão <strong className="text-white">Sincronizar com Agente</strong> para publicar o produto no mini-site e habilitar a apresentação automatizada da oferta.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {productsForVitrine.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-slate-300">
                    Seu estoque ainda está vazio. Faça uma ativação mensal ou adquira mais materiais no Marketplace para abastecer o agente.
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {productsForVitrine.map(({ item, catalogItem }) => {
                      const isSynced = syncedIds.has(item.id);
                      return (
                        <StockProductCard
                          key={item.id}
                          item={item}
                          catalogItem={catalogItem}
                          isSynced={isSynced}
                          onSync={() => handleSync(item)}
                        />
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {packsActivated.length > 0 && (
              <Card className="border-white/10 bg-white/5 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Sparkles className="h-5 w-5 text-quantum-purple" />
                    Packs ativos vinculados ao estoque
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Cada pack alimenta a vitrine com cota oficial de e-books, PREU e demais materiais operacionais.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-2">
                  {packsActivated.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-white">{item.title}</p>
                          <p className="mt-1 text-xs leading-5 text-slate-400">{item.description}</p>
                        </div>
                        <Badge className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">
                          {item.badge}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card className="border-amber-400/30 bg-amber-400/5 backdrop-blur">
              <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2 text-sm text-amber-100">
                  <p className="inline-flex items-center gap-2 font-semibold text-amber-200">
                    <AlertCircle className="h-4 w-4" />
                    Fluxo operacional recomendado
                  </p>
                  <p>
                    Estoque → sincronização com o agente → mini-site → apresentação automatizada → pagamento.
                  </p>
                  <p className="text-amber-100/80">
                    Produtos de <strong>Pronta Entrega</strong> exigem atenção à quantidade disponível. Itens de <strong>Dropshipping</strong> seguem a disponibilidade das plataformas parceiras.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link href="/minisite">
                    <Button className="gradient-btn">
                      Ver mini-site
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/marketplaces?focus=monthly-activation">
                    <Button variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10">
                      Comprar mais materiais
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {tab === "tendencias" && (
          <>
            <Card className="border-quantum-purple/30 bg-quantum-purple/5 backdrop-blur">
              <CardHeader>
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <TrendingUp className="h-5 w-5 text-quantum-purple" />
                      Produtos em Alta nas plataformas parceiras
                    </CardTitle>
                    <CardDescription className="mt-2 text-slate-300">
                      Curadoria automática de produtos com alta procura e alto potencial de comissionamento na Shopee, Hotmart e Mercado Livre.
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <Badge className="border border-white/10 bg-white/5 text-slate-200">{feedMeta.liveCount} ao vivo</Badge>
                    <Badge className="border border-white/10 bg-white/5 text-slate-200">{feedMeta.curatedCount} curados</Badge>
                    {trendingQuery.isLoading && (
                      <Badge className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">
                        Atualizando feed...
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {trendingProducts.map((product) => {
                  const partner = partners.find((item) => item.slug === product.platformSlug) ?? getPartnerBySlug(product.platformSlug);
                  return (
                    <div key={product.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold leading-snug text-white">{product.title}</p>
                          <p className="mt-1 text-xs text-slate-400">{product.category}</p>
                        </div>
                        <Badge
                          className="border"
                          style={{
                            borderColor: `${product.color}55`,
                            backgroundColor: `${product.color}15`,
                            color: product.color,
                          }}
                        >
                          {product.platform}
                        </Badge>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-lg border border-white/10 bg-white/5 px-2 py-1.5">
                          <p className="uppercase tracking-[0.2em] text-slate-500">Comissão</p>
                          <p className="mt-1 font-semibold text-quantum-lime">{product.commission}</p>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-white/5 px-2 py-1.5">
                          <p className="uppercase tracking-[0.2em] text-slate-500">Preço médio</p>
                          <p className="mt-1 font-semibold text-white">{product.avgPrice}</p>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-400">
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{product.fulfillment}</span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-quantum-cyan/90">
                          {product.source === "live" ? "Origem: API ao vivo" : "Origem: Curadoria Nexus"}
                        </span>
                        {partner?.affiliateId && (
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">ID {partner.affiliateId}</span>
                        )}
                      </div>

                      <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-slate-300">
                        <p className="font-medium text-white">Sincronização operacional</p>
                        <p className="mt-1 leading-5">
                          Envie esta oportunidade para o Agente IA monitorar demanda e montar abordagem comercial no ecossistema {partner?.affiliateProfile ?? "Nexus SaaS"}.
                        </p>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                        <Button size="sm" variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10">
                          Sincronizar com Agente
                        </Button>
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={buildMarketplaceCheckoutUrl({
                              source: "estoque",
                              type: "produto",
                              slug: product.id,
                              name: product.title,
                              amountCents: parseCurrencyTextToCents(product.avgPrice) ?? undefined,
                              description: `${product.platform} · ${product.category} · ${product.fulfillment}`,
                            })}
                          >
                            <Button size="sm" className="gradient-btn">
                              Ir para pagamento
                              <ArrowRight className="ml-2 h-3.5 w-3.5" />
                            </Button>
                          </Link>
                          {product.productUrl ? (
                            <a href={product.productUrl} target="_blank" rel="noreferrer">
                              <Button size="sm" variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10">
                                Ver oferta externa
                                <ExternalLink className="ml-2 h-3.5 w-3.5" />
                              </Button>
                            </a>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-white/5 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <ExternalLink className="h-5 w-5 text-quantum-cyan" />
                  Plataformas parceiras
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Acesse diretamente cada marketplace para gerenciar listings, comissões e logística.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {EXTERNAL_MARKETPLACES.map((channel) => {
                  const Icon = PLATFORM_ICONS[channel.icon] ?? ShoppingBag;
                  const url = channel.externalUrl ?? channel.internalUrl ?? "#";
                  const isExternal = Boolean(channel.externalUrl);
                  const partner = partners.find((item) => item.slug === channel.slug) ?? getPartnerBySlug(channel.slug as PartnerConfig["slug"]);
                  return (
                    <a
                      key={channel.slug}
                      href={url}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noreferrer" : undefined}
                      className="group flex items-start gap-3 rounded-2xl border border-white/10 bg-black/20 p-3 transition hover:border-white/20"
                    >
                      <span
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-base font-bold"
                        style={{ backgroundColor: `${channel.color}22`, color: channel.color }}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white">{channel.name}</p>
                        <p className="mt-1 text-xs leading-5 text-slate-400">{channel.description}</p>
                        {partner && (
                          <p className="mt-1 text-[10px] uppercase tracking-widest text-quantum-cyan/80">
                            {partner.affiliateProfile}
                            {partner.affiliateId ? ` · ID ${partner.affiliateId}` : ""}
                            {partner.username ? ` · @${partner.username}` : ""}
                          </p>
                        )}
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-slate-500 group-hover:text-white" />
                    </a>
                  );
                })}
              </CardContent>
            </Card>
          </>
        )}
      </div>
  );

  if (!isAuthenticated) {
    return <PublicStockShell>{content}</PublicStockShell>;
  }

  return <DashboardLayout>{content}</DashboardLayout>;
}

function StockProductCard({
  item,
  catalogItem,
  isSynced,
  onSync,
}: {
  item: OperationalStockItem;
  catalogItem: NonNullable<ReturnType<typeof buildMiniSiteCatalogItem>>;
  isSynced: boolean;
  onSync: () => void;
}) {
  const Icon = item.type === "ebooks" ? BookOpen : Layers;
  const checkoutUrl = buildMarketplaceCheckoutUrl({
    source: "estoque",
    type: "produto",
    slug: item.id,
    name: `${catalogItem.title} · ${catalogItem.subtitle}`,
    amountCents: catalogItem.priceCents,
    description: item.description,
  });
  const showcaseTags =
    item.type === "ebooks"
      ? MARKETPLACE_EBOOKS.slice(0, 3).map((ebook) => ebook.title)
      : ["Pack com 25 e-books", "Oferta pronta para revenda", "Ideal para mini-site"]; 

  return (
    <Card className="overflow-hidden border-white/10 bg-white/5 shadow-xl shadow-black/20 backdrop-blur transition hover:-translate-y-1 hover:border-white/20">
      <div className={`relative h-40 bg-gradient-to-br ${catalogItem.coverGradient}`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative flex h-full flex-col justify-between p-5 text-white">
          <div className="flex items-start justify-between gap-3">
            <Badge className="border border-white/25 bg-black/20 text-white">{catalogItem.title}</Badge>
            <Badge className="border border-white/25 bg-black/20 text-white">{item.badge}</Badge>
          </div>
          <div>
            <p className="text-lg font-bold leading-snug">{catalogItem.subtitle}</p>
            <p className="mt-1 text-xs text-white/80">{item.type === "ebooks" ? "Biblioteca pronta para revenda" : "Pack comercial pronto para ativação"}</p>
          </div>
        </div>
      </div>

      <CardContent className="space-y-4 p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-quantum-cyan">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-white">{catalogItem.title}</p>
            <p className="mt-1 text-sm leading-6 text-slate-300">{item.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Quantidade</p>
            <p className="mt-2 text-xl font-bold text-white">{item.quantity.toLocaleString("pt-BR")}</p>
          </div>
          <div className="rounded-2xl border border-quantum-lime/20 bg-quantum-lime/10 p-3">
            <p className="text-[10px] uppercase tracking-[0.24em] text-quantum-lime">Valor</p>
            <p className="mt-2 text-base font-bold text-quantum-lime">{catalogItem.priceLabel}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {showcaseTags.map((tag) => (
            <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-slate-300">
              {tag}
            </span>
          ))}
        </div>

        <div className={`rounded-2xl border p-3 text-xs leading-6 ${isSynced ? "border-quantum-cyan/20 bg-quantum-cyan/5 text-slate-200" : "border-white/10 bg-white/5 text-slate-300"}`}>
          <p className={`inline-flex items-center gap-2 font-semibold ${isSynced ? "text-quantum-cyan" : "text-white"}`}>
            {isSynced ? <CheckCircle2 className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
            {isSynced ? "Sincronizado com o Agente" : "Disponível para sincronização"}
          </p>
          <p className="mt-1">
            {isSynced
              ? "Este produto já está publicado na vitrine do mini-site e pronto para abordagem automatizada."
              : "Ao sincronizar, ele passa a aparecer no mini-site e entra no fluxo de vendas automatizadas."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={onSync} className={isSynced ? "w-full border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan hover:bg-quantum-cyan/20" : "gradient-btn w-full"}>
            {isSynced ? "Remover da sincronização" : "Sincronizar com Agente"}
          </Button>
          <div className="grid w-full gap-2 sm:grid-cols-2">
            <Link href="/minisite">
              <Button variant="outline" className="w-full border-white/15 bg-white/5 text-white hover:bg-white/10">
                Ver mini-site
              </Button>
            </Link>
            <Link href={checkoutUrl}>
              <Button variant="outline" className="w-full border-white/15 bg-white/5 text-white hover:bg-white/10">
                Simular venda
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function KpiBlock({ label, value, tone }: { label: string; value: ReactNode; tone: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center backdrop-blur">
      <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">{label}</p>
      <p className={`mt-1 text-xl font-bold ${tone}`}>{value}</p>
    </div>
  );
}

function PublicStockShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(0,229,255,0.1),transparent_25%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.12),transparent_30%),linear-gradient(180deg,#020617,#0f172a_38%,#111827)] text-white">
      <section className="border-b border-white/10 px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <p className="inline-flex rounded-full border border-quantum-cyan/30 bg-quantum-cyan/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-quantum-cyan">
              Loja virtual pública Nexus
            </p>
            <div>
              <h1 className="text-3xl font-black tracking-tight md:text-4xl">Estoque operacional em modo vitrine</h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
                Você está vendo a versão pública da loja virtual. Os produtos abaixo usam um perfil comercial de demonstração para liberar a experiência
                <strong className="text-white"> /estoque → sincronização → /minisite</strong> no navegador, mesmo sem login.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/minisite">
              <Button className="gradient-btn">Abrir mini-site</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10">
                Entrar no painel
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <Button
      type="button"
      onClick={onClick}
      variant="outline"
      className={active ? "border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan" : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"}
    >
      {children}
    </Button>
  );
}
