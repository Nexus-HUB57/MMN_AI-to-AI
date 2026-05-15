import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";

export type AppRouter = any;

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: import.meta.env.VITE_TRPC_URL || "http://localhost:3000/trpc",
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: "include",
        });
      },
    }),
  ],
});
