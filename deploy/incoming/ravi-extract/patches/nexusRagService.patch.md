# Patch para `backend/src/services/nexusRagService.ts`

Aplique este patch sobre o `nexusRagService.ts` já existente (versão "in-memory only"). Ele transforma o service em um orquestrador híbrido in-memory / pgvector, usando o `nexusRagPgRepository.ts` agora incluído no bundle.

## Alterações principais

1. **Imports**: adicionar no topo, logo após `import crypto`:

```ts
import {
  pgIngest,
  pgQuery,
  pgStats,
  pgRecordRun,
  pgListRuns,
  isAvailable as pgIsAvailable,
} from "./nexusRagPgRepository";
```

2. **Resolução de modo**: substituir a função `mode()` antiga por:

```ts
function modeHint(): "pgvector" | "in-memory" {
  return process.env.DATABASE_URL && process.env.NEXUS_RAG_BACKEND !== "in-memory"
    ? "pgvector"
    : "in-memory";
}

async function activeMode(): Promise<"pgvector" | "in-memory"> {
  if (modeHint() === "pgvector" && (await pgIsAvailable())) return "pgvector";
  return "in-memory";
}

function mode(): "pgvector" | "in-memory" {
  return modeHint();
}
```

3. **`ingest()` → async com fallback**:
   - Se `activeMode() === "pgvector"`, chamar `pgIngest(...)` e gravar run via `pgRecordRun(...)`.
   - Em qualquer outro caso, manter o caminho in-memory.

4. **`query()` → async com fallback**:
   - Se `pgQuery(...)` retornar um array, usá-lo direto e retornar `{ matches, latencyMs, mode: "pgvector" }`.
   - Caso contrário, executar a varredura in-memory atual.

5. **`answer()` → ler `await query(input)`**: a função apenas consome `query` e mantém a composição com citações.

6. **`reindex()`**: adicionar `await pgRecordRun("reindex", String(scope), "ok", stats)` quando `activeMode === "pgvector"`.

7. **`listRuns()` → async**: prefere `pgListRuns(limit)` se disponível; senão devolve `memStore.runs`.

8. **`stats()` → async**:

```ts
export async function stats() {
  const useMode = await activeMode();
  let sources = memStore.sources.size;
  let chunks = Array.from(memStore.sources.values())
    .reduce((s, src) => s + src.chunks.length, 0);

  if (useMode === "pgvector") {
    const remote = await pgStats();
    if (remote) {
      sources = Number(remote.sources);
      chunks = Number(remote.chunks);
    }
  }

  return {
    backend: useMode,
    sources,
    chunks,
    runs: memStore.runs.length,
    embeddingModelVersion: EMBEDDING_MODEL_VERSION,
  };
}
```

9. **`nexusRagRouter.ts`**: a entrada `stats` precisa virar async-friendly:

```ts
stats: publicProcedure.query(async () => stats()),
```

> Após o patch, o backend continua dando build sem `DATABASE_URL` (fallback in-memory). Com `DATABASE_URL` + migration 0013 aplicada, automaticamente sobe para o modo pgvector sem mudança de código.
