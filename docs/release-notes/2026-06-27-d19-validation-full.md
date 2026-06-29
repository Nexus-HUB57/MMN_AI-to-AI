# D19 — Validação Funcional Completa + Hotfix Runtime

**Data:** 2026-06-27
**Tag:** v1.3.9 (consolida v1.3.8 hotfix + validação D11→D18 end-to-end)
**Commit base:** v1.3.7 (D18 — Mercado Bitcoin pivot + BullMQ + cluster + Sentry)

## 1. Hotfix de runtime
Após sincronização de `/var/www/oneverso/current` com `main`, o bundle `backend/dist/index.js` exigiu duas dependências de runtime ausentes que foram restauradas:
- `nodemailer@^6.10.1`
- `@sentry/node@^8.55.2`

Backend rebuildado, `pm2 restart mmn-api` aplicado, cluster online (2 instâncias).

## 2. Smoke público (HTTP)
| Rota | Status |
|------|--------|
| `/api/health` | **200** |
| `/dashboard` | **200** |
| `/marketplaces` | **200** |
| `/payments` | **200** |
| `/agents/sync` | **200** |
| `/pix/checkout` | **200** |
| `/pix/history` | **200** |

## 3. tRPC — protegido vs público
| Endpoint | Esperado | Real |
|---|---|---|
| `pix.listHistory` | 401 (auth) | **401 ✅** |
| `pix.getPaymentStatus` | 401 (auth) | **401 ✅** |
| `dashboardStatus.getStatus` | 401 (auth) | **401 ✅** |
| `banking.getBtcBrlQuote` | 200 (público) | **200 ✅** |
| `marketplaceNexus.listEbooks` | 200 (público) | **200 ✅** |

## 4. BRL ↔ BTC (D18 — pivot Mercado Bitcoin)
Cotação real obtida em produção:
```json
{
  "brlPerBtc": 318183,
  "btcPerBrl": 0.0000031428454694311134,
  "source": "mercadobitcoin",
  "custodian": "Mercado Bitcoin",
  "fetchedAt": "2026-06-27T16:37:16.817Z",
  "ttlSeconds": 30
}
```
Orquestrador: **Mercado Bitcoin → Foxbit → Binance → CoinGecko** (Binance bloqueado geo-BR; MB primário).

## 5. Métricas reais do banco (Postgres)
- `affiliate_balances`: 303 rows | available R$ 2.788,07 | earned R$ 2.838,07 | withdrawn R$ 50,00
- `commissions`: **193 approved**
- `affiliate_xp`: **303 afiliados | 2.599.000 XP total**
- `marketplace_orders`: **504 paid / 1 pending**
- `btc_custody_addresses`: **1 endereço ativo**
- `btc_deposits`: **1 confirmado (R$ 100, 0.00033333 BTC), 1 pending (R$ 50)**
- Top 10 afiliados nivelados em **45.200 XP / nível 10**

## 6. Infraestrutura
- **PM2:** 7 processos online (mmn-api ×2 cluster + 4 workers + oauth-callback)
- **Redis:** PONG, BullMQ `commission_processing_queue` = **72 chaves ativas**
- **Sentry:** `@sentry/node` carregado em runtime ✅
- **Nodemailer:** carregado em runtime ✅
- **Nginx:** worker_rlimit_nofile 65535 / worker_connections 8192 (D17 tune mantido)

## 7. Performance amostral
| Endpoint | 200 reqs | p95 estimado | RPS observado |
|---|---|---|---|
| `marketplaceNexus.listEbooks` (cache Redis D17) | 200/200 OK | ~39ms | 25,6 req/s (single client) |
| `banking.getBtcBrlQuote` (cache 30s) | 200/200 OK | ~37ms | 26,7 req/s (single client) |

Sob teste anterior k6 com 5.5k VUs: **2.316 req/s, failure 0,06%, dashboard p95 202ms** (D17).

## 8. Status global
Pipeline D11 → D18 validado em produção real, com hotfix D19 sobre baseline limpa.
Plataforma estável, todos os fluxos auditados (Dashboard, Marketplace, Payments, Agents Sync, PIX, BRL↔BTC, XP, capas, títulos).
