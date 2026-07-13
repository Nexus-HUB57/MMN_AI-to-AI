import { Link } from "wouter";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bot,
  Briefcase,
  Building2,
  CheckCircle2,
  CircuitBoard,
  Cpu,
  Crown,
  GitBranch,
  Globe,
  Layers,
  LineChart,
  Lock,
  MessageSquareText,
  Network,
  Rocket,
  ShieldCheck,
  Sparkles,
  Users,
  Workflow,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import bgHome from "@/assets/bg-home.webp";
import { FALLBACK_SUBSCRIPTION_PLANS, type CatalogPlan } from "@/lib/nexus-partners-fallback";

const differentiationItems = [
  {
    icon: Bot,
    title: "Escopo operacional",
    packA2: "Ativa o primeiro agente da jornada principal do afiliado e libera a base inicial de operação individual.",
    npp: "Estrutura uma camada SaaS/PaaS complementar para operar parceiros, comissões, analytics, integrações e governança de forma dedicada.",
    gain: "Menos improviso operacional e mais capacidade de executar como produto, canal ou unidade de negócio.",
  },
  {
    icon: Workflow,
    title: "Profundidade de automação",
    packA2: "Excelente para entrada no ecossistema, ativação do agente e rotina inicial de afiliado.",
    npp: "Foi desenhado para automatizar fluxos comerciais recorrentes, orquestrar múltiplas etapas e padronizar execução com trilha auditável.",
    gain: "Redução de retrabalho, mais escala e mais previsibilidade de execução.",
  },
  {
    icon: BarChart3,
    title: "Leitura de performance",
    packA2: "Entrega visibilidade da jornada principal, ativação do agente e evolução inicial no ecossistema.",
    npp: "Aprofunda a análise com dashboard comercial, tiers, performance, volume, benefícios e leitura de rentabilidade por canal/parceiro.",
    gain: "Decisão orientada por dados, não por percepção.",
  },
  {
    icon: CircuitBoard,
    title: "Integração e extensibilidade",
    packA2: "É a porta de entrada para o afiliado operar o seu agente e sua vitrine.",
    npp: "Expõe runtime e gateway OpenAPI, bindings de APIs, webhooks e trilha de rollout enterprise para conectar operação, stack e parceiros.",
    gain: "Maior aderência a cenários B2B, squads e processos de negócio.",
  },
  {
    icon: ShieldCheck,
    title: "Governança e segurança operacional",
    packA2: "Focado na ativação do afiliado e no início da jornada oficial.",
    npp: "Acrescenta isolamento de runtime, fallback controlado, auditoria de gateway, gestão por assinatura e regras contratuais por capacidade.",
    gain: "Mais confiança para vender, operar e expandir em contexto profissional.",
  },
  {
    icon: Network,
    title: "Modelo de expansão",
    packA2: "Inicia a jornada e cria a base individual do afiliado.",
    npp: "Permite transformar essa base em operação comercial replicável para PF, empresas e afiliados que desejam monetização recorrente e estrutura SaaS.",
    gain: "Abre espaço para upsell, retenção e receita recorrente.",
  },
] as const;

const skillLayers = [
  {
    icon: MessageSquareText,
    title: "Mensagens e abordagem comercial",
    text: "Apoia a criação de mensagens, sequências de contato e abordagem consultiva com mais consistência do que uma operação manual dispersa.",
  },
  {
    icon: Users,
    title: "Segmentação e priorização de público",
    text: "Ajuda a separar perfis, contextos e oportunidades para o time focar onde existe maior probabilidade de avanço comercial.",
  },
  {
    icon: LineChart,
    title: "Leitura de tendências e sinais",
    text: "Transforma dados operacionais e comportamento de parceiros em sinais de melhoria, expansão ou correção de rota.",
  },
  {
    icon: GitBranch,
    title: "Fluxos e rotinas automatizadas",
    text: "Padroniza etapas repetitivas de ativação, acompanhamento e operação para que a execução não dependa apenas de memória humana.",
  },
  {
    icon: Activity,
    title: "Performance e accountability",
    text: "Centraliza indicadores como volume, crescimento, latência operacional, sucesso da execução e leitura de produtividade comercial.",
  },
  {
    icon: BadgeCheck,
    title: "Comissões, tiers e benefícios",
    text: "Organiza a lógica de níveis, benefícios, regras de comissão e progressão de parceiros com mais clareza e transparência.",
  },
  {
    icon: Globe,
    title: "APIs, webhooks e conectividade",
    text: "Amplia o produto para integrações com sistemas externos, SDKs, eventos e bindings, acelerando cenários de negócio com mais maturidade técnica.",
  },
  {
    icon: Lock,
    title: "Governança, auditoria e runtime",
    text: "Combina trilha auditável, padrão OpenAPI, fallback controlado e preparação para runtime dedicado quando a operação exige maior robustez.",
  },
] as const;

const personas = [
  {
    icon: Sparkles,
    title: "Para você · Pessoa Física",
    subtitle: "Autônomos, consultores, creators, infoprodutores e profissionais que precisam ganhar escala sem montar uma estrutura pesada.",
    bullets: [
      "Automatizar atendimento inicial, qualificação e follow-up comercial.",
      "Organizar ofertas, campanhas e rotinas com menos planilha e menos retrabalho.",
      "Ganhar leitura real do que gera resultado para ajustar discurso, canal e proposta.",
      "Operar uma estrutura mais profissional sem depender de uma equipe grande desde o início.",
    ],
    value: "O NPP reduz fricção operacional e aumenta a sensação de controle para quem vende, atende e precisa escalar a própria capacidade de execução.",
    fit: "Melhor encaixe: Start para começar com método e Growth para acelerar volume com analytics.",
  },
  {
    icon: Building2,
    title: "Para o seu Negócio · CNPJ",
    subtitle: "Empresas que precisam estruturar canais, parceiros, representantes, creators, afiliados ou times comerciais híbridos.",
    bullets: [
      "Padronizar operação comercial e regras de comissionamento.",
      "Criar camada de monitoramento, governança e rastreabilidade.",
      "Conectar APIs, webhooks e rotinas de negócio ao fluxo comercial.",
      "Escalar com menos conflito entre marketing, vendas, parceiros e financeiro.",
    ],
    value: "O NPP transforma uma operação solta em um ativo operacional com visibilidade, ritos e capacidade de expansão com menos caos.",
    fit: "Melhor encaixe: Growth para escala multicanal e Enterprise para desenho dedicado, integrações e governança ampliada.",
  },
  {
    icon: Crown,
    title: "Para você · Afiliado Nexus Affil'IA'te",
    subtitle: "Afiliados que já entenderam a jornada principal e querem adicionar uma oferta SaaS com recorrência, prova operacional e potencial de ticket maior.",
    bullets: [
      "Usar o Pack A² como porta de entrada e o NPP como esteira de expansão comercial.",
      "Acessar uma oferta complementar mais robusta para prospects que precisam de operação, não apenas ativação.",
      "Monetizar contratos por assinatura com recorrência mensal e faixas de comissão vinculadas ao plano e ao prazo contratado.",
      "Ganhar argumento comercial mais forte ao demonstrar dashboard, runtime, OpenAPI, tiers e gestão de parceiros.",
    ],
    value: "O NPP dá ao afiliado uma narrativa de valor mais empresarial: em vez de vender apenas entrada, ele passa a vender estrutura, governança e continuidade.",
    fit: "Melhor encaixe: Start para testar proposta, Growth para carteira ativa e Enterprise para vendas consultivas de maior valor.",
  },
] as const;

const planHighlights: Record<string, { audience: string; outcome: string; accent: string }> = {
  "nexus-start": {
    audience: "Entrada operacional",
    outcome: "Ideal para quem precisa sair do modo manual e começar com 1 agente IA, 8 skills comerciais e dashboard auditável.",
    accent: "from-quantum-cyan to-quantum-violet",
  },
  "nexus-growth": {
    audience: "Escala com gestão",
    outcome: "Ideal para quem já validou oferta e agora precisa ampliar analytics, governança, múltiplos agentes e leitura de ROI/LTV por canal.",
    accent: "from-quantum-lime to-quantum-cyan",
  },
  "nexus-enterprise": {
    audience: "Arquitetura dedicada",
    outcome: "Ideal para operação com maior criticidade, mais stakeholders, desenho consultivo, integrações sob demanda e onboarding estratégico.",
    accent: "from-quantum-purple to-quantum-cyan",
  },
};

const technicalPillars = [
  {
    icon: Cpu,
    title: "Runtime preparado para múltiplos modos",
    text: "A camada NPP foi estruturada para trabalhar com runtime dedicado, compartilhado, Gemini ou fallback, preservando continuidade operacional conforme o ambiente disponível.",
  },
  {
    icon: Globe,
    title: "Gateway OpenAPI para integrações",
    text: "O ecossistema expõe discovery, catálogo, assinaturas, comissões, parceiros, webhooks e endpoints de auditoria, acelerando integrações com stacks externas.",
  },
  {
    icon: Layers,
    title: "Produto contratado por capacidade",
    text: "Start, Growth e Enterprise não são degraus da carreira principal: são modalidades contratuais do mesmo produto, variando capacidade, governança e suporte.",
  },
  {
    icon: ShieldCheck,
    title: "Salvaguardas de operação",
    text: "A proposta técnica inclui fallback controlado, trilha auditável, isolamento por ambiente e estrutura para rollout, smoke tests e readiness enterprise.",
  },
] as const;

const endpointLinks = [
  {
    label: "Gateway discovery",
    href: "https://api.oneverso.com.br/api/v1/",
  },
  {
    label: "OpenAPI JSON",
    href: "https://api.oneverso.com.br/api/v1/openapi.json",
  },
  {
    label: "Catálogo de planos",
    href: "https://api.oneverso.com.br/api/v1/catalog/plans",
  },
  {
    label: "SDK JavaScript",
    href: "https://api.oneverso.com.br/api/v1/sdk/javascript",
  },
  {
    label: "SDK Python",
    href: "https://api.oneverso.com.br/api/v1/sdk/python",
  },
] as const;

function formatPrice(plan: CatalogPlan) {
  if (plan.priceCents == null) return "Sob consulta";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(plan.priceCents / 100);
}

function billingLabel(plan: CatalogPlan) {
  if (plan.billingCycle === "monthly") return `${formatPrice(plan)}/mês`;
  if (plan.billingCycle === "yearly") return `${formatPrice(plan)}/ano`;
  return formatPrice(plan);
}

export default function NexusPartnersPackPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-obsidian font-sans text-foreground antialiased selection:bg-quantum-cyan/30">
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-45"
        style={{ backgroundImage: `url(${bgHome})` }}
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-obsidian/85 via-obsidian/75 to-obsidian" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 bg-grid-obsidian bg-grid-50 opacity-[0.08]" aria-hidden="true" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[540px] w-[540px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-quantum-cyan/15 via-quantum-violet/15 to-quantum-lime/10 blur-[150px]" />

      <nav className="relative z-40 flex h-16 items-center justify-between border-b border-obsidian-700 bg-obsidian/80 px-6 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-quantum-cyan shadow-[0_0_12px_#00E5FF]">
            <span className="absolute inset-0 animate-ping rounded-full bg-quantum-cyan/60" />
          </span>
          <span className="text-sm font-bold tracking-wider text-white">
            NEXUS <span className="text-quantum-cyan">PARTNERS PACK</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10"
          >
            Voltar ao portal
          </Link>
          <Link
            href="/subscriptions"
            className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-quantum-cyan via-quantum-violet to-quantum-purple px-3 py-1.5 text-xs font-semibold text-obsidian shadow-lg shadow-quantum-cyan/30 transition hover:opacity-90"
          >
            Ver planos
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </nav>

      <main className="relative z-10">
        <section className="px-6 pb-16 pt-16 md:pb-24 md:pt-24">
          <div className="mx-auto max-w-7xl space-y-10">
            <div className="grid gap-10 xl:grid-cols-[1.08fr_0.92fr] xl:items-center">
              <div className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  <Badge className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">Conheça a nossa SaaS/PaaS Nexus Partners Pack</Badge>
                  <Badge className="border border-quantum-lime/30 bg-quantum-lime/10 text-quantum-lime">Assinatura com janela de 6 a 48 meses</Badge>
                  <Badge className="border border-white/10 bg-white/5 text-slate-200">Start · Growth · Enterprise</Badge>
                </div>

                <div className="space-y-4">
                  <h1 className="max-w-5xl text-4xl font-black tracking-tight text-white md:text-6xl">
                    A camada comercial e operacional que leva o ecossistema Nexus do <span className="text-quantum-lime">acesso inicial</span> para a <span className="text-quantum-cyan">operação de verdade</span>
                  </h1>
                  <p className="max-w-4xl text-base leading-8 text-slate-300 md:text-lg">
                    O <strong className="text-white">Nexus Partners Pack</strong> é uma solução complementar ao ecossistema Nexus Affil'IA'te, mas com identidade própria: ele foi desenhado para estruturar operação, automação, gestão de parceiros, governança comercial e conectividade técnica em um produto contratado por assinatura.
                  </p>
                  <p className="max-w-4xl text-sm leading-7 text-slate-400 md:text-base">
                    Em termos simples: o <strong className="text-white">Pack A²</strong> ativa a jornada principal do afiliado e instala o primeiro agente. Já o <strong className="text-white">NPP</strong> expande essa base para um contexto mais robusto, com capacidade de orquestrar operação, medir desempenho, integrar sistemas, profissionalizar a oferta e aumentar a recorrência comercial.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">capacidade inicial</p>
                    <p className="mt-3 text-3xl font-bold text-white">1→10</p>
                    <p className="mt-2 text-sm text-slate-400">agentes IA por modalidade contratual</p>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">camada técnica</p>
                    <p className="mt-3 text-3xl font-bold text-quantum-cyan">OpenAPI</p>
                    <p className="mt-2 text-sm text-slate-400">discovery, SDKs, webhooks e integrações</p>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">monetização</p>
                    <p className="mt-3 text-3xl font-bold text-quantum-lime">5%→15%</p>
                    <p className="mt-2 text-sm text-slate-400">comissão mensal recorrente por plano e prazo</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/subscriptions"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-quantum-cyan to-quantum-violet px-6 py-3 text-sm font-semibold text-obsidian shadow-lg shadow-quantum-cyan/20 transition hover:opacity-90"
                  >
                    Explorar planos e contratação
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/partners"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Abrir console Partners
                    <CircuitBoard className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(0,229,255,0.12),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(124,255,178,0.12),transparent_25%),rgba(15,23,42,0.82)] p-6 shadow-2xl shadow-black/25 backdrop-blur">
                <div className="flex flex-wrap gap-2">
                  <Badge className="border border-white/10 bg-white/5 text-slate-200">Leitura estratégica</Badge>
                  <Badge className="border border-amber-300/30 bg-amber-300/10 text-amber-200">Quando o Pack A² sozinho não basta</Badge>
                </div>
                <h2 className="mt-4 text-2xl font-bold text-white">Por que um prospect ou afiliado deveria assinar o NPP</h2>
                <div className="mt-5 space-y-4 text-sm leading-7 text-slate-300 md:text-base">
                  <p>
                    Porque o NPP responde a uma dor que aparece logo depois da ativação inicial: quando a pessoa ou empresa já percebeu valor na base do ecossistema, mas precisa de <strong className="text-white">mais operação, mais governança e mais capacidade de integração</strong> para continuar crescendo sem desorganização.
                  </p>
                  <p>
                    O NPP faz sentido quando existe necessidade de rotina comercial mais consistente, acompanhamento de performance, controle de parceiros, expansão de canais, automação de tarefas repetitivas e narrativa de valor mais forte para vender ou operar em contexto profissional.
                  </p>
                  <p>
                    Em outras palavras, ele não substitui a porta de entrada; ele <strong className="text-white">a profissionaliza, amplia e monetiza melhor</strong>. Isso vale para quem quer vender mais sozinho, para empresas que querem estruturar canais e para afiliados que desejam oferecer uma solução com recorrência e maturidade empresarial.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-obsidian-700/60 bg-obsidian/35 px-6 py-16">
          <div className="mx-auto max-w-7xl space-y-8">
            <div className="max-w-4xl space-y-3">
              <Badge className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">Pack A² × Nexus Partners Pack</Badge>
              <h2 className="text-3xl font-black text-white md:text-4xl">O que o NPP faz com mais eficiência do que o Agente do Pack A² isoladamente</h2>
              <p className="text-sm leading-7 text-slate-300 md:text-base">
                O Pack A² continua sendo a porta oficial de entrada da jornada principal. O diferencial do NPP aparece quando a necessidade sai do nível de ativação e entra no nível de <strong className="text-white">operação estruturada, escala, governança e integração</strong>.
              </p>
            </div>

            <div className="grid gap-5 xl:grid-cols-2">
              {differentiationItems.map(({ icon: Icon, title, packA2, npp, gain }) => (
                <div key={title} className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/20 backdrop-blur">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-quantum-cyan/20 bg-quantum-cyan/10 text-quantum-cyan">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-bold text-white">{title}</h3>
                  </div>
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Pack A²</p>
                      <p className="mt-3 text-sm leading-7 text-slate-300">{packA2}</p>
                    </div>
                    <div className="rounded-2xl border border-quantum-lime/20 bg-quantum-lime/10 p-4">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-quantum-lime">NPP</p>
                      <p className="mt-3 text-sm leading-7 text-slate-100">{npp}</p>
                    </div>
                  </div>
                  <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                    <strong className="text-white">Ganho prático:</strong> {gain}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-obsidian-700/60 px-6 py-16">
          <div className="mx-auto max-w-7xl space-y-8">
            <div className="max-w-4xl space-y-3">
              <Badge className="border border-quantum-lime/30 bg-quantum-lime/10 text-quantum-lime">Principais skills e aplicações</Badge>
              <h2 className="text-3xl font-black text-white md:text-4xl">8 frentes de valor que fortalecem a assinatura do NPP</h2>
              <p className="text-sm leading-7 text-slate-300 md:text-base">
                O valor do NPP não está apenas em “ter IA”. Está em combinar IA, fluxo, dados, governança e conectividade em uma camada que melhora execução comercial e aumenta confiança do prospect na ferramenta.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {skillLayers.map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/15 backdrop-blur transition hover:-translate-y-1 hover:border-quantum-cyan/30">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black/20 text-quantum-cyan">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-white">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-obsidian-700/60 bg-[radial-gradient(circle_at_top_left,rgba(0,229,255,0.08),transparent_20%),rgba(2,6,23,0.74)] px-6 py-16">
          <div className="mx-auto max-w-7xl space-y-8">
            <div className="max-w-4xl space-y-3">
              <Badge className="border border-white/10 bg-white/5 text-slate-200">Painéis explicativos por persona</Badge>
              <h2 className="text-3xl font-black text-white md:text-4xl">Como o NPP ajuda perfis diferentes a resolver problemas diferentes</h2>
              <p className="text-sm leading-7 text-slate-300 md:text-base">
                A mesma estrutura do NPP gera valor em contextos distintos. O que muda é o problema principal de cada comprador — e é isso que fortalece o discurso comercial da página.
              </p>
            </div>

            <div className="grid gap-6 xl:grid-cols-3">
              {personas.map(({ icon: Icon, title, subtitle, bullets, value, fit }) => (
                <div key={title} className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/15 backdrop-blur">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-quantum-cyan">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-2xl font-bold text-white">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{subtitle}</p>
                  <div className="mt-5 space-y-3">
                    {bullets.map((bullet) => (
                      <div key={bullet} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-200">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                        <span>{bullet}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 rounded-2xl border border-quantum-cyan/20 bg-quantum-cyan/10 p-4 text-sm leading-7 text-slate-100">
                    <strong className="text-white">Valor percebido:</strong> {value}
                  </div>
                  <p className="mt-4 text-sm font-medium text-quantum-lime">{fit}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-obsidian-700/60 px-6 py-16">
          <div className="mx-auto max-w-7xl space-y-8">
            <div className="max-w-4xl space-y-3">
              <Badge className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">Planos e diferenciais por capacidade</Badge>
              <h2 className="text-3xl font-black text-white md:text-4xl">Qual plano faz mais sentido para cada momento</h2>
              <p className="text-sm leading-7 text-slate-300 md:text-base">
                A melhor forma de reduzir dúvida do prospect é mostrar que o NPP não é uma compra genérica: ele se adapta ao estágio da operação. Os planos são modalidades contratuais do mesmo produto, variando capacidade, governança e profundidade operacional.
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              {FALLBACK_SUBSCRIPTION_PLANS.map((plan) => {
                const highlight = planHighlights[plan.id];
                return (
                  <div key={plan.id} className="rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(0,229,255,0.10),transparent_40%),rgba(15,23,42,0.92)] p-6 shadow-2xl shadow-black/20">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">{highlight.audience}</p>
                        <h3 className="mt-2 text-2xl font-black text-white">{plan.shortName.replace("Nexus Partners ", "")}</h3>
                        <p className="mt-2 text-sm text-slate-400">{plan.tagline}</p>
                      </div>
                      <span className={`rounded-full bg-gradient-to-r ${highlight.accent} px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-obsidian`}>
                        {plan.storefront.subscriptionOnly ? "assinatura" : "licença"}
                      </span>
                    </div>

                    <div className="mt-5 rounded-3xl border border-white/10 bg-black/20 p-5">
                      <p className="text-sm text-slate-400">Investimento</p>
                      <p className="mt-2 text-3xl font-black text-white">{billingLabel(plan)}</p>
                      <p className="mt-2 text-sm text-slate-400">{plan.storefront.licenseLabel}</p>
                    </div>

                    <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">agentes</p>
                        <p className="mt-2 text-2xl font-bold text-white">{plan.capacity.aiAgents}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">skills</p>
                        <p className="mt-2 text-2xl font-bold text-white">{plan.capacity.skills}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">níveis</p>
                        <p className="mt-2 text-2xl font-bold text-white">{plan.capacity.referralLevels}</p>
                      </div>
                    </div>

                    <p className="mt-5 text-sm leading-7 text-slate-300">{highlight.outcome}</p>

                    <ul className="mt-5 space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3 text-sm text-slate-200">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-5 rounded-2xl border border-quantum-lime/20 bg-quantum-lime/10 px-4 py-3 text-sm text-slate-100">
                      Comissão recorrente elegível conforme plano/prazo: <strong className="text-white">{Math.round(plan.commissionRate * 100)}% base</strong> + faixas contratuais estendidas.
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-t border-obsidian-700/60 bg-obsidian/35 px-6 py-16">
          <div className="mx-auto max-w-7xl space-y-8">
            <div className="max-w-4xl space-y-3">
              <Badge className="border border-amber-300/30 bg-amber-300/10 text-amber-200">Camada técnica do produto</Badge>
              <h2 className="text-3xl font-black text-white md:text-4xl">Por trás da oferta: atributos que aumentam credibilidade para prospects mais exigentes</h2>
              <p className="text-sm leading-7 text-slate-300 md:text-base">
                Para prospects com perfil mais técnico ou empresarial, a página do NPP deve mostrar que existe substância operacional por trás do discurso comercial. Isso ajuda a transformar curiosidade em confiança.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {technicalPillars.map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/15 backdrop-blur">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black/20 text-quantum-cyan">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-white">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{text}</p>
                </div>
              ))}
            </div>

            <div className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(124,255,178,0.10),transparent_30%),rgba(15,23,42,0.9)] p-6 shadow-xl shadow-black/20">
              <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                <div className="max-w-3xl">
                  <h3 className="text-2xl font-bold text-white">Links técnicos públicos do ecossistema NPP</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    Esses links ajudam a demonstrar maturidade técnica para parceiros, times internos e prospects que desejam validar a existência do gateway, do catálogo e das bases de integração antes da contratação.
                  </p>
                </div>
                <Link
                  href="/partners"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Ver console runtime
                  <Rocket className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                {endpointLinks.map((endpoint) => (
                  <a
                    key={endpoint.label}
                    href={endpoint.href}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-quantum-cyan/30 hover:bg-black/30"
                  >
                    <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">{endpoint.label}</p>
                    <p className="mt-3 break-all text-sm font-medium text-white">{endpoint.href}</p>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-obsidian-700/60 px-6 py-16">
          <div className="mx-auto max-w-5xl rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(0,229,255,0.16),transparent_28%),linear-gradient(180deg,rgba(15,23,42,0.95),rgba(2,6,23,1))] p-8 text-center shadow-2xl shadow-black/25 md:p-10">
            <Badge className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">Síntese comercial</Badge>
            <h2 className="mt-4 text-3xl font-black text-white md:text-5xl">O NPP é a resposta para quem não quer apenas entrar — quer operar com método, escala e recorrência</h2>
            <p className="mx-auto mt-5 max-w-3xl text-sm leading-8 text-slate-300 md:text-base">
              Se o prospect está em dúvida, a decisão costuma depender de uma pergunta central: “essa ferramenta vai só me dar acesso ou vai realmente me ajudar a operar melhor?”. O NPP existe para responder essa pergunta com clareza. Ele amplia o potencial do ecossistema Nexus ao transformar ativação em estrutura, rotina em sistema e interesse em contratação recorrente.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/subscriptions"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-quantum-lime to-quantum-cyan px-6 py-3 text-sm font-semibold text-obsidian shadow-lg shadow-quantum-lime/20 transition hover:opacity-90"
              >
                Ver planos do Nexus Partners Pack
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/cadastro"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Começar pelo ecossistema Nexus
                <Zap className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
