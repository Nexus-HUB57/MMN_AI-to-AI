export type PartnersRuntimeMode = "dedicated_openai" | "shared_openai" | "gemini" | "fallback";

export interface PartnersRuntimeOverview {
  primaryProvider: PartnersRuntimeMode;
  ready: boolean;
  apiStandard: "OpenAPI 3.1.1";
  isolationLevel: "tenant_dedicated" | "shared_stack" | "fallback";
  usingDedicatedKey: boolean;
  model: string;
  fallbackOrder: string[];
  features: {
    chatbot: boolean;
    audit: boolean;
    apiBindings: boolean;
    onboardingWizard: boolean;
    openApiGateway: boolean;
  };
  safeguards: string[];
}

export interface PartnersOnboardingBlueprint {
  product: string;
  entryFlow: string;
  optionalEnterpriseTrack: string;
  steps: Array<{
    id: string;
    label: string;
    description: string;
    route: string;
    required: boolean;
  }>;
  operationalReadiness: string[];
}

function env(name: string) {
  return process.env[name]?.trim() || "";
}

export function getPartnersRuntimeOverview(): PartnersRuntimeOverview {
  const explicitProvider = env("NEXUS_PARTNERS_RUNTIME_PROVIDER").toLowerCase();
  const dedicatedOpenAiKey = env("NEXUS_PARTNERS_OPENAI_API_KEY");
  const sharedOpenAiKey = env("OPENAI_API_KEY");
  const geminiKey = env("GEMINI_API_KEY");

  let primaryProvider: PartnersRuntimeMode = "fallback";
  if (explicitProvider === "gemini" && geminiKey) {
    primaryProvider = "gemini";
  } else if (dedicatedOpenAiKey) {
    primaryProvider = "dedicated_openai";
  } else if (sharedOpenAiKey) {
    primaryProvider = "shared_openai";
  } else if (geminiKey) {
    primaryProvider = "gemini";
  }

  const usingDedicatedKey = primaryProvider === "dedicated_openai";
  const isolationLevel = usingDedicatedKey
    ? "tenant_dedicated"
    : primaryProvider === "fallback"
      ? "fallback"
      : "shared_stack";

  const model =
    env("NEXUS_PARTNERS_OPENAI_MODEL") ||
    env("NEXUS_PARTNERS_RUNTIME_MODEL") ||
    env("OPENAI_MODEL") ||
    (primaryProvider === "gemini" ? "gemini-1.5-pro" : "gpt-4.1-mini");

  const fallbackOrder = [
    primaryProvider,
    primaryProvider === "dedicated_openai" ? "shared_openai" : "dedicated_openai",
    "gemini",
    "fallback",
  ].filter((value, index, array) => value !== "fallback" || primaryProvider === "fallback" || index === array.length - 1)
    .filter((value, index, array) => array.indexOf(value) === index);

  return {
    primaryProvider,
    ready: primaryProvider !== "fallback",
    apiStandard: "OpenAPI 3.1.1",
    isolationLevel,
    usingDedicatedKey,
    model,
    fallbackOrder,
    features: {
      chatbot: true,
      audit: true,
      apiBindings: true,
      onboardingWizard: true,
      openApiGateway: true,
    },
    safeguards: [
      "API keys isoladas por ambiente/tenant",
      "Fallback controlado de provedores",
      "Auditoria do gateway OpenAPI",
      "Idempotência para mutações críticas",
      "Rate limit por tenant e trilha de acesso por módulo",
    ],
  };
}

export function getPartnersOnboardingBlueprint(): PartnersOnboardingBlueprint {
  return {
    product: "Nexus Partners Pack",
    entryFlow: "Pack A² → Agente IA → Loja → Oferta SaaS opcional",
    optionalEnterpriseTrack: "Nexus Partners Pack via assinatura Start, Growth ou Enterprise",
    steps: [
      {
        id: "affiliate_account",
        label: "Conta e dashboard base",
        description: "Criar conta, validar identidade operacional e acessar o dashboard inicial do ecossistema.",
        route: "/dashboard",
        required: true,
      },
      {
        id: "pack_a2",
        label: "Ativar Pack A²",
        description: "Liberar a porta de entrada oficial da jornada do afiliado e sincronizar os primeiros ativos comerciais.",
        route: "/pix/checkout?pack=pack-a2",
        required: true,
      },
      {
        id: "agent_runtime",
        label: "Liberar Agente IA",
        description: "Habilitar o agente principal para operação comercial, execução de skills e primeiros workflows.",
        route: "/agents",
        required: true,
      },
      {
        id: "storefront",
        label: "Publicar loja e operação",
        description: "Preparar catálogo, links e vitrine para compartilhamento e captação das primeiras vendas.",
        route: "/minha-loja",
        required: true,
      },
      {
        id: "partners_subscription",
        label: "Avaliar trilha SaaS Partners",
        description: "Subir para a camada opcional do Nexus Partners Pack quando houver aderência comercial e operação mais madura.",
        route: "/subscriptions",
        required: false,
      },
      {
        id: "partners_console",
        label: "Operar painel Partners + OpenAPI",
        description: "Gerir parceiros, runtime dedicado, bindings externos e o gateway OpenAPI enterprise.",
        route: "/partners",
        required: false,
      },
    ],
    operationalReadiness: [
      "Checklist unificado para entrada do afiliado",
      "Separação explícita entre Pack A² e SaaS Partners",
      "Runtime dedicado preparado para OpenAI isolada",
      "Gateway OpenAPI pronto para integrações corporativas",
    ],
  };
}
