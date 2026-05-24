/**
 * Domains barrel — Fase Beta continuation.
 *
 * Exposição centralizada da camada de domínios para futuros refactors do
 * `appRouter`. Cada subdiretório possui `router.ts` (anti-corruption layer)
 * e `events.ts` (publishers padronizados).
 */
export * as affiliate from "./affiliate";
export * as commissions from "./commissions";
export * as marketplace from "./marketplace";
export * as agentRuntime from "./agent-runtime";
export * as billing from "./billing";
export * as cron from "./cron";
export * as xp from "./xp";
export * as auth from "./auth";
export * as shared from "./shared";
