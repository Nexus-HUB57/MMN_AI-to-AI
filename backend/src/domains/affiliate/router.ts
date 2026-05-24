/**
 * Affiliate domain router — anti-corruption layer.
 *
 * Reexporta o router legado de MMN/network para que o `appRouter` possa migrar
 * gradualmente para imports baseados em domínios.
 */
export { mmnRouter as affiliateRouter } from "../../routers/mmnRouter";
export { networkRouter as affiliateNetworkRouter } from "../../routers/networkRouter";
