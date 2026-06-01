/**
 * Subscriptions domain — barrel exports.
 *
 * Modelo de Assinatura Comercial do Nexus Affil'IA'te (v1.4.0).
 * Substitui o antigo sistema de XP/níveis pelos 3 packs comerciais:
 * Pack A², Pack AG, Pack AA.
 */

export * from "./types";
export * from "./catalog";
export * from "./repository";
export * from "./service";
export { subscriptionsRouter } from "./router";
