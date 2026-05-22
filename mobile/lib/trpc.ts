import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import type { AnyRouter } from "@trpc/server";
import superjson from "superjson";
import { getApiBaseUrl } from "@/constants/oauth";
import * as Auth from "@/lib/_core/auth";

/**
 * tRPC React client for the mobile app.
 *
 * While the backend router types are not yet shared as a dedicated package,
 * we keep the runtime client fully configured and expose a relaxed typing
 * surface to unblock the Expo mobile scaffold.
 */
const trpcReact = createTRPCReact<AnyRouter>();
export const trpc: typeof trpcReact & any = trpcReact as typeof trpcReact & any;

export function createTRPCClient() {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: `${getApiBaseUrl()}/api/trpc`,
        transformer: superjson,
        async headers() {
          const token = await Auth.getSessionToken();
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
}
