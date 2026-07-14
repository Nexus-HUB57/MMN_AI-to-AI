import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Activity, CheckCircle2, ExternalLink, KeyRound, Rocket, ShieldCheck, TriangleAlert, Workflow, Wrench } from "lucide-react";

type RuntimeOverview = {
  primaryProvider: string;
  ready: boolean;
  apiStandard: string;
  isolationLevel: string;
  usingDedicatedKey: boolean;
  model: string;
  fallbackOrder: string[];
  endpointCatalog?: {
    apiBaseUrl: string;
    gatewayRoot: string;
    discoveryUrl: string;
    specUrl: string;
    runtimeUrl: string;
    onboardingUrl: string;
    healthUrl: string;
  };
  safeguards: string[];
};

type DeploymentReadiness = {
  environment: string;
  target: string;
  readyForDedicatedRuntime: boolean;
  readyForOpenApiSmoke: boolean;
  readyForRollout: boolean;
  secrets: Array<{
    name: string;
    configured: boolean;
    required: boolean;
    scope: "runtime" | "gateway" | "deploy";
    purpose: string;
  }>;
  endpoints: {
    apiBaseUrl: string;
    gatewayRoot: string;
    discoveryUrl: string;
    specUrl: string;
    runtimeUrl: string;
    onboardingUrl: string;
    healthUrl: string;
  };
  rolloutStages: string[];
  recommendedActions: string[];
};

const FALLBACK_RUNTIME: RuntimeOverview = {
  primaryProvider: "fallback",
  ready: false,
  apiStandard: "OpenAPI 3.1.1",
  isolationLevel: "fallback",
  usingDedicatedKey: false,
  model: "gpt-4.1-mini",
  fallbackOrder: ["dedicated_openai", "shared_openai", "gemini", "fallback"],
  endpointCatalog: {
    apiBaseUrl: "https://api.oneverso.com.br",
    gatewayRoot: "https://api.oneverso.com.br/api/v1",
    discoveryUrl: "https://api.oneverso.com.br/api/v1/",
    specUrl: "https://api.oneverso.com.br/api/v1/openapi.json",
    runtimeUrl: "https://api.oneverso.com.br/api/v1/partners/runtime",
    onboardingUrl: "https://api.oneverso.com.br/api/v1/partners/onboarding/blueprint",
    healthUrl: "https://api.oneverso.com.br/health",
  },
  safeguards: [
    "API keys isoladas por ambiente/tenant",
    "Fallback controlado de provedores",
    "Auditoria do gateway OpenAPI",
  ],
};

const FALLBACK_READINESS: DeploymentReadiness = {
  environment: "local",
  target: "local",
  readyForDedicatedRuntime: false,
  readyForOpenApiSmoke: false,
  readyForRollout: false,
  secrets: [
    {
      name: "NEXUS_PARTNERS_OPENAI_API_KEY",
      configured: false,
      required: true,
      scope: "runtime",
      purpose: "Chave dedicada do provider principal do NPP.",
    },
    {
      name: "NEXUS_OPEN_API_KEY / NEXUS_OPEN_API_KEYS",
      configured: false,
      required: true,
      scope: "gateway",
      purpose: "Credencial do gateway OpenAPI para smoke tests e integrações.",
    },
  ],
  endpoints: FALLBACK_RUNTIME.endpointCatalog!,
  rolloutStages: [
    "validar secrets e provider dedicado",
    "build backend/frontend com checagem de regressão",
    "acionar deploy hook ou pipeline alvo",
    "executar smoke tests do discovery + openapi + runtime + blueprint",
  ],
  recommendedActions: [
    "Provisionar as secrets do runtime dedicado fora do frontend.",
    "Configurar credencial do gateway OpenAPI com acesso ao módulo partners.",
  ],
};

function StatusBadge({ ok, label }: { ok: boolean; label: string }) {
  return ok ? (
    <Badge className="border border-emerald-400/30 bg-emerald-400/10 text-emerald-300">{label}</Badge>
  ) : (
    <Badge className="border border-amber-400/30 bg-amber-400/10 text-amber-200">{label}</Badge>
  );
}

export default function PartnersRuntimeConsole() {
  const runtimeQuery = (trpc as any)?.partnersDelivery?.runtimeOverview?.useQuery?.(undefined, { staleTime: 60_000 });
  const readinessQuery = (trpc as any)?.partnersDelivery?.deploymentReadiness?.useQuery?.(undefined, { staleTime: 60_000 });

  const runtime = (runtimeQuery?.data ?? FALLBACK_RUNTIME) as RuntimeOverview;
  const readiness = (readinessQuery?.data ?? FALLBACK_READINESS) as DeploymentReadiness;

  const summary = useMemo(
    () => [
      {
        label: "Provider principal",
        value: runtime.primaryProvider,
        icon: Activity,
      },
      {
        label: "Modelo",
        value: runtime.model,
        icon: Wrench,
      },
      {
        label: "Isolamento",
        value: runtime.isolationLevel,
        icon: ShieldCheck,
      },
      {
        label: "Ambiente alvo",
        value: `${readiness.target} · ${readiness.environment}`,
        icon: Rocket,
      },
    ],
    [readiness.environment, readiness.target, runtime.isolationLevel, runtime.model, runtime.primaryProvider],
  );

  return (
    <section className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-white/10 bg-white/5 backdrop-blur">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">Console Runtime + OpenAPI</Badge>
              <StatusBadge ok={runtime.ready} label={runtime.ready ? "runtime pronto" : "runtime pendente"} />
              <StatusBadge ok={readiness.readyForRollout} label={readiness.readyForRollout ? "rollout pronto" : "rollout parcial"} />
            </div>
            <CardTitle className="text-white">Camada enterprise do Nexus Partners Pack</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-6 text-slate-300">
              Painel visual de prontidão do runtime dedicado, do gateway OpenAPI 3.1.1 e do fluxo de rollout para staging/produção.
            </p>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {summary.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Icon className="h-4 w-4 text-quantum-cyan" />
                      <span className="text-[11px] uppercase tracking-[0.2em]">{item.label}</span>
                    </div>
                    <p className="mt-3 text-lg font-bold text-white">{item.value}</p>
                  </div>
                );
              })}
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex flex-wrap gap-2">
                <StatusBadge ok={runtime.usingDedicatedKey} label={runtime.usingDedicatedKey ? "OpenAI dedicada ativa" : "OpenAI dedicada pendente"} />
                <Badge className="border border-white/10 bg-white/5 text-slate-200">{runtime.apiStandard}</Badge>
              </div>
              <p className="mt-3 text-sm text-slate-300">
                Ordem de fallback: <span className="font-semibold text-white">{runtime.fallbackOrder.join(" → ")}</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">Checklist executivo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {readiness.recommendedActions.map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-300">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-white/10 bg-white/5 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <KeyRound className="h-5 w-5 text-amber-300" />
              Secrets e readiness operacional
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {readiness.secrets.map((secret) => (
              <div key={secret.name} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-mono text-xs text-white">{secret.name}</p>
                  <StatusBadge ok={secret.configured} label={secret.configured ? "configurada" : "pendente"} />
                  {secret.required ? (
                    <Badge className="border border-rose-300/30 bg-rose-300/10 text-rose-200">obrigatória</Badge>
                  ) : (
                    <Badge className="border border-white/10 bg-white/5 text-slate-300">opcional</Badge>
                  )}
                </div>
                <p className="mt-2 text-sm text-slate-300">{secret.purpose}</p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-slate-500">escopo: {secret.scope}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">Endpoints e smoke targets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Gateway discovery", url: readiness.endpoints.discoveryUrl },
              { label: "OpenAPI JSON", url: readiness.endpoints.specUrl },
              { label: "Runtime endpoint", url: readiness.endpoints.runtimeUrl },
              { label: "Onboarding blueprint", url: readiness.endpoints.onboardingUrl },
              { label: "Health", url: readiness.endpoints.healthUrl },
            ].map((endpoint) => (
              <div key={endpoint.label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">{endpoint.label}</p>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                  <p className="break-all font-mono text-xs text-slate-200">{endpoint.url}</p>
                  <a href={endpoint.url} target="_blank" rel="noreferrer">
                    <Button variant="outline" className="border-white/10 bg-white/5 text-white">
                      Abrir
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </a>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-white/10 bg-white/5 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Workflow className="h-5 w-5 text-quantum-lime" />
              Etapas de rollout
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {readiness.rolloutStages.map((stage, index) => (
              <div key={stage} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-300">
                <span className="mr-2 font-bold text-white">{index + 1}.</span>
                {stage}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              {runtime.ready ? <CheckCircle2 className="h-5 w-5 text-emerald-300" /> : <TriangleAlert className="h-5 w-5 text-amber-300" />}
              Salvaguardas da arquitetura
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {runtime.safeguards.map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-300">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
