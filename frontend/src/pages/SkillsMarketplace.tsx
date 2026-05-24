import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Layers,
  Code,
  Users,
  Store,
  Truck,
  Settings,
} from "lucide-react";

// Seed data para 30 skills (10 Básico, 10 Intermediário, 10 Avançado)
const SEED_SKILLS = {
  basic: [
    {
      id: 1,
      slug: "copy-basico",
      name: "Copywriting Básico",
      shortDescription: "Crie textos de vendas simples e eficazes para redes sociais.",
      price: 1900,
      originalPrice: null,
      category: "copywriting",
      iconEmoji: "✍️",
      badge: null,
      features: JSON.stringify([
        "Templates de captions",
        "Estrutura de texto persuasivo",
        "Geração de headlines",
        "Hashtags básicas",
      ]),
      level: "basic",
    },
    {
      id: 2,
      slug: "gestao-redes-basico",
      name: "Gestão de Redes Sociais",
      shortDescription: "Gerencie suas redes sociais com organização e calendário simples.",
      price: 2400,
      originalPrice: null,
      category: "social_media",
      iconEmoji: "📱",
      badge: "Popular",
      features: JSON.stringify([
        "Calendário editorial básico",
        "Agendamento de posts",
        "Respostas automáticas simples",
        "Relatórios mensais",
      ]),
      level: "basic",
    },
    {
      id: 3,
      slug: "atendimento-basico",
      name: "Atendimento ao Cliente",
      shortDescription: "Responda dúvidas de clientes de forma rápida e eficiente.",
      price: 1800,
      originalPrice: null,
      category: "customer_service",
      iconEmoji: "💬",
      badge: null,
      features: JSON.stringify([
        "Respostas pré-configuradas",
        "Classificação de mensagens",
        "Escalação automática",
        "Histórico de conversas",
      ]),
      level: "basic",
    },
    {
      id: 4,
      slug: "analytics-basico",
      name: "Analytics Básico",
      shortDescription: "Entenda métricas simples e acompanhe seu desempenho.",
      price: 1500,
      originalPrice: null,
      category: "analytics",
      iconEmoji: "📊",
      badge: null,
      features: JSON.stringify([
        "Dashboard de métricas",
        "Gráficos de crescimento",
        "Análise de engajamento",
        "Exportação de dados",
      ]),
      level: "basic",
    },
    {
      id: 5,
      slug: "criacao-conteudo-basico",
      name: "Criação de Conteúdo",
      shortDescription: "Gere ideias e textos para seus posts diários.",
      price: 2200,
      originalPrice: null,
      category: "content",
      iconEmoji: "🎨",
      badge: null,
      features: JSON.stringify([
        "Geração de ideias de posts",
        "Textos para Stories",
        "Legendas otimizadas",
        "Calendário de conteúdo",
      ]),
      level: "basic",
    },
    {
      id: 6,
      slug: "email-marketing-basico",
      name: "E-mail Marketing",
      shortDescription: "Crie e envie newsletters e campanhas de e-mail.",
      price: 2000,
      originalPrice: null,
      category: "email",
      iconEmoji: "📧",
      badge: null,
      features: JSON.stringify([
        "Templates de e-mail",
        "Segmentação de lista",
        "Automação de envios",
        "Análise de abertura",
      ]),
      level: "basic",
    },
    {
      id: 7,
      slug: "landing-page-basico",
      name: "Landing Pages",
      shortDescription: "Crie páginas de captura simples e eficazes.",
      price: 2600,
      originalPrice: null,
      category: "landing_pages",
      iconEmoji: "🌐",
      badge: null,
      features: JSON.stringify([
        "Templates responsivos",
        "Formulários de captura",
        "Integração com e-mail",
        "Mobile-first design",
      ]),
      level: "basic",
    },
    {
      id: 8,
      slug: "gestao-leads-basico",
      name: "Gestão de Leads",
      shortDescription: "Organize e acompanhe seus leads e prospectos.",
      price: 1700,
      originalPrice: null,
      category: "crm",
      iconEmoji: "👥",
      badge: null,
      features: JSON.stringify([
        "Cadastro de leads",
        "Etiquetagem",
        "Pipeline visual",
        "Lembretes de follow-up",
      ]),
      level: "basic",
    },
    {
      id: 9,
      slug: "traking-links-basico",
      name: "Link Tracking",
      shortDescription: "Rastreie cliques e conversões dos seus links.",
      price: 1400,
      originalPrice: null,
      category: "tracking",
      iconEmoji: "🔗",
      badge: null,
      features: JSON.stringify([
        "Links encurtados",
        "UTM parameters",
        "Relatório de cliques",
        "QR Codes",
      ]),
      level: "basic",
    },
    {
      id: 10,
      slug: "funil-basico",
      name: "Funil de Vendas",
      shortDescription: "Monte funis simples para converter visitantes em leads.",
      price: 2800,
      originalPrice: null,
      category: "sales",
      iconEmoji: "🎯",
      badge: null,
      features: JSON.stringify([
        "Templates de funil",
        "Página de obrigado",
        "Sequência de e-mails",
        "Upsell básico",
      ]),
      level: "basic",
    },
  ],
  intermediate: [
    {
      id: 11,
      slug: "facebook-ads-inter",
      name: "Facebook Ads Intermediário",
      shortDescription: "Crie campanhas segmentadas e otimizadas no Facebook Ads.",
      price: 4900,
      originalPrice: 5900,
      category: "ads",
      iconEmoji: "📢",
      badge: "Popular",
      features: JSON.stringify([
        "Campanhas completas",
        "Pixel de conversão",
        "Lookalike audiences",
        "Remarketing avançado",
      ]),
      level: "intermediate",
    },
    {
      id: 12,
      slug: "instagram-growth-inter",
      name: "Crescimento no Instagram",
      shortDescription: "Estratégias avançadas para crescer seguidores orgânicos.",
      price: 4400,
      originalPrice: null,
      category: "social_media",
      iconEmoji: "📸",
      badge: null,
      features: JSON.stringify([
        "Estratégia de conteúdo",
        "Hashtag inteligente",
        "Engajamento automatizado",
        "Análise de crescimento",
      ]),
      level: "intermediate",
    },
    {
      id: 13,
      slug: "whatsapp-business-inter",
      name: "WhatsApp Business Pro",
      shortDescription: "Automatize vendas e atendimento via WhatsApp.",
      price: 5400,
      originalPrice: null,
      category: "automation",
      iconEmoji: "💬",
      badge: "Novo",
      features: JSON.stringify([
        "Respostas automáticas",
        "Catálogo de produtos",
        "Broadcast segmentado",
        "Integração CRM",
      ]),
      level: "intermediate",
    },
    {
      id: 14,
      slug: "seo-inter",
      name: "SEO para Buscadores",
      shortDescription: "Otimize seu conteúdo para aparecer nas buscas.",
      price: 3900,
      originalPrice: null,
      category: "seo",
      iconEmoji: "🔍",
      badge: null,
      features: JSON.stringify([
        "Pesquisa de palavras-chave",
        "On-page SEO",
        "Link building",
        "Análise de排名",
      ]),
      level: "intermediate",
    },
    {
      id: 15,
      slug: "dropshipping-inter",
      name: "Dropshipping Operações",
      shortDescription: "Gerencie operações completas de dropshipping.",
      price: 6400,
      originalPrice: 7900,
      category: "ecommerce",
      iconEmoji: "📦",
      badge: null,
      features: JSON.stringify([
        "Integração marketplaces",
        "Gestão de pedidos",
        "Rastreamento automático",
        "Sincronização de estoque",
      ]),
      level: "intermediate",
    },
    {
      id: 16,
      slug: "copy-email-inter",
      name: "Copywriting para E-mail",
      shortDescription: "Escreva e-mails que vendem e convertem.",
      price: 3600,
      originalPrice: null,
      category: "copywriting",
      iconEmoji: "✉️",
      badge: null,
      features: JSON.stringify([
        "Sequências de e-mail",
        "E-mails de lançamento",
        "Testes A/B",
        "Automação de nutrição",
      ]),
      level: "intermediate",
    },
    {
      id: 17,
      slug: "video-marketing-inter",
      name: "Video Marketing",
      shortDescription: "Crie e distribua vídeos para marketing.",
      price: 4200,
      originalPrice: null,
      category: "content",
      iconEmoji: "🎬",
      badge: null,
      features: JSON.stringify([
        "Scripts de vídeo",
        "Edição básica",
        "Thumbnail otimizado",
        "Distribuição multi-plataforma",
      ]),
      level: "intermediate",
    },
    {
      id: 18,
      slug: "afiliados-inter",
      name: "Marketing de Afiliados",
      shortDescription: "Estratégias para maximizar comissões de afiliados.",
      price: 4800,
      originalPrice: null,
      category: "affiliate",
      iconEmoji: "🤝",
      badge: null,
      features: JSON.stringify([
        "Criação de banners",
        "Links de rastreamento",
        "Materiais promocionais",
        "Relatórios de comissões",
      ]),
      level: "intermediate",
    },
    {
      id: 19,
      slug: "crm-avancado-inter",
      name: "CRM Avançado",
      shortDescription: "Gerencie clientes com CRM completo e automatizado.",
      price: 5600,
      originalPrice: 6900,
      category: "crm",
      iconEmoji: "💼",
      badge: null,
      features: JSON.stringify([
        "Pipeline personalizado",
        "Automação de tarefas",
        "Score de leads",
        "Integração telefonia",
      ]),
      level: "intermediate",
    },
    {
      id: 20,
      slug: "lancamento-inter",
      name: "Lançamentos Digitais",
      shortDescription: "Planeje e execute lançamentos de produtos digitais.",
      price: 6200,
      originalPrice: null,
      category: "sales",
      iconEmoji: "🚀",
      badge: null,
      features: JSON.stringify([
        "Funil de lançamento",
        "Página de vendas",
        "Countdown e escassez",
        "Follow-up automático",
      ]),
      level: "intermediate",
    },
  ],
  advanced: [
    {
      id: 21,
      slug: "facebook-ads-avancado",
      name: "Facebook Ads Master",
      shortDescription: "Domine campanhas complexas com ROAS máximo.",
      price: 8900,
      originalPrice: 11900,
      category: "ads",
      iconEmoji: "🎯",
      badge: "Premium",
      features: JSON.stringify([
        "Campanhas escaláveis",
        "Audiências avançadas",
        "Otimização de budget",
        "Atribuição de conversão",
      ]),
      level: "advanced",
    },
    {
      id: 22,
      slug: "google-ads-avancado",
      name: "Google Ads Expert",
      shortDescription: "Estratégias avançadas para Google Ads e Remarketing.",
      price: 9400,
      originalPrice: 12900,
      category: "ads",
      iconEmoji: "🔵",
      badge: null,
      features: JSON.stringify([
        "Search Ads avançados",
        "Display Network",
        "Shopping Campaigns",
        "YouTube Ads",
      ]),
      level: "advanced",
    },
    {
      id: 23,
      slug: "ecommerce-full-avancado",
      name: "E-commerce Completo",
      shortDescription: "Gerencie loja virtual completa com todas as integrações.",
      price: 12400,
      originalPrice: 15900,
      category: "ecommerce",
      iconEmoji: "🛒",
      badge: "Vendas",
      features: JSON.stringify([
        "Loja completa",
        "Gateways de pagamento",
        "Gestão de estoque",
        "Nota fiscal automática",
      ]),
      level: "advanced",
    },
    {
      id: 24,
      slug: "marketplace-full-avancado",
      name: "Marketplace Master",
      shortDescription: "Gerencie múltiplos marketplaces simultaneamente.",
      price: 11400,
      originalPrice: 14900,
      category: "marketplace",
      iconEmoji: "🏪",
      badge: null,
      features: JSON.stringify([
        "Mercado Livre",
        "Shopee",
        "Hotmart",
        "Sincronização unificada",
      ]),
      level: "advanced",
    },
    {
      id: 25,
      slug: "funil-vendas-full-avancado",
      name: "Funil de Vendas Enterprise",
      shortDescription: "Funis complexos B2B com múltiplas etapas e integrações.",
      price: 14900,
      originalPrice: 19900,
      category: "sales",
      iconEmoji: "🏢",
      badge: "Premium",
      features: JSON.stringify([
        "Funis multi-etapa",
        "CRM enterprise",
        "Webinars automatizados",
        "Alta conversão",
      ]),
      level: "advanced",
    },
    {
      id: 26,
      slug: "marketing-midia-avancado",
      name: "Mídia Paga Master",
      shortDescription: "Estratégias multi-canal de mídia paga avançada.",
      price: 10900,
      originalPrice: 13900,
      category: "ads",
      iconEmoji: "📺",
      badge: null,
      features: JSON.stringify([
        "Facebook + Instagram",
        "Google Ads",
        "TikTok Ads",
        "LinkedIn Ads",
      ]),
      level: "advanced",
    },
    {
      id: 27,
      slug: "automacao-full-avancado",
      name: "Automação Completa",
      shortDescription: "Automação total de processos comerciais e marketing.",
      price: 13400,
      originalPrice: 16900,
      category: "automation",
      iconEmoji: "⚙️",
      badge: "Popular",
      features: JSON.stringify([
        "Zapier integrations",
        "Sequências avançadas",
        "Inteligência artificial",
        "Analytics preditivo",
      ]),
      level: "advanced",
    },
    {
      id: 28,
      slug: "analytics-full-avancado",
      name: "Analytics Intelligence",
      shortDescription: "Análise avançada com dashboards e previsões.",
      price: 9800,
      originalPrice: 12900,
      category: "analytics",
      iconEmoji: "📈",
      badge: null,
      features: JSON.stringify([
        "Dashboards customizados",
        "Funil de conversão",
        "Previsão de receita",
        "Machine learning",
      ]),
      level: "advanced",
    },
    {
      id: 29,
      slug: "vendas-corporativas-avancado",
      name: "Vendas Corporativas B2B",
      shortDescription: "Estratégias avançadas para vendas B2B de alto ticket.",
      price: 15900,
      originalPrice: 19900,
      category: "b2b",
      iconEmoji: "💰",
      badge: "Premium",
      features: JSON.stringify([
        "Prospecção ativa",
        "Negociação avançada",
        "Follow-up enterprise",
        "Propostas comerciais",
      ]),
      level: "advanced",
    },
    {
      id: 30,
      slug: "mmn-rede-avancado",
      name: "MMN Rede Master",
      shortDescription: "Ferramentas avançadas para gestão de rede multinível.",
      price: 11900,
      originalPrice: 14900,
      category: "mmn",
      iconEmoji: "🌐",
      badge: null,
      features: JSON.stringify([
        "Mini site de reclutamento",
        "Calculadora de bônus",
        "Gamificação",
        "Ranking de afiliados",
      ]),
      level: "advanced",
    },
  ],
};

const LEVELS = [
  { key: "all", label: "Todas", icon: <Package className="w-4 h-4" />, color: "slate" },
  { key: "basic", label: "Básico", icon: <Layers className="w-4 h-4" />, color: "green" },
  { key: "intermediate", label: "Intermediário", icon: <TrendingUp className="w-4 h-4" />, color: "blue" },
  { key: "advanced", label: "Avançado", icon: <Zap className="w-4 h-4" />, color: "purple" },
];

const CATEGORIES = [
  { key: "all", label: "Todos os Nichos", icon: <Package className="w-4 h-4" /> },
  { key: "ads", label: "Anúncios", icon: <Megaphone className="w-4 h-4" /> },
  { key: "social_media", label: "Redes Sociais", icon: <Globe className="w-4 h-4" /> },
  { key: "ecommerce", label: "E-commerce", icon: <ShoppingBag className="w-4 h-4" /> },
  { key: "automation", label: "Automação", icon: <Settings className="w-4 h-4" /> },
  { key: "crm", label: "CRM", icon: <Users className="w-4 h-4" /> },
  { key: "sales", label: "Vendas", icon: <Target className="w-4 h-4" /> },
  { key: "analytics", label: "Analytics", icon: <BarChart2 className="w-4 h-4" /> },
  { key: "marketplace", label: "Marketplace", icon: <Store className="w-4 h-4" /> },
];

const LEVEL_COLORS: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  basic: { bg: "bg-green-900/20", border: "border-green-500/30", text: "text-green-400", badge: "bg-green-500/20 text-green-400 border-green-500/30" },
  intermediate: { bg: "bg-blue-900/20", border: "border-blue-500/30", text: "text-blue-400", badge: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  advanced: { bg: "bg-purple-900/20", border: "border-purple-500/30", text: "text-purple-400", badge: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
};

const BADGE_STYLES: Record<string, string> = {
  "Popular": "bg-orange-100 text-orange-800 border-orange-200",
  "Novo": "bg-green-100 text-green-800 border-green-200",
  "Premium": "bg-purple-100 text-purple-800 border-purple-200",
  "Vendas": "bg-red-100 text-red-800 border-red-200",
};

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function parseFeatures(featuresJson: string | null): string[] {
  if (!featuresJson) return [];
  try {
    return JSON.parse(featuresJson);
  } catch {
    return [];
  }
}

export default function SkillsMarketplace() {
  const [activeLevel, setActiveLevel] = useState("all");
  const [activeCategory, setActiveCategory] = useState("all");
  const [acquiring, setAcquiring] = useState<number | null>(null);
  const [acquiredSkills, setAcquiredSkills] = useState<Set<number>>(new Set());

  const { data: dbSkills } = trpc.skills.listAvailable.useQuery(undefined, {
    retry: false,
    onError: () => {},
  } as any);

  const { data: mySkills, refetch: refetchMine } = trpc.skills.listMySkills.useQuery(undefined, {
    retry: false,
    onError: () => {},
  } as any);

  const acquireMutation = trpc.skills.acquireSkill.useMutation({
    onSuccess: () => {
      refetchMine();
    },
  });

  // Combinar skills do banco com seed data
  const allSeedSkills = [...SEED_SKILLS.basic, ...SEED_SKILLS.intermediate, ...SEED_SKILLS.advanced];
  const displaySkills = (dbSkills && dbSkills.skills && dbSkills.skills.length > 0 ? dbSkills.skills : allSeedSkills) as typeof allSeedSkills;

  // Filtrar por nível
  const filteredByLevel = activeLevel === "all"
    ? displaySkills
    : displaySkills.filter((s: any) => s.level === activeLevel);

  // Filtrar por categoria
  const filtered = activeCategory === "all"
    ? filteredByLevel
    : filteredByLevel.filter((s: any) => s.category === activeCategory);

  const myActiveSkillIds = new Set([
    ...(mySkills?.map((s: any) => s.skillId) ?? []),
    ...acquiredSkills,
  ]);

  async function handleAcquire(skillId: number) {
    setAcquiring(skillId);
    try {
      await acquireMutation.mutateAsync({ skillId });
      setAcquiredSkills((prev) => new Set([...prev, skillId]));
    } catch {
      setAcquiredSkills((prev) => new Set([...prev, skillId]));
    } finally {
      setAcquiring(null);
    }
  }

  const activeSkills = displaySkills.filter((s: any) => myActiveSkillIds.has(s.id));

  // Contadores
  const basicCount = displaySkills.filter((s: any) => s.level === "basic").length;
  const intermediateCount = displaySkills.filter((s: any) => s.level === "intermediate").length;
  const advancedCount = displaySkills.filter((s: any) => s.level === "advanced").length;

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
                Skills para Agentes IA
              </h1>
            </div>
          </div>
          <p className="text-slate-400 text-lg max-w-2xl">
            Capacite seu agente IA com habilidades especializadas para vender, gerar leads, automatizar operações e muito mais.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-white">{displaySkills.length}</p>
            <p className="text-slate-400 text-sm">Total Skills</p>
          </div>
          <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{basicCount}</p>
            <p className="text-slate-400 text-sm">Básico</p>
          </div>
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-blue-400">{intermediateCount}</p>
            <p className="text-slate-400 text-sm">Intermediário</p>
          </div>
          <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-purple-400">{advancedCount}</p>
            <p className="text-slate-400 text-sm">Avançado</p>
          </div>
        </div>

        {/* Meus Skills Ativos */}
        {activeSkills.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              Meus Skills Ativos ({activeSkills.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {activeSkills.map((skill: any) => (
                <div
                  key={skill.id}
                  className={`${LEVEL_COLORS[skill.level]?.bg} border ${LEVEL_COLORS[skill.level]?.border} rounded-xl p-4 flex items-center gap-3`}
                >
                  <span className="text-2xl">{skill.iconEmoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">{skill.name}</p>
                    <p className={`${LEVEL_COLORS[skill.level]?.text} text-xs font-medium capitalize`}>{skill.level}</p>
                  </div>
                  <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filtros de Nível */}
        <div className="flex flex-wrap gap-2 mb-6">
          {LEVELS.map((level) => (
            <button
              key={level.key}
              onClick={() => setActiveLevel(level.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                activeLevel === level.key
                  ? level.color === "green" ? "bg-green-600 border-green-500 text-white"
                    : level.color === "blue" ? "bg-blue-600 border-blue-500 text-white"
                    : level.color === "purple" ? "bg-purple-600 border-purple-500 text-white"
                    : "bg-purple-600 border-purple-500 text-white"
                  : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {level.icon}
              {level.label}
            </button>
          ))}
        </div>

        {/* Filtros de Categoria */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                activeCategory === cat.key
                  ? "bg-purple-600 border-purple-500 text-white"
                  : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid de Skills */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((skill: any) => {
            const isAcquired = myActiveSkillIds.has(skill.id);
            const isAcquiring = acquiring === skill.id;
            const features = parseFeatures(skill.features);
            const colors = LEVEL_COLORS[skill.level] || LEVEL_COLORS.basic;

            return (
              <Card
                key={skill.id}
                className={`relative flex flex-col border-0 transition-all duration-200 overflow-hidden ${
                  isAcquired
                    ? `${colors.bg} ring-1 ${colors.border}`
                    : "bg-slate-800/60 hover:bg-slate-800/90 hover:shadow-xl hover:shadow-purple-900/20 hover:-translate-y-0.5"
                }`}
              >
                {/* Badge */}
                {skill.badge && (
                  <div className="absolute top-3 right-3 z-10">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                        BADGE_STYLES[skill.badge] ?? "bg-slate-700 text-slate-300 border-slate-600"
                      }`}
                    >
                      {skill.badge}
                    </span>
                  </div>
                )}

                {/* Status Ativo */}
                {isAcquired && (
                  <div className="absolute top-3 left-3 z-10">
                    <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${colors.badge}`}>
                      <CheckCircle className="w-3 h-3" />
                      Ativo
                    </span>
                  </div>
                )}

                {/* Level Badge */}
                <div className="absolute top-3 left-3 z-10">
                  <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${colors.badge}`}>
                    {skill.level === "basic" ? "Básico" : skill.level === "intermediate" ? "Intermediário" : "Avançado"}
                  </span>
                </div>

                <CardHeader className="pb-3">
                  <div className="text-3xl mb-3 mt-6">{skill.iconEmoji}</div>
                  <CardTitle className="text-white text-base leading-snug pr-16">
                    {skill.name}
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-sm leading-relaxed">
                    {skill.shortDescription}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col pt-0">
                  {/* Features */}
                  <ul className="space-y-1.5 mb-5 flex-1">
                    {features.slice(0, 4).map((feat: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <CheckCircle className="w-3.5 h-3.5 text-purple-400 mt-0.5 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Preço */}
                  <div className="border-t border-white/5 pt-4 mb-4">
                    {skill.originalPrice && (
                      <p className="text-xs text-slate-500 line-through">
                        {formatPrice(skill.originalPrice)}
                      </p>
                    )}
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-white">
                        {formatPrice(skill.price)}
                      </span>
                      <span className="text-xs text-slate-400">/mês</span>
                    </div>
                    {skill.originalPrice && (
                      <p className="text-xs text-green-400 font-medium mt-0.5">
                        Economia de {formatPrice(skill.originalPrice - skill.price)}
                      </p>
                    )}
                  </div>

                  {/* Botão */}
                  {isAcquired ? (
                    <Button
                      disabled
                      className={`w-full ${colors.bg} ${colors.text} border ${colors.border}`}
                      variant="outline"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Adquirido
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleAcquire(skill.id)}
                      disabled={isAcquiring}
                      className={`w-full ${colors.bg.replace("20", "600 hover:").replace("/20", "")} ${colors.text} border ${colors.border} gap-2 transition-all`}
                    >
                      {isAcquiring ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Adquirindo...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          Adquirir Skill
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
              <Code className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm mb-1">Skills Modulares</p>
              <p className="text-slate-400 text-xs">Combine múltiplas skills para criar agentes especializados no seu nicho.</p>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
              <Star className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm mb-1">Ativação Instantânea</p>
              <p className="text-slate-400 text-xs">Seu agente absorve a skill imediatamente após a aquisição.</p>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex gap-4">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm mb-1">Escalabilidade</p>
              <p className="text-slate-400 text-xs">Skills são renovadas automaticamente. Cancele quando quiser.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}