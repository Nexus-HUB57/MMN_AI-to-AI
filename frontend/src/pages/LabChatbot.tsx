import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useMarketplaceProfile } from "@/hooks/useMarketplaceProfile";
import { getAcademiaTier } from "@/lib/nexus-academia";
import {
  LAB_NEXUS_FALLBACK_PROVIDERS,
  LAB_NEXUS_PROMPT_TEMPLATES,
  type LabNexusChatResponse,
  type LabNexusMessage,
  type LabNexusProviderId,
  type LabNexusProviderSummary,
  type LabNexusUsageSummary,
} from "@/lib/lab-nexus-types";
import {
  ArrowRight,
  Bot,
  BookOpen,
  ExternalLink,
  HardDriveDownload,
  Lock,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  Wand2,
  Zap,
} from "lucide-react";

const REPO_BASE = "https://github.com/Nexus-HUB57/MMN_AI-to-AI/blob/main";
const SYSTEM_PROMPT_DEFAULT =
  "Você é o Chat Bot Lab Nexus, um agregador multi-IA do ecossistema Nexus Affil'IA'te. Responda em português do Brasil, seja conciso e cite fontes quando aplicável.";
const CHATBOT_STORAGE_PREFIX = "lab-nexus-chatbot-workspace-v1";

const INSPIRATION_HUBS = [
  { label: "Adapta", url: "https://adapta.org/" },
  { label: "MyHub IA", url: "https://lp.myhub.ia.br/" },
];

const REFERENCE_REPOS = [
  { slug: "chopratejas/headroom", url: "https://github.com/chopratejas/headroom", role: "Compressão de contexto e memória cross-agent" },
  { slug: "pewdiepie-archdaemon/odysseus", url: "https://github.com/pewdiepie-archdaemon/odysseus", role: "Workspace self-hosted e agente autônomo" },
  { slug: "anthropics/claude-code", url: "https://github.com/anthropics/claude-code", role: "SDK/CLI oficial Claude" },
  { slug: "ComposioHQ/awesome-claude-skills", url: "https://github.com/ComposioHQ/awesome-claude-skills", role: "Catálogo de skills" },
  { slug: "langchain-ai/langchain", url: "https://github.com/langchain-ai/langchain", role: "Agents, chains e memória" },
  { slug: "TheoLeeCJ/llama4-computer-use", url: "https://github.com/TheoLeeCJ/llama4-computer-use", role: "Computer Use" },
  { slug: "open-webui/open-webui", url: "https://github.com/open-webui/open-webui", role: "UI multi-modelo self-hosted" },
  { slug: "google-gemini/gemini-cli", url: "https://github.com/google-gemini/gemini-cli", role: "CLI oficial Gemini" },
  { slug: "PlexPt/awesome-chatgpt-prompts-zh", url: "https://github.com/PlexPt/awesome-chatgpt-prompts-zh", role: "Biblioteca de prompts" },
  { slug: "microsoft/JARVIS", url: "https://github.com/microsoft/JARVIS", role: "Router HuggingGPT" },
  { slug: "MiniMax-AI/MiniMax-01", url: "https://github.com/MiniMax-AI/MiniMax-01", role: "Pesos abertos MiniMax" },
  { slug: "hexdocom/lemonai", url: "https://github.com/hexdocom/lemonai", role: "Hub de agentes" },
  { slug: "affaan-m/ECC", url: "https://github.com/affaan-m/ECC", role: "Judge / controle experimental" },
];

interface PersistedWorkspace {
  providerId: LabNexusProviderId;
  model: string;
  messages: LabNexusMessage[];
  input: string;
  lastMeta: LabNexusChatResponse | null;
}

function buildDefaultMessages(): LabNexusMessage[] {
  return [{ role: "system", content: SYSTEM_PROMPT_DEFAULT }];
}

function readWorkspace(key: string): PersistedWorkspace | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersistedWorkspace>;
    const messages = Array.isArray(parsed.messages) && parsed.messages.length > 0
      ? parsed.messages.filter((message): message is LabNexusMessage => {
          return Boolean(message && typeof message.content === "string" && typeof message.role === "string");
        })
      : buildDefaultMessages();

    return {
      providerId: (parsed.providerId as LabNexusProviderId) ?? "openai",
      model: typeof parsed.model === "string" ? parsed.model : "",
      messages,
      input: typeof parsed.input === "string" ? parsed.input : "",
      lastMeta: parsed.lastMeta ? (parsed.lastMeta as LabNexusChatResponse) : null,
    };
  } catch {
    return null;
  }
}

function writeWorkspace(key: string, workspace: PersistedWorkspace) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(workspace));
}

function removeWorkspace(key: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(key);
}

export default function LabChatbot() {
  const { profile } = useMarketplaceProfile();
  const tier = getAcademiaTier(profile);
  const isLocked = tier.id === "iniciante";
  const hydratedWorkspaceRef = useRef<string | null>(null);
  const transcriptRef = useRef<HTMLDivElement | null>(null);

  const storageKey = useMemo(() => {
    const subject = profile.userId ?? profile.userEmail ?? "anon";
    return `${CHATBOT_STORAGE_PREFIX}:${subject}:${tier.id}`;
  }, [profile.userEmail, profile.userId, tier.id]);

  const providersQuery = trpc.labNexus.providers.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
  });
  const usageQuery = trpc.labNexus.usage.useQuery(
    isLocked ? undefined : { tier: tier.id },
    {
      enabled: !isLocked,
      staleTime: 1000 * 30,
      refetchOnWindowFocus: false,
    },
  );
  const chatMutation = trpc.labNexus.chat.useMutation();

  const providers = useMemo<LabNexusProviderSummary[]>(() => {
    const fromApi = providersQuery.data?.providers as LabNexusProviderSummary[] | undefined;
    if (fromApi && fromApi.length > 0) return fromApi;
    return LAB_NEXUS_FALLBACK_PROVIDERS;
  }, [providersQuery.data]);

  const [providerId, setProviderId] = useState<LabNexusProviderId>("openai");
  const [model, setModel] = useState<string>("");
  const [messages, setMessages] = useState<LabNexusMessage[]>(buildDefaultMessages);
  const [input, setInput] = useState("");
  const [lastMeta, setLastMeta] = useState<LabNexusChatResponse | null>(null);

  const selectedProvider = providers.find((provider) => provider.id === providerId) ?? providers[0];
  const usageSummary = usageQuery.data?.usage as LabNexusUsageSummary | undefined;
  const visibleMessages = useMemo(() => messages.filter((message) => message.role !== "system"), [messages]);

  useEffect(() => {
    const saved = readWorkspace(storageKey);
    hydratedWorkspaceRef.current = storageKey;

    if (saved) {
      setProviderId(saved.providerId);
      setModel(saved.model);
      setMessages(saved.messages.length > 0 ? saved.messages : buildDefaultMessages());
      setInput(saved.input);
      setLastMeta(saved.lastMeta);
      return;
    }

    setProviderId("openai");
    setModel("");
    setMessages(buildDefaultMessages());
    setInput("");
    setLastMeta(null);
  }, [storageKey]);

  useEffect(() => {
    if (hydratedWorkspaceRef.current !== storageKey) return;
    writeWorkspace(storageKey, {
      providerId,
      model,
      messages,
      input,
      lastMeta,
    });
  }, [storageKey, providerId, model, messages, input, lastMeta]);

  useEffect(() => {
    if (selectedProvider && (!model || !selectedProvider.availableModels.includes(model))) {
      setModel(selectedProvider.defaultModel);
    }
  }, [selectedProvider, model]);

  useEffect(() => {
    if (!transcriptRef.current) return;
    transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
  }, [messages, chatMutation.isPending]);

  function applyTemplate(promptText: string) {
    setInput(promptText);
  }

  async function handleSend() {
    if (isLocked) return;
    const trimmed = input.trim();
    if (!trimmed || chatMutation.isPending) return;

    const nextMessages: LabNexusMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");

    try {
      const response = (await chatMutation.mutateAsync({
        providerId,
        model: model || undefined,
        messages: nextMessages,
        tier: tier.id,
      })) as LabNexusChatResponse;

      setLastMeta(response);
      setMessages((current) => [...current, response.message]);
      void usageQuery.refetch();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao consultar o provedor de IA.";
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: `[Falha local] ${message}`,
        },
      ]);
      void usageQuery.refetch();
    }
  }

  function handleReset() {
    const fresh = buildDefaultMessages();
    setMessages(fresh);
    setInput("");
    setLastMeta(null);
    setProviderId("openai");
    setModel("");
    removeWorkspace(storageKey);
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-10">
        <section className="overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(0,229,255,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.18),transparent_30%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,1))] p-6 shadow-2xl shadow-black/30 md:p-8">
          <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr] xl:items-center">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.22em] text-slate-500">
                <Link href="/academia" className="hover:text-quantum-cyan">Nexus Academ'IA</Link>
                <span>/</span>
                <span className="text-slate-300">Lab Nexus</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">Lab Nexus · Chat Bot Multi-IA</Badge>
                <Badge className={`border ${tier.badgeTone}`}>{tier.label}</Badge>
                <Badge className="border border-white/10 bg-white/5 text-slate-200">APIs oficiais · OpenAI · Anthropic · Google · DeepSeek</Badge>
              </div>

              <h1 className="max-w-4xl text-4xl font-black tracking-tight text-white md:text-5xl">
                Hub agregador de <span className="text-quantum-cyan">Inteligência Artificial</span> dentro do Lab Nexus.
              </h1>
              <p className="max-w-3xl text-base leading-7 text-slate-300 md:text-lg">
                Módulo interno da <strong className="text-white">Nexus Academ'IA</strong>, publicado dentro da trilha <strong className="text-white">Lab Nexus</strong>. Inspirado em <a href={INSPIRATION_HUBS[0].url} target="_blank" rel="noreferrer" className="text-quantum-cyan hover:underline">Adapta</a> e <a href={INSPIRATION_HUBS[1].url} target="_blank" rel="noreferrer" className="text-quantum-cyan hover:underline">MyHub IA</a>. Painel único para alternar entre GPT, Claude, Gemini, DeepSeek e MiniMax, com histórico persistido, templates, quota diária e governança Nexus.
              </p>

              <div className="grid gap-3 sm:grid-cols-4">
                <div className="rounded-3xl border border-white/10 bg-black/25 p-4">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">provedores</p>
                  <p className="mt-2 text-2xl font-bold text-white">{providers.length}</p>
                  <p className="mt-1 text-xs text-slate-400">{providers.filter((provider) => provider.configured).length} ativo(s)</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-black/25 p-4">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">templates</p>
                  <p className="mt-2 text-2xl font-bold text-white">{LAB_NEXUS_PROMPT_TEMPLATES.length}</p>
                  <p className="mt-1 text-xs text-slate-400">prontos para reuso</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-black/25 p-4">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">acesso</p>
                  <p className="mt-2 text-2xl font-bold text-white capitalize">{tier.label}</p>
                  <p className="mt-1 text-xs text-slate-400">{isLocked ? "bloqueado" : "habilitado"}</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-black/25 p-4">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">quota restante</p>
                  <p className="mt-2 text-2xl font-bold text-white">{isLocked ? "—" : usageSummary?.requestsRemaining ?? "…"}</p>
                  <p className="mt-1 text-xs text-slate-400">{isLocked ? "upgrade necessário" : `de ${usageSummary?.requestLimit ?? 0}/dia`}</p>
                </div>
              </div>
            </div>

            <Card className="border-white/10 bg-white/6 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-xl text-white">Engenharia em três frentes</CardTitle>
                <CardDescription className="text-slate-300">
                  Mesma arquitetura dos grandes hubs agregadores, conectada às APIs oficiais.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                  <div className="mb-1 flex items-center gap-2 text-white"><Zap className="h-4 w-4 text-quantum-cyan" /> Integração de APIs</div>
                  <p>Cliente HTTP no backend encaminha os prompts ao servidor de cada IA e devolve a resposta para a UI.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                  <div className="mb-1 flex items-center gap-2 text-white"><Bot className="h-4 w-4 text-quantum-lime" /> Interface unificada</div>
                  <p>Mesma tela alterna GPT, Claude, Gemini e DeepSeek sem perder o histórico do workspace.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                  <div className="mb-1 flex items-center gap-2 text-white"><Wand2 className="h-4 w-4 text-amber-300" /> Multimodal e agentes</div>
                  <p>Templates de prompt, assistentes automatizados e hooks para imagens/áudio em cima da governança PD/SCC.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {isLocked && (
          <div className="rounded-2xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
            O Chat Bot Lab Nexus é liberado a partir do tier <strong className="text-white">Operador</strong> (1º ciclo ativo no PD/SCC). Ative seu Pack A² para desbloquear.
          </div>
        )}

        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardHeader className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle className="text-white">Conversa</CardTitle>
                <Button variant="outline" onClick={handleReset} className="border-white/10 bg-white/5 text-white">
                  <RefreshCw className="mr-2 h-4 w-4" /> limpar
                </Button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Provedor</p>
                  <select
                    value={providerId}
                    onChange={(event) => setProviderId(event.target.value as LabNexusProviderId)}
                    className="mt-2 h-11 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white"
                    disabled={isLocked}
                  >
                    {providers.map((provider) => (
                      <option key={provider.id} value={provider.id} className="bg-slate-950 text-white">
                        {provider.label} {provider.configured ? "· live" : "· demo"}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Modelo</p>
                  <select
                    value={model}
                    onChange={(event) => setModel(event.target.value)}
                    className="mt-2 h-11 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white"
                    disabled={isLocked || !selectedProvider}
                  >
                    {selectedProvider?.availableModels.map((entry) => (
                      <option key={entry} value={entry} className="bg-slate-950 text-white">
                        {entry}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                ref={transcriptRef}
                className="max-h-[420px] min-h-[280px] space-y-3 overflow-y-auto rounded-3xl border border-white/10 bg-black/25 p-4"
              >
                {visibleMessages.length === 0 ? (
                  <p className="text-sm text-slate-400">
                    Faça uma pergunta ou aplique um template à direita. Quando nenhuma chave de API estiver configurada no servidor, o Chat Bot responde em modo demo seguro.
                  </p>
                ) : (
                  visibleMessages.map((message, index) => (
                    <div
                      key={index}
                      className={`rounded-2xl border p-3 text-sm leading-6 ${
                        message.role === "user"
                          ? "border-quantum-cyan/30 bg-quantum-cyan/10 text-white"
                          : "border-white/10 bg-white/5 text-slate-200"
                      }`}
                    >
                      <p className="mb-1 text-[10px] uppercase tracking-[0.24em] text-slate-500">
                        {message.role === "user" ? "Você" : selectedProvider?.label ?? "Assistente"}
                      </p>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  ))
                )}
                {chatMutation.isPending && (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300">
                    Consultando {selectedProvider?.label}…
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                      event.preventDefault();
                      void handleSend();
                    }
                  }}
                  rows={4}
                  placeholder={isLocked ? "Ative seu Pack A² para liberar o chat" : "Digite sua mensagem. Cmd/Ctrl+Enter envia."}
                  className="w-full rounded-3xl border border-white/10 bg-black/25 p-4 text-sm text-white placeholder:text-slate-500"
                  disabled={isLocked}
                />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-slate-400">
                    {lastMeta ? (
                      <span>
                        Última resposta: {lastMeta.mode === "live" ? "live" : "demo"} · {lastMeta.latencyMs} ms
                        {lastMeta.tokensUsed ? ` · ${lastMeta.tokensUsed} tokens` : ""}
                      </span>
                    ) : (
                      <span>Workspace persistido localmente por afiliado e tier.</span>
                    )}
                  </div>
                  <Button onClick={() => void handleSend()} disabled={isLocked || chatMutation.isPending} className="gradient-btn">
                    {chatMutation.isPending ? "enviando…" : "enviar"}
                    {!chatMutation.isPending && <Send className="ml-2 h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-white/10 bg-white/5 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white">Templates de prompt</CardTitle>
                <CardDescription className="text-slate-400">
                  Acelere a curva de aprendizado com prompts já validados pelo runtime Nexus.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {LAB_NEXUS_PROMPT_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => applyTemplate(template.prompt)}
                    disabled={isLocked}
                    className="w-full rounded-2xl border border-white/10 bg-black/20 p-3 text-left transition hover:border-white/20 hover:bg-white/5 disabled:opacity-50"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-white">{template.title}</p>
                      <Badge className="border border-white/10 bg-white/5 text-slate-300">{template.category}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">{template.description}</p>
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-white/5 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white">Uso do dia e segurança</CardTitle>
                <CardDescription className="text-slate-400">
                  Quota operacional do seu tier e proteção da API REST externa.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                  <div className="mb-1 flex items-center gap-2 text-white"><ShieldCheck className="h-4 w-4 text-quantum-lime" /> Quota diária</div>
                  {isLocked ? (
                    <p>Sem quota disponível enquanto o chat estiver bloqueado.</p>
                  ) : usageSummary ? (
                    <div className="space-y-1 text-xs text-slate-300">
                      <p>Usado hoje: <strong className="text-white">{usageSummary.requestsToday}</strong> / {usageSummary.requestLimit}</p>
                      <p>Restante: <strong className="text-white">{usageSummary.requestsRemaining}</strong></p>
                      <p>Input estimado: {usageSummary.estimatedInputTokens} tokens · Saída: {usageSummary.tokensOut} tokens</p>
                      <p>Último uso: {usageSummary.lastUsedAt ? new Date(usageSummary.lastUsedAt).toLocaleString("pt-BR") : "ainda sem uso"}</p>
                    </div>
                  ) : (
                    <p>Carregando telemetria do backend…</p>
                  )}
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                  <div className="mb-1 flex items-center gap-2 text-white"><Lock className="h-4 w-4 text-amber-300" /> REST protegida</div>
                  <p>Integrações externas usam shared key no backend para o endpoint REST de chat. O frontend continua via sessão protegida em tRPC.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                  <div className="mb-1 flex items-center gap-2 text-white"><HardDriveDownload className="h-4 w-4 text-quantum-cyan" /> Workspace persistido</div>
                  <p>Histórico, modelo e último metadata ficam salvos no navegador por afiliado e tier para retomada rápida da conversa.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-white/5 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white">Provedores conectados</CardTitle>
                <CardDescription className="text-slate-400">
                  Status atual das chaves de API no servidor.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {providers.map((provider) => (
                  <div key={provider.id} className="rounded-2xl border border-white/10 bg-black/20 p-3 text-sm text-slate-300">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-white">{provider.label}</p>
                      <Badge
                        className={
                          provider.configured
                            ? "border border-quantum-lime/30 bg-quantum-lime/10 text-quantum-lime"
                            : "border border-amber-400/30 bg-amber-400/10 text-amber-200"
                        }
                      >
                        {provider.configured ? "live" : "demo"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">{provider.notes}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white">Repositórios de referência</CardTitle>
              <CardDescription className="text-slate-400">
                Curadoria que sustenta a engenharia do Chat Bot Lab Nexus.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 md:grid-cols-2">
              {REFERENCE_REPOS.map((repo) => (
                <a
                  key={repo.slug}
                  href={repo.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl border border-white/10 bg-black/20 p-3 transition hover:border-white/20 hover:bg-white/5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-white">{repo.slug}</p>
                    <ExternalLink className="h-4 w-4 text-quantum-cyan" />
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{repo.role}</p>
                </a>
              ))}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white">Próximos passos sugeridos</CardTitle>
              <CardDescription className="text-slate-400">
                Use o Chat Bot integrado ao restante do Lab Nexus.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <div className="flex items-center gap-2 text-white"><Sparkles className="h-4 w-4 text-quantum-cyan" /> Aplicar template</div>
                <p className="mt-1">Escolha um prompt validado, ajuste as variáveis entre chaves duplas e envie.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <div className="flex items-center gap-2 text-white"><BookOpen className="h-4 w-4 text-quantum-lime" /> Trilha sincronizada</div>
                <p className="mt-1">A camada de skill do agente reflete seu tier educacional no <Link href="/academia" className="text-quantum-cyan hover:underline">Painel Academ'IA</Link>.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <div className="flex items-center gap-2 text-white"><Lock className="h-4 w-4 text-amber-300" /> Governança</div>
                <p className="mt-1">Chaves de API ficam apenas no servidor. Cada chamada é registrada com afiliado, tier, tokens e latência.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a href={`${REPO_BASE}/AcademIA/Lab-Nexus/README-CHATBOT.md`} target="_blank" rel="noreferrer">
                  <Button variant="outline" className="border-white/10 bg-white/5 text-white">Ler doc do hub <ExternalLink className="ml-2 h-4 w-4" /></Button>
                </a>
                <a href={`${REPO_BASE}/AcademIA/Lab-Nexus/QA-ACCEPTANCE-MATRIX.md`} target="_blank" rel="noreferrer">
                  <Button variant="outline" className="border-white/10 bg-white/5 text-white">Matriz de aceite <ExternalLink className="ml-2 h-4 w-4" /></Button>
                </a>
                <Link href="/academia">
                  <Button className="gradient-btn">Voltar ao Academ'IA <ArrowRight className="ml-2 h-4 w-4" /></Button>
                </Link>
                <Link href="/academia/lab-nexus/chatbot">
                  <Button variant="outline" className="border-quantum-cyan/30 bg-quantum-cyan/10 text-white hover:bg-quantum-cyan/20">URL canônica do Lab Nexus</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </DashboardLayout>
  );
}
