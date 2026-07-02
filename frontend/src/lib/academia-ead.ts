/**
 * Nexus Academ'IA · EAD Engine
 * Sistema completo de cursos, treinamentos, webinars, playbooks, Lab e Lib
 * com gating por nível, player de vídeo e viewer de PDF.
 */

import type { AcademiaTierId } from "@/lib/nexus-academia";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ContentType = "curso" | "treinamento" | "webinar" | "playbook" | "lab" | "lib";
export type LevelSlug = "fundamental" | "iniciante" | "agente" | "operador" | "master" | "elite";

export interface EADLesson {
  id: string;
  title: string;
  subtitle?: string;
  duration: string;
  type: ContentType;
  level: LevelSlug;
  requiredTier: AcademiaTierId;
  description: string;
  /** URL pública do vídeo (YouTube embed ou direto) */
  videoUrl?: string;
  /** URL pública do PDF da apostila */
  pdfUrl?: string;
  /** Caminho relativo no repositório para conteúdo .md */
  mdPath?: string;
  tags: string[];
  completed?: boolean;
  new?: boolean;
}

export interface EADSection {
  slug: ContentType;
  icon: string;
  title: string;
  subtitle: string;
  countLabel: string;
  description: string;
  requiredTier: AcademiaTierId;
  color: string;
  badgeTone: string;
  lessons: EADLesson[];
}

export interface EADLessonOverride {
  lessonId: string;
  sectionSlug?: ContentType;
  title?: string;
  subtitle?: string;
  duration?: string;
  description?: string;
  level?: LevelSlug;
  requiredTier?: AcademiaTierId;
  videoUrl?: string;
  pdfUrl?: string;
  mdPath?: string;
  thumbnailUrl?: string;
  tags?: string[];
  isPublished?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
  notes?: string;
  updatedAt?: string;
  updatedBy?: string;
}

// ---------------------------------------------------------------------------
// Cursos e Trilhas — 4 Níveis Oficiais
// ---------------------------------------------------------------------------

const CURSOS: EADLesson[] = [
  // --- Fundamental ---
  {
    id: "fund-00",
    title: "00 · Boas-vindas ao Nexus",
    subtitle: "Onboarding completo da plataforma",
    duration: "15min",
    type: "curso",
    level: "fundamental",
    requiredTier: "iniciante",
    description: "Visão geral do ecossistema Nexus, IOAID, SHO e o painel de afiliado. Ponto de partida obrigatório.",
    videoUrl: 'https://oneverso.com.br/academia/videos/mod00-boas-vindas.mp4',
    pdfUrl: "",
    mdPath: "AcademIA/cursos/fundamental/00-boas-vindas.md",
    tags: ["onboarding", "boas-vindas", "ioaid"],
  },
  {
    id: "fund-01",
    title: "01 · Entendendo o IOAID",
    subtitle: "Infraestrutura Operacional de IA",
    duration: "20min",
    type: "curso",
    level: "fundamental",
    requiredTier: "iniciante",
    description: "Os 5 módulos centrais que movem o ecossistema Nexus e como eles se integram.",
    videoUrl: 'https://oneverso.com.br/academia/videos/mod01-entendendo-ioaid.mp4',
    pdfUrl: "",
    mdPath: "AcademIA/cursos/fundamental/01-entendendo-ioaid.md",
    tags: ["ioaid", "arquitetura", "modulos"],
  },
  {
    id: "fund-02",
    title: "02 · Sistema SHO",
    subtitle: "Orquestração Híbrida de Agentes",
    duration: "15min",
    type: "curso",
    level: "fundamental",
    requiredTier: "iniciante",
    description: "Quando o agente age sozinho vs. quando pede aprovação. Governança e autonomia.",
    videoUrl: 'https://oneverso.com.br/academia/videos/mod02-sistema-sho.mp4',
    pdfUrl: "",
    mdPath: "AcademIA/cursos/fundamental/02-sistema-sho.md",
    tags: ["sho", "agentes", "autonomia"],
  },
  {
    id: "fund-03",
    title: "03 · Painel do Afiliado",
    subtitle: "As 7 telas essenciais do dia a dia",
    duration: "20min",
    type: "curso",
    level: "fundamental",
    requiredTier: "iniciante",
    description: "Navegação completa pelo painel: comissões, rede, calendário, vitrine e configurações.",
    videoUrl: 'https://oneverso.com.br/academia/videos/mod03-painel-afiliado.mp4',
    pdfUrl: "",
    mdPath: "AcademIA/cursos/fundamental/03-painel-afiliado.md",
    tags: ["painel", "afiliado", "navegacao"],
  },
  // --- Agente ---
  {
    id: "agent-00",
    title: "00 · Primeiro Agente",
    subtitle: "Setup completo do agente pessoal",
    duration: "30min",
    type: "curso",
    level: "agente",
    requiredTier: "operador",
    description: "Criação, configuração e ativação do seu primeiro agente IA no ecossistema Nexus.",
    videoUrl: 'https://oneverso.com.br/academia/videos/mod00-primeiro-agente.mp4',
    pdfUrl: "",
    mdPath: "AcademIA/cursos/agente/00-primeiro-agente.md",
    tags: ["agente", "setup", "runtime"],
  },
  {
    id: "agent-01",
    title: "01 · Skills Essenciais",
    subtitle: "As 18 skills operacionais base",
    duration: "25min",
    type: "curso",
    level: "agente",
    requiredTier: "operador",
    description: "Catálogo das skills base, como ativá-las e monitorar entitlement no painel.",
    videoUrl: 'https://oneverso.com.br/academia/videos/mod01-skills-essenciais.mp4',
    pdfUrl: "",
    mdPath: "AcademIA/cursos/agente/01-skills-essenciais.md",
    tags: ["skills", "entitlement", "catalogo"],
  },
  {
    id: "agent-02",
    title: "02 · Disparo WhatsApp",
    subtitle: "Campanhas automatizadas com agente",
    duration: "30min",
    type: "curso",
    level: "agente",
    requiredTier: "operador",
    description: "Configurar fluxos de disparo, segmentação e automação de WhatsApp via runtime.",
    videoUrl: 'https://oneverso.com.br/academia/videos/mod02-disparo-whatsapp.mp4',
    pdfUrl: "",
    mdPath: "AcademIA/cursos/agente/02-disparo-whatsapp.md",
    tags: ["whatsapp", "disparo", "automacao"],
  },
  {
    id: "agent-03",
    title: "03 · Judge Revisor",
    subtitle: "Qualidade e aprovação de conteúdo IA",
    duration: "20min",
    type: "curso",
    level: "agente",
    requiredTier: "operador",
    description: "Como o Judge avalia outputs, calibra scores e garante qualidade antes do envio.",
    videoUrl: 'https://oneverso.com.br/academia/videos/mod03-judge-revisor.mp4',
    pdfUrl: "",
    mdPath: "AcademIA/cursos/agente/03-judge-revisor.md",
    tags: ["judge", "qualidade", "score"],
  },
  // --- Master ---
  {
    id: "master-00",
    title: "00 · Otimização de Conversão",
    subtitle: "Métricas e funis de alta performance",
    duration: "35min",
    type: "curso",
    level: "master",
    requiredTier: "estrategista",
    description: "Framework de otimização contínua: de taxa de abertura a LTV dos afiliados.",
    videoUrl: "",
    pdfUrl: "",
    mdPath: "AcademIA/cursos/master/00-otimizacao-conversao.md",
    tags: ["conversao", "metricas", "otimizacao"],
  },
  {
    id: "master-01",
    title: "01 · Funis e Lifecycle",
    subtitle: "Jornada completa do afiliado",
    duration: "40min",
    type: "curso",
    level: "master",
    requiredTier: "estrategista",
    description: "Construção de funis completos, automação de lifecycle e retenção de rede.",
    videoUrl: "",
    pdfUrl: "",
    mdPath: "AcademIA/cursos/master/01-funis-lifecycle.md",
    tags: ["funis", "lifecycle", "retencao"],
  },
  {
    id: "master-02",
    title: "02 · A/B Testing com Judge",
    subtitle: "Testes controlados e tomada de decisão",
    duration: "30min",
    type: "curso",
    level: "master",
    requiredTier: "estrategista",
    description: "Configurar e analisar testes A/B usando o Judge Revisor como árbitro de qualidade.",
    videoUrl: "",
    pdfUrl: "",
    mdPath: "AcademIA/cursos/master/02-ab-test-judge.md",
    tags: ["ab-test", "dados", "decisao"],
  },
  {
    id: "master-03",
    title: "03 · Coortes e Churn",
    subtitle: "Análise avançada de retenção",
    duration: "35min",
    type: "curso",
    level: "master",
    requiredTier: "estrategista",
    description: "Leitura de tabelas de coorte, identificação de churn e ações corretivas.",
    videoUrl: "",
    pdfUrl: "",
    mdPath: "AcademIA/cursos/master/03-coortes-churn.md",
    tags: ["coortes", "churn", "retencao"],
  },
  // --- Elite ---
  {
    id: "elite-00",
    title: "00 · Blueprints Elite",
    subtitle: "Templates de operação avançada",
    duration: "45min",
    type: "curso",
    level: "elite",
    requiredTier: "elite",
    description: "Blueprints prontos para operações complexas: escalabilidade, governança e gestão de rede.",
    videoUrl: "",
    pdfUrl: "",
    mdPath: "AcademIA/cursos/elite/00-blueprints-elite.md",
    tags: ["blueprints", "elite", "governanca"],
  },
  {
    id: "elite-01",
    title: "01 · Multi-Tenant White-Label",
    subtitle: "Operação em múltiplos tenants",
    duration: "50min",
    type: "curso",
    level: "elite",
    requiredTier: "elite",
    description: "Configurar instâncias white-label, segmentação de tenants e governança multi-conta.",
    videoUrl: "",
    pdfUrl: "",
    mdPath: "AcademIA/cursos/elite/01-multi-tenant-whitelabel.md",
    tags: ["white-label", "multi-tenant", "enterprise"],
  },
  {
    id: "elite-02",
    title: "02 · Federação de Agentes",
    subtitle: "Rede distribuída de agentes IA",
    duration: "60min",
    type: "curso",
    level: "elite",
    requiredTier: "elite",
    description: "Arquitetura Zero-Trust para federação de agentes entre nós independentes.",
    videoUrl: "",
    pdfUrl: "",
    mdPath: "AcademIA/cursos/elite/02-federacao-agentes.md",
    tags: ["federacao", "zero-trust", "distribuido"],
  },
];

// ---------------------------------------------------------------------------
// Treinamentos — Workshops Gravados
// ---------------------------------------------------------------------------

const TREINAMENTOS: EADLesson[] = [
  {
    id: "ws-01",
    title: "WS-01 · Oficina de Copy Persuasivo",
    subtitle: "Copy que converte em qualquer canal",
    duration: "120min",
    type: "treinamento",
    level: "agente",
    requiredTier: "operador",
    description: "Framework PAS, AIDA e BAB aplicados ao seu produto. Geração de 3 variações A/B prontas para produção.",
    videoUrl: "",
    pdfUrl: "",
    mdPath: "AcademIA/treinamentos/WS-01-oficina-copy-persuasivo.md",
    tags: ["copy", "pas", "aida", "bab"],
    new: true,
  },
  {
    id: "ws-02",
    title: "WS-02 · Oficina de Funil Completo",
    subtitle: "Do topo à conversão com automação",
    duration: "150min",
    type: "treinamento",
    level: "agente",
    requiredTier: "operador",
    description: "Construção de um funil completo com WhatsApp, e-mail e landing page monitorados pelo agente.",
    videoUrl: "",
    pdfUrl: "",
    mdPath: "AcademIA/treinamentos/WS-02-oficina-funil-completo.md",
    tags: ["funil", "automacao", "whatsapp"],
  },
  {
    id: "ws-03",
    title: "WS-03 · Oficina de Webhook & Integração",
    subtitle: "Conecte qualquer plataforma ao Nexus",
    duration: "90min",
    type: "treinamento",
    level: "master",
    requiredTier: "estrategista",
    description: "Configuração de webhooks para Hotmart, Shopee, Mercado Livre e plataformas customizadas.",
    videoUrl: "",
    pdfUrl: "",
    mdPath: "AcademIA/treinamentos/WS-03-oficina-webhook-integracao.md",
    tags: ["webhook", "hotmart", "integracao"],
  },
];

// ---------------------------------------------------------------------------
// Webinars — Eventos e Lançamentos
// ---------------------------------------------------------------------------

const WEBINARS: EADLesson[] = [
  {
    id: "wb-2026-01",
    title: "WB-01 · Lançamento do IOAID",
    subtitle: "Apresentação oficial da infraestrutura",
    duration: "90min",
    type: "webinar",
    level: "fundamental",
    requiredTier: "iniciante",
    description: "Evento de lançamento do IOAID com demo ao vivo, casos de uso e roadmap Q2-Q4 2026. NPS: 78.",
    videoUrl: "",
    pdfUrl: "",
    mdPath: "AcademIA/webinars/WB-2026-01-lancamento-ioaid.md",
    tags: ["lancamento", "ioaid", "roadmap"],
  },
  {
    id: "wb-2026-02",
    title: "WB-02 · SHO em Produção",
    subtitle: "Cases reais de orquestração autônoma",
    duration: "75min",
    type: "webinar",
    level: "agente",
    requiredTier: "operador",
    description: "Sessão técnica com afiliados avançados apresentando resultados reais do SHO em ambiente de produção.",
    videoUrl: "",
    pdfUrl: "",
    mdPath: "AcademIA/webinars/WB-2026-02-sho-em-producao.md",
    tags: ["sho", "producao", "cases"],
  },
  {
    id: "wb-2026-03",
    title: "WB-03 · Academ'IA Open House",
    subtitle: "Apresentação do HUB educacional",
    duration: "60min",
    type: "webinar",
    level: "fundamental",
    requiredTier: "iniciante",
    description: "Apresentação completa da Academ'IA: trilhas, Lab Nexus, Lib Nexus e como a progressão funciona.",
    videoUrl: "",
    pdfUrl: "",
    mdPath: "AcademIA/webinars/WB-2026-03-academia-open-house.md",
    tags: ["open-house", "academia", "trilhas"],
    new: true,
  },
];

// ---------------------------------------------------------------------------
// Playbooks — Operação Guiada
// ---------------------------------------------------------------------------

const PLAYBOOKS: EADLesson[] = [
  {
    id: "pb-crise-autonomia",
    title: "PB · Gestão de Crise: Autonomia",
    subtitle: "Protocolo quando o agente age fora do esperado",
    duration: "30min leitura",
    type: "playbook",
    level: "agente",
    requiredTier: "operador",
    description: "Manual passo a passo para identificar, isolar e corrigir comportamentos anômalos do agente.",
    mdPath: "AcademIA/playbooks/PB-CRISES-gestao-crise-autonomia.md",
    tags: ["crise", "autonomia", "protocolo"],
  },
  {
    id: "pb-crise-whatsapp",
    title: "PB · Gestão de Crise: Ban WhatsApp",
    subtitle: "Recuperação de conta banida",
    duration: "20min leitura",
    type: "playbook",
    level: "agente",
    requiredTier: "operador",
    description: "Protocolo de recuperação emergencial após ban de número, incluindo migração de base.",
    mdPath: "AcademIA/playbooks/PB-CRISES-gestao-crise-ban-whatsapp.md",
    tags: ["whatsapp", "ban", "recuperacao"],
  },
  {
    id: "pb-crise-data-loss",
    title: "PB · Gestão de Crise: Data Loss",
    subtitle: "Recuperação de dados críticos",
    duration: "25min leitura",
    type: "playbook",
    level: "master",
    requiredTier: "estrategista",
    description: "Procedimento de recuperação para perda parcial ou total de dados operacionais.",
    mdPath: "AcademIA/playbooks/PB-CRISES-gestao-crise-data-loss.md",
    tags: ["data", "backup", "recuperacao"],
  },
  {
    id: "pb-email-operacao",
    title: "PB · Operação Diária: E-mail",
    subtitle: "Rotina de e-mail marketing com agente",
    duration: "15min leitura",
    type: "playbook",
    level: "agente",
    requiredTier: "operador",
    description: "Checklist e rotina diária para operação de e-mail marketing automatizada pelo agente.",
    mdPath: "AcademIA/playbooks/PB-EMAIL-operacao-diaria.md",
    tags: ["email", "rotina", "automacao"],
  },
  {
    id: "pb-lancamento-7d",
    title: "PB · Lançamento em 7 Dias",
    subtitle: "Sprint de lançamento de produto",
    duration: "45min leitura",
    type: "playbook",
    level: "master",
    requiredTier: "estrategista",
    description: "Calendário de execução para lançamento de produto em 7 dias com agente e automações.",
    mdPath: "AcademIA/playbooks/PB-LANCAMENTO-lancamento-7-dias.md",
    tags: ["lancamento", "7dias", "produto"],
    new: true,
  },
  {
    id: "pb-lgpd",
    title: "PB · LGPD: Direitos do Titular",
    subtitle: "Protocolo de conformidade de dados",
    duration: "20min leitura",
    type: "playbook",
    level: "agente",
    requiredTier: "operador",
    description: "Fluxo de atendimento a solicitações de direitos LGPD: acesso, correção e exclusão.",
    mdPath: "AcademIA/playbooks/PB-LGPD-direitos-titular.md",
    tags: ["lgpd", "conformidade", "dados"],
  },
  {
    id: "pb-whatsapp-operacao",
    title: "PB · Operação Diária: WhatsApp",
    subtitle: "Rotina de disparo com agente",
    duration: "15min leitura",
    type: "playbook",
    level: "agente",
    requiredTier: "operador",
    description: "Checklist e rotina diária para operação de WhatsApp automatizada pelo agente.",
    mdPath: "AcademIA/playbooks/PB-WHATSAPP-operacao-diaria.md",
    tags: ["whatsapp", "rotina", "disparo"],
  },
];

// ---------------------------------------------------------------------------
// Lab Nexus — 38 Ferramentas Categorizadas
// ---------------------------------------------------------------------------

const LAB_NEXUS: EADLesson[] = [
  {
    id: "lab-prompt-copy",
    title: "Prompts de Copywriting",
    subtitle: "Copy persuasivo calibrado para afiliados",
    duration: "Recurso",
    type: "lab",
    level: "agente",
    requiredTier: "operador",
    description: "Biblioteca de prompts testados para geração de copy: headlines, CTAs, scripts de WhatsApp e e-mail.",
    mdPath: "AcademIA/Lab-Nexus/prompts/copywriting",
    tags: ["prompts", "copy", "headlines"],
  },
  {
    id: "lab-prompt-analise",
    title: "Prompts de Análise",
    subtitle: "Prompts para análise de dados e métricas",
    duration: "Recurso",
    type: "lab",
    level: "operador",
    requiredTier: "operador",
    description: "Prompts especializados para leitura de relatórios, interpretação de coortes e diagnóstico de funis.",
    mdPath: "AcademIA/Lab-Nexus/prompts/analise",
    tags: ["prompts", "analise", "dados"],
  },
  {
    id: "lab-prompt-estrategia",
    title: "Prompts de Estratégia",
    subtitle: "Planejamento e tomada de decisão",
    duration: "Recurso",
    type: "lab",
    level: "master",
    requiredTier: "estrategista",
    description: "Prompts para planejamento estratégico, análise de concorrência e definição de roadmap.",
    mdPath: "AcademIA/Lab-Nexus/prompts/estrategia",
    tags: ["prompts", "estrategia", "planejamento"],
  },
  {
    id: "lab-template-email",
    title: "Templates de E-mail",
    subtitle: "Templates HTML prontos para produção",
    duration: "Recurso",
    type: "lab",
    level: "agente",
    requiredTier: "operador",
    description: "Templates de e-mail para boas-vindas, seguimento, reativação e campanhas sazonais.",
    mdPath: "AcademIA/Lab-Nexus/templates/email",
    tags: ["templates", "email", "html"],
  },
  {
    id: "lab-template-landing",
    title: "Templates de Landing Page",
    subtitle: "Páginas de captura e vendas",
    duration: "Recurso",
    type: "lab",
    level: "agente",
    requiredTier: "operador",
    description: "Templates de landing page otimizados para conversão com copy e estrutura prontos.",
    mdPath: "AcademIA/Lab-Nexus/templates/landing",
    tags: ["templates", "landing", "conversao"],
  },
  {
    id: "lab-template-social",
    title: "Templates de Social Media",
    subtitle: "Posts, stories e carrosséis",
    duration: "Recurso",
    type: "lab",
    level: "iniciante",
    requiredTier: "iniciante",
    description: "Templates para Instagram, LinkedIn e TikTok com copy e estrutura visual alinhados ao Nexus.",
    mdPath: "AcademIA/Lab-Nexus/templates/social",
    tags: ["templates", "social", "posts"],
  },
  {
    id: "lab-tools-analytics",
    title: "Ferramentas de Analytics",
    subtitle: "Dashboards e trackers de performance",
    duration: "Recurso",
    type: "lab",
    level: "master",
    requiredTier: "estrategista",
    description: "Configuração de dashboards, trackers e alertas para monitoramento de KPIs em tempo real.",
    mdPath: "AcademIA/Lab-Nexus/tools/analytics",
    tags: ["analytics", "dashboard", "kpi"],
  },
  {
    id: "lab-tools-automation",
    title: "Ferramentas de Automação",
    subtitle: "n8n, Make e integrações nativas",
    duration: "Recurso",
    type: "lab",
    level: "master",
    requiredTier: "estrategista",
    description: "Workflows prontos para n8n e Make para automação de processos comerciais e operacionais.",
    mdPath: "AcademIA/Lab-Nexus/tools/automation",
    tags: ["automacao", "n8n", "make"],
  },
  {
    id: "lab-tools-copy",
    title: "Ferramentas de Copy",
    subtitle: "Geradores e avaliadores de copy",
    duration: "Recurso",
    type: "lab",
    level: "agente",
    requiredTier: "operador",
    description: "Ferramentas de geração, revisão e scoring de copy integradas ao Judge Revisor.",
    mdPath: "AcademIA/Lab-Nexus/tools/copy",
    tags: ["copy", "geradores", "scoring"],
  },
  {
    id: "lab-tools-design",
    title: "Ferramentas de Design",
    subtitle: "Criação visual rápida com IA",
    duration: "Recurso",
    type: "lab",
    level: "iniciante",
    requiredTier: "iniciante",
    description: "Guias e prompts para criação de imagens, banners e identidade visual usando ferramentas IA.",
    mdPath: "AcademIA/Lab-Nexus/tools/design",
    tags: ["design", "ia", "visual"],
  },
  {
    id: "lab-tools-marketing",
    title: "Ferramentas de Marketing",
    subtitle: "Tráfego, campanhas e segmentação",
    duration: "Recurso",
    type: "lab",
    level: "agente",
    requiredTier: "operador",
    description: "Ferramentas para gestão de campanhas pagas, segmentação de audiência e rastreamento de conversão.",
    mdPath: "AcademIA/Lab-Nexus/tools/marketing",
    tags: ["marketing", "trafego", "campanhas"],
  },
  {
    id: "lab-chatbot",
    title: "Chat Bot Multi-IA",
    subtitle: "Hub agregador de Inteligência Artificial",
    duration: "Recurso",
    type: "lab",
    level: "agente",
    requiredTier: "operador",
    description: "Painel único para alternar entre GPT, Claude, Gemini, DeepSeek e MiniMax com histórico e quota.",
    mdPath: "AcademIA/Lab-Nexus/README-CHATBOT.md",
    tags: ["chatbot", "gpt", "claude", "gemini"],
    new: true,
  },
];

// ---------------------------------------------------------------------------
// Lib Nexus — Base Canônica
// ---------------------------------------------------------------------------

const LIB_NEXUS: EADLesson[] = [
  {
    id: "lib-glossario",
    title: "Glossário Nexus",
    subtitle: "Terminologia oficial do ecossistema",
    duration: "Referência",
    type: "lib",
    level: "fundamental",
    requiredTier: "iniciante",
    description: "Glossário completo de termos técnicos, siglas e conceitos do Nexus Affil'IA'te.",
    mdPath: "AcademIA/Lib-Nexus/knowledge-base/00-glossario.md",
    tags: ["glossario", "terminologia", "referencia"],
  },
  {
    id: "lib-ioaid",
    title: "Modelo IOAID",
    subtitle: "Especificação técnica da infraestrutura",
    duration: "Referência",
    type: "lib",
    level: "fundamental",
    requiredTier: "iniciante",
    description: "Documento canônico do modelo IOAID: arquitetura, módulos, contratos e SLAs.",
    mdPath: "AcademIA/Lib-Nexus/knowledge-base/01-modelo-ioaid.md",
    tags: ["ioaid", "arquitetura", "especificacao"],
  },
  {
    id: "lib-taxonomia",
    title: "Taxonomia de Skills",
    subtitle: "Hierarquia e classificação das 45 skills",
    duration: "Referência",
    type: "lib",
    level: "agente",
    requiredTier: "operador",
    description: "Classificação completa das 45 skills por categoria, nível, pré-requisito e course anchor.",
    mdPath: "AcademIA/Lib-Nexus/knowledge-base/02-taxonomia-skills.md",
    tags: ["skills", "taxonomia", "classificacao"],
  },
  {
    id: "lib-lgpd",
    title: "Conformidade LGPD",
    subtitle: "Framework de compliance de dados",
    duration: "Referência",
    type: "lib",
    level: "agente",
    requiredTier: "operador",
    description: "Guia de conformidade LGPD: coleta, processamento, retenção e direitos do titular.",
    mdPath: "AcademIA/Lib-Nexus/knowledge-base/03-conformidade-lgpd.md",
    tags: ["lgpd", "compliance", "dados"],
  },
  {
    id: "lib-agent-base",
    title: "Spec: Agente Base",
    subtitle: "Contrato técnico do agente genérico",
    duration: "Referência",
    type: "lib",
    level: "agente",
    requiredTier: "operador",
    description: "Especificação contratual do agente base: inputs, outputs, limites e comportamento esperado.",
    mdPath: "AcademIA/Lib-Nexus/agents-specs/00-base-agent.md",
    tags: ["agente", "spec", "contrato"],
  },
  {
    id: "lib-agent-marketing",
    title: "Spec: Agente de Marketing",
    subtitle: "Especificação do marketing agent",
    duration: "Referência",
    type: "lib",
    level: "agente",
    requiredTier: "operador",
    description: "Contrato técnico do agente de marketing: skills ativadas, limites de autonomia e hooks.",
    mdPath: "AcademIA/Lib-Nexus/agents-specs/01-marketing-agent.md",
    tags: ["marketing", "agente", "spec"],
  },
  {
    id: "lib-judge",
    title: "Spec: Judge Revisor",
    subtitle: "Motor de qualidade e aprovação",
    duration: "Referência",
    type: "lib",
    level: "master",
    requiredTier: "estrategista",
    description: "Especificação do Judge Revisor: critérios de scoring, thresholds e workflow de aprovação.",
    mdPath: "AcademIA/Lib-Nexus/agents-specs/02-judge-revisor.md",
    tags: ["judge", "qualidade", "scoring"],
  },
  {
    id: "lib-federation-gate",
    title: "Spec: Federation Gate",
    subtitle: "Gateway de federação Zero-Trust",
    duration: "Referência",
    type: "lib",
    level: "elite",
    requiredTier: "elite",
    description: "Especificação do Federation Gate: mTLS, políticas Zero-Trust e controle de federação entre nós.",
    mdPath: "AcademIA/Lib-Nexus/agents-specs/03-federation-gate.md",
    tags: ["federacao", "zero-trust", "gateway"],
  },
  {
    id: "lib-trpc",
    title: "API Docs: tRPC Overview",
    subtitle: "Contrato de API interna",
    duration: "Referência",
    type: "lib",
    level: "agente",
    requiredTier: "operador",
    description: "Documentação da API tRPC: routers, procedures, autenticação e exemplos de uso.",
    mdPath: "AcademIA/Lib-Nexus/api-docs/00-trpc-overview.md",
    tags: ["api", "trpc", "docs"],
  },
  {
    id: "lib-webhooks",
    title: "API Docs: Webhooks",
    subtitle: "Integração bidirecional via webhooks",
    duration: "Referência",
    type: "lib",
    level: "master",
    requiredTier: "estrategista",
    description: "Documentação de webhooks: eventos, payloads, HMAC, circuit breaker e retry policy.",
    mdPath: "AcademIA/Lib-Nexus/api-docs/01-webhooks.md",
    tags: ["webhooks", "integracao", "hmac"],
  },
  {
    id: "lib-rest-public",
    title: "API Docs: REST Pública",
    subtitle: "Nexus Open API v1",
    duration: "Referência",
    type: "lib",
    level: "master",
    requiredTier: "estrategista",
    description: "Documentação da API REST pública: endpoints, autenticação, rate limits e exemplos.",
    mdPath: "AcademIA/Lib-Nexus/api-docs/02-rest-public.md",
    tags: ["api", "rest", "publica"],
  },
  {
    id: "lib-prompt-engineering",
    title: "Best Practice: Prompt Engineering",
    subtitle: "Padrões de engenharia de prompts",
    duration: "Referência",
    type: "lib",
    level: "agente",
    requiredTier: "operador",
    description: "Guia canônico de prompt engineering: estrutura, contexto, exemplos few-shot e avaliação.",
    mdPath: "AcademIA/Lib-Nexus/best-practices/00-prompt-engineering.md",
    tags: ["prompts", "engenharia", "padroes"],
  },
  {
    id: "lib-error-handling",
    title: "Best Practice: Error Handling",
    subtitle: "Tratamento de erros no runtime",
    duration: "Referência",
    type: "lib",
    level: "master",
    requiredTier: "estrategista",
    description: "Padrões de tratamento de erros, fallbacks e graceful degradation no ecossistema Nexus.",
    mdPath: "AcademIA/Lib-Nexus/best-practices/01-error-handling.md",
    tags: ["erros", "fallback", "resilencia"],
  },
  {
    id: "lib-performance",
    title: "Best Practice: Performance",
    subtitle: "Otimização e latência do runtime",
    duration: "Referência",
    type: "lib",
    level: "elite",
    requiredTier: "elite",
    description: "Guia de otimização de performance: caching, filas, paralelismo e redução de latência.",
    mdPath: "AcademIA/Lib-Nexus/best-practices/02-performance.md",
    tags: ["performance", "latencia", "otimizacao"],
  },
];

// ---------------------------------------------------------------------------
// Sections Registry
// ---------------------------------------------------------------------------

export const EAD_SECTIONS: EADSection[] = [
  {
    slug: "curso",
    icon: "🎓",
    title: "Cursos e Trilhas",
    subtitle: "4 NÍVEIS OFICIAIS",
    countLabel: "15 lições",
    description: "Fundamental, Agente, Master e Elite organizados por progressão de acesso.",
    requiredTier: "iniciante",
    color: "from-quantum-cyan/20 to-quantum-purple/10",
    badgeTone: "border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan",
    lessons: CURSOS,
  },
  {
    slug: "treinamento",
    icon: "🎬",
    title: "Treinamentos",
    subtitle: "WORKSHOPS GRAVADOS",
    countLabel: "3 workshops",
    description: "Oficinas práticas com replay, aplicação em campo e exercícios guiados.",
    requiredTier: "operador",
    color: "from-quantum-lime/20 to-quantum-cyan/10",
    badgeTone: "border-quantum-lime/30 bg-quantum-lime/10 text-quantum-lime",
    lessons: TREINAMENTOS,
  },
  {
    slug: "webinar",
    icon: "🚀",
    title: "Webinars",
    subtitle: "EVENTOS E LANÇAMENTOS",
    countLabel: "3 gravações",
    description: "Lançamentos, open house, roadmap e sessões executivas da operação Nexus.",
    requiredTier: "iniciante",
    color: "from-fuchsia-400/20 to-quantum-purple/10",
    badgeTone: "border-fuchsia-400/30 bg-fuchsia-400/10 text-fuchsia-300",
    lessons: WEBINARS,
  },
  {
    slug: "playbook",
    icon: "📋",
    title: "Playbooks",
    subtitle: "OPERAÇÃO GUIADA",
    countLabel: "7 manuais",
    description: "Manuais de crise, campanhas e rotinas para execução orientada por padrões.",
    requiredTier: "operador",
    color: "from-amber-400/20 to-amber-400/5",
    badgeTone: "border-amber-400/30 bg-amber-400/10 text-amber-300",
    lessons: PLAYBOOKS,
  },
  {
    slug: "lab",
    icon: "🧪",
    title: "Lab Nexus",
    subtitle: "38 FERRAMENTAS CATEGORIZADAS",
    countLabel: "12 recursos",
    description: "Prompts, templates, blueprints e workflows com aplicação operacional.",
    requiredTier: "operador",
    color: "from-quantum-lime/20 to-quantum-cyan/5",
    badgeTone: "border-quantum-lime/30 bg-quantum-lime/10 text-quantum-lime",
    lessons: LAB_NEXUS,
  },
  {
    slug: "lib",
    icon: "📚",
    title: "Lib Nexus",
    subtitle: "BASE CANÔNICA",
    countLabel: "14 documentos",
    description: "Knowledge base, specs de agentes, APIs e melhores práticas do ecossistema.",
    requiredTier: "iniciante",
    color: "from-slate-400/20 to-slate-400/5",
    badgeTone: "border-slate-400/30 bg-slate-400/10 text-slate-300",
    lessons: LIB_NEXUS,
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const tierOrder: Record<AcademiaTierId, number> = {
  iniciante: 1,
  operador: 2,
  estrategista: 3,
  elite: 4,
};

export function canAccessLesson(
  userTier: AcademiaTierId,
  lessonRequiredTier: AcademiaTierId
): boolean {
  return tierOrder[userTier] >= tierOrder[lessonRequiredTier];
}

export function buildLessonOverrideMap(items?: EADLessonOverride[] | null) {
  return new Map((items || []).map((item) => [item.lessonId, item]));
}

export function applyLessonOverride(
  lesson: EADLesson,
  override?: EADLessonOverride | null,
): EADLesson & { isPublished: boolean; isFeatured: boolean; notes?: string; sortOrder?: number } {
  if (!override) {
    return {
      ...lesson,
      isPublished: true,
      isFeatured: false,
    };
  }

  return {
    ...lesson,
    title: override.title ?? lesson.title,
    subtitle: override.subtitle ?? lesson.subtitle,
    duration: override.duration ?? lesson.duration,
    description: override.description ?? lesson.description,
    level: override.level ?? lesson.level,
    requiredTier: override.requiredTier ?? lesson.requiredTier,
    videoUrl: override.videoUrl !== undefined ? override.videoUrl : lesson.videoUrl,
    pdfUrl: override.pdfUrl !== undefined ? override.pdfUrl : lesson.pdfUrl,
    mdPath: override.mdPath ?? lesson.mdPath,
    tags: override.tags ?? lesson.tags,
    isPublished: override.isPublished ?? true,
    isFeatured: override.isFeatured ?? false,
    notes: override.notes,
    sortOrder: override.sortOrder,
  };
}

export function getLessonById(
  id: string,
  overrideMap?: Map<string, EADLessonOverride>,
): (EADLesson & { isPublished: boolean; isFeatured: boolean; notes?: string; sortOrder?: number }) | undefined {
  const lesson = [
    ...CURSOS,
    ...TREINAMENTOS,
    ...WEBINARS,
    ...PLAYBOOKS,
    ...LAB_NEXUS,
    ...LIB_NEXUS,
  ].find((l) => l.id === id);

  if (!lesson) return undefined;
  return applyLessonOverride(lesson, overrideMap?.get(id));
}

export function getSectionLessons(
  slug: ContentType,
  userTier: AcademiaTierId,
  overrideMap?: Map<string, EADLessonOverride>,
): (EADLesson & { accessible: boolean; isPublished: boolean; isFeatured: boolean; notes?: string; sortOrder?: number })[] {
  const section = EAD_SECTIONS.find((s) => s.slug === slug);
  if (!section) return [];

  return section.lessons
    .map((lesson) => applyLessonOverride(lesson, overrideMap?.get(lesson.id)))
    .filter((lesson) => lesson.isPublished !== false)
    .sort((a, b) => {
      const orderA = a.sortOrder ?? 9999;
      const orderB = b.sortOrder ?? 9999;
      return orderA - orderB || a.title.localeCompare(b.title);
    })
    .map((l) => ({
      ...l,
      accessible: canAccessLesson(userTier, l.requiredTier),
    }));
}

export const TIER_COLORS: Record<AcademiaTierId, string> = {
  iniciante: "text-quantum-cyan",
  operador: "text-quantum-lime",
  estrategista: "text-amber-300",
  elite: "text-fuchsia-300",
};

export const LEVEL_LABELS: Record<LevelSlug, string> = {
  fundamental: "Fundamental",
  agente: "Agente",
  master: "Master",
  elite: "Elite",
  "iniciante": "Iniciante",
  "operador": "Operador",
};

export const LEVEL_COLORS: Record<LevelSlug, string> = {
  fundamental: "border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan",
  agente: "border-quantum-lime/30 bg-quantum-lime/10 text-quantum-lime",
  master: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  elite: "border-fuchsia-400/30 bg-fuchsia-400/10 text-fuchsia-300",
  "iniciante": "bg-blue-500",
  "operador": "bg-cyan-500",
};

export const REPO_RAW = "https://raw.githubusercontent.com/Nexus-HUB57/MMN_AI-to-AI/main";
export const REPO_BLOB = "https://github.com/Nexus-HUB57/MMN_AI-to-AI/blob/main";
