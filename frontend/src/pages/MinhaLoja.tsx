/**
 * Minha Loja — Vitrine do afiliado (estilo Hotmart)
 *
 * Lista APENAS os produtos do estoque do afiliado (derivado dos packs ativos).
 * O carrinho permite "Continuar comprando" e "Pagamento".
 * O checkout pede o e-mail do cliente, gera Pix automático e exibe
 * o pop-up "Pagamento Realizado com Sucesso".
 */
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
// PACK_ENTITLEMENT_CARD_V2
import PackEntitlementsCard from "@/components/PackEntitlementsCard";
import {
  ShoppingBag, ShoppingCart, Share2, Copy, Check, Store, Sparkles,
  Search, Filter, Tag, ArrowRight, X, Trash2, ArrowLeft, Mail,
  Lock, CheckCircle2, Loader2, QrCode, ExternalLink, Plus, Eraser, Link2,
} from "lucide-react";

type Ebook = {
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  costCents: number;
  resalePriceCents: number;
  pages: number;
  category: string;
  coverGradient: string | null;
  htmlPath: string;
  pdfPath: string;
  coverPath: string | null;
  highlights?: string[];
  unlockPackSlug: string;
};

const BRL = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function fallbackReferralCode(user: any): string {
  if (!user) return "";
  const raw = user.id ?? user.email ?? "";
  if (typeof raw === "number") return "NX" + Number(raw).toString(36).toUpperCase().padStart(5, "0");
  const slug = String(raw).replace(/[^a-zA-Z0-9]/g, "").slice(0, 10).toUpperCase();
  return slug ? "NX" + slug : "";
}

export default function MinhaLoja() {
  const { code: codeFromUrl } = useParams<{ code?: string }>();
  const { user, isAuthenticated } = useAuth();

  const isPublicView = Boolean(codeFromUrl);
  const referralQuery = trpc.users.getReferral.useQuery(undefined, {
    retry: false,
    enabled: !isPublicView && isAuthenticated,
  });

  const ownerCode = codeFromUrl || referralQuery.data?.code || fallbackReferralCode(user);
  const storeUrl = ownerCode ? `https://oneverso.com.br/minha-loja/${ownerCode}` : "";

  // INVENTÁRIO real do afiliado (estoque) — vitrine pública usa code, privada usa myInventory
  const myInv = (trpc as any).affiliateStore?.myInventory?.useQuery
    ? (trpc as any).affiliateStore.myInventory.useQuery(undefined, {
        retry: false,
        enabled: !isPublicView && isAuthenticated,
      })
    : null;
  const pubInv = (trpc as any).affiliateStore?.publicInventoryByCode?.useQuery
    ? (trpc as any).affiliateStore.publicInventoryByCode.useQuery(
        { code: ownerCode || "" },
        { retry: false, enabled: isPublicView && !!ownerCode },
      )
    : null;

  const inventory: Ebook[] = useMemo(() => {
    const data = isPublicView ? pubInv?.data : myInv?.data;
    return (data?.items ?? []) as Ebook[];
  }, [isPublicView, myInv?.data, pubInv?.data]);

  const loading = (isPublicView ? pubInv?.isLoading : myInv?.isLoading) ?? false;

  // Filtros
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [copied, setCopied] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [processing, setProcessing] = useState(false);
  const [orderResult, setOrderResult] = useState<any>(null);

  // Produtos externos (Hotmart, Shopee, Mercado Livre) — até 10 por afiliado
  const extMine = (trpc as any).affiliateStore?.listExternalProducts?.useQuery
    ? (trpc as any).affiliateStore.listExternalProducts.useQuery(undefined, {
        retry: false,
        enabled: !isPublicView && isAuthenticated,
      })
    : null;
  const extPub = (trpc as any).affiliateStore?.listExternalByCode?.useQuery
    ? (trpc as any).affiliateStore.listExternalByCode.useQuery(
        { code: ownerCode || "" },
        { retry: false, enabled: isPublicView && !!ownerCode },
      )
    : null;
  const externalItems: any[] = useMemo(() => {
    const d = isPublicView ? extPub?.data : extMine?.data;
    return (d?.items ?? []) as any[];
  }, [isPublicView, extMine?.data, extPub?.data]);
  const externalLimit: number = ((isPublicView ? extPub?.data : extMine?.data) as any)?.limit ?? 10;

  const [addExtOpen, setAddExtOpen] = useState(false);
  const [extForm, setExtForm] = useState({ url: "" });

  const addExternal = (trpc as any).affiliateStore?.addExternalProduct?.useMutation
    ? (trpc as any).affiliateStore.addExternalProduct.useMutation()
    : null;
  const removeExternal = (trpc as any).affiliateStore?.removeExternalProduct?.useMutation
    ? (trpc as any).affiliateStore.removeExternalProduct.useMutation()
    : null;
  const trackExternalConversion = (trpc as any).affiliateStore?.trackExternalConversion?.useMutation
    ? (trpc as any).affiliateStore.trackExternalConversion.useMutation()
    : null;

  async function handleAddExternal(e: React.FormEvent) {
    e.preventDefault();
    if (!addExternal || !extForm.url.trim()) return;
    try {
      const res = await addExternal.mutateAsync({ url: extForm.url.trim() });
      if (res?.ok) {
        setAddExtOpen(false);
        setExtForm({ url: "" });
        extMine?.refetch?.();
      } else if (res?.reason === "LIMIT_REACHED") {
        alert(`Limite de ${externalLimit} produtos externos atingido.`);
      } else if (res?.reason === "ALREADY_SYNCED") {
        alert("Este produto já está sincronizado na sua vitrine.");
      } else if (res?.message) {
        alert(res.message);
      }
    } catch (err) {
      console.error(err);
      alert("Não foi possível sincronizar automaticamente este link agora.");
    }
  }

  async function handleRemoveExternal(id: string) {
    if (!removeExternal) return;
    if (!confirm("Remover este produto parceiro?")) return;
    try { await removeExternal.mutateAsync({ id }); extMine?.refetch?.(); } catch (err) { console.error(err); }
  }

  async function handleBuyExternal(item: any) {
    try {
      if (trackExternalConversion) {
        const res = await trackExternalConversion.mutateAsync({
          externalId: item.id,
          ownerCode: ownerCode || "",
        });
        if (res?.redirectUrl) {
          window.open(res.redirectUrl, "_blank", "noopener,noreferrer");
          return;
        }
      }
      window.open(item.url, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error(err);
      window.open(item.url, "_blank", "noopener,noreferrer");
    }
  }

  const PLATFORM_LABEL: Record<string,string> = {
    hotmart: "Hotmart", shopee: "Shopee", mercadolivre: "Mercado Livre",
  };
  const PLATFORM_BADGE: Record<string,string> = {
    hotmart: "border-orange-400/40 bg-orange-400/10 text-orange-300",
    shopee: "border-rose-400/40 bg-rose-400/10 text-rose-300",
    mercadolivre: "border-amber-300/40 bg-amber-300/10 text-amber-200",
  };

  const categories = useMemo(() => {
    const set = new Set<string>();
    inventory.forEach((e) => e.category && set.add(e.category));
    return Array.from(set).sort();
  }, [inventory]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return inventory.filter((e) => {
      if (filterCategory && e.category !== filterCategory) return false;
      if (q && !`${e.title} ${e.subtitle ?? ""} ${e.description ?? ""}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [inventory, filterCategory, search]);

  // Carrinho
  const [cart, setCart] = useState<Array<{ slug: string; title: string; priceCents: number; coverPath?: string|null }>>([]);
  const cartTotal = cart.reduce((a,c) => a + c.priceCents, 0);
  const cartCount = cart.length;

  function addToCart(e: Ebook) {
    setCart((prev) => [...prev, { slug: e.slug, title: e.title, priceCents: e.resalePriceCents, coverPath: e.coverPath }]);
  }
  function removeFromCart(slug: string) {
    setCart((prev) => prev.filter((c) => c.slug !== slug));
  }

  async function copyShareLink() {
    try { await navigator.clipboard.writeText(storeUrl); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {}
  }

  useEffect(() => {
    if (isPublicView && codeFromUrl) {
      try {
        document.cookie = `nx_ref=${codeFromUrl}; path=/; max-age=2592000; SameSite=Lax`;
        localStorage.setItem("nx_ref", codeFromUrl);
      } catch {}
    }
  }, [isPublicView, codeFromUrl]);

  // Mutation pedido
  const placeOrder = (trpc as any).affiliateStore?.placeStoreOrder?.useMutation
    ? (trpc as any).affiliateStore.placeStoreOrder.useMutation()
    : null;

  async function handlePay() {
    if (!customerEmail.includes("@")) return;
    setProcessing(true);
    try {
      const res = placeOrder
        ? await placeOrder.mutateAsync({
            ownerCode,
            customerEmail,
            customerName: customerName || undefined,
            items: cart.map((c) => ({ slug: c.slug, title: c.title, priceCents: c.priceCents })),
            amountCents: cartTotal,
          })
        : {
            ok: true, orderId: "local_" + Date.now(), status: "paid",
            message: "Pagamento Realizado com Sucesso",
            delivery: { channel: "email", to: customerEmail, eta: "Entrega imediata por e-mail." },
          };
      setOrderResult(res);
      setPaymentOpen(false);
      setCart([]);
      setSuccessOpen(true);
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <PackEntitlementsCard variant="compact" />
      {/* HEADER */}
      <header className="sticky top-0 z-30 backdrop-blur bg-slate-950/85 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-quantum-cyan/30 bg-quantum-cyan/10 p-2 text-quantum-cyan">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold leading-tight">Minha Loja</h1>
              <p className="text-xs text-slate-400">
                {isPublicView ? `Vitrine do afiliado · ${ownerCode}` : "Sua vitrine pessoal"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isPublicView && (
              <Button size="sm" variant="outline"
                className="border-white/15 bg-white/5 text-white hover:bg-white/10"
                onClick={copyShareLink} disabled={!storeUrl}>
                {copied ? <Check className="h-4 w-4 mr-2" /> : <Share2 className="h-4 w-4 mr-2" />}
                {copied ? "Link copiado!" : "Compartilhar"}
              </Button>
            )}
            <Button size="sm"
              className="bg-quantum-cyan/90 hover:bg-quantum-cyan text-slate-900 font-semibold relative"
              onClick={() => setCartOpen(true)}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Meu Carrinho
              {cartCount > 0 && (
                <span className="ml-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-slate-900 text-quantum-cyan text-[11px] font-bold">
                  {cartCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="px-4 py-8 md:py-12">
        <div className="max-w-7xl mx-auto grid gap-6 md:grid-cols-[1.2fr_0.8fr] md:items-center">
          <div>
            <Badge className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">
              Catálogo do afiliado · estoque ativo
            </Badge>
            <h2 className="mt-4 text-3xl md:text-4xl font-bold leading-tight">
              {isPublicView ? "Catálogo curado pelo afiliado" : "Sua vitrine de produtos digitais"}
            </h2>
            <p className="mt-3 text-slate-400 max-w-xl">
              Aqui aparecem apenas os produtos que estão no seu estoque, adquiridos via Marketplace Nexus ou liberados pelos seus Packs ativos. Cada venda fechada por este link é creditada como saldo na conta do afiliado.
            </p>
            {!isPublicView && storeUrl && (
              <div className="mt-5 rounded-xl border border-white/10 bg-black/30 p-4 max-w-xl">
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                  Seu link exclusivo de loja
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <code className="flex-1 truncate text-sm text-quantum-cyan">{storeUrl}</code>
                  <Button size="sm" variant="outline"
                    className="border-white/15 bg-white/5 text-white hover:bg-white/10" onClick={copyShareLink}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}
          </div>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-quantum-cyan/10 via-fuchsia-500/5 to-purple-700/10 p-6">
            <div className="flex items-center gap-3 mb-4">
              <ShoppingBag className="h-6 w-6 text-quantum-cyan" />
              <h3 className="font-bold text-white">Como funciona</h3>
            </div>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-start gap-2"><Sparkles className="h-4 w-4 text-quantum-cyan mt-0.5" /> Cliente escolhe produtos e adiciona ao carrinho.</li>
              <li className="flex items-start gap-2"><Sparkles className="h-4 w-4 text-quantum-cyan mt-0.5" /> Em "Meu Carrinho" continua comprando ou paga via Pix.</li>
              <li className="flex items-start gap-2"><Sparkles className="h-4 w-4 text-quantum-cyan mt-0.5" /> Pagamento confirma automaticamente e libera por e-mail.</li>
              <li className="flex items-start gap-2"><Sparkles className="h-4 w-4 text-quantum-cyan mt-0.5" /> Comissão creditada como saldo do afiliado.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* FILTROS */}
      <section className="px-4 pb-2">
        <div className="max-w-7xl mx-auto grid gap-3 md:grid-cols-[1fr_240px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar no seu estoque" autoComplete="off"
              className="w-full h-12 rounded-xl border border-white/10 bg-black/30 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-quantum-cyan/50" />
          </div>
          <div className="relative">
            <Filter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full h-12 rounded-xl border border-white/10 bg-black/30 pl-11 pr-4 text-sm text-white">
              <option value="">Todas as coleções</option>
              {categories.map((c) => (<option key={c} value={c}>{c}</option>))}
            </select>
          </div>
        </div>
      </section>

      {/* VITRINE */}
      <section id="vitrine" className="px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold">Vitrine do estoque</h3>
              <p className="text-sm text-slate-400">
                {loading ? "Carregando estoque..." : `${filtered.length} produto${filtered.length===1?"":"s"} no seu catálogo`}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-4 h-80 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <Card className="border-white/10 bg-white/5">
              <CardContent className="p-10 text-center space-y-4">
                <ShoppingBag className="h-10 w-10 text-slate-500 mx-auto" />
                <p className="text-slate-300">
                  {isPublicView
                    ? "Este afiliado ainda não disponibilizou produtos na sua Minha Loja."
                    : "Você ainda não tem produtos no estoque. Adquira packs ou itens no Marketplace Nexus para abastecer sua vitrine."}
                </p>
                {!isPublicView && (
                  <Link href="/marketplaces">
                    <Button className="bg-quantum-cyan/90 text-slate-900 font-semibold hover:bg-quantum-cyan">
                      Ir ao Marketplace Nexus <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((e) => (
                <article key={e.slug}
                  className="group rounded-2xl border border-white/10 bg-white/5 overflow-hidden transition hover:-translate-y-1 hover:border-quantum-cyan/30">
                  <div className="aspect-[3/4] bg-slate-900 overflow-hidden border-b border-white/10">
                    {e.coverPath ? (
                      <img src={e.coverPath} alt={e.title} loading="lazy"
                        className="h-full w-full object-cover transition group-hover:scale-105" />
                    ) : (
                      <div className={`h-full w-full bg-gradient-to-br ${e.coverGradient ?? "from-slate-700 to-slate-900"}`} />
                    )}
                  </div>
                  <div className="p-4 space-y-3">
                    <Badge className="border border-white/10 bg-white/5 text-[10px] uppercase tracking-wider text-slate-300">
                      {e.category}
                    </Badge>
                    <h4 className="font-bold text-white leading-tight line-clamp-2">{e.title}</h4>
                    {e.subtitle && (<p className="text-xs text-slate-400 line-clamp-2">{e.subtitle}</p>)}
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Tag className="h-3 w-3" /> {e.pages} páginas
                    </div>
                    <div className="flex items-end justify-between pt-2">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-slate-500">por</p>
                        <p className="text-xl font-bold text-quantum-cyan">{BRL(e.resalePriceCents)}</p>
                      </div>
                      <Button size="sm" className="bg-quantum-cyan/90 text-slate-900 font-semibold hover:bg-quantum-cyan"
                        onClick={() => { addToCart(e); }}>
                        Adicionar
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      
      {/* PRODUTOS PARCEIROS (HOTMART/SHOPEE/MERCADO LIVRE) */}
      <section className="px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-4">
            <div>
              <Badge className="border border-amber-400/30 bg-amber-400/10 text-amber-300 mb-2">Plataformas parceiras</Badge>
              <h3 className="text-2xl font-bold">Produtos externos sincronizados</h3>
              <p className="text-sm text-slate-400">
                Hotmart, Shopee e Mercado Livre · até <strong className="text-white">{externalLimit}</strong> produtos. Cole apenas o link do produto: o sistema identifica a plataforma, preenche os dados automaticamente e calcula a comissão para o Dashboard da sua loja.
              </p>
            </div>
            {!isPublicView && (
              <Button
                onClick={() => setAddExtOpen(true)}
                className="bg-amber-400 text-slate-900 font-semibold hover:bg-amber-300"
                disabled={externalItems.length >= externalLimit}>
                <Plus className="h-4 w-4 mr-2" />
                {externalItems.length >= externalLimit
                  ? `Limite atingido (${externalItems.length}/${externalLimit})`
                  : `Sincronizar produto (${externalItems.length}/${externalLimit})`}
              </Button>
            )}
          </div>

          {externalItems.length === 0 ? (
            <Card className="border-white/10 bg-white/5">
              <CardContent className="p-8 text-center text-slate-400">
                <Link2 className="h-8 w-8 mx-auto mb-3 opacity-50" />
                <p>
                  {isPublicView
                    ? "Este afiliado ainda não sincronizou produtos parceiros."
                    : "Você ainda não sincronizou produtos parceiros. Cole o link público do produto da Hotmart, Shopee ou Mercado Livre e o sistema preencherá automaticamente título, imagem, preço e comissão."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {externalItems.map((ext: any) => (
                <article key={ext.id} className="group rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                  <div className="aspect-[3/4] bg-slate-900 overflow-hidden border-b border-white/10">
                    {ext.imageUrl ? (
                      <img src={ext.imageUrl} alt={ext.title} loading="lazy"
                        className="h-full w-full object-cover transition group-hover:scale-105" />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-amber-500/30 via-fuchsia-500/20 to-purple-700/30 flex items-center justify-center">
                        <ExternalLink className="h-8 w-8 text-amber-300" />
                      </div>
                    )}
                  </div>
                  <div className="p-4 space-y-3">
                    <Badge className={`border text-[10px] uppercase tracking-wider ${PLATFORM_BADGE[ext.platform] ?? ""}`}>
                      {PLATFORM_LABEL[ext.platform] ?? ext.platform}
                    </Badge>
                    <h4 className="font-bold text-white leading-tight line-clamp-2">{ext.title}</h4>
                    {ext.category && (
                      <p className="text-xs text-slate-400 line-clamp-1">{ext.category}</p>
                    )}
                    <div className="flex items-end justify-between pt-2">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-slate-500">preço</p>
                        <p className="text-lg font-bold text-quantum-cyan">{BRL(ext.priceCents)}</p>
                        {ext.commissionCents > 0 && (
                          <p className="text-[11px] text-amber-300">+ {BRL(ext.commissionCents)} comissão</p>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <Button size="sm" onClick={() => handleBuyExternal(ext)}
                          className="bg-amber-400 text-slate-900 font-semibold hover:bg-amber-300">
                          Comprar <ExternalLink className="h-3 w-3 ml-1" />
                        </Button>
                        {!isPublicView && (
                          <button onClick={() => handleRemoveExternal(ext.id)}
                            className="text-[11px] text-slate-500 hover:text-red-400 inline-flex items-center gap-1">
                            <Trash2 className="h-3 w-3" /> Remover
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* MODAL ADICIONAR PRODUTO EXTERNO */}
      {addExtOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setAddExtOpen(false)} />
          <div className="relative w-full max-w-lg bg-slate-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link2 className="h-5 w-5 text-amber-300" />
                <h3 className="font-bold text-white">Sincronizar produto parceiro</h3>
              </div>
              <button className="text-slate-400 hover:text-white" onClick={() => setAddExtOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddExternal} className="px-6 py-5 space-y-4">
              <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
                <p className="font-semibold">Sincronização automática por link</p>
                <p className="mt-1 text-amber-100/80">
                  Cole apenas o link do produto. A plataforma será detectada automaticamente e os dados da vitrine serão preenchidos sem edição manual.
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 uppercase tracking-wider">Link do produto parceiro</label>
                <input
                  type="url"
                  required
                  value={extForm.url}
                  onChange={(e) => setExtForm({ url: e.target.value })}
                  placeholder="https://go.hotmart.com/... | https://shopee.com.br/... | https://produto.mercadolivre.com.br/..."
                  className="w-full h-11 rounded-lg border border-white/10 bg-black/30 px-3 text-white focus:outline-none focus:border-amber-400/50"
                />
                <p className="text-xs text-slate-500">
                  Compatível com Hotmart, Shopee e Mercado Livre. O sistema busca automaticamente título, imagem, preço e comissão do produto.
                </p>
              </div>
              <div className="grid gap-2 pt-1">
                <Button
                  type="submit"
                  className="bg-amber-400 text-slate-900 font-semibold hover:bg-amber-300"
                  disabled={(addExternal as any)?.isPending || !extForm.url.trim()}
                >
                  {(addExternal as any)?.isPending ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sincronizando link...</>
                  ) : (
                    <><Plus className="h-4 w-4 mr-2" /> Sincronizar automaticamente</>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DRAWER CARRINHO */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setCartOpen(false)} />
          <div className="relative w-full max-w-md bg-slate-950 border-l border-white/10 h-full overflow-y-auto">
            <div className="sticky top-0 z-10 bg-slate-950/95 border-b border-white/10 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-quantum-cyan" />
                <h3 className="font-bold text-white">Meu Carrinho</h3>
                <Badge className="border border-white/10 bg-white/5 text-slate-300">{cart.length}</Badge>
              </div>
              <button className="text-slate-400 hover:text-white" onClick={() => setCartOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-5 py-4 space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <ShoppingBag className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p>Carrinho vazio.</p>
                </div>
              ) : cart.map((c, i) => (
                <div key={`${c.slug}-${i}`} className="flex gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="w-14 h-20 rounded-md bg-slate-900 overflow-hidden flex-shrink-0">
                    {c.coverPath && (<img src={c.coverPath} alt={c.title} className="h-full w-full object-cover" />)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white line-clamp-2">{c.title}</p>
                    <p className="text-quantum-cyan font-bold mt-1">{BRL(c.priceCents)}</p>
                  </div>
                  <button className="text-slate-500 hover:text-red-400 self-start" onClick={() => removeFromCart(c.slug)}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="sticky bottom-0 bg-slate-950/95 border-t border-white/10 px-5 py-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Total</span>
                <strong className="text-xl text-white">{BRL(cartTotal)}</strong>
              </div>
              <div className="grid gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10"
                    onClick={() => setCartOpen(false)}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Continuar
                  </Button>
                  <Button variant="outline" className="border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20"
                    onClick={() => setCart([])}
                    disabled={cart.length === 0}>
                    <Eraser className="h-4 w-4 mr-2" /> Limpar
                  </Button>
                </div>
                <Button
                  className="bg-quantum-cyan text-slate-900 font-semibold hover:bg-quantum-cyan/90"
                  disabled={cart.length === 0}
                  onClick={() => { setCartOpen(false); setPaymentOpen(true); }}>
                  Pagamento <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PAGAMENTO (modelo Hotmart) */}
      {paymentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => !processing && setPaymentOpen(false)} />
          <div className="relative w-full max-w-lg bg-slate-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-quantum-cyan" />
                <h3 className="font-bold text-white">Finalizar compra</h3>
              </div>
              <button className="text-slate-400 hover:text-white" onClick={() => !processing && setPaymentOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-slate-400 uppercase tracking-wider">Resumo</p>
                <div className="mt-2 space-y-1 text-sm text-slate-300">
                  {cart.map((c,i) => (
                    <div key={`${c.slug}-${i}`} className="flex justify-between">
                      <span className="truncate">{c.title}</span>
                      <span>{BRL(c.priceCents)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-white/10 flex justify-between">
                  <strong className="text-white">Total</strong>
                  <strong className="text-quantum-cyan text-lg">{BRL(cartTotal)}</strong>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-400 uppercase tracking-wider">Seu nome (opcional)</label>
                <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nome para a entrega"
                  className="w-full h-11 rounded-lg border border-white/10 bg-black/30 px-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-quantum-cyan/50" />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Mail className="h-3 w-3" /> Seu e-mail (entrega digital)
                </label>
                <input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="cliente@email.com"
                  className="w-full h-11 rounded-lg border border-white/10 bg-black/30 px-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-quantum-cyan/50" />
                <p className="text-[11px] text-slate-500">Você receberá seus produtos neste e-mail logo após a confirmação do Pix.</p>
              </div>

              <div className="rounded-xl border border-quantum-cyan/30 bg-quantum-cyan/5 p-3 text-xs text-slate-300 flex items-start gap-2">
                <Lock className="h-4 w-4 text-quantum-cyan mt-0.5" />
                Pagamento via Pix processado automaticamente. Confirmação em poucos segundos.
              </div>
            </div>
            <div className="px-6 py-4 border-t border-white/10 grid gap-2">
              <Button variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10"
                onClick={() => { setPaymentOpen(false); setCartOpen(true); }} disabled={processing}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Continuar Comprando
              </Button>
              <Button onClick={handlePay} disabled={processing || !customerEmail.includes("@") || cart.length===0}
                className="bg-quantum-cyan text-slate-900 font-semibold hover:bg-quantum-cyan/90">
                {processing ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processando...</>) :
                  (<>Pagar agora — {BRL(cartTotal)} <ArrowRight className="h-4 w-4 ml-2" /></>)}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* POP-UP SUCESSO */}
      {successOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/75" onClick={() => setSuccessOpen(false)} />
          <div className="relative w-full max-w-md bg-slate-950 border border-quantum-lime/40 rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-8 text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-quantum-lime/15 flex items-center justify-center border border-quantum-lime/30">
                <CheckCircle2 className="h-8 w-8 text-quantum-lime" />
              </div>
              <h3 className="text-2xl font-bold text-white">Pagamento Realizado com Sucesso</h3>
              <p className="text-sm text-slate-300">
                Sua compra foi confirmada. A entrega chegará no e-mail informado em instantes.
              </p>
              {orderResult?.orderId && (
                <p className="text-xs text-slate-500">
                  Pedido: <code className="text-quantum-cyan">{orderResult.orderId}</code>
                </p>
              )}
              {orderResult?.delivery?.to && (
                <p className="text-xs text-slate-400">
                  <Mail className="inline h-3 w-3 mr-1" />
                  Entrega para <strong className="text-white">{orderResult.delivery.to}</strong>
                </p>
              )}
            </div>
            <div className="px-6 pb-6">
              <Button onClick={() => setSuccessOpen(false)}
                className="w-full bg-quantum-cyan text-slate-900 font-semibold hover:bg-quantum-cyan/90">
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-10 border-t border-white/10 px-4 py-6 text-center text-xs text-slate-500">
        Loja vinculada ao afiliado <strong className="text-slate-300">{ownerCode || "—"}</strong> · Catálogo oficial Nexus Affil'IA'te
        {!isPublicView && (<>{" · "}<Link href="/estoque" className="text-quantum-cyan hover:underline">Gerenciar estoque</Link></>)}
      </footer>
    </div>
  );
}
