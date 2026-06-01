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
    const parsed = JSON.parse(raw) as { id?: string | number; role?: string };
    const role = parsed.role === "admin" ? "admin" : "user";
    const numericId = typeof parsed.id === "number"
      ? parsed.id
      : typeof parsed.id === "string" && /^\d+$/.test(parsed.id)
        ? Number(parsed.id)
        : role === "admin"
          ? 1
          : 2;

    return {
      "x-user-id": String(numericId),
      "x-user-role": role,
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
