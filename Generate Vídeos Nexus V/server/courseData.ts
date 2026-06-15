// Course modules data structure
export const courseModules = {
  Fundamental: [
    { id: "00-boas-vindas", title: "00 · Boas-vindas ao Nexus", description: "Introdução ao Nexus Affil'IA'te" },
    { id: "01-entendendo-ioaid", title: "01 · Entendendo o IOAID", description: "Infraestrutura Operacional de Inteligência Distribuída" },
    { id: "02-sistema-sho", title: "02 · Sistema SHO", description: "Sistema Híbrido de Orquestração" },
    { id: "03-painel-afiliado", title: "03 · Painel do Afiliado", description: "Dominando o painel Nexus" },
  ],
  Agente: [
    { id: "00-primeiro-agente", title: "00 · Seu primeiro agente", description: "Criando seu primeiro agente funcional" },
    { id: "01-skills-essenciais", title: "01 · Skills Essenciais", description: "Skills operacionais base" },
    { id: "02-disparo-whatsapp", title: "02 · Disparo WhatsApp", description: "Automatizando disparos via WhatsApp" },
    { id: "03-judge-revisor", title: "03 · Judge Revisor", description: "Configurando o Judge para conformidade" },
  ],
  Master: [
    { id: "00-otimizacao-conversao", title: "00 · Otimização de Conversão", description: "Otimizando cada elo do funil" },
    { id: "01-funis-lifecycle", title: "01 · Funis e Lifecycle", description: "Jornada contínua do cliente" },
    { id: "02-ab-test-judge", title: "02 · A/B Testing com Judge", description: "Validação inteligente de estratégias" },
    { id: "03-coortes-churn", title: "03 · Análise de Coortes e Churn", description: "Entendendo retenção e churn" },
  ],
  Elite: [
    { id: "00-blueprints-elite", title: "00 · Blueprints Elite", description: "Templates de implementação avançada" },
    { id: "01-multi-tenant-whitelabel", title: "01 · Multi-tenant e White-label", description: "Oferecendo Nexus como seu SaaS" },
    { id: "02-federacao-agentes", title: "02 · Federação de Agentes", description: "Agentes colaborando entre máquinas" },
  ],
};

export type CourseLevel = keyof typeof courseModules;
export type PersonaType = "Ive" | "Alencar" | "dupla";

// Persona guidelines
export const personaGuidelines = {
  Ive: {
    name: "Sra. Nexus Ive",
    description: "Figura matriarcal, estratégica, acolhedora e autoritária",
    voice: "Serena, articulada e tranquilizadora",
    style: "Serenidade com autoridade, toque sensual atraente, sotaque sulista leve",
    role: "Mediadora, voz da ponderação e visão estratégica",
  },
  Alencar: {
    name: "Sir. Nexus Alencar",
    description: "Figura técnica, prática e profunda",
    voice: "Serena, acolhedora e autoritária",
    style: "Profundidade técnica, análise de dados, visão prática",
    role: "Instrutor técnico, análise de dados e soluções baseadas em experiência",
  },
  dupla: {
    name: "Sra. Nexus Ive e Sir. Nexus Alencar",
    description: "Dupla em harmonia profissional com cumplicidade implícita",
    voice: "Complementaridade entre serenidade e profundidade",
    style: "Harmonia profissional, respeito mútuo, desejo de interação",
    role: "Co-apresentadores que complementam e constroem juntos",
  },
};
