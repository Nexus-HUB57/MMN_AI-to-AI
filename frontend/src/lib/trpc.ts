import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import type { AnyRouter } from "@trpc/server";

/**
 * O frontend permanece apontando para o contrato HTTP do backend,
 * mas evita importar diretamente os tipos do workspace backend durante o typecheck.
 * Isso estabiliza a validação do monorepo até a extração de um pacote compartilhado de tipos.
 */
const trpcReact = createTRPCReact<AnyRouter>();
export const trpc: typeof trpcReact & any = trpcReact as typeof trpcReact & any;
export const useTRPC = () => trpc;

const AUTH_STORAGE_KEY = "mmn-ai-auth-session";

function getRuntimeHeaders() {
  if (typeof window === "undefined") return {} as Record<string, string>;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return {} as Record<string, string>;
    const parsed = JSON.parse(raw) as { id?: string | number; email?: string; role?: string };
    const role = parsed.role === "admin" ? "admin" : "user";

    // HOTFIX D18.6: prioridade estrita para resolver o user_id real do backend.
    // 1) Se localStorage tem "mmn-ai-resolved-user-id" (id do backend), usa.
    // 2) Se parsed.id é numérico (novos logins social já retornam int), usa.
    // 3) Senão, para admin usa 1; para user comum NÃO cai mais no fallback fantasma "2":
    //    envia string vazia (backend rejeita com 401 e frontend força re-login/resolução).
    const resolvedFromCache = window.localStorage.getItem("mmn-ai-resolved-user-id");
    let numericId: number | null = null;

    if (resolvedFromCache && /^\d+$/.test(resolvedFromCache)) {
      numericId = Number(resolvedFromCache);
    } else if (typeof parsed.id === "number") {
      numericId = parsed.id;
    } else if (typeof parsed.id === "string" && /^\d+$/.test(parsed.id)) {
      numericId = Number(parsed.id);
    } else if (role === "admin") {
      numericId = 1;
    }

    if (numericId === null) {
      // Dispara resolução assíncrona por email (não bloqueia esta chamada).
      if (parsed.email) {
        try {
          const email = String(parsed.email).toLowerCase();
          fetch(`/api/auth/resolve-user-id?email=${encodeURIComponent(email)}`)
            .then((r) => r.json())
            .then((j) => {
              if (j && typeof j.id === "number") {
                window.localStorage.setItem("mmn-ai-resolved-user-id", String(j.id));
              }
            })
            .catch(() => undefined);
        } catch {}
      }
      // Sem numericId, retorna sem headers (auth vai negar corretamente com 401)
      return { "x-user-role": role, "x-user-email": String(parsed.email || "").toLowerCase() };
    }

    return {
      "x-user-id": String(numericId),
      "x-user-role": role,
      "x-user-email": String(parsed.email || "").toLowerCase(),
    };
  } catch {
    return {} as Record<string, string>;
  }
}

function getTrpcUrl() {
  if (import.meta.env.VITE_TRPC_URL) return import.meta.env.VITE_TRPC_URL;
  if (typeof window !== "undefined") {
    const protocol = window.location.protocol;
    const host = window.location.host;
    return `${protocol}//${host}/api/trpc`;
  }
  return "/api/trpc";
}

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: getTrpcUrl(),
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: "include",
          headers: {
            ...(options?.headers ?? {}),
            ...getRuntimeHeaders(),
          },
        });
      },
    }),
  ],
});
