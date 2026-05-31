import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import type { AnyRouter } from "@trpc/server";

const trpcReact = createTRPCReact<AnyRouter>();
export const trpc: typeof trpcReact & any = trpcReact as typeof trpcReact & any;

function getTrpcUrl() {
  if (import.meta.env.VITE_TRPC_URL) return import.meta.env.VITE_TRPC_URL;
  if (typeof window !== "undefined") {
    const protocol = window.location.protocol;
    const host = window.location.host;
    return `${protocol}//${host}/api/trpc`;
  }
  return "/api/trpc";
}

function getAccessToken(): string | null {
  try {
    return localStorage.getItem("mmn_access_token");
  } catch {
    return null;
  }
}

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: getTrpcUrl(),
      headers() {
        const token = getAccessToken();
        return token ? { Authorization: `Bearer ${token}` } : {};
      },
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: "include",
        });
      },
    }),
  ],
});
