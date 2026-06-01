/**
 * Partners domain — barrel exports.
 *
 * Camadas expostas:
 *  - `types`   : tipos públicos do domínio
 *  - `events`  : publishers de eventos (PARTNER_* / PARTNERSHIP_*)
 *  - `repository` : acesso a dados in-memory com seed determinístico
 *  - `service` : lógica de negócio + GrowthAlgorithmEngine
 *  - `router`  : anti-corruption layer (re-exporta o router tRPC)
 */

export * from "./types";
export * from "./events";
export * from "./repository";
export * from "./service";
export * from "./subscribers";
export * from "./router";
