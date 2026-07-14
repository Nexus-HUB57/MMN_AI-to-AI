export type PartnersRuntimeMode = "dedicated_openai" | "shared_openai" | "gemini" | "fallback";
export type PartnersIsolationLevel = "tenant_dedicated" | "shared_stack" | "fallback";
export type PartnersDeployTarget = "local" | "staging" | "production";

export interface PartnersEndpointCatalog {
  apiBaseUrl: string;
  gatewayRoot: string;
  discoveryUrl: string;
  specUrl: string;
  runtimeUrl: string;
  onboardingUrl: string;
  healthUrl: string;
}

export interface PartnersSecretState {
  name: string;
  configured: boolean;
  required: boolean;
  scope: "runtime" | "gateway" | "deploy";
  purpose: string;
}

export interface PartnersRuntimeOverview {
  primaryProvider: PartnersRuntimeMode;
  ready: boolean;
  apiStandard: "OpenAPI 3.1.1";
  isolationLevel: PartnersIsolationLevel;
  usingDedicatedKey: boolean;
  model: string;
  fallbackOrder: string[];
  endpointCatalog: PartnersEndpointCatalog;
  features: {
    chatbot: boolean;
    audit: boolean;
    apiBindings: boolean;
    onboardingWizard: boolean;
    openApiGateway: boolean;
    runtimeConsole: boolean;
  };
  safeguards: string[];
}

export interface PartnersDeploymentReadiness {
  environment: string;
  target: PartnersDeployTarget;
  readyForDedicatedRuntime: boolean;
  readyForOpenApiSmoke: boolean;
  readyForRollout: boolean;
  secrets: PartnersSecretState[];
  endpoints: PartnersEndpointCatalog;
  rolloutStages: string[];
  recommendedActions: string[];
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

function detectTarget(environment: string): PartnersDeployTarget {
  const value = environment.toLowerCase();
  if (/(prod|production)/.test(value)) return "production";
  if (/(stage|staging|homolog)/.test(value)) return "staging";
  return "local";
}

function getEnvironmentLabel() {
  return env("APP_ENV") || env("NODE_ENV") || env("ENVIRONMENT") || "local";
}

function getEndpointCatalog(): PartnersEndpointCatalog {
  const apiBaseUrl =
    env("NEXUS_PUBLIC_API_BASE_URL") ||
    env("PUBLIC_API_BASE_URL") ||
    env("NEXUS_API_BASE_URL") ||
    "https://api.oneverso.com.br";

  const sanitizedBase = apiBaseUrl.replace(/\/$/, "");
  const gatewayRoot = `${sanitizedBase}/api/v1`;

  return {
    apiBaseUrl: sanitizedBase,
    gatewayRoot,
    discoveryUrl: `${gatewayRoot}/`,
    specUrl: `${gatewayRoot}/openapi.json`,
    runtimeUrl: `${gatewayRoot}/partners/runtime`,
    onboardingUrl: `${gatewayRoot}/partners/onboarding/blueprint`,
    healthUrl: `${sanitizedBase}/health`,
  };
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
  const isolationLevel: PartnersIsolationLevel = usingDedicatedKey
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
  ]
    .filter((value, index, array) => value !== "fallback" || primaryProvider === "fallback" || index === array.length - 1)
    .filter((value, index, array) => array.indexOf(value) === index);

  return {
    primaryProvider,
    ready: primaryProvider !== "fallback",
    apiStandard: "OpenAPI 3.1.1",
    isolationLevel,
    usingDedicatedKey,
    model,
    fallbackOrder,
    endpointCatalog: getEndpointCatalog(),
    features: {
      chatbot: true,
      audit: true,
      apiBindings: true,
      onboardingWizard: true,
      openApiGateway: true,
      runtimeConsole: true,
    },
    safeguards: [
      "API keys isoladas por ambiente/tenant",
      "Fallback controlado de provedores",
      "Auditoria do gateway OpenAPI",
      "Idempotência para mutações críticas",
      "Rate limit por tenant e trilha de acesso por módulo",
      "Segredos exclusivos do Nexus Partners Pack fora do frontend",
    ],
  };
}

export function getPartnersDeploymentReadiness(): PartnersDeploymentReadiness {
  const runtime = getPartnersRuntimeOverview();
  const environment = getEnvironmentLabel();
  const target = detectTarget(environment);

  const secrets: PartnersSecretState[] = [
    {
      name: "NEXUS_PARTNERS_OPENAI_API_KEY",
      configured: Boolean(env("NEXUS_PARTNERS_OPENAI_API_KEY")),
      required: true,
      scope: "runtime",
      purpose: "Chave dedicada do provedor principal do Nexus Partners Pack.",
    },
    {
      name: "NEXUS_PARTNERS_OPENAI_MODEL",
      configured: Boolean(env("NEXUS_PARTNERS_OPENAI_MODEL") || env("NEXUS_PARTNERS_RUNTIME_MODEL")),
      required: false,
      scope: "runtime",
      purpose: "Define o modelo preferencial do runtime dedicado do NPP.",
    },
    {
      name: "NEXUS_OPEN_API_KEY / NEXUS_OPEN_API_KEYS",
      configured: Boolean(env("NEXUS_OPEN_API_KEY") || env("NEXUS_OPEN_API_KEYS")),
      required: true,
      scope: "gateway",
      purpose: "Autenticação do gateway OpenAPI para smoke tests e integrações externas.",
    },
    {
      name: "NEXUS_PUBLIC_API_BASE_URL",
      configured: Boolean(env("NEXUS_PUBLIC_API_BASE_URL") || env("PUBLIC_API_BASE_URL") || env("NEXUS_API_BASE_URL")),
      required: false,
      scope: "gateway",
      purpose: "Origem pública utilizada pelo console para discovery, spec e health do gateway.",
    },
    {
      name: "BACKEND_DEPLOY_HOOK_URL / RENDER_DEPLOY_HOOK_URL",
      configured: Boolean(env("BACKEND_DEPLOY_HOOK_URL") || env("RENDER_DEPLOY_HOOK_URL")),
      required: false,
      scope: "deploy",
      purpose: "Acionamento automatizado de rollout do backend.",
    },
  ];

  const readyForDedicatedRuntime = secrets
    .filter((item) => item.scope === "runtime" && item.required)
    .every((item) => item.configured);

  const readyForOpenApiSmoke = secrets
    .filter((item) => item.scope === "gateway" && item.required)
    .every((item) => item.configured);

  const readyForRollout = readyForDedicatedRuntime && readyForOpenApiSmoke;

  const recommendedActions = [
    readyForDedicatedRuntime
      ? "Runtime dedicado identificado para o NPP."
      : "Provisionar a secret NEXUS_PARTNERS_OPENAI_API_KEY no backend/Actions antes do rollout.",
    readyForOpenApiSmoke
      ? "Gateway OpenAPI possui credencial disponível para smoke tests."
      : "Registrar NEXUS_OPEN_API_KEY ou NEXUS_OPEN_API_KEYS com acesso ao módulo partners.",
    runtime.usingDedicatedKey
      ? "Manter a chave dedicada isolada do OPENAI_API_KEY compartilhado."
      : "Promover o NPP para chave dedicada e evitar dependência permanente do provider compartilhado.",
    target === "production"
      ? "Executar smoke tests pós-deploy em produção com runtime + onboarding blueprint."
      : "Validar primeiro em staging/homolog antes do cutover final.",
  ];

  return {
    environment,
    target,
    readyForDedicatedRuntime,
    readyForOpenApiSmoke,
    readyForRollout,
    secrets,
    endpoints: runtime.endpointCatalog,
    rolloutStages: [
      "validar secrets e provider dedicado",
      "build backend/frontend com checagem de regressão",
      "acionar deploy hook ou pipeline alvo",
      "executar smoke tests do discovery + openapi + runtime + blueprint",
    ],
    recommendedActions,
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
