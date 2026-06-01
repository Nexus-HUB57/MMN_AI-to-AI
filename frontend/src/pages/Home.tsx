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
import bgHome from "@/assets/bg-home.webp";

const NAV_LINKS = [
  { href: "#sobre", label: "Sobre" },
  { href: "#vitrine", label: "Packs" },
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
    title: "Ative e comece a operar",
    pill: "Entrada oficial",
    text: "Com o Pack A² você ativa seu Agente IA, abre sua vitrine de ofertas, entra no painel da plataforma e começa a vender com mais apoio, organização e velocidade.",
  },
  {
    icon: Database,
    title: "Catálogo, revenda e estoque",
    pill: "Vitrine pronta",
    text: "Cada pack libera uma cota de e-books, produtos e conteúdos prontos para revenda. Seu mini-site recebe o catálogo automaticamente e o Agente IA trata de apresentar as ofertas para você.",
  },
  {
    icon: Zap,
    title: "Escale com automação real",
    pill: "Agente IA",
    text: "O ecossistema foi construído para crescer junto com você. Conforme avança de nível, seu agente ganha novas capacidades, sua rede expande e suas comissões evoluem automaticamente.",
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

      <section className="relative z-10 border-t border-obsidian-700/60 bg-[radial-gradient(circle_at_top_right,rgba(124,255,178,0.12),transparent_30%),rgba(2,6,23,0.72)] px-6 py-14">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="text-center space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-quantum-lime/30 bg-quantum-lime/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-quantum-lime">
              <Sparkles className="h-3 w-3" /> Nexus Partners Pack
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Ative sua operação comercial no ecossistema Nexus</h2>
            <p className="mx-auto max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
              O <strong className="text-white">Nexus Partners Pack</strong> é o seu ponto de entrada oficial. Agora ele é apresentado no Nexus Store como uma <strong className="text-white">licença SaaS exclusivamente por assinatura</strong>, com opções contratuais de 6 a 48 meses para ativar o Agente IA, acessar o catálogo e operar com automação comercial inteligente.
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
              Explorar Nexus Partners Pack <ArrowRight className="h-4 w-4" />
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

      {/* VITRINE DE PACKS */}
      <section id="vitrine" className="relative z-10 px-6 py-14 border-t border-obsidian-700/60 bg-obsidian/40">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="text-center space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-quantum-cyan/30 bg-quantum-cyan/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-quantum-cyan">
              <Package className="h-3 w-3" /> Packs de entrada
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Escolha seu pack de ativação e comece hoje</h2>
            <p className="mx-auto max-w-2xl text-sm text-slate-400">
              Cada pack libera o Agente IA, uma cota de produtos para revenda e o próximo nível da sua carreira comercial.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: 'Pack A²',
                subtitle: 'Agente Afiliado Nível I',
                price: 'R$ 10,00',
                highlight: 'Ativação do Agente IA',
                features: ['1 Agente IA ativado', '10 e-books para revenda', 'Painel comercial liberado', '2 skills iniciais'],
                badge: 'Entrada gratuita',
                color: 'quantum-cyan',
                href: '/subscriptions',
              },
              {
                name: 'Pack AG',
                subtitle: 'Agente Preditivo Nível I',
                price: 'R$ 250,00',
                highlight: 'Operação preditiva',
                features: ['Agente em nível profissional', '250 e-books para ampliar a vitrine', 'Comissão em mais níveis da rede', '5 cotas extras de expansão'],
                badge: 'Profissional',
                color: 'quantum-lime',
                href: '/subscriptions',
              },
              {
                name: 'Pack AA',
                subtitle: 'Liderança estratégica Nível I',
                price: 'Sob consulta',
                highlight: 'Camada estratégica',
                features: ['Benefícios estratégicos exclusivos', 'Participação em receitas especiais', 'Apoio a novos projetos', 'Acesso total às capacidades do agente'],
                badge: 'Elite',
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
            Todos os packs incluem acesso ao painel, ativação progressiva do Agente IA e apoio comercial em modelo de assinatura.
            <a href="/subscriptions" className="ml-1 text-quantum-cyan hover:underline">Ver planos de assinatura do Nexus Partners →</a>
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
    </div>
  );
}
