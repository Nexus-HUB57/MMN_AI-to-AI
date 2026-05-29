import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMarketplaceProfile } from "@/hooks/useMarketplaceProfile";
import { buildMarketplaceCheckoutUrl } from "@/lib/marketplace-payments";
import { getOperationalInventory, type OperationalStockItem } from "@/lib/nexus-marketplace";
import { resolveShowcaseMarketplaceProfile } from "@/lib/public-marketplace";
import {
  buildMiniSiteCatalogItem,
  getMiniSiteCatalogEventName,
  loadMiniSiteCatalog,
  type MiniSiteCatalogItem,
} from "@/lib/minisite-catalog";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  ExternalLink,
  Package,
  ShoppingBag,
  Sparkles,
  Store,
  Zap,
} from "lucide-react";

function isSyncableItem(item: OperationalStockItem) {
  return item.type === "ebooks" || item.type === "preu";
}

function formatCurrency(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function AffiliateMiniSite() {
  const { profile } = useMarketplaceProfile();
  const { isAuthenticated } = useAuth();
  const [catalog, setCatalog] = useState<MiniSiteCatalogItem[]>(() => loadMiniSiteCatalog());

  const showcaseProfile = useMemo(
    () => resolveShowcaseMarketplaceProfile(profile, isAuthenticated),
    [isAuthenticated, profile],
  );

  useEffect(() => {
    const refresh = () => setCatalog(loadMiniSiteCatalog());
    refresh();

    if (typeof window === "undefined") return;
    const eventName = getMiniSiteCatalogEventName();
    window.addEventListener(eventName, refresh as EventListener);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(eventName, refresh as EventListener);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const availableStock = useMemo(
    () => getOperationalInventory(showcaseProfile).filter((item) => isSyncableItem(item) && item.availableForAgent),
    [showcaseProfile],
  );

  const previewCatalog = useMemo(
    () => availableStock.map((item) => buildMiniSiteCatalogItem(item)).filter(Boolean) as MiniSiteCatalogItem[],
    [availableStock],
  );

  const totalUnits = catalog.reduce((acc, item) => acc + item.quantity, 0);
  const estimatedGross = catalog.reduce((acc, item) => acc + item.quantity * item.priceCents, 0);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(0,229,255,0.12),transparent_25%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.15),transparent_30%),linear-gradient(180deg,#020617,#0f172a_35%,#111827)] text-white">
      <section className="border-b border-white/10 px-6 py-16 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 xl:grid-cols-[1.15fr_0.85fr] xl:items-center">
          <div className="space-y-6">
            <Badge className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">
              MiniSite Nexus Affil'IA'te · vitrine automatizada
            </Badge>
            <div className="space-y-4">
              <h1 className="text-4xl font-black tracking-tight md:text-6xl">
                Seu catálogo sincronizado para
                <span className="bg-gradient-to-r from-quantum-cyan via-quantum-lime to-quantum-purple bg-clip-text text-transparent">
                  {" "}vendas automatizadas
                </span>
              </h1>
              <p className="max-w-3xl text-base leading-8 text-slate-300 md:text-lg">
                Os produtos marcados em <strong className="text-white">Meu Estoque</strong> como “Sincronizar com Agente” aparecem aqui como vitrine operacional do mini-site. O Agente IA usa esse catálogo para apresentar ofertas, acelerar prospecção e encaminhar vendas com mais contexto comercial.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <MiniKpi label="Produtos sincronizados" value={catalog.length.toString()} tone="text-quantum-cyan" />
              <MiniKpi label="Unidades disponíveis" value={totalUnits.toLocaleString("pt-BR")} tone="text-quantum-lime" />
              <MiniKpi label="Receita bruta potencial" value={formatCurrency(estimatedGross)} tone="text-quantum-purple" />
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/estoque">
                <Button className="gradient-btn">
                  {isAuthenticated ? "Gerenciar estoque" : "Abrir loja virtual"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href={isAuthenticated ? "/marketplaces" : "/login"}>
                <Button variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10">
                  {isAuthenticated ? "Abrir marketplace" : "Entrar no painel"}
                  <Store className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          <Card className="border-white/10 bg-white/5 shadow-2xl shadow-black/30 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Bot className="h-5 w-5 text-quantum-cyan" />
                Diagnóstico da vitrine automática
              </CardTitle>
              <CardDescription className="text-slate-300">
                Estado atual do catálogo que o Agente IA pode utilizar em apresentações e fluxos de venda.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Status operacional</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {catalog.length > 0 ? "Catálogo pronto para automação" : "Aguardando sincronização inicial"}
                </p>
                <p className="mt-2 leading-6">
                  {catalog.length > 0
                    ? "Há itens válidos disponíveis para campanhas, recomendações do agente e exibição em vitrine comercial." 
                    : "Vá até Meu Estoque e sincronize ao menos um produto para que o mini-site passe a trabalhar como vitrine comercial."}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <StatusBlock
                  label="Itens sincronizados"
                  value={`${catalog.length}`}
                  helper="Produtos ativos no mini-site"
                />
                <StatusBlock
                  label="Itens elegíveis"
                  value={`${previewCatalog.length}`}
                  helper="Produtos operacionais disponíveis no estoque"
                />
              </div>

              <div className="rounded-2xl border border-quantum-cyan/20 bg-quantum-cyan/5 p-4 text-xs leading-6 text-slate-200">
                <p className="inline-flex items-center gap-2 font-semibold text-quantum-cyan">
                  <Sparkles className="h-4 w-4" />
                  Fluxo recomendado
                </p>
                <p className="mt-2">
                  Estoque → sincronização com agente → mini-site → apresentação automatizada → checkout operacional.
                </p>
                {!isAuthenticated && (
                  <p className="mt-2 text-slate-300">
                    No modo público, a vitrine usa um inventário demonstrativo para você testar o fluxo completo antes do login.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="px-6 py-14">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <Badge className="border border-quantum-lime/30 bg-quantum-lime/10 text-quantum-lime">
                Loja virtual do mini-site
              </Badge>
              <h2 className="mt-3 text-3xl font-bold text-white">Produtos sincronizados com o Agente IA</h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
                Cada card abaixo representa uma oferta que já pode ser usada em campanhas, apresentações e vendas automatizadas.
              </p>
            </div>
            <Link href="/estoque">
              <Button variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10">
                Ajustar sincronização
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {catalog.length === 0 ? (
            <Card className="border-dashed border-white/15 bg-white/5 backdrop-blur">
              <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/5">
                  <ShoppingBag className="h-7 w-7 text-quantum-cyan" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white">Seu mini-site ainda está vazio</h3>
                  <p className="max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
                    Há <strong className="text-white">{previewCatalog.length}</strong> itens operacionais elegíveis no estoque, mas nenhum foi sincronizado ainda. Ative a sincronização para publicar sua vitrine automatizada.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link href="/estoque">
                    <Button className="gradient-btn">
                      Sincronizar agora
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/marketplaces">
                    <Button variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10">
                      Comprar mais materiais
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {catalog.map((item) => (
                <ProductCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function ProductCard({ item }: { item: MiniSiteCatalogItem }) {
  const checkoutUrl = buildMarketplaceCheckoutUrl({
    source: "minisite",
    type: "produto",
    slug: item.sourceItemId,
    name: `${item.title} · ${item.subtitle}`,
    amountCents: item.priceCents,
    description: item.description,
  });

  return (
    <Card className="overflow-hidden border-white/10 bg-white/5 shadow-xl shadow-black/20 backdrop-blur transition hover:-translate-y-1 hover:border-white/20">
      <div className={`relative h-40 bg-gradient-to-br ${item.coverGradient}`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative flex h-full flex-col justify-between p-5 text-white">
          <div className="flex items-start justify-between gap-3">
            <Badge className="border border-white/25 bg-black/20 text-white">{item.title}</Badge>
            <Badge className="border border-white/25 bg-black/20 text-white">{item.badge}</Badge>
          </div>
          <div>
            <p className="text-lg font-bold leading-snug">{item.subtitle}</p>
            <p className="mt-1 text-xs text-white/80">Agente pronto para apresentar esta oferta</p>
          </div>
        </div>
      </div>

      <CardContent className="space-y-4 p-5">
        <p className="text-sm leading-6 text-slate-300">{item.description}</p>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Quantidade</p>
            <p className="mt-2 text-xl font-bold text-white">{item.quantity.toLocaleString("pt-BR")}</p>
          </div>
          <div className="rounded-2xl border border-quantum-lime/20 bg-quantum-lime/10 p-3">
            <p className="text-[10px] uppercase tracking-[0.24em] text-quantum-lime">Valor</p>
            <p className="mt-2 text-base font-bold text-quantum-lime">{item.priceLabel}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-quantum-cyan/20 bg-quantum-cyan/5 p-3 text-xs leading-6 text-slate-200">
          <p className="inline-flex items-center gap-2 font-semibold text-quantum-cyan">
            <Zap className="h-4 w-4" />
            Sincronizado com o agente
          </p>
          <p className="mt-1">Oferta ativa para vitrine comercial, abordagem automatizada e checkout operacional.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href={checkoutUrl}>
            <Button className="gradient-btn flex-1 min-w-[180px]">
              Comprar agora
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/estoque">
            <Button variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10">
              Ajustar estoque
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function MiniKpi({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur">
      <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500">{label}</p>
      <p className={`mt-2 text-2xl font-black ${tone}`}>{value}</p>
    </div>
  );
}

function StatusBlock({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{helper}</p>
    </div>
  );
}
