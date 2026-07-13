import { Link, useLocation } from "wouter";
import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { sortByCollectionRank } from "@/lib/collectionRanking";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useMarketplaceProfile } from "@/hooks/useMarketplaceProfile";
import { useAuth } from "@/contexts/AuthContext";
import { resolveShowcaseMarketplaceProfile } from "@/lib/public-marketplace";
import FirstAccessBanner from "@/components/FirstAccessBanner";
import {
  EXTERNAL_MARKETPLACES,
  NEXUS_PACKS,
  formatCurrency,
  getLevelLabel,
  getLevelSubtitle,
  getMarketplaceEbooks,
  getOperationalInventory,
  getPackAccess,
  getProgressSnapshot,
  getUnlockedEbookBundles,
  getUnlockedSkillBundles,
} from "@/lib/nexus-marketplace";
import { buildMarketplaceCheckoutUrl } from "@/lib/marketplace-payments";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Flame,
  Lock,
  LogIn,
  Package,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Star,
  Store,
  Tag,
  Trophy,
  Users,
  Wallet,
  Zap,
  Bot,
  Globe,
  Search,
  TrendingUp,
} from "lucide-react";

const MARKETPLACE_ICONS = { ShoppingBag, Flame, ShoppingCart, Tag } as Record<string, typeof ShoppingBag>;

function ProgressBar({ value, tone = "cyan" }: { value: number; tone?: "cyan" | "lime" }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-white/8">
      <div
        className={`h-full rounded-full transition-all duration-500 ${tone === "lime" ? "bg-quantum-lime" : "bg-quantum-cyan"}`}
        style={{ width: `${Math.max(4, value)}%` }}
      />
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  icon: typeof Trophy;
  accent: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/25 p-5 backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-bold text-white">{value}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 ${accent}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

/** Banner de CTA para visitantes não logados, exibido no topo do checkout */
function PublicCtaBanner({ packSlug, packName, amountCents, description }: { packSlug: string; packName: string; amountCents: number; description: string }) {
  const checkoutUrl = buildMarketplaceCheckoutUrl({ source: "marketplaces", type: "pack", slug: packSlug, name: packName, amountCents, description });
  return (
    <div className="rounded-[28px] border border-quantum-cyan/30 bg-[radial-gradient(circle_at_top_left,rgba(0,229,255,0.14),transparent_35%),rgba(15,23,42,0.95)] p-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <Badge className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">{packName}</Badge>
          <p className="text-2xl font-bold text-white">{formatCurrency(amountCents)}</p>
          <p className="max-w-xl text-sm leading-6 text-slate-300">{description}</p>
        </div>
        <Link href={`/login?from=${encodeURIComponent(checkoutUrl)}`}>
          <Button className="gradient-btn h-12 min-w-[180px] px-6 text-sm font-semibold">
            <LogIn className="mr-2 h-4 w-4" />
            Entrar para adquirir
          </Button>
        </Link>
      </div>
    </div>
  );
}


// NEXUS_QUICK_ACTIONS_V2
function NexusQuickActionsBar() {
  const [, setLocation] = useLocation();
  const executeMutation = trpc.agentSkillsRuntime.execute.useMutation();
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [result, setResult] = useState<{ ok: boolean; label: string; msg: string } | null>(null);

  const runSkill = async (slug: string, label: string) => {
    setBusySlug(slug);
    setResult(null);
    try {
      const res: any = await executeMutation.mutateAsync({ slug, params: {}, dryRun: true } as any);
      setResult({ ok: true, label, msg: `${label} executou em dry-run com sucesso. ${typeof res === "object" ? JSON.stringify(res).slice(0, 120) : ""}` });
    } catch (e: any) {
      setResult({ ok: false, label, msg: e?.message ?? "Falha" });
    } finally {
      setBusySlug(null);
    }
  };

  const actions = [
    { slug: "prospeccao-outbound", icon: "🎯", label: "Prospectar Leads", color: "from-emerald-500 to-teal-500", action: () => runSkill("prospeccao-outbound", "Prospecção Outbound") },
    { slug: "auto-publisher", icon: "📤", label: "Publicar Agora", color: "from-purple-500 to-pink-500", action: () => runSkill("auto-publisher", "Auto-Publisher") },
    { slug: "copywriter-persuasivo", icon: "✍️", label: "Gerar Conteúdo", color: "from-quantum-cyan to-blue-500", action: () => runSkill("copywriter-persuasivo", "Copywriter Persuasivo") },
    { slug: "tracking", icon: "🔗", label: "Tracking Links", color: "from-amber-500 to-orange-500", action: () => setLocation("/tracking/links") },
  ];

  return (
    <section className="rounded-3xl border border-quantum-cyan/30 bg-[linear-gradient(135deg,rgba(7,89,133,0.18),rgba(2,6,23,0.96))] p-5 shadow-2xl shadow-cyan-900/20">
      <div className="flex items-center justify-between mb-3">
        <div>
          <Badge className="border border-quantum-cyan/40 bg-quantum-cyan/10 text-quantum-cyan mb-1">
            ⚡ Ações Rápidas · Agente Live
          </Badge>
          <h2 className="text-lg font-bold text-white">Operação de vendas em 1 clique</h2>
        </div>
      </div>

      {result && (
        <div className={`mb-3 rounded-xl border p-3 text-sm ${result.ok ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200" : "border-rose-500/40 bg-rose-500/10 text-rose-200"}`}>
          {result.ok ? "✅" : "❌"} <strong>{result.label}</strong>: {result.msg}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {actions.map((a) => (
          <button
            key={a.slug}
            onClick={a.action}
            disabled={busySlug === a.slug}
            className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-left transition hover:border-quantum-cyan/50 disabled:opacity-50`}
          >
            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${a.color}`} />
            <div className="text-2xl mb-2">{a.icon}</div>
            <div className="text-sm font-bold text-white">{a.label}</div>
            <div className="text-[10px] font-mono text-slate-500 mt-1">
              {busySlug === a.slug ? "⏳ executando…" : a.slug === "tracking" ? "navegar →" : "dry-run"}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function MarketplacesContent({ isPublicView }: { isPublicView: boolean }) {
  const { profile } = useMarketplaceProfile();
  const { isAuthenticated } = useAuth();

  const displayProfile = useMemo(
    () => resolveShowcaseMarketplaceProfile(profile, isAuthenticated),
    [profile, isAuthenticated],
  );

  const progress = getProgressSnapshot(displayProfile);
  const ebookBundles = getUnlockedEbookBundles(displayProfile);
  const skillBundles = getUnlockedSkillBundles(displayProfile);
  const hasOnboardingFlag =
    typeof window !== "undefined" && new URLSearchParams(window.location.search).get("onboarding") === "1";
  const isMonthlyActivationFocus =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("focus") === "monthly-activation";

  // Correção #3 — Marketplace enxuto:
  // Em vitrine pública (sem autenticação) expõe APENAS o Pack de Acesso (pack-a2).
  // Aquisição de upgrades é exclusiva em /upgrades (autenticado).
  // Marketplace Nexus: somente Pack A² (Agente Afiliado). Demais packs apenas em /upgrades.
  const visiblePacks = NEXUS_PACKS.filter((p) => p.slug === "pack-a2");

  const packStates = visiblePacks.map((pack) => ({
    ...pack,
    access: getPackAccess(displayProfile, pack),
  }));

  const availableNow = packStates.filter((pack) => pack.access.status === "available");
  const activeCount = packStates.filter((pack) => pack.access.status === "active").length;
  const activeEbooks = ebookBundles.filter((bundle) => bundle.status === "active").length;
  const activeSkills = skillBundles.filter((bundle) => bundle.status === "active").length;
  const [searchTerm, setSearchTerm] = useState("");
  const [storefrontFilter, setStorefrontFilter] = useState<"all" | "packs" | "ebooks">("all");
  const [ebookCollection, setEbookCollection] = useState<string>("");
  const [ebookSearch, setEbookSearch] = useState<string>("");

  // Carrinho do Marketplace Nexus (ebooks) — modelo Hotmart
  type CartLine = { slug: string; title: string; priceCents: number; coverPath?: string | null };
  const [ebookCart, setEbookCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  // Fix bug 404 /marketplaces/cart: abrir cart automaticamente via ?openCart=1
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("openCart") === "1") {
        setCartOpen(true);
      }
    }
  }, []);

  // NEXUS_UX_STATES_V2
  const debouncedEbookSearch = useDebounceValue(ebookSearch, 220);
  const [nexusQuickView, setNexusQuickView] = useState<any | null>(null);
  const [nexusViewMode, setNexusViewMode] = useState<NexusViewMode>(() => {
    if (typeof window === "undefined") return "large";
    const saved = window.localStorage.getItem("nexus_view_mode");
    return (saved === "compact" || saved === "carousel" || saved === "large") ? (saved as NexusViewMode) : "large";
  });
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("nexus_view_mode", nexusViewMode);
    }
  }, [nexusViewMode]);
  const [nexusActiveAnchor, setNexusActiveAnchor] = useState<string>("");

  const [paymentOpen, setPaymentOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [processing, setProcessing] = useState(false);
  const [orderResult, setOrderResult] = useState<any>(null);
  const cartTotal = ebookCart.reduce((acc, c) => acc + c.priceCents, 0);

  function addEbookToCart(eb: any) {
    setEbookCart((prev) => prev.some((x) => x.slug === eb.slug) ? prev : [...prev, {
      slug: eb.slug, title: eb.title, priceCents: eb.costCents, coverPath: eb.coverPath,
    }]);
    setCartOpen(true);
  }
  function removeFromCart(slug: string) { setEbookCart((p) => p.filter((c) => c.slug !== slug)); }
  function clearCart() { setEbookCart([]); }

  const placeOrder = (trpc as any).affiliateStore?.placeStoreOrder?.useMutation
    ? (trpc as any).affiliateStore.placeStoreOrder.useMutation()
    : null;

  async function handleRequestPackTicket(pack: { slug: string; name: string; priceCents: number }) {
    try {
      const email = prompt("Confirme seu email de cadastro para o ticket:");
      if (!email || !email.includes("@")) { alert("Email inválido"); return; }
      const r = await fetch("/api/marketplace/pack-ticket", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packSlug: pack.slug, packName: pack.name,
          amountCents: pack.priceCents, paymentMethod: "pix",
          customerEmail: email,
        }),
      });
      const j = await r.json();
      if (!r.ok || !j.ok) { alert(j?.error || "Falha ao abrir ticket"); return; }
      alert("Ticket #" + j.ticketId + " aberto. O administrador confirmará seu pagamento e ativará o Pack. Você receberá email de confirmação.");
    } catch (e: any) {
      alert(e?.message || "Erro");
    }
  }

  async function handlePayWithBalance() {
    if (!customerEmail.includes("@") || ebookCart.length === 0) return;
    setProcessing(true);
    try {
      const payBal = (trpc as any).marketplaceNexus?.payWithBalance?.useMutation
        ? (trpc as any).marketplaceNexus.payWithBalance
        : null;
      // 1) cria pedido
      const createOrder = (trpc as any).marketplaceNexus?.checkout?.useMutation
        ? (trpc as any).marketplaceNexus.checkout
        : null;
      if (!createOrder) throw new Error("Checkout indisponível");
      // Fluxo simplificado: usa endpoint REST proxy se disponível
      const r = await fetch("/api/marketplace/checkout-with-balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          items: ebookCart.map((c) => ({ slug: c.slug, title: c.title, priceCents: c.priceCents })),
          amountCents: cartTotal,
          customerEmail,
          customerName: customerName || undefined,
        }),
      });
      const data = await r.json();
      if (!r.ok || !data?.ok) throw new Error(data?.error || "Saldo insuficiente ou erro no pagamento");
      setOrderResult({ ok: true, orderId: data.orderId, status: "paid",
        message: "Pagamento via saldo confirmado",
        delivery: { channel: "email", to: customerEmail, eta: "Entrega imediata por e-mail." } });
      setPaymentOpen(false);
      setEbookCart([]);
      setSuccessOpen(true);
    } catch (e: any) {
      alert(e?.message || "Falha no pagamento por saldo");
    } finally { setProcessing(false); }
  }

  function handleGoToPixCheckout() {
    if (!customerEmail.includes("@") || ebookCart.length === 0) return;
    const desc = ebookCart.length === 1
      ? ebookCart[0].title
      : `${ebookCart.length} e-books · Marketplace Nexus`;
    // ONDA 15 FIX: usar buildMarketplaceCheckoutUrl para persistir intent completo (base64 + localStorage)
    const url = buildMarketplaceCheckoutUrl({
      source: "marketplace-nexus",
      type: "ebook" as any,
      slug: ebookCart[0]?.slug ?? "ebook-checkout",
      name: desc,
      amountCents: cartTotal,
      description: desc,
      payerEmail: customerEmail,
      payerName: customerName || undefined,
    } as any);
    window.location.href = url;
  }

  async function handlePayMercadoPago() {
    if (!customerEmail.includes("@") || ebookCart.length === 0) return;
    setProcessing(true);
    try {
      const ref = (typeof window !== "undefined" && (localStorage.getItem("nx_ref") || "")) || "MARKETPLACE-NEXUS";
      const res = placeOrder
        ? await placeOrder.mutateAsync({
            ownerCode: ref,
            customerEmail,
            customerName: customerName || undefined,
            items: ebookCart.map((c) => ({ slug: c.slug, title: c.title, priceCents: c.priceCents })),
            amountCents: cartTotal,
            paymentMethod: "mercado_pago",
          })
        : { ok: true, orderId: "local_" + Date.now(), status: "pending",
            message: "Aguardando confirmação Mercado Pago",
            delivery: { channel: "email", to: customerEmail, eta: "Entrega após confirmação." } };
      setOrderResult(res);
      setPaymentOpen(false);
      setEbookCart([]);
      setSuccessOpen(true);
    } catch (e) { console.error(e); }
    finally { setProcessing(false); }
  }

  async function handlePay() {
    if (!customerEmail.includes("@") || ebookCart.length === 0) return;
    setProcessing(true);
    try {
      const ref = (typeof window !== "undefined" && (localStorage.getItem("nx_ref") || "")) || "MARKETPLACE-NEXUS";
      const res = placeOrder
        ? await placeOrder.mutateAsync({
            ownerCode: ref,
            customerEmail,
            customerName: customerName || undefined,
            items: ebookCart.map((c) => ({ slug: c.slug, title: c.title, priceCents: c.priceCents })),
            amountCents: cartTotal,
          })
        : { ok: true, orderId: "local_" + Date.now(), status: "paid",
            message: "Pagamento Realizado com Sucesso",
            delivery: { channel: "email", to: customerEmail, eta: "Entrega imediata por e-mail." } };
      setOrderResult(res);
      setPaymentOpen(false);
      setEbookCart([]);
      setSuccessOpen(true);
    } catch (e) { console.error(e); }
    finally { setProcessing(false); }
  }
  const stockItems = useMemo(() => getOperationalInventory(displayProfile), [displayProfile]);
  // Catálogo REAL servido pelo backend (132 ebooks oficiais do repositório)
  const remoteEbooksQuery = (trpc as any).marketplaceNexus?.listEbooks?.useQuery
    ? (trpc as any).marketplaceNexus.listEbooks.useQuery(undefined, { retry: false })
    : null;
  const repoEbooks = useMemo(() => {
    const list = (remoteEbooksQuery?.data ?? []) as any[];
    return list.map((e) => ({
      slug: String(e.slug),
      order: Number(e.order ?? 0),
      title: String(e.title ?? "E-book"),
      subtitle: e.subtitle ?? null,
      description: e.description ?? "",
      costCents: Number(e.costCents ?? 50),
      resalePriceCents: Number(e.resalePriceCents ?? 99),
      pages: Number(e.pages ?? 0),
      category: String(e.category ?? "Nexus Affil'IA'te Store"),
      coverGradient: e.coverGradient ?? null,
      htmlPath: e.htmlPath ?? "",
      pdfPath: e.pdfPath ?? "",
      coverPath: e.coverPath ?? null,
      unlockPackSlug: String(e.unlockPackSlug ?? "pack-a2"),
      status: (e.status as "active" | "locked") ?? "locked",
    }));
  }, [remoteEbooksQuery?.data]);
  const ebookCollections = useMemo(() => {
    const set = new Set<string>();
    repoEbooks.forEach((e) => e.category && set.add(e.category));
    return Array.from(set).sort();
  }, [repoEbooks]);
  const filteredEbooks = useMemo(() => {
    const q = debouncedEbookSearch.trim().toLowerCase();
    return sortByCollectionRank(repoEbooks.filter((e) => {
      if (ebookCollection && e.category !== ebookCollection) return false;
      if (q && !`${e.title} ${e.subtitle ?? ""} ${e.description ?? ""}`.toLowerCase().includes(q)) return false;
      return true;
    }));
  }, [repoEbooks, ebookCollection, debouncedEbookSearch]);

  // Agrupar por coleção mantendo ordem do rank
  const nexusEbookGroups = useMemo(() => {
    const map = new Map<string, typeof filteredEbooks>();
    filteredEbooks.forEach((e) => {
      const k = e.category || "Outras";
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(e);
    });
    return Array.from(map.entries());
  }, [filteredEbooks]);

  // Scroll-spy
  useEffect(() => {
    if (nexusEbookGroups.length === 0) return;
    const obs = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible[0]) setNexusActiveAnchor(visible[0].target.id);
    }, { rootMargin: "-30% 0% -55% 0%", threshold: [0, 0.25, 0.5, 0.75, 1] });
    nexusEbookGroups.forEach(([cat]) => {
      const el = document.getElementById(ebookSlugify(cat));
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [nexusEbookGroups]);
  // Mantém compatibilidade com o storefront (que precisa do array para badges/contagens)
  const marketplaceEbooks = repoEbooks;
  // Em vista pública, hero exibe somente o Pack de Acesso (único item de packStates).
  // Para usuários autenticados, mantém até 3 packs disponíveis.
  const heroPacks = isPublicView ? packStates : availableNow.slice(0, 3);
  const featuredChannels = EXTERNAL_MARKETPLACES.slice(0, 4);
  const storefrontItems = useMemo(() => {
    const packItems = packStates.map((pack) => ({
      id: `pack-${pack.slug}`,
      type: "packs" as const,
      title: pack.name,
      subtitle: pack.shortName,
      category: pack.stage.toUpperCase(),
      description: pack.description,
      badge: pack.access.status === "active" ? "Ativo" : pack.access.status === "available" ? "Disponível" : "Bloqueado",
      priceLabel: formatCurrency(pack.priceCents),
      ctaLabel: isPublicView ? "Entrar para adquirir" : "Comprar pack",
      href: isPublicView
        ? `/login?from=${encodeURIComponent(buildMarketplaceCheckoutUrl({ source: "marketplaces", type: "pack", slug: pack.slug, name: pack.name, amountCents: pack.priceCents, description: pack.description }))}`
        : buildMarketplaceCheckoutUrl({ source: "marketplaces", type: "pack", slug: pack.slug, name: pack.name, amountCents: pack.priceCents, description: pack.description }),
      accent: pack.access.status === "active" ? "text-emerald-300" : "text-quantum-cyan",
      detail: pack.highlights[0] ?? `${pack.xpGranted.toLocaleString("pt-BR")} XP liberados`,
    }));

    // Marketplace Nexus = única vitrine oficial de ebooks (fusão com /marketplaces/ebooks).
    const ebookItems = marketplaceEbooks.map((ebook) => ({
      id: `ebook-${ebook.slug}`,
      type: "ebooks" as const,
      title: ebook.title,
      subtitle: (ebook as any).subtitle || '', // D14-RaizFix
      category: ebook.category,
      description: ebook.description,
      badge: ebook.status === "active" ? "Liberado" : "Revenda",
      priceLabel: `Custo ${formatCurrency(ebook.costCents)} · Revenda ${formatCurrency(ebook.resalePriceCents)}`,
      ctaLabel: isPublicView ? "Entrar para comprar" : "Comprar e-book",
      href: isPublicView
        ? `/login?from=${encodeURIComponent(buildMarketplaceCheckoutUrl({ source: "marketplaces", type: "ebook", slug: ebook.slug, name: ebook.title, amountCents: ebook.costCents, description: ebook.description }))}`
        : buildMarketplaceCheckoutUrl({ source: "marketplaces", type: "ebook", slug: ebook.slug, name: ebook.title, amountCents: ebook.costCents, description: ebook.description }),
      accent: ebook.status === "active" ? "text-quantum-lime" : "text-quantum-purple",
      detail: `${ebook.pages} páginas · coleção Nexus Affil'IA'te Store`,
      coverPath: (ebook as any).coverPath ?? null,
    }));

    // O storefront genérico recebe APENAS o Pack A². A vitrine de e-books
    // é renderizada em seção própria (formato Loja Virtual) logo abaixo.
    const source = [...packItems];
    return source.filter((item) => {
      const matchesType = storefrontFilter === "all" || item.type === storefrontFilter;
      const q = searchTerm.trim().toLowerCase();
      const matchesQuery = q.length === 0 || `${item.title} ${item.subtitle} ${item.description} ${item.category}`.toLowerCase().includes(q);
      return matchesType && matchesQuery;
    });
  }, [isPublicView, marketplaceEbooks, packStates, searchTerm, storefrontFilter]);

  return (
    <div className="space-y-8 pb-8">
      <NexusQuickActionsBar />
      {isMonthlyActivationFocus && (
        <section
          id="monthly-activation"
          className="rounded-[32px] border border-amber-300/30 bg-[radial-gradient(circle_at_top_left,rgba(252,211,77,0.16),transparent_30%),linear-gradient(180deg,rgba(10,18,40,0.96),rgba(2,6,23,1))] p-6 shadow-2xl shadow-black/40 md:p-8"
        >
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <Badge className="border border-amber-300/30 bg-amber-300/10 text-amber-200">
                Programa de Afiliados · Assinatura mensal
              </Badge>
              <h1 className="mt-3 text-2xl font-bold text-white md:text-3xl">
                Ativação Mensal — chave do seu plano de comissões
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                A Ativação Mensal funciona como uma assinatura recorrente do programa: enquanto estiver em dia,
                você libera bônus, comissões em todos os níveis da rede e recompensas do ciclo. A janela oficial
                de pagamento é entre os dias 01 e 10 de cada mês.
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono text-[10px] uppercase tracking-widest text-slate-400">Status do ciclo</p>
              <p className="mt-1 font-sans text-2xl font-bold text-emerald-300">Ativo · Junho/2026</p>
              <p className="mt-1 text-[11px] text-slate-400">Próxima janela: 01 a 10 do próximo mês</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-[1.2fr_1fr_0.95fr]">
            <div className="rounded-3xl border border-emerald-300/25 bg-emerald-300/5 p-5">
              <p className="font-mono text-[10px] uppercase tracking-widest text-emerald-200">// Diretriz financeira por faixa</p>
              <p className="mt-2 text-lg font-semibold text-white">Ativação Mensal do Programa</p>
              <div className="mt-3 space-y-2 text-[12px] leading-5 text-slate-200">
                {[
                  ["Afiliado I · II · III", "R$ 10 / mês", "Mantém bônus, comissões e libera Packs A² SiSu"],
                  ["Preditivo I · II · III", "R$ 20 / mês", "Mantém elegibilidade e amplia Packs SiSu da Rede N.O."],
                  ["Generativo I · II · III", "R$ 30 / mês", "Libera Packs SiSu + ativa XP mensal por paridade"],
                  ["Orquestrador I · II", "R$ 50 a R$ 100 / mês", "Escala do N.O. com ativação superior"],
                  ["Orquestrador III", "R$ 200 / mês", "Faixa C-Level com ativação ampliada"],
                  ["IA Agêntica I · II · III", "R$ 500 a R$ 2.000 / mês", "Continuidade máxima de bônus, rede e legado"],
                ].map(([tier, value, detail]) => (
                  <div key={tier} className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-white">{tier}</p>
                      <span className="font-mono text-emerald-300">{value}</span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400">{detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-quantum-cyan/25 bg-quantum-cyan/5 p-5">
              <p className="font-mono text-[10px] uppercase tracking-widest text-quantum-cyan">// Regra operacional</p>
              <ol className="mt-2 space-y-2 list-decimal pl-5 text-[12px] leading-5 text-slate-300">
                <li>Gere o Pix da Ativação Mensal no checkout integrado do ciclo vigente.</li>
                <li>Confirme o pagamento via Mercado Pago dentro da janela oficial de 01 a 10.</li>
                <li>O webhook credita a ativação e habilita bônus, comissões e recompensas do período.</li>
                <li>Até AGENTE GENERATIVO, a ativação mensal não soma XP: ela entrega novos Packs SiSu para sincronização da Rede N.O.</li>
                <li>A partir de AGENTE GENERATIVO, a ativação mensal passa a liberar Packs SiSu + XP por paridade de R$1 = 1XP.</li>
              </ol>
              <MonthlyActivationButton />
              <p className="mt-3 text-[11px] text-slate-400">Valor exibido no checkout deve seguir a faixa do nível vigente do afiliado.</p>
            </div>

            <div className="rounded-3xl border border-amber-300/25 bg-amber-300/5 p-5">
              <p className="font-mono text-[10px] uppercase tracking-widest text-amber-200">// Regras oficiais</p>
              <ul className="mt-2 space-y-1 list-disc pl-5 text-[12px] leading-5 text-amber-100/90">
                <li>Janela de pagamento: dias 01 a 10 de cada mês.</li>
                <li>Até o nível AGENTE GENERATIVO, a ativação mensal prioriza sincronização por Packs SiSu.</li>
                <li>Do AGENTE GENERATIVO em diante, ativa Packs SiSu e também credita XP mensal na paridade R$1 = 1XP.</li>
                <li>Inadimplência acumulada suspende bônus do ciclo e trava benefícios operacionais.</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
              <p className="font-mono text-[10px] uppercase tracking-widest text-slate-400">// O que a Ativação Mensal libera</p>
              <div className="mt-3 grid grid-cols-1 gap-2 text-[12px] text-slate-200 md:grid-cols-2">
                <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/5 px-3 py-2">
                  <p className="font-semibold text-emerald-200">Comissões diretas</p>
                  <p className="text-[11px] text-slate-400">N1 20% · N2 10% · N3 5% · N4 2,5% · N5 1%</p>
                </div>
                <div className="rounded-2xl border border-quantum-cyan/20 bg-quantum-cyan/5 px-3 py-2">
                  <p className="font-semibold text-quantum-cyan">Bônus de rede</p>
                  <p className="text-[11px] text-slate-400">Mantém elegibilidade do Networking Operacional e matriz forçada.</p>
                </div>
                <div className="rounded-2xl border border-purple-400/20 bg-purple-400/5 px-3 py-2">
                  <p className="font-semibold text-purple-200">Packs SiSu</p>
                  <p className="text-[11px] text-slate-400">Antes do Generativo: foco total em novos Packs SiSu para sincronização da Rede N.O.</p>
                </div>
                <div className="rounded-2xl border border-amber-300/20 bg-amber-300/5 px-3 py-2">
                  <p className="font-semibold text-amber-200">XP mensal</p>
                  <p className="text-[11px] text-slate-400">Somente a partir do AGENTE GENERATIVO, com paridade de R$1 = 1XP.</p>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/30">
              <div className="border-b border-white/10 px-5 py-3">
                <p className="font-mono text-[10px] uppercase tracking-widest text-slate-400">// Histórico de Ativações</p>
              </div>
              <table className="w-full text-left text-[12px]">
                <thead className="bg-white/5 text-slate-400">
                  <tr>
                    <th className="px-4 py-2 font-mono text-[10px] uppercase tracking-widest">Ciclo</th>
                    <th className="px-4 py-2 font-mono text-[10px] uppercase tracking-widest">Faixa</th>
                    <th className="px-4 py-2 font-mono text-[10px] uppercase tracking-widest">Status</th>
                    <th className="px-4 py-2 text-right font-mono text-[10px] uppercase tracking-widest">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-slate-200">
                  {[
                    { c: "Jun/2026", d: "Afiliado/Preditivo", st: "Ativo", v: "R$ 10 a R$ 20" },
                    { c: "Mai/2026", d: "Generativo", st: "Pago", v: "R$ 30" },
                    { c: "Abr/2026", d: "Orquestrador", st: "Pago", v: "R$ 50 a R$ 200" },
                    { c: "Mar/2026", d: "IA Agêntica", st: "Pago", v: "R$ 500+" },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-white/5">
                      <td className="px-4 py-2 font-mono text-[11px] text-slate-400">{row.c}</td>
                      <td className="px-4 py-2">{row.d}</td>
                      <td className="px-4 py-2">
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${row.st === "Ativo" ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-200" : "border-white/10 bg-white/5 text-slate-300"}`}>
                          {row.st}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right font-mono text-emerald-300">{row.v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="mt-5 text-[10px] uppercase tracking-widest text-slate-500">
            Painel objetivo e sincronizado com o Programa de Afiliados · Para catálogo, estoque, bibliotecas e capacidades do Agente IA acesse o Dashboard ou /marketplaces sem foco.
          </p>
        </section>
      )}


      {/* HERO NEXUS STORIE MARKETPLACE */}
      <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(124,255,178,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(0,229,255,0.20),transparent_30%),linear-gradient(180deg,rgba(10,18,40,0.98),rgba(2,6,23,1))] p-6 shadow-2xl shadow-black/40 md:p-8">
        <div className="absolute inset-y-0 right-0 hidden w-[38%] bg-[radial-gradient(circle_at_center,rgba(124,255,178,0.10),transparent_55%)] lg:block" />
        <div className="relative grid gap-8 xl:grid-cols-[1.1fr_0.9fr] xl:items-center">
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <Badge className="border border-quantum-lime/30 bg-quantum-lime/10 text-quantum-lime">
                <Sparkles className="mr-1.5 h-3 w-3" />
                Nexus Storie Marketplace
              </Badge>
              <Badge className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">
                Nexus Partners Pack · assinatura independente
              </Badge>
              <Badge className="border border-white/10 bg-white/5 text-slate-200">Pix · Mercado Pago</Badge>
              <Badge className="border border-white/10 bg-white/5 text-slate-200">Entrega digital imediata</Badge>
              {isPublicView && (
                <Badge className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">
                  Vitrine pública · faça login para comprar
                </Badge>
              )}
            </div>

            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl font-black tracking-tight text-white md:text-5xl xl:text-6xl">
                Sua central de{" "}
                <span className="text-quantum-lime">produtos, packs e oportunidades</span>
              </h1>
              <p className="max-w-3xl text-base leading-7 text-slate-300 md:text-lg">
                O Nexus Storie Marketplace reúne produtos, packs da jornada principal, bibliotecas de e-books e canais
                parceiros em um único lugar. Dentro desse ecossistema, o Nexus Partners Pack aparece como <strong className="text-white">software contratável por assinatura</strong>, sem substituir, herdar ou representar a progressão por packs do Nexus Affil'IA'te.
              </p>
            </div>

            {!isPublicView && (
              <div className="grid gap-3 sm:grid-cols-3">
                <KpiCard label="packs ativos" value={String(activeCount)} icon={Package} accent="text-quantum-cyan" />
                <KpiCard label="bibliotecas" value={String(activeEbooks)} icon={BookOpen} accent="text-quantum-lime" />
                <KpiCard label="skills liberadas" value={String(activeSkills)} icon={Sparkles} accent="text-quantum-purple" />
              </div>
            )}

            {isPublicView && (
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-3xl border border-quantum-lime/20 bg-quantum-lime/5 p-5">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-quantum-lime/70">Pack disponível</p>
                  <p className="mt-3 text-3xl font-bold text-white">1</p>
                </div>
                <div className="rounded-3xl border border-quantum-cyan/20 bg-quantum-cyan/5 p-5">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-quantum-cyan/70">E-books no catálogo</p>
                  <p className="mt-3 text-3xl font-bold text-white">800+</p>
                </div>
                <div className="rounded-3xl border border-purple-500/20 bg-purple-500/5 p-5">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-purple-300/70">Skills do agente</p>
                  <p className="mt-3 text-3xl font-bold text-white">45</p>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              {isPublicView ? (
                <>
                  <Link href="/cadastro">
                    <Button className="gradient-btn h-12 px-6 text-sm font-semibold">
                      <Bot className="mr-2 h-4 w-4" />
                      Criar conta e ativar agente
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="outline" className="h-12 border-white/15 bg-white/5 px-6 text-sm text-white hover:bg-white/10">
                      <LogIn className="mr-2 h-4 w-4" />
                      Já tenho conta
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/pix/checkout?pack=pack-a2">
                    <Button className="gradient-btn h-12 px-6 text-sm font-semibold">
                      Adquirir Pack A² (R$ 10)
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/estoque">
                    <Button variant="outline" className="h-12 border-white/15 bg-white/5 px-6 text-sm text-white hover:bg-white/10">
                      Abrir meu estoque
                    </Button>
                  </Link>
                </>
              )}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-3xl border border-quantum-cyan/20 bg-quantum-cyan/5 p-4">
                <p className="text-[10px] uppercase tracking-[0.24em] text-quantum-cyan/80">Jornada principal do afiliado</p>
                <p className="mt-2 text-lg font-bold text-white">Pack A² é a porta de entrada</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">Ativa o primeiro agente IA, libera a jornada comercial e inicia a progressão oficial do Nexus Affil'IA'te.</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">SaaS complementar</p>
                <p className="mt-2 text-lg font-bold text-white">Nexus Partners Pack é opcional</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">Ferramenta híbrida por assinatura, contratável por afiliados ou terceiros, com operação independente da escada de packs.</p>
              </div>
            </div>

            {hasOnboardingFlag && (
              <div className="rounded-2xl border border-quantum-cyan/30 bg-quantum-cyan/10 p-4 text-sm text-quantum-cyan">
                Cadastro concluído! Adquira agora seu Pack A² por R$ 10 para ativar seu Agente Nexus e começar a ganhar comissões. O Nexus Partners Pack fica disponível opcionalmente após a ativação.
              </div>
            )}
          </div>

          {/* CARD LATERAL */}
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-1">
            {!isPublicView ? (
              <>
                <Card className="overflow-hidden border-white/10 bg-white/6 backdrop-blur">
                  <CardHeader className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <CardTitle className="text-xl text-white">Sua conta comercial</CardTitle>
                        <CardDescription className="mt-2 text-slate-300">Nível atual e próxima meta.</CardDescription>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-quantum-cyan">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
                      <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">nível atual</p>
                      <p className="mt-3 text-2xl font-bold text-white">{getLevelLabel(displayProfile.currentLevel)}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-400">{getLevelSubtitle(displayProfile.currentLevel)}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">XP acumulado</p>
                        <p className="mt-2 text-2xl font-bold text-white">{displayProfile.currentXp.toLocaleString("pt-BR")}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Indicados diretos</p>
                        <p className="mt-2 text-2xl font-bold text-white">{displayProfile.directReferrals}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-white/10 bg-white/6 backdrop-blur">
                  <CardContent className="space-y-4 p-6">
                    <div className="flex items-center gap-2 text-sm font-semibold text-white">
                      <Trophy className="h-4 w-4 text-amber-300" />
                      Próximo desbloqueio
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white">{progress.nextPack?.name ?? "Jornada completa!"}</p>
                      <p className="mt-1 text-sm text-slate-400">
                        {progress.nextPack ? `Meta: ${progress.nextPack.shortName}` : "Você concluiu toda a jornada de packs."}
                      </p>
                    </div>
                    <div className="space-y-3 rounded-2xl border border-white/10 bg-black/25 p-4">
                      <div className="flex items-center justify-between text-sm text-slate-300">
                        <span className="inline-flex items-center gap-2"><Zap className="h-4 w-4 text-quantum-cyan" /> XP</span>
                        <span>{progress.xpCurrent.toLocaleString("pt-BR")} / {progress.xpTarget.toLocaleString("pt-BR")}</span>
                      </div>
                      <ProgressBar value={progress.xpProgress} />
                    </div>
                    <div className="space-y-3 rounded-2xl border border-white/10 bg-black/25 p-4">
                      <div className="flex items-center justify-between text-sm text-slate-300">
                        <span className="inline-flex items-center gap-2"><Users className="h-4 w-4 text-quantum-lime" /> Indicados</span>
                        <span>{progress.directCurrent} / {progress.directTarget}</span>
                      </div>
                      <ProgressBar value={progress.directProgress} tone="lime" />
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              /* Card visível para visitantes — vitrine dos benefícios */
              <Card className="overflow-hidden border-quantum-lime/20 bg-[radial-gradient(circle_at_top_left,rgba(124,255,178,0.12),transparent_40%),rgba(15,23,42,0.95)] backdrop-blur">
                <CardHeader className="space-y-3">
                  <Badge className="w-fit border border-quantum-lime/30 bg-quantum-lime/10 text-quantum-lime">
                    <Star className="mr-1.5 h-3 w-3" />
                    Por que entrar no Nexus?
                  </Badge>
                  <CardTitle className="text-2xl text-white">Tudo que você ganha ao se cadastrar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { icon: Bot, text: "Agente IA ativado no primeiro pack", color: "text-quantum-cyan" },
                    { icon: BookOpen, text: "Biblioteca de e-books para revenda imediata", color: "text-quantum-lime" },
                    { icon: TrendingUp, text: "Comissões sobre toda a sua rede de indicados", color: "text-emerald-400" },
                    { icon: Globe, text: "Mini-site automatizado com seu catálogo", color: "text-quantum-purple" },
                    { icon: Wallet, text: "Checkout com Pix e Mercado Pago integrado", color: "text-amber-300" },
                    { icon: ShieldCheck, text: "Painel de carreira com 15 níveis progressivos", color: "text-quantum-cyan" },
                  ].map((item) => (
                    <div key={item.text} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
                      <item.icon className={`h-4 w-4 shrink-0 ${item.color}`} />
                      <span className="text-sm text-slate-200">{item.text}</span>
                    </div>
                  ))}
                  <Link href="/cadastro">
                    <Button className="gradient-btn mt-2 h-11 w-full text-sm font-semibold">
                      Criar conta grátis agora
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* BENEFÍCIOS RÁPIDOS */}
      <section className="grid gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {[
          {
            title: "Checkout integrado",
            description: "Pague ou receba com Pix e Mercado Pago diretamente pelo painel, sem sair da plataforma.",
            icon: Wallet,
            accent: "text-quantum-cyan",
          },
          {
            title: "Catálogo sempre pronto",
            description: "E-books, packs e produtos organizados em cards visuais, prontos para apresentar e vender.",
            icon: Store,
            accent: "text-quantum-lime",
          },
          {
            title: "Entrega instantânea",
            description: "Produtos digitais liberados automaticamente após confirmação do pagamento.",
            icon: CheckCircle2,
            accent: "text-quantum-purple",
          },
          {
            title: "Crescimento guiado",
            description: "Jornada de carreira com 15 níveis, metas claras de XP e recompensas progressivas.",
            icon: Trophy,
            accent: "text-amber-300",
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

      {!isMonthlyActivationFocus && (
      <section className="space-y-4 rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(124,255,178,0.12),transparent_30%),rgba(255,255,255,0.03)] p-6 shadow-2xl shadow-black/20">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge className="border border-white/10 bg-white/5 text-slate-200">Storefront Nexus Storie</Badge>
            <h2 className="mt-3 text-2xl font-bold text-white md:text-3xl">Pesquise produtos, packs e bibliotecas em um só lugar</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Uma vitrine filtrável para acelerar descoberta de packs e e-books antes de entrar no checkout.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { value: "all", label: "Tudo" },
            ].map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setStorefrontFilter(filter.value as "all" | "packs" | "ebooks")}
                className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                  storefrontFilter === filter.value
                    ? "border-quantum-cyan/60 bg-quantum-cyan/15 text-quantum-cyan"
                    : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative max-w-xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar por nome, categoria ou descrição"
            className="h-12 border-white/10 bg-black/25 pl-11 text-white placeholder:text-slate-500"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {storefrontItems.map((item) => (
            <div key={item.id} className="group rounded-[28px] border border-white/10 bg-black/25 p-5 transition hover:-translate-y-1 hover:border-white/20">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="border border-white/10 bg-white/5 text-slate-200">{item.subtitle}</Badge>
                    <Badge className={`border border-white/10 bg-white/5 ${item.accent}`}>{item.badge}</Badge>
                  </div>
                  <p className="mt-3 text-xl font-bold text-white">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{item.description}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-300">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{item.category}</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{item.detail}</span>
              </div>
              <div className="mt-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500">oferta</p>
                  <p className="mt-2 text-2xl font-black text-white">{item.priceLabel}</p>
                </div>
                <Link href={item.href}>
                  <Button className="gradient-btn h-11 px-5 text-sm font-semibold">
                    {item.ctaLabel}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
      )}

      {/* HEADER STICKY · MEU CARRINHO */}
      <div className="sticky top-0 z-40 -mx-4 mb-2 border-b border-white/10 bg-slate-950/85 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">
              <ShoppingBag className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Marketplace Nexus</p>
              <p className="text-sm font-semibold text-white">Vitrine oficial · {marketplaceEbooks.length} e-books</p>
            </div>
          </div>
          <button
            onClick={() => setCartOpen(true)}
            className="relative inline-flex items-center gap-2 rounded-full bg-quantum-cyan/90 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-quantum-cyan"
          >
            <ShoppingCart className="h-4 w-4" />
            Meu Carrinho
            {ebookCart.length > 0 && (
              <span className="ml-1 inline-flex min-w-[22px] items-center justify-center rounded-full bg-slate-900 px-1.5 py-0.5 text-[11px] font-bold text-quantum-cyan">
                {ebookCart.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* VITRINE DE E-BOOKS — Loja Virtual Nexus Affil'IA'te Store */}
      {!isMonthlyActivationFocus && (
      <section className="space-y-5 rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(0,229,255,0.10),transparent_30%),rgba(255,255,255,0.03)] p-6 shadow-2xl shadow-black/20">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge className="border border-quantum-lime/30 bg-quantum-lime/10 text-quantum-lime">
              Coletâneas oficiais · Nexus Affil'IA'te Store
            </Badge>
            <h2 className="mt-3 text-2xl font-bold text-white md:text-3xl">
              Vitrine de e-books · custo R$ 0,50 · revenda R$ 0,99
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              {repoEbooks.length} e-books no catálogo oficial · {ebookCollections.length} coletâneas, organizados por coleção. Adicione ao carrinho e finalize com checkout Pix automático.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:max-w-md w-full">
            <input
              value={ebookSearch}
              onChange={(e) => setEbookSearch(e.target.value)}
              placeholder="Buscar título, descrição..."
              className="h-11 rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-quantum-cyan/40"
            />
            <select
              value={ebookCollection}
              onChange={(e) => setEbookCollection(e.target.value)}
              className="h-11 rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white focus:outline-none focus:border-quantum-cyan/40"
            >
              <option value="">Todas as coleções</option>
              {ebookCollections.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* UX v2: Tabs scroll-spy de coleções */}
        {nexusEbookGroups.length > 1 && (
          <nav aria-label="Coleções" className="flex gap-2 overflow-x-auto pb-2 mb-2 -mx-1 px-1">
            {nexusEbookGroups.map(([cat, items]) => {
              const id = ebookSlugify(cat);
              const active = nexusActiveAnchor === id;
              return (
                <button
                  key={cat}
                  onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition border ${
                    active
                      ? "bg-quantum-cyan text-slate-950 border-quantum-cyan shadow-lg shadow-quantum-cyan/30"
                      : "bg-slate-900/60 border-white/10 text-slate-300 hover:border-quantum-cyan/40 hover:text-quantum-cyan"
                  }`}
                >
                  {cat} <span className="opacity-60">· {items.length}</span>
                </button>
              );
            })}
          </nav>
        )}

        {/* UX v2: View mode toggle */}
        <div className="flex items-center justify-end mb-2">
          <div role="radiogroup" aria-label="Modo de visualização" className="flex bg-slate-900 border border-white/10 rounded-xl overflow-hidden text-xs">
            {([
              { v: "compact" as const, label: "▦", title: "Grade densa" },
              { v: "large" as const, label: "▢", title: "Cards grandes" },
              { v: "carousel" as const, label: "↔", title: "Carrossel" },
            ]).map((opt) => (
              <button
                key={opt.v}
                role="radio"
                aria-checked={nexusViewMode === opt.v}
                title={opt.title}
                onClick={() => setNexusViewMode(opt.v)}
                className={`px-3 py-2 transition ${nexusViewMode === opt.v ? "bg-quantum-cyan text-slate-950 font-bold" : "text-slate-300 hover:bg-slate-800"}`}
              >{opt.label}</button>
            ))}
          </div>
        </div>

        {/* UX v2: Skeleton enquanto carrega */}
        {remoteEbooksQuery?.isLoading && filteredEbooks.length === 0 && <NexusSkeletonGrid count={8} />}

        {/* UX v2: Grade agrupada por coleção */}
        <div className="space-y-10">
          {nexusEbookGroups.map(([cat, items]) => {
            const id = ebookSlugify(cat);
            const renderCard = (eb: any) => (
              <article
                key={eb.slug}
                className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:border-quantum-cyan/40 hover:shadow-2xl hover:shadow-quantum-cyan/20"
              >
                <button
                  onClick={() => setNexusQuickView(eb)}
                  aria-label={`Detalhes: ${eb.title}`}
                  className={`relative w-full overflow-hidden ${nexusViewMode === "compact" ? "h-32" : "h-44"}`}
                  style={{ background: eb.coverGradient ?? "linear-gradient(135deg,#1e293b 0%,#0f172a 100%)" }}
                >
                  {eb.coverPath && (
                    <img
                      src={eb.coverPath}
                      alt={eb.title}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover opacity-90 transition-all duration-500 group-hover:opacity-100 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />
                  <span className="absolute right-2 top-2 rounded-full bg-quantum-lime px-2 py-0.5 text-[11px] font-bold text-slate-950 shadow-lg">
                    {formatCurrency(eb.costCents)}
                  </span>
                  {eb.status === "active" && (
                    <span className="absolute left-2 top-2 rounded-full bg-emerald-500/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-950">
                      Liberado
                    </span>
                  )}
                  <span className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition bg-quantum-cyan text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    👁 Ver detalhes
                  </span>
                </button>
                <div className="flex flex-1 flex-col p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-quantum-cyan/80">{eb.category}</p>
                  <h3 className={`mt-1 line-clamp-2 font-bold leading-snug text-white ${nexusViewMode === "compact" ? "text-xs" : "text-sm"}`}>
                    <NexusHighlight text={eb.title} query={debouncedEbookSearch} />
                  </h3>
                  {nexusViewMode !== "compact" && eb.subtitle && eb.subtitle !== eb.title && (
                    <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                      <NexusHighlight text={eb.subtitle} query={debouncedEbookSearch} />
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-300">
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5">{eb.pages} págs</span>
                  </div>
                  <div className="mt-auto pt-4 flex items-center gap-2">
                    <Button
                      onClick={() => addEbookToCart(eb)}
                      className="gradient-btn h-9 w-full text-xs font-semibold"
                    >+ Carrinho</Button>
                  </div>
                </div>
              </article>
            );
            return (
              <section key={cat} id={id} className="scroll-mt-40">
                <div className="flex items-baseline justify-between mb-3 border-b border-white/10 pb-2">
                  <h2 className="text-lg md:text-xl font-bold bg-gradient-to-r from-quantum-cyan to-quantum-lime bg-clip-text text-transparent">
                    {cat}
                  </h2>
                  <span className="text-xs text-slate-400">{items.length} ebooks</span>
                </div>
                {nexusViewMode === "carousel" ? (
                  <NexusCarouselRow items={items} render={renderCard} />
                ) : (
                  <div className={
                    nexusViewMode === "compact"
                      ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3"
                      : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  }>
                    {items.map(renderCard)}
                  </div>
                )}
              </section>
            );
          })}
        </div>

        {/* Bloco legado SUBSTITUÍDO (mantido oculto p/ rollback) */}
        <div className="hidden">
          {filteredEbooks.map((eb) => (
            <article
              key={eb.slug}
              className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 transition hover:-translate-y-1 hover:border-quantum-cyan/40"
            >
              <div
                className="relative h-44 w-full overflow-hidden"
                style={{ background: eb.coverGradient ?? "linear-gradient(135deg,#1e293b 0%,#0f172a 100%)" }}
              >
                {eb.coverPath && (
                  <img
                    src={eb.coverPath}
                    alt={eb.title}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover opacity-90 transition group-hover:opacity-100 group-hover:scale-105"
                  />
                )}
                <span className="absolute right-2 top-2 rounded-full bg-quantum-lime px-2 py-0.5 text-[11px] font-bold text-slate-950">
                  {formatCurrency(eb.costCents)}
                </span>
                {eb.status === "active" && (
                  <span className="absolute left-2 top-2 rounded-full bg-emerald-500/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-950">
                    Liberado
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-quantum-cyan/80">
                  {eb.category}
                </p>
                <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-snug text-white">{eb.title}</h3>
                {eb.subtitle && eb.subtitle !== eb.title && (
                  <p className="mt-1 line-clamp-2 text-xs text-slate-400">{eb.subtitle}</p>
                )}
                {eb.description && (
                  <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-400">{eb.description}</p>
                )}
                <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-300">
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5">
                    {eb.pages} páginas
                  </span>
                  <span className="rounded-full border border-quantum-lime/30 bg-quantum-lime/10 px-2.5 py-0.5 text-quantum-lime">
                    Revenda {formatCurrency(eb.resalePriceCents)}
                  </span>
                </div>
                <div className="mt-auto pt-4 flex items-center gap-2">
                  <Button
                    onClick={() => addEbookToCart(eb)}
                    className="gradient-btn h-9 w-full text-xs font-semibold"
                  >
                    + Carrinho
                  </Button>
                  {eb.htmlPath && (
                    <a
                      href={eb.htmlPath}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-semibold text-slate-200 transition hover:bg-white/10"
                    >
                      Prévia
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        {filteredEbooks.length === 0 && (
          <p className="text-center text-sm text-slate-500 py-6">Nenhum e-book encontrado com esses filtros.</p>
        )}
      </section>
      )}

      {/* DRAWER · Meu Carrinho */}
      {cartOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setCartOpen(false)} />
          <div className="relative h-full w-full max-w-md overflow-y-auto border-l border-white/10 bg-slate-950">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-slate-950/95 px-5 py-4">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-quantum-cyan" />
                <h3 className="font-bold text-white">Meu Carrinho</h3>
                <Badge className="border border-white/10 bg-white/5 text-slate-300">{ebookCart.length}</Badge>
              </div>
              <button onClick={() => setCartOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="space-y-3 px-5 py-4">
              {ebookCart.length === 0 ? (
                <div className="py-10 text-center text-slate-400">
                  <ShoppingBag className="mx-auto mb-3 h-10 w-10 opacity-50" />
                  Carrinho vazio. Adicione e-books da vitrine.
                </div>
              ) : ebookCart.map((c) => (
                <div key={c.slug} className="flex gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="h-20 w-14 flex-shrink-0 overflow-hidden rounded-md bg-slate-900">
                    {c.coverPath && (<img src={c.coverPath} alt={c.title} className="h-full w-full object-cover" />)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-semibold text-white">{c.title}</p>
                    <p className="mt-1 font-bold text-quantum-cyan">{formatCurrency(c.priceCents)}</p>
                  </div>
                  <button onClick={() => removeFromCart(c.slug)} className="self-start text-slate-500 hover:text-red-400">✕</button>
                </div>
              ))}
            </div>
            <div className="sticky bottom-0 space-y-3 border-t border-white/10 bg-slate-950/95 px-5 py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Total</span>
                <span className="text-lg font-bold text-white">{formatCurrency(cartTotal)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={clearCart} disabled={ebookCart.length === 0}
                  className="border-white/15 bg-white/5 text-white hover:bg-white/10">
                  Limpar
                </Button>
                <Button variant="outline" onClick={() => setCartOpen(false)}
                  className="border-white/15 bg-white/5 text-white hover:bg-white/10">
                  Continuar Comprando
                </Button>
              </div>
              <Button onClick={() => { setCartOpen(false); setPaymentOpen(true); }}
                disabled={ebookCart.length === 0}
                className="gradient-btn h-11 w-full text-sm font-semibold">
                Escolher forma de pagamento
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL · Pagamento (Hotmart-like) */}
      {paymentOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setPaymentOpen(false)} />
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-2xl">
            <div className="border-b border-white/10 px-6 py-4">
              <h3 className="font-bold text-white">Finalizar pagamento</h3>
              <p className="mt-1 text-xs text-slate-400">Você receberá os e-books no seu e-mail logo após a confirmação do pagamento.</p>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handlePay(); }} className="space-y-3 px-6 py-5">
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-slate-400">Seu e-mail</label>
                <input type="email" required value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  className="h-11 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-white focus:border-quantum-cyan/40 focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-slate-400">Nome (opcional)</label>
                <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)}
                  className="h-11 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-white focus:border-quantum-cyan/40 focus:outline-none" />
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
                <div className="flex items-center justify-between text-slate-300">
                  <span>{ebookCart.length} item(s)</span>
                  <span className="font-bold text-white">{formatCurrency(cartTotal)}</span>
                </div>
                <p className="mt-2 text-[11px] text-slate-500">Saldo do painel · Checkout Pix · Mercado Pago · entrega por e-mail.</p>
              </div>
              <div className="grid grid-cols-1 gap-2 pt-1">
                <Button type="button" disabled={processing} onClick={() => handlePayWithBalance()}
                  className="h-11 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold">
                  {processing ? "Processando..." : "Pagar com Saldo do painel"}
                </Button>
                <Button type="button" disabled={processing} onClick={() => handleGoToPixCheckout()}
                  className="h-11 w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold">
                  Checkout Pix · preencher e pagar
                </Button>
                <Button type="button" disabled={processing} onClick={() => handlePayMercadoPago()}
                  className="h-11 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">
                  Abrir checkout Mercado Pago
                </Button>
                <Button type="button" variant="outline" onClick={() => { setPaymentOpen(false); setCartOpen(true); }}
                  className="border-white/15 bg-white/5 text-white hover:bg-white/10">
                  Continuar Comprando
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL · Sucesso */}
      {successOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/80" />
          <div className="relative w-full max-w-md rounded-2xl border border-emerald-500/30 bg-slate-950 p-6 text-center shadow-2xl">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Pagamento Realizado com Sucesso</h3>
            <p className="mt-2 text-sm text-slate-300">
              Os e-books estão a caminho do e-mail <strong className="text-white">{orderResult?.delivery?.to || customerEmail}</strong>.
            </p>
            {orderResult?.orderId && (
              <p className="mt-2 text-[11px] text-slate-500">Pedido: <code className="text-quantum-cyan">{orderResult.orderId}</code></p>
            )}
            <div className="mt-5 grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => setSuccessOpen(false)}
                className="border-white/15 bg-white/5 text-white hover:bg-white/10">Fechar</Button>
              <Link href="/dashboard">
                <Button className="gradient-btn w-full">Ir para o Painel</Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* VITRINE DE PACKS */}
      {!isMonthlyActivationFocus && (
      <section className="hidden grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card
          className="overflow-hidden border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(0,229,255,0.12),transparent_28%),linear-gradient(180deg,rgba(15,23,42,0.92),rgba(2,6,23,0.98))] shadow-2xl shadow-black/20"
        >
          <CardHeader className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <Badge className="border border-quantum-lime/30 bg-quantum-lime/10 text-quantum-lime">
                  Packs disponíveis para ativação
                </Badge>
                <CardTitle className="mt-3 text-2xl text-white md:text-3xl">
                  {isPublicView ? "Escolha seu pack de entrada" : "Produtos disponíveis agora"}
                </CardTitle>
                <CardDescription className="mt-2 max-w-2xl text-slate-300">
                  {isPublicView
                    ? "Cada pack ativa novas capacidades no seu Agente IA, libera produtos para revenda e avança sua carreira na plataforma."
                    : "Packs que você já pode adquirir com base no seu nível e histórico de ativações."}
                </CardDescription>
              </div>
              {!isPublicView && (
                <Link href="/packs">
                  <Button variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10">
                    Ver catálogo completo
                  </Button>
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {heroPacks.length > 0 ? (
              heroPacks.map((pack, index) => (
                <div
                  key={`hero-pack-${pack.slug}`}
                  className="group rounded-[28px] border border-white/10 bg-black/25 p-5 transition hover:-translate-y-1 hover:border-white/20"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">{pack.shortName}</Badge>
                        {index === 0 && (
                          <Badge className="border border-quantum-lime/30 bg-quantum-lime/10 text-quantum-lime">Mais recomendado</Badge>
                        )}
                        {pack.bringsAgent && (
                          <Badge className="border border-purple-500/30 bg-purple-500/10 text-purple-300">
                            <Bot className="mr-1 h-3 w-3" />
                            Ativa o Agente IA
                          </Badge>
                        )}
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">{pack.name}</p>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{pack.description}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {pack.highlights.slice(0, 3).map((highlight) => (
                          <span key={highlight} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                            {highlight}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="min-w-[250px] space-y-4 rounded-[24px] border border-white/10 bg-white/5 p-5">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">investimento</p>
                        <p className="mt-2 text-4xl font-black text-white">{formatCurrency(pack.priceCents)}</p>
                      </div>
                      {isPublicView ? (
                        <Link href={`/login?from=${encodeURIComponent(buildMarketplaceCheckoutUrl({ source: "marketplaces", type: "pack", slug: pack.slug, name: pack.name, amountCents: pack.priceCents, description: pack.description }))}`}>
                          <Button className="gradient-btn h-12 w-full text-sm font-semibold">
                            <LogIn className="mr-2 h-4 w-4" />
                            Entrar para adquirir
                          </Button>
                        </Link>
                      ) : (
                        <Link href={buildMarketplaceCheckoutUrl({ source: "marketplaces", type: "pack", slug: pack.slug, name: pack.name, amountCents: pack.priceCents, description: pack.description })}>
                          <Button className="gradient-btn h-12 w-full text-sm font-semibold">
                            Adquirir agora
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                      <p className="text-xs leading-5 text-slate-400">Entrega digital imediata após confirmação do pagamento.</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[28px] border border-white/10 bg-black/25 p-6 text-sm leading-6 text-slate-300">
                Nenhum pack está disponível para compra agora. Complete os critérios de XP e indicados para desbloquear a próxima oferta.
              </div>
            )}

            <div className="rounded-3xl border border-amber-300/25 bg-amber-300/5 p-5 text-sm leading-6 text-amber-100/90">
              <p className="font-semibold text-amber-200">Ativação mensal (dias 01 a 10)</p>
              <p className="mt-2">Mantenha sua ativação em dia para garantir bônus, comissões e acesso pleno ao catálogo.</p>
              <ul className="mt-3 space-y-1 pl-5 list-disc">
                <li>3 meses sem ativação: suspensão temporária de 90 dias.</li>
                <li>Mais de 4 meses: revisão de nível + suspensão de 120 dias.</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* ESTOQUE LATERAL */}
        <Card className="border-white/10 bg-white/5 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Package className="h-5 w-5 text-quantum-cyan" />
              {isPublicView ? "O que entra na sua vitrine" : "Meu estoque"}
            </CardTitle>
            <CardDescription className="text-slate-400">
              {isPublicView
                ? "Produtos e conteúdos que ficam disponíveis para revenda assim que você ativa um pack."
                : "Produtos que o Agente IA pode usar para apresentar ofertas e apoiar suas vendas."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isPublicView ? (
              /* Preview de estoque para visitantes */
              [
                { title: "Biblioteca de E-books A²", badge: "E-books", desc: "10 e-books prontos para revenda digital." },
                { title: "Pacotes extras AG", badge: "Extras", desc: "Lotes com 25 e-books cada para ampliar sua vitrine." },
                { title: "Cotas de expansão", badge: "Expansão", desc: "Cotas extras liberadas para ampliar sua operação." },
              ].map((item) => (
                <div key={item.title} className="rounded-3xl border border-white/10 bg-black/25 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                      <p className="mt-2 text-xs leading-5 text-slate-400">{item.desc}</p>
                    </div>
                    <Badge className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">{item.badge}</Badge>
                  </div>
                </div>
              ))
            ) : stockItems.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-black/25 p-6 text-sm leading-6 text-slate-300">
                Seu estoque está vazio. Faça uma ativação para liberar packs, bibliotecas e produtos.
              </div>
            ) : (
              stockItems.slice(0, 6).map((item) => (
                <div key={item.id} className="rounded-3xl border border-white/10 bg-black/25 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                      <p className="mt-2 text-xs leading-5 text-slate-400">{item.description}</p>
                    </div>
                    <Badge className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">{item.badge}</Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-300">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Qtd. {item.quantity.toLocaleString("pt-BR")}</span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Agente IA habilitado</span>
                  </div>
                </div>
              ))
            )}

            {isPublicView ? (
              <Link href="/cadastro">
                <Button className="gradient-btn mt-2 h-11 w-full text-sm font-semibold">
                  Criar conta e ver meu estoque real
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Link href="/estoque">
                <Button variant="outline" className="mt-2 w-full border-white/15 bg-white/5 text-white hover:bg-white/10">
                  Ver painel completo do estoque
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </section>
      )}

      {/* CANAIS PARCEIROS */}
      <section className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <Badge className="border border-white/10 bg-white/5 text-slate-200">Canais de distribuição</Badge>
            <h2 className="mt-3 text-2xl font-bold text-white md:text-3xl">
              Seu catálogo distribuído nos maiores canais do mercado
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Além da loja Nexus, seus produtos podem ser distribuídos por canais parceiros para ampliar alcance e receita.
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {featuredChannels.map((channel) => {
            const Icon = MARKETPLACE_ICONS[channel.icon] ?? ShoppingBag;
            const url = channel.externalUrl ?? channel.internalUrl ?? "#";
            const isExternal = Boolean(channel.externalUrl);
            return (
              <a
                key={channel.slug}
                href={url}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noreferrer" : undefined}
                className="group rounded-[28px] border border-white/10 bg-white/5 p-5 transition hover:-translate-y-1 hover:border-white/20"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5" style={{ color: channel.color }}>
                    <Icon className="h-5 w-5" />
                  </div>
                  {isExternal ? (
                    <ExternalLink className="h-4 w-4 text-slate-500 transition group-hover:text-white" />
                  ) : (
                    <ArrowRight className="h-4 w-4 text-slate-500 transition group-hover:text-white" />
                  )}
                </div>
                <p className="mt-4 text-lg font-semibold text-white">{channel.name}</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">{channel.description}</p>
                <Badge
                  className="mt-4 border"
                  style={{
                    borderColor: `${channel.color}44`,
                    backgroundColor: `${channel.color}11`,
                    color: channel.color,
                  }}
                >
                  {channel.status === "ativo" ? "Canal ativo" : channel.status === "em_breve" ? "Em breve" : "Em manutenção"}
                </Badge>
              </a>
            );
          })}
        </div>
      </section>

      {/* E-BOOKS E SKILLS */}
      {!isMonthlyActivationFocus && (
      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="hidden border-white/10 bg-white/5 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <BookOpen className="h-5 w-5 text-quantum-lime" />
              Bibliotecas de e-books por nível
            </CardTitle>
            <CardDescription className="text-slate-400">
              Cada biblioteca acompanha sua evolução e funciona como uma linha de produtos da sua loja.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {ebookBundles.map((bundle) => (
              <div
                key={bundle.slug}
                className={`rounded-3xl border p-4 ${
                  bundle.status === "active" ? "border-green-500/30 bg-green-500/10" : "border-white/10 bg-black/25"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-white">{bundle.name}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{bundle.description}</p>
                  </div>
                  <Badge
                    className={`border ${
                      bundle.status === "active"
                        ? "border-green-500/30 bg-green-500/10 text-green-400"
                        : "border-amber-500/30 bg-amber-500/10 text-amber-300"
                    }`}
                  >
                    {bundle.status === "active" ? "Liberado" : "Bloqueado"}
                  </Badge>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-300">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{bundle.ebookCount} e-books</span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Revenda {bundle.resalePriceLabel}</span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Pack {bundle.unlockPack?.shortName}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="hidden border-white/10 bg-white/5 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Sparkles className="h-5 w-5 text-quantum-purple" />
              Capacidades do seu Agente IA
            </CardTitle>
            <CardDescription className="text-slate-400">
              Cada pack libera novos conjuntos de capacidades que o agente usa nas suas automações comerciais.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {skillBundles.map((bundle) => (
              <div
                key={bundle.slug}
                className={`rounded-3xl border p-4 ${
                  bundle.status === "active" ? "border-purple-500/30 bg-purple-500/10" : "border-white/10 bg-black/25"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-white">{bundle.name}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{bundle.description}</p>
                  </div>
                  {bundle.status === "active" ? (
                    <CheckCircle2 className="mt-1 h-5 w-5 text-green-400" />
                  ) : (
                    <Lock className="mt-1 h-5 w-5 text-amber-300" />
                  )}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">{bundle.skillSummary}</span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">Pack {bundle.unlockPack?.shortName}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
      )}
    {nexusQuickView && (
      <NexusQuickView
        ebook={nexusQuickView}
        query={debouncedEbookSearch}
        onClose={() => setNexusQuickView(null)}
        onAdd={() => { addEbookToCart(nexusQuickView); setNexusQuickView(null); }}
      />
    )}
    <NexusBackToTop />
    </div>
  );
}


// ────────────── UX v2: hooks/helpers ──────────────
function useDebounceValue<T>(value: T, delay = 220): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}
type NexusViewMode = "compact" | "large" | "carousel";
const ebookSlugify = (s: string) => "nexus-col-" + s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

function NexusSkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-white/10 bg-slate-900/60 overflow-hidden animate-pulse">
          <div className="h-44 bg-slate-800/60" />
          <div className="p-4 space-y-2">
            <div className="h-3 w-1/3 bg-slate-800 rounded" />
            <div className="h-4 w-full bg-slate-800 rounded" />
            <div className="h-3 w-2/3 bg-slate-800 rounded" />
            <div className="h-8 w-full bg-slate-800 rounded-lg mt-3" />
          </div>
        </div>
      ))}
    </div>
  );
}

function NexusHighlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const safe = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(${safe})`, "ig");
  const parts = text.split(re);
  return (
    <>
      {parts.map((p, i) =>
        re.test(p) ? (
          <mark key={i} className="bg-quantum-cyan/30 text-quantum-cyan rounded px-0.5">{p}</mark>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

function NexusBackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const fn = () => setShow(window.scrollY > 400);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  if (!show) return null;
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Voltar ao topo"
      className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full bg-quantum-cyan text-slate-950 font-bold text-xl shadow-2xl shadow-quantum-cyan/40 transition hover:scale-110 hover:bg-quantum-cyan/90"
    >↑</button>
  );
}

function NexusQuickView({ ebook, onClose, onAdd, query }: { ebook: any; onClose: () => void; onAdd: () => void; query: string }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, [onClose]);
  return (
    <div role="dialog" aria-modal="true" onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 to-slate-950 border border-quantum-cyan/30 rounded-3xl shadow-2xl shadow-quantum-cyan/20">
        <button onClick={onClose} aria-label="Fechar"
          className="absolute top-3 right-3 z-10 h-10 w-10 rounded-full bg-slate-800 hover:bg-slate-700 text-xl">×</button>
        <div className="grid md:grid-cols-2 gap-0">
          <div className="h-72 md:h-full relative" style={{ background: ebook.coverGradient ?? "linear-gradient(135deg,#1e293b,#0f172a)" }}>
            {ebook.coverPath && <img src={ebook.coverPath} alt={ebook.title} className="absolute inset-0 h-full w-full object-cover" loading="eager" decoding="async" />}
          </div>
          <div className="p-6 flex flex-col">
            <p className="text-[11px] uppercase tracking-[0.2em] text-quantum-cyan font-semibold mb-2">{ebook.category}</p>
            <h2 className="text-2xl font-bold mb-2 leading-tight text-white">
              <NexusHighlight text={ebook.title} query={query} />
            </h2>
            {ebook.subtitle && ebook.subtitle !== ebook.title && (
              <p className="text-slate-300 mb-3"><NexusHighlight text={ebook.subtitle} query={query} /></p>
            )}
            {ebook.description && (
              <p className="text-sm text-slate-400 mb-4 line-clamp-6"><NexusHighlight text={ebook.description} query={query} /></p>
            )}
            <div className="grid grid-cols-2 gap-3 text-xs my-3">
              <div className="bg-slate-800/50 rounded-lg p-3">
                <p className="text-slate-500">Páginas</p>
                <p className="font-bold text-lg text-white">{ebook.pages}</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <p className="text-slate-500">Status</p>
                <p className="font-bold text-sm text-white capitalize">{ebook.status ?? "ativo"}</p>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
                <p className="text-slate-400">Custo</p>
                <p className="font-bold text-lg text-emerald-300">{formatCurrency(ebook.costCents)}</p>
              </div>
              <div className="bg-quantum-cyan/10 border border-quantum-cyan/30 rounded-lg p-3">
                <p className="text-slate-400">Revenda</p>
                <p className="font-bold text-lg text-quantum-cyan">{formatCurrency(ebook.resalePriceCents)}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-auto">
              {ebook.htmlPath && (
                <a href={ebook.htmlPath} target="_blank" rel="noreferrer"
                  className="flex-1 text-center bg-slate-800 hover:bg-slate-700 rounded-xl py-3 text-sm font-semibold transition text-white">
                  Ver Prévia
                </a>
              )}
              <button onClick={onAdd}
                className="flex-1 gradient-btn rounded-xl py-3 text-sm font-bold transition">
                + Adicionar ao Carrinho
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NexusCarouselRow({ items, render }: { items: any[]; render: (eb: any) => React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => { ref.current?.scrollBy({ left: dir * 600, behavior: "smooth" }); };
  return (
    <div className="relative group/row -mx-2">
      <button onClick={() => scroll(-1)} aria-label="Anterior"
        className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-slate-950/90 hover:bg-quantum-cyan hover:text-slate-950 items-center justify-center opacity-0 group-hover/row:opacity-100 transition shadow-xl text-xl font-bold text-white">‹</button>
      <button onClick={() => scroll(1)} aria-label="Próximo"
        className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-slate-950/90 hover:bg-quantum-cyan hover:text-slate-950 items-center justify-center opacity-0 group-hover/row:opacity-100 transition shadow-xl text-xl font-bold text-white">›</button>
      <div ref={ref} className="flex gap-4 overflow-x-auto snap-x pb-3 px-2 scroll-smooth" style={{ scrollbarWidth: "thin" }}>
        {items.map((eb) => (
          <div key={eb.slug} className="snap-start flex-shrink-0 w-52 md:w-60">{render(eb)}</div>
        ))}
      </div>
    </div>
  );
}
// ────────────── /UX v2 ──────────────

export default function Marketplaces() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return (
      <DashboardLayout>
        <FirstAccessBanner />
        <MarketplacesContent isPublicView={false} />
      </DashboardLayout>
    );
  }

  /* Layout público — sem sidebar, com navbar da home */
  return (
    <div className="relative min-h-screen bg-[#020617] text-foreground font-sans antialiased">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,229,255,0.08),transparent_55%)]" />

      {/* Navbar pública */}
      <nav className="relative z-40 flex h-16 items-center justify-between border-b border-white/10 bg-[#020617]/90 px-6 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-quantum-cyan shadow-[0_0_12px_#00E5FF]">
            <span className="absolute inset-0 animate-ping rounded-full bg-quantum-cyan/60" />
          </span>
          <Link href="/">
            <span className="font-bold tracking-wider text-sm text-white cursor-pointer">
              NEXUS <span className="text-quantum-cyan">AFFIL'IA'TE</span>
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/estoque">
            <Button variant="ghost" className="h-8 px-4 text-xs text-slate-300 hover:text-white">
              Vitrine
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" className="h-8 border-quantum-cyan/40 bg-quantum-cyan/10 px-4 text-xs font-semibold text-quantum-cyan hover:bg-quantum-cyan/20">
              Entrar
            </Button>
          </Link>
          <Link href="/cadastro">
            <Button className="gradient-btn h-8 px-4 text-xs font-semibold">
              Cadastrar
              <ArrowRight className="ml-1.5 h-3 w-3" />
            </Button>
          </Link>
        </div>
      </nav>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 md:px-6">
        <MarketplacesContent isPublicView={true} />
      </div>

      {/* Footer público */}
      <footer className="relative z-10 border-t border-white/10 bg-[#020617]/80 px-6 py-8 text-center">
        <p className="text-xs text-slate-500">
          © 2026 Nexus Affil'IA'te · <a href="https://oneverso.com.br" className="text-quantum-cyan hover:underline">oneverso.com.br</a>
        </p>
      </footer>
    </div>
  );
}

function MonthlyActivationButton() {
  // D14-MM-Modal
  const status = (trpc as any).dashboardStatus?.getStatus?.useQuery?.(undefined, {
    refetchInterval: 30_000, retry: false,
  });
  const paid = !!status?.data?.monthlyActivationPaid;
  const cycle = status?.data?.cycleLabel || "ciclo atual";
  const [open, setOpen] = useState(false);

  if (paid) {
    return (
      <div className="mt-4 inline-flex items-center justify-center gap-2 rounded-full border border-emerald-400/60 bg-emerald-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-emerald-100">
        <span className="inline-block h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
        Ativação Paga · {cycle}
      </div>
    );
  }

  const checkoutHref = buildMarketplaceCheckoutUrl({
    source: "monthly-activation",
    type: "subscription",
    slug: "monthly-activation",
    name: "Ativação Mensal · Programa de Afiliados",
    amountCents: 1000,
    description: "Ativação mensal do Programa de Afiliados, com valor definido pela faixa de carreira vigente.",
  });

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="mt-4 inline-flex items-center justify-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-300/15 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-emerald-200 hover:bg-emerald-300/25"
      >
        Pagar Ativação Mensal
      </button>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/95 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Como deseja pagar?</h3>
            <p className="mt-1 text-sm text-slate-400">Escolha a forma de pagamento da Ativação Mensal.</p>
            <div className="mt-5 grid gap-2">
              <a href={checkoutHref} className="rounded-xl bg-cyan-600 px-4 py-3 text-left text-sm font-semibold text-white hover:bg-cyan-500">
                PIX instantâneo (QR Code · Mercado Pago)
              </a>
              <a href={checkoutHref + (checkoutHref.includes("?") ? "&" : "?") + "method=mp-card"} className="rounded-xl bg-blue-600 px-4 py-3 text-left text-sm font-semibold text-white hover:bg-blue-500">
                Mercado Pago · cartão ou boleto
              </a>
              <a href={checkoutHref + (checkoutHref.includes("?") ? "&" : "?") + "method=balance"} className="rounded-xl bg-purple-600 px-4 py-3 text-left text-sm font-semibold text-white hover:bg-purple-500">
                Pagar com saldo disponível
              </a>
            </div>
            <button onClick={() => setOpen(false)} className="mt-4 w-full rounded-lg border border-white/10 px-3 py-2 text-xs uppercase tracking-widest text-slate-300 hover:bg-white/5">
              Cancelar
            </button>
          </div>
        </div>
      )}
    </>
  );
}


