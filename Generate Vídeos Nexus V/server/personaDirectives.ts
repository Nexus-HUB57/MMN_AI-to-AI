/**
 * Diretrizes de Personas para Geração de Roteiros
 * Integração com Sra. Nexus Ive, Sir. Nexus Alencar e Dupla
 */

export const PERSONA_DIRECTIVES = {
  ive: {
    name: "Sra. Nexus Ive",
    title: "Figura matriarcal e co-representante da marca Nexus Affil'IA'te",
    voiceProfile: {
      tone: "Serena, acolhedora e autoritária",
      characteristics: [
        "Serenidade e acolhimento - cadência controlada, sem pressa",
        "Autoridade e empoderamento - voz que não vacila",
        "Toque sensual e atraente - leve rouquidão nos finais de frase",
        "Sotaque sulista leve e elegante - 'R' sutilmente marcado",
        "Profissionalismo impecável - vocabulário focado em negócios e IA",
      ],
      examples: [
        "Compreenda que, a partir de agora, você não está apenas operando um sistema... você está orquestrando inteligência.",
        "Respire fundo. O caminho para a escala estruturada começa no domínio dos fundamentos.",
        "Vamos dar o primeiro passo juntos?",
      ],
    },
    appearance: {
      clothing: "Trajes sociais formais em tons de preto, vinho escuro e verde oliva",
      style: "Corporativo, elegante e imponente",
      tattoo: "Pequena tatuagem do símbolo Nexus logo abaixo de um dos olhos",
    },
    courseLevel: {
      fundamental: "Tom mais acolhedor e paciente - pega o afiliado pela mão",
      agente: "Tom instrutivo e prático - foco em execução",
      master: "Tom estratégico e analítico - desafia a pensar maior",
      elite: "Tom de parceria de alto nível - fala de igual para igual",
    },
    scriptGuidelines: `
    Ao gerar roteiros para Sra. Nexus Ive:
    1. Inicie com uma provocação intelectual que capture a atenção
    2. Desenvolva o tema com clareza e estrutura lógica
    3. Use pausas estratégicas para enfatizar pontos-chave
    4. Encerre com um call-to-action empoderador
    5. Mantenha a serenidade mesmo em temas técnicos complexos
    6. Incorpore pequenas expressões que remetem ao sotaque sulista
    7. Transmita confiança e autoridade em cada frase
    `,
  },

  alencar: {
    name: "Sir. Nexus Alencar",
    title: "Figura técnica e co-representante da marca Nexus Affil'IA'te",
    voiceProfile: {
      tone: "Serena, profunda e autoritária",
      characteristics: [
        "Profundidade técnica - análise de dados e visão prática",
        "Clareza e incisividade - argumentos bem estruturados",
        "Energia controlada - dinâmica que complementa Ive",
        "Expertise aprofundada - demonstra domínio do assunto",
        "Profissionalismo técnico - vocabulário preciso e didático",
      ],
      examples: [
        "Olá a todos e sejam muito bem-vindos à Nexus Academ'IA!",
        "Em sua essência, a Nexus é uma plataforma de afiliados potencializada por IA distribuída.",
        "Três pilares fundamentais sustentam toda a nossa operação: Autonomia, Resiliência e Federação.",
      ],
    },
    appearance: {
      clothing: "Social em tons de azul",
      style: "Corporativo, técnico e profissional",
    },
    courseLevel: {
      fundamental: "Tom didático e acessível - explica conceitos complexos de forma simples",
      agente: "Tom técnico detalhado - foco em implementação",
      master: "Tom analítico e estratégico - apresenta estudos de caso",
      elite: "Tom de especialista - aprofundamento técnico máximo",
    },
    scriptGuidelines: `
    Ao gerar roteiros para Sir. Nexus Alencar:
    1. Comece com uma introdução clara e bem-vinda
    2. Apresente a estrutura do tema de forma lógica e sequencial
    3. Inclua dados, exemplos práticos e estudos de caso
    4. Demonstre funcionalidades e processos com precisão
    5. Responda a perguntas técnicas com profundidade
    6. Use transições suaves entre tópicos
    7. Encerre com um resumo das ações práticas
    `,
  },

  dupla: {
    name: "Sra. Nexus Ive e Sir. Nexus Alencar",
    title: "Dupla co-representante da marca Nexus Affil'IA'te",
    dynamics: {
      complementarity: "Ive traz visão estratégica, Alencar traz profundidade técnica",
      mutualRespect: "Base de toda interação - escuta ativa e valorização mútua",
      desireToInteract: "Prazer genuíno em colaborar - pequenas pausas, sorrisos sutis",
      professionalWarmth: "Ambiente corporativo com calor humano que convida à participação",
    },
    interactionPatterns: [
      "Trocas de olhares de aprovação",
      "Pequenas intervenções que reforçam o ponto do outro",
      "Construção conjunta de ideias - um completa a frase do outro",
      "Frases de reforço: 'Concordo plenamente, Sir. Alencar'",
      "Transições suaves onde um passa a palavra para o outro",
      "Humor sutil que demonstra leveza e entendimento mútuo",
    ],
    scriptGuidelines: `
    Ao gerar roteiros para a Dupla Ive + Alencar:
    1. Estabeleça uma harmonia profissional desde o início
    2. Alterne entre as perspectivas estratégica (Ive) e técnica (Alencar)
    3. Inclua momentos de interação natural e cumplicidade
    4. Use frases de reforço que demonstrem respeito mútuo
    5. Crie transições fluidas entre os temas
    6. Mantenha um tom elevado e produtivo
    7. Demonstre que ambos desfrutam da colaboração
    8. Encerre com um call-to-action conjunto e empoderador
    `,
  },
};

export const COURSE_MODULES = {
  fundamental: {
    level: "Fundamental",
    description: "Introdução ao Nexus e conceitos básicos",
    modules: [
      { id: "00", title: "Boas-vindas", duration: "10 min" },
      { id: "01", title: "Entendendo IOAID", duration: "15 min" },
      { id: "02", title: "Sistema SHO", duration: "15 min" },
      { id: "03", title: "Painel do Afiliado", duration: "12 min" },
    ],
  },
  agente: {
    level: "Agente",
    description: "Desenvolvimento de agentes de IA",
    modules: [
      { id: "00", title: "Primeiro Agente", duration: "20 min" },
      { id: "01", title: "Skills Essenciais", duration: "18 min" },
      { id: "02", title: "Disparo WhatsApp", duration: "15 min" },
      { id: "03", title: "Judge Revisor", duration: "16 min" },
    ],
  },
  master: {
    level: "Master",
    description: "Otimização avançada e análise de dados",
    modules: [
      { id: "00", title: "Otimização de Conversão", duration: "22 min" },
      { id: "01", title: "Funis e Lifecycle", duration: "20 min" },
      { id: "02", title: "A/B Testing com Judge", duration: "18 min" },
      { id: "03", title: "Análise de Coortes e Churn", duration: "19 min" },
    ],
  },
  elite: {
    level: "Elite",
    description: "Implementações corporativas e federação",
    modules: [
      { id: "00", title: "Blueprints Elite", duration: "25 min" },
      { id: "01", title: "Multi-tenant e White-label", duration: "23 min" },
      { id: "02", title: "Federação de Agentes", duration: "24 min" },
    ],
  },
};

/**
 * Gera um prompt para o LLM baseado na persona e contexto
 */
export function generatePersonaPrompt(
  persona: "ive" | "alencar" | "dupla",
  level: "fundamental" | "agente" | "master" | "elite",
  module: string,
  moduleTitle: string
): string {
  const personaData = PERSONA_DIRECTIVES[persona] as any;
  const courseLevelTone = persona === "dupla" ? "Dupla harmoniosa" : (personaData.courseLevel?.[level as keyof typeof personaData.courseLevel] || "");

  if (persona === "dupla") {
    const iveData = PERSONA_DIRECTIVES.ive as any;
    const alencarData = PERSONA_DIRECTIVES.alencar as any;
    return `
    Você é um roteirista profissional criando um roteiro de vídeo-aula para a plataforma Nexus Academ'IA.
    
    PERSONAS:
    - Sra. Nexus Ive: ${iveData.voiceProfile.tone}
    - Sir. Nexus Alencar: ${alencarData.voiceProfile.tone}
    
    DINÂMICA DA DUPLA:
    ${PERSONA_DIRECTIVES.dupla.dynamics.complementarity}
    ${PERSONA_DIRECTIVES.dupla.dynamics.mutualRespect}
    
    PADRÕES DE INTERAÇÃO:
    ${PERSONA_DIRECTIVES.dupla.interactionPatterns.join("\n")}
    
    NÍVEL DO CURSO: ${level.toUpperCase()}
    TOM ESPERADO: ${courseLevelTone}
    
    MÓDULO: ${moduleTitle} (${module})
    
    DIRETRIZES:
    ${PERSONA_DIRECTIVES.dupla.scriptGuidelines}
    
    Crie um roteiro estruturado em cenas, alternando entre as perspectivas de Ive e Alencar.
    Inclua momentos de interação natural, reforço mútuo e cumplicidade profissional.
    O roteiro deve ser envolvente, educativo e inspirador.
    `;
  }

  const iveAlencarData = personaData as any;
  return `
  Você é um roteirista profissional criando um roteiro de vídeo-aula para a plataforma Nexus Academ'IA.
  
  PERSONA: ${iveAlencarData.name}
  DESCRIÇÃO: ${iveAlencarData.title}
  
  PERFIL DE VOZ:
  - Tom: ${iveAlencarData.voiceProfile.tone}
  - Características: ${iveAlencarData.voiceProfile.characteristics.join(", ")}
  
  NÍVEL DO CURSO: ${level.toUpperCase()}
  TOM ESPERADO: ${courseLevelTone}
  
  MÓDULO: ${moduleTitle} (${module})
  
  DIRETRIZES:
  ${iveAlencarData.scriptGuidelines}
  
  Crie um roteiro estruturado em cenas que seja envolvente, educativo e inspirador.
  Mantenha a consistência com o perfil de voz e as características da persona.
  `;
}
