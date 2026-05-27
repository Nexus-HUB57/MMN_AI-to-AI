import { useMemo, useState } from "react";
import { Link } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMarketplaceProfile } from "@/hooks/useMarketplaceProfile";
import {
  EXTERNAL_MARKETPLACES,
  getOperationalInventory,
  type OperationalStockItem,
} from "@/lib/nexus-marketplace";
import { NEXUS_PARTNERS, getPartnerBySlug } from "@/lib/nexus-partners";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  ExternalLink,
  Flame,
  Layers,
  Package,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Tag,
  TrendingUp,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Catálogo de "Produtos em Alta" agregados das plataformas parceiras
// (Shopee, Hotmart, Mercado Livre). Os itens abaixo são curados pela equipe
// Nexus SaaS e usados como base enquanto o pipeline server-side de Hotmart
// (OAuth client credentials) e Shopee Afiliados (ID público) sincroniza.
// ---------------------------------------------------------------------------
const TRENDING_PRODUCTS = [
  {
    id: "trend-hotmart-1",
    title: "Curso Marketing IA · Lançamento Premium",
    platform: "Hotmart",
    category: "Infoproduto",
    commission: "60%",
    avgPrice: "R$ 997,00",
    fulfillment: "Dropshipping",
    color: "#EF4E23",
  },
  {
    id: "trend-shopee-1",
    title: "Kit Smart Home · Iluminação RGB Wi-Fi",
    platform: "Shopee",
    category: "Eletrônico",
    commission: "12%",
    avgPrice: "R$ 189,90",
    fulfillment: "Dropshipping",
    color: "#EE4D2D",
  },
  {
    id: "trend-ml-1",
    title: "Cadeira Gamer Ergonômica Pro",
    platform: "Mercado Livre",
    category: "Móvel",
    commission: "8%",
    avgPrice: "R$ 1.299,00",
    fulfillment: "Dropshipping",
    color: "#FFE600",
  },
  {
    id: "trend-hotmart-2",
    title: "Mentoria Tráfego Pago para Afiliados",
    platform: "Hotmart",
    category: "Infoproduto",
    commission: "50%",
    avgPrice: "R$ 497,00",
    fulfillment: "Dropshipping",
    color: "#EF4E23",
  },
  {
    id: "trend-shopee-2",
    title: "Suplemento Beauty Collagen · Linha Premium",
    platform: "Shopee",
    category: "Saúde & Bem-estar",
    commission: "15%",
    avgPrice: "R$ 89,90",
    fulfillment: "Dropshipping",
    color: "#EE4D2D",
  },
  {
    id: "trend-ml-2",
    title: "Câmera Action 4K com Estabilizador",
    platform: "Mercado Livre",
    category: "Eletrônico",
    commission: "9%",
    avgPrice: "R$ 689,00",
    fulfillment: "Dropshipping",
    color: "#FFE600",
  },
];

const PLATFORM_ICONS: Record<string, typeof ShoppingBag> = {
  ShoppingBag,
  Flame,
  ShoppingCart,
  Tag,
};

type Tab = "produtos" | "tendencias";

export default function Estoque() {
  const { profile } = useMarketplaceProfile();
  const [tab, setTab] = useState<Tab>("produtos");

  const stockItems = useMemo(() => getOperationalInventory(profile), [profile]);
  const myProducts = stockItems.filter((item) => item.type === "ebooks" || item.type === "preu");
  const packsActivated = stockItems.filter((item) => item.type === "pack");

  const totalEbooks = myProducts.reduce((acc, item) => acc + (item.type === "ebooks" ? item.quantity : 0), 0);
  const totalPreu = myProducts.reduce((acc, item) => acc + (item.type === "preu" ? item.quantity : 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Aviso de vínculo Nexus SaaS · plataformas parceiras */}
        <section className="rounded-2xl border border-quantum-cyan/30 bg-quantum-cyan/5 p-4 text-sm text-quantum-cyan/90">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <p>
              <strong className="text-white">Nexus SaaS</strong> está vinculada às plataformas parceiras. O Agente IA usa o perfil oficial para revenda e tracking de comissões.
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              {NEXUS_PARTNERS.map((partner) => (
                <span key={partner.slug} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-200">
                  {partner.name}
                  {partner.affiliateId ? ` · ID ${partner.affiliateId}` : ""}
                  {partner.username ? ` · @${partner.username}` : ""}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Header */}
        <section className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(2,6,23,0.96))] p-6 shadow-2xl shadow-black/20">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <Badge className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">
                Loja &amp; Operações · Estoque do Agente IA
              </Badge>
              <h1 className="text-3xl font-bold text-white md:text-4xl">Meu Estoque</h1>
              <p className="max-w-3xl text-sm leading-6 text-slate-300 md:text-base">
                Aqui ficam todos os e-books, PREU e demais materiais que você adquirir, liberados para revenda direta pelo Agente IA. Em <strong className="text-quantum-cyan">Produtos em Alta</strong> você acompanha as melhores oportunidades de comissionamento nas plataformas parceiras.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              <KpiBlock label="Packs ativos" value={packsActivated.length} tone="text-quantum-cyan" />
              <KpiBlock label="E-books" value={totalEbooks.toLocaleString("pt-BR")} tone="text-quantum-lime" />
              <KpiBlock label="PREU" value={totalPreu.toLocaleString("pt-BR")} tone="text-quantum-purple" />
            </div>
          </div>
        </section>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          <TabButton active={tab === "produtos"} onClick={() => setTab("produtos")}>
            <Package className="mr-2 h-4 w-4" /> Meus Produtos
          </TabButton>
          <TabButton active={tab === "tendencias"} onClick={() => setTab("tendencias")}>
            <TrendingUp className="mr-2 h-4 w-4" /> Produtos em Alta
          </TabButton>
        </div>

        {/* Meus Produtos */}
        {tab === "produtos" && (
          <>
            <Card className="border-quantum-cyan/30 bg-quantum-cyan/5 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Layers className="h-5 w-5 text-quantum-cyan" />
                  Materiais disponíveis para revenda
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Todos os e-books, PREU e bibliotecas adquiridos via Packs ou ativações ficam aqui para uso direto do Agente IA. O agente também pode adquirir mais materiais para revenda quando configurado.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {myProducts.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-slate-300">
                    Seu estoque ainda está vazio. Faça uma Ativação Mensal ou adquira mais materiais no Marketplace para abastecer o agente.
                  </div>
                ) : (
                  myProducts.map((item) => <StockRow key={item.id} item={item} />)
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
                    Cada pack ativo alimenta o estoque com cota oficial de e-books, PREU e SiSu.
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
              <CardContent className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1 text-sm text-amber-100">
                  <p className="font-semibold text-amber-200 inline-flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Cuidados operacionais com o estoque
                  </p>
                  <p>
                    Produtos de <strong>Pronta Entrega</strong> exigem atenção redobrada com as quantidades disponíveis.
                    Já os de <strong>Dropshipping</strong> ficam a critério das respectivas plataformas parceiras.
                  </p>
                  <p className="text-amber-100/80">
                    Os produtos do estoque acompanham os Packs e podem ser ampliados pelo usuário ou pelo próprio Agente IA via compra de materiais para revenda.
                  </p>
                </div>
                <Link href="/marketplaces?focus=monthly-activation">
                  <Button className="gradient-btn whitespace-nowrap">
                    Adquirir mais materiais
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </>
        )}

        {/* Produtos em Alta */}
        {tab === "tendencias" && (
          <>
            <Card className="border-quantum-purple/30 bg-quantum-purple/5 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <TrendingUp className="h-5 w-5 text-quantum-purple" />
                  Produtos em Alta nas plataformas parceiras
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Curadoria automática de produtos com alta procura e alto potencial de comissionamento na Shopee, Hotmart e Mercado Livre. Sincronize com o Agente para acelerar prospecção e vendas.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {TRENDING_PRODUCTS.map((product) => (
                  <div key={product.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white leading-snug">{product.title}</p>
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
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{product.fulfillment}</span>
                      <Button size="sm" variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10">
                        Sincronizar com Agente
                      </Button>
                    </div>
                  </div>
                ))}
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
                  const partner = getPartnerBySlug(channel.slug as any);
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
                        <p className="mt-1 text-xs text-slate-400 leading-5">{channel.description}</p>
                        {partner && (
                          <p className="mt-1 text-[10px] uppercase tracking-widest text-quantum-cyan/80">
                            {partner.affiliateProfile}
                            {partner.affiliateId ? ` · ID ${partner.affiliateId}` : ""}
                          </p>
                        )}
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-slate-500 group-hover:text-white" />
                    </a>
                  );
                })}
              </CardContent>
            </Card>

            <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-xs leading-6 text-amber-100/90">
              <p className="font-semibold text-amber-200 inline-flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Importante
              </p>
              <p className="mt-1">
                É importante <strong>sincronizar estes produtos com o Agente</strong>, para facilitar a prospecção e as vendas.
              </p>
              <ul className="mt-2 space-y-1 list-disc pl-5">
                <li>Produtos de <strong>Pronta Entrega</strong> já adquiridos exigem atenção com a quantidade disponível.</li>
                <li>Produtos de <strong>Dropshipping</strong> ficam a critério das respectivas plataformas parceiras.</li>
                <li>Os produtos do estoque acompanham os Packs; usuário e/ou Agente podem adquirir mais materiais para revenda.</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

function StockRow({ item }: { item: OperationalStockItem }) {
  const Icon = item.type === "ebooks" ? BookOpen : item.type === "preu" ? Layers : Package;
  const resalePrice = item.type === "ebooks" ? "R$ 0,99 / e-book" : item.type === "preu" ? "R$ 24,75 / PREU (25 e-books)" : "—";
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-quantum-cyan">
            <Icon className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold text-white">{item.title}</p>
            <p className="mt-1 text-xs leading-5 text-slate-400">{item.description}</p>
          </div>
        </div>
        <Badge className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">{item.badge}</Badge>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg border border-white/10 bg-white/5 px-2 py-1.5">
          <p className="uppercase tracking-[0.2em] text-slate-500">Quantidade</p>
          <p className="mt-1 font-semibold text-white">{item.quantity.toLocaleString("pt-BR")}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 px-2 py-1.5">
          <p className="uppercase tracking-[0.2em] text-slate-500">Preço de revenda</p>
          <p className="mt-1 font-semibold text-quantum-lime">{resalePrice}</p>
        </div>
      </div>
    </div>
  );
}

function KpiBlock({ label, value, tone }: { label: string; value: React.ReactNode; tone: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center">
      <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">{label}</p>
      <p className={`mt-1 text-xl font-bold ${tone}`}>{value}</p>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition ${
        active
          ? "border-quantum-cyan/60 bg-quantum-cyan/15 text-quantum-cyan"
          : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20"
      }`}
    >
      {children}
    </button>
  );
}
