/**
 * @deprecated Este arquivo era uma duplicação de `backend/src/routers/mmnRouter.ts`.
 * A definição canônica do router MMN agora vive em `../routers/mmnRouter`.
 *
 * Este módulo é mantido APENAS como shim de compatibilidade para imports legados
 * (ex.: `import { mmnRouter } from "../services/mmn"`) e deve ser removido em
 * uma futura major version. Novos imports devem usar:
 *
 *   import { mmnRouter } from "../routers/mmnRouter";
 */
export { mmnRouter } from "../routers/mmnRouter";
