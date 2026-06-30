# Patch para `frontend/src/pages/LabChatbot.tsx`

Este patch acrescenta o **toggle "Contexto Nexus"** e o pré-passe RAG ao Lab Chatbot. A interface continua limpa: o usuário vê só sua mensagem; o contexto canônico vai como `system` para o LLM.

## 1. Workspace persistido

```ts
interface PersistedWorkspace {
  providerId: LabNexusProviderId;
  model: string;
  messages: LabNexusMessage[];
  input: string;
  lastMeta: LabNexusChatResponse | null;
  useRagContext?: boolean;
}
```

Em `readWorkspace`, devolver `useRagContext: typeof parsed.useRagContext === "boolean" ? parsed.useRagContext : true`.

## 2. Estado novo

```ts
const ragAnswerQuery = (trpc as any).nexusRag?.answer;
const utils = (trpc as any).useUtils?.() ?? (trpc as any).useContext?.();
const [useRagContext, setUseRagContext] = useState<boolean>(true);
const [lastRagCitations, setLastRagCitations] = useState<
  Array<{ sourceKind: string; sourceRef: string; title: string; score: number }>
>([]);
```

E no `useEffect` de hidratação: `setUseRagContext(saved.useRagContext ?? true)`.

## 3. Pré-passe no `handleSend`

```ts
let ragContextBlock: string | null = null;
let ragCitations: Array<{ sourceKind: string; sourceRef: string; title: string; score: number }> = [];

if (useRagContext && utils?.client && ragAnswerQuery) {
  try {
    const ragResult: any = await utils.client.nexusRag.answer.query({
      question: trimmed,
      topK: 4,
      scope: ["academia", "lab", "lib", "ebook"],
    });
    if (ragResult?.citations?.length) {
      ragCitations = ragResult.citations;
      const lines = ragResult.citations.map(
        (c: any, i: number) =>
          `[${i + 1}] (${c.sourceKind}) ${c.title} — ref: ${c.sourceRef}`
      );
      ragContextBlock = [
        "Contexto canônico do Nexus Affil'IA'te recuperado pelo RAG:",
        ...lines,
        "",
        ragResult.answer ? `Resumo RAG:\n${ragResult.answer}` : "",
      ].filter(Boolean).join("\n");
    }
  } catch (err) {
    console.debug("[LabChatbot] RAG pre-pass indisponível:", err);
  }
}
setLastRagCitations(ragCitations);

const visibleNextMessages: LabNexusMessage[] = [
  ...messages,
  { role: "user", content: trimmed },
];

const outboundMessages: LabNexusMessage[] = ragContextBlock
  ? [
      ...messages,
      {
        role: "system",
        content:
          "Use o seguinte contexto canônico do Nexus para enriquecer a resposta quando for útil. " +
          "Não mencione metadados internos nem IDs técnicos ao usuário.\n\n" +
          ragContextBlock,
      },
      { role: "user", content: trimmed },
    ]
  : visibleNextMessages;

setMessages(visibleNextMessages);
setInput("");

const response = (await chatMutation.mutateAsync({
  providerId,
  model: model || undefined,
  messages: outboundMessages,
  tier: tier.id,
})) as LabNexusChatResponse;
```

## 4. UI · Toggle "Contexto Nexus"

Logo abaixo do par de `<select>` Provedor/Modelo:

```tsx
<div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
  <div>
    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Contexto Nexus</p>
    <p className="mt-1 text-xs text-slate-400">
      Enriquece o prompt com AcademIA, Lab, Lib e catálogo canônico via nexusRag.answer.
    </p>
  </div>
  <label className="flex items-center gap-3 text-sm text-white">
    <input
      type="checkbox"
      checked={useRagContext}
      onChange={(event) => setUseRagContext(event.target.checked)}
      disabled={isLocked}
      className="h-4 w-4 rounded border-white/20 bg-black/30"
    />
    {useRagContext ? "ativado" : "desativado"}
  </label>
</div>
```

## 5. UI · Bloco de citações aplicadas

Antes do `<textarea>`:

```tsx
{lastRagCitations.length > 0 && (
  <div className="rounded-2xl border border-quantum-cyan/20 bg-quantum-cyan/5 p-4 text-sm text-slate-200">
    <div className="mb-2 flex items-center justify-between gap-3">
      <p className="font-semibold text-white">Contexto Nexus aplicado</p>
      <Badge className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">
        {lastRagCitations.length} referência(s)
      </Badge>
    </div>
    <div className="space-y-2 text-xs text-slate-300">
      {lastRagCitations.map((citation, index) => (
        <div
          key={`${citation.sourceKind}-${citation.sourceRef}-${index}`}
          className="rounded-xl border border-white/10 bg-black/20 px-3 py-2"
        >
          <p className="font-medium text-white">[{index + 1}] {citation.title}</p>
          <p className="mt-1 text-slate-400">
            {citation.sourceKind} · {citation.sourceRef} · score {citation.score.toFixed(2)}
          </p>
        </div>
      ))}
    </div>
  </div>
)}
```

## 6. Reset

No `handleReset` adicionar:

```ts
setUseRagContext(true);
setLastRagCitations([]);
```

E no `writeWorkspace` correspondente, persistir `useRagContext`.
