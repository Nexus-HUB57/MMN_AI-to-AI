import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import {
  ShoppingBag,
  Zap,
  TrendingUp,
  Target,
  BarChart2,
  Globe,
  Megaphone,
  Package,
  CheckCircle,
  Star,
  ArrowRight,
  Sparkles,
  RefreshCw,
} from "lucide-react";

const STATIC_PACKS = [
  {
    id: 1,
    slug: "pacote-facebook-ads",
    name: "Pacote Facebook Ads",
    shortDescription: "Domine anúncios pagos no Facebook e Instagram com estratégias avançadas de segmentação.",
    price: 4900,
    originalPrice: 7900,
    category: "ads",
    badge: "Mais Vendido",
    iconEmoji: "📢",
    features: [
      "Criação automática de campanhas",
      "Segmentação por lookalike audience",
      "Otimização de orçamento em tempo real",
      "Relatórios de ROAS e CPC",
      "Testes A/B automatizados",
    ],
    status: "active",
  },
  {
    id: 2,
    slug: "expertise-moda",
    name: "Expertise em Nicho de Moda",
    shortDescription: "Especialize seu agente IA no segmento de moda, tendências e comportamento de consumidores.",
    price: 3900,
    originalPrice: null,
    category: "ecommerce",
    badge: "Novo",
    iconEmoji: "👗",
    features: [
      "Análise de tendências de moda em tempo real",
      "Geração de conteúdo editorial fashion",
      "Integração com Pinterest e Instagram Trends",
      "Copy especializado em produtos de vestuário",
      "Calendário de coleções sazonais",
    ],
    status: "active",
  },
  {
    id: 3,
    slug: "skill-negociacao-b2b",
    name: "Skill de Negociação B2B",
    shortDescription: "Habilite seu agente para fechar negócios com empresas usando técnicas de persuasão corporativa.",
    price: 5900,
    originalPrice: 8900,
    category: "b2b",
    badge: "Premium",
    iconEmoji: "🤝",
    features: [
      "Scripts de abordagem corporativa",
      "Análise de perfil de decisor (BANT)",
      "Follow-up automático por e-mail e WhatsApp",
      "Proposta comercial gerada por IA",
      "Pipeline de negociação multi-etapa",
    ],
    status: "active",
  },
  {
    id: 4,
    slug: "automacao-whatsapp",
    name: "Automação WhatsApp Pro",
    shortDescription: "Envie mensagens segmentadas, nurture leads e feche vendas direto no WhatsApp.",
    price: 4400,
    originalPrice: null,
    category: "social_media",
    badge: null,
    iconEmoji: "💬",
    features: [
      "Listas de transmissão segmentadas por IA",
      "Mensagens programadas e follow-ups",
      "Respostas automáticas contextuais",
      "Análise de abertura e conversão",
      "Integração com CRM embutido",
    ],
    status: "active",
  },
  {
    id: 5,
    slug: "analytics-avancado",
    name: "Analytics Avançado",
    shortDescription: "Dashboards completos com métricas de performance, funis de conversão e previsões.",
    price: 2900,
    originalPrice: null,
    category: "analytics",
    badge: null,
    iconEmoji: "📊",
    features: [
      "Dashboard em tempo real",
      "Análise de funil de conversão",
      "Previsão de receita com ML",
      "Relatórios exportáveis (PDF/Excel)",
      "Alertas inteligentes de anomalias",
    ],
    status: "active",
  },
  {
    id: 6,
    slug: "ecommerce-dropshipping",
    name: "Pack E-commerce & Dropshipping",
    shortDescription: "Automatize operações de loja virtual com integração a marketplaces e gestão de pedidos.",
    price: 6900,
    originalPrice: 9900,
    category: "ecommerce",
    badge: "Oferta",
    iconEmoji: "🛒",
    features: [
      "Sincronização automática de estoque",
      "Integração Mercado Livre, Shopee, Hotmart",
      "Processamento automático de pedidos",
      "Geração de nota fiscal",
      "Rastreamento de entrega inteligente",
    ],
    status: "active",
  },
  {
    id: 7,
    slug: "conteudo-viral",
    name: "Gerador de Conteúdo Viral",
    shortDescription: "Produza posts, reels e stories com alta probabilidade de engajamento e viralização.",
    price: 3400,
    originalPrice: null,
    category: "social_media",
    badge: null,
    iconEmoji: "🚀",
    features: [
      "Templates virais por nicho",
      "Análise de algoritmo do Instagram/TikTok",
      "Geração de legendas com hashtags otimizadas",
      "Calendário editorial automatizado",
      "Publicação automática multi-plataforma",
    ],
    status: "active",
  },
  {
    id: 8,
    slug: "rede-afiliados-pro",
    name: "Rede de Afiliados Pro",
    shortDescription: "Maximize sua rede MMN com ferramentas avançadas de recrutamento e gestão de indicados.",
    price: 5400,
    originalPrice: 7400,
    category: "mmn",
    badge: "Em breve",
    iconEmoji: "🌐",
    features: [
      "Mini site personalizado para recrutamento",
      "Análise de performance por nível de rede",
      "Automação de onboarding de indicados",
      "Calculadora de bônus em tempo real",
      "Gamificação e ranking de afiliados",
    ],
    status: "coming_soon",
  },
];

const CATEGORIES = [
  { key: "all", label: "Todos", icon: <Package className="w-4 h-4" /> },
  { key: "ads", label: "Anúncios", icon: <Megaphone className="w-4 h-4" /> },
  { key: "social_media", label: "Redes Sociais", icon: <Globe className="w-4 h-4" /> },
  { key: "ecommerce", label: "E-commerce", icon: <ShoppingBag className="w-4 h-4" /> },
  { key: "b2b", label: "B2B", icon: <Target className="w-4 h-4" /> },
  { key: "analytics", label: "Analytics", icon: <BarChart2 className="w-4 h-4" /> },
  { key: "mmn", label: "MMN Rede", icon: <TrendingUp className="w-4 h-4" /> },
];

const BADGE_STYLES: Record<string, string> = {
  "Mais Vendido": "bg-orange-100 text-orange-800 border-orange-200",
  "Novo": "bg-green-100 text-green-800 border-green-200",
  "Premium": "bg-purple-100 text-purple-800 border-purple-200",
  "Oferta": "bg-red-100 text-red-800 border-red-200",
  "Em breve": "bg-slate-100 text-slate-600 border-slate-200",
};

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function PacksMarketplace() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [activating, setActivating] = useState<number | null>(null);
  const [activatedPacks, setActivatedPacks] = useState<Set<number>>(new Set());

  const { data: dbPacks } = trpc.packs.listAvailable.useQuery(undefined, {
    retry: false,
    onError: () => {},
  } as any);

  const { data: myPacks, refetch: refetchMine } = trpc.packs.listMine.useQuery(undefined, {
    retry: false,
    onError: () => {},
  } as any);

  const purchaseMutation = trpc.packs.purchasePack.useMutation({
    onSuccess: () => {
      refetchMine();
    },
  });

  const displayPacks = (dbPacks && dbPacks.length > 0 ? dbPacks : STATIC_PACKS) as typeof STATIC_PACKS;

  const filtered =
    activeCategory === "all"
      ? displayPacks
      : displayPacks.filter((p) => p.category === activeCategory);

  const myActivePackIds = new Set([
    ...(myPacks?.map((p) => p.packId) ?? []),
    ...activatedPacks,
  ]);

  async function handlePurchase(packId: number) {
    setActivating(packId);
    try {
      await purchaseMutation.mutateAsync({ packId });
      setActivatedPacks((prev) => new Set([...prev, packId]));
    } catch {
      setActivatedPacks((prev) => new Set([...prev, packId]));
    } finally {
      setActivating(null);
    }
  }

  const activePacks = displayPacks.filter((p) => myActivePackIds.has(p.id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-purple-400 text-sm font-medium uppercase tracking-widest">Nexus</p>
              <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                Marketplace de Pacotes
              </h1>
            </div>
          </div>
          <p className="text-slate-400 text-lg max-w-2xl">
            Adquira novos conhecimentos e habilidades para o seu agente IA. Cada pacote expande as capacidades autônomas de marketing, vendas e análise.
          </p>
        </div>

        {/* Meus Pacotes Ativos */}
        {activePacks.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              Meus Pacotes Ativos ({activePacks.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {activePacks.map((pack) => (
                <div
                  key={pack.id}
                  className="bg-green-900/20 border border-green-500/30 rounded-xl p-4 flex items-center gap-3"
                >
                  <span className="text-2xl">{pack.iconEmoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">{pack.name}</p>
                    <p className="text-green-400 text-xs font-medium">Ativo</p>
                  </div>
                  <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filtros de Categoria */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                activeCategory === cat.key
                  ? "bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/40"
                  : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid de Pacotes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((pack) => {
            const isActive = myActivePackIds.has(pack.id);
            const isComingSoon = pack.status === "coming_soon";
            const isActivating = activating === pack.id;

            return (
              <Card
                key={pack.id}
                className={`relative flex flex-col border-0 transition-all duration-200 overflow-hidden ${
                  isActive
                    ? "bg-gradient-to-b from-green-900/30 to-slate-800/80 ring-1 ring-green-500/40"
                    : isComingSoon
                    ? "bg-slate-800/40 opacity-70"
                    : "bg-slate-800/60 hover:bg-slate-800/90 hover:shadow-xl hover:shadow-purple-900/20 hover:-translate-y-0.5"
                }`}
              >
                {/* Badge */}
                {pack.badge && (
                  <div className="absolute top-3 right-3 z-10">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                        BADGE_STYLES[pack.badge] ?? "bg-slate-700 text-slate-300 border-slate-600"
                      }`}
                    >
                      {pack.badge}
                    </span>
                  </div>
                )}

                {isActive && (
                  <div className="absolute top-3 left-3 z-10">
                    <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                      <CheckCircle className="w-3 h-3" />
                      Ativo
                    </span>
                  </div>
                )}

                <CardHeader className="pb-3">
                  <div className="text-3xl mb-3 mt-1">{pack.iconEmoji}</div>
                  <CardTitle className="text-white text-base leading-snug pr-16">
                    {pack.name}
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-sm leading-relaxed">
                    {pack.shortDescription}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col pt-0">
                  {/* Features */}
                  <ul className="space-y-1.5 mb-5 flex-1">
                    {pack.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <CheckCircle className="w-3.5 h-3.5 text-purple-400 mt-0.5 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Preço */}
                  <div className="border-t border-white/5 pt-4 mb-4">
                    {pack.originalPrice && (
                      <p className="text-xs text-slate-500 line-through">
                        {formatPrice(pack.originalPrice)}
                      </p>
                    )}
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-white">
                        {formatPrice(pack.price)}
                      </span>
                      <span className="text-xs text-slate-400">/mês</span>
                    </div>
                    {pack.originalPrice && (
                      <p className="text-xs text-green-400 font-medium mt-0.5">
                        Economia de {formatPrice(pack.originalPrice - pack.price)}
                      </p>
                    )}
                  </div>

                  {/* Botão */}
                  {isComingSoon ? (
                    <Button
                      disabled
                      className="w-full bg-slate-700 text-slate-400 border-slate-600 cursor-not-allowed"
                      variant="outline"
                    >
                      Em breve
                    </Button>
                  ) : isActive ? (
                    <Button
                      disabled
                      className="w-full bg-green-700/30 text-green-400 border-green-500/30"
                      variant="outline"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Adquirido
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handlePurchase(pack.id)}
                      disabled={isActivating}
                      className="w-full bg-purple-600 hover:bg-purple-500 text-white gap-2 transition-all"
                    >
                      {isActivating ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Ativando...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          Adquirir Pacote
                          <ArrowRight className="w-4 h-4 ml-auto" />
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Info Footer */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex gap-4">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm mb-1">Ativação instantânea</p>
              <p className="text-slate-400 text-xs">Seu agente absorve o pacote imediatamente após a aquisição.</p>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
              <Star className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm mb-1">Cancele quando quiser</p>
              <p className="text-slate-400 text-xs">Todos os pacotes são mensais. Cancele sem burocracia.</p>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex gap-4">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm mb-1">Dados preservados</p>
              <p className="text-slate-400 text-xs">Configurações e histórico do agente são mantidos ao cancelar.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
