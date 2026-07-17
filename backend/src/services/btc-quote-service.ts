/**
 * BTC ⇄ BRL Quote Service — Correção #4 (/payments BeYour Banker)
 * -----------------------------------------------------------------------------
 * Conversão BRL × BTC visível em /payments com selo "Custódia Binance".
 * Estratégia: Binance API como primária, CoinGecko como fallback. Cache em
 * memória de 30s (ideal mover para Redis quando ioredis estiver injetado).
 *
 * Compliance LGPD/CVM: a conversão é apenas indicativa; a custódia efetiva
 * ocorre na Binance via integração futura. Nenhum dado pessoal é enviado.
 */

interface QuoteCacheEntry {
  brlPerBtc: number;
  source: "binance" | "coingecko";
  fetchedAt: number;
}

const CACHE_TTL_MS = 30_000;
let cache: QuoteCacheEntry | null = null;


// D18-mercadobitcoin
async function fetchFromMercadoBitcoin(): Promise<number | null> {
  try {
    const res = await fetch("https://api.mercadobitcoin.net/api/v4/tickers?symbols=BTC-BRL", {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Array<{ last?: string }>;
    const price = Number(data?.[0]?.last);
    return Number.isFinite(price) && price > 0 ? price : null;
  } catch { return null; }
}

async function fetchFromFoxbit(): Promise<number | null> {
  try {
    const res = await fetch("https://api.foxbit.com.br/rest/v3/markets/btcbrl/ticker/24hr", {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    const j = await res.json();
    const price = Number(j?.data?.[0]?.last_trade?.price);
    return Number.isFinite(price) && price > 0 ? price : null;
  } catch { return null; }
}

async function fetchFromBinance(): Promise<number | null> {
  try {
    const res = await fetch("https://api.binance.com/api/v3/ticker/price?symbol=BTCBRL", {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { price?: string };
    const price = Number(data.price);
    return Number.isFinite(price) && price > 0 ? price : null;
  } catch {
    return null;
  }
}

async function fetchFromCoinGecko(): Promise<number | null> {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=brl",
      { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(3000) },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { bitcoin?: { brl?: number } };
    const price = data?.bitcoin?.brl;
    return typeof price === "number" && price > 0 ? price : null;
  } catch {
    return null;
  }
}

export interface BtcBrlQuote {
  brlPerBtc: number;
  btcPerBrl: number;
  source: "binance" | "coingecko" | "cache";
  custodian: "Binance";
  fetchedAt: string;
  ttlSeconds: number;
}

export async function getBtcBrlQuote(): Promise<BtcBrlQuote> {
  const now = Date.now();

  if (cache && now - cache.fetchedAt < CACHE_TTL_MS) {
    return {
      brlPerBtc: cache.brlPerBtc,
      btcPerBrl: 1 / cache.brlPerBtc,
      source: "cache",
      custodian: "Binance",
      fetchedAt: new Date(cache.fetchedAt).toISOString(),
      ttlSeconds: Math.max(0, Math.floor((CACHE_TTL_MS - (now - cache.fetchedAt)) / 1000)),
    };
  }

  // D18-orchestrator: Mercado Bitcoin (BR) → Foxbit → Binance → CoinGecko
  const mb = await fetchFromMercadoBitcoin();
  if (mb) {
    cache = { brlPerBtc: mb, source: "mercadobitcoin" as any, fetchedAt: now };
    return { brlPerBtc: mb, btcPerBrl: 1/mb, source: "mercadobitcoin" as any, custodian: "Mercado Bitcoin" as any, fetchedAt: new Date(now).toISOString(), ttlSeconds: 30 };
  }

  const fox = await fetchFromFoxbit();
  if (fox) {
    cache = { brlPerBtc: fox, source: "foxbit" as any, fetchedAt: now };
    return { brlPerBtc: fox, btcPerBrl: 1/fox, source: "foxbit" as any, custodian: "Foxbit" as any, fetchedAt: new Date(now).toISOString(), ttlSeconds: 30 };
  }

  const binance = await fetchFromBinance();
  if (binance) {
    cache = { brlPerBtc: binance, source: "binance", fetchedAt: now };
    return {
      brlPerBtc: binance,
      btcPerBrl: 1 / binance,
      source: "binance",
      custodian: "Binance",
      fetchedAt: new Date(now).toISOString(),
      ttlSeconds: 30,
    };
  }

  const coingecko = await fetchFromCoinGecko();
  if (coingecko) {
    cache = { brlPerBtc: coingecko, source: "coingecko", fetchedAt: now };
    return {
      brlPerBtc: coingecko,
      btcPerBrl: 1 / coingecko,
      source: "coingecko",
      custodian: "Binance",
      fetchedAt: new Date(now).toISOString(),
      ttlSeconds: 30,
    };
  }

  throw new Error("BTC/BRL quote indisponível: Binance e CoinGecko fora do ar.");
}
