import { Link } from "wouter";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bot,
  Briefcase,
  Calendar,
  CheckCircle2,
  Cpu,
  Database,
  Globe,
  Layers,
  LineChart,
  Mail,
  MapPin,
  MessageSquare,
  Network,
  Package,
  Quote,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  UserPlus,
  Users,
  Zap,
} from "lucide-react";
import { FoundersCounter } from "@/components/FoundersCounter";
import { PrivateModeBanner } from "@/components/PrivateModeBanner";
import bgHome from "@/assets/bg-home.webp";

const NAV_LINKS = [
  { href: "#sobre", label: "Sobre" },
  { href: "#vitrine", label: "Assinaturas" },
  { href: "#diferenciais", label: "Diferenciais" },
  { href: "#cenarios", label: "Cases" },
  { href: "#metodologia", label: "Metodologia" },
  { href: "#contato", label: "Contato" },
];

const POSITIONING_PILLARS = [
  { label: "Automação Inteligente", icon: Cpu },
  { label: "Escala Estruturada", icon: Layers },
  { label: "Governança Comercial", icon: ShieldCheck },
  { label: "Visão Analítica", icon: BarChart3 },
];

const PARTNERS_PACK_CARDS = [
  {
    icon: Briefcase,
    title: "Contrate e comece a operar",
    pill: "Assinatura inicial",
    text: "O plano Start ativa a operação inicial do Nexus Partners Pack com painel comercial, automação básica e contratação independente do Nexus Affil'IA'te.",
  },
  {
    icon: Database,
    title: "Catálogo e operação assistida",
    pill: "Produto SaaS",
    text: "Cada assinatura libera capacidades operacionais, biblioteca de ativos e recursos comerciais do Nexus Partners Pack, sem qualquer vínculo com packs ou níveis da jornada principal.",
  },
  {
    icon: Zap,
    title: "Escala por capacidade contratada",
    pill: "Growth & Enterprise",
    text: "A evolução entre Start, Growth e Enterprise representa apenas ampliação contratual de capacidades, skills, governança e operação do produto assinado, com comissionamento mensal recorrente para afiliados elegíveis conforme o prazo efetivado.",
  },
];

const VISION_CARDS = [
  {
    icon: Sparkles,
    title: "O que é",
    text: "Uma plataforma que reúne em um só lugar a gestão dos parceiros, a automação das ofertas, o acompanhamento das vendas e a evolução comercial da sua operação.",
  },
  {
    icon: Users,
    title: "Para quem é",
    text: "Negócios que vendem com afiliados, creators, embaixadores, representantes e parceiros comerciais que precisam de mais organização para crescer.",
  },
  {
    icon: Target,
    title: "O problema que resolve",
    text: "Substitui planilhas soltas, controles manuais e processos confusos por uma operação mais clara, com comissões organizadas, vitrine pronta e visão real do que está dando resultado.",
  },
];

const COMPETENCIES = [
  {
    icon: Zap,
    title: "Automação Inteligente",
    text: "Automatiza tarefas repetitivas do dia a dia, desde o cadastro de parceiros até a liberação de ofertas, acompanhamento do estoque e ativação de campanhas.",
  },
  {
    icon: LineChart,
    title: "Inteligência e Rastreabilidade",
    text: "Mostra com clareza quais parceiros vendem mais, quais ofertas performam melhor e onde vale a pena concentrar seus próximos movimentos comerciais.",
  },
  {
    icon: Network,
    title: "Escalabilidade Operacional",
    text: "Foi pensada para crescer junto com a sua operação, do início da rede até uma estrutura com muitos parceiros ativos ao mesmo tempo.",
  },
  {
    icon: ShieldCheck,
    title: "Experiência e Personalização",
    text: "Entrega uma experiência organizada para quem vende com você, com painéis claros, identidade profissional e espaço para adaptar a operação ao seu modelo comercial.",
  },
];

const DIFFERENTIALS = [
  {
    icon: Cpu,
    marker: "01",
    title: "Agente IA com 8 capacidades comerciais ativas",
    summary:
      "O OnVerso já trabalha com 8 frentes práticas para venda e prospecção, como criação de mensagens, segmentação de público, abordagem comercial, leitura de tendências e automação de tarefas do dia a dia. Tudo fica registrado no histórico para acompanhamento.",
    highlights: [
      "8 capacidades comerciais ativas no seu Agente IA",
      "Execução autônoma com histórico consultável de todas as ações",
      "Otimizado para afiliados, creators e operações de crescimento",
    ],
  },
  {
    icon: Activity,
    marker: "02",
    title: "Índice de maturidade do agente em 6 dimensões",
    summary:
      "O sistema mostra de forma contínua como o seu Agente IA está evoluindo: volume de entregas, consistência das ações, presença em canais, velocidade de resposta e variedade de abordagens. Tudo aparece de forma clara no painel.",
    highlights: [
      "Leitura contínua da evolução do Agente IA em 6 dimensões",
      "Indicadores claros de evolução: inicial, em expansão e avançado",
      "Transparência total para você, sua equipe e seus parceiros",
    ],
  },
  {
    icon: ShieldCheck,
    marker: "03",
    title: "Operação comercial com controle total",
    summary:
      "O Nexus Affil'IA'te centraliza comissões, ativações, acompanhamento de parceiros e histórico das principais decisões para que a operação cresça com mais segurança.",
    highlights: [
      "Controle claro das vendas e repasses",
      "Regras comerciais ajustadas ao seu modelo",
      "Leitura prática do desempenho por parceiro e oferta",
    ],
  },
];

const SCENARIOS = [
  {
    tag: "Cenário I",
    title: "Operação de Infoprodutos em Larga Escala",
    context:
      "Uma operação de educação digital sofria com atrasos nos relatórios e desgaste com os melhores afiliados por falta de clareza nas regras de comissão.",
    solution:
      "Organização das regras de comissão, definição clara dos critérios de venda e liberação de um painel em tempo real para os afiliados acompanharem o resultado.",
    impact:
      "Menos disputas financeiras, mais confiança da rede e aumento natural do volume de vendas trazido pelos parceiros.",
  },
  {
    tag: "Cenário II",
    title: "Ecossistema de Creators e Embaixadores",
    context:
      "Uma marca de moda D2C necessitava transicionar de cupons de desconto manuais para um programa profissional que mensurasse a verdadeira influência de creators na jornada de compra.",
    solution:
      "Geração de links parametrizados únicos por embaixador, dashboards gamificados mostrando metas de vendas e integração fluida com o checkout do e-commerce.",
    impact:
      "Relação mais profissional com creators, leitura clara do que converte e melhores decisões sobre onde investir energia e verba.",
  },
  {
    tag: "Cenário III",
    title: "Expansão de Canais de Parcerias B2B",
    context:
      "Uma empresa de software queria ampliar sua presença nacional com parceiros regionais e precisava organizar indicações, oportunidades e ganhos recorrentes.",
    solution:
      "Criação de um portal para registro de oportunidades, com acompanhamento das indicações e cálculo automático das comissões sobre contratos ativos.",
    impact:
      "Mais clareza entre os canais, menos conflito comercial e fechamento mais rápido das oportunidades geradas por parceiros.",
  },
];

const METHODOLOGY = [
  {
    icon: Target,
    step: "1",
    title: "Diagnóstico Estratégico",
    text: "Imersão no modelo de negócio, mapeamento das regras de comissionamento desejadas e identificação de gargalos operacionais da gestão atual.",
  },
  {
    icon: Layers,
    step: "2",
    title: "Estruturação e Setup",
    text: "Configuração da operação, definição dos acessos, identidade visual e regras comerciais que vão sustentar a rotina da sua equipe e da sua rede.",
  },
  {
    icon: Database,
    step: "3",
    title: "Integração Tecnológica",
    text: "Conexão com checkout, ERP e plataformas de e-commerce para que os dados circulem com segurança e a operação não fique quebrada em vários sistemas.",
  },
  {
    icon: Users,
    step: "4",
    title: "Onboarding e Implantação",
    text: "Treinamento da equipe e entrada dos primeiros parceiros para validar o uso da plataforma de forma prática e segura.",
  },
  {
    icon: LineChart,
    step: "5",
    title: "Otimização Baseada em Dados",
    text: "Acompanhamento contínuo para ajustar campanhas, identificar canais com mais potencial e acelerar a escala da operação comercial.",
  },
];

const CONTACTS = [
  {
    icon: Globe,
    label: "Portal Institucional",
    value: "oneverso.com.br",
    href: "https://oneverso.com.br",
  },
  {
    icon: Mail,
    label: "E-mail Corporativo",
    value: "equipenexus@oneverso.com.br",
    href: "mailto:equipenexus@oneverso.com.br",
  },
  {
    icon: MessageSquare,
    label: "WhatsApp Business",
    value: "+55 19 99269-1954",
    href: "https://wa.me/5519992691954",
  },
  {
    icon: Calendar,
    label: "Reunião Executiva",
    value: "Sábados · 09h30 às 12h00 · Comunidade Nexus Affil'IA'te (GitHub)",
    href: "https://github.com/Nexus-HUB57",
  },
];

export default function Home() {
  return (
    <div className="relative min-h-screen bg-obsidian text-foreground overflow-hidden font-sans antialiased selection:bg-quantum-cyan/30">
      <PrivateModeBanner />
      <FoundersCounter />

      {/* Hero background */}
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-50"
        style={{ backgroundImage: `url(${bgHome})` }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-obsidian/80 via-obsidian/60 to-obsidian"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-0 bg-grid-obsidian bg-grid-50 opacity-[0.1]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-quantum-cyan via-quantum-purple to-quantum-violet opacity-[0.10] blur-[160px] animate-slow-pulse" />

      {/* Top nav */}
      <nav className="relative z-40 flex h-16 items-center justify-between border-b border-obsidian-700 bg-obsidian/80 px-6 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-quantum-cyan shadow-[0_0_12px_#00E5FF]">
            <span className="absolute inset-0 animate-ping rounded-full bg-quantum-cyan/60" />
          </span>
          <span className="font-bold tracking-wider text-sm text-white">
            NEXUS <span className="text-quantum-cyan">AFFIL'IA'TE</span>
          </span>
        </div>
        <div className="hidden gap-6 text-xs font-semibold text-slate-400 md:flex">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="transition-colors hover:text-white">
              {link.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-1 rounded-md border border-quantum-cyan/40 bg-quantum-cyan/10 px-3 py-1.5 text-xs font-semibold text-quantum-cyan transition hover:bg-quantum-cyan/20"
          >
            Entrar <ArrowRight className="h-3 w-3" />
          </Link>
          {/* Botão Cadastrar com ícone de robô IA pulsante (ativação do Agente) */}
          <Link
            href="/cadastro"
            className="group relative inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-quantum-cyan via-quantum-violet to-quantum-purple px-3 py-1.5 text-xs font-semibold text-obsidian shadow-lg shadow-quantum-cyan/30 transition hover:opacity-90"
            aria-label="Cadastrar e ativar Agente IA"
          >
            <span className="relative inline-flex h-4 w-4 items-center justify-center">
              <Bot className="h-4 w-4" />
              <span
                aria-hidden="true"
                className="absolute inset-0 -m-0.5 rounded-full border border-obsidian/40 animate-ping"
              />
            </span>
            <span>Cadastrar</span>
            <UserPlus className="h-3 w-3 opacity-80" />
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative z-10 px-6 pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="mx-auto max-w-6xl text-center space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-quantum-cyan/30 bg-quantum-cyan/10 px-3 py-1 text-[11px] font-mono uppercase tracking-widest text-quantum-cyan">
            <Sparkles className="h-3 w-3" /> by oneverso.com.br
          </span>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight text-white">
            Nexus <span className="bg-gradient-to-r from-quantum-cyan via-quantum-violet to-quantum-purple bg-clip-text text-transparent">Affil'IA'te</span>
          </h1>
          <p className="mx-auto max-w-3xl text-base md:text-lg text-slate-300">
            A plataforma comercial para ativar, organizar e escalar redes de parceiros, creators e afiliados.
          </p>

          <div className="mx-auto mt-6 grid max-w-3xl grid-cols-2 gap-2 md:grid-cols-4">
            {POSITIONING_PILLARS.map(({ label, icon: Icon }) => (
              <div
                key={label}
                className="flex items-center justify-center gap-2 rounded-lg border border-quantum-cyan/20 bg-obsidian-800/40 px-3 py-2 text-[11px] uppercase tracking-wider text-slate-200"
              >
                <Icon className="h-3.5 w-3.5 text-quantum-cyan" /> {label}
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              href="/login?mode=affiliate"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-quantum-cyan to-quantum-violet px-5 py-2.5 text-sm font-semibold text-obsidian shadow-lg shadow-quantum-cyan/30 transition hover:opacity-90"
            >
              Test-drive como afiliado <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#contato"
              className="inline-flex items-center gap-2 rounded-lg border border-quantum-cyan/40 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-quantum-cyan/10"
            >
              Agendar demonstração <Briefcase className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
        <IOAIDSection />
        <HomePersonasSistema />
<section className="relative z-10 border-t border-obsidian-700/60 bg-[radial-gradient(circle_at_top_right,rgba(124,255,178,0.12),transparent_30%),rgba(2,6,23,0.72)] px-6 py-14">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="text-center space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-quantum-lime/30 bg-quantum-lime/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-quantum-lime">
              <Sparkles className="h-3 w-3" /> Nexus Partners Pack
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Ative sua operação comercial no ecossistema Nexus</h2>
            <p className="mx-auto max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
              O <strong className="text-white">Nexus Partners Pack</strong> é uma ferramenta SaaS contratável, complementar ao ecossistema Nexus, mas <strong className="text-white">independente da progressão do Nexus Affil'IA'te</strong>. Ele pode ser assinado por terceiros ou pelos próprios afiliados, sempre como produto comercial autônomo em contratos de 6 a 48 meses, com modalidades de 6, 12, 18, 24, 30, 36 e 48 meses.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {PARTNERS_PACK_CARDS.map(({ icon: Icon, title, pill, text }) => (
              <div
                key={title}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/20 backdrop-blur transition hover:-translate-y-1 hover:border-quantum-lime/30"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-quantum-lime/10 text-quantum-lime">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full border border-quantum-lime/25 bg-quantum-lime/10 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.28em] text-quantum-lime">
                    {pill}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-white">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{text}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/subscriptions"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-quantum-lime to-quantum-cyan px-6 py-3 text-sm font-semibold text-obsidian shadow-lg shadow-quantum-lime/20 transition hover:opacity-90"
            >
              Explorar assinatura Nexus Partners <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/cadastro"
              className="inline-flex items-center gap-2 rounded-lg border border-quantum-lime/30 bg-quantum-lime/10 px-6 py-3 text-sm font-semibold text-quantum-lime transition hover:bg-quantum-lime/15"
            >
              Ativar acesso inicial <Sparkles className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <HomePersonasPartners />

      {/* VITRINE DE PACKS */}
      <section id="vitrine" className="relative z-10 px-6 py-14 border-t border-obsidian-700/60 bg-obsidian/40">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="text-center space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-quantum-cyan/30 bg-quantum-cyan/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-quantum-cyan">
              <Package className="h-3 w-3" /> Planos de assinatura
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Escolha o plano contratual do Nexus Partners Pack</h2>
            <p className="mx-auto max-w-2xl text-sm text-slate-400">
              Os planos abaixo representam a contratação do software Nexus Partners Pack e não devem ser confundidos com os packs ou níveis do Nexus Affil'IA'te.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: 'Start',
                subtitle: 'Plano inicial Nexus Partners Pack',
                price: 'R$ 100,00/mês',
                highlight: 'Assinatura SaaS inicial + comissão recorrente elegível',
                features: ['1 agente IA operacional', '10 ativos digitais para operação inicial', 'Painel comercial liberado', '8 skills comerciais ativas', 'Comissão mensal recorrente de 5% a 10% conforme prazo contratado'],
                badge: 'Assinatura',
                color: 'quantum-cyan',
                href: '/subscriptions',
              },
              {
                name: 'Growth',
                subtitle: 'Plano de escala Nexus Partners',
                price: 'R$ 250,00/mês',
                highlight: 'Escala operacional e analytics',
                features: ['3 agentes IA em operação', 'Biblioteca operacional ampliada', 'Governança comercial com regras customizáveis', 'Analytics de ROI e LTV em tempo real', 'Comissão mensal recorrente de 5% a 10% conforme prazo contratado'],
                badge: 'Assinatura',
                color: 'quantum-lime',
                href: '/subscriptions',
              },
              {
                name: 'Enterprise',
                subtitle: 'Plano enterprise Nexus Partners',
                price: 'Sob consulta',
                highlight: 'Desenho sob demanda',
                features: ['Governança enterprise dedicada', 'Integrações e operação sob demanda', 'Onboarding consultivo', 'Expansão estratégica de canais e squads', 'Comissão mensal recorrente de 7% a 15% conforme prazo contratado'],
                badge: 'Enterprise',
                color: 'quantum-purple',
                href: '/subscriptions',
              },
            ].map((pack) => (
              <div
                key={pack.name}
                className={`rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(0,229,255,0.10),transparent_40%),rgba(15,23,42,0.90)] p-6 transition hover:-translate-y-1 hover:border-white/20 shadow-xl shadow-black/20`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">{pack.subtitle}</p>
                    <p className="mt-1 text-2xl font-black text-white">{pack.name}</p>
                  </div>
                  <span className={`rounded-full border border-quantum-cyan/30 bg-quantum-cyan/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-quantum-cyan`}>
                    {pack.badge}
                  </span>
                </div>
                <p className={`mt-4 text-3xl font-black text-white`}>{pack.price}</p>
                <p className="mt-1 text-sm text-slate-400">{pack.highlight}</p>
                <ul className="mt-5 space-y-2">
                  {pack.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-200">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={pack.href}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-quantum-cyan to-quantum-violet px-4 py-2.5 text-sm font-semibold text-obsidian shadow-lg shadow-quantum-cyan/20 transition hover:opacity-90"
                >
                  Ver detalhes e adquirir <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-slate-500">
            Todos os planos representam a contratação do software Nexus Partners Pack por assinatura, sem vínculo com a escada de carreira do Nexus Affil'IA'te, com remuneração mensal recorrente para afiliados elegíveis conforme prazo e modalidade contratada.
            <a href="/subscriptions" className="ml-1 text-quantum-cyan hover:underline">Ver planos contratuais do Nexus Partners Pack →</a>
          </p>
        </div>
      </section>

      {/* SOBRE O SISTEMA */}
      <section id="sobre" className="relative z-10 px-6 py-14 border-t border-obsidian-700/60 bg-obsidian/40">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="text-center space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-quantum-cyan/30 bg-quantum-cyan/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-quantum-cyan">
              <Globe className="h-3 w-3" /> O ecossistema
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-white">O motor invisível do crescimento das suas vendas</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <p className="text-sm md:text-base leading-relaxed text-slate-300">
              Em qualquer operação de vendas por parceiros, o que faz diferença de verdade é conseguir atrair pessoas certas, organizar a rotina e transformar relacionamento em resultado de forma constante. É exatamente esse papel que o Nexus Affil'IA'te assume dentro da operação.
            </p>
            <p className="text-sm md:text-base leading-relaxed text-slate-300">
              O Nexus Affil'IA'te troca controles improvisados por uma base comercial mais profissional. Em vez de depender de planilhas, mensagens soltas e decisões sem contexto, sua equipe passa a operar com fluxo claro, vitrine pronta e acompanhamento centralizado.
            </p>
          </div>
        </div>
      </section>

      {/* VISÃO GERAL */}
      <section className="relative z-10 px-6 py-14 border-t border-obsidian-700/60">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-quantum-cyan/30 bg-quantum-cyan/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-quantum-cyan">
              <Layers className="h-3 w-3" /> A solução
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Uma plataforma que centraliza toda a operação de parceiros comerciais
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {VISION_CARDS.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="group rounded-xl border border-obsidian-700 bg-obsidian-800/40 p-5 transition hover:border-quantum-cyan/40 hover:bg-obsidian-800/60"
              >
                <Icon className="h-7 w-7 text-quantum-cyan mb-3" />
                <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm leading-relaxed text-slate-300">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPETÊNCIAS TECNOLÓGICAS */}
      <section id="competencias" className="relative z-10 px-6 py-14 border-t border-obsidian-700/60 bg-obsidian/40">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-quantum-cyan/30 bg-quantum-cyan/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-quantum-cyan">
              <Zap className="h-3 w-3" /> Capacidades
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Quatro pilares que sustentam sua operação comercial</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {COMPETENCIES.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="flex gap-4 rounded-xl border border-obsidian-700 bg-obsidian-800/30 p-5 transition hover:border-quantum-cyan/40"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-quantum-cyan/10 text-quantum-cyan">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white mb-1">{title}</h3>
                  <p className="text-sm leading-relaxed text-slate-300">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DIFERENCIAIS */}
      <section id="diferenciais" className="relative z-10 px-6 py-14 border-t border-obsidian-700/60">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-quantum-cyan/30 bg-quantum-cyan/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-quantum-cyan">
              <Star className="h-3 w-3" /> Diferenciais
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-white">O que torna o Nexus Affil'IA'te diferente de tudo que você já viu</h2>
            <p className="mx-auto max-w-3xl text-sm md:text-base text-slate-300">
              Mais do que promessa de automação — o sistema entrega capacidades comerciais reais, medição contínua de evolução e governança completa da sua rede de parceiros.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {DIFFERENTIALS.map(({ icon: Icon, marker, title, summary, highlights }) => (
              <div
                key={title}
                className="rounded-2xl border border-obsidian-700 bg-obsidian-800/30 p-6 transition hover:border-quantum-cyan/40 hover:bg-obsidian-800/50"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-quantum-cyan/10 text-quantum-cyan">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full border border-quantum-cyan/30 bg-quantum-cyan/5 px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.28em] text-quantum-cyan">
                    {marker}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">{summary}</p>
                <div className="mt-4 space-y-2">
                  {highlights.map((item) => (
                    <div key={item} className="flex items-start gap-2 text-sm text-slate-200">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CENÁRIOS DE APLICAÇÃO */}
      <section id="cenarios" className="relative z-10 px-6 py-14 border-t border-obsidian-700/60">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-quantum-cyan/30 bg-quantum-cyan/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-quantum-cyan">
              <Target className="h-3 w-3" /> Cases
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              O sistema se molda à natureza da sua operação
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl mx-auto">
              Três cenários de implementação estruturada, cada um entregando valor tático em uma vertical específica.
            </p>
          </div>

          <div className="space-y-5">
            {SCENARIOS.map((scenario) => (
              <div
                key={scenario.tag}
                className="rounded-2xl border border-obsidian-700 bg-obsidian-800/30 p-6 transition hover:border-quantum-cyan/40"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-quantum-cyan">
                      {scenario.tag}
                    </span>
                    <h3 className="text-lg md:text-xl font-semibold text-white mt-1">{scenario.title}</h3>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-3 text-sm leading-relaxed">
                  <div>
                    <p className="text-[11px] uppercase font-semibold text-quantum-cyan mb-1">O Contexto</p>
                    <p className="text-slate-300">{scenario.context}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase font-semibold text-quantum-violet mb-1">A Solução Nexus</p>
                    <p className="text-slate-300">{scenario.solution}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase font-semibold text-emerald-400 mb-1">O Impacto</p>
                    <p className="text-slate-300">{scenario.impact}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* METODOLOGIA */}
      <section id="metodologia" className="relative z-10 px-6 py-14 border-t border-obsidian-700/60 bg-obsidian/40">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-quantum-cyan/30 bg-quantum-cyan/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-quantum-cyan">
              <Calendar className="h-3 w-3" /> Como funciona
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Tecnologia a serviço do seu resultado comercial.</h2>
            <p className="text-sm text-slate-400 max-w-2xl mx-auto">
              Nossa implantação une tecnologia e processo comercial em 5 etapas práticas.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-5">
            {METHODOLOGY.map(({ icon: Icon, step, title, text }) => (
              <div
                key={step}
                className="rounded-xl border border-obsidian-700 bg-obsidian-800/30 p-4 transition hover:border-quantum-cyan/40"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-quantum-cyan/10 text-[11px] font-mono text-quantum-cyan">
                    {step}
                  </span>
                  <Icon className="h-4 w-4 text-quantum-cyan" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">{title}</h3>
                <p className="text-[12px] leading-relaxed text-slate-300">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MANIFESTO / POR QUE NEXUS */}
      <section className="relative z-10 px-6 py-14 border-t border-obsidian-700/60">
        <div className="mx-auto max-w-4xl space-y-6 text-center">
          <Quote className="h-8 w-8 text-quantum-cyan mx-auto" />
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Por que escolher o sistema Nexus Affil'IA'te?
          </h2>
          <p className="text-sm md:text-base leading-relaxed text-slate-300">
            A Equipe Nexus não entrega apenas uma ferramenta. Entrega uma estrutura pronta para vender melhor, organizar a rede e transformar a operação comercial em algo mais profissional e previsível.
          </p>
          <p className="text-sm md:text-base leading-relaxed text-slate-300">
            Nós cuidamos da base tecnológica para que sua equipe foque no que realmente importa: relacionamento, oferta, conversão e crescimento sustentável da receita.
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-3">
            {["Segurança da informação", "Estabilidade em picos", "UX polida", "Resiliência corporativa"].map(
              (item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1.5 rounded-full border border-quantum-cyan/30 bg-quantum-cyan/5 px-3 py-1 text-[11px] text-quantum-cyan"
                >
                  <CheckCircle2 className="h-3 w-3" /> {item}
                </span>
              ),
            )}
          </div>
        </div>
      </section>

      {/* CTA / CONTATO */}
      <section id="contato" className="relative z-10 px-6 py-16 border-t border-obsidian-700/60 bg-obsidian/40">
        <div className="mx-auto max-w-5xl space-y-10">
          <div className="text-center space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-quantum-cyan/30 bg-quantum-cyan/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-quantum-cyan">
              <Send className="h-3 w-3" /> Contato
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Pronto para escalar sua operação de parceiros?</h2>
            <p className="text-sm md:text-base text-slate-300 max-w-2xl mx-auto">
              Agende uma demonstração e veja o sistema em ação. Ou cadastre-se agora e faça o test-drive do
              Nexus Affil'IA'te diretamente na plataforma.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {CONTACTS.map(({ icon: Icon, label, value, href }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="flex items-start gap-3 rounded-xl border border-obsidian-700 bg-obsidian-800/30 p-4 transition hover:border-quantum-cyan/40"
              >
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-quantum-cyan/10 text-quantum-cyan">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] uppercase font-semibold text-quantum-cyan">{label}</p>
                  <p className="text-sm text-white">{value}</p>
                </div>
              </a>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              href="/cadastro"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-quantum-cyan to-quantum-violet px-6 py-3 text-sm font-semibold text-obsidian shadow-lg shadow-quantum-cyan/30 transition hover:opacity-90"
            >
              Iniciar test-drive agora <Send className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg border border-quantum-cyan/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-quantum-cyan/10"
            >
              Já sou parceiro <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FECHAMENTO */}
      <section className="relative z-10 px-6 py-12 border-t border-obsidian-700/60 text-center">
        <p className="mx-auto max-w-2xl text-base md:text-lg italic text-slate-300">
          “Transforme parcerias informais no seu canal de aquisição mais produtivo e previsível.”
        </p>
        <p className="mt-3 text-xs text-slate-500">— Equipe Nexus Affil'IA'te</p>
      </section>

      {/* RODAPÉ */}
      <footer className="relative z-10 border-t border-obsidian-700 bg-obsidian/80 px-6 py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-xs text-slate-400 md:flex-row">
          <div className="flex items-center gap-2">
            <span className="relative inline-flex h-2 w-2 rounded-full bg-quantum-cyan" />
            <span>
              NEXUS <span className="text-quantum-cyan">AFFIL'IA'TE</span> · Plataforma comercial inteligente
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" /> oneverso.com.br
            </span>
            <span className="inline-flex items-center gap-1">
              <Activity className="h-3 w-3 text-emerald-400" /> Plataforma ativa
            </span>
          </div>
        </div>
      </footer>

        <HomePersonasAcademia />
        <HomeCalendarioIA />
      </div>
  );
}


function HomePersonasSistema() {
  return (
    <section className="relative overflow-hidden py-14" id="persona-sistema">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-950"></div>
      <div className="relative container mx-auto px-4">
        <div className="mx-auto max-w-5xl flex justify-center">
          <img src="/img/personas/sistema_forum.png" alt="Forum AI agentic - Sistema Nexus" loading="lazy" className="rounded-2xl border border-cyan-400/30 shadow-2xl w-full object-cover" />
        </div>
      </div>
    </section>
  );
}
function HomePersonasPartners() {
  return (
    <section className="relative overflow-hidden py-14" id="persona-partners">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-950"></div>
      <div className="relative container mx-auto px-4">
        <div className="mx-auto max-w-5xl flex justify-center">
          <img src="/img/personas/partners_forum.png" alt="Nexus Partners Pack" loading="lazy" className="rounded-2xl border border-purple-400/30 shadow-2xl w-full object-cover" />
        </div>
      </div>
    </section>
  );
}
function HomePersonasAcademia() {
  return (
    <section className="relative overflow-hidden py-16" id="persona-academia">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900"></div>
      <div className="relative container mx-auto px-4">
        <div className="text-center mb-10">
          <span className="inline-block border border-cyan-400/60 bg-cyan-500/10 text-cyan-200 px-4 py-1.5 rounded-full text-xs uppercase tracking-wider font-semibold">Nexus Academ&apos;IA &middot; Personas Oficiais</span>
          <h3 className="mt-4 text-3xl md:text-4xl font-extrabold text-white">Sir Nexus Alencar e Sra. Nexus Ive</h3>
          <p className="text-slate-300 mt-3 max-w-2xl mx-auto">Mentoria tecnica e estrategica da Academ&apos;IA &mdash; IOAID &middot; SaaS. A dupla oficial conduz onboarding, operacao agentic, otimizacao e governanca.</p>
        </div>
        <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="rounded-2xl overflow-hidden border border-cyan-400/30 bg-slate-900/70 shadow-xl"><img src="/img/personas/alencar_ref.png" alt="Sir Nexus Alencar" loading="lazy" className="w-full object-cover" /><div className="p-4"><h4 className="text-white font-bold">Sir Nexus Alencar</h4><p className="text-slate-400 text-xs mt-1">Mentor tecnico &middot; IOAID &middot; SHO</p></div></div>
          <div className="rounded-2xl overflow-hidden border border-purple-400/30 bg-slate-900/70 shadow-xl"><img src="/img/personas/ive_training.png" alt="Sra. Nexus Ive" loading="lazy" className="w-full object-cover" /><div className="p-4"><h4 className="text-white font-bold">Sra. Nexus Ive</h4><p className="text-slate-400 text-xs mt-1">Estrategia e onboarding agentic</p></div></div>
          <div className="rounded-2xl overflow-hidden border border-cyan-400/30 bg-slate-900/70 shadow-xl"><img src="/img/personas/celebration_ive_alencar.png" alt="Ive e Alencar - Academia" loading="lazy" className="w-full object-cover" /><div className="p-4"><h4 className="text-white font-bold">Co-atuacao Oficial</h4><p className="text-slate-400 text-xs mt-1">Trilhas conjuntas da Academ&apos;IA</p></div></div>
        </div>
      </div>
    </section>
  );
}

function HomeCalendarioIA() {
  const eventos = [
    { data: "07/07/2026", dia: "SEG", titulo: "Meeting Genesis · C-Suite AI", categoria: "nexus", desc: "Primeira reunião oficial C-Suite Nexus Affil'IA'te · Formato A (chat copiloto)", link: "/admin/orchestrator" },
    { data: "15/07/2026", dia: "TER", titulo: "AWS re:Invent 2026 · Preview", categoria: "global", desc: "Preview técnico do maior evento AWS · Foco Generative AI + Bedrock" },
    { data: "22/07/2026", dia: "TER", titulo: "OpenAI DevDay 2026", categoria: "global", desc: "Anúncios oficiais OpenAI · Novos modelos + APIs" },
    { data: "01/08/2026", dia: "SEX", titulo: "Nexus Sprint Review · Onda 8", categoria: "nexus", desc: "Review interna Sprint 2 do COO Otávio · Marketplace + Batch 1 metrics" },
    { data: "15/08/2026", dia: "SEX", titulo: "Anthropic Claude Sonnet 4.5", categoria: "research", desc: "Papers recentes de alignment e constitutional AI" },
    { data: "05/09/2026", dia: "SEX", titulo: "Nexus Batch 2 · 100 fundadores", categoria: "business", desc: "Lançamento do segundo batch de fundadores · Meta 1000 afiliados" },
    { data: "20/09/2026", dia: "DOM", titulo: "NeurIPS 2026 · Submission Deadline", categoria: "research", desc: "Prazo submissão papers Nexus Federation Judge (agentic governance)" },
    { data: "01/10/2026", dia: "QUA", titulo: "Product Hunt Launch · Nexus", categoria: "product", desc: "Lançamento oficial no Product Hunt · Rumo ao unicórnio 🚀" },
  ];

  const CATEGORY_COLORS: Record<string, {bg: string; border: string; text: string; label: string}> = {
    nexus:    { bg: "bg-cyan-500/10",   border: "border-cyan-500/30",   text: "text-cyan-300",   label: "Nexus" },
    global:   { bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-300", label: "Global" },
    research: { bg: "bg-blue-500/10",   border: "border-blue-500/30",   text: "text-blue-300",   label: "Research" },
    business: { bg: "bg-emerald-500/10",border: "border-emerald-500/30",text: "text-emerald-300",label: "Business" },
    product:  { bg: "bg-amber-500/10",  border: "border-amber-500/30",  text: "text-amber-300",  label: "Product" },
  };

  return (
    <section id="calendario-ia" className="relative overflow-hidden py-16 px-6 sm:px-10 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 backdrop-blur">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-widest text-cyan-300 border border-cyan-500/40 rounded-full bg-cyan-500/5">
            📅 Calendário IA · Nexus + Global
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-white">
            Próximos <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Marcos</span>
          </h2>
          <p className="mt-3 text-slate-400 max-w-2xl mx-auto">
            Eventos curados do ecossistema IA + próximos passos do Nexus Affil'IA'te · atualizado semanalmente pelo COO Otávio
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {eventos.map((ev, i) => {
            const cat = CATEGORY_COLORS[ev.categoria] || CATEGORY_COLORS.nexus;
            return (
              <div
                key={i}
                className={`rounded-2xl ${cat.bg} border ${cat.border} p-5 backdrop-blur transition-all hover:scale-[1.02] hover:border-white/40`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 flex flex-col items-center justify-center rounded-xl bg-black/40 border border-white/10 px-3 py-2 min-w-[80px]">
                    <div className="text-xs font-mono text-slate-400">{ev.dia}</div>
                    <div className="text-sm font-bold text-white">{ev.data.split("/").slice(0,2).join("/")}</div>
                    <div className="text-xs text-slate-500">{ev.data.split("/")[2]}</div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-mono ${cat.text} uppercase tracking-wider`}>{cat.label}</span>
                    </div>
                    <h3 className="text-white font-semibold text-lg leading-tight">{ev.titulo}</h3>
                    <p className="text-slate-400 text-sm mt-1 leading-snug">{ev.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center text-xs text-slate-500">
          Curadoria: <span className="text-cyan-400">Otávio Nexus Ops</span> · COO/AI · Trust: elite · ed25519 handshake
          <br />
          Próxima atualização: <span className="text-slate-400">cron.calendarioIaRefresh</span> (Onda 8+)
        </div>
      </div>
    </section>
  );
}



function IOAIDSection() {
  return (
    <section className="relative overflow-hidden py-20" id="ioaid-saas">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900"></div>
      <div className="relative container mx-auto px-4 text-center">
        <span className="inline-block border border-cyan-400/60 text-cyan-200 bg-cyan-500/10 px-4 py-1.5 rounded-full text-xs uppercase tracking-wider font-semibold shadow-lg shadow-cyan-500/20">Nexus Affil&apos;IA&apos;te &mdash; IOAID &middot; SaaS</span>
        <h2 className="mt-6 text-4xl md:text-6xl font-extrabold text-white drop-shadow-lg">Infraestrutura Operacional de</h2>
        <h2 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-cyan-300 via-sky-300 to-purple-300 bg-clip-text text-transparent">Inteligencia Distribuida</h2>
        <p className="mt-6 text-slate-200 max-w-3xl mx-auto text-lg leading-relaxed">Organismo SaaS AI-Native &middot; Ecossistema de Marketing de Afiliados adotando o <strong className="text-cyan-300">SHO (Sistema Hibrido de Orquestracao)</strong> e buscando alcancar o nivel de <strong className="text-purple-300">AOI (Autonomous Operational Intelligence)</strong>.</p>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5 max-w-6xl mx-auto">
          <div className="rounded-2xl border border-cyan-400/30 bg-slate-900/70 p-6 text-left shadow-xl shadow-cyan-500/10"><h3 className="text-white font-bold text-lg">Gestao x Operacional</h3><p className="text-slate-300 mt-3 text-sm leading-relaxed">O usuario/peer se cadastra, ajusta funcionalidades operacionais e skills dos Agentes IA autonomos, promovendo acoes na AI Operational Network.</p></div>
          <div className="rounded-2xl border border-cyan-400/30 bg-slate-900/70 p-6 text-left shadow-xl shadow-cyan-500/10"><h3 className="text-white font-bold text-lg">Full Autonomous Runtime</h3><p className="text-slate-300 mt-3 text-sm leading-relaxed">Modelo de operacao singular, arquitetura de alta integridade operando em runtime totalmente autonomo, com agentes coordenados em malha.</p></div>
          <div className="rounded-2xl border border-purple-400/30 bg-slate-900/70 p-6 text-left shadow-xl shadow-purple-500/10"><h3 className="text-white font-bold text-lg">Stack Legacy Fusionada</h3><p className="text-slate-300 mt-3 text-sm leading-relaxed">Arquitetura fusionada do legado PHP com stack moderna React + TypeScript, preservando integridade de core e ampliando capacidades agenticas.</p></div>
        </div>
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5 max-w-6xl mx-auto">
          <div className="rounded-2xl border border-cyan-400/30 bg-slate-900/70 p-6 text-left shadow-xl shadow-cyan-500/10"><h3 className="text-white font-bold text-lg">AI Operational Network</h3><p className="text-slate-300 mt-3 text-sm leading-relaxed">Rede operacional distribuida onde cada afiliado opera com Agentes IA proprietarios, executando vendas, conteudo, comissoes e relacionamento em paralelo, com observabilidade total.</p></div>
          <div className="rounded-2xl border border-purple-400/30 bg-slate-900/70 p-6 text-left shadow-xl shadow-purple-500/10"><h3 className="text-white font-bold text-lg">SaaS Early-Stage &middot; Alta Integridade</h3><p className="text-slate-300 mt-3 text-sm leading-relaxed">Plataforma em estagio inicial com arquitetura de alta integridade: auditoria, refresh tokens, segregacao de papeis e sessao soberana por afiliado.</p></div>
        </div>
      </div>
    </section>
  );
}
