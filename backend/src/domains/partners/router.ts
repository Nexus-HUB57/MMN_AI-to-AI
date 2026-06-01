/**
 * Partners domain router — anti-corruption layer.
 *
 * O router tRPC real vive em `routers/partnersRouter.ts` e usa
 * Drizzle para I/O. Este módulo apenas re-exporta para preservar
 * a fachada do domínio Partners dentro do barrel `domains/`.
 *
 * Toda lógica de negócio reside em `./service` (GrowthAlgorithmEngine,
 * casos de uso de partner/partnership/volume). Futuramente o router
 * legado pode ser migrado para consumir `service` diretamente.
 */

export { partnersRouter } from "../../routers/partnersRouter";
